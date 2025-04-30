'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService, {
    UserData,
    LoginCredentials,
    RegisterData,
    TokenResponse
} from '@/lib/authService';
import { toast } from 'react-hot-toast';

// تعریف اینترفیس برای وضعیت کانتکست
interface AuthContextType {
    isAuthenticated: boolean;
    user: UserData | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    register: (data: RegisterData) => Promise<string>;
    verifyOtp: (token: string, code: string) => Promise<void>;
    loading: boolean;
}

// ایجاد کانتکست با مقدار پیش‌فرض
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: async () => { },
    logout: () => { },
    register: async () => '',
    verifyOtp: async () => { },
    loading: true
});

// هوک برای استفاده آسان از کانتکست
export const useAuth = () => useContext(AuthContext);

// پراویدر کانتکست
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // بررسی وضعیت احراز هویت در هنگام لود
    useEffect(() => {
        // رویداد خروج از برنامه
        const handleLogout = () => {
            setIsAuthenticated(false);
            setUser(null);
        };

        // بررسی وضعیت احراز هویت در localStorage
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

    // تابع ورود کاربر
    const login = async (credentials: LoginCredentials) => {
        setLoading(true);
        try {
            await authService.login(credentials);

            // دریافت اطلاعات کاربر پس از ورود
            const userData = authService.getUserData();
            setUser(userData);
            setIsAuthenticated(true);

            toast.success('ورود با موفقیت انجام شد');
            router.push('/'); // هدایت به صفحه اصلی
        } catch (error: any) {
            console.error('خطا در ورود:', error);
            const errorMessage = error.response?.data?.error || 'خطا در ورود به حساب کاربری';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع ثبت‌نام (مرحله اول: درخواست OTP)
    const register = async (data: RegisterData): Promise<string> => {
        setLoading(true);
        try {
            const response = await authService.registerOtp(data);
            toast.success('کد تایید برای شما ارسال شد');
            setLoading(false);
            return response.Detail.token;
        } catch (error: any) {
            setLoading(false);
            console.error('خطا در ثبت‌نام:', error);
            const errorDetail = error.response?.data?.Detail;

            if (typeof errorDetail === 'object') {
                // نمایش خطاهای اعتبارسنجی
                Object.entries(errorDetail).forEach(([field, errors]) => {
                    toast.error(`${field}: ${errors}`);
                });
            } else {
                toast.error(errorDetail || 'خطا در ثبت‌نام');
            }

            throw error;
        }
    };

    // تابع تایید کد OTP (مرحله دوم ثبت‌نام)
    const verifyOtp = async (token: string, code: string) => {
        setLoading(true);
        try {
            const response = await authService.validateOtp(token, code);

            // دریافت اطلاعات کاربر و توکن‌ها
            setUser(response.Detail.User);
            setIsAuthenticated(true);

            toast.success('ثبت‌نام با موفقیت انجام شد');
            router.push('/'); // هدایت به صفحه اصلی
        } catch (error: any) {
            console.error('خطا در تایید کد:', error);
            toast.error(error.response?.data?.Detail || 'کد تایید نامعتبر است');
            throw error;
        } finally {
            setLoading(false);
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

    // مقدار کانتکست
    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        register,
        verifyOtp,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 