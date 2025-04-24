'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Container, Typography, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTheme } from '@mui/material/styles'

export default function PromoBar() {
  const theme = useTheme()
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [barHeight, setBarHeight] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const isInitialMount = useRef(true)

  // برای بستن دستی نوار تبلیغاتی
  const handleClose = () => {
    setIsVisible(false)
    // ذخیره وضعیت در localStorage برای جلوگیری از نمایش مجدد در بارگذاری‌های بعدی
    if (typeof window !== 'undefined') {
      localStorage.setItem('promoBarClosed', 'true')
    }
  }

  // محاسبه ارتفاع نوار یکبار در شروع
  useEffect(() => {
    if (barRef.current && isInitialMount.current) {
      const height = barRef.current.offsetHeight;
      setBarHeight(height);
      isInitialMount.current = false;
      
      // اندازه‌گیری مجدد در صورت تغییر اندازه صفحه
      const handleResize = () => {
        if (barRef.current) {
          setBarHeight(barRef.current.offsetHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true)
    
    // برای تست، localStorage را پاک می‌کنیم تا نوار همیشه نمایش داده شود
    if (typeof window !== 'undefined') {
      localStorage.removeItem('promoBarClosed')
    }
    
    setIsVisible(true)

    // تشخیص اسکرول با throttling برای بهبود عملکرد
    const handleScroll = () => {
      lastScrollY.current = window.scrollY;
      
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          // استفاده از آستانه بزرگتر و پایدارتر
          if (lastScrollY.current > 100) {
            setIsScrolled(true);
          } else if (lastScrollY.current < 50) {
            // ایجاد هیسترسیس برای جلوگیری از تغییر وضعیت سریع
            setIsScrolled(false);
          }
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // قبل از اینکه کامپوننت در سمت کلاینت مانت شود، چیزی نمایش نده
  // این کار از خطای هیدراسیون جلوگیری می‌کند
  if (!isMounted) return null;

  // اگر نوار به صورت دستی بسته شده، کاملاً آن را حذف کنید
  if (!isVisible) return null;

  return (
    <>
      {/* همیشه یک فضای خالی با همان ارتفاع داشته باشید تا از پرش جلوگیری شود */}
      <Box sx={{ height: barHeight, display: isScrolled ? 'block' : 'none' }} />
      
      <Box
        ref={barRef}
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 1,
          width: '100%',
          position: isScrolled ? 'fixed' : 'static',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar + 1,
          transform: isScrolled ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease',
          visibility: isScrolled ? 'hidden' : 'visible',
          opacity: isScrolled ? 0 : 1,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              px: { xs: 4, sm: 2 },
            }}
          >
            <Typography
              variant="body2"
              component="div"
              sx={{
                fontWeight: 500,
                textAlign: 'center',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
              }}
            >
              🚀 در ماهرکار ثبت نام کنید و از ۲۰٪ تخفیف ویژه برای کارفرمایان بهره‌مند شوید!
            </Typography>
            
            <Button 
              size="small" 
              color="inherit" 
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                mr: 1, 
                ml: 2,
                borderColor: 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem',
                display: { xs: 'none', sm: 'flex' },
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              اطلاعات بیشتر
            </Button>

            <IconButton
              color="inherit"
              aria-label="close"
              onClick={handleClose}
              size="small"
              sx={{
                position: { xs: 'absolute', sm: 'static' },
                right: 1,
                top: '50%',
                transform: { xs: 'translateY(-50%)', sm: 'none' },
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </>
  )
}