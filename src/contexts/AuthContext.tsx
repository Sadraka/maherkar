'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, login } from '@/services/auth';
import { clearAuthTokens } from '@/lib/api';
import { getMyProfile } from '@/services/users';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    login: (phone: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // بررسی وضعیت احراز هویت کاربر در هنگام بارگذاری
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // اگر کاربر توکن داشته باشد، اطلاعات او را دریافت می‌کنیم
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                        const userProfile = await getMyProfile();
                        if (userProfile) {
                            setUser(userProfile as unknown as AuthUser);
                            setError(null);
                        } else {
                            // اگر با وجود توکن، اطلاعات کاربر دریافت نشد، احتمالاً توکن منقضی شده
                            clearAuthTokens();
                        }
                    }
                }
            } catch (err: any) {
                setError(err.message || 'خطا در دریافت اطلاعات کاربر');
                clearAuthTokens();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // تابع ورود
    const loginUser = async (phone: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await login(phone, password);

            if (response) {
                // بعد از ورود، اطلاعات کاربر را دریافت می‌کنیم
                const userProfile = await getMyProfile();
                if (userProfile) {
                    setUser(userProfile as unknown as AuthUser);
                    return true;
                }
            }

            return false;
        } catch (err: any) {
            setError(err.message || 'خطا در ورود به سیستم');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // تابع خروج
    const logout = () => {
        clearAuthTokens();
        setUser(null);
        // اگر در سمت کلاینت هستیم، به صفحه اصلی هدایت می‌کنیم
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    // تابع به‌روزرسانی اطلاعات کاربر
    const refreshUser = async () => {
        try {
            if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
                const userProfile = await getMyProfile();
                if (userProfile) {
                    setUser(userProfile as unknown as AuthUser);
                    setError(null);
                }
            }
        } catch (err: any) {
            setError(err.message || 'خطا در به‌روزرسانی اطلاعات کاربر');
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login: loginUser,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 