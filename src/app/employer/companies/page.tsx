'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Container, Box } from '@mui/material';
import { apiGet } from '@/lib/axios';
import { EMPLOYER_THEME } from '@/constants/colors';

// کامپوننت‌های اختصاصی
import CompaniesHeader from '@/components/employer/companies/CompaniesHeader';
import CompaniesGrid from '@/components/employer/companies/CompaniesGrid';
import EmptyCompaniesState from '@/components/employer/companies/EmptyCompaniesState';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import CustomPagination from '@/components/common/CustomPagination';

/**
 * صفحه نمایش لیست شرکت‌های کارفرما
 */
export default function CompaniesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9; // تعداد ثابت

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/companies/');
        const allCompanies = response.data as any[];
        setCompaniesData(allCompanies);
        setTotalPages(Math.ceil(allCompanies.length / pageSize));
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت اطلاعات شرکت‌ها:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری اطلاعات شرکت‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // گرفتن شرکت‌های مربوط به صفحه جاری
  const getCurrentPageCompanies = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return companiesData.slice(startIndex, endIndex);
  };

  // رندر محتوای اصلی صفحه
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (companiesData.length > 0) {
      return (
        <>
          <CompaniesGrid companies={getCurrentPageCompanies()} />
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
        </>
      );
    }

    return <EmptyCompaniesState />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 } }} dir="rtl">
      <Suspense fallback={<LoadingState />}>
        <CompaniesHeader />
        {renderContent()}
      </Suspense>
    </Container>
  );
} 