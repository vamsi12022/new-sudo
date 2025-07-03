export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  department: string;
  systemUser?: boolean;
  groups?: string[];
  hasActiveSudo?: boolean;
}

export interface SudoRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  department: string;
  justification: string;
  requestedDuration: number; // in hours
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'active';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminComments?: string;
  expiresAt?: Date;
  systemGranted?: boolean;
  systemRevokedAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SystemUser {
  username: string;
  groups: string[];
  hasActiveSudo: boolean;
  session: SudoSession | null;
}

export interface SudoSession {
  sudoersFile: string;
  expiresAt: Date;
  granted: Date;
}

export interface SudoLog {
  timestamp: string;
  username: string;
  action: 'GRANT' | 'REVOKE' | 'AUTO_REVOKE';
  details: string;
  ip: string;
}