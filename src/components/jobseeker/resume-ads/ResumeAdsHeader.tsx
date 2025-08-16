import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import CampaignIcon from '@mui/icons-material/Campaign';
import { JOB_SEEKER_THEME } from '@/constants/colors';

interface ResumeAdsHeaderProps {
  showCreateButton?: boolean;
}

/**
 * کامپوننت هدر صفحه آگهی‌های رزومه
 */
const ResumeAdsHeader = ({ showCreateButton = true }: ResumeAdsHeaderProps) => {
  return (
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: 2
    }}>
      {/* عنوان و توضیح - سمت راست */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
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

      </Box>
      
      {/* دکمه ثبت آگهی رزومه جدید - پایین متن در موبایل، سمت چپ در دسکتاپ */}
      {showCreateButton && (
        <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
          <Link href="/jobseeker/resume-ads/create" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                backgroundColor: `${JOB_SEEKER_THEME.primary} !important`,
                background: `${JOB_SEEKER_THEME.primary} !important`,
                color: 'white',
                borderRadius: 2,
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.2 },
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                boxShadow: `0 4px 12px ${JOB_SEEKER_THEME.primary}40`,
                '&:hover': {
                  backgroundColor: `${JOB_SEEKER_THEME.dark} !important`,
                  background: `${JOB_SEEKER_THEME.dark} !important`,
                  boxShadow: `0 6px 16px ${JOB_SEEKER_THEME.primary}60`,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease',
                width: { xs: '100%', md: 'auto' },
                minWidth: { md: 200 },
                mt: { xs: 2, md: 0 }
              }}
            >
              ثبت آگهی رزومه جدید
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default ResumeAdsHeader;