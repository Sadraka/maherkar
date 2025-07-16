'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/axios';

import EditJobForm from '@/components/employer/jobs/EditJobForm';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

/**
 * صفحه ویرایش آگهی شغلی
 */
export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/ads/job/${jobId}/my-job-detail/`);
        setJobData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت جزئیات آگهی:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری اطلاعات آگهی');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const handleUpdateJob = async (data: any) => {
    try {
      await apiPut(`/ads/job/${jobId}/`, data);
      return {
        success: true,
        message: 'آگهی با موفقیت بروزرسانی شد',
        redirectUrl: `/employer/jobs/${jobId}`
      };
    } catch (err: any) {
      console.error('خطا در بروزرسانی آگهی:', err);
      throw err;
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (jobData) {
      return (
        <EditJobForm 
          initialData={jobData}
          onSubmit={handleUpdateJob}
          pageTitle="ویرایش آگهی شغلی"
          submitButtonText="بروزرسانی آگهی"
          successMessage="آگهی با موفقیت بروزرسانی شد. در حال انتقال به صفحه آگهی..."
        />
      );
    }

    return <ErrorState message="آگهی یافت نشد" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} dir="rtl">
      {renderContent()}
    </Container>
  );
} 