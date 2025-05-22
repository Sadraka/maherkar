'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStore, useAuthActions, useAuthStatus, useAuth as useAuthFromStore } from '@/store/authStore';
import { UserData } from '@/lib/authService';

// تعریف نوع داده‌های کانتکست
interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginError: string | null;
  registerError: string | null;
  verifyError: string | null;
  loginOtp: (phone: string) => Promise<string>;
  validateLoginOtp: (token: string, code: string) => Promise<UserData>;
  logout: () => void;
  registerOtp: (userData: any) => Promise<string>;
  validateOtp: (token: string, code: string) => Promise<any>;
  checkPhoneExists: (phone: string) => Promise<boolean>;
  updateUserType: (user_type: string) => Promise<UserData>;
  refreshUserData: () => Promise<void>;
  fetchUserData: () => Promise<void>;
}

// ایجاد کانتکست
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// کامپوننت تامین‌کننده کانتکست
export function AuthProvider({ children }: { children: ReactNode }) {
  // استفاده از هوک‌های Zustand
  const { isAuthenticated, user } = useAuthFromStore();
  const { loading, loginError, registerError, verifyError } = useAuthStatus();
  const { 
    loginOtp, 
    validateLoginOtp, 
    logout, 
    registerOtp, 
    validateOtp, 
    checkPhoneExists,
    updateUserType,
    refreshUserData
  } = useAuthActions();
  
  const fetchUserData = useAuthStore(state => state.fetchUserData);

  // مقدار کانتکست
  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    loginError,
    registerError,
    verifyError,
    loginOtp,
    validateLoginOtp,
    logout,
    registerOtp,
    validateOtp,
    checkPhoneExists,
    updateUserType,
    refreshUserData,
    fetchUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// هوک سفارشی برای استفاده از کانتکست
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// برای سازگاری با کدهای قدیمی، export های لازم را اضافه می‌کنیم
export const useAuth = useAuthContext;

// افزودن همه export های دیگر برای سازگاری کامل با کدهای قدیمی
export { 
  AuthContext 
};

// این فایل تنها به منظور سازگاری با کدهای قدیمی که هنوز به AuthContext وابسته هستند ایجاد شده است
// توصیه می‌شود به تدریج از هوک‌های useAuthStore، useAuth، useAuthActions و useAuthStatus استفاده کنید 