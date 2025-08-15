'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { JOB_SEEKER_THEME } from '@/constants/colors';

interface ResumeAdDetailProps {
  adId: string;
}

/**
 * کامپوننت نمایش جزئیات آگهی رزومه - در حال تکمیل
 */
export default function ResumeAdDetail({ adId }: ResumeAdDetailProps) {
  const router = useRouter();

  return (
    <Box sx={{ 
      bgcolor: '#fafafa', 
      minHeight: '100vh', 
      py: 6 
    }} dir="rtl">
      <Container maxWidth="md">
        {/* دکمه بازگشت */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: JOB_SEEKER_THEME.primary,
              color: JOB_SEEKER_THEME.primary,
              '&:hover': {
                borderColor: JOB_SEEKER_THEME.dark,
                backgroundColor: 'rgba(0, 112, 60, 0.05)'
              }
            }}
          >
            بازگشت
          </Button>
        </Box>

        {/* محتوای اصلی */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 6,
            textAlign: 'center',
            border: '1px solid #E0E0E0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: JOB_SEEKER_THEME.primary,
              mb: 3
            }}
          >
            در حال تکمیل این بخش...
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4
            }}
          >
            صفحه جزئیات آگهی رزومه در حال توسعه است.
          </Typography>

          <Button
            variant="contained"
            onClick={() => router.push('/jobseeker/resume-ads')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: JOB_SEEKER_THEME.primary,
              '&:hover': {
                backgroundColor: JOB_SEEKER_THEME.dark
              }
            }}
          >
            بازگشت به آگهی‌های من
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
