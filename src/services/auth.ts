import { api, setAuthTokens } from '@/lib/api';

/**
 * نوع داده کاربر احراز هویت شده
 */
export interface AuthUser {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    username: string;
    user_type: 'employer' | 'jobseeker' | 'admin';
    avatar?: string;
    // سایر اطلاعات کاربر
}

/**
 * پاسخ احراز هویت
 */
export interface AuthResponse {
    user: AuthUser;
    tokens: {
        refresh: string;
        access: string;
    };
}

/**
 * ورود کاربر با شماره تلفن و رمز عبور
 */
export async function login(phone: string, password: string) {
    const response = await api.post<{
        refresh: string;
        access: string;
    }>('/auth/login/', { phone, password }, {
        showToast: true,
        withAuth: false,
    });

    if (response && response.refresh && response.access) {
        // ذخیره توکن‌ها
        setAuthTokens(response.access, response.refresh);
    }

    return response;
}

/**
 * ارسال کد تایید برای ثبت‌نام
 */
export async function registerOTP(userData: {
    full_name: string;
    phone: string;
    email: string;
    username: string;
    password: string;
    password_conf: string;
    user_type: 'employer' | 'jobseeker';
}) {
    return api.post<{
        Detail: {
            Message: string;
            token: string;
            code: string;
        }
    }>('/auth/register-otp/', userData, {
        showToast: true,
        withAuth: false,
    });
}

/**
 * تایید ثبت‌نام با کد OTP
 */
export async function validateOTP(token: string, code: string) {
    const response = await api.post<{
        Detail: {
            Message: string;
            User: AuthUser;
            Token: {
                refresh: string;
                access: string;
            }
        }
    }>(`/auth/register-otp-validate/${token}/`, { code }, {
        showToast: true,
        withAuth: false,
    });

    if (response?.Detail?.Token) {
        // ذخیره توکن‌ها
        setAuthTokens(
            response.Detail.Token.access,
            response.Detail.Token.refresh
        );
    }

    return response?.Detail;
}

/**
 * نوسازی توکن دسترسی
 */
export async function refreshToken(refresh_token: string) {
    return api.post<{ access: string }>('/auth/token/refresh/', { refresh: refresh_token }, {
        showToast: false,
        withAuth: false,
    });
}

/**
 * خروج کاربر
 */
export async function logout() {
    return api.post('/auth/logout/', {}, {
        showToast: false,
    });
} 