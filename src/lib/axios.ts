import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import cookieService, { COOKIE_NAMES } from './cookieService';

// تنظیمات پایه برای axios
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// اضافه کردن توکن به هدر درخواست‌ها در صورت وجود
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // اضافه کردن پارامتر timestamp به URL برای جلوگیری از کش شدن درخواست‌ها
        // این روش با محدودیت‌های CORS تداخل ندارد
        if (config.method?.toLowerCase() === 'get') {
            // اطمینان از اینکه params وجود دارد
            config.params = config.params || {};
            // اضافه کردن timestamp به پارامترها
            config.params._t = new Date().getTime();
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// مدیریت پاسخ‌ها و خطاها
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        // در اینجا می‌توان بر اساس کد خطا، پیام مناسب نمایش داد
        // یا در صورت انقضای توکن، توکن جدید درخواست کرد
        return Promise.reject(error);
    }
);

// توابع کمکی برای انواع درخواست‌ها
export const apiGet = <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.get<T>(url, config);
};

export const apiPost = <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.post<T>(url, data, config);
};

export const apiPut = <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.put<T>(url, data, config);
};

export const apiPatch = <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.patch<T>(url, data, config);
};

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.delete<T>(url, config);
};

export default axiosInstance; 