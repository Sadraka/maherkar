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
    email: string;
    phone: string;
    user_type: string;
    full_name?: string;
    last_login?: string;
    user_type_original?: string;
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

// سرویس احراز هویت
const authService = {
    // استفاده از تابع رمزگشایی توکن
    decodeToken,

    // بررسی وجود شماره تلفن در دیتابیس با استفاده از API ورود
    checkPhoneExists: async (phone: string): Promise<boolean> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
            
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
            // console.log('ارسال درخواست کد تایید با اطلاعات کاربر:', userData);
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

            const response = await axios.post<RegisterOtpResponse>(
                `${BASE_URL}/auth/register-otp/`,
                userData
            );

            // console.log('پاسخ API برای درخواست کد تایید:', response.data);

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
            // console.log('شروع فرآیند تایید OTP:', {
            //     token: token.substring(0, 10) + '...',
            //     codeLength: code.length,
            //     timestamp: new Date().toISOString()
            // });
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

            // تنظیم تایم‌اوت برای درخواست
            const response = await axios.post<RegisterValidateResponse>(
                `${BASE_URL}/auth/register-otp-validate/${token}/`,
                { code },
                {
                    timeout: 10000, // 10 ثانیه تایم‌اوت
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            // console.log('پاسخ دریافتی از API پس از تایید کد OTP:', {
            //     status: response.status,
            //     hasToken: !!response.data?.Detail?.Token,
            //     hasUser: !!response.data?.Detail?.User,
            //     timestamp: new Date().toISOString()
            // });

            // فقط در صورت دریافت پاسخ با وضعیت موفق، توکن‌ها و اطلاعات کاربر را ذخیره کنیم
            if (response.status >= 200 && response.status < 300 && response.data.Detail && response.data.Detail.Token) {
                const { access, refresh } = response.data.Detail.Token;

                // لاگ کردن وضعیت ذخیره توکن‌ها
                // console.log('ذخیره توکن‌های دسترسی:', {
                //     hasAccessToken: !!access,
                //     hasRefreshToken: !!refresh,
                //     timestamp: new Date().toISOString()
                // });

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

                // console.log('ثبت‌نام با موفقیت تکمیل شد و کاربر احراز هویت شد');
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
            // console.log(`شروع فرآیند بروزرسانی نوع کاربر به ${user_type}`);
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

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
                `${BASE_URL}/users/user/${jwtData.username}/`,
                { user_type },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                // console.log('نوع کاربر با موفقیت بروزرسانی شد:', response.data);

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
            // console.log('ارسال درخواست OTP برای ورود با شماره:', phone);
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

            const response = await axios.post<RegisterOtpResponse>(
                `${BASE_URL}/auth/login-otp/`,
                { phone }
            );

            // console.log('پاسخ API برای درخواست OTP ورود:', response.data);

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
            console.log('[authService] شروع فرآیند تایید OTP برای ورود', { 
                tokenExists: !!token, 
                codeLength: code?.length 
            });

            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

            // تنظیم تایم‌اوت برای درخواست
            const response = await axios.post<TokenResponse | any>(
                `${BASE_URL}/auth/login-validate-otp/${token}/`,
                { code },
                {
                    timeout: 15000, // 15 ثانیه تایم‌اوت
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('[authService] پاسخ دریافتی از API تایید OTP:', {
                status: response.status,
                hasTokenData: !!(response.data?.access || response.data?.Detail?.Token),
                hasUserData: !!(response.data?.Detail?.User),
            });

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
                    console.log('[authService] اطلاعات کاربر از پاسخ:', {
                        userType: userData?.user_type || 'نامشخص',
                        phone: userData?.phone ? userData.phone.substring(0, 4) + '****' : 'نامشخص'
                    });
                }
            }
            // اگر هیچ توکنی یافت نشد
            else {
                console.error('[authService] ساختار پاسخ سرور نامعتبر است:', response.data);
                throw new Error('ساختار پاسخ سرور نامعتبر است. لطفاً دوباره تلاش کنید.');
            }

            // اطمینان از وجود توکن‌ها
            if (!accessToken || !refreshToken) {
                console.error('[authService] توکن‌ها در پاسخ سرور یافت نشد:', response.data);
                throw new Error('دریافت توکن با شکست مواجه شد. لطفاً دوباره تلاش کنید.');
            }

            // ذخیره توکن‌ها در کوکی با مدت انقضای مناسب
            cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, 1); // اکسس توکن برای 1 روز
            cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 30); // رفرش توکن برای 30 روز

            // اگر اطلاعات کاربر در پاسخ وجود داشت، از آن استفاده می‌کنیم
            if (userData) {
                // بررسی و مپ کردن نوع کاربر
                if (userData.user_type === 'EM') {
                    return {
                        ...userData,
                        user_type_original: userData.user_type,
                        user_type: 'employer'
                    };
                }
                return userData;
            }

            // دریافت اطلاعات کاربر با استفاده از توکن
            try {
                console.log('[authService] تلاش برای دریافت اطلاعات کاربر با تابع getUserData');
                const userInfo = await authService.getUserData();
                
                if (userInfo) {
                    console.log('[authService] اطلاعات کاربر با موفقیت دریافت شد');
                    return userInfo;
                } else {
                    throw new Error('دریافت اطلاعات کاربر ناموفق بود');
                }
            } catch (userError: any) {
                console.error('[authService] خطا در دریافت اطلاعات کاربر:', userError.message);
                
                // بازگرداندن یک اطلاعات کاربر پایه برای جلوگیری از شکست کامل فرآیند ورود
                return {
                    username: "user",
                    email: "",
                    phone: "",
                    user_type: "JS", // کاربر پیش‌فرض به عنوان جوینده کار
                    full_name: "کاربر ماهرکار"
                };
            }
        } catch (error: any) {
            console.error('[authService] خطا در تایید کد OTP برای ورود:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

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
            // حذف ارجاع به کوکی اطلاعات کاربر که دیگر استفاده نمی‌شود
            
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
            const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
            const refreshToken = cookieService.getCookie(COOKIE_NAMES.REFRESH_TOKEN);

            if (!accessToken) {
                // اگر توکن دسترسی موجود نیست، ابتدا تلاش می‌کنیم با توکن رفرش، توکن جدید بگیریم
                if (refreshToken) {
                    try {
                        console.log('[authService] تلاش برای دریافت توکن جدید با رفرش توکن');
                        const newAccessToken = await authService.refreshAccessToken();
                        
                        if (!newAccessToken) {
                            throw new Error('دریافت توکن جدید ناموفق بود');
                        }
                        
                        // از توکن جدید استفاده می‌کنیم
                        return await authService.fetchUserDataFromAPI(newAccessToken);
                    } catch (refreshError: any) {
                        console.error('[authService] خطا در رفرش توکن:', refreshError.message);
                        // اگر رفرش توکن منقضی شده، کوکی‌های مربوطه را حذف می‌کنیم
                        cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
                        cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
                        // دیگر اطلاعات کاربر را در کوکی ذخیره نمی‌کنیم
                        return null;
                    }
                } else {
                    console.error('[authService] توکن دسترسی و رفرش توکن موجود نیست');
                    return null;
                }
            }
            
            // از توکن موجود استفاده می‌کنیم
            return await authService.fetchUserDataFromAPI(accessToken);
        } catch (error: any) {
            console.error('[authService] خطای کلی در دریافت اطلاعات کاربر:', error.message);
            return null;
        }
    },

    // تابع جدید برای دریافت اطلاعات کاربر از API
    fetchUserDataFromAPI: async (accessToken: string): Promise<UserData | null> => {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
            
            const response = await axios.get(`${BASE_URL}/users/user/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                timeout: 8000
            });
            
            if (response.status === 200 && response.data) {
                const userData = response.data;
                
                console.log('[authService] اطلاعات کاربر با موفقیت دریافت شد:', {
                    userType: userData.user_type,
                    hasUsername: !!userData.username
                });
                
                // دیگر اطلاعات کاربر را در کوکی ذخیره نمی‌کنیم
                
                // بررسی و مپ کردن نوع کاربر
                if (userData.user_type === 'EM') {
                    return {
                        ...userData,
                        user_type: 'employer',
                        user_type_original: userData.user_type
                    };
                }
                
                return userData;
            }
            
            // اگر به اینجا رسیدیم، یعنی پاسخ معتبر نبوده است
            console.error('[authService] پاسخ نامعتبر از API کاربر');
            return null;
        } catch (error: any) {
            console.error('[authService] خطا در فراخوانی API کاربر:', error.message);
            
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
                    console.error('[authService] خطا در رفرش توکن پس از 401:', refreshError.message);
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
                console.log('[authService] رفرش توکن موجود نیست');
                return null;
            }
            
            console.log('[authService] تلاش برای نوسازی توکن دسترسی');
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
            
            // استفاده از مسیر صحیح API برای رفرش توکن
            const response = await axios.post<{ access: string }>(
                `${BASE_URL}/api/token/refresh/`,
                { refresh: refreshToken },
                {
                    timeout: 8000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (response.status === 200 && response.data.access) {
                const newAccessToken = response.data.access;
                
                // ذخیره توکن جدید با تاریخ انقضای کوتاه‌تر (1 روز)
                cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, 1);
                console.log('[authService] توکن دسترسی با موفقیت نوسازی شد');
                
                return newAccessToken;
            }
            
            console.error('[authService] پاسخ نامعتبر از سرور برای رفرش توکن:', response);
            return null;
        } catch (error: any) {
            console.error('[authService] خطا در نوسازی توکن دسترسی:', error.message);
            
            // مدیریت خطاهای HTTP
            if (error.response) {
                const status = error.response.status;
                
                // اگر خطای اعتبارسنجی رخ داده است (401: توکن نامعتبر، 403: دسترسی ممنوع)
                if (status === 401 || status === 403) {
                    console.log('[authService] توکن رفرش نامعتبر است، کوکی‌ها را حذف می‌کنیم');
                    cookieService.deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
                    cookieService.deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
                    // حذف ارجاع به کوکی اطلاعات کاربر که دیگر استفاده نمی‌شود
                    
                    // انتشار رویداد خروج برای به‌روزرسانی وضعیت احراز هویت در برنامه
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('logout'));
                    }
                }
                
                // خطاهای شبکه و سرور
                if (status >= 500) {
                    console.error('[authService] خطای سرور در فرآیند رفرش توکن:', error.response.data);
                }
            } else if (error.request) {
                // خطای شبکه (بدون پاسخ از سرور)
                console.error('[authService] خطای شبکه در فرآیند رفرش توکن - بدون پاسخ از سرور');
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
                console.log('[authService] توکن دسترسی موجود نیست، تلاش برای رفرش');
                
                // تلاش برای رفرش توکن
                const newToken = await authService.refreshAccessToken();
                return !!newToken;
            }
            
            // بررسی اعتبار توکن با رمزگشایی آن و بررسی زمان انقضا
            const decoded = authService.decodeToken(accessToken);
            
            if (!decoded || !decoded.exp) {
                console.warn('[authService] توکن JWT فاقد زمان انقضا است');
                return false;
            }
            
            // زمان انقضای توکن را به میلی‌ثانیه تبدیل می‌کنیم
            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            
            // اگر کمتر از 5 دقیقه به انقضای توکن مانده، آن را رفرش می‌کنیم
            if (expirationTime - currentTime < 5 * 60 * 1000) {
                console.log('[authService] توکن نزدیک به انقضا است، تلاش برای رفرش');
                
                const newToken = await authService.refreshAccessToken();
                return !!newToken;
            }
            
            // توکن معتبر است
            return true;
        } catch (error: any) {
            console.error('[authService] خطا در بررسی اعتبار توکن:', error.message);
            return false;
        }
    },

    // تابع دریافت توکن برای استفاده در درخواست‌ها
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null; // اجرای سمت سرور
        return cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    }
};

export default authService; 