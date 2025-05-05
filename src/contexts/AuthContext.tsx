'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService, {
    UserData,
    LoginCredentials,
    RegisterData,
    TokenResponse,
    RegisterValidateResponse
} from '../lib/authService';
import { toast } from 'react-hot-toast';
import ErrorHandler from '../components/common/ErrorHandler';
import cookieService, { COOKIE_NAMES } from '../lib/cookieService';

// تعریف اینترفیس برای وضعیت کانتکست
interface AuthContextType {
    isAuthenticated: boolean;
    user: UserData | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    register: (userData: RegisterData) => Promise<string>;
    verifyOtp: (token: string, code: string) => Promise<RegisterValidateResponse>;
    checkPhoneExists: (phone: string) => Promise<boolean>;
    loading: boolean;
    loginError: string | null;
    registerError: string | null;
    verifyError: string | null;
}

// ایجاد کانتکست با مقدار پیش‌فرض
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: async () => { },
    logout: () => { },
    register: async () => '',
    verifyOtp: async () => ({ Detail: { Message: '', User: {} as UserData, Token: {} as TokenResponse } }),
    checkPhoneExists: async () => false,
    loading: true,
    loginError: null,
    registerError: null,
    verifyError: null
});

// هوک برای استفاده آسان از کانتکست
export const useAuth = () => useContext(AuthContext);

// پراویدر کانتکست
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const router = useRouter();

    // بررسی وضعیت احراز هویت در هنگام لود
    useEffect(() => {
        // رویداد خروج از برنامه
        const handleLogout = () => {
            setIsAuthenticated(false);
            setUser(null);
        };

        // بررسی وضعیت احراز هویت در کوکی
        const checkAuth = () => {
            const authenticated = authService.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                const userData = authService.getUserData();
                setUser(userData);
            }

            setLoading(false);
        };

        window.addEventListener('logout', handleLogout);
        checkAuth();

        return () => {
            window.removeEventListener('logout', handleLogout);
        };
    }, []);

    // پاک کردن خطاها قبل از هر عملیات
    const clearErrors = () => {
        setLoginError(null);
        setRegisterError(null);
        setVerifyError(null);
    };

    // تابع ورود کاربر
    const login = async (credentials: LoginCredentials) => {
        clearErrors();
        setLoading(true);
        try {
            await authService.login(credentials);

            // دریافت اطلاعات کاربر پس از ورود
            const userData = authService.getUserData();
            setUser(userData);
            setIsAuthenticated(true);

            toast.success('ورود با موفقیت انجام شد');
            router.push('/'); // هدایت به صفحه اصلی
        } catch (error) {
            setLoginError('خطا در ورود به حساب کاربری');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع ثبت‌نام (مرحله اول)
    const register = async (userData: RegisterData): Promise<string> => {
        clearErrors();
        setLoading(true);
        try {
            const response = await authService.registerOtp(userData);
            return response.Detail.token;
        } catch (error) {
            setRegisterError('خطا در ارسال کد تایید');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع تایید کد OTP (مرحله دوم)
    const verifyOtp = async (token: string, code: string): Promise<RegisterValidateResponse> => {
        clearErrors();
        try {
            const response = await authService.validateOtp(token, code);

            if (response.Detail && response.Detail.User && response.Detail.Token) {
                setUser(response.Detail.User);
                // اطلاعات کاربر در authService ذخیره می‌شود
                setIsAuthenticated(true);
            }

            return response;
        } catch (error) {
            setVerifyError('کد تایید نامعتبر است');
            throw error;
        }
    };

    // تابع خروج از حساب کاربری
    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        toast.success('با موفقیت خارج شدید');
        router.push('/login');
    };

    // تابع بررسی تکراری بودن شماره تلفن
    const checkPhoneExists = async (phone: string): Promise<boolean> => {
        try {
            return await authService.checkPhoneExists(phone);
        } catch (error) {
            throw error;
        }
    };

    // مقدار کانتکست
    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        register,
        verifyOtp,
        checkPhoneExists,
        loading,
        loginError,
        registerError,
        verifyError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 