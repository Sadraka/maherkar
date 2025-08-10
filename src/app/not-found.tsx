'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, keyframes } from '@mui/material';
import Link from 'next/link';

// انیمیشن‌های کی‌فریم
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-5px, 5px); }
  40% { transform: translate(-5px, -5px); }
  60% { transform: translate(5px, 5px); }
  80% { transform: translate(5px, -5px); }
  100% { transform: translate(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function NotFoundPage() {
  const [count, setCount] = useState(0);
  
  // تابع تبدیل اعداد انگلیسی به فارسی
  const toPersianNumbers = (num: number): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/[0-9]/g, match => persianDigits[parseInt(match)]);
  };
  
  // انیمیشن شمارش معکوس
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < 404) {
          return prev + Math.floor(Math.random() * 20) + 1;
        }
        clearInterval(timer);
        return 404;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        width: '100%',
        height: '100vh',
        px: { xs: 2, sm: 4, md: 6 },
        zIndex: 1,
        mt: { xs: 0, sm: 8, md: 10 }, // فاصله از هدر در دسکتاپ
      }}
    >
      {/* پس‌زمینه با انیمیشن */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          opacity: 0.05,
          backgroundImage: 'url(/images/circuit-board.svg)',
          backgroundSize: 'cover',
        }}
      />
      
      {/* کد خطا با انیمیشن */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
          fontWeight: 900,
          color: 'primary.main',
          textShadow: '5px 5px 0px rgba(0,0,0,0.1)',
          mb: 2,
          display: 'inline-block',
          opacity: 0,
          animation: `${fadeIn} 0.5s forwards, ${glitch} 1s infinite alternate`
        }}
      >
        {toPersianNumbers(count)}
      </Typography>
      
      {/* پیام خطا با انیمیشن */}
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #FF6B6B 30%, #556270 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0,
          animation: `${fadeIn} 0.5s 0.3s forwards`,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          px: 2,
        }}
      >
        صفحه مورد نظر پیدا نشد
      </Typography>
      
      {/* توضیحات با انیمیشن */}
      <Typography
        variant="body1"
        sx={{
          mb: 3,
          maxWidth: '400px',
          color: 'primary.main', // تغییر به رنگ آبی کارفرما
          opacity: 0,
          animation: `${fadeIn} 0.5s 0.5s forwards`,
          fontSize: { xs: '0.9rem', sm: '1rem' },
          px: 2,
          lineHeight: 1.6,
          fontWeight: 500,
        }}
      >
        آدرس وارد شده صحیح نیست
      </Typography>
      
      {/* دکمه بازگشت به صفحه اصلی */}
      <Button
        component={Link}
        href="/"
        variant="contained"
        size="large"
        color="primary"
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: '50px',
          fontWeight: 'bold',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          opacity: 0,
          animation: `${fadeIn} 0.5s 0.7s forwards, ${pulse} 2s 0.7s infinite`,
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 15px 25px rgba(0,0,0,0.2)',
          },
          transition: 'all 0.3s ease',
          mb: 4,
          fontSize: { xs: '0.9rem', sm: '1rem' },
          minWidth: { xs: '200px', sm: '220px' },
        }}
      >
        بازگشت به صفحه اصلی
      </Button>
      
      {/* آیکون انیمیشنی */}
      <Box
        sx={{
          opacity: 0,
          animation: `${fadeIn} 0.5s 0.9s forwards, ${float} 3s ease-in-out 0.9s infinite`,
          '& img': {
            width: { xs: '120px', sm: '150px', md: '180px' },
            height: 'auto',
          }
        }}
      >
        <img src="/images/circuit-board-white.svg" alt="404" />
      </Box>
    </Box>
  );
} 