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
    username?: string;
    email?: string;
    phone: string;
    password?: string;
    password_conf?: string;
    full_name?: string;
    user_type?: string;
    register_stage: 'request_otp' | 'validate_otp' | 'complete';
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

    // بررسی وجود نام کاربری در دیتابیس
    checkUsernameExists: async (username: string): Promise<boolean> => {
        try {
            console.log('بررسی تکراری بودن نام کاربری:', username);

            // ارسال درخواست برای بررسی نام کاربری
            const response = await axios.get(`${AUTH_URL}/check-username/?username=${encodeURIComponent(username)}`);

            // اگر پاسخ موفقیت‌آمیز باشد و exists در پاسخ وجود داشته باشد
            if (response.data && response.data.exists !== undefined) {
                console.log('نتیجه بررسی نام کاربری:', response.data.exists ? 'تکراری' : 'قابل استفاده');
                return response.data.exists;
            }

            // اگر پاسخ به صورت استاندارد نباشد، فرض می‌کنیم نام کاربری وجود ندارد
            return false;
        } catch (error: any) {
            console.error('خطا در بررسی نام کاربری:', error);

            // اگر API بررسی نام کاربری وجود نداشته باشد یا دسترسی به آن نباشد
            // در این حالت ادامه روند ثبت‌نام را اجازه می‌دهیم
            // بعداً در مرحله validateOtp خطای تکراری بودن را مدیریت می‌کنیم
            return false;
        }
    },

    // بررسی وجود ایمیل در دیتابیس
    checkEmailExists: async (email: string): Promise<boolean> => {
        try {
            console.log('بررسی تکراری بودن ایمیل:', email);

            // ارسال درخواست برای بررسی ایمیل
            const response = await axios.get(`${AUTH_URL}/check-email/?email=${encodeURIComponent(email)}`);

            // اگر پاسخ موفقیت‌آمیز باشد و exists در پاسخ وجود داشته باشد
            if (response.data && response.data.exists !== undefined) {
                console.log('نتیجه بررسی ایمیل:', response.data.exists ? 'تکراری' : 'قابل استفاده');
                return response.data.exists;
            }

            // اگر پاسخ به صورت استاندارد نباشد، فرض می‌کنیم ایمیل وجود ندارد
            return false;
        } catch (error: any) {
            console.error('خطا در بررسی ایمیل:', error);

            // اگر API بررسی ایمیل وجود نداشته باشد یا دسترسی به آن نباشد
            // در این حالت ادامه روند ثبت‌نام را اجازه می‌دهیم
            // بعداً در مرحله validateOtp خطای تکراری بودن را مدیریت می‌کنیم
            return false;
        }
    },

    // تابع ورود کاربر
    login: async (credentials: LoginCredentials): Promise<UserData> => {
        try {
            console.log('ارسال درخواست ورود با اطلاعات:', credentials);

            // ارسال درخواست ورود به API
            const response = await axios.post<TokenResponse>(
                `${AUTH_URL}/login/`,
                credentials
            );

            console.log('پاسخ API برای درخواست ورود:', response.data);

            // ذخیره توکن‌ها در کوکی با مدت انقضای 30 روز
            cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, response.data.access, 30);
            cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, response.data.refresh, 30);

            // دریافت اطلاعات کاربر با استفاده از توکن دسترسی
            try {
                // تنظیم هدر authorization برای درخواست بعدی
                const userResponse = await axios.get<UserData>(`${AUTH_URL}/user/`, {
                    headers: {
                        'Authorization': `Bearer ${response.data.access}`
                    }
                });

                console.log('اطلاعات کاربر دریافت شد:', userResponse.data);

                // ذخیره اطلاعات کاربر در کوکی
                cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, userResponse.data, 30);

                // برگرداندن اطلاعات کاربر
                return userResponse.data;
            } catch (userError) {
                console.error('خطا در دریافت اطلاعات کاربر:', userError);
                // در صورت خطا در دریافت اطلاعات کاربر، هنوز احراز هویت موفق بوده است
                // یک ساختار پایه برای اطلاعات کاربر بر اساس شماره تلفن ایجاد می‌کنیم
                const basicUserData: UserData = {
                    username: '',
                    email: '',
                    phone: credentials.phone,
                    user_type: 'JS' // نوع کاربر پیش‌فرض
                };

                // ذخیره اطلاعات پایه در کوکی
                cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, basicUserData, 30);

                return basicUserData;
            }
        } catch (error: any) {
            console.error('خطا در ورود:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله اول ثبت‌نام: درخواست کد OTP
    registerOtp: async (userData: RegisterData): Promise<RegisterOtpResponse> => {
        try {
            console.log('ارسال درخواست کد تایید با اطلاعات کاربر:', userData);

            // آماده‌سازی داده‌های ارسالی براساس مرحله ثبت‌نام
            const dataToSend = {
                ...userData,
                register_stage: userData.register_stage || 'request_otp'
            };

            console.log('اطلاعات نهایی ارسالی به سرور:', dataToSend);

            const response = await axios.post<RegisterOtpResponse>(
                `${AUTH_URL}/register-otp/`,
                dataToSend
            );

            console.log('پاسخ API برای درخواست کد تایید:', response.data);

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

            return response.data;
        } catch (error: any) {
            console.error('خطا در ارسال کد تایید:', error.response?.data || error.message);
            throw error;
        }
    },

    // مرحله دوم ثبت‌نام: تایید کد OTP
    validateOtp: async (token: string, code: string): Promise<RegisterValidateResponse> => {
        try {
            console.log('شروع فرآیند تایید OTP:', {
                token: token.substring(0, 10) + '...',
                codeLength: code.length,
                timestamp: new Date().toISOString()
            });

            // تنظیم تایم‌اوت برای درخواست
            const response = await axios.post<RegisterValidateResponse>(
                `${AUTH_URL}/register-otp-validate/${token}/`,
                { code },
                {
                    timeout: 10000, // 10 ثانیه تایم‌اوت
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('پاسخ دریافتی از API پس از تایید کد OTP:', {
                status: response.status,
                hasToken: !!response.data?.Detail?.Token,
                hasUser: !!response.data?.Detail?.User,
                timestamp: new Date().toISOString()
            });

            // فقط در صورت دریافت پاسخ با وضعیت موفق، توکن‌ها و اطلاعات کاربر را ذخیره کنیم
            if (response.status >= 200 && response.status < 300 && response.data.Detail && response.data.Detail.Token) {
                const { access, refresh } = response.data.Detail.Token;

                // لاگ کردن وضعیت ذخیره توکن‌ها
                console.log('ذخیره توکن‌های دسترسی:', {
                    hasAccessToken: !!access,
                    hasRefreshToken: !!refresh,
                    timestamp: new Date().toISOString()
                });

                cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, access, 30);
                cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, refresh, 30);

                // ذخیره اطلاعات کاربر با مدت انقضای 30 روز
                if (response.data.Detail && response.data.Detail.User) {
                    cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, response.data.Detail.User, 30);
                    console.log('اطلاعات کاربر با موفقیت ذخیره شد:', {
                        username: response.data.Detail.User.username,
                        phone: response.data.Detail.User.phone,
                        userType: response.data.Detail.User.user_type,
                        timestamp: new Date().toISOString()
                    });
                }

                console.log('ثبت‌نام با موفقیت تکمیل شد و کاربر احراز هویت شد');
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

            // بهبود مدیریت خطاها برای نمایش پیام‌های مناسب
            if (error.response) {
                console.error('خطای دریافت شده از سرور:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                    timestamp: new Date().toISOString()
                });

                // تبدیل پاسخ خطا به رشته برای جستجوی الگوها
                const errorResponseStr = JSON.stringify(error.response.data).toLowerCase();

                // بررسی خطای IntegrityError که از سمت Django با کد 500 ارسال می‌شود
                if (error.response.status === 500 &&
                    (errorResponseStr.includes('integrityerror') ||
                        errorResponseStr.includes('unique constraint'))) {

                    console.error('خطای یکتایی داده:', {
                        error: error.response.data,
                        timestamp: new Date().toISOString()
                    });

                    // تشخیص نوع خطای یکتایی (ایمیل، نام کاربری یا سایر)
                    if (errorResponseStr.includes('users_user.username')) {
                        console.error('خطای تکراری بودن نام کاربری');
                        throw new Error('نام کاربری انتخابی شما قبلاً در سیستم ثبت شده است. لطفاً به مرحله قبل برگردید و نام کاربری دیگری انتخاب کنید.');
                    } else if (errorResponseStr.includes('users_user.email')) {
                        console.error('خطای تکراری بودن ایمیل');
                        throw new Error('ایمیل انتخابی شما قبلاً در سیستم ثبت شده است. لطفاً به مرحله قبل برگردید و ایمیل دیگری وارد کنید.');
                    } else if (errorResponseStr.includes('users_user.phone')) {
                        console.error('خطای تکراری بودن شماره تلفن');
                        throw new Error('شماره تلفن انتخابی شما قبلاً در سیستم ثبت شده است. لطفاً به مرحله اول برگردید و شماره تلفن دیگری وارد کنید.');
                    } else {
                        console.error('خطای یکتایی نامشخص');
                        throw new Error('اطلاعات وارد شده تکراری است. لطفاً به مرحله قبل برگردید و اطلاعات خود را بررسی کنید.');
                    }
                }
                // بررسی خطاهای مختلف برای ارائه پیام مناسب
                else if (error.response.status === 400 || error.response.status === 401) {
                    throw new Error('کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید.');
                } else if (error.response.status === 404) {
                    throw new Error('توکن نامعتبر است. لطفاً دوباره درخواست کد تایید کنید.');
                } else if (error.response.status === 500) {
                    console.error('خطای سرور 500:', {
                        error: error.response.data,
                        timestamp: new Date().toISOString()
                    });
                    throw new Error('خطای سرور در تایید کد. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.');
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
            console.log(`شروع فرآیند بروزرسانی نوع کاربر به ${user_type}`);

            const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
            if (!accessToken) {
                throw new Error('خطا در دسترسی: توکن معتبر یافت نشد');
            }

            // ارسال درخواست به API بروزرسانی پروفایل
            const response = await axios.patch<UserData>(
                `${AUTH_URL}/user/update-profile/`,
                { user_type },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                console.log('نوع کاربر با موفقیت بروزرسانی شد:', response.data);

                // بروزرسانی اطلاعات کاربر در کوکی
                const userData = cookieService.getObjectCookie<UserData>(COOKIE_NAMES.USER_DATA);
                if (userData) {
                    const updatedUserData = { ...userData, user_type };
                    cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, updatedUserData, 30);
                }

                // نمایش پیام موفقیت‌آمیز
                toast.success('نوع کاربری شما با موفقیت تغییر یافت');

                return response.data;
            } else {
                throw new Error('خطا در بروزرسانی نوع کاربر');
            }
        } catch (error: any) {
            console.error('خطا در بروزرسانی نوع کاربر:', error.response?.data || error.message);

            // نمایش پیام خطا
            toast.error(error.response?.data?.message || 'خطا در بروزرسانی نوع کاربر، لطفاً دوباره تلاش کنید');

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