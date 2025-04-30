'use client';

import React, { useState } from 'react';
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
    Link as MuiLink,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { EMPLOYER_THEME } from '@/constants/colors';

interface RegisterFormProps {
    onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
    const { register, verifyOtp, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // مرحله فعلی ثبت‌نام
    const [activeStep, setActiveStep] = useState(0);

    // توکن OTP دریافتی از سرور پس از مرحله اول
    const [otpToken, setOtpToken] = useState('');

    // کد OTP وارد شده توسط کاربر
    const [otpCode, setOtpCode] = useState('');

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
        user_type: 'JS' // پیش‌فرض: جوینده کار
    });

    // خطاهای اعتبارسنجی فرم
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // هدایت کاربر به صفحه اصلی اگر قبلاً احراز هویت شده باشد
    React.useEffect(() => {
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
    };

    // تابع بروزرسانی فیلد انتخابی نوع کاربر
    const handleSelectChange = (e: any) => {
        setFormData({
            ...formData,
            user_type: e.target.value
        });
    };

    // اعتبارسنجی فرم ثبت‌نام
    const validateRegisterForm = () => {
        const errors: Record<string, string> = {};
        let isValid = true;

        // بررسی نام کاربری
        if (!formData.username) {
            errors.username = 'نام کاربری الزامی است';
            isValid = false;
        } else if (formData.username.length < 3) {
            errors.username = 'نام کاربری باید حداقل ۳ کاراکتر باشد';
            isValid = false;
        }

        // بررسی ایمیل
        if (!formData.email) {
            errors.email = 'ایمیل الزامی است';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'ایمیل معتبر نیست';
            isValid = false;
        }

        // بررسی شماره تلفن
        if (!formData.phone) {
            errors.phone = 'شماره تلفن الزامی است';
            isValid = false;
        } else if (!/^(09)\d{9}$/.test(formData.phone)) {
            errors.phone = 'شماره تلفن باید با 09 شروع شده و 11 رقم باشد';
            isValid = false;
        }

        // بررسی نام کامل
        if (!formData.full_name) {
            errors.full_name = 'نام و نام خانوادگی الزامی است';
            isValid = false;
        }

        // بررسی رمز عبور
        if (!formData.password) {
            errors.password = 'رمز عبور الزامی است';
            isValid = false;
        } else if (formData.password.length < 8) {
            errors.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
            isValid = false;
        }

        // بررسی تکرار رمز عبور
        if (formData.password !== formData.password_conf) {
            errors.password_conf = 'تکرار رمز عبور با رمز عبور مطابقت ندارد';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // اعتبارسنجی فرم تایید کد
    const validateOtpForm = () => {
        if (!otpCode) {
            setOtpError('کد تایید الزامی است');
            return false;
        } else if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
            setOtpError('کد تایید باید ۶ رقم باشد');
            return false;
        }
        setOtpError('');
        return true;
    };

    // ارسال فرم ثبت‌نام (مرحله اول)
    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateRegisterForm()) {
            return;
        }

        try {
            const token = await register(formData);
            setOtpToken(token);
            setActiveStep(1);
        } catch (error) {
            console.error('خطا در ثبت‌نام:', error);
            // خطا در AuthContext مدیریت می‌شود
        }
    };

    // ارسال کد تایید (مرحله دوم)
    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateOtpForm()) {
            return;
        }

        try {
            await verifyOtp(otpToken, otpCode);
            // در صورت موفقیت، کاربر به صفحه اصلی هدایت می‌شود (در تابع verifyOtp)
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('خطا در تایید کد:', error);
            // خطا در AuthContext مدیریت می‌شود
        }
    };

    // رنگ‌های تم کارفرما
    const employerColors = EMPLOYER_THEME;

    // رندر فرم ثبت‌نام (مرحله اول)
    const renderRegisterForm = () => (
        <form onSubmit={handleRegisterSubmit}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                <Box>
                    <TextField
                        fullWidth
                        id="username"
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
                        inputProps={{ dir: "ltr" }}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="ایمیل"
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
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        id="phone"
                        name="phone"
                        label="شماره تلفن"
                        variant="outlined"
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!formErrors.phone}
                        helperText={formErrors.phone}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon />
                                </InputAdornment>
                            ),
                        }}
                        placeholder="09123456789"
                        inputProps={{ dir: "ltr" }}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        id="full_name"
                        name="full_name"
                        label="نام و نام خانوادگی"
                        variant="outlined"
                        value={formData.full_name}
                        onChange={handleChange}
                        error={!!formErrors.full_name}
                        helperText={formErrors.full_name}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <BadgeIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box>
                    <FormControl fullWidth>
                        <InputLabel id="user-type-label">نوع کاربر</InputLabel>
                        <Select
                            labelId="user-type-label"
                            id="user_type"
                            name="user_type"
                            value={formData.user_type}
                            onChange={handleSelectChange}
                            label="نوع کاربر"
                        >
                            <MenuItem value="JS">جوینده کار</MenuItem>
                            <MenuItem value="EM">کارفرما</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        id="password"
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
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        id="password_conf"
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
                    />
                </Box>

                <Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
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
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'ثبت‌نام'
                        )}
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
                            وارد شوید
                        </MuiLink>
                    </Typography>
                </Box>
            </Box>
        </form>
    );

    // رندر فرم تایید کد (مرحله دوم)
    const renderOtpForm = () => (
        <form onSubmit={handleOtpSubmit}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                <Box>
                    <Typography align="center" sx={{ mb: 2 }}>
                        کد تایید به شماره تلفن {formData.phone} ارسال شد.
                    </Typography>
                    <Typography align="center" variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                        لطفاً کد ۶ رقمی دریافتی را وارد کنید.
                    </Typography>
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        id="otp-code"
                        label="کد تایید"
                        variant="outlined"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        error={!!otpError}
                        helperText={otpError}
                        inputProps={{
                            maxLength: 6,
                            dir: "ltr",
                            style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2em' }
                        }}
                        placeholder="------"
                    />
                </Box>

                <Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
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
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'تایید'
                        )}
                    </Button>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="text"
                        disabled={loading}
                        onClick={async () => {
                            try {
                                const token = await register(formData);
                                setOtpToken(token);
                                toast.success('کد تایید جدید برای شما ارسال شد');
                            } catch (error) {
                                console.error('خطا در ارسال مجدد کد:', error);
                                toast.error('خطا در ارسال مجدد کد');
                            }
                        }}
                        sx={{ color: employerColors.primary }}
                    >
                        ارسال مجدد کد
                    </Button>
                </Box>
            </Box>
        </form>
    );

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    {activeStep === 0 ? 'ثبت‌نام در ماهرکار' : 'تایید حساب کاربری'}
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                    {activeStep === 0
                        ? 'برای ثبت‌نام در ماهرکار، لطفاً اطلاعات زیر را تکمیل کنید'
                        : 'برای تکمیل ثبت‌نام، کد تایید را وارد کنید'
                    }
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    <Step>
                        <StepLabel>ثبت‌نام</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>تایید شماره تلفن</StepLabel>
                    </Step>
                </Stepper>
            </Box>

            {activeStep === 0 ? renderRegisterForm() : renderOtpForm()}
        </Paper>
    );
} 