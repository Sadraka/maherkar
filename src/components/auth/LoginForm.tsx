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
import LockIcon from '@mui/icons-material/Lock';
import Link from 'next/link';
import { EMPLOYER_THEME } from '@/constants/colors';
import { ErrorHandler } from '@/components/common/ErrorHandler';

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const { login, loading } = useAuth();
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState<{
        phone?: string;
        password?: string;
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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (formErrors.password) {
            setFormErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    // اعتبارسنجی فرم
    const validateForm = () => {
        const errors: { phone?: string; password?: string } = {};
        let isValid = true;

        // بررسی شماره تلفن
        if (!phone) {
            errors.phone = 'شماره تلفن الزامی است';
            isValid = false;
        } else if (!/^(09)\d{9}$/.test(phone)) {
            errors.phone = 'شماره تلفن باید با 09 شروع شده و 11 رقم باشد';
            isValid = false;
        }

        // بررسی رمز عبور
        if (!password) {
            errors.password = 'رمز عبور الزامی است';
            isValid = false;
        } else if (password.length < 8) {
            errors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // تابع ارسال فرم
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await login({ phone, password });
            if (onSuccess) {
                onSuccess();
            }
            // در صورت موفقیت، کاربر به صفحه اصلی هدایت می‌شود (در تابع login)
        } catch (error) {
            // خطا قبلاً در AuthContext نمایش داده شده است
            // بنابراین نیازی به فراخوانی دوباره ErrorHandler.showError نیست

            // استخراج خطاهای فیلدهای خاص (شماره تلفن و رمز عبور)
            const phoneError = ErrorHandler.getFieldError(error, 'phone');
            const passwordError = ErrorHandler.getFieldError(error, 'password');

            if (phoneError || passwordError) {
                setFormErrors({
                    phone: phoneError,
                    password: passwordError
                });
            }
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
                width: { xs: '100%', sm: '450px', md: '500px' },
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
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
            >
                ورود به ماهرکار
            </Typography>

            <form onSubmit={handleSubmit}>
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
                        />
                    </Box>

                    <Box>
                        <TextField
                            fullWidth
                            id="password"
                            label="رمز عبور"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={handlePasswordChange}
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
                        <Box sx={{ textAlign: 'left', mt: 1 }}>
                            <MuiLink
                                component={Link}
                                href="/forgot-password"
                                underline="hover"
                                sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    color: employerColors.primary
                                }}
                            >
                                رمز عبور خود را فراموش کرده‌اید؟
                            </MuiLink>
                        </Box>
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

                    <Box sx={{ mt: { xs: 1, sm: 2 }, textAlign: 'center' }}>
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
                </Box>
            </form>
        </Paper>
    );
} 