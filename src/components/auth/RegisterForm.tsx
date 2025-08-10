'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    CircularProgress,
    Link as MuiLink,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    Stepper,
    Step,
    StepLabel,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { StepIconProps } from '@mui/material/StepIcon';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EditIcon from '@mui/icons-material/Edit';
import { useAuthStore, useAuthActions, useAuthStatus } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EMPLOYER_THEME, JOB_SEEKER_THEME } from '@/constants/colors';
import { ErrorHandler } from '@/components/common/ErrorHandler';
import { toast } from 'react-hot-toast';
import OtpInput from '@/components/common/OtpInput';
import NumberTextField from '../common/NumberTextField';

    // تبدیل اعداد انگلیسی به فارسی
const toPersianNumbers = (str: string | number): string => {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/[0-9]/g, match => persianDigits[parseInt(match)]);
};

interface RegisterFormProps {
    onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
    // استفاده از Zustand به جای Context API
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { registerOtp, validateOtp, checkPhoneExists } = useAuthActions();
    const { loading, registerError, verifyError } = useAuthStatus();
    
    const router = useRouter();
    const employerColors = EMPLOYER_THEME;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // تمام useState ها در ابتدا
    const [viewportHeight, setViewportHeight] = useState('100vh');
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [isFullNameFocused, setIsFullNameFocused] = useState(false);
    const [inlineUserSubmitPressed, setInlineUserSubmitPressed] = useState(false);
    const [isOtpFocusedStep3, setIsOtpFocusedStep3] = useState(false);
    const [inlineOtpSubmitPressedStep3, setInlineOtpSubmitPressedStep3] = useState(false);

