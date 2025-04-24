'use client'

import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  useTheme
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { useState, useEffect } from 'react';

export default function AboutUs() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  
  // آمار و ارقام مربوط به وب‌سایت به صورت ساده
  const stats = [
    { id: 1, value: 15000, label: 'متخصص', suffix: '+' },
    { id: 2, value: 10000, label: 'آگهی', suffix: '+' },
    { id: 3, value: 8000, label: 'کارفرما', suffix: '+' },
    { id: 4, value: '۷/۲۴', label: 'پشتیبانی تمام وقت', isStatic: true }
  ];

  // مقادیر فعلی شمارنده
  const [counters, setCounters] = useState<number[]>([0, 0, 0]);
  
  // مدت زمان انیمیشن (میلی‌ثانیه)
  const animationDuration = 2000;
  // تعداد مراحل بین 0 تا مقدار نهایی
  const steps = 50;

  useEffect(() => {
    // زمان شروع انیمیشن
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      
      if (progress === 1) {
        // در پایان انیمیشن، مقادیر نهایی تنظیم شوند
        setCounters([
          stats[0].value as number,
          stats[1].value as number,
          stats[2].value as number
        ]);
        clearInterval(interval);
      } else {
        // در طول انیمیشن، مقادیر محاسبه شوند
        setCounters([
          Math.floor(progress * (stats[0].value as number)),
          Math.floor(progress * (stats[1].value as number)),
          Math.floor(progress * (stats[2].value as number))
        ]);
      }
    }, animationDuration / steps);
    
    // پاکسازی افکت
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ py: 6, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: jobSeekerColors.primary
            }}
          >
            ماهرکار؛ سامانه کاریابی پیشرو در ایران
          </Typography>
          <Typography 
            variant="h5" 
            component="h3"
            sx={{ 
              fontWeight: 500,
              mb: 4,
              color: 'text.secondary',
              maxWidth: 650, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            ارتباط مستقیم کارفرمایان با متخصصان برای انجام پروژه‌های دورکاری
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, sm: 3 }} key={stat.id}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                backgroundColor: '#fff'
              }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: jobSeekerColors.primary,
                    fontSize: { xs: '1.6rem', md: '2rem' },
                    mb: 0.5
                  }}
                >
                  {stat.isStatic ? stat.value : (
                    <>
                      {counters[index].toLocaleString('fa-IR')}{stat.suffix}
                    </>
                  )}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ color: 'text.secondary' }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<InfoIcon />}
            sx={{ 
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
              },
              boxShadow: `0 4px 14px ${jobSeekerColors.bgLight}`,
              transition: 'all 0.3s ease',
              '&:active': { transform: 'translateY(1px)' }
            }}
          >
            درباره ما
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 