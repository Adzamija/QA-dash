import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (username: string, password: string, role: 'admin' | 'user') => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Load users from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('qa-lite-users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Create default admin user
      const defaultUser: User = {
        id: '1',
        username: 'muhamed',
        password: 'muhamed',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUsers([defaultUser]);
      localStorage.setItem('qa-lite-users', JSON.stringify([defaultUser]));
    }

    // Check if user is already logged in
    const storedUser = localStorage.getItem('qa-lite-current-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('qa-lite-current-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qa-lite-current-user');
  };

  const addUser = (username: string, password: string, role: 'admin' | 'user') => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role,
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('qa-lite-users', JSON.stringify(updatedUsers));
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updatedUsers);
    localStorage.setItem('qa-lite-users', JSON.stringify(updatedUsers));

    // Update current user if it's the one being updated
    if (user && user.id === id) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('qa-lite-current-user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('qa-lite-users', JSON.stringify(updatedUsers));

    // Logout if deleting current user
    if (user && user.id === id) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, users, login, logout, addUser, updateUser, deleteUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
