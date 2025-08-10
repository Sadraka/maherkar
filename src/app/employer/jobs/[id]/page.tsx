'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/axios';

import JobDetails from '@/components/employer/jobs/JobDetails';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

/**
 * صفحه جزئیات آگهی شغلی
 */
export default function JobDetailPage() {
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

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (!jobData) {
      return <ErrorState message="آگهی یافت نشد" />;
    }

    return (
      <Box>
        {/* جزئیات آگهی */}
        <JobDetails job={jobData} />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} dir="rtl">
      {renderContent()}
    </Container>
  );
} 