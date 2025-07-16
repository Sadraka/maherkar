'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/axios';
import { EMPLOYER_THEME } from '@/constants/colors';

// آیکون‌ها
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';

// کامپوننت‌ها
import CreateJobForm from './CreateJobForm';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface JobCreationWizardProps {
  onComplete?: () => void;
}

enum WizardStep {
  CHECK_COMPANY = 'check_company',
  CREATE_COMPANY = 'create_company', 
  JOB_FORM = 'job_form'
}

/**
 * کامپوننت ساده‌شده مدیریت فرآیند ثبت آگهی شغلی
 * آگهی با اشتراک رایگان پیش‌فرض ثبت می‌شود
 */
export default function JobCreationWizard({ onComplete }: JobCreationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.CHECK_COMPANY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  // بررسی وجود شرکت
  useEffect(() => {
    const checkCompanies = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/companies/');
        const userCompanies = response.data as Company[];
        setCompanies(userCompanies);

        if (userCompanies.length === 0) {
          setCurrentStep(WizardStep.CREATE_COMPANY);
        } else {
          setCurrentStep(WizardStep.JOB_FORM);
        }
      } catch (err) {
        console.error('خطا در دریافت شرکت‌ها:', err);
        setError('خطا در بررسی وضعیت شرکت‌ها');
      } finally {
        setLoading(false);
      }
    };

    checkCompanies();
  }, []);

  // تکمیل ثبت آگهی
  const handleJobSubmissionComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      // در فرآیند جدید، کاربر به درگاه پرداخت هدایت می‌شود
      // و بعد از پرداخت موفق، به صفحه آگهی‌ها برمی‌گردد
      // فعلاً نیازی به هدایت خاص نیست
    }
  };

  // رندر محتوای مراحل مختلف
  const renderStepContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    switch (currentStep) {
      case WizardStep.CHECK_COMPANY:
        return <LoadingState />;

      case WizardStep.CREATE_COMPANY:
        return (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <BusinessIcon sx={{ fontSize: 64, color: EMPLOYER_THEME.primary, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: EMPLOYER_THEME.primary }}>
              ابتدا شرکت خود را ثبت کنید
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              برای ثبت آگهی شغلی، ابتدا باید اطلاعات شرکت خود را تکمیل کنید
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: EMPLOYER_THEME.primary,
                '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 'medium'
              }}
              onClick={() => router.push('/employer/companies/create')}
            >
              ثبت اطلاعات شرکت
            </Button>
          </Paper>
        );

      case WizardStep.JOB_FORM:
        return (
          <CreateJobForm 
            pageTitle="ثبت آگهی شغلی جدید"
            pageIcon={<WorkIcon />}
            submitButtonText="ثبت آگهی و پرداخت"
            successMessage="در حال هدایت به درگاه پرداخت..."
          />
        );

      default:
        return null;
    }
  };

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* نمایش مراحل فقط در صورت نیاز */}
      {currentStep !== WizardStep.JOB_FORM && (
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={getStepIndex()} alternativeLabel>
            <Step>
              <StepLabel>بررسی شرکت</StepLabel>
            </Step>
            <Step>
              <StepLabel>ثبت آگهی</StepLabel>
            </Step>
          </Stepper>
        </Box>
      )}

      {/* محتوای مرحله */}
      {renderStepContent()}
    </Box>
  );

  // تابع کمکی برای تعیین شماره مرحله فعلی
  function getStepIndex(): number {
    switch (currentStep) {
      case WizardStep.CHECK_COMPANY:
      case WizardStep.CREATE_COMPANY:
        return 0;
      case WizardStep.JOB_FORM:
        return 1;
      default:
        return 0;
    }
  }
} 