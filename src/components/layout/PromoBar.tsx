'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTheme } from '@mui/material/styles'

export default function PromoBar() {
  const theme = useTheme()
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  // برای بستن دستی نوار تبلیغاتی
  const handleClose = () => {
    setIsVisible(false)
    // ذخیره وضعیت در localStorage برای جلوگیری از نمایش مجدد در بارگذاری‌های بعدی
    localStorage.setItem('promoBarClosed', 'true')
  }

  useEffect(() => {
    // بررسی localStorage برای تشخیص اینکه آیا کاربر قبلاً نوار را بسته است
    const isClosed = localStorage.getItem('promoBarClosed') === 'true'
    setIsVisible(!isClosed)

    // تشخیص اسکرول
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // اگر نوار به صورت دستی بسته شده یا با اسکرول مخفی شده، نمایش ندهید
  if (!isVisible || isScrolled) return null

  return (
    <Box
      sx={{
        bgcolor: theme.palette.primary.main,
        color: 'white',
        py: 1,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: isScrolled ? 'translateY(-100%)' : 'translateY(0)',
        opacity: isScrolled ? 0 : 1,
        position: 'relative',
        zIndex: theme.zIndex.appBar + 1,
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
  )
} 