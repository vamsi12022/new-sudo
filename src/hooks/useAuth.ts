import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    username: 'john.doe',
    email: 'john.doe@company.com',
    role: 'user',
    department: 'Engineering'
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@company.com',
    role: 'admin',
    department: 'IT Security'
  },
  {
    id: '3',
    username: 'jane.smith',
    email: 'jane.smith@company.com',
    role: 'user',
    department: 'DevOps'
  }
];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({
        user,
        isAuthenticated: true
      });
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Mock authentication
    const user = mockUsers.find(u => u.username === username);
    if (user && password === 'password') {
      setAuthState({
        user,
        isAuthenticated: true
      });
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
    localStorage.removeItem('currentUser');
  };

  return {
    ...authState,
    login,
    logout
  };
};