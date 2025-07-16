import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import { EMPLOYER_THEME } from '@/constants/colors';

/**
 * کامپوننت هدر صفحه آگهی‌های شغلی
 */
const JobsHeader = () => {
  return (
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'stretch', sm: 'center' },
      gap: 2
    }}>
      {/* عنوان و توضیح */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <WorkIcon sx={{ 
            fontSize: { xs: 32, md: 42 }, 
            color: EMPLOYER_THEME.primary,
            transform: 'translateY(-2px)'
          }} />
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold" 
            sx={{ 
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: EMPLOYER_THEME.primary
            }}
          >
            آگهی‌های شغلی
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
          مدیریت و بررسی آگهی‌های شغلی شما
        </Typography>
      </Box>

      {/* دکمه ثبت آگهی جدید */}
                    <Link href="/employer/jobs/create" style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: EMPLOYER_THEME.primary,
            color: 'white',
            borderRadius: 2,
            px: { xs: 2, md: 3 },
            py: { xs: 1, md: 1.2 },
            fontSize: { xs: '0.9rem', md: '1rem' },
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
            '&:hover': {
              backgroundColor: EMPLOYER_THEME.dark,
              boxShadow: '0 6px 16px rgba(66, 133, 244, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          ثبت آگهی جدید
        </Button>
      </Link>
    </Box>
  );
};

export default JobsHeader; 