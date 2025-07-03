import React, { useState, useEffect } from 'react';
import { Server, Users, Activity, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { SudoAPI } from '../services/api';
import { SystemUser, SudoLog } from '../types';

export const SystemIntegration: React.FC = () => {
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [logs, setLogs] = useState<SudoLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'logs'>('users');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [users, sessions, logEntries] = await Promise.all([
        SudoAPI.getSystemUsers(),
        SudoAPI.getActiveSessions(),
        SudoAPI.getSudoLogs()
      ]);
      
      setSystemUsers(users);
      setActiveSessions(sessions);
      setLogs(logEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSudo = async (username: string) => {
    try {
      await SudoAPI.revokeSudoAccess(username, 'Manual revocation by admin');
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke sudo access');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading system data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <Server className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Integration</h2>
          <p className="text-sm text-gray-600">Real-time Ubuntu system monitoring</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">System Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-lg font-bold text-blue-900">{systemUsers.length}</p>
              <p className="text-sm text-blue-700">System Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-lg font-bold text-green-900">{activeSessions.length}</p>
              <p className="text-sm text-green-700">Active Sudo Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-lg font-bold text-amber-900">{logs.length}</p>
              <p className="text-sm text-amber-700">Recent Activities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'users', label: 'System Users', icon: Users },
            { id: 'sessions', label: 'Active Sessions', icon: Shield },
            { id: 'logs', label: 'Activity Logs', icon: Activity }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {systemUsers.map((user) => (
            <div key={user.username} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${user.hasActiveSudo ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Users className={`w-4 h-4 ${user.hasActiveSudo ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-600">Groups: {user.groups.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.hasActiveSudo ? (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      Active Sudo
                    </span>
                    <button
                      onClick={() => handleRevokeSudo(user.username)}
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3" />
                    No Access
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {activeSessions.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active sudo sessions</p>
            </div>
          ) : (
            activeSessions.map((session) => (
              <div key={session.username} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.username}</p>
                    <p className="text-sm text-gray-600">
                      Granted: {formatDate(session.granted)} • 
                      Expires: {formatDate(session.expiresAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSudo(session.username)}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Revoke Now
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs</p>
            </div>
          ) : (
            logs.slice().reverse().map((log, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  log.action === 'GRANT' ? 'bg-green-100' :
                  log.action === 'REVOKE' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    log.action === 'GRANT' ? 'bg-green-600' :
                    log.action === 'REVOKE' ? 'bg-red-600' : 'bg-amber-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {log.action} - {log.username}
                  </p>
                  <p className="text-xs text-gray-600">{log.details}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(log.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};