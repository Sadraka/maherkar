import Cookies from 'js-cookie';

// تعریف نام کوکی‌ها
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

// مدت زمان انقضای کوکی‌ها (روز)
const COOKIE_EXPIRE_DAYS = Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRE_DAYS) || 7;

/**
 * ذخیره توکن دسترسی در کوکی
 */
export const setAccessToken = (token: string): void => {
    Cookies.set(ACCESS_TOKEN_KEY, token, { expires: COOKIE_EXPIRE_DAYS });
};

/**
 * ذخیره توکن بازآوری در کوکی
 */
export const setRefreshToken = (token: string): void => {
    Cookies.set(REFRESH_TOKEN_KEY, token, { expires: COOKIE_EXPIRE_DAYS });
};

/**
 * ذخیره اطلاعات کاربر در کوکی
 */
export const setUserInfo = (userInfo: any): void => {
    Cookies.set(USER_INFO_KEY, JSON.stringify(userInfo), { expires: COOKIE_EXPIRE_DAYS });
};

/**
 * دریافت توکن دسترسی از کوکی
 */
export const getAccessToken = (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_KEY);
};

/**
 * دریافت توکن بازآوری از کوکی
 */
export const getRefreshToken = (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_KEY);
};

/**
 * دریافت اطلاعات کاربر از کوکی
 */
export const getUserInfo = (): any => {
    const userInfo = Cookies.get(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * بررسی وضعیت لاگین کاربر
 */
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

/**
 * پاک کردن همه کوکی‌های مربوط به احراز هویت
 */
export const clearAuthCookies = (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(USER_INFO_KEY);
};

export default {
    setAccessToken,
    setRefreshToken,
    setUserInfo,
    getAccessToken,
    getRefreshToken,
    getUserInfo,
    isAuthenticated,
    clearAuthCookies
}; 