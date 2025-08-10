'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { apiGet } from '@/lib/axios';
import { EMPLOYER_THEME } from '@/constants/colors';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import CustomPagination from '@/components/common/CustomPagination';
import { 
  ApplicationCard, 
  EmptyApplicationsState, 
  ApplicationsHeader 
} from '@/components/employer/applications';

/**
 *  نمایش درخواست‌های کاریابی کارفرما
 */
export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/ads/applications/');
        const allApplications = response.data as any[];
        setApplicationsData(allApplications);
        setTotalPages(Math.ceil(allApplications.length / pageSize));
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت درخواست‌های کاریابی:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری درخواست‌های کاریابی');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // گرفتن درخواست‌های مربوط به صفحه جاری
  const getCurrentPageApplications = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return applicationsData.slice(startIndex, endIndex);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (applicationsData.length === 0) {
      return <EmptyApplicationsState />;
    }

    return (
      <>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: { xs: 2, sm: 3, md: 4 } 
        }}>
          {getCurrentPageApplications().map((application, index) => (
            <ApplicationCard
              key={application.id || index}
              application={application}
            />
          ))}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ mt: 4 }}>
            <CustomPagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
              theme={EMPLOYER_THEME}
              showPageSizeSelector={false}
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }} dir="rtl">
      <ApplicationsHeader applicationsCount={applicationsData.length} />
      {renderContent()}
    </Container>
  );
}