import React from 'react';
import { Plus, History, AlertCircle } from 'lucide-react';
import { User, SudoRequest } from '../types';
import { RequestForm } from './RequestForm';
import { RequestCard } from './RequestCard';

interface UserDashboardProps {
  user: User;
  requests: SudoRequest[];
  onCreateRequest: (data: {
    justification: string;
    requestedDuration: number;
  }) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, 
  requests, 
  onCreateRequest 
}) => {
  const [activeTab, setActiveTab] = React.useState<'new' | 'history'>('new');
  
  const userRequests = requests.filter(req => req.userId === user.id);
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const approvedRequests = userRequests.filter(req => req.status === 'approved');
  const activeRequests = approvedRequests.filter(req => 
    req.expiresAt && new Date() < req.expiresAt
  );

  const handleCreateRequest = (data: {
    justification: string;
    requestedDuration: number;
  }) => {
    onCreateRequest(data);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.username}</h1>
        <p className="text-gray-600">Manage your sudo access requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeRequests.length}</p>
              <p className="text-sm text-gray-600">Active Access</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userRequests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Request History
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'new' && (
        <RequestForm user={user} onSubmit={handleCreateRequest} />
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {userRequests.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No requests found</p>
            </div>
          ) : (
            userRequests
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map(request => (
                <RequestCard key={request.id} request={request} />
              ))
          )}
        </div>
      )}
    </div>
  );
};