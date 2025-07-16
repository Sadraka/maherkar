import React from 'react';
import { Metadata } from 'next';
import { Box, Container, Typography, Button } from '@mui/material';
import EditCompanyForm from '@/components/employer/companies/EditCompanyForm';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { EMPLOYER_THEME } from '@/constants/colors';

export const metadata: Metadata = {
  title: 'ویرایش شرکت',
  description: 'ویرایش اطلاعات شرکت در ماهرکار',
};

export default function EditCompanyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        justifyContent: 'space-between',
        gap: 2,
        mb: 3
      }}
      dir="rtl"
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5 
        }}>
          <EditIcon sx={{ 
            fontSize: { xs: 28, md: 32 }, 
            color: EMPLOYER_THEME.primary 
          }} />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '1.5rem', md: '1.75rem' },
              fontWeight: 'bold',
              color: EMPLOYER_THEME.primary
            }}
          >
            ویرایش شرکت
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/employer/companies"
          variant="text"
          color="primary"
          startIcon={<ArrowBackIcon />}
          sx={{ 
            color: EMPLOYER_THEME.primary,
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            },
            fontSize: { xs: '0.85rem', md: '0.9rem' }
          }}
        >
          بازگشت به لیست شرکت‌ها
        </Button>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <EditCompanyForm />
      </Box>
    </Container>
  );
} 