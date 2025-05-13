import axios from 'axios';
import { toast } from 'react-hot-toast';

// آدرس API احراز هویت
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8000/auth';

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
            // console.log('خطا: درخواست بررسی وجود شماره تلفن نباید موفقیت‌آمیز باشد');
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
                        // console.log('شماره تلفن در دیتابیس وجود ندارد');
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
                            // console.log('شماره تلفن در دیتابیس وجود دارد');
                            return true;
                        }
                    }
                }
            }

            // در صورت خطای شبکه، پیامی را نمایش می‌دهیم و خطا را مجدداً پرتاب می‌کنیم
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))) {
                throw new Error(translateNetworkError(error));
            }

            // در صورت عدم تشخیص دقیق، پیش‌فرض: شماره تلفن وجود ندارد
            // console.log('خطا در بررسی وجود شماره تلفن:', error);
            return false;
        }
    },

    // مرحله اول ثبت‌نام: درخواست کد OTP
    registerOtp: async (userData: RegisterData): Promise<string> => {
        try {
            // console.log('ارسال درخواست کد تایید با اطلاعات کاربر:', userData);

            const response = await axios.post<RegisterOtpResponse>(
                `${AUTH_URL}/register-otp/`,
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

                // ذخیره اطلاعات کاربر با مدت انقضای 30 روز
                if (response.data.Detail && response.data.Detail.User) {
                    cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, response.data.Detail.User, 30);
                    // console.log('اطلاعات کاربر با موفقیت ذخیره شد:', {
                    //     phone: response.data.Detail.User.phone,
                    //     userType: response.data.Detail.User.user_type,
                    //     timestamp: new Date().toISOString()
                    // });
                }

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
                // console.log('نوع کاربر با موفقیت بروزرسانی شد:', response.data);

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

            const response = await axios.post<RegisterOtpResponse>(
                `${AUTH_URL}/login-otp/`,
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
            // console.log('شروع فرآیند تایید OTP برای ورود:', {
            //     token: token.substring(0, 10) + '...',
            //     codeLength: code.length,
            //     timestamp: new Date().toISOString()
            // });

            // تنظیم تایم‌اوت برای درخواست
            const response = await axios.post<TokenResponse | any>(
                `${AUTH_URL}/login-validate-otp/${token}/`,
                { code },
                {
                    timeout: 10000, // 10 ثانیه تایم‌اوت
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            // console.log('پاسخ دریافتی از API پس از تایید کد OTP برای ورود:', {
            //     status: response.status,
            //     data: response.data,
            //     timestamp: new Date().toISOString()
            // });

            // بررسی ساختار پاسخ سرور
            let accessToken = '';
            let refreshToken = '';

            // اگر پاسخ به صورت متعارف باشد (توکن‌ها در سطح بالایی)
            if (response.data && response.data.access && response.data.refresh) {
                accessToken = response.data.access;
                refreshToken = response.data.refresh;
            }
            // اگر پاسخ در ساختار Detail.Token باشد
            else if (response.data?.Detail?.Token) {
                accessToken = response.data.Detail.Token.access;
                refreshToken = response.data.Detail.Token.refresh;
            }
            // اگر هیچ توکنی یافت نشد
            else {
                throw new Error('ساختار پاسخ سرور نامعتبر است. لطفاً دوباره تلاش کنید.');
            }

            // اطمینان از وجود توکن‌ها
            if (!accessToken || !refreshToken) {
                console.error('توکن‌ها در پاسخ سرور یافت نشد:', response.data);
                throw new Error('دریافت توکن با شکست مواجه شد. لطفاً دوباره تلاش کنید.');
            }

            // ذخیره توکن‌ها در کوکی با مدت انقضای 30 روز
            cookieService.setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, 30);
            cookieService.setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 60);

            // اول بررسی می‌کنیم آیا اطلاعات کاربر در پاسخ وجود دارد
            if (response.data?.Detail?.User) {
                const userData = response.data.Detail.User;
                cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, userData, 30);
                // console.log('اطلاعات کاربر از پاسخ سرور دریافت شد:', userData);
                return userData;
            }

            // دریافت اطلاعات کاربر با استفاده از توکن دسترسی
            try {
                // تنظیم هدر authorization برای درخواست بعدی
                const userResponse = await axios.get<UserData>(`${AUTH_URL}/user/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                // console.log('اطلاعات کاربر دریافت شد:', userResponse.data);

                // ذخیره اطلاعات کاربر در کوکی
                cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, userResponse.data, 30);

                // برگرداندن اطلاعات کاربر
                return userResponse.data;
            } catch (userError: any) {
                console.error('خطا در دریافت اطلاعات کاربر:', userError);

                // بررسی خطاهای شبکه در درخواست دوم
                if (!userError.response && (userError.code === 'ERR_NETWORK' || userError.message?.includes('Network Error') || userError.code === 'ECONNABORTED')) {
                    throw new Error(translateNetworkError(userError));
                }

                // تلاش برای استخراج اطلاعات اساسی کاربر از پیلود JWT
                try {
                    const payloadBase64 = accessToken.split('.')[1];
                    const payload = JSON.parse(atob(payloadBase64));
                    // console.log('استخراج اطلاعات از JWT:', payload);

                    // ساخت اطلاعات اولیه کاربر از طریق پیلود JWT
                    const basicUserData: UserData = {
                        username: payload.username || '',
                        email: payload.email || '',
                        phone: payload.phone || '',
                        user_type: payload.user_type || 'JS', // نوع کاربر پیش‌فرض
                        full_name: payload.full_name || '',
                        user_type_original: payload.user_type || 'JS'
                    };

                    // ذخیره اطلاعات پایه در کوکی
                    cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, basicUserData, 30);

                    // console.log('اطلاعات پایه کاربر استخراج و ذخیره شد:', basicUserData);

                    // برگرداندن اطلاعات پایه کاربر
                    return basicUserData;
                } catch (jwtError) {
                    console.error('خطا در استخراج اطلاعات از JWT:', jwtError);

                    // در صورت نبود هیچ داده‌ای، یک ساختار پایه برمی‌گردانیم تا حداقل ورود موفق باشد
                    const emptyUserData: UserData = {
                        username: '',
                        email: '',
                        phone: '',
                        user_type: 'JS',
                        user_type_original: 'JS'
                    };

                    // ذخیره اطلاعات خالی در کوکی
                    cookieService.setObjectCookie(COOKIE_NAMES.USER_DATA, emptyUserData, 30);

                    // بازگرداندن اطلاعات خالی کاربر
                    return emptyUserData;
                }
            }
        } catch (error: any) {
            console.error('خطا در تایید کد OTP برای ورود:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                timestamp: new Date().toISOString()
            });

            // بررسی خطاهای شبکه
            if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNABORTED')) {
                throw new Error(translateNetworkError(error));
            }

            // بهبود مدیریت خطاها
            if (error.response) {
                // بررسی ساختار پاسخ خطا
                if (error.response.data) {
                    // خطای اعتبارسنجی کد OTP
                    if (error.response.data.code) {
                        const codeError = Array.isArray(error.response.data.code)
                            ? error.response.data.code[0]
                            : error.response.data.code;
                        throw new Error(codeError);
                    }

                    // خطاهای ساختار Detail
                    if (error.response.data.Detail) {
                        if (typeof error.response.data.Detail === 'string') {
                            throw new Error(error.response.data.Detail);
                        } else if (typeof error.response.data.Detail === 'object') {
                            if (error.response.data.Detail.code) {
                                const codeError = Array.isArray(error.response.data.Detail.code)
                                    ? error.response.data.Detail.code[0]
                                    : error.response.data.Detail.code;
                                throw new Error(codeError);
                            }
                        }
                    }

                    // خطاهای non_field_errors
                    if (error.response.data.non_field_errors) {
                        const nonFieldError = Array.isArray(error.response.data.non_field_errors)
                            ? error.response.data.non_field_errors[0]
                            : error.response.data.non_field_errors;
                        throw new Error(nonFieldError);
                    }
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
                    throw new Error('خطای سرور در تایید کد. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.');
                }
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('زمان درخواست به پایان رسید. لطفاً دوباره تلاش کنید.');
            }

            // در صورت بروز سایر خطاها
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

    // دریافت اطلاعات کاربر از کوکی
    getUserData: (): UserData | null => {
        try {
            const userData = cookieService.getObjectCookie<UserData>(COOKIE_NAMES.USER_DATA);
            
            // نگاشت نوع کاربر ارسال شده از سرور به مقادیر مورد نیاز فرانت‌اند
            if (userData) {
                console.log('[authService] getUserData - نوع کاربر خوانده شده از کوکی:', userData.user_type);
                
                // اگر کاربر نوع EM باشد، برای استفاده در فرانت‌اند باید به employer تبدیل شود
                // این تغییر فقط روی داده بازگشتی اعمال می‌شود و اصل داده در کوکی تغییر نمی‌کند
                if (userData.user_type === 'EM') {
                    return {
                        ...userData,
                        user_type_original: userData.user_type, // حفظ مقدار اصلی برای دیباگ
                        user_type: 'employer' // تبدیل به مقدار مورد نیاز فرانت‌اند
                    };
                }
            }
            
            return userData;
        } catch (error) {
            console.error('خطا در بازیابی اطلاعات کاربر از کوکی:', error);
            return null;
        }
    },

    // تابع دریافت توکن برای استفاده در درخواست‌ها
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null; // اجرای سمت سرور
        return cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    }
};

export default authService; 