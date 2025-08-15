'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Box } from '@mui/material';
import { apiGet } from '@/lib/axios';
import { JOB_SEEKER_THEME } from '@/constants/colors';

// کامپوننت‌های اختصاصی
import ResumeAdsHeader from '../../../components/jobseeker/resume-ads/ResumeAdsHeader';
import ResumeAdsGrid from '../../../components/jobseeker/resume-ads/ResumeAdsGrid';
import ResumeAdsSearchAndSort from '../../../components/jobseeker/resume-ads/ResumeAdsSearchAndSort';
import EmptyResumeAdsState from '../../../components/jobseeker/resume-ads/EmptyResumeAdsState';

import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import CustomPagination from '@/components/common/CustomPagination';

/**
 * صفحه نمایش لیست آگهی‌های رزومه کارجو
 */
export default function ResumeAdsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allResumeAdsData, setAllResumeAdsData] = useState<any[]>([]);
  const [filteredResumeAdsData, setFilteredResumeAdsData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [hasSearchResults, setHasSearchResults] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9; // تعداد ثابت

  useEffect(() => {
    const fetchResumeAds = async () => {
      try {
        setLoading(true);
        
        // دریافت آگهی‌های رزومه مربوط به کارجو
        const resumeAdsResponse = await apiGet('/ads/resume/my-resumes/');
        const responseData = resumeAdsResponse.data as { count: number; results: any[] };
        const allResumeAds = responseData.results || responseData;
        
        setAllResumeAdsData(allResumeAds);
        setFilteredResumeAdsData(allResumeAds);
        setTotalPages(Math.ceil(allResumeAds.length / pageSize));
        
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت اطلاعات آگهی‌های رزومه:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری اطلاعات آگهی‌های رزومه');
      } finally {
        setLoading(false);
      }
    };

    fetchResumeAds();
  }, []);

  // گرفتن آگهی‌های مربوط به صفحه جاری
  const getCurrentPageResumeAds = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredResumeAdsData.slice(startIndex, endIndex);
  };

  // تابع callback برای دریافت نتایج فیلتر شده
  const handleFilteredResumeAdsChange = useCallback((filteredResumeAds: any[]) => {
    setFilteredResumeAdsData(filteredResumeAds);
    setPage(1); // بازگشت به صفحه اول
    setTotalPages(Math.ceil(filteredResumeAds.length / pageSize));
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

    if (allResumeAdsData.length === 0) {
      // اگر اصلاً آگهی‌ای وجود ندارد
      return <EmptyResumeAdsState />;
    }

    return (
      <Box>
        {/* کامپوننت جستجو و مرتب‌سازی */}
        <ResumeAdsSearchAndSort
          resumeAds={allResumeAdsData}
          onFilteredResumeAdsChange={handleFilteredResumeAdsChange}
          onSearchStateChange={handleSearchStateChange}
          onSearchQueryChange={handleSearchQueryChange}
          onFiltersChange={handleFiltersChange}
        />
        
        {/* نمایش کارت‌ها یا پیام "نتیجه‌ای یافت نشد" */}
        <ResumeAdsGrid 
          resumeAds={getCurrentPageResumeAds()} 
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
            theme={JOB_SEEKER_THEME}
            showPageSizeSelector={false}
          />
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 } }} dir="rtl">
      <ResumeAdsHeader />
      {renderContent()}
    </Container>
  );
}