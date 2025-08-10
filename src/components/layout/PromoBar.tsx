'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Container, Typography, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTheme } from '@mui/material/styles'
import cookieService, { COOKIE_NAMES } from '@/lib/cookieService'
import { useAuth } from '@/store/authStore'

export default function PromoBar() {
  const theme = useTheme()
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [barHeight, setBarHeight] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  // بررسی نوع کاربر - فقط کارفرماها پرومو بار را ببینند
  const shouldShowPromoBar = user?.user_type === 'EM' || !user

  // برای بستن دستی نوار تبلیغاتی
  const handleClose = () => {
    setIsClosing(true)
    // ذخیره وضعیت در کوکی برای جلوگیری از نمایش مجدد در بارگذاری‌های بعدی
    cookieService.setCookie(COOKIE_NAMES.PROMO_BAR_CLOSED, 'true', 30); // 30 روز

    // اطلاع‌رسانی به هدر که پرومو بار بسته شده
    window.dispatchEvent(new CustomEvent('promoBarClosed'));
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

    // برای تست، کوکی را پاک می‌کنیم تا نوار همیشه نمایش داده شود
    cookieService.deleteCookie(COOKIE_NAMES.PROMO_BAR_CLOSED);

    setIsVisible(true)
    
    // اطلاع‌رسانی به هدر که پرومو بار لود شده
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('promoBarLoaded'));
    }, 10);
  }, []);

  // قبل از اینکه کامپوننت در سمت کلاینت مانت شود، چیزی نمایش نده
  // این کار از خطای هیدراسیون جلوگیری می‌کند
  if (!isMounted) return null;

  // اگر کاربر کارجو است، هیچ‌چیزی نمایش نده (نه پرومو بار و نه فضای خالی)
  if (!shouldShowPromoBar) return null;

  // اگر نوار کاملاً بسته شده، آن را حذف کن
  if (!isVisible) return null;

  return (
    <>
      {/* فضای خالی با انیمیشن ارتفاع برای جلوگیری از پرش محتوا */}
      <Box
        sx={{
          height: isClosing ? 0 : barHeight,
          transition: 'height 0.3s ease'
        }}
      />

      <Box
        ref={barRef}
        data-testid="promo-bar"
        sx={{
          bgcolor: '#0d47a1', // رنگ آبی تیره‌تر
          color: 'white',
          py: 1,
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar + 1,
          transform: isClosing ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease',
        }}
        onTransitionEnd={() => {
          if (isClosing) {
            setIsVisible(false);
          }
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
              variant="text"
              endIcon={<ArrowForwardIcon />}
              sx={{
                mr: 1,
                ml: 2,
                fontSize: '0.75rem',
                display: { xs: 'none', sm: 'flex' },
                whiteSpace: 'nowrap',
                '&:hover': {
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