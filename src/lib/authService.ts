import axios from 'axios';
import { toast } from 'react-hot-toast';

// استفاده نسبی از ماژول‌ها برای حل مشکل لینتر
import cookieService, { COOKIE_NAMES } from '../lib/cookieService';

// interface ها برای تایپ‌های مورد نیاز
export interface LoginCredentials {
    phone: string;
}

export interface RegisterData {
    full_name: string;
    phone: string;
    user_type: string;
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
    phone: string;
    user_type: string;
    full_name?: string;
    last_login?: string;
    user_type_original?: string;
    company_name?: string;
    profile_picture?: string;
}

export interface RegisterValidateResponse {
    Detail: {
        Message: string;
        User: UserData;
        Token: TokenResponse;
    }
}

// تابع ترجمه خطاهای شبکه به فارسی
const translateNetworkError = (error: any): string => {
    // خطاهای عدم اتصال به سرور
    if (error.code === 'ECONNABORTED') {
        return 'زمان اتصال به سرور به پایان رسید. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.';
    }
    
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.';
    }
    
    if (error.code === 'ETIMEDOUT') {
        return 'اتصال به سرور با تأخیر مواجه شد. لطفاً دوباره تلاش کنید.';
    }
    
    if (error.code === 'ENOTFOUND') {
        return 'سرور در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.';
    }
    
    // خطاهای HTTP
    if (error.response) {
        switch (error.response.status) {
            case 500:
                return 'خطای داخلی سرور. لطفاً با پشتیبانی تماس بگیرید.';
            case 502:
                return 'سرور در حال حاضر در دسترس نیست. لطفاً چند دقیقه دیگر دوباره تلاش کنید.';
            case 503:
                return 'سرویس موقتاً در دسترس نیست. لطفاً چند دقیقه دیگر دوباره تلاش کنید.';
            case 504:
                return 'زمان پاسخگویی سرور به پایان رسید. لطفاً چند دقیقه دیگر دوباره تلاش کنید.';
            default:
                // برای سایر خطاها، پیام اصلی را برمی‌گردانیم
                break;
        }
    }
    
    // بازگشت پیام خطای اصلی اگر به موارد بالا نخورد
    return error.message || 'خطای نامشخص در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
};

