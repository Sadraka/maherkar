'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { apiGet } from '@/lib/axios';
import { EMPLOYER_THEME } from '@/constants/colors';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  ApplicantInfo,
  JobInfo,
  ApplicationStatus,
  ApplicationActions
} from '@/components/employer/applications';

/**
 * صفحه جزئیات درخواست کاریابی
 */
export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/ads/applications/${applicationId}/`);
        setApplicationData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت جزئیات درخواست:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری اطلاعات درخواست');
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId]);

  const handleStatusUpdate = (newStatus: string) => {
    // به‌روزرسانی وضعیت در state محلی
    console.log('Application status updated to:', newStatus);
    // می‌توانید اینجا state را به‌روزرسانی کنید یا صفحه را reload کنید
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (!applicationData) {
      return <ErrorState message="درخواست یافت نشد" />;
    }

    const jobSeeker = applicationData.job_seeker;
    const advertisement = applicationData.advertisement?.advertisement;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 } }}>
        <ApplicantInfo 
          applicant={jobSeeker}
          jobTitle={advertisement?.title}
        />
        
        <JobInfo jobTitle={advertisement?.title} />
        
        <ApplicationStatus createdAt={applicationData.created_at} />
        
        <ApplicationActions 
          applicationId={applicationId}
          onStatusUpdate={handleStatusUpdate}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }} dir="rtl">
      {/* دکمه بازگشت و هدر */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ 
            mb: 2, 
            color: EMPLOYER_THEME.primary,
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }}
        >
          بازگشت به لیست درخواست‌ها
        </Button>
        
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
          color: EMPLOYER_THEME.primary,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.4rem' }
        }}>
          جزئیات درخواست کاریابی
        </Typography>
      </Box>

      {renderContent()}
    </Container>
  );
}