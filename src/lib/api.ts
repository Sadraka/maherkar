import axios from 'axios';
import cookieService, { COOKIE_NAMES } from './cookieService';

// ایجاد نمونه axios با تنظیمات پیش‌فرض
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
});

// افزودن interceptor برای اضافه کردن توکن به هدر درخواست‌ها
api.interceptors.request.use(
    (config) => {
        const token = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// افزودن interceptor برای مدیریت خطاها و رفرش توکن منقضی شده
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // اگر خطای 401 (احراز هویت نشده) دریافت شد و این اولین تلاش است
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // تلاش برای رفرش توکن
                const refreshToken = cookieService.getCookie(COOKIE_NAMES.REFRESH_TOKEN);

                if (!refreshToken) {
                    throw new Error('رفرش توکن یافت نشد');
                }

                const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/token/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;

                // ذخیره توکن جدید در کوکی با مدت انقضای 30 روز
                cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, access, 30);

                // تنظیم هدر توکن جدید
                originalRequest.headers.Authorization = `Bearer ${access}`;

                // اجرای مجدد درخواست اصلی
                return api(originalRequest);
            } catch (refreshError) {
                // اگر نمی‌توانیم توکن را رفرش کنیم، کاربر را خارج می‌کنیم
                cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
                cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);

                // اگر event dispatcherی داریم، می‌توان کاربر را به صفحه ورود هدایت کرد
                window.dispatchEvent(new Event('logout'));

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api; 