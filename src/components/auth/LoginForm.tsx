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
    Link as MuiLink,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Link from 'next/link';
import { EMPLOYER_THEME } from '@/constants/colors';
import { ErrorHandler } from '@/components/common/ErrorHandler';
import toast from 'react-hot-toast';

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const { loginOtp, validateLoginOtp, loading } = useAuth();
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [token, setToken] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [formErrors, setFormErrors] = useState<{
        phone?: string;
        otp?: string;
        non_field_errors?: string;
    }>({});

    // استفاده از هوک تم و وضعیت دستگاه
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // پاک کردن خطاهای فرم هنگام تغییر مقادیر
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        if (formErrors.phone) {
            setFormErrors(prev => ({ ...prev, phone: undefined }));
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtpCode(e.target.value);
        if (formErrors.otp) {
            setFormErrors(prev => ({ ...prev, otp: undefined }));
        }
    };

    // اعتبارسنجی فرم شماره تلفن
    const validatePhoneForm = () => {
        const errors: { phone?: string } = {};
        let isValid = true;

        // بررسی شماره تلفن
        if (!phone) {
            errors.phone = 'شماره تلفن الزامی است';
            isValid = false;
        } else if (!/^(09)\d{9}$/.test(phone)) {
            errors.phone = 'شماره تلفن باید با 09 شروع شده و 11 رقم باشد';
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
            errors.otp = 'کد تأیید باید 6 رقم باشد';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // تابع ارسال فرم شماره تلفن
    const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validatePhoneForm()) {
            return;
        }

        try {
            const receivedToken = await loginOtp(phone);
            setToken(receivedToken);
            toast.success('کد تأیید به شماره تلفن شما ارسال شد');
            setActiveStep(1);
        } catch (error: any) {
            console.error('خطا در ارسال کد تایید برای ورود:', error);

            // پاک کردن خطاهای قبلی
            setFormErrors({});

            // خطاهای مختلف API
            if (error.response?.data) {
                const apiErrors: Record<string, string> = {};

                // مدیریت ساختارهای مختلف خطا
                // ساختار 1: خطاهای مستقیم فیلد در سطح بالا
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

                // ساختار 2: خطاها در Detail
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

                // ساختار 3: خطا در error یا message
                if (error.response.data.error) {
                    apiErrors.non_field_errors = error.response.data.error;
                }

                if (error.response.data.message) {
                    apiErrors.non_field_errors = error.response.data.message;
                }

                // اگر حداقل یک خطا پیدا شد، آن را نمایش می‌دهیم
                if (Object.keys(apiErrors).length > 0) {
                    setFormErrors(apiErrors);
                } else {
                    // اگر هیچ خطایی در ساختارهای بالا پیدا نشد
                    setFormErrors({
                        non_field_errors: 'خطا در ارسال درخواست. لطفاً دوباره تلاش کنید.'
                    });
                }
            }
            // اگر خطا مستقیماً پیام داشته باشد
            else if (error.message) {
                setFormErrors({
                    non_field_errors: error.message
                });
            }
            // اگر هیچ اطلاعاتی در خطا وجود نداشت
            else {
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
            console.log('اطلاعات کاربر دریافت شده:', userData);

            // بررسی اینکه آیا اطلاعات کاربر دریافت شده است
            if (!userData || (!userData.phone && !userData.user_type)) {
                toast.success('ورود با موفقیت انجام شد');
                toast('اطلاعات کاربری شما به صورت کامل دریافت نشد. لطفاً اطلاعات پروفایل خود را تکمیل کنید.', {
                    duration: 5000,
                    icon: '⚠️',
                    style: {
                        backgroundColor: '#fff8e1',
                        color: '#ff9800'
                    }
                });
            } else {
                toast.success('ورود با موفقیت انجام شد');
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/');
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
        try {
            const receivedToken = await loginOtp(phone);
            setToken(receivedToken);
            setOtpCode('');
            toast.success('کد تأیید جدید به شماره تلفن شما ارسال شد');
        } catch (error: any) {
            console.error('خطا در ارسال مجدد کد تایید:', error);
            toast.error('مشکل در ارسال مجدد کد تأیید. لطفاً دوباره تلاش کنید.');
        }
    };

    const employerColors = EMPLOYER_THEME;

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
                mx: 'auto',
                mb: { xs: 2, md: 4 }
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
                ورود به ماهرکار
            </Typography>

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
                <form onSubmit={handlePhoneSubmit}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 2, sm: 3 }
                    }}>
                        <Box>
                            <TextField
                                fullWidth
                                id="phone"
                                label="شماره تلفن"
                                variant="outlined"
                                value={phone}
                                onChange={handlePhoneChange}
                                error={!!formErrors.phone}
                                helperText={formErrors.phone}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                                inputProps={{ dir: "ltr" }}
                                size={isMobile ? "small" : "medium"}
                                autoFocus
                            />
                        </Box>

                        <Box>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size={isMobile ? "medium" : "large"}
                                disabled={loading}
                                sx={{
                                    mt: { xs: 1, sm: 2 },
                                    py: { xs: 1, sm: 1.5 },
                                    backgroundColor: employerColors.primary,
                                    '&:hover': {
                                        backgroundColor: employerColors.dark,
                                    },
                                    borderRadius: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={isMobile ? 20 : 24} color="inherit" />
                                ) : (
                                    'دریافت کد تأیید'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </form>
            ) : (
                <form onSubmit={handleOtpSubmit}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 2, sm: 3 }
                    }}>
                        <Typography variant={isMobile ? "body2" : "body1"} gutterBottom>
                            کد تایید به شماره {phone} ارسال شد.
                        </Typography>

                        <Box>
                            <TextField
                                fullWidth
                                id="otp"
                                label="کد تأیید"
                                variant="outlined"
                                value={otpCode}
                                onChange={handleOtpChange}
                                error={!!formErrors.otp}
                                helperText={formErrors.otp}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VerifiedUserIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="کد 6 رقمی"
                                inputProps={{ dir: "ltr", maxLength: 6 }}
                                size={isMobile ? "small" : "medium"}
                                autoFocus
                            />
                        </Box>

                        <Box>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size={isMobile ? "medium" : "large"}
                                disabled={loading}
                                sx={{
                                    mt: { xs: 1, sm: 2 },
                                    py: { xs: 1, sm: 1.5 },
                                    backgroundColor: employerColors.primary,
                                    '&:hover': {
                                        backgroundColor: employerColors.dark,
                                    },
                                    borderRadius: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={isMobile ? 20 : 24} color="inherit" />
                                ) : (
                                    'ورود'
                                )}
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Button
                                variant="text"
                                onClick={() => setActiveStep(0)}
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                                بازگشت
                            </Button>

                            <Button
                                variant="text"
                                onClick={handleResendOtp}
                                disabled={loading}
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                                ارسال مجدد کد
                            </Button>
                        </Box>
                    </Box>
                </form>
            )}

            <Box sx={{ mt: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant={isMobile ? "body2" : "body1"}>
                    حساب کاربری ندارید؟{' '}
                    <MuiLink
                        component={Link}
                        href="/register"
                        underline="hover"
                        sx={{
                            fontWeight: 'bold',
                            color: employerColors.primary,
                            fontSize: { xs: '0.85rem', sm: 'inherit' }
                        }}
                    >
                        ثبت‌نام کنید
                    </MuiLink>
                </Typography>
            </Box>
        </Paper>
    );
} 