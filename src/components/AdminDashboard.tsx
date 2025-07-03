import React from 'react';
import { Users, CheckCircle, XCircle, Clock, Server } from 'lucide-react';
import { User, SudoRequest } from '../types';
import { RequestCard } from './RequestCard';
import { SystemIntegration } from './SystemIntegration';

interface AdminDashboardProps {
  user: User;
  requests: SudoRequest[];
  onApproveRequest: (id: string, comments: string) => void;
  onDenyRequest: (id: string, comments: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  requests, 
  onApproveRequest, 
  onDenyRequest 
}) => {
  const [activeTab, setActiveTab] = React.useState<'pending' | 'all' | 'system'>('pending');
  
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const deniedRequests = requests.filter(req => req.status === 'denied');
  const activeRequests = requests.filter(req => req.status === 'active');

  const displayRequests = activeTab === 'pending' 
    ? pendingRequests 
    : requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Review and manage sudo access requests with system integration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedRequests.length}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeRequests.length}</p>
              <p className="text-sm text-gray-600">Active Access</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{deniedRequests.length}</p>
              <p className="text-sm text-gray-600">Denied</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Review ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            System Integration
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'system' ? (
        <SystemIntegration />
      ) : (
        <div className="space-y-4">
          {displayRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === 'pending' ? 'No pending requests' : 'No requests found'}
              </p>
            </div>
          ) : (
            displayRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                showActions={activeTab === 'pending'}
                onApprove={onApproveRequest}
                onDeny={onDenyRequest}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};