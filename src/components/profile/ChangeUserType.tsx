'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import { toast } from 'react-hot-toast';

interface ChangeUserTypeProps {
    onSuccess?: () => void;
    redirectToProfile?: boolean;
}

export default function ChangeUserType({ onSuccess, redirectToProfile = false }: ChangeUserTypeProps) {
    const { user, updateUserType, loading } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedUserType, setSelectedUserType] = useState<string>(user?.user_type || 'JS');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedUserType(user.user_type);
        }
    }, [user]);

    const handleUserTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedUserType(event.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // اگر نوع کاربر تغییر نکرده است
        if (selectedUserType === user?.user_type) {
            toast.error('نوع کاربری انتخابی با نوع فعلی یکسان است');
            return;
        }

        setIsSubmitting(true);

        try {
            await updateUserType(selectedUserType);

            // در صورت موفقیت
            if (onSuccess) {
                onSuccess();
            }

            if (redirectToProfile) {
                window.location.href = '/profile';
            }
        } catch (error: any) {
            console.error('خطا در تغییر نوع کاربر:', error);
            toast.error(error.message || 'خطا در تغییر نوع کاربر، لطفاً دوباره تلاش کنید');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 2,
                maxWidth: '600px',
                mx: 'auto',
                my: 2
            }}
        >
            <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                gutterBottom
                align="center"
                fontWeight="bold"
                color={EMPLOYER_THEME.primary}
                sx={{ mb: 3 }}
            >
                تغییر نوع کاربری
            </Typography>

            <Typography variant="body1" paragraph>
                با انتخاب نوع کاربری مناسب، می‌توانید از امکانات متناسب با نیاز خود استفاده کنید.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                        aria-label="user-type"
                        name="user-type"
                        value={selectedUserType}
                        onChange={handleUserTypeChange}
                    >
                        <FormControlLabel
                            value="JS"
                            control={<Radio color="primary" />}
                            label={
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">کارجو</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        به دنبال فرصت‌های شغلی هستید و می‌خواهید رزومه خود را به کارفرمایان ارائه دهید.
                                    </Typography>
                                </Box>
                            }
                            sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}
                        />

                        <FormControlLabel
                            value="EM"
                            control={<Radio color="primary" />}
                            label={
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">کارفرما</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        می‌خواهید آگهی استخدام منتشر کنید و کارجویان مناسب را پیدا کنید.
                                    </Typography>
                                </Box>
                            }
                            sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}
                        />
                    </RadioGroup>
                </FormControl>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isSubmitting || loading || selectedUserType === user?.user_type}
                    sx={{
                        mt: 3,
                        py: 1.5,
                        backgroundColor: EMPLOYER_THEME.primary,
                        '&:hover': {
                            backgroundColor: EMPLOYER_THEME.dark,
                        },
                    }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'تغییر نوع کاربری'}
                </Button>
            </Box>
        </Paper>
    );
} 