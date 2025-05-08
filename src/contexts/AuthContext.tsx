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
    loginOtp: (phone: string) => Promise<string>;
    validateLoginOtp: (token: string, code: string) => Promise<UserData>;
    logout: () => void;
    registerOtp: (userData: RegisterData) => Promise<string>;
    validateOtp: (token: string, code: string) => Promise<RegisterValidateResponse>;
    checkPhoneExists: (phone: string) => Promise<boolean>;
    updateUserType: (user_type: string) => Promise<UserData>;
    loading: boolean;
    loginError: string | null;
    registerError: string | null;
    verifyError: string | null;
}

// ایجاد کانتکست با مقدار پیش‌فرض
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loginOtp: async () => "",
    validateLoginOtp: async () => ({
        username: "",
        email: "",
        phone: "",
        user_type: ""
    }),
    logout: () => { },
    registerOtp: async () => "",
    validateOtp: async () => ({
        Detail: {
            Message: "",
            User: {
                username: "",
                email: "",
                phone: "",
                user_type: ""
            },
            Token: {
                refresh: "",
                access: ""
            }
        }
    }),
    checkPhoneExists: async () => false,
    updateUserType: async () => ({
        username: "",
        email: "",
        phone: "",
        user_type: ""
    }),
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

    // تابع ورود با OTP - درخواست کد
    const loginOtp = async (phone: string): Promise<string> => {
        clearErrors();
        setLoading(true);
        try {
            console.log('شروع فرآیند ورود با OTP برای شماره:', phone);
            const token = await authService.loginOtp(phone);
            console.log('درخواست OTP ورود با موفقیت انجام شد، توکن دریافت شد');
            return token;
        } catch (error: any) {
            console.error('خطا در درخواست OTP ورود:', error.message);
            setLoginError(error.message || 'خطا در درخواست کد تایید ورود');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع ورود با OTP - تایید کد
    const validateLoginOtp = async (token: string, code: string): Promise<UserData> => {
        clearErrors();
        setLoading(true);
        try {
            console.log('تایید کد OTP برای ورود...');
            const userData = await authService.validateLoginOtp(token, code);

            setUser(userData);
            setIsAuthenticated(true);

            toast.success('ورود با موفقیت انجام شد');
            return userData;
        } catch (error: any) {
            console.error('خطا در تایید کد OTP برای ورود:', error.message);
            setLoginError(error.message || 'کد تایید نامعتبر است');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع ثبت‌نام (مرحله ارسال OTP)
    const registerOtp = async (userData: RegisterData): Promise<string> => {
        clearErrors();
        setLoading(true);
        try {
            console.log('شروع فرآیند ثبت‌نام با داده‌ها:', {
                phone: userData.phone,
                full_name: userData.full_name,
                user_type: userData.user_type
            });

            const token = await authService.registerOtp(userData);

            console.log('درخواست کد OTP با موفقیت انجام شد، توکن دریافت شد');

            return token;
        } catch (error: any) {
            console.error('خطا در فرآیند ثبت‌نام:', error.message);

            setRegisterError(error.message || 'خطا در ارسال کد تایید');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع تایید کد OTP (مرحله دوم)
    const validateOtp = async (token: string, code: string): Promise<RegisterValidateResponse> => {
        clearErrors();
        setLoading(true);
        try {
            const response = await authService.validateOtp(token, code);

            if (response.Detail && response.Detail.User && response.Detail.Token) {
                setUser(response.Detail.User);
                // اطلاعات کاربر در authService ذخیره می‌شود
                setIsAuthenticated(true);
            }

            return response;
        } catch (error: any) {
            // استفاده از پیام خطای دقیق از سرویس
            const errorMessage = error.message || 'کد تایید نامعتبر است';
            setVerifyError(errorMessage);
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

    // تابع بررسی تکراری بودن شماره تلفن
    const checkPhoneExists = async (phone: string): Promise<boolean> => {
        try {
            return await authService.checkPhoneExists(phone);
        } catch (error) {
            throw error;
        }
    };

    // تابع به‌روزرسانی نوع کاربر
    const updateUserType = async (user_type: string): Promise<UserData> => {
        clearErrors();
        setLoading(true);
        try {
            const updatedUser = await authService.updateUserType(user_type);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // مقدار کانتکست
    const value = {
        isAuthenticated,
        user,
        loginOtp,
        validateLoginOtp,
        logout,
        registerOtp,
        validateOtp,
        checkPhoneExists,
        updateUserType,
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