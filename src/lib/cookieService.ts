/**
 * سرویس مدیریت کوکی‌ها
 * این سرویس برای ذخیره‌سازی و مدیریت کوکی‌ها در مرورگر استفاده می‌شود.
 */

// نام‌های کوکی‌های مورد استفاده در سیستم
export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    REMEMBER_ME: 'remember_me',
    PROMO_BAR_CLOSED: 'promo_bar_closed',
};

// سرویس مدیریت کوکی‌ها
const cookieService = {
    /**
     * تنظیم یک کوکی
     * @param name نام کوکی
     * @param value مقدار کوکی
     * @param days مدت زمان اعتبار کوکی به روز (پیش‌فرض: 30 روز)
     */
    setCookie: (name: string, value: string, days: number = 30): void => {
        // بررسی اجرای در مرورگر
        if (typeof document === 'undefined') return;

        // تنظیم تاریخ انقضا
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = `expires=${date.toUTCString()}`;

        // ایجاد کوکی با امنیت بیشتر
        document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict`;
    },

    /**
     * دریافت مقدار یک کوکی
     * @param name نام کوکی
     * @returns مقدار کوکی یا null در صورت عدم وجود
     */
    getCookie: (name: string): string | null => {
        // بررسی اجرای در مرورگر
        if (typeof document === 'undefined') return null;

        // جستجو برای کوکی مورد نظر
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`));

        // اگر کوکی یافت شود، مقدار آن را برگردان
        return cookieValue ? cookieValue.split('=')[1] : null;
    },

    /**
     * حذف یک کوکی
     * @param name نام کوکی
     */
    deleteCookie: (name: string): void => {
        // بررسی اجرای در مرورگر
        if (typeof document === 'undefined') return;

        // تنظیم تاریخ انقضا در گذشته برای حذف کوکی
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
    },

    /**
     * ذخیره یک آبجکت در کوکی (با تبدیل به JSON)
     * @param name نام کوکی
     * @param value آبجکت برای ذخیره‌سازی
     * @param days مدت زمان اعتبار کوکی به روز (پیش‌فرض: 30 روز)
     */
    setObjectCookie: <T>(name: string, value: T, days: number = 30): void => {
        try {
            const jsonValue = JSON.stringify(value);
            cookieService.setCookie(name, jsonValue, days);
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                // خطای تبدیل به JSON در محیط توسعه ثبت می‌شود
            }
        }
    },

    /**
     * دریافت یک آبجکت از کوکی (با تبدیل از JSON)
     * @param name نام کوکی
     * @returns آبجکت ذخیره شده یا null در صورت عدم وجود یا خطا
     */
    getObjectCookie: <T>(name: string): T | null => {
        const cookieValue = cookieService.getCookie(name);
        if (!cookieValue) return null;

        try {
            return JSON.parse(cookieValue) as T;
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                // خطای تبدیل از JSON در محیط توسعه ثبت می‌شود
            }
            return null;
        }
    },

    /**
     * حذف تمام کوکی‌های مربوط به احراز هویت
     */
    clearAuthCookies: (): void => {
        cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
        cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
        cookieService.deleteCookie(COOKIE_NAMES.USER_DATA);
    },

    /**
     * بررسی وجود کوکی‌های احراز هویت
     * @returns آیا کاربر احراز هویت شده است
     */
    hasAuthCookies: (): boolean => {
        return !!cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    }
};

export default cookieService; 