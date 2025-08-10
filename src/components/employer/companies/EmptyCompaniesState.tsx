import React from 'react';
import { Typography, Box, Button, Paper } from '@mui/material';
import Link from 'next/link';
import BusinessIcon from '@mui/icons-material/Business';
import { EMPLOYER_THEME } from '@/constants/colors';

/**
 * کامپوننت نمایش حالت خالی بودن لیست شرکت‌ها
 */
const EmptyCompaniesState = () => {
  return (
    <Box sx={{ textAlign: 'center', my: { xs: 4, sm: 6, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5, md: 6 },
          maxWidth: 600,
          mx: 'auto',
          borderRadius: 3,
          boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
          border: '1px solid #f1f1f1'
        }}
      >
        <BusinessIcon sx={{ fontSize: { xs: 48, sm: 56, md: 64 }, color: '#e0e0e0', mb: { xs: 2, sm: 2.5, md: 3 } }} />
        <Typography variant="h6" fontWeight="medium" sx={{ 
          mb: 2,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          هنوز شرکتی ثبت نکرده‌اید
        </Typography>
        <Typography color="text.secondary" sx={{ 
          mb: { xs: 3, sm: 3.5, md: 4 },
          fontSize: { xs: '0.9rem', sm: '1rem' },
          px: { xs: 1, sm: 0 }
        }}>
          برای ثبت آگهی شغلی و استخدام نیروی کار، ابتدا باید اطلاعات شرکت خود را وارد کنید.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: EMPLOYER_THEME.primary,
            '&:hover': { bgcolor: EMPLOYER_THEME.dark },
            px: { xs: 3, sm: 4 },
            py: { xs: 1.2, sm: 1.5 },
            borderRadius: 6,
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            fontWeight: 'medium',
            boxShadow: `0 3px 8px rgba(33, 150, 243, 0.3)`,
            width: { xs: '100%', sm: 'auto' }
          }}
          component={Link}
          href="/employer/companies/create"
        >
          ثبت شرکت جدید
        </Button>
      </Paper>
    </Box>
  );
};

export default EmptyCompaniesState; 