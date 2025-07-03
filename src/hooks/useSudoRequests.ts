import { useState, useEffect } from 'react';
import { SudoRequest } from '../types';
import { SudoAPI } from '../services/api';

const STORAGE_KEY = 'sudoRequests';

// Mock initial data
const initialRequests: SudoRequest[] = [
  {
    id: '1',
    userId: '1',
    username: 'john.doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    justification: 'Need to install Docker and configure development environment for new microservice project. Will need to modify system configurations and install packages.',
    requestedDuration: 24,
    status: 'pending',
    createdAt: new Date('2025-01-09T10:30:00'),
  },
  {
    id: '2',
    userId: '3',
    username: 'jane.smith',
    email: 'jane.smith@company.com',
    department: 'DevOps',
    justification: 'Emergency fix required for production server configuration. Need to update nginx configs and restart services.',
    requestedDuration: 2,
    status: 'approved',
    createdAt: new Date('2025-01-08T14:15:00'),
    reviewedAt: new Date('2025-01-08T14:30:00'),
    reviewedBy: 'admin',
    adminComments: 'Approved for emergency fix. Please update ticket #1234 with changes.',
    expiresAt: new Date('2025-01-08T16:30:00'),
    systemGranted: true
  }
];

export const useSudoRequests = () => {
  const [requests, setRequests] = useState<SudoRequest[]>([]);

  useEffect(() => {
    const savedRequests = localStorage.getItem(STORAGE_KEY);
    if (savedRequests) {
      const parsed = JSON.parse(savedRequests);
      // Convert date strings back to Date objects
      const converted = parsed.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : undefined,
        expiresAt: req.expiresAt ? new Date(req.expiresAt) : undefined,
        systemRevokedAt: req.systemRevokedAt ? new Date(req.systemRevokedAt) : undefined
      }));
      setRequests(converted);
    } else {
      setRequests(initialRequests);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRequests));
    }
  }, []);

  const saveRequests = (newRequests: SudoRequest[]) => {
    setRequests(newRequests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRequests));
  };

  const createRequest = (request: Omit<SudoRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: SudoRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date()
    };
    
    const updatedRequests = [...requests, newRequest];
    saveRequests(updatedRequests);
    return newRequest;
  };

  const updateRequest = (id: string, updates: Partial<SudoRequest>) => {
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, ...updates } : req
    );
    saveRequests(updatedRequests);
  };

  const approveRequest = async (id: string, adminComments: string, reviewedBy: string) => {
    const request = requests.find(req => req.id === id);
    if (request) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + request.requestedDuration);
      
      try {
        // Grant actual system sudo access
        await SudoAPI.grantSudoAccess(request.username, request.requestedDuration, id);
        
        updateRequest(id, {
          status: 'active',
          reviewedAt: new Date(),
          reviewedBy,
          adminComments,
          expiresAt,
          systemGranted: true
        });
      } catch (error) {
        // If system grant fails, still approve but mark as not system granted
        updateRequest(id, {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy,
          adminComments: `${adminComments}\n\nNote: System integration failed - manual sudo grant required.`,
          expiresAt,
          systemGranted: false
        });
        throw error;
      }
    }
  };

  const denyRequest = (id: string, adminComments: string, reviewedBy: string) => {
    updateRequest(id, {
      status: 'denied',
      reviewedAt: new Date(),
      reviewedBy,
      adminComments
    });
  };

  const revokeSystemAccess = async (id: string, reason: string) => {
    const request = requests.find(req => req.id === id);
    if (request && request.systemGranted) {
      try {
        await SudoAPI.revokeSudoAccess(request.username, reason);
        updateRequest(id, {
          status: 'expired',
          systemRevokedAt: new Date()
        });
      } catch (error) {
        throw error;
      }
    }
  };

  return {
    requests,
    createRequest,
    updateRequest,
    approveRequest,
    denyRequest,
    revokeSystemAccess
  };
};