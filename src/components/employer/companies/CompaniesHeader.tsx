import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import { EMPLOYER_THEME } from '@/constants/colors';

/**
 * کامپوننت هدر صفحه شرکت‌ها
 */
const CompaniesHeader = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
      <Typography variant="h5" component="h1" fontWeight="bold">
        شرکت‌های من
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          bgcolor: EMPLOYER_THEME.primary,
          '&:hover': { bgcolor: EMPLOYER_THEME.dark },
          borderRadius: 2,
          px: 3,
          py: 1,
          fontWeight: 'medium'
        }}
        component={Link}
        href="/employer/companies/create"
      >
        ثبت شرکت جدید
      </Button>
    </Box>
  );
};

export default CompaniesHeader; 