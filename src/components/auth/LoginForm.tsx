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
    IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAuthStore, useAuthActions, useAuthStatus } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';
import { EMPLOYER_THEME } from '@/constants/colors';
import { ErrorHandler } from '@/components/common/ErrorHandler';
import toast from 'react-hot-toast';
import OtpInput from '@/components/common/OtpInput';
import NumberTextField from '../common/NumberTextField';

// Wrapper component for parts that need useSearchParams
const LoginFormContent = ({ onSuccess, activeStep, setActiveStep, isMobile, onPhoneFocusChange, onOtpFocusChange, scrollContainerRef }: { 
    onSuccess?: () => void;
    activeStep: number;
    setActiveStep: (step: number) => void;
    isMobile: boolean;
    onPhoneFocusChange?: (focused: boolean) => void;
    onOtpFocusChange?: (focused: boolean) => void;
    scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}) => {
    // استفاده از Zustand به جای Context API
    const { loginOtp, validateLoginOtp } = useAuthActions();
    const { loading, loginError } = useAuthStatus();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [token, setToken] = useState('');
    const [formErrors, setFormErrors] = useState<{
        phone?: string;
        otp?: string;
        non_field_errors?: string;
    }>({});

    // کنترل فوکوس ورودی شماره تلفن و اسکرول در موبایل
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    // کنترل فوکوس OTP در مرحله دوم
    const [isOtpFocused, setIsOtpFocused] = useState(false);
    const [inlineOtpSubmitPressed, setInlineOtpSubmitPressed] = useState(false);
    const autoSubmitTriggeredRef = useRef<boolean>(false);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const phoneFieldRef = useRef<HTMLDivElement | null>(null);
    const phoneFormRef = useRef<HTMLFormElement | null>(null);
    const [inlineSubmitPressed, setInlineSubmitPressed] = useState(false);

    // تایمر ارسال مجدد کد OTP
    const [resendTimer, setResendTimer] = useState(0); // شمارنده به ثانیه

    // دریافت redirect URL از پارامترهای URL
    const redirectUrl = searchParams.get('redirect') || '/';

    // بررسی وجود تایمر در localStorage هنگام لود اولیه
    useEffect(() => {
        const checkExistingTimer = () => {
            const phoneKey = phone.trim();
            if (!phoneKey) return;
            
            try {
                const storedData = localStorage.getItem(`otp_timer_${phoneKey}`);
                if (storedData) {
                    const { endTime } = JSON.parse(storedData);
                    const now = new Date().getTime();
                    const remainingTime = Math.round((endTime - now) / 1000);
                    
                    if (remainingTime > 0) {
                        setResendTimer(remainingTime);
                        // اگر قبلاً مرحله OTP را دیده بود، مستقیم به آن برو
                        if (localStorage.getItem(`otp_step_${phoneKey}`) === 'true') {
                            setActiveStep(1);
                        }
                    } else {
                        // اگر تایمر منقضی شده، پاک کن
                        localStorage.removeItem(`otp_timer_${phoneKey}`);
                        localStorage.removeItem(`otp_step_${phoneKey}`);
                    }
                }
            } catch (error) {
                console.error('خطا در بازیابی تایمر:', error);
            }
        };
        
        checkExistingTimer();
    }, [phone]);

    // وقتی کد ارسال می‌شود، تایمر شروع به کار می‌کند
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prevTimer) => prevTimer - 1);
                
                // هر ثانیه بررسی شود که آیا تایمر به پایان رسیده
                if (resendTimer <= 1) {
                    const phoneKey = phone.trim();
                    if (phoneKey) {
                        localStorage.removeItem(`otp_timer_${phoneKey}`);
                    }
                }
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer, phone]);

    // استفاده از هوک تم و وضعیت دستگاه
    const theme = useTheme();
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const employerColors = EMPLOYER_THEME;

    // پاک کردن خطاهای فرم هنگام تغییر مقادیر
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        if (formErrors.phone) {
            setFormErrors(prev => ({ ...prev, phone: undefined }));
        }
    };

    const handlePhoneFocus = () => {
        if (!isMobile) return;
        setIsPhoneFocused(true);
        if (onPhoneFocusChange) onPhoneFocusChange(true);
        try {
            // هدف اصلی: خود فیلد شماره تلفن تا هدر هم در بالا دیده شود (با scrollMarginTop)
            const targetEl = (phoneFieldRef.current as HTMLDivElement | null) ?? (headerRef.current as HTMLDivElement | null);
            const containerEl = scrollContainerRef?.current ?? null;
            const offset = 24; // چند پیکسل برای دیده شدن تیتر
            if (targetEl !== null && containerEl) {
                const targetRect = targetEl.getBoundingClientRect();
                const containerRect = containerEl.getBoundingClientRect();
                const currentScroll = containerEl.scrollTop;
                const targetScrollTop = currentScroll + (targetRect.top - containerRect.top) - offset;
                containerEl.scrollTo({ top: Math.max(targetScrollTop, 0), behavior: 'auto' });
            }
            // تلاش مستقیم روی خود input برای سازگاری iOS/Android
            if (targetEl !== null) {
                const inputEl = targetEl.querySelector?.('input') as HTMLElement | null;
                if (inputEl) {
                    inputEl.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
                } else {
                    targetEl.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
                }
            }
            if (!containerEl && targetEl !== null) {
                const rect = targetEl.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY - offset;
                window.scrollTo({ top: absoluteTop, behavior: 'auto' });
            }
        } catch {}
    };

    const handlePhoneBlur = () => {
        if (!isMobile) return;
        // اگر کاربر در حال فشار دادن دکمه inline است، فوکوس را نگه داریم تا دکمه جابجا نشود
        if (!inlineSubmitPressed) {
            setIsPhoneFocused(false);
            if (onPhoneFocusChange) onPhoneFocusChange(false);
        }
    };

    // اصلاح: مدیریت تغییرات کد OTP با کامپوننت جدید
    const handleOtpChange = (value: string) => {
        setOtpCode(value);
        if (formErrors.otp) {
            setFormErrors(prev => ({ ...prev, otp: undefined }));
        }
    };

    // اعتبارسنجی فرم شماره تلفن
    const validatePhoneForm = () => {
        const errors: { phone?: string } = {};
        let isValid = true;

        // بررسی شماره تلفن (اعداد انگلیسی)
        if (!phone) {
            errors.phone = 'شماره تلفن الزامی است';
            isValid = false;
        } else if (!/^09\d{9}$/.test(phone)) {
            errors.phone = 'شماره تلفن باید با ۰۹ شروع شده و ۱۱ رقم باشد';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // اعتبارسنجی فرم کد OTP
    const validateOtpForm = () => {
        const errors: { otp?: string } = {};
        let isValid = true;

        // بررسی کد OTP
        if (!otpCode) {
            errors.otp = 'کد تأیید الزامی است';
            isValid = false;
        } else if (!/^\d{6}$/.test(otpCode)) {
            errors.otp = 'کد تأیید باید ۶ رقم باشد';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // ریست کردن فلگ ارسال خودکار وقتی هنوز ۶ رقم کامل نشده یا از مرحله ۲ خارج شد
    useEffect(() => {
        if (activeStep !== 1 || otpCode.length < 6) {
            autoSubmitTriggeredRef.current = false;
        }
    }, [otpCode, activeStep]);

    // ارسال خودکار فرم مرحله ۲ وقتی OTP کامل شد
    useEffect(() => {
        if (activeStep === 1 && /^\d{6}$/.test(otpCode) && !loading && !autoSubmitTriggeredRef.current) {
            autoSubmitTriggeredRef.current = true;
            const form = document.getElementById('login-otp-form') as HTMLFormElement | null;
            if (form) {
                // بستن کیبورد برای UX بهتر
                try {
                    const firstInput = document.querySelector('#otp-section input') as HTMLElement | null;
                    firstInput?.blur();
                } catch {}
                form.requestSubmit();
            }
        }
    }, [otpCode, activeStep, loading]);

    // تابع ارسال فرم شماره تلفن
    const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validatePhoneForm()) {
            return;
        }

        // بررسی اگر تایمر از قبل فعال بود
        const phoneKey = phone.trim();
        try {
            const storedData = localStorage.getItem(`otp_timer_${phoneKey}`);
            if (storedData) {
                const { endTime } = JSON.parse(storedData);
                const now = new Date().getTime();
                const remainingTime = Math.round((endTime - now) / 1000);
                
                if (remainingTime > 0) {
                    // اگر تایمر فعال است، مستقیم به مرحله دوم برو و تایمر را تنظیم کن
                    setResendTimer(remainingTime);
                    setActiveStep(1);
                    localStorage.setItem(`otp_step_${phoneKey}`, 'true');
                    return;
                } else {
                    // تایمر منقضی شده، پاکش کن
                    localStorage.removeItem(`otp_timer_${phoneKey}`);
                    localStorage.removeItem(`otp_step_${phoneKey}`);
                }
            }
        } catch (error) {
            console.error('خطا در بررسی تایمر:', error);
        }

        try {
            const receivedToken = await loginOtp(phone);
            setToken(receivedToken);
            toast.success('کد تأیید به شماره تلفن شما ارسال شد');
            setActiveStep(1);
            
            // تنظیم تایمر و ذخیره در localStorage
            setResendTimer(120);
            const now = new Date().getTime();
            const endTime = now + (120 * 1000); // ۱۲۰ ثانیه بعد
            localStorage.setItem(`otp_timer_${phoneKey}`, JSON.stringify({ endTime }));
            localStorage.setItem(`otp_step_${phoneKey}`, 'true'); // نشانه اینکه قبلاً به مرحله OTP رفته
            
        } catch (error: any) {
            console.error('خطا در ارسال کد تایید برای ورود:', error);
            setFormErrors({});

            // بررسی خطای "شماره تلفن موجود نیست"
            const errorMessage = error.response?.data?.phone?.[0] || 
                               error.response?.data?.Detail?.phone || 
                               (Array.isArray(error.response?.data?.non_field_errors) ? 
                                error.response?.data?.non_field_errors[0] : 
                                error.response?.data?.non_field_errors) ||
                               error.response?.data?.Detail || 
                               error.message;


            if (typeof errorMessage === 'string' && 
                (errorMessage.includes('شماره تلفن موجود نیست') || 
                 errorMessage.includes('موجود نیست'))) {
                // بدون نمایش خطا، مستقیم به صفحه ثبت‌نام برو با شماره تلفن
                router.push(`/register?phone=${encodeURIComponent(phone)}`);
                return;
            }

            // مدیریت سایر خطاها
            if (error.response?.data) {
                const apiErrors: Record<string, string> = {};

                if (error.response.data.phone) {
                    apiErrors.phone = Array.isArray(error.response.data.phone)
                        ? error.response.data.phone[0]
                        : error.response.data.phone;
                }

                if (error.response.data.non_field_errors) {
                    apiErrors.non_field_errors = Array.isArray(error.response.data.non_field_errors)
                        ? error.response.data.non_field_errors[0]
                        : error.response.data.non_field_errors;
                }

                if (error.response.data.Detail) {
                    if (typeof error.response.data.Detail === 'string') {
                        apiErrors.non_field_errors = error.response.data.Detail;
                    } else if (typeof error.response.data.Detail === 'object') {
                        if (error.response.data.Detail.phone) {
                            apiErrors.phone = Array.isArray(error.response.data.Detail.phone)
                                ? error.response.data.Detail.phone[0]
                                : error.response.data.Detail.phone;
                        }
                        if (error.response.data.Detail.message) {
                            apiErrors.non_field_errors = error.response.data.Detail.message;
                        }
                    }
                }

                if (Object.keys(apiErrors).length > 0) {
                    setFormErrors(apiErrors);
                } else {
                    setFormErrors({
                        non_field_errors: 'خطا در ارسال درخواست. لطفاً دوباره تلاش کنید.'
                    });
                }
            } else if (error.message) {
                setFormErrors({
                    non_field_errors: error.message
                });
            } else {
                setFormErrors({
                    non_field_errors: 'خطا در ارسال درخواست. لطفاً دوباره تلاش کنید.'
                });
            }
        }
    };

    // تابع ارسال فرم کد OTP
    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateOtpForm()) {
            return;
        }

        try {
            const userData = await validateLoginOtp(token, otpCode);
            
            // اگر اطلاعات کاربر ناقص باشد، یک پیام هشدار نمایش دهیم
            if (!userData || (!userData.phone && !userData.user_type)) {
                toast('اطلاعات کاربری شما به صورت کامل دریافت نشد. لطفاً اطلاعات پروفایل خود را تکمیل کنید.', {
                    duration: 5000,
                    icon: '⚠️',
                    style: {
                        backgroundColor: '#fff8e1',
                        color: '#ff9800'
                    }
                });
            }

            // پاک کردن اطلاعات تایمر از localStorage
            const phoneKey = phone.trim();
            if (phoneKey) {
                localStorage.removeItem(`otp_timer_${phoneKey}`);
                localStorage.removeItem(`otp_step_${phoneKey}`);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                // استفاده از مسیر redirect در صورت وجود
                const decodedRedirectUrl = redirectUrl ? decodeURIComponent(redirectUrl) : '/';
                router.push(decodedRedirectUrl);
            }
        } catch (error: any) {
            console.error('خطا در تایید کد OTP:', error);

            // پاک کردن خطاهای قبلی
            setFormErrors({});

            // خطاهای مختلف API
            if (error.response?.data) {
                const apiErrors: Record<string, string> = {};

                // مدیریت ساختارهای مختلف خطا
                if (error.response.data.code) {
                    const codeError = Array.isArray(error.response.data.code)
                        ? error.response.data.code[0]
                        : error.response.data.code;
                    apiErrors.otp = 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.';
                }

                if (error.response.data.non_field_errors) {
                    const nonFieldError = Array.isArray(error.response.data.non_field_errors)
                        ? error.response.data.non_field_errors[0]
                        : error.response.data.non_field_errors;
                    if (nonFieldError.includes('کد تایید') || nonFieldError.includes('OTP')) {
                        apiErrors.otp = 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.';
                    } else {
                        apiErrors.non_field_errors = nonFieldError;
                    }
                }

                // ساختار Detail
                if (error.response.data.Detail) {
                    if (typeof error.response.data.Detail === 'string') {
                        if (error.response.data.Detail.includes('کد تایید') || error.response.data.Detail.includes('OTP')) {
                            apiErrors.otp = 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.';
                        } else {
                            apiErrors.non_field_errors = error.response.data.Detail;
                        }
                    } else if (typeof error.response.data.Detail === 'object') {
                        if (error.response.data.Detail.code) {
                            apiErrors.otp = 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.';
                        }
                        if (error.response.data.Detail.message) {
                            if (error.response.data.Detail.message.includes('کد تایید') || error.response.data.Detail.message.includes('OTP')) {
                                apiErrors.otp = 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.';
                            } else {
                                apiErrors.non_field_errors = error.response.data.Detail.message;
                            }
                        }
                    }
                }

                // خطاهای عمومی
                if (error.response.data.error) {
                    if (error.response.data.error.includes('کد تایید') || error.response.data.error.includes('OTP')) {
                        apiErrors.otp = 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.';
                    } else {
                        apiErrors.non_field_errors = error.response.data.error;
                    }
                }

                if (error.response.data.message) {
                    if (error.response.data.message.includes('کد تایید') || error.response.data.message.includes('OTP')) {
                        apiErrors.otp = 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.';
                    } else {
                        apiErrors.non_field_errors = error.response.data.message;
                    }
                }

                // اگر حداقل یک خطا پیدا شد، آن را نمایش می‌دهیم
                if (Object.keys(apiErrors).length > 0) {
                    setFormErrors(apiErrors);
                } else {
                    setFormErrors({
                        otp: 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.'
                    });
                }
            }
            // اگر خطا مستقیماً پیام داشته باشد
            else if (error.message) {
                if (error.message.includes('کد تایید') || error.message.includes('OTP')) {
                    setFormErrors({
                        otp: 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.'
                    });
                } else {
                    setFormErrors({
                        non_field_errors: error.message
                    });
                }
            }
            // اگر هیچ اطلاعاتی در خطا وجود نداشت
            else {
                setFormErrors({
                    otp: 'کد تایید وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.'
                });
            }
        }
    };

    // درخواست مجدد کد تایید
    const handleResendOtp = async () => {
        // اگر تایمر هنوز در حال شمارش است، اجازه ارسال مجدد نده
        if (resendTimer > 0) return;
        
        try {
            const receivedToken = await loginOtp(phone);
            setToken(receivedToken);
            setOtpCode('');
            toast.success('کد تأیید جدید به شماره تلفن شما ارسال شد');
            
            // تنظیم مجدد تایمر و ذخیره در localStorage
            setResendTimer(120);
            const phoneKey = phone.trim();
            const now = new Date().getTime();
            const endTime = now + (120 * 1000); // ۱۲۰ ثانیه بعد
            localStorage.setItem(`otp_timer_${phoneKey}`, JSON.stringify({ endTime }));
            
        } catch (error: any) {
            console.error('خطا در ارسال مجدد کد تایید:', error);
            toast.error('مشکل در ارسال مجدد کد تأیید. لطفاً دوباره تلاش کنید.');
        }
    };
    
    // تبدیل ثانیه به فرمت mm:ss فارسی
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        
        const formattedMins = mins < 10 ? `۰${faDigits[mins]}` : `${faDigits[Math.floor(mins/10)]}${faDigits[mins%10]}`;
        const formattedSecs = secs < 10 ? `۰${faDigits[secs]}` : `${faDigits[Math.floor(secs/10)]}${faDigits[secs%10]}`;
        
        return `${formattedMins}:${formattedSecs}`;
    };

    useEffect(() => {
        // بررسی خطای شماره تلفن در هر دو فیلد phone و non_field_errors
        const phoneError = formErrors.phone;
        const nonFieldError = formErrors.non_field_errors;
        
        if ((phoneError && phoneError.includes('شماره تلفن موجود نیست')) || 
            (nonFieldError && nonFieldError.includes('شماره تلفن موجود نیست'))) {
            toast.error('شماره تلفن شما در سیستم ثبت نشده است');
            setTimeout(() => {
                router.push('/register');
            }, 2000);
        }
    }, [formErrors.phone, formErrors.non_field_errors, router]);

    // در بالای فایل پس از ایمپورت‌ها تابع تبدیل اعداد به فارسی اضافه می‌شود
    const convertToPersianNumbers = (text: string): string => {
      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return text.replace(/[0-9]/g, (match) => persianNumbers[parseInt(match)]);
    };

    return (
        <Paper 
            elevation={isMobile ? 0 : 3} 
            sx={{ 
                p: { xs: 2, sm: 4 },
                borderRadius: { xs: 0, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                boxShadow: isMobile ? 'none' : '0px 3px 15px rgba(0, 0, 0, 0.1)',
                mt: isMobile ? 0 : 0,
                mb: 'auto',
                mx: 'auto',
                maxWidth: isMobile ? '100%' : '500px',
                backgroundColor: isMobile ? 'transparent' : '#ffffff'
            }}
        >
            <Box ref={headerRef} sx={{ mb: 3, textAlign: 'center', mt: isMobile ? 1 : 0, scrollMarginTop: '24px' }}>
                <Typography 
                    variant="h5" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '1.7rem' },
                        letterSpacing: '0.01em',
                        background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center'
                    }}
                >
                    ورود به ماهرکار
                </Typography>
            </Box>

            {/* نمایش خطاهای عمومی */}
            {formErrors.non_field_errors && (
                <Typography
                    color="error"
                    sx={{ mb: 2, textAlign: 'center', fontWeight: 'medium' }}
                >
                    {formErrors.non_field_errors}
                </Typography>
            )}

            {activeStep === 0 ? (
                <form ref={phoneFormRef} id="login-phone-form" onSubmit={handlePhoneSubmit}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 3, sm: 3 },
                    width: '100%'
                }}>
                    <Box ref={phoneFieldRef} sx={{ scrollMarginTop: '56px' }}>
                        <NumberTextField
                            fullWidth
                            id="phone"
                            label="شماره تلفن"
                            variant="outlined"
                            value={phone}
                            onChange={handlePhoneChange}
                            onFocus={handlePhoneFocus}
                            onBlur={handlePhoneBlur}
                            error={!!formErrors.phone}
                            helperText={formErrors.phone}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon sx={{ color: EMPLOYER_THEME.primary }} />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            isMobile={isMobile}
                            size={isMobile ? "medium" : "medium"}
                            autoFocus
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: isMobile ? '#f8fafd' : '#f8fafd',
                                    border: '1px solid #e3f2fd',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: isMobile ? '#f0f4ff' : '#ffffff',
                                        borderColor: EMPLOYER_THEME.light,
                                        boxShadow: '0 2px 8px rgba(65, 135, 255, 0.1)',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: isMobile ? '#f0f4ff' : '#ffffff',
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

                    {/* دکمه در حالت موبایل هنگام فوکوس/فشار زیر ورودی نمایش داده می‌شود؛ در دسکتاپ همواره زیر ورودی است */}
                    {(!isMobile || (isMobile && (isPhoneFocused || inlineSubmitPressed))) && (
                    <Box>
                            <Button
                                type="button"
                            fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                onMouseDown={() => setInlineSubmitPressed(true)}
                                onTouchStart={() => setInlineSubmitPressed(true)}
                                onClick={(e) => {
                                    // اگر blur باعث جابجایی شد، submit را با form id ارسال کنیم
                                    const form = document.getElementById('login-phone-form') as HTMLFormElement | null;
                                    form?.requestSubmit();
                                }}
                                sx={{
                                    mt: { xs: 2, sm: 2 },
                                    py: { xs: 1.5, sm: 1.5 },
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
                                    borderRadius: { xs: 2, sm: 2 },
                                    fontSize: { xs: '1rem', sm: '1rem' },
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'دریافت کد تأیید'
                                )}
                            </Button>
                        </Box>
                    )}
                    </Box>
                </form>
            ) : (
                <form onSubmit={handleOtpSubmit} id="login-otp-form">
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: activeStep === 1 ? 1 : 3, sm: 3 },
                        width: '100%'
                    }}>
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
                                    {convertToPersianNumbers(phone)}
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

                        <Box id="otp-section" sx={{ scrollMarginTop: '56px' }}>
                            <OtpInput
                                value={otpCode}
                                onChange={handleOtpChange}
                                length={6}
                                error={!!formErrors.otp}
                                helperText={formErrors.otp}
                                autoFocus={true}
                                disabled={loading}
                                onFocus={() => {
                                    if (isMobile) {
                                        setIsOtpFocused(true);
                                        if (onOtpFocusChange) onOtpFocusChange(true);
                                        setInlineOtpSubmitPressed(false);
                                        try {
                                            const containerEl = scrollContainerRef?.current ?? null;
                                            const targetEl = document.getElementById('otp-section') ?? headerRef.current;
                                            const offset = 56; // اسکرول کمی بیشتر برای قرارگیری بهتر

                                            const doScroll = () => {
                                                if (containerEl && targetEl) {
                                                    const rect = targetEl.getBoundingClientRect();
                                                    const crect = containerEl.getBoundingClientRect();
                                                    const targetScrollTop = containerEl.scrollTop + (rect.top - crect.top) - offset;
                                                    containerEl.scrollTo({ top: Math.max(targetScrollTop, 0), behavior: 'auto' });
                                                }
                                                // فallback جهانی برای برخی مرورگرها
                                                const y = Math.max(
                                                    document.documentElement.scrollTop,
                                                    document.body.scrollTop
                                                );
                                                window.scrollTo({ top: y + 1, behavior: 'auto' });
                                            };

                                            // اجرای فوری + تکرار بعد از رندر/باز شدن کیبورد
                                            doScroll();
                                            requestAnimationFrame(() => requestAnimationFrame(() => doScroll()));
                                            setTimeout(doScroll, 180);
                                            setTimeout(doScroll, 360);
                                            setTimeout(doScroll, 600);
                                        } catch {}
                                    }
                                }}
                                onBlur={() => {
                                    // اگر کاربر در حال زدن دکمه ورود زیر OTP است، فعلاً دکمه را مخفی نکن
                                    if (!inlineOtpSubmitPressed) {
                                        setIsOtpFocused(false);
                                        if (onOtpFocusChange) onOtpFocusChange(false);
                                        try {
                                            const containerEl = scrollContainerRef?.current ?? null;
                                            if (containerEl) {
                                                containerEl.scrollTo({ top: containerEl.scrollHeight, behavior: 'auto' });
                                            }
                                        } catch {}
                                    }
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
                                        disabled={loading || resendTimer > 0}
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
                        </Box>

                    {/* دکمه ورود زیر OTP: فقط هنگام فوکوس در موبایل، در دسکتاپ همیشه */}
                    {(!isMobile || (isMobile && (isOtpFocused || inlineOtpSubmitPressed))) && (
                        <Box sx={{ width: '100%', alignSelf: 'stretch' }}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                onMouseDown={() => setInlineOtpSubmitPressed(true)}
                                onTouchStart={() => setInlineOtpSubmitPressed(true)}
                                onClick={() => {
                                    const form = document.getElementById('login-otp-form') as HTMLFormElement | null;
                                    form?.requestSubmit();
                                    // بعد از تریگر سابمیت، اجازه بده حالت به فوتر برگردد
                                    setTimeout(() => setInlineOtpSubmitPressed(false), 0);
                                }}
                                sx={{
                                    mt: { xs: 1, sm: 2 },
                                    py: { xs: 1.5, sm: 1.5 },
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
                                    borderRadius: { xs: 2, sm: 2 },
                                    fontSize: { xs: '1rem', sm: '1rem' },
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'ورود'
                                )}
                            </Button>
                        </Box>
                    )}

                    </Box>
                </form>
            )}

            {/* نمایش لینک ثبت‌نام فقط در مرحله اول و در حالت دسکتاپ */}
            {activeStep === 0 && !isMobile && (
                <Box sx={{ mt: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                        <Typography variant="body1">
                            حساب کاربری ندارید؟{' '}
                            <MuiLink
                                component={Link}
                                href="/register"
                                underline="hover"
                                sx={{
                                    fontWeight: 'bold',
                                    color: EMPLOYER_THEME.primary,
                                    fontSize: 'inherit',
                                    '&:hover': {
                                        color: EMPLOYER_THEME.dark,
                                    },
                                    transition: 'color 0.2s ease',
                                }}
                            >
                                ثبت‌نام کنید
                            </MuiLink>
                        </Typography>
                    </Box>
            )}
        </Paper>
    );
};

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { loading } = useAuthStatus();
    const [activeStep, setActiveStep] = useState(0);
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [isOtpFocused, setIsOtpFocused] = useState(false);
    const [viewportHeight, setViewportHeight] = useState('100vh');
    const [mounted, setMounted] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);

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
                    backgroundColor: isMobile ? '#ffffff' : '#f8fafd',
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
                    {/* گزینه بازگشت به مرحله قبل (فقط در مرحله OTP) */}
                    {activeStep === 1 ? (
                        <Button
                            variant="text"
                            onClick={() => setActiveStep(0)}
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
                        overflowY: 'auto', // اجازه اسکرول عمودی فقط برای محتوای میانی
                        overflowX: 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        pb: 12
                    }}
                    ref={contentRef}
                >
                    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><CircularProgress /></Box>}>
                        <LoginFormContent 
                            onSuccess={onSuccess} 
                            activeStep={activeStep} 
                            setActiveStep={setActiveStep} 
                            isMobile={isMobile}
                            onPhoneFocusChange={setIsPhoneFocused}
                            onOtpFocusChange={setIsOtpFocused}
                            scrollContainerRef={contentRef}
                        />
                    </Suspense>
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
                        {/* دکمه دریافت کد تایید */}
                        {(activeStep === 0 && !isPhoneFocused) && (
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            onClick={() => {
                                // اگر در مرحله اول هستیم، فرم شماره تلفن را ارسال کن
                                if (activeStep === 0) {
                                    const form = document.getElementById('login-phone-form') as HTMLFormElement | null;
                                    form?.requestSubmit();
                                } else {
                                    // اگر در مرحله دوم هستیم، فرم OTP را ارسال کن
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
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'دریافت کد تأیید'
                            )}
                        </Button>
                        )}
                        {/* دکمه ورود در فوتر وقتی مرحله 2 و فوکوس روی OTP نیست */}
                        {(activeStep === 1 && !(isMobile && (isOtpFocused || (typeof document !== 'undefined' && document.getElementById('otp-section')?.contains(document.activeElement))))) && (
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                onClick={() => {
                                    const form = document.getElementById('login-otp-form') as HTMLFormElement | null;
                                    form?.requestSubmit();
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
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'ورود'
                                )}
                            </Button>
                        )}

                        {/* لینک ثبت‌نام فقط در مرحله اول نمایش داده شود */}
                        {activeStep === 0 && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2">
                                    حساب کاربری ندارید؟{' '}
                                    <MuiLink
                                        component={Link}
                                        href="/register"
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
                                        ثبت‌نام کنید
                                    </MuiLink>
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
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
                    maxWidth: '500px',
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
                {activeStep === 1 ? (
                    <Button
                        variant="text"
                        onClick={() => setActiveStep(0)}
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

            {/* فرم لاگین */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}><CircularProgress /></Box>}>
                    <LoginFormContent onSuccess={onSuccess} activeStep={activeStep} setActiveStep={setActiveStep} isMobile={isMobile} />
                </Suspense>
            </Box>
        </Box>
    );
} 

