const API_BASE = 'http://localhost:3001/api';

export class SudoAPI {
  static async getSystemUsers(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/system/users`);
    if (!response.ok) throw new Error('Failed to fetch system users');
    return response.json();
  }

  static async grantSudoAccess(username: string, duration: number, requestId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/sudo/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, duration, requestId })
    });
    if (!response.ok) throw new Error('Failed to grant sudo access');
    return response.json();
  }

  static async revokeSudoAccess(username: string, reason?: string): Promise<any> {
    const response = await fetch(`${API_BASE}/sudo/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, reason })
    });
    if (!response.ok) throw new Error('Failed to revoke sudo access');
    return response.json();
  }

  static async getActiveSessions(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/sudo/active`);
    if (!response.ok) throw new Error('Failed to fetch active sessions');
    return response.json();
  }

  static async getSudoLogs(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/sudo/logs`);
    if (!response.ok) throw new Error('Failed to fetch sudo logs');
    return response.json();
  }

  static async checkHealth(): Promise<any> {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('API health check failed');
    return response.json();
  }
}