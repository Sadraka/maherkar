'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    StepIconProps,
    Link as MuiLink,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import Link from 'next/link';
import { EMPLOYER_THEME } from '@/constants/colors';
import { ErrorHandler } from '@/components/common/ErrorHandler';
import axios from 'axios';
import authService from '@/lib/authService';
import { toast } from 'react-hot-toast';

// کامپوننت آیکون مراحل با اعداد فارسی
const PersianStepIcon = (props: StepIconProps) => {
    const { active, completed, icon } = props;

    // تبدیل اعداد انگلیسی به فارسی
    const getPersianNumber = (num: number): string => {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/[0-9]/g, match => persianDigits[parseInt(match)]);
    };

    return (
        <Box sx={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: completed || active ? EMPLOYER_THEME.primary : '#ccc',
            color: '#fff',
            fontWeight: 'bold',
        }}>
            {completed ? (
                '✓'
            ) : (
                <Typography variant="body2" component="span" fontWeight="bold">
                    {getPersianNumber(Number(icon))}
                </Typography>
            )}
        </Box>
    );
};

interface RegisterFormProps {
    onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
    const { register, verifyOtp, isAuthenticated, loading, checkPhoneExists } = useAuth();
    const router = useRouter();
    const employerColors = EMPLOYER_THEME;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // وضعیت ارسال فرم در مراحل مختلف
    const [isSubmitting, setIsSubmitting] = useState(false);

    // مرحله فعلی ثبت‌نام
    const [activeStep, setActiveStep] = useState(0);

    // توکن OTP دریافتی در مرحله اول
    const [phoneOtpToken, setPhoneOtpToken] = useState('');

    // کد OTP وارد شده توسط کاربر در مرحله دوم
    const [phoneOtpCode, setPhoneOtpCode] = useState('');

    // خطای کد تایید
    const [otpError, setOtpError] = useState('');

