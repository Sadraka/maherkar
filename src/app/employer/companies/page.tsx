'use client';

import React, { useEffect, useState } from 'react';
import { Container, Pagination, Box } from '@mui/material';
import { apiGet } from '@/lib/axios';

// کامپوننت‌های اختصاصی
import CompaniesHeader from '@/components/employer/companies/CompaniesHeader';
import CompaniesGrid from '@/components/employer/companies/CompaniesGrid';
import EmptyCompaniesState from '@/components/employer/companies/EmptyCompaniesState';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

/**
 * صفحه نمایش لیست شرکت‌های کارفرما
 */
export default function CompaniesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/companies/');
        const allCompanies = response.data as any[];
        setCompaniesData(allCompanies);
        setTotalPages(Math.ceil(allCompanies.length / itemsPerPage));
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
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return companiesData.slice(startIndex, endIndex);
  };

  // تغییر صفحه
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, dir: 'ltr' }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                shape="rounded"
              />
            </Box>
          )}
        </>
      );
    }

    return <EmptyCompaniesState />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} dir="rtl">
      <CompaniesHeader />
      {renderContent()}
    </Container>
  );
} 