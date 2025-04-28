import { toast } from 'react-hot-toast';

interface FetchOptions extends RequestInit {
    showToast?: boolean;
    revalidate?: number | false;
    withAuth?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

/**
 * دریافت توکن احراز هویت از localStorage
 */
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
}

/**
 * تابع apiRequest برای انجام درخواست‌های API با امکانات اضافی
 */
export async function apiRequest<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T | null> {
    const {
        showToast = false,
        revalidate = 3600,
        withAuth = true,
        ...fetchOptions
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
        const headers = new Headers(fetchOptions.headers || {});

        // تنظیم هدر Content-Type
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        // اضافه کردن توکن احراز هویت اگر درخواست شده باشد
        if (withAuth) {
            const token = getAuthToken();
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }

        const fetchOpts: RequestInit = {
            ...fetchOptions,
            headers,
        };

        // اضافه کردن گزینه‌های کش برای اجرا در سمت سرور
        if (typeof window === 'undefined' && revalidate !== false) {
            fetchOpts.next = { revalidate };
        }

        const response = await fetch(url, fetchOpts);

        if (!response.ok) {
            // اگر خطای 401 (عدم احراز هویت) داشتیم، کاربر را به صفحه ورود هدایت کنیم
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');

                // اگر در صفحه ورود یا ثبت‌نام نیستیم، به صفحه ورود هدایت کنیم
                if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                }
            }

            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || `خطای ${response.status}`;

            if (showToast) {
                toast.error(errorMessage);
            }

            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error: any) {
        console.error(`خطا در درخواست به ${endpoint}:`, error);

        if (showToast && !options.showToast) {
            toast.error(error.message || 'خطا در ارتباط با سرور');
        }

        return null;
    }
}

/**
 * ذخیره توکن‌های احراز هویت
 */
export function setAuthTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }
}

/**
 * حذف توکن‌های احراز هویت
 */
export function clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
    }
}

/**
 * توابع کمکی برای متدهای مختلف HTTP
 */
export const api = {
    // دریافت داده
    get: <T>(endpoint: string, options?: FetchOptions) =>
        apiRequest<T>(endpoint, { method: 'GET', ...options }),

    // ارسال داده جدید
    post: <T>(endpoint: string, data: any, options?: FetchOptions) =>
        apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(data), ...options }),

    // بروزرسانی داده
    put: <T>(endpoint: string, data: any, options?: FetchOptions) =>
        apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), ...options }),

    // بروزرسانی جزئی داده
    patch: <T>(endpoint: string, data: any, options?: FetchOptions) =>
        apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data), ...options }),

    // حذف داده
    delete: <T>(endpoint: string, options?: FetchOptions) =>
        apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
}; 