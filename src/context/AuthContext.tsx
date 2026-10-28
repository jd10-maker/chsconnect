import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, SchoolSettings } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: 'student' | 'teacher' | 'admin' | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isLoading: boolean;
  settings: SchoolSettings | null;
  loginStudent: (email: string, currentClass: string, name?: string) => Promise<void>;
  loginTeacher: (email: string, password: string, facultyCode: string) => Promise<void>;
  registerTeacher: (name: string, email: string, password: string, department: string, facultyCode: string) => Promise<void>;
  switchClass: (newClass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Could not load settings:', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('school_lf_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('school_lf_token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('school_lf_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
    refreshUser();
  }, [refreshSettings, refreshUser]);

  const loginStudent = async (email: string, currentClass: string, name?: string) => {
    const res = await api.loginStudent(email, currentClass, name);
    localStorage.setItem('school_lf_token', res.token);
    setUser(res.user);
    await refreshSettings();
  };

  const loginTeacher = async (email: string, password: string, facultyCode: string) => {
    const res = await api.loginTeacher(email, password, facultyCode);
    localStorage.setItem('school_lf_token', res.token);
    setUser(res.user);
    await refreshSettings();
  };

  const registerTeacher = async (
    name: string,
    email: string,
    password: string,
    department: string,
    facultyCode: string
  ) => {
    const res = await api.registerTeacher(name, email, password, department, facultyCode);
    localStorage.setItem('school_lf_token', res.token);
    setUser(res.user);
    await refreshSettings();
  };

  const switchClass = async (newClass: string) => {
    if (!user || user.role !== 'student') return;
    const res = await api.updateStudentClass(newClass);
    setUser(res.user);
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('school_lf_token');
    setUser(null);
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isTeacher,
        isLoading,
        settings,
        loginStudent,
        loginTeacher,
        registerTeacher,
        switchClass,
        logout,
        refreshUser,
        refreshSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
