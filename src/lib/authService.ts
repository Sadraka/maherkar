import axios from 'axios';
import { toast } from 'react-hot-toast';

// آدرس API احراز هویت
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8000/auth';

// استفاده نسبی از ماژول‌ها برای حل مشکل لینتر
import cookieService, { COOKIE_NAMES } from '../lib/cookieService';

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
    full_name?: string;
}

export interface RegisterValidateResponse {
    Detail: {
        Message: string;
        User: UserData;
        Token: TokenResponse;
    }
}

// سرویس احراز هویت
const authService = {
    // بررسی وجود شماره تلفن در دیتابیس با استفاده از API ورود
    checkPhoneExists: async (phone: string): Promise<boolean> => {
        try {
            // ارسال درخواست ورود با شماره تلفن و یک رمز عبور اشتباه
            await axios.post(`${AUTH_URL}/login/`, {
                phone: phone,
                password: 'incorrect_password_123456'
            });

            // اگر به اینجا برسیم، یعنی درخواست موفقیت‌آمیز بوده که غیرمنطقی است
            console.log('خطا: درخواست بررسی وجود شماره تلفن نباید موفقیت‌آمیز باشد');
            return false; // در هر صورت فرض می‌کنیم شماره تلفن وجود ندارد
        } catch (error: any) {
            if (error.response) {
                const responseData = error.response.data;

                // خطای مربوط به شماره تلفن
                if (responseData?.phone) {
                    const phoneError = Array.isArray(responseData.phone)
                        ? responseData.phone[0]
                        : responseData.phone;

                    // اگر پیام خطا "شماره تلفن موجود نیست" باشد
                    if (typeof phoneError === 'string' &&
                        (phoneError.includes('شماره تلفن موجود نیست') ||
                            phoneError.includes('موجود نیست'))) {
                        console.log('شماره تلفن در دیتابیس وجود ندارد');
                        return false;
                    }
                }

                // خطای رمز عبور اشتباه - یعنی شماره تلفن صحیح است
                if (responseData?.non_field_errors) {
                    const errors = Array.isArray(responseData.non_field_errors)
                        ? responseData.non_field_errors
                        : [responseData.non_field_errors];

                    for (const err of errors) {
                        if (typeof err === 'string' && err.includes('رمز عبور اشتباه است')) {
                            console.log('شماره تلفن در دیتابیس وجود دارد');
                            return true;
                        }
                    }
                }
            }

            // در صورت عدم تشخیص دقیق، پیش‌فرض: شماره تلفن وجود ندارد
            console.log('خطا در بررسی وجود شماره تلفن:', error);
            return false;
        }
    },

    // تابع ورود کاربر
    login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
        try {
            const response = await axios.post<TokenResponse>(
                `${AUTH_URL}/login/`,
                credentials
            );

            // ذخیره توکن‌ها در کوکی با مدت انقضای 30 روز
            cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, response.data.access, 30);
            cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, response.data.refresh, 30);

            return response.data;
        } catch (error: any) {
            console.error('خطا در ورود:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله اول ثبت‌نام: درخواست کد OTP
    registerOtp: async (userData: RegisterData): Promise<RegisterOtpResponse> => {
        try {
            console.log('ارسال درخواست کد تایید با اطلاعات کاربر:', userData);

            // اطمینان از وجود مقدار user_type و تنظیم مقدار پیش‌فرض در صورت نیاز
            const userDataWithType = {
                ...userData,
                user_type: userData.user_type || 'JS' // مقدار پیش‌فرض "JS" برای جوینده کار
            };

            const response = await axios.post<RegisterOtpResponse>(
                `${AUTH_URL}/register-otp/`,
                userDataWithType
            );

            console.log('پاسخ API برای درخواست کد تایید:', response.data);

            // نمایش کد تایید در همه محیط‌ها (توسعه و تولید)
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
            console.error('خطا در ارسال کد تایید:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله دوم ثبت‌نام: تایید کد OTP
    validateOtp: async (token: string, code: string): Promise<RegisterValidateResponse> => {
        try {
            console.log('ارسال درخواست تایید کد OTP به API:', { token, code });

            const response = await axios.post<RegisterValidateResponse>(
                `${AUTH_URL}/register-otp-validate/${token}/`,
                { code }
            );

            console.log('پاسخ دریافتی از API پس از تایید کد OTP:', response.data);

            // ذخیره توکن‌های دریافتی در کوکی با مدت انقضای 30 روز
            if (response.data.Detail && response.data.Detail.Token) {
                const { access, refresh } = response.data.Detail.Token;
                cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, access, 30);
                cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, refresh, 30);
            }

            // ذخیره اطلاعات کاربر با مدت انقضای 30 روز
            if (response.data.Detail && response.data.Detail.User) {
                cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, response.data.Detail.User, 30);
            }

            return response.data;
        } catch (error: any) {
            console.error('خطا در تایید کد:', error.response?.data || error.message);
            throw error;
        }
    },

    // خروج کاربر
    logout: () => {
        cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
        cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
        cookieService.deleteCookie(COOKIE_NAMES.USER_DATA);
        window.dispatchEvent(new Event('logout'));
    },

    // بررسی احراز هویت کاربر
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false; // اجرای سمت سرور
        return !!cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    },

    // دریافت اطلاعات کاربر
    getUserData: (): UserData | null => {
        if (typeof window === 'undefined') return null; // اجرای سمت سرور
        return cookieService.getObjectCookie<UserData>(COOKIE_NAMES.USER_DATA);
    },

    // تابع دریافت توکن برای استفاده در درخواست‌ها
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null; // اجرای سمت سرور
        return cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    }
};

export default authService; 