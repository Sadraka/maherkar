import api from './api';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// آدرس API احراز هویت
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8000/auth';

// interface ها برای تایپ‌های مورد نیاز
export interface LoginCredentials {
    phone: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    phone: string;
    password: string;
    password_conf: string;
    full_name: string;
    user_type?: string;
}

export interface RegisterOtpResponse {
    Detail: {
        Message: string;
        token: string;
        code: string;
    }
}

export interface TokenResponse {
    refresh: string;
    access: string;
}

export interface UserData {
    username: string;
    email: string;
    phone: string;
    user_type: string;
    full_name: string;
}

export interface RegisterValidateResponse {
    Detail: {
        Message: string;
        User: UserData;
        Token: TokenResponse;
    }
}

export interface ForgotPasswordResponse {
    Detail: {
        Message: string;
        token: string;
        code: string;
    }
}

export interface ResetPasswordResponse {
    Detail: {
        Message: string;
    }
}

// سرویس احراز هویت
const authService = {
    // تابع ورود کاربر
    login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
        try {
            const response = await axios.post<TokenResponse>(
                `${AUTH_URL}/login/`,
                credentials
            );

            // ذخیره توکن‌ها در localStorage
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);

            return response.data;
        } catch (error: any) {
            console.error('خطا در ورود:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله اول ثبت‌نام: درخواست کد OTP
    registerOtp: async (data: RegisterData): Promise<RegisterOtpResponse> => {
        try {
            const response = await axios.post<RegisterOtpResponse>(
                `${AUTH_URL}/register-otp/`,
                data
            );

            // چون سرویس OTP فعلا در دسترس نیست، کد را نمایش می‌دهیم
            toast.success(`کد تایید: ${response.data.Detail.code}`, {
                duration: 10000, // 10 ثانیه نمایش داده می‌شود
                position: 'top-center',
                style: {
                    background: '#e0f7fa',
                    color: '#00838f',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '16px'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('خطا در ارسال کد تایید:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله دوم ثبت‌نام: تایید کد OTP
    validateOtp: async (token: string, code: string): Promise<RegisterValidateResponse> => {
        try {
            const response = await axios.post<RegisterValidateResponse>(
                `${AUTH_URL}/register-otp-validate/${token}/`,
                { code }
            );

            // ذخیره توکن‌های دریافتی
            const { access, refresh } = response.data.Detail.Token;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            // ذخیره اطلاعات کاربر
            localStorage.setItem('userData', JSON.stringify(response.data.Detail.User));

            return response.data;
        } catch (error: any) {
            console.error('خطا در تایید کد:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله اول بازیابی رمز عبور: درخواست کد
    requestPasswordReset: async (phone: string): Promise<ForgotPasswordResponse> => {
        try {
            const response = await axios.post<ForgotPasswordResponse>(
                `${AUTH_URL}/forgot-password/`,
                { phone }
            );

            // چون سرویس OTP فعلا در دسترس نیست، کد را نمایش می‌دهیم
            toast.success(`کد تایید: ${response.data.Detail.code}`, {
                duration: 10000,
                position: 'top-center',
                style: {
                    background: '#e0f7fa',
                    color: '#00838f',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '16px'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('خطا در درخواست بازیابی رمز عبور:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله دوم بازیابی رمز عبور: تایید کد
    verifyPasswordResetOtp: async (token: string, code: string): Promise<any> => {
        try {
            const response = await axios.post(
                `${AUTH_URL}/verify-reset-otp/${token}/`,
                { code }
            );
            return response.data;
        } catch (error: any) {
            console.error('خطا در تایید کد بازیابی رمز عبور:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله سوم بازیابی رمز عبور: تغییر رمز عبور
    resetPassword: async (token: string, code: string, newPassword: string): Promise<ResetPasswordResponse> => {
        try {
            const response = await axios.post<ResetPasswordResponse>(
                `${AUTH_URL}/reset-password/${token}/`,
                {
                    code,
                    new_password: newPassword,
                    confirm_password: newPassword
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('خطا در تغییر رمز عبور:', error.response?.data || error.message);
            throw error;
        }
    },

    // خروج کاربر
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.dispatchEvent(new Event('logout'));
    },

    // بررسی احراز هویت کاربر
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false; // اجرای سمت سرور
        return !!localStorage.getItem('accessToken');
    },

    // دریافت اطلاعات کاربر
    getUserData: (): UserData | null => {
        if (typeof window === 'undefined') return null; // اجرای سمت سرور

        const userData = localStorage.getItem('userData');
        if (!userData) return null;

        try {
            return JSON.parse(userData) as UserData;
        } catch {
            return null;
        }
    },

    // تابع دریافت توکن برای استفاده در درخواست‌ها
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null; // اجرای سمت سرور
        return localStorage.getItem('accessToken');
    }
};

export default authService; 