// تابع رمزگشایی از توکن JWT
const decodeToken = (token: string): any => {
    try {
        // توکن JWT از سه بخش تشکیل شده که با نقطه از هم جدا شده‌اند
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        // بخش دوم توکن حاوی اطلاعات کاربر است (payload)
        const payload = parts[1];
        
        // رمزگشایی بخش payload با استفاده از atob و JSON.parse
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (e) {
        console.error('خطا در رمزگشایی توکن:', e);
        return null;
    }
};

// متغیر کش برای ذخیره موقت اطلاعات کاربر
let userDataCache: UserData | null = null;
let userDataCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقیقه به میلی‌ثانیه

// سرویس احراز هویت
const authService = {
    // استفاده از تابع رمزگشایی توکن
    decodeToken,

    // بررسی وجود شماره تلفن در دیتابیس با استفاده از API ورود
    checkPhoneExists: async (phone: string): Promise<boolean> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
            
            // تلاش برای ارسال کد OTP به شماره تلفن
            // اگر شماره تلفن وجود داشته باشد، کد OTP ارسال می‌شود
            // اگر شماره تلفن وجود نداشته باشد، خطای 404 یا 400 برگردانده می‌شود
            const response = await axios.post(`${BASE_URL}/auth/login-otp/`, {
                phone: phone
            });

            // اگر به اینجا برسیم، یعنی شماره تلفن در دیتابیس وجود دارد
            console.log('[authService] شماره تلفن در دیتابیس وجود دارد');
            return true;
        } catch (error: any) {
            // اگر خطای 404 یا 400 دریافت شد، یعنی شماره تلفن وجود ندارد
            if (error.response && (error.response.status === 404 || error.response.status === 400)) {
                console.log('[authService] شماره تلفن در دیتابیس وجود ندارد');
                return false;
            }

            // در صورت خطای شبکه، پیامی را نمایش می‌دهیم و خطا را مجدداً پرتاب می‌کنیم
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))) {
                throw new Error(translateNetworkError(error));
            }

            // در صورت دریافت سایر خطاها، آن را مجدداً پرتاب می‌کنیم
            throw error;
        }
    },

    // مرحله اول ثبت‌نام: درخواست کد OTP
    registerOtp: async (userData: RegisterData): Promise<string> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

            const response = await axios.post<RegisterOtpResponse>(
                `${BASE_URL}/auth/register-otp/`,
                userData
            );

            // نمایش کد تایید در صورت وجود
            if (response.data.Detail && response.data.Detail.code) {
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
            }

            // بازگرداندن توکن
            return response.data.Detail.token;
        } catch (error: any) {
            console.error('خطا در ارسال کد تایید:', error.response?.data || error.message);

            // بررسی خطاهای شبکه
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNABORTED')) {
                throw new Error(translateNetworkError(error));
            }

            // بهبود مدیریت خطاها
            if (error.response?.data?.Detail) {
                const errorDetail = error.response.data.Detail;

                // اگر پیام خطا از سرور آمده باشد
                if (typeof errorDetail === 'string') {
                    throw new Error(errorDetail);
                }
                // اگر خطاهای ولیدیشن آمده باشد
                else if (typeof errorDetail === 'object') {
                    // بررسی خطای شماره تلفن تکراری
                    if (errorDetail.phone) {
                        const phoneError = Array.isArray(errorDetail.phone)
                            ? errorDetail.phone[0]
                            : errorDetail.phone;
                        throw new Error(phoneError);
                    }

                    // بررسی خطای نام کامل
                    if (errorDetail.full_name) {
                        const fullNameError = Array.isArray(errorDetail.full_name)
                            ? errorDetail.full_name[0]
                            : errorDetail.full_name;
                        throw new Error(fullNameError);
                    }

                    // بررسی خطای نوع کاربر
                    if (errorDetail.user_type) {
                        const userTypeError = Array.isArray(errorDetail.user_type)
                            ? errorDetail.user_type[0]
                            : errorDetail.user_type;
                        throw new Error(userTypeError);
                    }
                }
            }

            throw error;
        }
    },

    // مرحله دوم ثبت‌نام: تایید کد OTP
    validateOtp: async (token: string, code: string): Promise<RegisterValidateResponse> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

            // تنظیم تایم‌اوت برای درخواست
            const response = await axios.post<RegisterValidateResponse>(
                `${BASE_URL}/auth/register-otp-validate/${token}/`,
                { code },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            // فقط در صورت دریافت پاسخ با وضعیت موفق، توکن‌ها و اطلاعات کاربر را ذخیره کنیم
            if (response.status >= 200 && response.status < 300 && response.data.Detail && response.data.Detail.Token) {
                const { access, refresh } = response.data.Detail.Token;

                // لاگ کردن وضعیت ذخیره توکن‌ها
                cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, access, 30);
                cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, refresh, 30);

                // ثبت لاگ اطلاعات کاربر برای بررسی نوع کاربر
                if (response.data.Detail && response.data.Detail.User && response.data.Detail.User.user_type) {
                    console.log('[authService] اطلاعات کاربر از سرور:', {
                        user_type: response.data.Detail.User.user_type,
                        user_type_check: response.data.Detail.User.user_type === 'EM' ? 'کارفرما است' : 'کارفرما نیست'
                    });
                } else {
                    console.warn('[authService] نوع کاربر در پاسخ سرور یافت نشد');
                }
            } else {
                console.error('پاسخ نامعتبر از سرور:', {
                    status: response.status,
                    data: response.data,
                    timestamp: new Date().toISOString()
                });
                throw new Error('خطا در تایید کد: پاسخ نامعتبر از سرور');
            }

            return response.data;
        } catch (error: any) {
            console.error('خطا در تایید کد OTP:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                timestamp: new Date().toISOString()
            });

            // بررسی خطاهای شبکه
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNABORTED')) {
                throw new Error(translateNetworkError(error));
            }

            // بهبود مدیریت خطاها برای نمایش پیام‌های مناسب
            if (error.response) {
                console.error('خطای دریافت شده از سرور:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                    timestamp: new Date().toISOString()
                });

                // خطای اعتبارسنجی کد OTP
                if (error.response.data?.code) {
                    const codeError = Array.isArray(error.response.data.code)
                        ? error.response.data.code[0]
                        : error.response.data.code;
                    throw new Error(codeError);
                }

                // خطای OTP غیرفعال
                if (error.response.status === 400 || error.response.status === 401) {
                    throw new Error('کد تایید نامعتبر است یا منقضی شده است. لطفاً کد جدید درخواست کنید.');
                }
                // خطای توکن نامعتبر
                else if (error.response.status === 404) {
                    throw new Error('توکن نامعتبر است. لطفاً دوباره درخواست کد تایید کنید.');
                }
                // خطای سرور
                else if (error.response.status === 500) {
                    console.error('خطای سرور 500:', {
                        error: error.response.data,
                        timestamp: new Date().toISOString()
                    });
                    throw new Error('خطای سرور در تایید کد. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.');
                }
                // اضافه کردن بررسی خاص برای خطای 400 
                else if (error.response.status === 400) {
                    throw new Error('کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید.');
                }
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('زمان درخواست به پایان رسید. لطفاً دوباره تلاش کنید.');
            }

            // در صورت بروز سایر خطاها
            throw error;
        }
    },

    // تابع بروزرسانی نوع کاربر
    updateUserType: async (user_type: string): Promise<UserData> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

            const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
            if (!accessToken) {
                throw new Error('خطا در دسترسی: توکن معتبر یافت نشد');
            }

            // ابتدا از JWT توکن اطلاعات اولیه کاربر را استخراج می‌کنیم
            const jwtData = authService.decodeToken(accessToken);
            if (!jwtData || !jwtData.user_id) {
                throw new Error('خطا در دسترسی: اطلاعات کاربر یافت نشد');
            }

            // ارسال درخواست به API بروزرسانی پروفایل
            const response = await axios.patch<UserData>(
                `${BASE_URL}/users/${jwtData.username}/`,
                { user_type },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                // نمایش پیام موفقیت‌آمیز
                toast.success('نوع کاربری شما با موفقیت تغییر یافت');

                // بازخوانی مجدد اطلاعات کاربر برای اعمال تغییرات
                setTimeout(async () => {
                    await authService.getUserData();
                }, 1000);

                return response.data;
            } else {
                throw new Error('خطا در بروزرسانی نوع کاربر');
            }
        } catch (error: any) {
            console.error('خطا در بروزرسانی نوع کاربر:', error.response?.data || error.message);

            // بررسی خطاهای شبکه
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNABORTED')) {
                const errorMessage = translateNetworkError(error);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            // نمایش پیام خطا
            toast.error(error.response?.data?.message || 'خطا در بروزرسانی نوع کاربر، لطفاً دوباره تلاش کنید');

            throw error;
        }
    },

    // درخواست OTP برای ورود
    loginOtp: async (phone: string): Promise<string> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

            const response = await axios.post<RegisterOtpResponse>(
                `${BASE_URL}/auth/login-otp/`,
                { phone }
            );

            // نمایش کد تایید در صورت وجود
            if (response.data.Detail && response.data.Detail.code) {
                toast.success(`کد تایید ورود: ${response.data.Detail.code}`, {
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
            }

            // بازگرداندن توکن
            return response.data.Detail.token;
        } catch (error: any) {
            console.error('خطا در ارسال کد تایید برای ورود:', error.response?.data || error.message);

            // بررسی خطاهای شبکه
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNABORTED')) {
                throw new Error(translateNetworkError(error));
            }

            // بهبود مدیریت خطاها
            if (error.response?.data?.Detail) {
                const errorDetail = error.response.data.Detail;

                // اگر پیام خطا از سرور آمده باشد
                if (typeof errorDetail === 'string') {
                    throw new Error(errorDetail);
                }
                // اگر خطاهای ولیدیشن آمده باشد
                else if (typeof errorDetail === 'object') {
                    // بررسی خطای شماره تلفن
                    if (errorDetail.phone) {
                        const phoneError = Array.isArray(errorDetail.phone)
                            ? errorDetail.phone[0]
                            : errorDetail.phone;
                        throw new Error(phoneError);
                    }
                }
            }

            // اگر خطای ۴۰۴ باشد یعنی شماره تلفن وجود ندارد
            if (error.response?.status === 404) {
                throw new Error('شماره تلفن در سیستم ثبت نشده است.');
            }

            throw error;
        }
    },

    // تایید OTP برای ورود
    validateLoginOtp: async (token: string, code: string): Promise<UserData> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

            const response = await axios.post<TokenResponse | any>(
                `${BASE_URL}/auth/login-validate-otp/${token}/`,
                { code },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            // بررسی ساختار پاسخ سرور
            let accessToken = '';
            let refreshToken = '';
            let userData: UserData | null = null;

            // اگر پاسخ به صورت متعارف باشد (توکن‌ها در سطح بالایی)
            if (response.data && response.data.access && response.data.refresh) {
                accessToken = response.data.access;
                refreshToken = response.data.refresh;
            }
            // اگر پاسخ در ساختار Detail.Token باشد
            else if (response.data?.Detail?.Token) {
                accessToken = response.data.Detail.Token.access;
                refreshToken = response.data.Detail.Token.refresh;
                
                // اگر اطلاعات کاربر در پاسخ وجود داشته باشد
                if (response.data.Detail.User) {
                    userData = response.data.Detail.User;
                }
            }
            // اگر هیچ توکنی یافت نشد
            else {
                throw new Error('ساختار پاسخ سرور نامعتبر است. لطفاً دوباره تلاش کنید.');
            }

            // اطمینان از وجود توکن‌ها
            if (!accessToken || !refreshToken) {
                throw new Error('دریافت توکن با شکست مواجه شد. لطفاً دوباره تلاش کنید.');
            }

            // ذخیره توکن‌ها در کوکی با مدت انقضای مناسب
            cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, 30); // اکسس توکن برای 30 روز
            cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 30); // رفرش توکن برای 30 روز

            // اگر اطلاعات کاربر در پاسخ وجود داشت، از آن استفاده می‌کنیم
            if (userData) {
                // حذف تنظیم وضعیت ادمین در localStorage
                // const isAdmin = userData.user_type === 'AD';
                // setAdminStatus(isAdmin);
                
                // ذخیره در کش
                userDataCache = userData;
                userDataCacheTime = Date.now();
                
                // ذخیره در کوکی user_data با تابع جدید
                authService.storeUserDataInCookie(userData);
                
                return userData;
            }

            // دریافت اطلاعات کاربر با استفاده از توکن
            try {
                const userInfo = await authService.getUserData();
                
                if (userInfo) {
                    return userInfo;
                } else {
                    throw new Error('دریافت اطلاعات کاربر ناموفق بود');
                }
            } catch (userError: any) {
                // بازگرداندن یک اطلاعات کاربر پایه برای جلوگیری از شکست کامل فرآیند ورود
                return {
                    username: "user",
                    phone: "",
                    user_type: "JS", // کاربر پیش‌فرض به عنوان جوینده کار
                    full_name: "کاربر ماهرکار"
                };
            }
        } catch (error: any) {
            // بررسی خطاهای شبکه
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNABORTED')) {
                throw new Error(translateNetworkError(error));
            }

            // بررسی خطاهای اعتبارسنجی
            if (error.response?.data?.Detail) {
                const errorDetail = error.response.data.Detail;
                if (typeof errorDetail === 'string') {
                    if (errorDetail.includes('کد وارد شده اشتباه است') || 
                        errorDetail.includes('Invalid code') || 
                        errorDetail.includes('expired')) {
                        throw new Error('کد تایید وارد شده نامعتبر یا منقضی شده است. لطفاً دوباره تلاش کنید.');
                    }
                    throw new Error(errorDetail);
                }
            }
            
            // بررسی کدهای وضعیت HTTP
            if (error.response) {
                if (error.response.status === 400) {
                    throw new Error('کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید.');
                } else if (error.response.status === 401) {
                    throw new Error('کد تایید منقضی شده است. لطفاً دوباره درخواست کد کنید.');
                } else if (error.response.status === 404) {
                    throw new Error('درخواست نامعتبر است. لطفاً دوباره تلاش کنید.');
                }
            }
            
            throw new Error(error.message || 'خطا در تایید کد. لطفاً دوباره تلاش کنید.');
        }
    },

    // خروج کاربر
    logout: (): void => {
        try {
            // پاک کردن تمام کوکی‌های احراز هویت
            cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
            cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
            
            // حذف پاک کردن وضعیت ادمین از localStorage
            // clearAdminStatus();
            
            // پاک کردن کش
            userDataCache = null;
            userDataCacheTime = 0;
            
            // انتشار رویداد خروج برای به‌روزرسانی وضعیت احراز هویت در برنامه
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('logout'));
            }
        } catch (error) {
            console.error('[authService] خطا در خروج از سیستم:', error);
        }
    },

    // بررسی احراز هویت کاربر
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false; // اجرای سمت سرور
        return !!cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    },

    // دریافت اطلاعات کاربر
    getUserData: async (): Promise<UserData | null> => {
        try {
            // بررسی کش - اگر اطلاعات کاربر در کش موجود است و منقضی نشده، آن را برگردان
            const now = Date.now();
            if (userDataCache && (now - userDataCacheTime) < CACHE_DURATION) {
                return userDataCache;
            }

            const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
            const refreshToken = cookieService.getCookie(COOKIE_NAMES.REFRESH_TOKEN);

            if (!accessToken) {
                // اگر توکن دسترسی موجود نیست، ابتدا تلاش می‌کنیم با توکن رفرش، توکن جدید بگیریم
                if (refreshToken) {
                    try {
                        const newAccessToken = await authService.refreshAccessToken();
                        
                        if (!newAccessToken) {
                            throw new Error('دریافت توکن جدید ناموفق بود');
                        }
                        
                        // از توکن جدید استفاده می‌کنیم
                        const userData = await authService.fetchUserDataFromAPI(newAccessToken);
                        
                        // ذخیره در کش
                        if (userData) {
                            userDataCache = userData;
                            userDataCacheTime = Date.now();
                            
                            // حذف تنظیم وضعیت ادمین در localStorage
                            // const isAdmin = userData.user_type === 'AD';
                            // setAdminStatus(isAdmin);
                        }
                        
                        return userData;
                    } catch (refreshError: any) {
                        // اگر رفرش توکن منقضی شده، کوکی‌های مربوطه را حذف می‌کنیم
                        cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
                        cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
                        // کش را هم پاک می‌کنیم
                        userDataCache = null;
                        userDataCacheTime = 0;
                        return null;
                    }
                } else {
                    return null;
                }
            }
            
            // از توکن موجود استفاده می‌کنیم
            const userData = await authService.fetchUserDataFromAPI(accessToken);
            
            // ذخیره در کش
            if (userData) {
                userDataCache = userData;
                userDataCacheTime = Date.now();
                
                // حذف تنظیم وضعیت ادمین در localStorage
                // const isAdmin = userData.user_type === 'AD';
                // setAdminStatus(isAdmin);
            }
            
            return userData;
        } catch (error: any) {
            return null;
        }
    },

    // تابع جدید برای دریافت اطلاعات کاربر از API
    fetchUserDataFromAPI: async (accessToken: string): Promise<UserData | null> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
            
            // ابتدا تلاش می‌کنیم از مسیر /profiles/me/ اطلاعات کاربر را دریافت کنیم
            try {
                const profileResponse = await axios.get(`${BASE_URL}/profiles/me/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                if (profileResponse.status === 200 && profileResponse.data) {
                    // اطلاعات پروفایل را دریافت کردیم، حالا اطلاعات اصلی کاربر را از مسیر /users/ دریافت می‌کنیم
                    const userResponse = await axios.get(`${BASE_URL}/users/`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    
                    if (userResponse.status === 200 && userResponse.data) {
                        let userData = userResponse.data;
                        
                        // اگر سرور آرایه‌ای از کاربران برگرداند (برای ادمین‌ها)، کاربر ادمین را پیدا کن
                        if (Array.isArray(userData)) {
                            // برای ادمین‌ها، اطلاعات خودشان را از طریق توکن استخراج می‌کنیم
                            const decodedToken = authService.decodeToken(accessToken);
                            if (decodedToken && decodedToken.user_id) {
                                // پیدا کردن کاربر ادمین در آرایه
                                const adminUser = userData.find((user: any) => user.id === decodedToken.user_id);
                                if (adminUser) {
                                    userData = adminUser;
                                } else {
                                    // اگر پیدا نشد، اولین کاربر را بگیر (که احتمالاً خود ادمین است)
                                    userData = userData[0];
                                }
                            } else {
                                // اگر نتوانستیم از توکن استخراج کنیم، اولین کاربر را بگیر
                                userData = userData[0];
                            }
                        }
                        
                        // ترکیب اطلاعات کاربر با اطلاعات پروفایل
                        const combinedUserData = {
                            ...userData,
                            profile: profileResponse.data
                        };
                        
                        return combinedUserData;
                    }
                }
            } catch (profileError: any) {
                // اگر خطای 404 باشد (پروفایل وجود ندارد) یا خطای دیگری، از مسیر اصلی کاربران استفاده می‌کنیم
                console.log('[authService] مسیر پروفایل در دسترس نیست یا پروفایل وجود ندارد، استفاده از مسیر اصلی کاربران');
            }
            
            // استفاده از مسیر اصلی کاربران به عنوان fallback
            const response = await axios.get(`${BASE_URL}/users/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (response.status === 200 && response.data) {
                let userData = response.data;
                
                // اگر سرور آرایه‌ای از کاربران برگرداند (برای ادمین‌ها)، کاربر ادمین را پیدا کن
                if (Array.isArray(userData)) {
                    // برای ادمین‌ها، اطلاعات خودشان را از طریق توکن استخراج می‌کنیم
                    const decodedToken = authService.decodeToken(accessToken);
                    if (decodedToken && decodedToken.user_id) {
                        // پیدا کردن کاربر ادمین در آرایه
                        const adminUser = userData.find((user: any) => user.id === decodedToken.user_id);
                        if (adminUser) {
                            userData = adminUser;
                        } else {
                            // اگر پیدا نشد، اولین کاربر را بگیر (که احتمالاً خود ادمین است)
                            userData = userData[0];
                        }
                    } else {
                        // اگر نتوانستیم از توکن استخراج کنیم، اولین کاربر را بگیر
                        userData = userData[0];
                    }
                }
                
                return userData;
            }
            
            return null;
        } catch (error: any) {
            // اگر خطای 401 داشتیم، یعنی توکن منقضی شده است
            if (error.response?.status === 401) {
                // تلاش می‌کنیم با رفرش توکن، توکن جدید بگیریم
                try {
                    const newToken = await authService.refreshAccessToken();
                    
                    if (newToken) {
                        // تلاش مجدد با توکن جدید
                        return await authService.fetchUserDataFromAPI(newToken);
                    }
                } catch (refreshError: any) {
                    // حذف کش در صورت خطا
                    userDataCache = null;
                    userDataCacheTime = 0;
                }
                
                // اگر نتوانستیم توکن را رفرش کنیم، کوکی‌ها را پاک می‌کنیم
                cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
                cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
            }
            
            return null;
        }
    },

    // نوسازی توکن دسترسی با استفاده از توکن رفرش - پیاده‌سازی بهینه‌شده
    refreshAccessToken: async (): Promise<string | null> => {
        try {
            const refreshToken = cookieService.getCookie(COOKIE_NAMES.REFRESH_TOKEN);
            
            if (!refreshToken) {
                return null;
            }
            
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
            
            // استفاده از مسیر صحیح API برای رفرش توکن
            const response = await axios.post<{ access: string }>(
                `${BASE_URL}/api/token/refresh/`,
                { refresh: refreshToken },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (response.status === 200 && response.data.access) {
                const newAccessToken = response.data.access;
                
                // ذخیره توکن جدید با تاریخ انقضای 30 روز
                cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, 30);
                
                return newAccessToken;
            }
            
            return null;
        } catch (error: any) {
            // مدیریت خطاهای HTTP
            if (error.response) {
                const status = error.response.status;
                
                // اگر خطای اعتبارسنجی رخ داده است (401: توکن نامعتبر، 403: دسترسی ممنوع)
                if (status === 401 || status === 403) {
                    cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
                    cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
                    
                    // پاک کردن کش
                    userDataCache = null;
                    userDataCacheTime = 0;
                    
                    // انتشار رویداد خروج برای به‌روزرسانی وضعیت احراز هویت در برنامه
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('logout'));
                    }
                }
            }
            
            return null;
        }
    },

    // تایید اعتبار توکن فعلی و تازه کردن آن در صورت نیاز
    validateAndRefreshTokenIfNeeded: async (): Promise<boolean> => {
        try {
            const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
            
            // اگر توکن وجود ندارد، نمی‌توانیم ادامه دهیم
            if (!accessToken) {
                // تلاش برای رفرش توکن
                const newToken = await authService.refreshAccessToken();
                return !!newToken;
            }
            
            // بررسی اعتبار توکن با رمزگشایی آن و بررسی زمان انقضا
            const decoded = authService.decodeToken(accessToken);
            
            if (!decoded || !decoded.exp) {
                return false;
            }
            
            // زمان انقضای توکن را به میلی‌ثانیه تبدیل می‌کنیم
            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            
            // اگر توکن منقضی شده، آن را رفرش می‌کنیم
            if (expirationTime <= currentTime) {
                const newToken = await authService.refreshAccessToken();
                return !!newToken;
            }
            
            // اگر کمتر از 2 ساعت به انقضای توکن مانده، آن را رفرش می‌کنیم
            if (expirationTime - currentTime < 2 * 60 * 60 * 1000) {
                // رفرش توکن را در پس‌زمینه انجام می‌دهیم تا باعث تاخیر در UI نشود
                authService.refreshAccessToken().catch(error => {
                    // خطا را در کنسول نمایش می‌دهیم اما اجازه می‌دهیم کاربر با توکن فعلی ادامه دهد
                    console.error('خطا در رفرش توکن در پس‌زمینه:', error);
                });
            }
            
            // توکن معتبر است
            return true;
        } catch (error: any) {
            return false;
        }
    },

    // تابع دریافت توکن برای استفاده در درخواست‌ها
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null; // اجرای سمت سرور
        return cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    },

    // تابع جدید برای ذخیره اطلاعات کاربر در کوکی
    storeUserDataInCookie: (userData: UserData): void => {
        try {
            // ذخیره مستقیم در کوکی با استفاده از document.cookie
            if (typeof document !== 'undefined') {
                const jsonValue = encodeURIComponent(JSON.stringify(userData));
                const date = new Date();
                date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 روز
                const expires = `expires=${date.toUTCString()}`;
                document.cookie = `user_data=${jsonValue}; ${expires}; path=/; SameSite=Lax`;
                
                console.log('🔍 User data stored in cookie:', {
                    user_type: userData.user_type,
                    username: userData.username
                });
            }
        } catch (error) {
            console.error('🔍 Error storing user data in cookie:', error);
        }
    }
};

export default authService; 
