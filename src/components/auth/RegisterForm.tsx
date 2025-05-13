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
    useTheme,
    Checkbox,
    FormControlLabel,
    FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import Link from 'next/link';
import { EMPLOYER_THEME } from '@/constants/colors';
import { toast } from 'react-hot-toast';
import OtpInput from '@/components/common/OtpInput';

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
    const { registerOtp, validateOtp, isAuthenticated, loading, checkPhoneExists } = useAuth();
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

    // تایمر ارسال مجدد کد OTP (120 ثانیه = 2 دقیقه)
    const [resendTimer, setResendTimer] = useState(0);
    
    // فرم ثبت‌نام - فقط شامل نام کامل، شماره تلفن و نوع کاربر
    const [formData, setFormData] = useState({
        phone: '',
        full_name: '',
        user_type: 'JS', // پیش‌فرض: جوینده کار
    });

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

    // خطاهای اعتبارسنجی فرم
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

    // اعتبارسنجی شماره تلفن در مرحله اول
    const validatePhoneStep = (): boolean => {
        const errors: Record<string, string> = {};
        let isValid = true;

        // بررسی خالی نبودن شماره تلفن
        if (!formData.phone.trim()) {
            errors.phone = 'شماره همراه الزامی است';
            isValid = false;
        }
        // بررسی فرمت شماره تلفن (۱۱ رقم و شروع با ۰۹)
        else if (!/^09\d{9}$/.test(formData.phone.trim())) {
            errors.phone = 'شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود';
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

                setFormErrors(apiErrors);
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

        // بررسی اگر تایمر از قبل فعال بود
        const phoneKey = formData.phone.trim();
        try {
            const storedData = localStorage.getItem(`reg_otp_timer_${phoneKey}`);
            if (storedData) {
                const { endTime } = JSON.parse(storedData);
                const now = new Date().getTime();
                const remainingTime = Math.round((endTime - now) / 1000);
                
                if (remainingTime > 0) {
                    // اگر تایمر فعال است و توکن ذخیره شده وجود دارد، مستقیم به مرحله OTP برو
                    const otpToken = localStorage.getItem(`reg_otp_token_${phoneKey}`);
                    if (otpToken) {
                        setPhoneOtpToken(otpToken);
                        setResendTimer(remainingTime);
                        setActiveStep(2);
                        return;
                    }
                } else {
                    // تایمر منقضی شده، پاکش کن
                    localStorage.removeItem(`reg_otp_timer_${phoneKey}`);
                    localStorage.removeItem(`reg_otp_token_${phoneKey}`);
                }
            }
        } catch (error) {
            console.error('خطا در بررسی تایمر ثبت‌نام:', error);
        }

        setIsSubmitting(true);

        try {

            // ارسال اطلاعات به API برای دریافت OTP
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
            const endTime = now + (120 * 1000); // 120 ثانیه بعد
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
            setFormErrors({
                general: error.message || 'خطا در ارسال درخواست OTP. لطفاً دوباره تلاش کنید.'
            });
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
                        router.push('/change-user-type');
                    }, 1500);
                }
                return;
            } else {
                toast.success('ثبت‌نام با موفقیت انجام شد، اکنون می‌توانید از امکانات سایت استفاده کنید');
            }

            // هدایت کاربر به صفحه اصلی یا فراخوانی تابع onSuccess
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/');
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
            const endTime = now + (120 * 1000); // 120 ثانیه بعد
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
            <Box component="form" onSubmit={handlePhoneSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 3 } }}>
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
                            size={isMobile ? "medium" : "medium"}
                        />
                    </Box>

                    {/* متن شرایط و قوانین بدون چک‌باکس */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            با ثبت‌نام در ماهرکار، <MuiLink component={Link} href="/terms" target="_blank" underline="hover">شرایط و قوانین</MuiLink> و <MuiLink component={Link} href="/privacy" target="_blank" underline="hover">بیانیه حریم خصوصی</MuiLink> را می‌پذیرید
                        </Typography>
                    </Box>

                    <Box>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size={isMobile ? "large" : "large"}
                            disabled={isSubmitting}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                backgroundColor: employerColors.primary,
                                '&:hover': {
                                    backgroundColor: employerColors.dark,
                                },
                                borderRadius: 2,
                                fontSize: { xs: '1rem', sm: '1rem' }
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'ادامه'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant={isMobile ? "body1" : "body1"}>
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

    // رندر فرم مرحله دوم (اطلاعات کاربر)
    const renderUserInfoForm = () => {
        return (
            <Box component="form" onSubmit={handleUserInfoSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 3 } }}>
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
                            size={isMobile ? "medium" : "medium"}
                        />
                    </Box>

                    <Box>
                        <FormControl fullWidth variant="outlined" size={isMobile ? "medium" : "medium"}>
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

                    {formErrors.general && (
                        <Typography
                            color="error"
                            variant="body2"
                            sx={{ mt: 1 }}
                        >
                            {formErrors.general}
                        </Typography>
                    )}

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: { xs: 2, sm: 2 },
                        mt: { xs: 1, sm: 2 }
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setActiveStep(0)}
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "large"}
                            sx={{
                                order: { xs: 2, sm: 1 }, // در موبایل پایین باشد
                                py: { xs: 1.5, sm: 1.5 },
                                borderColor: employerColors.primary,
                                color: employerColors.primary,
                                '&:hover': {
                                    borderColor: employerColors.dark,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                fontSize: { xs: '1rem', sm: '1rem' }
                            }}
                        >
                            بازگشت
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "large"}
                            sx={{
                                order: { xs: 1, sm: 2 }, // در موبایل بالا باشد
                                py: { xs: 1.5, sm: 1.5 },
                                backgroundColor: employerColors.primary,
                                '&:hover': {
                                    backgroundColor: employerColors.dark,
                                },
                                fontSize: { xs: '1rem', sm: '1rem' }
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'دریافت کد تایید'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    };

    // رندر فرم مرحله سوم (تایید شماره تلفن با کد OTP)
    const renderOtpForm = () => {
        return (
            <Box component="form" onSubmit={handleOtpSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 3 } }}>
                    <Typography variant={isMobile ? "body1" : "body1"} gutterBottom>
                        کد تایید به شماره {formData.phone} ارسال شد.
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" gutterBottom>
                        لطفاً کد دریافتی را وارد کنید. با تایید این کد، ثبت‌نام شما تکمیل خواهد شد.
                    </Typography>

                    <Box>
                        <OtpInput
                            value={phoneOtpCode}
                            onChange={handleOtpChange}
                            length={6}
                            error={!!otpError}
                            helperText={otpError}
                            autoFocus={true}
                            disabled={isSubmitting}
                        />
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: { xs: 2, sm: 2 },
                        mt: { xs: 1, sm: 2 }
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setActiveStep(1)}
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "large"}
                            sx={{
                                order: { xs: 2, sm: 1 }, // در موبایل پایین باشد
                                py: { xs: 1.5, sm: 1.5 },
                                borderColor: employerColors.primary,
                                color: employerColors.primary,
                                '&:hover': {
                                    borderColor: employerColors.dark,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                fontSize: { xs: '1rem', sm: '1rem' }
                            }}
                        >
                            بازگشت
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "large"}
                            sx={{
                                order: { xs: 1, sm: 2 }, // در موبایل بالا باشد
                                py: { xs: 1.5, sm: 1.5 },
                                backgroundColor: employerColors.primary,
                                '&:hover': {
                                    backgroundColor: employerColors.dark,
                                },
                                fontSize: { xs: '1rem', sm: '1rem' }
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'تایید کد'}
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1, sm: 1 } }}>
                        {resendTimer > 0 ? (
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                    textAlign: 'center',
                                    fontSize: { xs: '0.9rem', sm: '0.9rem' }
                                }}
                            >
                                امکان ارسال مجدد کد تا {formatTime(resendTimer)} دیگر
                            </Typography>
                        ) : (
                            <Button
                                variant="text"
                                onClick={handleResendOtp}
                                disabled={isSubmitting || resendTimer > 0}
                                size={isMobile ? "medium" : "medium"}
                                sx={{
                                    color: employerColors.primary,
                                    fontSize: { xs: '0.9rem', sm: '0.9rem' },
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                ارسال مجدد کد تایید
                            </Button>
                        )}
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
                px: { xs: 2.5, sm: 3, md: 5 },
                borderRadius: { xs: isMobile ? 0 : 1, sm: 2 },
                border: isMobile ? 'none' : `1px solid ${employerColors.bgLight}`,
                width: { xs: '100%', sm: '100%', md: '600px' },
                maxWidth: '100%',
                mx: 'auto',
                mb: { xs: 0, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                flexGrow: isMobile ? 1 : 0,
                boxShadow: isMobile ? 'none' : 3,
                height: isMobile ? '100vh' : 'auto',
                overflow: 'auto',
                justifyContent: isMobile ? 'center' : 'flex-start'
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
                    mb: { xs: 3, sm: 3, md: 4 },
                    mt: isMobile ? 2 : 0,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
            >
                ثبت‌نام در ماهرکار
            </Typography>

            <Stepper
                activeStep={activeStep}
                sx={{
                    mb: { xs: 3, sm: 3, md: 4 },
                    '& .MuiStepLabel-label': {
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                        mt: { xs: 0.5, sm: 1 },
                        display: 'block',
                        textAlign: 'center',
                        color: theme.palette.text.primary
                    },
                    '& .MuiStepIcon-root': {
                        fontSize: { xs: '1.3rem', sm: '1.4rem', md: '1.5rem' }
                    },
                    '& .MuiStep-root': {
                        px: { xs: 0.5, sm: 1 }
                    },
                    '& .MuiStepConnector-root': {
                        mt: { xs: '10px', sm: '12px' }
                    },
                    '& .Mui-active': {
                        color: `${employerColors.primary} !important`,
                        fontWeight: 'bold'
                    },
                    '& .Mui-completed': {
                        color: `${employerColors.primary} !important`
                    }
                }}
                orientation="horizontal"
                alternativeLabel={true}
            >
                <Step>
                    <StepLabel StepIconComponent={PersianStepIcon}>{isMobile ? "شماره" : "شماره همراه"}</StepLabel>
                </Step>
                <Step>
                    <StepLabel StepIconComponent={PersianStepIcon}>{isMobile ? "اطلاعات" : "اطلاعات کاربری"}</StepLabel>
                </Step>
                <Step>
                    <StepLabel StepIconComponent={PersianStepIcon}>{isMobile ? "تایید" : "تایید شماره"}</StepLabel>
                </Step>
            </Stepper>

            {activeStep === 0 && renderPhoneForm()}
            {activeStep === 1 && renderUserInfoForm()}
            {activeStep === 2 && renderOtpForm()}
        </Paper>
    );
} 