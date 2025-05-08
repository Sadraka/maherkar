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
    checkUsernameExists: (username: string) => Promise<boolean>;
    checkEmailExists: (email: string) => Promise<boolean>;
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
    login: async () => { },
    logout: () => { },
    register: async () => "",
    verifyOtp: async () => ({
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
    checkUsernameExists: async () => false,
    checkEmailExists: async () => false,
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

    // تابع ورود کاربر
    const login = async (credentials: LoginCredentials) => {
        clearErrors();
        setLoading(true);
        try {
            // دریافت اطلاعات کاربر مستقیماً از authService.login
            const userData = await authService.login(credentials);

            // تنظیم وضعیت احراز هویت و اطلاعات کاربر
            setUser(userData);
            setIsAuthenticated(true);

            toast.success('ورود با موفقیت انجام شد');
            router.push('/'); // هدایت به صفحه اصلی
        } catch (error: any) {
            // بررسی خطاهای خاص برای نمایش پیام مناسب
            let errorMessage = 'خطا در ورود به حساب کاربری';

            if (error.response?.data) {
                if (error.response.data.non_field_errors) {
                    // خطاهای عمومی مانند نام کاربری یا رمز عبور اشتباه
                    const nonFieldErrors = Array.isArray(error.response.data.non_field_errors)
                        ? error.response.data.non_field_errors[0]
                        : error.response.data.non_field_errors;
                    errorMessage = nonFieldErrors || errorMessage;
                }
                else if (error.response.data.detail) {
                    // خطای جزئیات
                    errorMessage = error.response.data.detail;
                }
            }

            setLoginError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع ثبت‌نام (مرحله ارسال OTP)
    const register = async (userData: RegisterData): Promise<string> => {
        clearErrors();
        setLoading(true);
        try {
            console.log('شروع فرآیند ثبت‌نام با داده‌ها:', {
                phone: userData.phone,
                register_stage: userData.register_stage,
                has_username: !!userData.username,
                has_email: !!userData.email,
                has_password: !!userData.password
            });

            const response = await authService.registerOtp(userData);

            console.log('درخواست کد OTP با موفقیت انجام شد، توکن دریافت شد');

            return response.Detail.token;
        } catch (error: any) {
            console.error('خطا در فرآیند ثبت‌نام:', error.response?.data || error.message);

            const errorMessage = error.response?.data
                ? `خطا در ارسال کد تایید: ${JSON.stringify(error.response.data)}`
                : 'خطا در ارسال کد تایید';

            setRegisterError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // تابع تایید کد OTP (مرحله دوم)
    const verifyOtp = async (token: string, code: string): Promise<RegisterValidateResponse> => {
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

    // تابع بررسی تکراری بودن نام کاربری
    const checkUsernameExists = async (username: string): Promise<boolean> => {
        try {
            return await authService.checkUsernameExists(username);
        } catch (error) {
            throw error;
        }
    };

    // تابع بررسی تکراری بودن ایمیل
    const checkEmailExists = async (email: string): Promise<boolean> => {
        try {
            return await authService.checkEmailExists(email);
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
        login,
        logout,
        register,
        verifyOtp,
        checkPhoneExists,
        checkUsernameExists,
        checkEmailExists,
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