import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import { JOB_SEEKER_THEME } from '@/constants/colors';

/**
 * کامپوننت هدر صفحه آگهی‌های رزومه
 */
const ResumeAdsHeader = () => {
  return (
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'flex-start',
      alignItems: { xs: 'stretch', sm: 'center' },
      gap: 2,
      textAlign: 'left',
      direction: 'ltr'
    }}>
      {/* عنوان و توضیح */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <CampaignIcon sx={{ 
            fontSize: { xs: 32, md: 42 }, 
            color: JOB_SEEKER_THEME.primary,
            transform: 'translateY(-2px)'
          }} />
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold" 
            sx={{ 
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: JOB_SEEKER_THEME.primary
            }}
          >
            آگهی‌های رزومه من
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            fontSize: { xs: '0.9rem', md: '1rem' },
            maxWidth: { xs: '100%', sm: '400px' }
          }}
        >
          مدیریت و بررسی آگهی‌های رزومه خود و مشاهده وضعیت آن‌ها
        </Typography>
      </Box>

      {/* دکمه ثبت آگهی رزومه جدید */}
      <Link href="/jobseeker/resume-ads/create" style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: JOB_SEEKER_THEME.primary,
            color: 'white',
            borderRadius: 2,
            px: { xs: 2, md: 3 },
            py: { xs: 1, md: 1.2 },
            fontSize: { xs: '0.9rem', md: '1rem' },
            fontWeight: 600,
            boxShadow: `0 4px 12px ${JOB_SEEKER_THEME.primary}40`,
            '&:hover': {
              backgroundColor: JOB_SEEKER_THEME.dark,
              boxShadow: `0 6px 16px ${JOB_SEEKER_THEME.primary}60`,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          ثبت آگهی رزومه جدید
        </Button>
      </Link>
    </Box>
  );
};

export default ResumeAdsHeader;