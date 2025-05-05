import React from 'react';
import { toast } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';

export interface ApiErrorData {
    Detail?: any;
    error?: string;
    message?: string;
    code?: string;
    [key: string]: any;
}

// پیکربندی توست (برای کنترل بهتر نمایش خطاها)
const toastConfig = {
    duration: 4000,
    style: {
        borderRadius: '8px',
        padding: '12px',
    }
};

/**
 * کلاس مدیریت خطاهای API
 * این کلاس روش‌های مختلفی برای پردازش و نمایش خطاهای دریافتی از API فراهم می‌کند
 */
export class ErrorHandler {
    // شناسه توست‌های فعال (برای جلوگیری از نمایش دوباره خطای مشابه)
    private static activeToastIds: Set<string> = new Set();

    /**
     * نگاشت خطاهای بک‌اند به پیام‌های کاربرپسند فارسی
     */
    private static errorMessages: Record<string, string> = {
        // خطاهای ورود
        'شماره تلفن موجود نیست': 'شماره تلفن یا رمز عبور اشتباه است',
        'رمز عبور اشتباه است': 'شماره تلفن یا رمز عبور اشتباه است',
        'شماره تلفن و رمز عبور هر دو الزامی هستند': 'لطفاً شماره تلفن و رمز عبور را وارد کنید',
        'کاربر فعال نیست': 'حساب کاربری شما غیرفعال است. لطفاً با پشتیبانی تماس بگیرید',
        'شما قبلاً وارد شده‌اید': 'شما قبلاً وارد سیستم شده‌اید',

        // خطاهای ثبت‌نام
        'Invalid OTP code.': 'کد تایید وارد شده نامعتبر است',
        'Inactive OTP': 'کد تایید منقضی شده است. لطفاً دوباره درخواست کد کنید',
        'OTP does not exist': 'کد تایید وجود ندارد. لطفاً دوباره درخواست کد کنید',
        'Otp register does not exist.': 'اطلاعات ثبت‌نام شما یافت نشد. لطفاً دوباره تلاش کنید',
        'You are already authenticated': 'شما قبلاً وارد سیستم شده‌اید',
        'You are already logged in': 'شما قبلاً وارد سیستم شده‌اید',

        // خطاهای اعتبارسنجی سریالایزر - LoginSerializer
        'این شماره تلفن قبلاً ثبت شده است': 'این شماره تلفن قبلاً ثبت شده است',
        'قبلا ثبت شده': 'این مقدار قبلاً ثبت شده است',
        'قبلاً ثبت شده': 'این مقدار قبلاً ثبت شده است',
        'already exists': 'این مقدار قبلاً ثبت شده است',
        'already registered': 'این مقدار قبلاً ثبت شده است',
        'already used': 'این مقدار قبلاً ثبت شده است',
        'وجود دارد': 'این مقدار قبلاً ثبت شده است',
        'exists': 'این مقدار قبلاً ثبت شده است',
        'تکراری': 'این مقدار تکراری است',

        // خطاهای بازیابی رمز عبور
        'رمز عبور باید حداقل ۸ کاراکتر باشد': 'رمز عبور باید حداقل ۸ کاراکتر باشد',
        'تکرار رمز عبور با رمز عبور مطابقت ندارد': 'تکرار رمز عبور با رمز عبور وارد شده مطابقت ندارد',

        // خطاهای عمومی HTTP
        '400': 'درخواست نامعتبر است. لطفاً اطلاعات را بررسی کرده و دوباره تلاش کنید',
        '401': 'لطفاً دوباره وارد سیستم شوید',
        '403': 'شما دسترسی لازم برای انجام این عملیات را ندارید',
        '404': 'اطلاعات درخواستی یافت نشد',
        '500': 'خطایی در سرور رخ داده است. لطفاً بعداً دوباره تلاش کنید',
        'network_error': 'اتصال به سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید'
    };

    /**
     * نگاشت نام‌های فیلدها به نام‌های فارسی
     */
    private static fieldNames: Record<string, string> = {
        'phone': 'شماره تلفن',
        'password': 'رمز عبور',
        'username': 'نام کاربری',
        'email': 'ایمیل',
        'code': 'کد تایید',
        'full_name': 'نام و نام خانوادگی',
        'password_conf': 'تکرار رمز عبور',
        'new_password': 'رمز عبور جدید',
        'confirm_password': 'تکرار رمز عبور جدید',
        'non_field_errors': 'خطای عمومی',
        '__all__': 'خطای عمومی'
    };

