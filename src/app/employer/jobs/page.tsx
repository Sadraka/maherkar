'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { apiGet } from '@/lib/axios';
import { EMPLOYER_THEME } from '@/constants/colors';

// کامپوننت‌های اختصاصی
import JobsHeader from '../../../components/employer/jobs/JobsHeader';
import JobsGrid from '../../../components/employer/jobs/JobsGrid';
import JobsSearchAndSort from '../../../components/employer/jobs/JobsSearchAndSort';
import EmptyJobsState from '../../../components/employer/jobs/EmptyJobsState';

import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import CustomPagination from '@/components/common/CustomPagination';

/**
 * صفحه نمایش لیست آگهی‌های شغلی کارفرما
 */
export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allJobsData, setAllJobsData] = useState<any[]>([]);
  const [filteredJobsData, setFilteredJobsData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [hasSearchResults, setHasSearchResults] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9; // تعداد ثابت

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // دریافت آگهی‌های شغلی مربوط به کارفرما
        const jobsResponse = await apiGet('/ads/job/my-jobs/');
        const responseData = jobsResponse.data as { count: number; results: any[] };
        const allJobs = responseData.results;
        
        setAllJobsData(allJobs);
        setFilteredJobsData(allJobs);
        setTotalPages(Math.ceil(allJobs.length / pageSize));
        
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
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredJobsData.slice(startIndex, endIndex);
  };

  // تابع callback برای دریافت نتایج فیلتر شده
  const handleFilteredJobsChange = useCallback((filteredJobs: any[]) => {
    setFilteredJobsData(filteredJobs);
    setPage(1); // بازگشت به صفحه اول
    setTotalPages(Math.ceil(filteredJobs.length / pageSize));
  }, [pageSize]);

  // تابع callback برای دریافت وضعیت جستجو
  const handleSearchStateChange = useCallback((query: string, hasResults: boolean) => {
    setHasSearchResults(hasResults);
  }, []);

  // تابع callback برای دریافت متن جستجو
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // تابع callback برای دریافت فیلترهای فعال
  const handleFiltersChange = useCallback((status: string, subscription: string) => {
    setStatusFilter(status);
    setSubscriptionFilter(subscription);
  }, []);

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (allJobsData.length === 0) {
      // اگر اصلاً آگهی‌ای وجود ندارد
      return <EmptyJobsState />;
    }

    return (
      <Box>
        {/* کامپوننت جستجو و مرتب‌سازی */}
        <JobsSearchAndSort
          jobs={allJobsData}
          onFilteredJobsChange={handleFilteredJobsChange}
          onSearchStateChange={handleSearchStateChange}
          onSearchQueryChange={handleSearchQueryChange}
          onFiltersChange={handleFiltersChange}
        />
        
        {/* نمایش کارت‌ها یا پیام "نتیجه‌ای یافت نشد" */}
        <JobsGrid 
          jobs={getCurrentPageJobs()} 
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          subscriptionFilter={subscriptionFilter}
        />
        
        {totalPages > 1 && (
          <CustomPagination
              page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={() => {}} // تابع خالی چون pageSize ثابت است
            theme={EMPLOYER_THEME}
            showPageSizeSelector={false}
          />
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 } }} dir="rtl">
      <JobsHeader />
      {renderContent()}
    </Container>
  );
} 