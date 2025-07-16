'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Alert, Button } from '@mui/material';
import { useParams, useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/axios';

import JobDetails from '@/components/employer/jobs/JobDetails';
import UpgradeSubscription from '@/components/employer/jobs/UpgradeSubscription';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { EMPLOYER_THEME } from '@/constants/colors';

/**
 * صفحه جزئیات آگهی شغلی با امکان ارتقا اشتراک
 */
export default function JobDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const showUpgrade = searchParams.get('showUpgrade') === 'true';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/ads/job/${jobId}/my-job-detail/`);
        setJobData(response.data);
        setError(null);
        
        // اگر پارامتر showUpgrade وجود داشت، پیام موفقیت و دکمه ارتقا نمایش داده شود
        if (showUpgrade) {
          setShowSuccessMessage(true);
        }
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
  }, [jobId, showUpgrade]);

  const handleOpenUpgradeDialog = () => {
    setUpgradeDialogOpen(true);
  };

  const handleCloseUpgradeDialog = () => {
    setUpgradeDialogOpen(false);
    setShowSuccessMessage(false);
    // حذف پارامتر showUpgrade از URL
    const url = new URL(window.location.href);
    url.searchParams.delete('showUpgrade');
    window.history.replaceState({}, '', url.toString());
  };

  const handleUpgradeSuccess = () => {
    setUpgradeDialogOpen(false);
    setShowSuccessMessage(false);
    // رفرش داده‌های آگهی
    window.location.reload();
  };

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
        {/* پیام موفقیت ثبت آگهی */}
        {showSuccessMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleOpenUpgradeDialog}
                sx={{ fontWeight: 'bold' }}
              >
                ارتقا اشتراک
              </Button>
            }
          >
            آگهی شما با موفقیت ثبت شد! برای افزایش بازدید می‌توانید اشتراک خود را ارتقا دهید.
          </Alert>
        )}

        {/* جزئیات آگهی */}
        <JobDetails job={jobData} />

        {/* دکمه ارتقا اشتراک (در صورت عدم نمایش پیام موفقیت) */}
        {!showSuccessMessage && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleOpenUpgradeDialog}
              sx={{
                borderColor: EMPLOYER_THEME.primary,
                color: EMPLOYER_THEME.primary,
                '&:hover': { 
                  borderColor: EMPLOYER_THEME.dark,
                  backgroundColor: `${EMPLOYER_THEME.primary}10`
                }
              }}
            >
              ارتقا اشتراک آگهی
            </Button>
          </Box>
        )}

        {/* دیالوگ ارتقا اشتراک */}
        <UpgradeSubscription
          jobId={jobId}
          open={upgradeDialogOpen}
          onClose={handleCloseUpgradeDialog}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} dir="rtl">
      {renderContent()}
    </Container>
  );
} 