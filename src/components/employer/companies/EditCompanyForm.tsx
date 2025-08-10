'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/axios';
import { CircularProgress, Alert, AlertTitle, Box, Paper, Typography } from '@mui/material';
import CreateCompanyForm, { Company } from './CreateCompanyForm';
import EditIcon from '@mui/icons-material/Edit';
import { EMPLOYER_THEME } from '@/constants/colors';

export default function EditCompanyForm() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        if (!companyId) {
          throw new Error('شناسه شرکت نامعتبر است');
        }

        const response = await apiGet(`/companies/${companyId}/`);
        setCompany(response.data as Company);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات شرکت:', err);
        setError('خطا در دریافت اطلاعات شرکت. لطفاً مجدداً تلاش کنید.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleCompanyUpdate = async (data: any, formData: FormData) => {
    try {
      await apiPut(`/companies/${companyId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        message: 'شرکت با موفقیت ویرایش شد',
        redirectUrl: '/employer/companies',
      };
    } catch (err) {
      console.error('خطا در ویرایش شرکت:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: { xs: 2, md: 3 },
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px'
        }}
        dir="rtl"
      >
        <CircularProgress size={40} sx={{ color: EMPLOYER_THEME.primary }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: { xs: 2, md: 3 },
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}
        dir="rtl"
      >
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
        >
          <AlertTitle>خطا</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography 
            variant="body2" 
            color="primary" 
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => router.push('/employer/companies')}
          >
            بازگشت به لیست شرکت‌ها
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box dir="rtl">
      <CreateCompanyForm 
        initialData={company} 
        isEditMode={true} 
        onSubmit={handleCompanyUpdate}
        pageTitle=""
        pageIcon={<EditIcon />}
        submitButtonText="ذخیره تغییرات"
        successMessage="شرکت با موفقیت ویرایش شد"
      />
    </Box>
  );
} 