'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/axios';
import { EMPLOYER_THEME } from '@/constants/colors';

// آیکون‌ها
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';

// کامپوننت‌ها
import CreateJobForm from './CreateJobForm';
import ErrorState from '@/components/common/ErrorState';

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface JobCreationWizardProps {
  onComplete?: () => void;
}

/**
 * کامپوننت ساده مدیریت فرآیند ثبت آگهی شغلی
 */
export default function JobCreationWizard({ onComplete }: JobCreationWizardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompany, setHasCompany] = useState(false);

  // بررسی وجود شرکت
  useEffect(() => {
    const checkCompanies = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/companies/');
        const userCompanies = response.data as Company[];
        setHasCompany(userCompanies.length > 0);
      } catch (err) {
        console.error('خطا در دریافت شرکت‌ها:', err);
        setError('خطا در بررسی وضعیت شرکت‌ها');
      } finally {
        setLoading(false);
      }
    };

    checkCompanies();
  }, []);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <CircularProgress 
          size={60} 
          sx={{ 
            color: EMPLOYER_THEME.primary, 
            mb: 3 
          }} 
        />
        <Typography variant="h6" sx={{ 
          color: EMPLOYER_THEME.primary, 
          fontWeight: 600,
          mb: 1
        }}>
          در حال بررسی اطلاعات...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          لطفاً کمی صبر کنید
        </Typography>
      </Box>
    );
  }

  if (!hasCompany) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 3, 
            textAlign: 'center', 
            border: `2px solid ${EMPLOYER_THEME.primary}`,
            boxShadow: '0 4px 15px rgba(66,133,244,0.05)'
          }}
        >
          <BusinessIcon sx={{ 
            fontSize: { xs: 48, sm: 64 }, 
            color: EMPLOYER_THEME.primary, 
            mb: 2 
          }} />
          <Typography variant="h5" fontWeight="bold" sx={{ 
            mb: 2, 
            color: EMPLOYER_THEME.primary,
            fontSize: { xs: '1.3rem', sm: '1.5rem' }
          }}>
            ابتدا شرکت خود را ثبت کنید
          </Typography>
          <Typography color="text.secondary" sx={{ 
            mb: 4,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            برای ثبت آگهی شغلی، ابتدا باید اطلاعات شرکت خود را تکمیل کنید
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: EMPLOYER_THEME.primary,
              '&:hover': { 
                bgcolor: EMPLOYER_THEME.dark,
                transform: 'translateY(-1px)'
              },
              px: { xs: 3, sm: 4 },
              py: 1.5,
              borderRadius: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 'medium',
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => router.push('/employer/companies/create')}
          >
            ثبت اطلاعات شرکت
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <CreateJobForm 
      pageTitle="ثبت آگهی شغلی جدید"
      pageIcon={<WorkIcon />}
      submitButtonText="ثبت آگهی و پرداخت"
      successMessage="در حال هدایت به درگاه پرداخت..."
    />
  );
} 