import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { JOB_SEEKER_THEME } from '@/constants/colors';

/**
 * کامپوننت نمایش حالت خالی آگهی‌های رزومه
 */
const EmptyResumeAdsState = () => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 4, sm: 6, md: 8 }, 
        textAlign: 'center',
        borderRadius: 3,
        border: '1px solid #E0E0E0',
        backgroundColor: '#fafafa',
        maxWidth: { xs: '100%', md: 900 },
        mx: 'auto'
      }}
    >
      {/* آیکون */}
      <Box 
        sx={{ 
          fontSize: { xs: '4rem', sm: '5rem', md: '6rem' }, 
          color: '#e0e0e0', 
          mb: 3,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <CampaignIcon fontSize="inherit" />
      </Box>

      {/* عنوان اصلی */}
      <Typography 
        variant="h5" 
        component="h2"
        sx={{ 
          color: 'text.primary',
          fontWeight: 700,
          mb: 2,
          fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' }
        }}
      >
        هنوز آگهی رزومه‌ای ثبت نکرده‌اید
      </Typography>

      {/* توضیح */}
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: 4,
          maxWidth: 500,
          mx: 'auto',
          lineHeight: 1.7,
          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
        }}
      >
        با ثبت آگهی رزومه، کارفرماها می‌توانند شما را پیدا کرده و برای موقعیت‌های شغلی مناسب دعوت کنند.
        این کار باعث افزایش شانس پیدا کردن شغل مناسب می‌شود.
      </Typography>

      {/* دکمه‌های عملیات */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* دکمه اصلی - ثبت آگهی رزومه */}
        <Link href="/jobseeker/resume-ads/create" style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: JOB_SEEKER_THEME.primary,
              backgroundImage: 'none',
              color: 'white',
              borderRadius: 2,
              px: { xs: 3, sm: 4 },
              py: { xs: 1.2, sm: 1.5 },
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontWeight: 600,
              minWidth: { xs: '100%', sm: 200 },
              boxShadow: `0 4px 12px ${JOB_SEEKER_THEME.primary}40`,
              '&:hover': {
                background: JOB_SEEKER_THEME.dark,
                backgroundImage: 'none',
                boxShadow: `0 6px 16px ${JOB_SEEKER_THEME.primary}60`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ثبت آگهی رزومه جدید
          </Button>
        </Link>

        {/* دکمه ثانویه - مشاهده نمونه‌ها */}
        <Link href="/job" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: JOB_SEEKER_THEME.primary,
              color: JOB_SEEKER_THEME.primary,
              borderRadius: 2,
              px: { xs: 3, sm: 4 },
              py: { xs: 1.2, sm: 1.5 },
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontWeight: 600,
              minWidth: { xs: '100%', sm: 180 },
              '&:hover': {
                borderColor: JOB_SEEKER_THEME.dark,
                color: JOB_SEEKER_THEME.dark,
                backgroundColor: `${JOB_SEEKER_THEME.primary}08`
              }
            }}
          >
            مشاهده آگهی‌های شغلی
          </Button>
        </Link>
      </Box>

      {/* راهنمای اضافی */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E0E0E0' }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            lineHeight: 1.6
          }}
        >
           <strong>نکته:</strong> قبل از ثبت آگهی رزومه، حتماً رزومه خود را تکمیل کنید تا کارفرماها اطلاعات کاملی از شما داشته باشند.
        </Typography>
      </Box>
    </Paper>
  );
};

export default EmptyResumeAdsState;