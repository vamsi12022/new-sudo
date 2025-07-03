import React, { useState } from 'react';
import { Send, FileText, Clock } from 'lucide-react';
import { User } from '../types';

interface RequestFormProps {
  user: User;
  onSubmit: (data: {
    justification: string;
    requestedDuration: number;
  }) => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ user, onSubmit }) => {
  const [justification, setJustification] = useState('');
  const [requestedDuration, setRequestedDuration] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit({
        justification,
        requestedDuration
      });
      setJustification('');
      setRequestedDuration(4);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Request Sudo Access</h2>
          <p className="text-sm text-gray-600">Submit a request for elevated privileges</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
            Justification <span className="text-red-500">*</span>
          </label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Please provide a detailed explanation of why you need sudo access..."
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Include specific tasks, software installations, or system configurations you need to perform.
          </p>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Requested Duration
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="duration"
              value={requestedDuration}
              onChange={(e) => setRequestedDuration(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={4}>4 hours</option>
              <option value={8}>8 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={168}>1 week</option>
            </select>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Access will automatically expire after the specified duration.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Request Summary</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Requestor:</strong> {user.username} ({user.email})</p>
            <p><strong>Department:</strong> {user.department}</p>
            <p><strong>Duration:</strong> {requestedDuration} hour{requestedDuration > 1 ? 's' : ''}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !justification.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
};