    // فرم ثبت‌نام
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        password_conf: '',
        full_name: '',
        user_type: 'JS', // پیش‌فرض: جوینده کار
    });

    // خطاهای اعتبارسنجی فرم
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneOtpCode(e.target.value);
        setOtpError('');
    };

    // اعتبارسنجی شماره تلفن (مرحله اول)
    const validatePhoneForm = () => {
        let isValid = true;
        const errors: Record<string, string> = {};

        // اعتبارسنجی شماره تلفن
        if (!formData.phone) {
            errors.phone = 'شماره تلفن الزامی است';
            isValid = false;
        } else if (!/^09\d{9}$/.test(formData.phone)) {
            errors.phone = 'شماره تلفن باید با 09 شروع شده و 11 رقم باشد';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // اعتبارسنجی کد تایید (مرحله دوم)
    const validateOtpForm = () => {
        let isValid = true;

        if (!phoneOtpCode) {
            setOtpError('وارد کردن کد تایید الزامی است');
            isValid = false;
        } else if (phoneOtpCode.length !== 6) {
            setOtpError('کد تایید باید ۶ رقم باشد');
            isValid = false;
        }

        return isValid;
    };

    // اعتبارسنجی اطلاعات کاربر (مرحله سوم)
    const validateUserForm = () => {
        let isValid = true;
        const errors: Record<string, string> = {};

        // اعتبارسنجی نام و نام خانوادگی
        if (!formData.full_name) {
            errors.full_name = 'وارد کردن نام و نام خانوادگی الزامی است';
            isValid = false;
        }

        // اعتبارسنجی نام کاربری
        if (!formData.username) {
            errors.username = 'وارد کردن نام کاربری الزامی است';
            isValid = false;
        } else if (formData.username.length < 3) {
            errors.username = 'نام کاربری باید حداقل ۳ کاراکتر باشد';
            isValid = false;
        }

        // اعتبارسنجی ایمیل
        if (!formData.email) {
            errors.email = 'وارد کردن ایمیل الزامی است';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'فرمت ایمیل نامعتبر است';
            isValid = false;
        }

        // اعتبارسنجی رمز عبور
        if (!formData.password) {
            errors.password = 'وارد کردن رمز عبور الزامی است';
            isValid = false;
        } else if (formData.password.length < 8) {
            errors.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
            isValid = false;
        }

        // اعتبارسنجی تکرار رمز عبور
        if (!formData.password_conf) {
            errors.password_conf = 'تکرار رمز عبور الزامی است';
            isValid = false;
        } else if (formData.password !== formData.password_conf) {
            errors.password_conf = 'رمز عبور و تکرار آن مطابقت ندارند';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // ارسال فرم مرحله اول (ارسال شماره تلفن و درخواست کد تایید)
    const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // اعتبارسنجی فرم شماره تلفن
        if (!validatePhoneForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // بررسی تکراری بودن شماره تلفن
            try {
                const phoneExists = await checkPhoneExists(formData.phone);

                if (phoneExists) {
                    setFormErrors(prev => ({
                        ...prev,
                        phone: 'این شماره تلفن قبلاً ثبت شده است'
                    }));
                    setIsSubmitting(false);
                    return;
                }

                // اگر شماره تلفن تکراری نبود، درخواست ارسال کد تایید
                // ارسال داده‌های موقت برای دریافت کد تایید
                const tempData = {
                    username: `temp_${formData.phone}`,
                    email: `${formData.phone}@temp.com`,
                    phone: formData.phone,
                    password: "password12345678",
                    password_conf: "password12345678",
                    full_name: "کاربر موقت",
                    user_type: "JS"
                };

                const token = await register(tempData);
                setPhoneOtpToken(token);
                setActiveStep(1); // رفتن به مرحله دوم (تایید شماره با کد)
                toast.success('کد تایید برای شماره شما ارسال شد');

            } catch (phoneError: any) {
                // تلاش برای تشخیص خطای تکراری بودن شماره از طریق پاسخ API
                if (phoneError.response?.data) {
                    // بررسی خطای فیلد phone
                    if (phoneError.response.data.phone) {
                        const phoneErrorMsg = Array.isArray(phoneError.response.data.phone)
                            ? phoneError.response.data.phone[0]
                            : phoneError.response.data.phone;

                        if (typeof phoneErrorMsg === 'string' && (
                            phoneErrorMsg.includes('قبلا ثبت شده') ||
                            phoneErrorMsg.includes('قبلاً ثبت شده') ||
                            phoneErrorMsg.includes('already exists') ||
                            phoneErrorMsg.includes('تکراری') ||
                            phoneErrorMsg.includes('already registered') ||
                            phoneErrorMsg.includes('already used') ||
                            phoneErrorMsg.includes('ثبت شده') ||
                            phoneErrorMsg.includes('وجود دارد') ||
                            phoneErrorMsg.includes('exists')
                        )) {
                            setFormErrors(prev => ({
                                ...prev,
                                phone: 'این شماره تلفن قبلاً ثبت شده است'
                            }));
                            setIsSubmitting(false);
                            return;
                        }
                    }

                    // بررسی کل پاسخ خطا
                    const errorResponseStr = JSON.stringify(phoneError.response.data).toLowerCase();
                    if (errorResponseStr.includes('phone') && (
                        errorResponseStr.includes('قبلا ثبت شده') ||
                        errorResponseStr.includes('قبلاً ثبت شده') ||
                        errorResponseStr.includes('already exists') ||
                        errorResponseStr.includes('تکراری') ||
                        errorResponseStr.includes('already registered') ||
                        errorResponseStr.includes('already used') ||
                        errorResponseStr.includes('ثبت شده') ||
                        errorResponseStr.includes('وجود دارد') ||
                        errorResponseStr.includes('exists')
                    )) {
                        setFormErrors(prev => ({
                            ...prev,
                            phone: 'این شماره تلفن قبلاً ثبت شده است'
                        }));
                        setIsSubmitting(false);
                        return;
                    }
                }

                // سایر خطاها
                setFormErrors(prev => ({
                    ...prev,
                    phone: 'خطا در بررسی شماره تلفن. لطفاً دوباره تلاش کنید.'
                }));
            }
        } catch (error: any) {
            console.error('خطا در بررسی شماره تلفن:', error);
            setFormErrors(prev => ({
                ...prev,
                phone: 'خطا در بررسی شماره تلفن. لطفاً دوباره تلاش کنید.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ارسال فرم مرحله دوم (تایید کد OTP شماره تلفن)
    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateOtpForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // در اینجا ما فقط صحت کد OTP را بررسی می‌کنیم
            // ولی ثبت‌نام کامل را انجام نمی‌دهیم

            try {
                // درخواست تایید کد OTP به API
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8000/auth'}/register-otp-validate/${phoneOtpToken}/`,
                    { code: phoneOtpCode }
                );

                // فقط اگر سرور کد 200 برگرداند به مرحله بعد می‌رویم
                if (response.status >= 200 && response.status < 300) {
                    // به مرحله بعدی می‌رویم بدون اینکه ثبت‌نام را کامل کنیم
                    setActiveStep(2);

                    // در اینجا متغیر formData را با اطلاعات شماره تلفن تنظیم می‌کنیم
                    // تا در مرحله بعد در دسترس باشد
                    setFormData(prev => ({
                        ...prev,
                        phone: formData.phone
                    }));

                    toast.success('شماره تلفن با موفقیت تایید شد');
                } else {
                    // اگر هر پاسخی غیر از موفقیت دریافت کنیم
                    setOtpError('کد تایید نامعتبر است');
                }
            } catch (validationError: any) {
                console.error('خطا در بررسی کد تایید:', validationError);

                // تنظیم پیام خطای مناسب بر اساس پاسخ سرور
                if (validationError.response) {
                    if (validationError.response.status === 400 || validationError.response.status === 401) {
                        setOtpError('کد تایید نامعتبر است');
                    } else if (validationError.response.status === 404) {
                        setOtpError('کد تایید منقضی شده است');
                    } else {
                        setOtpError('خطا در تایید کد. لطفاً دوباره تلاش کنید');
                    }

                    // بررسی پیام خطای داخل پاسخ
                    if (validationError.response.data?.Detail) {
                        const detailError = validationError.response.data.Detail;
                        if (typeof detailError === 'string') {
                            if (detailError.toLowerCase().includes('invalid')) {
                                setOtpError('کد تایید نامعتبر است');
                            } else if (detailError.toLowerCase().includes('expired')) {
                                setOtpError('کد تایید منقضی شده است');
                            }
                        } else if (typeof detailError === 'object' && detailError.Message) {
                            const message = detailError.Message.toLowerCase();
                            if (message.includes('invalid')) {
                                setOtpError('کد تایید نامعتبر است');
                            } else if (message.includes('expired')) {
                                setOtpError('کد تایید منقضی شده است');
                            }
                        }
                    }

                    // بررسی خطای ویژه کد
                    if (validationError.response.data?.code) {
                        setOtpError('کد تایید نامعتبر است');
                    }
                } else {
                    setOtpError('خطا در ارتباط با سرور. لطفاً بعداً دوباره تلاش کنید');
                }
            }
        } catch (error: any) {
            console.error('خطا در تایید کد:', error);

            // تنظیم پیام خطای فارسی برای تمام حالت‌ها
            if (error.response?.data?.code) {
                setOtpError('کد تایید نامعتبر است');
            } else if (error.response?.data?.Detail) {
                const detailError = error.response.data.Detail;
                if (typeof detailError === 'string') {
                    // تبدیل پیام خطای انگلیسی احتمالی به فارسی
                    if (detailError.toLowerCase().includes('invalid')) {
                        setOtpError('کد تایید نامعتبر است');
                    } else if (detailError.toLowerCase().includes('expired')) {
                        setOtpError('کد تایید منقضی شده است');
                    } else {
                        setOtpError('خطا در تایید کد: ' + detailError);
                    }
                } else if (typeof detailError === 'object' && detailError.Message) {
                    // تبدیل پیام خطای انگلیسی احتمالی به فارسی
                    const message = detailError.Message.toLowerCase();
                    if (message.includes('invalid')) {
                        setOtpError('کد تایید نامعتبر است');
                    } else if (message.includes('expired')) {
                        setOtpError('کد تایید منقضی شده است');
                    } else {
                        setOtpError('خطا در تایید کد: ' + detailError.Message);
                    }
                }
            } else {
                setOtpError('کد تایید نامعتبر است یا منقضی شده است');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ارسال فرم مرحله سوم (تکمیل اطلاعات کاربر و ثبت‌نام نهایی)
    const handleUserInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // اعتبارسنجی فرم
        if (!validateUserForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // ارسال اطلاعات کاربر به API برای ثبت‌نام نهایی
            await register(formData);

            // در صورت موفقیت، پیام نمایش داده می‌شود
            toast.success('ثبت‌نام با موفقیت انجام شد');

            // کاربر به صفحه اصلی هدایت می‌شود (از طریق useEffect)
        } catch (error: any) {
            console.error('خطا در ثبت‌نام:', error);
            // به جای نمایش toast خطا، خطاها را در فرم نمایش می‌دهیم
            if (error.response?.data) {
                const apiErrors = error.response.data;
                let updatedErrors = { ...formErrors };

                // بررسی خطاهای مربوط به هر فیلد
                Object.keys(formData).forEach(field => {
                    if (apiErrors[field]) {
                        const fieldError = Array.isArray(apiErrors[field])
                            ? apiErrors[field][0]
                            : apiErrors[field];
                        updatedErrors[field] = fieldError;
                    }
                });

                // بررسی خطاهای عمومی
                if (apiErrors.non_field_errors || apiErrors.__all__ || apiErrors.Detail) {
                    const generalError = apiErrors.non_field_errors || apiErrors.__all__ || apiErrors.Detail;
                    if (typeof generalError === 'string') {
                        // نمایش خطای عمومی در یکی از فیلدها (مثلاً نام کاربری)
                        updatedErrors.username = generalError;
                    } else if (Array.isArray(generalError)) {
                        updatedErrors.username = generalError[0];
                    } else if (typeof generalError === 'object' && generalError.Message) {
                        updatedErrors.username = generalError.Message;
                    }
                }

                setFormErrors(updatedErrors);
            } else if (error.message) {
                // اگر فقط خطای متنی داشتیم
                setFormErrors(prev => ({
                    ...prev,
                    username: error.message
                }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ارسال مجدد کد OTP
    const handleResendOtp = async () => {
        setIsSubmitting(true);

        try {
            // ارسال مجدد درخواست کد تایید با همان شماره تلفن
            const tempData = {
                username: `temp_${formData.phone}`,
                email: `${formData.phone}@temp.com`,
                phone: formData.phone,
                password: "password12345678",
                password_conf: "password12345678",
                full_name: "کاربر موقت",
                user_type: "JS"
            };

            const token = await register(tempData);
            setPhoneOtpToken(token);

            // پاک کردن کد قبلی
            setPhoneOtpCode('');
            setOtpError('');
            toast.success('کد تایید جدید ارسال شد');
        } catch (error: any) {
            // خطاهای ارسال مجدد کد را در فیلد OTP نمایش می‌دهیم
            if (error.response?.data) {
                if (error.response.data.Detail) {
                    const detailError = error.response.data.Detail;
                    if (typeof detailError === 'string') {
                        setOtpError(detailError);
                    } else if (typeof detailError === 'object' && detailError.Message) {
                        setOtpError(detailError.Message);
                    }
                } else {
                    setOtpError('خطا در ارسال مجدد کد تایید');
                }
            } else {
                setOtpError('خطا در ارسال مجدد کد تایید');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // رندر فرم مرحله اول (شماره تلفن)
    const renderPhoneForm = () => {
        // تعریف متغیر isMobile درون تابع
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        return (
            <Box component="form" onSubmit={handlePhoneSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <TextField
                            fullWidth
                            name="phone"
                            label="شماره همراه"
                            variant="outlined"
                            value={formData.phone}
                            onChange={handleChange}
                            error={!!formErrors.phone}
                            helperText={formErrors.phone}
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ dir: "ltr" }}
                        />
                    </Box>

                    <Box>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                backgroundColor: employerColors.primary,
                                '&:hover': {
                                    backgroundColor: employerColors.dark,
                                },
                                borderRadius: 2,
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'دریافت کد تایید'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography>
                            قبلاً ثبت‌نام کرده‌اید؟{' '}
                            <MuiLink
                                component={Link}
                                href="/login"
                                underline="hover"
                                sx={{ fontWeight: 'bold', color: employerColors.primary }}
                            >
                                ورود به حساب
                            </MuiLink>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    };

    // رندر فرم مرحله دوم (تایید شماره تلفن با کد OTP)
    const renderOtpForm = () => {
        // تعریف متغیر isMobile درون تابع
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        return (
            <Box component="form" onSubmit={handleOtpSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
                    <Typography variant={isMobile ? "body2" : "body1"} gutterBottom>
                        کد تایید به شماره {formData.phone} ارسال شد.
                    </Typography>

                    <Box>
                        <TextField
                            fullWidth
                            label="کد تایید"
                            variant="outlined"
                            value={phoneOtpCode}
                            onChange={handleOtpChange}
                            error={!!otpError}
                            helperText={otpError}
                            placeholder="کد ۶ رقمی"
                            autoFocus
                            inputProps={{ maxLength: 6, dir: "ltr" }}
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: { xs: 1, sm: 2 },
                        mt: { xs: 1, sm: 2 }
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setActiveStep(0)}
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "medium" : "large"}
                            sx={{
                                order: { xs: 2, sm: 1 }, // در موبایل پایین باشد
                                px: 3,
                                py: { xs: 0.5, sm: 1 },
                                borderColor: employerColors.primary,
                                color: employerColors.primary,
                                '&:hover': {
                                    borderColor: employerColors.dark,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            بازگشت
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "medium" : "large"}
                            sx={{
                                order: { xs: 1, sm: 2 }, // در موبایل بالا باشد
                                px: 3,
                                py: { xs: 0.5, sm: 1 },
                                backgroundColor: employerColors.primary,
                                '&:hover': {
                                    backgroundColor: employerColors.dark,
                                },
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : 'تایید شماره تلفن'}
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 0, sm: 1 } }}>
                        <Button
                            variant="text"
                            onClick={handleResendOtp}
                            disabled={isSubmitting}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                color: employerColors.primary,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            ارسال مجدد کد تایید
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    };

    // رندر فرم مرحله سوم (تکمیل اطلاعات)
    const renderUserInfoForm = () => {
        // تعریف متغیر isMobile درون تابع
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        return (
            <Box component="form" onSubmit={handleUserInfoSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
                    <Box>
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
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BadgeIcon />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ dir: "rtl" }}
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>

                    <Box>
                        <TextField
                            fullWidth
                            name="username"
                            label="نام کاربری"
                            variant="outlined"
                            value={formData.username}
                            onChange={handleChange}
                            error={!!formErrors.username}
                            helperText={formErrors.username}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ dir: "rtl" }}
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>

                    <Box>
                        <TextField
                            fullWidth
                            name="email"
                            label="ایمیل"
                            type="email"
                            variant="outlined"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ dir: "ltr" }}
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>

                    <Box>
                        <TextField
                            fullWidth
                            name="password"
                            label="رمز عبور"
                            type="password"
                            variant="outlined"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ dir: "ltr" }}
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>

                    <Box>
                        <TextField
                            fullWidth
                            name="password_conf"
                            label="تکرار رمز عبور"
                            type="password"
                            variant="outlined"
                            value={formData.password_conf}
                            onChange={handleChange}
                            error={!!formErrors.password_conf}
                            helperText={formErrors.password_conf}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ dir: "ltr" }}
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>

                    <Box>
                        <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                            <InputLabel id="user-type-label">نوع کاربر</InputLabel>
                            <Select
                                labelId="user-type-label"
                                id="user-type"
                                value={formData.user_type}
                                label="نوع کاربر"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="JS">کارجو</MenuItem>
                                <MenuItem value="EM">کارفرما</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: { xs: 1, sm: 2 },
                        mt: { xs: 1, sm: 2 }
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setActiveStep(1)}
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "medium" : "large"}
                            sx={{
                                order: { xs: 2, sm: 1 }, // در موبایل پایین باشد
                                px: 3,
                                py: { xs: 0.5, sm: 1 },
                                borderColor: employerColors.primary,
                                color: employerColors.primary,
                                '&:hover': {
                                    borderColor: employerColors.dark,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            بازگشت
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "medium" : "large"}
                            sx={{
                                order: { xs: 1, sm: 2 }, // در موبایل بالا باشد
                                px: 3,
                                py: { xs: 0.5, sm: 1 },
                                backgroundColor: employerColors.primary,
                                '&:hover': {
                                    backgroundColor: employerColors.dark,
                                },
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : 'تکمیل ثبت‌نام'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: { xs: 2, sm: 3, md: 5 },
                px: { xs: 1.5, sm: 3, md: 5 },
                borderRadius: { xs: 1, sm: 2 },
                border: `1px solid ${employerColors.bgLight}`,
                width: { xs: '100%', sm: '100%', md: '600px' },
                maxWidth: '100%',
                mx: 'auto'
            }}
        >
            <Typography
                variant={isMobile ? "h5" : "h4"}
                component="h1"
                align="center"
                gutterBottom
                fontWeight="bold"
                color={employerColors.primary}
                sx={{
                    mb: { xs: 2, sm: 3, md: 4 },
                    fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' }
                }}
            >
                ثبت‌نام در ماهرکار
            </Typography>

            <Stepper
                activeStep={activeStep}
                sx={{
                    mb: { xs: 2, sm: 3, md: 4 },
                    '& .MuiStepLabel-label': {
                        fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.9rem' },
                        mt: { xs: 0.5, sm: 1 },
                        display: 'block',
                        textAlign: 'center'
                    },
                    '& .MuiStepIcon-root': {
                        fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' }
                    },
                    '& .MuiStep-root': {
                        px: { xs: 0.5, sm: 1 }
                    },
                    '& .MuiStepConnector-root': {
                        mt: { xs: '10px', sm: '12px' }
                    }
                }}
                orientation="horizontal"
                alternativeLabel={true}
            >
                <Step>
                    <StepLabel StepIconComponent={PersianStepIcon}>{isMobile ? "شماره" : "شماره همراه"}</StepLabel>
                </Step>
                <Step>
                    <StepLabel StepIconComponent={PersianStepIcon}>{isMobile ? "تایید" : "تایید شماره"}</StepLabel>
                </Step>
                <Step>
                    <StepLabel StepIconComponent={PersianStepIcon}>{isMobile ? "اطلاعات" : "اطلاعات کاربری"}</StepLabel>
                </Step>
            </Stepper>

            {activeStep === 0 && renderPhoneForm()}
            {activeStep === 1 && renderOtpForm()}
            {activeStep === 2 && renderUserInfoForm()}
        </Paper>
    );
} 