    /**
     * تبدیل خطای API به پیام کاربرپسند فارسی
     * @param errorMessage پیام خطای اصلی
     * @returns پیام خطای کاربرپسند فارسی
     */
    private static translateErrorMessage(errorMessage: string): string {
        return this.errorMessages[errorMessage] || errorMessage;
    }

    /**
     * نمایش خطا با جلوگیری از نمایش تکراری
     * @param message پیام خطا
     */
    private static showToast(message: string): void {
        // اگر این پیام قبلاً نمایش داده شده، نمایش ندهید
        if (this.activeToastIds.has(message)) {
            return;
        }

        // نمایش توست و ذخیره شناسه آن
        const id = toast.error(message, {
            ...toastConfig,
            id: message,
        });

        // اضافه کردن به لیست توست‌های فعال
        this.activeToastIds.add(message);

        // حذف از لیست پس از بسته شدن توست
        setTimeout(() => {
            this.activeToastIds.delete(message);
        }, toastConfig.duration);
    }

    /**
     * نمایش خطاهای API به صورت نوتیفیکیشن
     * @param error خطای دریافتی از API یا هر خطای دیگر
     * @param defaultMessage پیام پیش‌فرض در صورت عدم وجود پیام خطا
     */
    static showError(error: unknown, defaultMessage: string = 'خطایی رخ داد. لطفا دوباره تلاش کنید'): void {
        // در محیط توسعه، خطاها در کنسول نمایش داده شوند
        if (process.env.NODE_ENV !== 'production') {
            // از کنسول برای عیب‌یابی در محیط توسعه استفاده می‌کنیم
            // فقط در محیط توسعه فعال است
        }

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiErrorData>;
            const data = axiosError.response?.data;
            const status = axiosError.response?.status;

            // بررسی خطاهای بک‌اند با ساختار {error: 'پیام خطا'}
            if (data?.error) {
                this.showToast(this.translateErrorMessage(data.error));
                return;
            }

            // بررسی خطاهای OTP با ساختار {code: 'پیام خطا'}
            if (data?.code) {
                this.showToast(this.translateErrorMessage(data.code));
                return;
            }

            // بررسی خطاهای با ساختار {Detail: ...}
            if (data?.Detail) {
                // اگر Detail یک رشته باشد
                if (typeof data.Detail === 'string') {
                    this.showToast(this.translateErrorMessage(data.Detail));
                    return;
                }

                // اگر Detail یک آبجکت باشد (حالت خطاهای اعتبارسنجی)
                if (typeof data.Detail === 'object') {
                    // اگر Detail شامل Message باشد
                    if (data.Detail.Message) {
                        this.showToast(this.translateErrorMessage(data.Detail.Message));
                        return;
                    }

                    let hasShownError = false;
                    let errorMessages: string[] = [];

                    // بررسی خطاهای اعتبارسنجی فیلدها
                    Object.entries(data.Detail).forEach(([field, errorMessagesField]) => {
                        // برای تمام پیام‌های خطا (چه عمومی چه فیلدهای خاص)
                        if (Array.isArray(errorMessagesField)) {
                            errorMessagesField.forEach(msg => {
                                errorMessages.push(this.translateErrorMessage(msg));
                                hasShownError = true;
                            });
                        } else if (typeof errorMessagesField === 'string') {
                            errorMessages.push(this.translateErrorMessage(errorMessagesField));
                            hasShownError = true;
                        }
                    });

                    // نمایش پیام‌های خطا بدون تکرار
                    if (hasShownError) {
                        // نمایش پیام‌های خطای غیرتکراری
                        const uniqueErrors = Array.from(new Set(errorMessages));
                        uniqueErrors.forEach(errorMsg => {
                            this.showToast(errorMsg);
                        });
                        return;
                    }
                }
            }

            // بررسی خطاهای سریالایزر در ساختار مستقیم (خارج از Detail)
            if (typeof data === 'object' && data !== null) {
                let errorMessages: string[] = [];
                let hasShownError = false;

                Object.entries(data).forEach(([field, errorMessagesField]) => {
                    if (field !== 'Detail' && field !== 'error' && field !== 'message' && field !== 'code') {
                        if (Array.isArray(errorMessagesField)) {
                            errorMessagesField.forEach(msg => {
                                errorMessages.push(this.translateErrorMessage(msg));
                                hasShownError = true;
                            });
                        } else if (typeof errorMessagesField === 'string') {
                            errorMessages.push(this.translateErrorMessage(errorMessagesField));
                            hasShownError = true;
                        }
                    }
                });

                if (hasShownError) {
                    // نمایش پیام‌های خطای غیرتکراری
                    const uniqueErrors = Array.from(new Set(errorMessages));
                    uniqueErrors.forEach(errorMsg => {
                        this.showToast(errorMsg);
                    });
                    return;
                }
            }

            // خطاهای HTTP استاندارد
            if (status) {
                this.showToast(this.errorMessages[status.toString()] || defaultMessage);
                return;
            }

            // خطای شبکه
            if (axiosError.request && !axiosError.response) {
                this.showToast(this.errorMessages['network_error']);
                return;
            }
        }

