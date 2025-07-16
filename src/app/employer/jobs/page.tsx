'use client';

import React, { useEffect, useState } from 'react';
import { Container, Pagination, Box } from '@mui/material';
import { apiGet } from '@/lib/axios';

// کامپوننت‌های اختصاصی
import JobsHeader from '../../../components/employer/jobs/JobsHeader';
import JobsGrid from '../../../components/employer/jobs/JobsGrid';
import EmptyJobsState from '../../../components/employer/jobs/EmptyJobsState';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

/**
 * صفحه نمایش لیست آگهی‌های شغلی کارفرما
 */
export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // دریافت آگهی‌های شغلی مربوط به کارفرما
        const jobsResponse = await apiGet('/ads/job/my-jobs/');
        const responseData = jobsResponse.data as { count: number; results: any[] };
        const allJobs = responseData.results;
        
        setJobsData(allJobs);
        setTotalPages(Math.ceil(allJobs.length / itemsPerPage));
        
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت اطلاعات آگهی‌ها:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری اطلاعات آگهی‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // گرفتن آگهی‌های مربوط به صفحه جاری
  const getCurrentPageJobs = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return jobsData.slice(startIndex, endIndex);
  };

  // تغییر صفحه
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (jobsData.length === 0) {
      return <EmptyJobsState />;
    }

    return (
      <Box>
        <JobsGrid jobs={getCurrentPageJobs()} />
        
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} dir="rtl">
      <JobsHeader />
      {renderContent()}
    </Container>
  );
} 