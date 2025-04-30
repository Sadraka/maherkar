'use client'

import {
    Box,
    Typography,
    Container,
    Button,
    Grid,
    useTheme,
    useMediaQuery
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { EMPLOYER_THEME } from '@/constants/colors';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { useState, useEffect, useRef } from 'react';

export default function CombinedInfo() {
    const theme = useTheme();
    const jobSeekerColors = useJobSeekerTheme();
    const employerColors = EMPLOYER_THEME;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const statsRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // ویژگی‌های بخش استخدام روزانه
    const features = [
        {
            icon: <TrendingUpIcon sx={{ color: employerColors.primary, fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' } }} />,
            title: "نردبان شده",
            description: "قرارگیری در بالاترین رتبه‌های جستجو"
        },
        {
            icon: <AccessTimeIcon sx={{ color: employerColors.primary, fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' } }} />,
            title: "استخدام سریع‌تر",
            description: "کاهش زمان جذب نیرو تا ۷۰٪"
        },
        {
            icon: <LocalOfferIcon sx={{ color: employerColors.primary, fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' } }} />,
            title: "قیمت مناسب",
            description: "تعرفه‌های رقابتی و مقرون به صرفه"
        },
    ];

    // آمار و ارقام مربوط به وب‌سایت
    const stats = [
        { id: 1, value: 15000, label: 'متخصص', suffix: '+' },
        { id: 2, value: 10000, label: 'آگهی', suffix: '+' },
        { id: 3, value: 8000, label: 'کارفرما', suffix: '+' },
        { id: 4, value: '۷/۲۴', label: 'پشتیبانی', isStatic: true }
    ];

    // مقادیر فعلی شمارنده
    const [counters, setCounters] = useState<number[]>([0, 0, 0]);

    // مدت زمان انیمیشن (میلی‌ثانیه)
    const animationDuration = 2500;
    // تعداد مراحل بین 0 تا مقدار نهایی - افزایش برای روان‌تر شدن
    const steps = 120;

    // تابع easing برای حرکت طبیعی‌تر
    const easeOutQuad = (t: number): number => t * (2 - t);

    // تشخیص زمانی که المان در صفحه نمایش وارد می‌شود
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, {
            threshold: 0.3
        });

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, []);

    // شروع شمارش وقتی المان در دید کاربر قرار می‌گیرد
    useEffect(() => {
        if (!isVisible) return;

        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const rawProgress = Math.min(elapsedTime / animationDuration, 1);

            const progress = easeOutQuad(rawProgress);

            if (rawProgress === 1) {
                setCounters([
                    stats[0].value as number,
                    stats[1].value as number,
                    stats[2].value as number
                ]);
                clearInterval(interval);
            } else {
                setCounters([
                    Math.round(progress * (stats[0].value as number)),
                    Math.round(progress * (stats[1].value as number)),
                    Math.round(progress * (stats[2].value as number))
                ]);
            }
        }, animationDuration / steps);

        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <Box sx={{
            pt: { xs: 5, sm: 6, md: 7 },
            pb: { xs: 3, sm: 4, md: 5 },
            backgroundColor: '#ffffff'
        }}>
            <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, sm: 4 }
                    }}
                >
                    {/* بخش اول - استخدام روزانه */}
                    <Box
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: 3,
                            flexBasis: { md: '50%' },
                            p: { xs: 2, sm: 3 },
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 2.5 } }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                sx={{
                                    fontWeight: 800,
                                    mb: { xs: 1, sm: 1.5 },
                                    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                                    color: employerColors.primary,
                                    position: 'relative',
                                    display: 'inline-block',
                                    pb: { xs: 1, sm: 1.5 },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        width: { xs: '50px', sm: '60px' },
                                        height: { xs: '3px', md: '3px' },
                                        backgroundColor: employerColors.primary,
                                        bottom: 0,
                                        left: { xs: 'calc(50% - 25px)', sm: 'calc(50% - 30px)' },
                                        borderRadius: '2px'
                                    }
                                }}
                            >
                                استخدام روزانه، سریع و آسان
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: { xs: 1, md: 1.5 },
                                    color: theme.palette.text.secondary,
                                    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                                    maxWidth: { xs: '250px', sm: '300px' },
                                    mx: 'auto',
                                    lineHeight: { xs: 1.6, sm: 1.8 }
                                }}
                            >
                                با آگهی نردبان، شانس دیده شدن آگهی شما توسط متخصصان تا ۳ برابر افزایش می‌یابد
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            {features.map((feature, index) => (
                                <Box key={index} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1.5,
                                    p: 1,
                                    borderRadius: 1.5,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(10, 59, 121, 0.03)',
                                    }
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: { xs: '40px', sm: '40px' },
                                        height: { xs: '40px', sm: '40px' },
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(10, 59, 121, 0.07)',
                                        mr: 1.5,
                                        flexShrink: 0
                                    }}>
                                        {feature.icon}
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 'bold',
                                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                                mb: 0.25
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                fontSize: { xs: '0.75rem', sm: '0.8rem' }
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="medium"
                                startIcon={<WorkOutlineIcon />}
                                sx={{
                                    backgroundColor: employerColors.primary,
                                    background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)`
                                    },
                                    py: { xs: 0.8, sm: 1 },
                                    px: { xs: 2, sm: 3 },
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                    boxShadow: `0 4px 10px ${employerColors.bgLight}`,
                                    transition: 'all 0.3s ease',
                                    '&:active': { transform: 'translateY(1px)' }
                                }}
                            >
                                ثبت آگهی نردبان
                            </Button>
                        </Box>
                    </Box>

                    {/* بخش دوم - درباره ما */}
                    <Box
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: 3,
                            flexBasis: { md: '50%' },
                            p: { xs: 2, sm: 3 },
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 2.5 } }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                sx={{
                                    fontWeight: 800,
                                    mb: { xs: 1, sm: 1.5 },
                                    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                                    color: jobSeekerColors.primary,
                                    position: 'relative',
                                    display: 'inline-block',
                                    pb: { xs: 1, sm: 1.5 },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        width: { xs: '50px', sm: '60px' },
                                        height: { xs: '3px', md: '3px' },
                                        backgroundColor: jobSeekerColors.primary,
                                        bottom: 0,
                                        left: { xs: 'calc(50% - 25px)', sm: 'calc(50% - 30px)' },
                                        borderRadius: '2px'
                                    }
                                }}
                            >
                                ماهرکار؛ سامانه پیشرو کاریابی
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: { xs: 1, md: 1.5 },
                                    color: theme.palette.text.secondary,
                                    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                                    maxWidth: { xs: '250px', sm: '300px' },
                                    mx: 'auto',
                                    lineHeight: { xs: 1.6, sm: 1.8 }
                                }}
                            >
                                ارتباط مستقیم کارفرمایان با متخصصان برای انجام پروژه‌های دورکاری
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                mb: 2
                            }}
                            ref={statsRef}
                        >
                            {stats.map((stat, index) => (
                                <Box
                                    key={stat.id}
                                    sx={{
                                        textAlign: 'center',
                                        p: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(10, 155, 84, 0.05)',
                                        width: 'calc(50% - 8px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            color: jobSeekerColors.primary,
                                            fontSize: { xs: '1.2rem', sm: '1.4rem' },
                                            mb: 0.5
                                        }}
                                    >
                                        {stat.isStatic ? stat.value : (
                                            <>
                                                {(isVisible ? counters[index] : 0).toLocaleString('fa-IR')}{stat.suffix}
                                            </>
                                        )}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: { xs: '0.75rem', sm: '0.8rem' }
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="medium"
                                startIcon={<InfoIcon />}
                                sx={{
                                    px: { xs: 2, sm: 3 },
                                    py: { xs: 0.8, sm: 1 },
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                    background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                                    },
                                    boxShadow: `0 4px 10px ${jobSeekerColors.bgLight}`,
                                    transition: 'all 0.3s ease',
                                    '&:active': { transform: 'translateY(1px)' }
                                }}
                            >
                                درباره ما
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
} 