        // برای خطاهای دیگر
        if (error instanceof Error) {
            this.showToast(this.translateErrorMessage(error.message) || defaultMessage);
            return;
        }

        // حالت پیش‌فرض
        this.showToast(defaultMessage);
    }

    /**
     * استخراج پیام خطا از پاسخ API برای یک فیلد خاص
     * @param error خطای دریافتی
     * @param fieldName نام فیلد
     * @returns پیام خطای مربوط به فیلد یا undefined
     */
    static getFieldError(error: unknown, fieldName: string): string | undefined {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiErrorData>;
            const data = axiosError.response?.data;

            // برای فیلدهای ورود
            if (fieldName === 'phone' || fieldName === 'password') {
                if (data?.error === 'شماره تلفن موجود نیست' || data?.error === 'رمز عبور اشتباه است') {
                    return fieldName === 'phone' ? 'شماره تلفن یا رمز عبور اشتباه است' : undefined;
                }
            }

            // بررسی خطاهای داخل ساختار Detail
            if (data?.Detail && typeof data.Detail === 'object' && data.Detail[fieldName]) {
                const fieldError = data.Detail[fieldName];
                if (Array.isArray(fieldError)) {
                    return this.translateErrorMessage(fieldError[0]);
                }
                return this.translateErrorMessage(String(fieldError));
            }

            // بررسی خطاهای مستقیم در بدنه پاسخ
            if (data && typeof data === 'object' && data[fieldName]) {
                const fieldError = data[fieldName];
                if (Array.isArray(fieldError)) {
                    return this.translateErrorMessage(fieldError[0]);
                }
                return this.translateErrorMessage(String(fieldError));
            }

            // بررسی خطای مربوط به کد OTP
            if (fieldName === 'code' && data?.code) {
                return this.translateErrorMessage(data.code);
            }
        }
        return undefined;
    }

    /**
     * بررسی می‌کند که آیا خطا به دلیل منقضی شدن توکن است
     * @param error خطای دریافتی
     * @returns true اگر توکن منقضی شده باشد
     */
    static isTokenExpired(error: unknown): boolean {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiErrorData>;

            if (axiosError.response?.status === 401) {
                const data = axiosError.response.data;

                // بررسی پیام‌های رایج برای توکن منقضی شده
                if (
                    data?.detail?.includes('token') ||
                    data?.detail?.includes('expired') ||
                    data?.error?.includes('token') ||
                    data?.error?.includes('expired')
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * روش قدیمی ساختن خطای مخصوص سرور برای نمایش در فرم‌ها
     * @deprecated استفاده از showError را به جای این متد توصیه می‌کنیم
     */
    static getServerError(error: unknown, defaultMessage: string = 'خطایی رخ داد. لطفا دوباره تلاش کنید'): string {
        // فقط یک پیام خطای خالی برمی‌گرداند بدون نمایش خطا
        // فقط برای سازگاری با کدهای قدیمی نگه داشته شده است
        // به جای این متد از showError استفاده کنید
        return '';
    }
}

export default ErrorHandler; 