'use client';

import React, { useEffect, useState } from 'react';
import { Container } from '@mui/material';
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

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/companies/');
        setCompaniesData(response.data as any[]);
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

  // رندر محتوای اصلی صفحه
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (companiesData.length > 0) {
      return <CompaniesGrid companies={companiesData} />;
    }

    return <EmptyCompaniesState />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <CompaniesHeader />
      {renderContent()}
    </Container>
  );
} 