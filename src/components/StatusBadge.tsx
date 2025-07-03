import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Server } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'active';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          className: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Approved',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'active':
        return {
          icon: Server,
          text: 'Active',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'denied':
        return {
          icon: XCircle,
          text: 'Denied',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'expired':
        return {
          icon: AlertTriangle,
          text: 'Expired',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} font-medium rounded-full border ${config.className}`}>
      <Icon className={iconSize} />
      {config.text}
    </span>
  );
};