# Ubuntu Sudo Access Manager

A comprehensive web-based system for managing sudo access requests on Ubuntu machines with real-time system integration.

## Features

### Core Functionality
- **User Authentication**: Role-based access control (User/Admin)
- **Request Management**: Submit, review, approve/deny sudo access requests
- **System Integration**: Real-time Ubuntu system integration for actual sudo privilege management
- **Time-Limited Access**: Automatic expiration of sudo privileges
- **Audit Trail**: Comprehensive logging of all sudo activities
- **Real-Time Monitoring**: Live monitoring of active sudo sessions

### System Integration
- **Automatic Sudo Granting**: Direct integration with Ubuntu's sudoers system
- **Session Management**: Real-time tracking of active sudo sessions
- **Auto-Expiration**: Automatic revocation of expired sudo access
- **System User Detection**: Automatic discovery of system users
- **Activity Logging**: Detailed logging of all sudo-related activities

## Installation

### Prerequisites
- Ubuntu 18.04+ (tested on Ubuntu 20.04/22.04)
- Node.js 16+ and npm
- Root access for system integration

### System Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ubuntu-sudo-access-manager
   ```

2. **Run system setup script** (as root):
   ```bash
   sudo chmod +x scripts/setup-system.sh
   sudo ./scripts/setup-system.sh
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Build the frontend**:
   ```bash
   npm run build
   ```

### Development Setup

1. **Start the backend API**:
   ```bash
   npm run server
   ```

2. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001

### Production Deployment

1. **Copy files to production directory**:
   ```bash
   sudo cp -r . /opt/sudo-access-manager/
   cd /opt/sudo-access-manager
   sudo npm install --production
   ```

2. **Enable and start the systemd service**:
   ```bash
   sudo systemctl enable sudo-access-manager
   sudo systemctl start sudo-access-manager
   sudo systemctl status sudo-access-manager
   ```

3. **Set up a reverse proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Usage

### Default Credentials
- **Admin**: username: `admin`, password: `password`
- **User**: username: `john.doe`, password: `password`

### User Workflow
1. **Login** with your credentials
2. **Submit Request**: Provide justification and requested duration
3. **Track Status**: Monitor request status in real-time
4. **Receive Access**: Once approved, sudo access is automatically granted

### Admin Workflow
1. **Review Requests**: View pending sudo access requests
2. **System Monitoring**: Monitor active sudo sessions and system users
3. **Approve/Deny**: Make decisions with optional comments
4. **Audit Trail**: Review all sudo activities and logs

### System Integration Features

#### Automatic Sudo Management
- Creates temporary sudoers files in `/etc/sudoers.d/`
- Automatically removes expired access
- Real-time session monitoring

#### Security Features
- Time-limited access with automatic expiration
- Comprehensive audit logging
- System user validation
- Secure sudoers file management

#### Monitoring Dashboard
- Live view of system users and their sudo status
- Active session tracking with expiration times
- Activity logs with detailed information
- Manual revocation capabilities

## API Endpoints

### System Integration
- `GET /api/system/users` - Get all system users
- `POST /api/sudo/grant` - Grant sudo access
- `POST /api/sudo/revoke` - Revoke sudo access
- `GET /api/sudo/active` - Get active sessions
- `GET /api/sudo/logs` - Get activity logs
- `GET /api/health` - Health check

## Security Considerations

### System Security
- The API server runs as root to manage sudo privileges
- Temporary sudoers files are created with proper permissions (440)
- All activities are logged for audit purposes
- Automatic cleanup of expired sessions

### Network Security
- Use HTTPS in production
- Implement proper firewall rules
- Consider VPN access for sensitive environments
- Regular security updates

### Access Control
- Role-based authentication
- Request approval workflow
- Time-limited access grants
- Comprehensive audit trail

## File Structure

```
├── server/                 # Backend API server
│   └── index.js           # Main server file with Ubuntu integration
├── src/                   # Frontend React application
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service layer
│   └── types/            # TypeScript type definitions
├── scripts/              # Setup and utility scripts
│   └── setup-system.sh   # System setup script
└── README.md             # This file
```

## Logging

### Application Logs
- Location: `/var/log/sudo-access-manager.log`
- Format: JSON with timestamp, username, action, and details
- Automatic rotation recommended

### System Logs
- Monitor `/var/log/auth.log` for sudo usage
- Check systemd logs: `journalctl -u sudo-access-manager`

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**:
   - Ensure the service is running as root
   - Check sudoers.d directory permissions

2. **API Connection Issues**:
   - Verify the backend service is running
   - Check firewall settings
   - Confirm port 3001 is available

3. **Sudo Access Not Working**:
   - Check `/etc/sudoers.d/` for temporary files
   - Verify file permissions (should be 440)
   - Review system logs for errors

### Monitoring Commands

```bash
# Check service status
sudo systemctl status sudo-access-manager

# View logs
sudo journalctl -u sudo-access-manager -f

# Check active sudo sessions
sudo ls -la /etc/sudoers.d/temp_sudo_*

# Monitor application logs
sudo tail -f /var/log/sudo-access-manager.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially system integration)
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review system logs
3. Create an issue in the repository

## Disclaimer

This system manages sudo privileges on Ubuntu systems. Use with caution and ensure proper security measures are in place. Always test in a non-production environment first.