import React from 'react';
import { Calendar, Clock, User, MessageSquare, Server, AlertTriangle } from 'lucide-react';
import { SudoRequest } from '../types';
import { StatusBadge } from './StatusBadge';

interface RequestCardProps {
  request: SudoRequest;
  showActions?: boolean;
  onApprove?: (id: string, comments: string) => void;
  onDeny?: (id: string, comments: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  showActions = false, 
  onApprove, 
  onDeny 
}) => {
  const [comments, setComments] = React.useState('');
  const [showCommentForm, setShowCommentForm] = React.useState(false);
  const [actionType, setActionType] = React.useState<'approve' | 'deny' | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleAction = (action: 'approve' | 'deny') => {
    setActionType(action);
    setShowCommentForm(true);
  };

  const handleSubmitAction = async () => {
    setIsProcessing(true);
    try {
      if (actionType === 'approve' && onApprove) {
        await onApprove(request.id, comments);
      } else if (actionType === 'deny' && onDeny) {
        onDeny(request.id, comments);
      }
      setComments('');
      setShowCommentForm(false);
      setActionType(null);
    } catch (error) {
      console.error('Action failed:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  const isExpired = request.expiresAt && new Date() > request.expiresAt;
  const isActive = request.status === 'active' || (request.status === 'approved' && request.systemGranted);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{request.username}</h3>
            <p className="text-sm text-gray-600">{request.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={isExpired ? 'expired' : request.status} />
          {request.systemGranted && isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
              <Server className="w-3 h-3" />
              System Active
            </span>
          )}
          {request.status === 'approved' && !request.systemGranted && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              Manual Grant Required
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Justification</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            {request.justification}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Requested: {formatDate(request.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Duration: {request.requestedDuration}h</span>
          </div>
        </div>

        {request.reviewedAt && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Reviewed by {request.reviewedBy} on {formatDate(request.reviewedAt)}</span>
            </div>
            {request.adminComments && (
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {request.adminComments}
              </p>
            )}
            {request.expiresAt && (request.status === 'approved' || request.status === 'active') && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Expires:</strong> {formatDate(request.expiresAt)}
              </p>
            )}
            {request.systemRevokedAt && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>System Access Revoked:</strong> {formatDate(request.systemRevokedAt)}
              </p>
            )}
          </div>
        )}

        {showActions && request.status === 'pending' && (
          <div className="pt-4 border-t border-gray-200">
            {!showCommentForm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('approve')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Approve & Grant System Access
                </button>
                <button
                  onClick={() => handleAction('deny')}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Deny
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add comments (optional)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitAction}
                    disabled={isProcessing}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      actionType === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Processing...
                      </div>
                    ) : (
                      actionType === 'approve' ? 'Approve & Grant Access' : 'Deny Request'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowCommentForm(false);
                      setActionType(null);
                      setComments('');
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};