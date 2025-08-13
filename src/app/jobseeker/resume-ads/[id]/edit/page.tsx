'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { apiGet, apiPut } from '@/lib/axios';
import CreateResumeAdForm from '@/components/jobseeker/resume-ads/CreateResumeAdForm';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import EditIcon from '@mui/icons-material/Edit';

/**
 * صفحه ویرایش آگهی رزومه
 */
export default function EditResumeAdPage() {
  const params = useParams();
  const [resumeAd, setResumeAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adId = params.id as string;

  // دریافت جزئیات آگهی رزومه برای ویرایش
  const fetchResumeAdDetail = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/ads/resume/${adId}/my-resume-detail/`);
      setResumeAd(response.data);
      setError(null);
    } catch (err: any) {
      console.error('خطا در دریافت جزئیات آگهی رزومه:', err);
      setError(err.response?.data?.error || 'خطا در بارگذاری اطلاعات آگهی رزومه');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adId) {
      fetchResumeAdDetail();
    }
  }, [adId]);

  // تابع ویرایش آگهی رزومه
  const handleUpdate = async (data: any) => {
    try {
      await apiPut(`/ads/resume/${adId}/`, data);
      return {
        success: true,
        message: 'آگهی رزومه با موفقیت ویرایش شد!',
        redirectUrl: `/jobseeker/resume-ads/${adId}`
      };
    } catch (error: any) {
      console.error('خطا در ویرایش آگهی رزومه:', error);
      throw error;
    }
  };

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
            color: JOB_SEEKER_THEME.primary,
            mb: 2
          }} 
        />
        <Typography color="text.secondary">
          در حال بارگذاری اطلاعات آگهی رزومه...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchResumeAdDetail}
          sx={{ backgroundColor: JOB_SEEKER_THEME.primary }}
        >
          تلاش مجدد
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <CreateResumeAdForm
          initialData={resumeAd}
          isEditMode={true}
          onSubmit={handleUpdate}
          pageTitle="ویرایش آگهی رزومه"
          pageIcon={<EditIcon />}
          submitButtonText="ذخیره تغییرات"
          successMessage="آگهی رزومه با موفقیت ویرایش شد!"
        />
      </Container>
    </Box>
  );
}