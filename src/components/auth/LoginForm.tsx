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
    Link as MuiLink
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Link from 'next/link';
import { EMPLOYER_THEME } from '@/constants/colors';

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
            // خطا در useAuth مدیریت می‌شود
            console.error('خطا در ورود:', error);
        }
    };

    const employerColors = EMPLOYER_THEME;

    return (
        <Paper
            elevation={3}
            sx={{
                p: 5,
                borderRadius: 2,
                border: `1px solid ${employerColors.bgLight}`,
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                align="center"
                gutterBottom
                fontWeight="bold"
                color={employerColors.primary}
                sx={{ mb: 4 }}
            >
                ورود به ماهرکار
            </Typography>

            <form onSubmit={handleSubmit}>
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
                            id="password"
                            label="رمز عبور"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        <Box sx={{ textAlign: 'left', mt: 1 }}>
                            <MuiLink
                                component={Link}
                                href="/forgot-password"
                                underline="hover"
                                sx={{
                                    fontSize: '0.875rem',
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
                                'ورود'
                            )}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography>
                            حساب کاربری ندارید؟{' '}
                            <MuiLink
                                component={Link}
                                href="/register"
                                underline="hover"
                                sx={{ fontWeight: 'bold', color: employerColors.primary }}
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