    // جلوگیری از باقی‌ماندن وضعیت فوکوس بین مراحل و ایجاد دکمه‌های تکراری
    useEffect(() => {
        if (activeStep !== 0) setIsPhoneFocused(false);
        if (activeStep !== 1) setIsFullNameFocused(false);
        if (activeStep !== 2) setIsOtpFocusedStep3(false);
    }, [activeStep]);
    const [inlinePhoneSubmitPressed, setInlinePhoneSubmitPressed] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [phoneOtpToken, setPhoneOtpToken] = useState('');
    const [phoneOtpCode, setPhoneOtpCode] = useState('');
    const autoSubmitOtpLockRef = useRef(false);
    const lastAutoSubmittedOtpRef = useRef<string | null>(null);
    const [otpError, setOtpError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [formData, setFormData] = useState({
        phone: '',
        full_name: '',
        user_type: 'JS', // پیش‌فرض: جوینده کار
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // حل مشکل hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // تنظیم ارتفاع viewport برای موبایل
    useEffect(() => {
        if (isMobile && typeof window !== 'undefined') {
            const setVH = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
                setViewportHeight(`${vh * 100}px`);
            };

            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);

            return () => {
                window.removeEventListener('resize', setVH);
                window.removeEventListener('orientationchange', setVH);
            };
        }
    }, [isMobile]);

    // بررسی وجود تایمر در localStorage هنگام لود اولیه
    useEffect(() => {
        const checkExistingTimer = () => {
            const phoneKey = formData.phone.trim();
            if (!phoneKey) return;
            
            try {
                const storedData = localStorage.getItem(`reg_otp_timer_${phoneKey}`);
                if (storedData) {
                    const { endTime, userInfo } = JSON.parse(storedData);
                    const now = new Date().getTime();
                    const remainingTime = Math.round((endTime - now) / 1000);
                    
                    if (remainingTime > 0) {
                        // استفاده از اطلاعات ذخیره شده کاربر
                        if (userInfo?.full_name) {
                            setFormData(prev => ({
                                ...prev,
                                full_name: userInfo.full_name,
                                user_type: userInfo.user_type || 'JS'
                            }));
                        }
                        
                        // تنظیم تایمر
                        setResendTimer(remainingTime);
                        
                        // اگر قبلاً مرحله OTP را دیده بود، مستقیم به آن برو
                        const otpToken = localStorage.getItem(`reg_otp_token_${phoneKey}`);
                        if (otpToken) {
                            setPhoneOtpToken(otpToken);
                            setActiveStep(2);
                        } else if (formData.full_name) {
                            // اگر نام کامل دارد، به مرحله دوم برو
                            setActiveStep(1);
                        }
                    } else {
                        // اگر تایمر منقضی شده، پاک کن
                        localStorage.removeItem(`reg_otp_timer_${phoneKey}`);
                        localStorage.removeItem(`reg_otp_token_${phoneKey}`);
                    }
                }
            } catch (error) {
                console.error('خطا در بازیابی تایمر ثبت‌نام:', error);
            }
        };
        
        checkExistingTimer();
    }, [formData.phone]);

    // وقتی کد ارسال می‌شود، تایمر شروع به کار می‌کند
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prevTimer) => prevTimer - 1);
                
                // هر ثانیه بررسی شود که آیا تایمر به پایان رسیده
                if (resendTimer <= 1) {
                    const phoneKey = formData.phone.trim();
                    if (phoneKey) {
                        localStorage.removeItem(`reg_otp_timer_${phoneKey}`);
                    }
                }
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer, formData.phone]);

    // تبدیل ثانیه به فرمت mm:ss فارسی
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        
        const formattedMins = mins < 10 ? `۰${faDigits[mins]}` : `${faDigits[Math.floor(mins/10)]}${faDigits[mins%10]}`;
        const formattedSecs = secs < 10 ? `۰${faDigits[secs]}` : `${faDigits[Math.floor(secs/10)]}${faDigits[secs%10]}`;
        
        return `${formattedMins}:${formattedSecs}`;
    };

    // دریافت شماره تلفن از پارامترهای URL در صورت وجود
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const phoneParam = urlParams.get('phone');
            if (phoneParam) {
                setFormData(prev => ({
                    ...prev,
                    phone: phoneParam
                }));
            }
        }
    }, []);

    // هدایت کاربر به صفحه اصلی اگر قبلاً احراز هویت شده باشد
    useEffect(() => {
        if (isAuthenticated) {
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/');
            }
        }
    }, [isAuthenticated, router, onSuccess]);

    // تابع بروزرسانی فیلدهای فرم
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // پاک کردن خطای فیلد در صورت تغییر مقدار
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // تابع بروزرسانی فیلد انتخابی نوع کاربر
    const handleSelectChange = (e: any) => {
        setFormData({
            ...formData,
            user_type: e.target.value
        });
    };

    // تابع بروزرسانی کد تایید
    const handleOtpChange = (value: string) => {
        setPhoneOtpCode(value);
        if (otpError) {
        setOtpError('');
        }
    };

    // ثبت خودکار وقتی کد OTP کامل شد (مرحله ۳) با قفل و ثبت آخرین کد ارسال‌شده برای جلوگیری از ارسال‌های پیاپی
    useEffect(() => {
        if (activeStep !== 2) return;
        const code = phoneOtpCode.trim();
        if (code.length === 6 && /^\d{6}$/.test(code)) {
            if (isSubmitting) return;
            if (autoSubmitOtpLockRef.current) return;
            if (lastAutoSubmittedOtpRef.current === code) return;
            autoSubmitOtpLockRef.current = true;
            lastAutoSubmittedOtpRef.current = code;
            const form = document.getElementById('register-otp-form') as HTMLFormElement | null;
            form?.requestSubmit();
        } else {
            // اگر کد کمتر از ۶ رقم شد، قفل آزاد شود تا در تکمیل بعدی دوباره ارسال شود
            autoSubmitOtpLockRef.current = false;
            lastAutoSubmittedOtpRef.current = null;
        }
    }, [phoneOtpCode, activeStep, isSubmitting]);

    // اعتبارسنجی شماره تلفن در مرحله اول
    const validatePhoneStep = (): boolean => {
        const errors: Record<string, string> = {};
        let isValid = true;

        // بررسی خالی نبودن شماره تلفن
        if (!formData.phone.trim()) {
            errors.phone = 'شماره تلفن الزامی است';
            isValid = false;
        }
        // بررسی فرمت شماره تلفن (۱۱ رقم و شروع با ۰۹ - اعداد انگلیسی)
        else if (!/^09\d{9}$/.test(formData.phone.trim())) {
            errors.phone = 'شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // اعتبارسنجی کد OTP در مرحله سوم
    const validateOtpStep = (): boolean => {
        if (!phoneOtpCode.trim()) {
            setOtpError('لطفاً کد تایید را وارد کنید');
            return false;
        }
        if (phoneOtpCode.trim().length !== 6 || !/^\d+$/.test(phoneOtpCode.trim())) {
            setOtpError('کد تایید باید شامل ۶ رقم باشد');
            return false;
        }
        return true;
    };

    // اعتبارسنجی اطلاعات شخصی در مرحله دوم
    const validateUserInfoStep = (): boolean => {
        const errors: Record<string, string> = {};

        // بررسی نام و نام خانوادگی
        if (!formData.full_name.trim()) {
            errors.full_name = 'نام و نام خانوادگی الزامی است';
        } else if (formData.full_name.trim().length < 3) {
            errors.full_name = 'نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // بررسی وجود شماره تلفن - فقط یک بار در مرحله اول
    const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validatePhoneStep()) return;

        setIsSubmitting(true);

        try {
            // بررسی وجود شماره تلفن بدون ثبت هیچ اطلاعاتی
            const phoneExists = await checkPhoneExists(formData.phone);
            
            if (phoneExists) {
                setFormErrors({
                    phone: 'این شماره تلفن قبلاً ثبت شده است'
                });
                setIsSubmitting(false);
                return;
            }

            // پیشرفت به مرحله اطلاعات کاربری
            setActiveStep(1);
        } catch (error: any) {
            console.error('خطا در بررسی شماره تلفن:', error);

            // نمایش خطای دریافتی از سرور
            if (error.response?.data) {
                const apiErrors: Record<string, string> = {};

                Object.entries(error.response.data).forEach(([key, value]) => {
                    const errorValue = Array.isArray(value) ? value[0] : value;
                    if (typeof errorValue === 'string') {
                        apiErrors[key] = errorValue;
                    }
                });

                if (Object.keys(apiErrors).length > 0) {
                    setFormErrors(apiErrors);
                } else {
                    setFormErrors({
                        phone: 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.'
                    });
                }
            } else {
                setFormErrors({
                    phone: error.message || 'خطا در بررسی شماره تلفن. لطفاً دوباره تلاش کنید.'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // تکمیل اطلاعات کاربر و ارسال درخواست کد OTP
    const handleUserInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateUserInfoStep()) return;

        setIsSubmitting(true);

        try {
            const phoneKey = formData.phone.trim();

            // اگر تایمر قبلی هنوز معتبر است، بدون ارسال مجدد OTP به مرحله کد برو
            try {
                const storedData = localStorage.getItem(`reg_otp_timer_${phoneKey}`);
                const storedToken = localStorage.getItem(`reg_otp_token_${phoneKey}`);
                if (storedData && storedToken) {
                    const { endTime } = JSON.parse(storedData);
                    const now = new Date().getTime();
                    const remainingTime = Math.round((endTime - now) / 1000);
                    if (remainingTime > 0) {
                        setPhoneOtpToken(storedToken);
                        setResendTimer(remainingTime);
                        setActiveStep(2);
                        // به‌روزرسانی اطلاعات کاربر در storage برای سازگاری
                        localStorage.setItem(`reg_otp_timer_${phoneKey}`, JSON.stringify({
                            endTime,
                            userInfo: { full_name: formData.full_name, user_type: formData.user_type }
                        }));
                        toast.success('کد تأیید قبلی هنوز معتبر است. لطفاً صبر کنید یا کد را وارد کنید.');
                        return;
                    } else {
                        // پاک‌سازی در صورت انقضای تایمر
                        localStorage.removeItem(`reg_otp_timer_${phoneKey}`);
                        localStorage.removeItem(`reg_otp_token_${phoneKey}`);
                    }
                }
            } catch {}

            // در غیر این صورت، OTP جدید ارسال کن
            const otpToken = await registerOtp({
                phone: formData.phone,
                full_name: formData.full_name,
                user_type: formData.user_type
            });

            // ذخیره توکن OTP برای استفاده در مرحله بعد
            setPhoneOtpToken(otpToken);

            // پیشرفت به مرحله تایید OTP
            setActiveStep(2);
            
            // تنظیم تایمر و ذخیره در localStorage
            setResendTimer(120);
            const now = new Date().getTime();
            const endTime = now + (120 * 1000); // ۱۲۰ ثانیه بعد
            localStorage.setItem(`reg_otp_timer_${phoneKey}`, JSON.stringify({ 
                endTime,
                userInfo: {
                    full_name: formData.full_name,
                    user_type: formData.user_type
                    }
            }));
            localStorage.setItem(`reg_otp_token_${phoneKey}`, otpToken);
            
            toast.success('کد تایید برای شماره شما ارسال شد');
        } catch (error: any) {
            console.error('خطا در ارسال درخواست OTP:', error);

            // نمایش خطای دریافتی
            if (error.response?.data?.Detail) {
                const errorDetail = error.response.data.Detail;
                if (typeof errorDetail === 'string') {
                    setFormErrors({ general: errorDetail });
                } else if (typeof errorDetail === 'object') {
                    const apiErrors: Record<string, string> = {};
                    Object.entries(errorDetail).forEach(([key, value]) => {
                        const errorValue = Array.isArray(value) ? value[0] : value;
                        if (typeof errorValue === 'string') {
                            apiErrors[key] = errorValue;
                        }
                    });
                    if (Object.keys(apiErrors).length > 0) {
                        setFormErrors(apiErrors);
                    } else {
                        setFormErrors({ general: 'خطا در ارسال درخواست OTP' });
                    }
                }
            } else {
                setFormErrors({
                    general: error.message || 'خطا در ارسال درخواست OTP. لطفاً دوباره تلاش کنید.'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // تایید کد OTP و تکمیل ثبت‌نام
    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateOtpStep()) return;

        setIsSubmitting(true);

        try {
            // ارسال کد OTP برای تایید نهایی و تکمیل ثبت‌نام
            const verificationResponse = await validateOtp(phoneOtpToken, phoneOtpCode);

            // بررسی نوع کاربر انتخاب شده و نوع کاربر ایجاد شده
            if (formData.user_type === 'EM' && verificationResponse.Detail?.User?.user_type === 'JS') {
                // اگر کاربر نوع کارفرما را انتخاب کرده اما به عنوان کارجو ثبت شده است
                toast.success('ثبت‌نام با موفقیت انجام شد. شما اکنون به صفحه تغییر نوع کاربری هدایت می‌شوید.');

                // هدایت کاربر به صفحه تغییر نوع کاربری
                if (onSuccess) {
                    onSuccess();
                } else {
                    setTimeout(() => {
                        // استفاده از window.location.href به جای router.push برای ریلود کامل صفحه
                        if (typeof window !== 'undefined') {
                        window.location.href = '/change-user-type';
                        }
                    }, 1500);
                }
                return;
            } else {
                toast.success('ثبت‌نام با موفقیت انجام شد، اکنون می‌توانید از امکانات سایت استفاده کنید');
            }

            // بازیابی اطلاعات کامل کاربر از سرور - همانند فرایند لاگین
            try {
                await useAuthStore.getState().fetchUserData();
                console.log('اطلاعات کاربر با موفقیت پس از ثبت‌نام بازیابی شد');
            } catch (fetchError) {
                console.error('خطا در بازیابی اطلاعات کاربر پس از ثبت‌نام:', fetchError);
            }

            // هدایت کاربر به صفحه اصلی یا فراخوانی تابع onSuccess
            if (onSuccess) {
                onSuccess();
            } else {
                // استفاده از window.location.href به جای router.push برای ریلود کامل صفحه
                if (typeof window !== 'undefined') {
                window.location.href = '/';
                }
            }
        } catch (error: any) {
            console.error('خطا در تایید کد:', error);

            // نمایش خطای کد تایید به زبان فارسی
            if (error.message) {
                // بررسی و تبدیل پیام‌های خطای انگلیسی به فارسی
                if (error.message.includes('Invalid OTP') || error.message.includes('invalid') || error.message.includes('code')) {
                    setOtpError('کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.');
                } else if (error.message.includes('Inactive') || error.message.includes('expire')) {
                    setOtpError('کد تایید منقضی شده است. لطفاً درخواست ارسال کد جدید را بزنید.');
                } else {
                    setOtpError(error.message); // اگر پیام به فارسی باشد، همان را نمایش می‌دهیم
                }
            } else if (error.response?.data) {
                // بررسی ساختارهای مختلف پاسخ خطا
                if (error.response.data.Detail) {
                    if (typeof error.response.data.Detail === 'string') {
                        if (error.response.data.Detail.includes('Inactive')) {
                            setOtpError('کد تایید منقضی شده است. لطفاً درخواست ارسال کد جدید را بزنید.');
                        } else {
                            setOtpError('کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.');
                        }
                    } else if (typeof error.response.data.Detail === 'object' && error.response.data.Detail.Message) {
                        setOtpError('کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.');
                    }
                } else if (error.response.data.code) {
                    setOtpError('کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.');
                } else {
                    setOtpError('کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید یا درخواست ارسال مجدد کد را بزنید.');
                }
            } else {
                setOtpError('خطا در تایید کد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ارسال مجدد کد تایید
    const handleResendOtp = async () => {
        // اگر تایمر هنوز در حال شمارش است، اجازه ارسال مجدد نده
        if (resendTimer > 0) return;
        
        setIsSubmitting(true);

        try {
            // ارسال مجدد درخواست کد تایید
            const otpToken = await registerOtp({
                phone: formData.phone,
                full_name: formData.full_name,
                user_type: formData.user_type
            });

            // ذخیره توکن جدید
            setPhoneOtpToken(otpToken);

            // پاک کردن کد قبلی
            setPhoneOtpCode('');
            setOtpError('');
            
            // تنظیم مجدد تایمر و ذخیره در localStorage
            setResendTimer(120);
            const phoneKey = formData.phone.trim();
            const now = new Date().getTime();
            const endTime = now + (120 * 1000); // ۱۲۰ ثانیه بعد
            localStorage.setItem(`reg_otp_timer_${phoneKey}`, JSON.stringify({ 
                endTime,
                userInfo: {
                    full_name: formData.full_name,
                    user_type: formData.user_type
                }
            }));
            localStorage.setItem(`reg_otp_token_${phoneKey}`, otpToken);

            toast.success('کد تایید جدید ارسال شد');
        } catch (error: any) {
            console.error('خطا در ارسال مجدد کد تایید:', error);

            // نمایش خطاهای دریافتی از سرور
            setOtpError(error.message || 'خطا در ارسال مجدد کد تایید');
        } finally {
            setIsSubmitting(false);
        }
    };

    // رندر فرم مرحله اول (شماره تلفن) - با متن قوانین اما بدون چک‌باکس
    const renderPhoneForm = () => {
        return (
            <Box component="form" id="register-phone-form" onSubmit={handlePhoneSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 2.5 } }}>
                    <Box id="reg-phone-section" sx={{ scrollMarginTop: '32px' }}>
                        <NumberTextField
                            fullWidth
                            name="phone"
                            label="شماره تلفن"
                            variant="outlined"
                            value={formData.phone}
                            onChange={handleChange}
                            onFocus={() => {
                                if (isMobile) {
                                    setIsPhoneFocused(true);
                                    try {
                                        const containerEl = contentRef.current;
                                        const headerEl = document.getElementById('reg-step-header');
                                        const offset = 0;
                                        const doScroll = () => {
                                            if (containerEl && headerEl) {
                                                const rect = headerEl.getBoundingClientRect();
                                                const crect = containerEl.getBoundingClientRect();
                                                const targetScrollTop = containerEl.scrollTop + (rect.top - crect.top) - offset;
                                                containerEl.scrollTo({ top: Math.max(targetScrollTop, 0), behavior: 'auto' });
                                            } else if (headerEl) {
                                                headerEl.scrollIntoView({ behavior: 'auto', block: 'start' });
                                            }
                                        };
                                        doScroll();
                                        requestAnimationFrame(() => requestAnimationFrame(() => doScroll()));
                                        setTimeout(doScroll, 180);
                                        setTimeout(doScroll, 360);
                                    } catch {}
                                }
                            }}
                            onBlur={() => {
                                if (!inlinePhoneSubmitPressed) {
                                    setIsPhoneFocused(false);
                                }
                            }}
                            error={!!formErrors.phone}
                            helperText={formErrors.phone}
                            disabled={isSubmitting}
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon sx={{ color: EMPLOYER_THEME.primary }} />
                                    </InputAdornment>
                                ),
                            }}
                            isMobile={isMobile}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#f8fafd',
                                    border: '1px solid #e3f2fd',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#ffffff',
                                        borderColor: EMPLOYER_THEME.light,
                                        boxShadow: '0 2px 8px rgba(65, 135, 255, 0.1)',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#ffffff',
                                        borderColor: EMPLOYER_THEME.primary,
                                        boxShadow: `0 0 0 3px ${EMPLOYER_THEME.primary}20`,
                                        transform: 'translateY(-1px)',
                                    },
                                    '&.Mui-error': {
                                        borderColor: '#d32f2f',
                                        backgroundColor: '#fff5f5',
                                        '&:hover': {
                                            borderColor: '#d32f2f',
                                            backgroundColor: '#fff0f0',
                                        },
                                        '&.Mui-focused': {
                                            borderColor: '#d32f2f',
                                            boxShadow: '0 0 0 3px rgba(211, 47, 47, 0.2)',
                                        }
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: EMPLOYER_THEME.primary, // رنگ متن آبی کارفرما
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#666',
                                    backgroundColor: '#ffffff',
                                    padding: '0 4px',
                                    '&.Mui-focused': {
                                        color: EMPLOYER_THEME.primary,
                                        fontWeight: 600,
                                        backgroundColor: '#ffffff',
                                    },
                                    '&.Mui-shrink': {
                                        backgroundColor: '#ffffff',
                                    }
                                },
                                '& .MuiFormHelperText-root': {
                                    marginLeft: 0,
                                    marginRight: 0,
                                    fontSize: '0.75rem',
                                }
                            }}
                        />
                    </Box>

                    {/* متن شرایط و قوانین فقط در حالت دسکتاپ و فقط مرحله 1 */}
                    {!isMobile && activeStep === 0 && (
                    <Box sx={{ textAlign: 'center', mt: -0.5 }}>
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                                lineHeight: 1.6,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                opacity: 0.9
                            }}
                        >
                            با ثبت‌نام در ماهرکار، <MuiLink component={Link} href="/terms" target="_blank" underline="hover">شرایط و قوانین</MuiLink> و <MuiLink component={Link} href="/privacy" target="_blank" underline="hover">بیانیه حریم خصوصی</MuiLink> را می‌پذیرید
                        </Typography>
                    </Box>
                    )}

                    {/* دکمه ادامه زیر ورودی هنگام فوکوس (فقط موبایل) */}
                    {isMobile && isPhoneFocused && (
                        <Box>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                onMouseDown={() => setInlinePhoneSubmitPressed(true)}
                                onTouchStart={() => setInlinePhoneSubmitPressed(true)}
                                onClick={() => {
                                    const form = document.getElementById('register-phone-form') as HTMLFormElement | null;
                                    form?.requestSubmit();
                                    setTimeout(() => setInlinePhoneSubmitPressed(false), 0);
                                }}
                                sx={{
                                    mt: 1.5,
                                    py: 1.2,
                                    backgroundColor: EMPLOYER_THEME.primary,
                                    background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                        boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                    },
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                }}
                            >
                                ادامه
                            </Button>
                        </Box>
                    )}

                    {/* دکمه در حالت موبایل در پایین صفحه قرار می‌گیرد */}
                    {!isMobile && (
                    <Box>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                mt: 2,
                                py: 1.2,
                                backgroundColor: EMPLOYER_THEME.primary,
                                background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                },
                                borderRadius: 2,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'ادامه'}
                        </Button>
                    </Box>
                    )}

                    {/* لینک ورود در حالت موبایل در پایین صفحه قرار می‌گیرد */}
                    {!isMobile && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body1">
                            قبلاً ثبت‌نام کرده‌اید؟{' '}
                            <MuiLink
                                component={Link}
                                href="/login"
                                underline="hover"
                                sx={{ 
                                    fontWeight: 'bold', 
                                    color: EMPLOYER_THEME.primary,
                                    '&:hover': {
                                        color: EMPLOYER_THEME.dark,
                                    },
                                    transition: 'color 0.2s ease',
                                }}
                            >
                                ورود به حساب
                            </MuiLink>
                        </Typography>
                    </Box>
                    )}
                </Box>
            </Box>
        );
    };

    // رندر فرم مرحله دوم (اطلاعات کاربر)
    const renderUserInfoForm = () => {
        return (
            <Box component="form" id="register-info-form" onSubmit={handleUserInfoSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 2.5 } }}>
                    <Box id="reg-fullname-section" sx={{ scrollMarginTop: '56px' }}>
                        <TextField
                            fullWidth
                            name="full_name"
                            label="نام و نام خانوادگی"
                            variant="outlined"
                            value={formData.full_name}
                            onChange={handleChange}
                            error={!!formErrors.full_name}
                            helperText={formErrors.full_name}
                            autoFocus
                            onFocus={() => {
                                if (isMobile) {
                                    setIsFullNameFocused(true);
                                    setInlineUserSubmitPressed(false);
                                    try {
                                        const containerEl = contentRef.current;
                                        const headerEl = document.getElementById('reg-step-header');
                                        const offset = 0; // هدر دقیقاً بچسبد به بالای کانتینر
                                        const doScroll = () => {
                                            if (containerEl && headerEl) {
                                                const rect = headerEl.getBoundingClientRect();
                                                const crect = containerEl.getBoundingClientRect();
                                                const targetScrollTop = containerEl.scrollTop + (rect.top - crect.top) - offset;
                                                containerEl.scrollTo({ top: Math.max(targetScrollTop, 0), behavior: 'auto' });
                                            } else if (headerEl) {
                                                headerEl.scrollIntoView({ behavior: 'auto', block: 'start' });
                                            }
                                        };
                                        doScroll();
                                        requestAnimationFrame(() => requestAnimationFrame(() => doScroll()));
                                        setTimeout(doScroll, 180);
                                        setTimeout(doScroll, 360);
                                    } catch {}
                                }
                            }}
                            onBlur={() => {
                                if (!inlineUserSubmitPressed) {
                                    setIsFullNameFocused(false);
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BadgeIcon sx={{ color: EMPLOYER_THEME.primary }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#f8fafd',
                                    border: '1px solid #e3f2fd',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#ffffff',
                                        borderColor: EMPLOYER_THEME.light,
                                        boxShadow: '0 2px 8px rgba(65, 135, 255, 0.1)',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#ffffff',
                                        borderColor: EMPLOYER_THEME.primary,
                                        boxShadow: `0 0 0 3px ${EMPLOYER_THEME.primary}20`,
                                        transform: 'translateY(-1px)',
                                    },
                                    '&.Mui-error': {
                                        borderColor: '#d32f2f',
                                        backgroundColor: '#fff5f5',
                                        '&:hover': {
                                            borderColor: '#d32f2f',
                                            backgroundColor: '#fff0f0',
                                        },
                                        '&.Mui-focused': {
                                            borderColor: '#d32f2f',
                                            boxShadow: '0 0 0 3px rgba(211, 47, 47, 0.2)',
                                        }
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                        border: 'none',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: EMPLOYER_THEME.primary, // رنگ متن آبی کارفرما
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#666',
                                    backgroundColor: '#ffffff',
                                    padding: '0 4px',
                                    '&.Mui-focused': {
                                        color: EMPLOYER_THEME.primary,
                                        fontWeight: 600,
                                        backgroundColor: '#ffffff',
                                    },
                                    '&.Mui-shrink': {
                                        backgroundColor: '#ffffff',
                                    }
                                },
                                '& .MuiFormHelperText-root': {
                                    marginLeft: 0,
                                    marginRight: 0,
                                    fontSize: '0.75rem',
                                }
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                mb: 2.5, 
                                fontWeight: 600, 
                                color: EMPLOYER_THEME.primary,
                                fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                        >
                            نوع کاربر
                        </Typography>
                        
                        <Box 
                            sx={{ 
                            display: 'flex', 
                            gap: { xs: 1.5, sm: 2 },
                            flexDirection: 'row'
                        }}>
                            {/* کارت کارجو */}
                            <Card 
                                onClick={() => setFormData(prev => ({ ...prev, user_type: 'JS' }))}
                                sx={{ 
                                    flex: 1,
                                    cursor: 'pointer',
                                    border: `2px solid ${formData.user_type === 'JS' ? JOB_SEEKER_THEME.primary : '#e5e5e5'}`,
                                    backgroundColor: formData.user_type === 'JS' ? '#f8fff9' : '#ffffff',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    borderRadius: 2,
                                    minHeight: { xs: '90px', sm: '100px' },
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: formData.user_type === 'JS' ? `0 4px 20px ${JOB_SEEKER_THEME.primary}20` : '0 2px 8px rgba(0,0,0,0.08)',
                                    '&:hover': {
                                        border: `2px solid ${JOB_SEEKER_THEME.primary}`,
                                        backgroundColor: '#f0fff1',
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 8px 25px ${JOB_SEEKER_THEME.primary}30`,
                                    },
                                    '&::before': formData.user_type === 'JS' ? {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: `linear-gradient(90deg, ${JOB_SEEKER_THEME.primary}, ${JOB_SEEKER_THEME.light})`,
                                    } : {}
                                }}
                            >
                                <CardContent sx={{ 
                                    textAlign: 'center', 
                                    py: { xs: 1.5, sm: 2 },
                                    px: { xs: 1, sm: 1.5 },
                                    '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: { xs: 0.5, sm: 1 },
                                    height: '100%'
                                }}>
                                    <PersonSearchIcon sx={{ 
                                        fontSize: { xs: 24, sm: 28 },
                                        color: formData.user_type === 'JS' ? JOB_SEEKER_THEME.primary : '#9e9e9e',
                                        transition: 'all 0.3s ease'
                                    }} />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 700,
                                                color: formData.user_type === 'JS' ? JOB_SEEKER_THEME.primary : '#616161',
                                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                lineHeight: 1.2,
                                                mb: { xs: 0.2, sm: 0.3 }
                                            }}
                                        >
                                            کارجو
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: formData.user_type === 'JS' ? JOB_SEEKER_THEME.primary : '#9e9e9e',
                                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                                lineHeight: 1.2,
                                                display: 'block'
                                            }}
                                        >
                                            جستجوی شغل
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* کارت کارفرما */}
                            <Card 
                                onClick={() => setFormData(prev => ({ ...prev, user_type: 'EM' }))}
                                sx={{ 
                                    flex: 1,
                                    cursor: 'pointer',
                                    border: `2px solid ${formData.user_type === 'EM' ? EMPLOYER_THEME.primary : '#e5e5e5'}`,
                                    backgroundColor: formData.user_type === 'EM' ? '#f7f9ff' : '#ffffff',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    borderRadius: 2,
                                    minHeight: { xs: '90px', sm: '100px' },
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: formData.user_type === 'EM' ? `0 4px 20px ${EMPLOYER_THEME.primary}20` : '0 2px 8px rgba(0,0,0,0.08)',
                                    '&:hover': {
                                        border: `2px solid ${EMPLOYER_THEME.primary}`,
                                        backgroundColor: '#f0f4ff',
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 8px 25px ${EMPLOYER_THEME.primary}30`,
                                    },
                                    '&::before': formData.user_type === 'EM' ? {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: `linear-gradient(90deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                    } : {}
                                }}
                            >
                                <CardContent sx={{ 
                                    textAlign: 'center', 
                                    py: { xs: 1.5, sm: 2 },
                                    px: { xs: 1, sm: 1.5 },
                                    '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: { xs: 0.5, sm: 1 },
                                    height: '100%'
                                }}>
                                    <WorkIcon sx={{ 
                                        fontSize: { xs: 24, sm: 28 },
                                        color: formData.user_type === 'EM' ? EMPLOYER_THEME.primary : '#9e9e9e',
                                        transition: 'all 0.3s ease'
                                    }} />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 700,
                                                color: formData.user_type === 'EM' ? EMPLOYER_THEME.primary : '#616161',
                                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                lineHeight: 1.2,
                                                mb: { xs: 0.2, sm: 0.3 }
                                            }}
                                        >
                                            کارفرما
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: formData.user_type === 'EM' ? EMPLOYER_THEME.primary : '#9e9e9e',
                                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                                lineHeight: 1.2,
                                                display: 'block'
                                            }}
                                        >
                                            استخدام نیرو
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* دکمه دریافت کد تایید زیر نام و نام خانوادگی در حالت فوکوس (فقط موبایل/فقط مرحله 1) */}
                        {isMobile && activeStep === 1 && isFullNameFocused && (
                            <Box>
                                <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={isSubmitting}
                                    onMouseDown={() => setInlineUserSubmitPressed(true)}
                                    onTouchStart={() => setInlineUserSubmitPressed(true)}
                                    onClick={() => {
                                        const form = document.getElementById('register-info-form') as HTMLFormElement | null;
                                        form?.requestSubmit();
                                        setTimeout(() => setInlineUserSubmitPressed(false), 0);
                                    }}
                                    sx={{
                                        mt: 1.5,
                                        py: 1.2,
                                        backgroundColor: EMPLOYER_THEME.primary,
                                        background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                            boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                        },
                                        borderRadius: 2,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                    }}
                                >
                                    دریافت کد تایید
                                </Button>
                            </Box>
                        )}

                        {/* دکمه دریافت کد تایید زیر کارت‌ها هنگام فوکوس (فقط موبایل/فقط مرحله 0) */}
                        {isMobile && activeStep === 0 && isPhoneFocused && (
                        <Box>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                onMouseDown={() => setInlinePhoneSubmitPressed(true)}
                                onTouchStart={() => setInlinePhoneSubmitPressed(true)}
                                onClick={() => {
                                    const form = document.querySelector('form');
                                    if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
                                    setTimeout(() => setInlinePhoneSubmitPressed(false), 0);
                                }}
                                sx={{
                                    mt: 1.5,
                                    py: 1.2,
                                    backgroundColor: EMPLOYER_THEME.primary,
                                    background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                        boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                    },
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                }}
                            >
                                دریافت کد تایید
                            </Button>
                        </Box>
                        )}
                    </Box>

                    {formErrors.general && (
                        <Typography
                            color="error"
                            variant="body2"
                            sx={{ mt: 1 }}
                        >
                            {formErrors.general}
                        </Typography>
                    )}

                        {/* دکمه‌ها در حالت موبایل در پایین صفحه قرار می‌گیرند */}
                    {!isMobile && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        gap: 2,
                        mt: 2,
                        width: '100%'
                    }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            fullWidth
                            sx={{
                                py: 1.2,
                                backgroundColor: EMPLOYER_THEME.primary,
                                background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                },
                                borderRadius: 2,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                width: '100%'
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'دریافت کد تایید'}
                        </Button>
                    </Box>
                    )}
                </Box>
            </Box>
        );
    };

    // رندر فرم مرحله سوم (تایید شماره تلفن با کد OTP)
    const renderOtpForm = () => {
        return (
            <Box component="form" id="register-otp-form" onSubmit={handleOtpSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 2 } }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexWrap: 'nowrap',
                        gap: 0.5,
                        px: { xs: 1, sm: 2 },
                        mb: 1
                    }}>
                        <Typography 
                            variant="body2"
                            sx={{
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                fontWeight: 500,
                                color: 'text.secondary',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            کد تأیید به شماره
                            <span style={{ 
                                color: EMPLOYER_THEME.primary, 
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                            }}>
                                {toPersianNumbers(formData.phone)}
                            </span>
                            ارسال شد
                        </Typography>
                        <IconButton
                            onClick={() => setActiveStep(0)}
                            size="small"
                            sx={{
                                color: EMPLOYER_THEME.primary,
                                p: 0.5,
                                minWidth: 'auto',
                                '&:hover': {
                                    backgroundColor: alpha(EMPLOYER_THEME.primary, 0.08),
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <EditIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                    </Box>
                    <Box sx={{ mt: { xs: 0, sm: -0.5 } }}>
                        <OtpInput
                            value={phoneOtpCode}
                            onChange={handleOtpChange}
                            length={6}
                            error={!!otpError}
                            helperText={otpError}
                            autoFocus={true}
                            disabled={isSubmitting}
                            onFocus={() => setIsOtpFocusedStep3(true)}
                            onBlur={() => {
                                if (inlineOtpSubmitPressedStep3) return;
                                setIsOtpFocusedStep3(false);
                            }}
                        />
                        {/* ثانیه‌شمار/دکمه ارسال مجدد کد زیر فیلد کد */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                            {resendTimer > 0 ? (
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#666',
                                        fontWeight: 500,
                                    }}
                                >
                                    ارسال مجدد تا {formatTime(resendTimer)}
                                </Typography>
                            ) : (
                                <Button
                                    variant="text"
                                    onClick={handleResendOtp}
                                    disabled={isSubmitting || resendTimer > 0}
                                    sx={{ 
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        color: EMPLOYER_THEME.primary,
                                        '&:hover': {
                                            backgroundColor: EMPLOYER_THEME.bgLight,
                                            transform: 'translateY(-1px)',
                                        },
                                        '&:disabled': {
                                            color: '#ccc',
                                            backgroundColor: 'transparent',
                                        },
                                        transition: 'all 0.2s ease',
                                        fontWeight: 500,
                                    }}
                                >
                                    ارسال مجدد کد
                                </Button>
                            )}
                        </Box>

                        {/* دکمه تایید کد زیر «ارسال مجدد» هنگام فوکوس روی OTP (فقط موبایل) */}
                        {isMobile && isOtpFocusedStep3 && (
                            <Box>
                                <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={isSubmitting}
                                    onMouseDown={() => {
                                        setInlineOtpSubmitPressedStep3(true);
                                        const form = document.getElementById('register-otp-form') as HTMLFormElement | null;
                                        form?.requestSubmit();
                                        setTimeout(() => setInlineOtpSubmitPressedStep3(false), 0);
                                    }}
                                    onTouchStart={() => {
                                        setInlineOtpSubmitPressedStep3(true);
                                        const form = document.getElementById('register-otp-form') as HTMLFormElement | null;
                                        form?.requestSubmit();
                                        setTimeout(() => setInlineOtpSubmitPressedStep3(false), 0);
                                    }}
                                    sx={{
                                        mt: 1.5,
                                        py: 1.2,
                                        backgroundColor: EMPLOYER_THEME.primary,
                                        background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                            boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                        },
                                        borderRadius: 2,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                    }}
                                >
                                    تایید کد
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* دکمه‌ها در حالت موبایل در پایین صفحه قرار می‌گیرند */}
                    {!isMobile && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        gap: 2,
                        mt: 1,
                        width: '100%'
                    }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            fullWidth
                            sx={{
                                py: 1.2,
                                backgroundColor: EMPLOYER_THEME.primary,
                                background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                },
                                borderRadius: 2,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                width: '100%'
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'تایید کد'}
                        </Button>
                    </Box>
                    )}
                </Box>
            </Box>
        );
    };



    if (isMobile) {
        return (
            <Box
                sx={{
                    height: isMobile ? viewportHeight : '100vh',
                    minHeight: isMobile ? viewportHeight : '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden', // جلوگیری از اسکرول
                    position: 'relative',
                    backgroundColor: '#ffffff'
                }}
            >
                {/* هدر موبایل - لینک برگشت */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        pt: 3, // فاصله بیشتر از بالا برای نوار مرورگر
                        flexShrink: 0,
                        zIndex: 10
                    }}
                >
                    {/* گزینه بازگشت به مرحله قبل (فقط در مراحل 1 و 2) */}
                    {(activeStep === 1 || activeStep === 2) ? (
                        <Button
                            variant="text"
                            onClick={() => setActiveStep(activeStep - 1)}
                            sx={{
                                color: EMPLOYER_THEME.primary,
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                '&:hover': {
                                    backgroundColor: alpha(EMPLOYER_THEME.primary, 0.08),
                                    color: EMPLOYER_THEME.dark,
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            ← بازگشت
                        </Button>
                    ) : (
                        <Box />
                    )}

                    {/* لینک بازگشت به سایت */}
                    <Link href="/" passHref>
                        <Button
                            variant="text"
                            sx={{
                                color: EMPLOYER_THEME.primary,
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                '&:hover': {
                                    backgroundColor: alpha(EMPLOYER_THEME.primary, 0.08),
                                    color: EMPLOYER_THEME.dark,
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            ← بازگشت به سایت
                        </Button>
                    </Link>
                </Box>

                {/* محتوای اصلی - فرم در بالای صفحه */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        px: 2,
                        pt: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        pb: 12
                    }}
                    ref={contentRef}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: '100%',
                            boxShadow: 'none',
                            backgroundColor: 'transparent',
                            mt: 0
                        }}
                    >
                        {/* هدر انیمیشنی با اطلاعات مرحله */}
                        <Box
                            id="reg-step-header"
                            sx={{
                                mb: 3,
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                mt: isMobile ? 1 : 0
                            }}
                        >
                            {/* عنوان اصلی */}
                            <Typography
                                variant="h5"
                                component="h1"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 2,
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.01em',
                                    background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textAlign: 'center'
                                }}
                            >
                                ثبت‌نام در ماهرکار
                            </Typography>

                            {/* کارت اطلاعات مرحله ثابت */}
                            <Box
                                sx={{
                                    background: `linear-gradient(135deg, ${alpha(EMPLOYER_THEME.primary, 0.08)}, ${alpha(EMPLOYER_THEME.light, 0.05)})`,
                                    borderRadius: 3,
                                    px: 3,
                                    py: 2,
                                    border: `1px solid ${alpha(EMPLOYER_THEME.primary, 0.12)}`,
                                    backdropFilter: 'blur(10px)',
                                    maxWidth: '320px',
                                    mx: 'auto',
                                    position: 'relative',
                                    minHeight: '90px' // حفظ ارتفاع ثابت
                                }}
                            >
                                {/* شماره مرحله با انیمیشن محو و پیدا */}
                                <Typography
                                    key={`step-number-${activeStep}`}
                                    variant="caption"
                                    sx={{
                                        color: alpha(EMPLOYER_THEME.primary, 0.7),
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        mb: 0.5,
                                        display: 'block',
                                        animation: 'fadeChange 0.6s ease-in-out',
                                        '@keyframes fadeChange': {
                                            '0%': { opacity: 1 },
                                            '30%': { opacity: 0, transform: 'translateY(-5px)' },
                                            '70%': { opacity: 0, transform: 'translateY(5px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    مرحله {toPersianNumbers(activeStep + 1)} از {toPersianNumbers(3)}
                                </Typography>

                                {/* عنوان مرحله با انیمیشن محو و پیدا */}
                                <Typography
                                    key={`step-title-${activeStep}`}
                                    variant="subtitle1"
                                    sx={{
                                        color: EMPLOYER_THEME.primary,
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        lineHeight: 1.3,
                                        animation: 'fadeChange 0.6s ease-in-out 0.1s both',
                                    }}
                                >
                                    {activeStep === 0 && 'تایید شماره تلفن'}
                                    {activeStep === 1 && 'تکمیل اطلاعات'}
                                    {activeStep === 2 && 'تایید کد ارسالی'}
                                </Typography>

                                {/* Progress Bar مینیمال */}
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 3,
                                        backgroundColor: alpha(EMPLOYER_THEME.primary, 0.1),
                                        borderRadius: 1.5,
                                        mt: 2,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            background: `linear-gradient(90deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                            borderRadius: 1.5,
                                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                            width: `${((activeStep + 1) / 3) * 100}%`,
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                                                animation: 'shimmer 2s ease-in-out infinite 1s'
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* انیمیشن‌های CSS */}
                            <style jsx>{`
                                @keyframes shimmer {
                                    0% { left: -100%; }
                                    100% { left: 100%; }
                                }
                            `}</style>
                        </Box>

                        {/* فرم‌ها */}
                        {activeStep === 0 && renderPhoneForm()}
                        {activeStep === 1 && renderUserInfoForm()}
                        {activeStep === 2 && renderOtpForm()}
                    </Paper>
                </Box>

                {/* فوتر موبایل - دکمه‌ها در پایین */}
                <Box
                    sx={{
                        flexShrink: 0,
                        p: 2,
                        pt: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        backgroundColor: 'transparent'
                    }}
                >
                        {/* دکمه‌های اصلی در پایین صفحه */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* عبارت شرایط و قوانین - فقط مرحله 1 */}
                        {activeStep === 0 && (
                        <Box sx={{ textAlign: 'center', mb: 1 }}>
                            <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                display: 'flex',
                                flexWrap: 'nowrap',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                whiteSpace: 'nowrap'
                            }}>
                                با ثبت‌نام در ماهرکار،{' '}
                                <MuiLink
                                    component={Link}
                                    href="/terms"
                                    underline="hover"
                                    sx={{
                                        color: EMPLOYER_THEME.primary,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            color: EMPLOYER_THEME.dark,
                                        },
                                        transition: 'color 0.2s ease',
                                    }}
                                >
                                    شرایط و قوانین
                                </MuiLink>
                                {' '}و{' '}
                                <MuiLink
                                    component={Link}
                                    href="/privacy"
                                    underline="hover"
                                    sx={{
                                        color: EMPLOYER_THEME.primary,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            color: EMPLOYER_THEME.dark,
                                        },
                                        transition: 'color 0.2s ease',
                                    }}
                                >
                                    بیانیه حریم خصوصی
                                </MuiLink>
                                {' '}را می‌پذیرید
                            </Typography>
                        </Box>
                        )}

                        {/* دکمه ادامه یا دریافت کد تایید */}
                        {(((activeStep === 0) && !isPhoneFocused) || ((activeStep === 1) && !isFullNameFocused) || (activeStep === 2 && !isOtpFocusedStep3)) && (
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            onClick={() => {
                                // اگر در مرحله اول هستیم، فرم شماره تلفن را ارسال کن
                                if (activeStep === 0) {
                                    const form = document.getElementById('register-phone-form') as HTMLFormElement | null;
                                    form?.requestSubmit();
                                } else if (activeStep === 1) {
                                    // اگر در مرحله دوم هستیم، فرم اطلاعات کاربر را ارسال کن
                                    const form = document.querySelector('form');
                                    if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
                                } else {
                                    // اگر در مرحله سوم هستیم، فرم OTP را ارسال کن
                                    const form = document.querySelector('form');
                                    if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
                                }
                            }}
                            sx={{
                                py: 1.5,
                                backgroundColor: EMPLOYER_THEME.primary,
                                background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                },
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                    }}
                >
                            {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : activeStep === 0 ? (
                                'ادامه'
                            ) : activeStep === 1 ? (
                                'دریافت کد تایید'
                            ) : (
                                'تایید کد'
                            )}
                        </Button>
                        )}

                        {/* لینک ورود - فقط مرحله 1 */}
                        {activeStep === 0 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                قبلاً ثبت‌نام کرده‌اید؟{' '}
                                <MuiLink
                                    component={Link}
                                    href="/login"
                                    underline="hover"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: EMPLOYER_THEME.primary,
                                        fontSize: '0.9rem',
                                        '&:hover': {
                                            color: EMPLOYER_THEME.dark,
                                        },
                                        transition: 'color 0.2s ease',
                                    }}
                                >
                                    ورود به حساب
                                </MuiLink>
                            </Typography>
                        </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    // نمایش loading تا زمانی که کامپوننت mount نشده
    if (!mounted) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafd'
                }}
            >
                <CircularProgress size={40} sx={{ color: EMPLOYER_THEME.primary }} />
            </Box>
        );
    }

    // حالت دسکتاپ
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: 3,
                py: 4,
                position: 'relative'
            }}
        >
            {/* هدر دسکتاپ - مشابه موبایل */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '480px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                    mt: { xs: 0, sm: 2 },
                    px: { xs: 0, sm: 0 },
                }}
            >
                {/* دکمه بازگشت به مرحله قبل */}
                {activeStep > 0 ? (
                    <Button
                        variant="text"
                        onClick={() => setActiveStep(activeStep - 1)}
                        sx={{
                            color: EMPLOYER_THEME.primary,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            '&:hover': {
                                backgroundColor: alpha(EMPLOYER_THEME.primary, 0.08),
                                color: EMPLOYER_THEME.dark,
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ← بازگشت
                    </Button>
                ) : <Box />}
                {/* دکمه بازگشت به سایت */}
                <Link href="/" passHref>
                    <Button
                        variant="text"
                        sx={{
                            color: EMPLOYER_THEME.primary,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            '&:hover': {
                                backgroundColor: alpha(EMPLOYER_THEME.primary, 0.08),
                                color: EMPLOYER_THEME.dark,
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ← بازگشت به سایت
                    </Button>
                </Link>
            </Box>
            {/* فرم ثبت‌نام */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '480px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
            <Paper 
                elevation={isMobile ? 0 : 3} 
                sx={{ 
                    p: { xs: 2.5, sm: 3 },
                    pt: { xs: 2, sm: 3 },
                    pb: { xs: 4, sm: 3 },
                    borderRadius: { xs: 0, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: '100%',
                    boxShadow: isMobile ? 'none' : '0px 3px 15px rgba(0, 0, 0, 0.1)',
                    mt: isMobile ? 0 : 0,
                    mb: 'auto',
                    mx: 'auto',
                    maxWidth: isMobile ? '100%' : '480px'
                }}
            >
                {/* هدر انیمیشنی با اطلاعات مرحله */}
                <Box 
                    sx={{ 
                        mb: { xs: 3, sm: 4 }, 
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* عنوان اصلی */}
                    <Typography 
                        variant="h5" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 2,
                            fontSize: { xs: '1.5rem', sm: '1.7rem' },
                            letterSpacing: '0.01em',
                            background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center'
                        }}
                    >
                        ثبت‌نام در ماهرکار
                    </Typography>
                    {/* کارت اطلاعات مرحله ثابت */}
                    <Box
                        sx={{
                            background: `linear-gradient(135deg, ${alpha(EMPLOYER_THEME.primary, 0.08)}, ${alpha(EMPLOYER_THEME.light, 0.05)})`,
                            borderRadius: 3,
                            px: 3,
                            py: 2,
                            border: `1px solid ${alpha(EMPLOYER_THEME.primary, 0.12)}`,
                            backdropFilter: 'blur(10px)',
                            maxWidth: '320px',
                            mx: 'auto',
                            position: 'relative',
                            minHeight: '90px' // حفظ ارتفاع ثابت
                        }}
                    >
                        {/* شماره مرحله با انیمیشن محو و پیدا */}
                        <Typography 
                            key={`step-number-${activeStep}`}
                            variant="caption" 
                            sx={{ 
                                color: alpha(EMPLOYER_THEME.primary, 0.7),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                mb: 0.5,
                                display: 'block',
                                animation: 'fadeChange 0.6s ease-in-out',
                                '@keyframes fadeChange': {
                                    '0%': { opacity: 1 },
                                    '30%': { opacity: 0, transform: 'translateY(-5px)' },
                                    '70%': { opacity: 0, transform: 'translateY(5px)' },
                                    '100%': { opacity: 1, transform: 'translateY(0)' }
                                }
                            }}
                        >
                            مرحله {toPersianNumbers(activeStep + 1)} از {toPersianNumbers(3)}
                        </Typography>
                        
                        {/* عنوان مرحله با انیمیشن محو و پیدا */}
                        <Typography 
                            key={`step-title-${activeStep}`}
                            variant="subtitle1" 
                            sx={{ 
                                color: EMPLOYER_THEME.primary,
                                fontWeight: 700,
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                lineHeight: 1.3,
                                animation: 'fadeChange 0.6s ease-in-out 0.1s both',
                            }}
                        >
                            {activeStep === 0 && 'تایید شماره تلفن'}
                            {activeStep === 1 && 'تکمیل اطلاعات'}
                            {activeStep === 2 && 'تایید کد ارسالی'}
                        </Typography>

                        {/* Progress Bar مینیمال */}
                        <Box
                            sx={{
                                width: '100%',
                                height: 3,
                                backgroundColor: alpha(EMPLOYER_THEME.primary, 0.1),
                                borderRadius: 1.5,
                                mt: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                                    borderRadius: 1.5,
                                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                    width: `${((activeStep + 1) / 3) * 100}%`,
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                                        animation: 'shimmer 2s ease-in-out infinite 1s'
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {/* انیمیشن‌های CSS */}
                    <style jsx>{`
                        @keyframes shimmer {
                            0% { left: -100%; }
                            100% { left: 100%; }
                        }
                    `}</style>
                </Box>



                    {/* فرم‌ها */}
                    {activeStep === 0 && renderPhoneForm()}
                    {activeStep === 1 && renderUserInfoForm()}
                    {activeStep === 2 && renderOtpForm()}
                </Paper>
            </Box>
        </Box>
    );
} 