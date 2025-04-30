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
    Link as MuiLink
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { EMPLOYER_THEME } from '@/constants/colors';
import authService from '@/lib/authService';

interface ForgotPasswordFormProps {
    onSuccess?: () => void;
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpToken, setOtpToken] = useState('');

    // خطاهای فرم
    const [phoneError, setPhoneError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const employerColors = EMPLOYER_THEME;

    // اعتبارسنجی شماره تلفن
    const validatePhone = () => {
        if (!phone) {
            setPhoneError('شماره تلفن الزامی است');
            return false;
        } else if (!/^(09)\d{9}$/.test(phone)) {
            setPhoneError('شماره تلفن باید با 09 شروع شده و 11 رقم باشد');
            return false;
        }
        setPhoneError('');
        return true;
    };

    // اعتبارسنجی کد تایید
    const validateOtp = () => {
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

    // اعتبارسنجی رمز عبور جدید
    const validateNewPassword = () => {
        const errors = {
            newPassword: '',
            confirmPassword: ''
        };
        let isValid = true;

        if (!newPassword) {
            errors.newPassword = 'رمز عبور جدید الزامی است';
            isValid = false;
        } else if (newPassword.length < 8) {
            errors.newPassword = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'تکرار رمز عبور با رمز عبور مطابقت ندارد';
            isValid = false;
        }

        setPasswordErrors(errors);
        return isValid;
    };

    // ارسال شماره تلفن و دریافت کد تایید
    const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validatePhone()) {
            return;
        }

        setLoading(true);
        try {
            const response = await authService.requestPasswordReset(phone);
            setOtpToken(response.Detail.token);
            setActiveStep(1);
        } catch (error) {
            console.error('خطا در ارسال کد:', error);
            toast.error('خطا در ارسال کد تایید');
        } finally {
            setLoading(false);
        }
    };

    // تایید کد و رفتن به مرحله تغییر رمز
    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateOtp()) {
            return;
        }

        setLoading(true);
        try {
            await authService.verifyPasswordResetOtp(otpToken, otpCode);
            setActiveStep(2);
        } catch (error) {
            console.error('خطا در تایید کد:', error);
            toast.error('کد تایید نامعتبر است');
        } finally {
            setLoading(false);
        }
    };

    // تغییر رمز عبور
    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateNewPassword()) {
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(otpToken, otpCode, newPassword);
            toast.success('رمز عبور با موفقیت تغییر کرد');

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('خطا در تغییر رمز:', error);
            toast.error('خطا در تغییر رمز عبور');
        } finally {
            setLoading(false);
        }
    };

    // رندر مرحله اول: وارد کردن شماره تلفن
    const renderPhoneForm = () => (
        <form onSubmit={handlePhoneSubmit}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                <Box>
                    <TextField
                        fullWidth
                        id="phone"
                        label="شماره تلفن"
                        variant="outlined"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={!!phoneError}
                        helperText={phoneError}
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
                            'دریافت کد تایید'
                        )}
                    </Button>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography>
                        <MuiLink
                            component={Link}
                            href="/login"
                            underline="hover"
                            sx={{ fontWeight: 'bold', color: employerColors.primary }}
                        >
                            بازگشت به صفحه ورود
                        </MuiLink>
                    </Typography>
                </Box>
            </Box>
        </form>
    );

    // رندر مرحله دوم: وارد کردن کد تایید
    const renderOtpForm = () => (
        <form onSubmit={handleOtpSubmit}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                <Box>
                    <Typography align="center" sx={{ mb: 2 }}>
                        کد تایید به شماره تلفن {phone} ارسال شد.
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
                            'تایید کد'
                        )}
                    </Button>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="text"
                        disabled={loading}
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const response = await authService.requestPasswordReset(phone);
                                setOtpToken(response.Detail.token);
                                toast.success('کد تایید جدید برای شما ارسال شد');
                            } catch (error) {
                                console.error('خطا در ارسال مجدد کد:', error);
                                toast.error('خطا در ارسال مجدد کد تایید');
                            } finally {
                                setLoading(false);
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

    // رندر مرحله سوم: وارد کردن رمز عبور جدید
    const renderPasswordForm = () => (
        <form onSubmit={handlePasswordSubmit}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                <Box>
                    <TextField
                        fullWidth
                        id="new-password"
                        label="رمز عبور جدید"
                        type="password"
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword}
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
                        id="confirm-password"
                        label="تکرار رمز عبور جدید"
                        type="password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword}
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
                            'تغییر رمز عبور'
                        )}
                    </Button>
                </Box>
            </Box>
        </form>
    );

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    {activeStep === 0 && 'بازیابی رمز عبور'}
                    {activeStep === 1 && 'تایید کد یکبار مصرف'}
                    {activeStep === 2 && 'ایجاد رمز عبور جدید'}
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                    {activeStep === 0 && 'برای بازیابی رمز عبور، شماره تلفن خود را وارد کنید'}
                    {activeStep === 1 && 'کد ارسال شده به تلفن همراه خود را وارد کنید'}
                    {activeStep === 2 && 'رمز عبور جدید خود را وارد کنید'}
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    <Step>
                        <StepLabel>شماره تلفن</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>کد تایید</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>رمز عبور جدید</StepLabel>
                    </Step>
                </Stepper>
            </Box>

            {activeStep === 0 && renderPhoneForm()}
            {activeStep === 1 && renderOtpForm()}
            {activeStep === 2 && renderPasswordForm()}
        </Paper>
    );
} 