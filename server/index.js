import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Store for active sudo sessions
const activeSessions = new Map();
const requestsDB = new Map();

// Sudoers file management
const SUDOERS_DIR = '/etc/sudoers.d';
const TEMP_SUDO_PREFIX = 'temp_sudo_';

// System integration functions
class UbuntuSudoManager {
  static async checkUserExists(username) {
    try {
      await execAsync(`id ${username}`);
      return true;
    } catch {
      return false;
    }
  }

  static async grantSudoAccess(username, duration) {
    try {
      const sudoersFile = path.join(SUDOERS_DIR, `${TEMP_SUDO_PREFIX}${username}`);
      const sudoRule = `${username} ALL=(ALL) NOPASSWD:ALL`;
      
      // Create temporary sudoers file
      await fs.writeFile(sudoersFile, sudoRule);
      
      // Set proper permissions
      await execAsync(`chmod 440 ${sudoersFile}`);
      
      // Schedule removal
      const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
      activeSessions.set(username, {
        sudoersFile,
        expiresAt,
        granted: new Date()
      });

      console.log(`Sudo access granted to ${username} until ${expiresAt}`);
      return true;
    } catch (error) {
      console.error(`Failed to grant sudo access to ${username}:`, error);
      return false;
    }
  }

  static async revokeSudoAccess(username) {
    try {
      const session = activeSessions.get(username);
      if (session && session.sudoersFile) {
        await fs.unlink(session.sudoersFile);
        activeSessions.delete(username);
        console.log(`Sudo access revoked for ${username}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to revoke sudo access for ${username}:`, error);
      return false;
    }
  }

  static async getUserGroups(username) {
    try {
      const { stdout } = await execAsync(`groups ${username}`);
      return stdout.trim().split(' ').slice(2); // Remove "username :" part
    } catch {
      return [];
    }
  }

  static async getSystemUsers() {
    try {
      const { stdout } = await execAsync(`getent passwd | grep -E '/home|/Users' | cut -d: -f1`);
      return stdout.trim().split('\n').filter(user => user.length > 0);
    } catch {
      return [];
    }
  }

  static async logSudoActivity(username, action, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      username,
      action,
      details,
      ip: 'system'
    };
    
    try {
      const logFile = '/var/log/sudo-access-manager.log';
      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}

// Cleanup expired sessions every minute
cron.schedule('* * * * *', async () => {
  const now = new Date();
  for (const [username, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      await UbuntuSudoManager.revokeSudoAccess(username);
      await UbuntuSudoManager.logSudoActivity(username, 'AUTO_REVOKE', 'Session expired');
    }
  }
});

// API Routes
app.get('/api/system/users', async (req, res) => {
  try {
    const users = await UbuntuSudoManager.getSystemUsers();
    const usersWithDetails = await Promise.all(
      users.map(async (username) => {
        const groups = await UbuntuSudoManager.getUserGroups(username);
        const hasActiveSudo = activeSessions.has(username);
        return {
          username,
          groups,
          hasActiveSudo,
          session: activeSessions.get(username) || null
        };
      })
    );
    res.json(usersWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system users' });
  }
});

app.post('/api/sudo/grant', async (req, res) => {
  const { username, duration, requestId } = req.body;
  
  try {
    // Verify user exists
    const userExists = await UbuntuSudoManager.checkUserExists(username);
    if (!userExists) {
      return res.status(400).json({ error: 'User does not exist on system' });
    }

    // Grant sudo access
    const success = await UbuntuSudoManager.grantSudoAccess(username, duration);
    if (success) {
      await UbuntuSudoManager.logSudoActivity(username, 'GRANT', `Duration: ${duration}h, Request: ${requestId}`);
      res.json({ 
        success: true, 
        message: `Sudo access granted to ${username} for ${duration} hours`,
        expiresAt: activeSessions.get(username).expiresAt
      });
    } else {
      res.status(500).json({ error: 'Failed to grant sudo access' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sudo/revoke', async (req, res) => {
  const { username, reason } = req.body;
  
  try {
    const success = await UbuntuSudoManager.revokeSudoAccess(username);
    if (success) {
      await UbuntuSudoManager.logSudoActivity(username, 'REVOKE', reason || 'Manual revocation');
      res.json({ 
        success: true, 
        message: `Sudo access revoked for ${username}` 
      });
    } else {
      res.status(404).json({ error: 'No active sudo session found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sudo/active', (req, res) => {
  const sessions = Array.from(activeSessions.entries()).map(([username, session]) => ({
    username,
    ...session
  }));
  res.json(sessions);
});

app.get('/api/sudo/logs', async (req, res) => {
  try {
    const logFile = '/var/log/sudo-access-manager.log';
    const logs = await fs.readFile(logFile, 'utf8');
    const entries = logs.trim().split('\n')
      .filter(line => line.length > 0)
      .map(line => JSON.parse(line))
      .slice(-100); // Last 100 entries
    res.json(entries);
  } catch (error) {
    res.json([]); // Return empty array if log file doesn't exist
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeSessions: activeSessions.size
  });
});

app.listen(PORT, () => {
  console.log(`Ubuntu Sudo Access Manager API running on port ${PORT}`);
  console.log(`Active sessions will be monitored and auto-expired`);
});