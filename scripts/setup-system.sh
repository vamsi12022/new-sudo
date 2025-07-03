#!/bin/bash

# Ubuntu Sudo Access Manager - System Setup Script
# This script sets up the necessary system components for the sudo access manager

set -e

echo "Setting up Ubuntu Sudo Access Manager..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script as root (use sudo)"
    exit 1
fi

# Create log directory and file
LOG_DIR="/var/log"
LOG_FILE="$LOG_DIR/sudo-access-manager.log"

echo "Creating log file..."
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"
chown root:root "$LOG_FILE"

# Create sudoers.d directory if it doesn't exist
SUDOERS_DIR="/etc/sudoers.d"
if [ ! -d "$SUDOERS_DIR" ]; then
    echo "Creating sudoers.d directory..."
    mkdir -p "$SUDOERS_DIR"
    chmod 750 "$SUDOERS_DIR"
fi

# Create a dedicated user for the sudo manager service (optional)
SERVICE_USER="sudo-manager"
if ! id "$SERVICE_USER" &>/dev/null; then
    echo "Creating service user: $SERVICE_USER"
    useradd -r -s /bin/false -d /var/lib/sudo-manager "$SERVICE_USER"
fi

# Set up systemd service file
SERVICE_FILE="/etc/systemd/system/sudo-access-manager.service"
cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=Ubuntu Sudo Access Manager API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sudo-access-manager
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Create application directory
APP_DIR="/opt/sudo-access-manager"
mkdir -p "$APP_DIR"

echo "System setup completed!"
echo ""
echo "Next steps:"
echo "1. Copy your application files to $APP_DIR"
echo "2. Install Node.js dependencies: cd $APP_DIR && npm install"
echo "3. Enable and start the service:"
echo "   systemctl enable sudo-access-manager"
echo "   systemctl start sudo-access-manager"
echo ""
echo "Security Notes:"
echo "- The service runs as root to manage sudo privileges"
echo "- Ensure proper firewall rules are in place"
echo "- Monitor the log file: $LOG_FILE"
echo "- Regularly review temporary sudoers files in $SUDOERS_DIR"