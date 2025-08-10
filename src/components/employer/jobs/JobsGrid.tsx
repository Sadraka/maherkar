'use client';

import React from 'react';
import { Box, Typography, Container, Skeleton, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import JobCard from './JobCard';
import EmployerJobCard from '../dashboard/EmployerJobCard';
import EmptyJobsState from './EmptyJobsState';
import { JobAdvertisement } from '@/types';

interface JobsGridProps {
  jobs: JobAdvertisement[];
  loading?: boolean;
  searchQuery?: string;
  statusFilter?: string;
  subscriptionFilter?: string;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onView?: (jobId: string) => void;
}

// کامپوننت نمایش‌دهنده Skeleton
const JobCardSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 2, sm: 2.5, md: 3 },
        border: `1px solid #E0E0E0`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.25s ease-in-out',
        p: 0,
        width: '100%',
        mx: 'auto',
      }}
    >
      <CardContent sx={{ p: { xs: 1.2, sm: 1.5 }, pb: "0px !important", flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* عنوان شغل */}
        <Skeleton
          variant="text"
          width="90%"
          height={32}
          sx={{
            borderRadius: 1,
            mb: { xs: 1.2, sm: 1.5 }
          }}
        />

        {/* اطلاعات شغلی */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.2 } }}>
          {/* محل کار */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{
                mr: { xs: 0.8, sm: 1 },
                ml: 0.5
              }}
            />
            <Skeleton
              variant="text"
              width="60%"
              height={24}
            />
          </Box>

          {/* زمان انتشار */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{
                mr: { xs: 0.8, sm: 1 },
                ml: 0.5
              }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={24}
            />
          </Box>

          {/* نوع کار */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{
                mr: { xs: 0.8, sm: 1 },
                ml: 0.5
              }}
            />
            <Skeleton
              variant="text"
              width="50%"
              height={24}
            />
          </Box>

          {/* حقوق */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{
                mr: { xs: 0.8, sm: 1 },
                ml: 0.5
              }}
            />
            <Skeleton
              variant="text"
              width="70%"
              height={24}
              sx={{
                borderRadius: 1
              }}
            />
          </Box>
        </Box>

        {/* دکمه‌های عملیات */}
        <Box sx={{ mt: { xs: 1.2, sm: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton
              variant="rectangular"
              height={44}
              width="70%"
              sx={{
                borderRadius: 1.5
              }}
            />
            <Skeleton
              variant="rectangular"
              height={44}
              width={44}
              sx={{
                borderRadius: 1.5
              }}
            />
            <Skeleton
              variant="rectangular"
              height={44}
              width={44}
              sx={{
                borderRadius: 1.5
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const JobsGrid: React.FC<JobsGridProps> = ({
  jobs,
  loading = false,
  searchQuery = '',
  statusFilter = 'all',
  subscriptionFilter = 'all',
  onEdit,
  onDelete,
  onView
}) => {
  // تابع تبدیل وضعیت به متن فارسی
  const getStatusText = (status: string) => {
    switch (status) {
      case 'P': return 'در انتظار بررسی';
      case 'A': return 'تایید شده';
      case 'R': return 'رد شده';
      default: return status;
    }
  };

  // تابع تبدیل نوع اشتراک به متن فارسی
  const getSubscriptionText = (subscription: string) => {
    switch (subscription) {
      case 'ladder': return 'نردبان';
      case 'basic': return 'پایه';
      default: return subscription;
    }
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: { xs: 2, sm: 3, md: 4 },
          '& > div': {
            height: '100%'
          }
        }}
      >
        {Array.from({ length: isMobile ? 3 : isTablet ? 6 : 9 }).map((_, index) => (
          <Box key={index} sx={{ height: '100%' }}>
            <JobCardSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  if (!jobs || jobs.length === 0) {
    // بررسی اینکه کدام فیلتر فعال است
    const hasActiveFilters = searchQuery.trim() || statusFilter !== 'all' || subscriptionFilter !== 'all';
    
    if (hasActiveFilters) {
      // ساخت پیام مناسب بر اساس فیلترهای فعال
      let title = 'نتیجه‌ای یافت نشد';
      let message = '';
      let suggestion = '';
      
      if (searchQuery.trim() && statusFilter !== 'all' && subscriptionFilter !== 'all') {
        message = `برای عبارت "${searchQuery}" با وضعیت "${getStatusText(statusFilter)}" و نوع اشتراک "${getSubscriptionText(subscriptionFilter)}" هیچ آگهی‌ای یافت نشد.`;
        suggestion = '💡 پیشنهاد: عبارت جستجو را تغییر دهید یا فیلترها را پاک کنید';
      } else if (searchQuery.trim() && statusFilter !== 'all') {
        message = `برای عبارت "${searchQuery}" با وضعیت "${getStatusText(statusFilter)}" هیچ آگهی‌ای یافت نشد.`;
        suggestion = '💡 پیشنهاد: عبارت جستجو را تغییر دهید یا فیلتر وضعیت را پاک کنید';
      } else if (searchQuery.trim() && subscriptionFilter !== 'all') {
        message = `برای عبارت "${searchQuery}" با نوع اشتراک "${getSubscriptionText(subscriptionFilter)}" هیچ آگهی‌ای یافت نشد.`;
        suggestion = '💡 پیشنهاد: عبارت جستجو را تغییر دهید یا فیلتر نوع اشتراک را پاک کنید';
      } else if (statusFilter !== 'all' && subscriptionFilter !== 'all') {
        message = `برای وضعیت "${getStatusText(statusFilter)}" و نوع اشتراک "${getSubscriptionText(subscriptionFilter)}" هیچ آگهی‌ای یافت نشد.`;
        suggestion = '💡 پیشنهاد: فیلترها را پاک کنید یا تغییر دهید';
      } else if (searchQuery.trim()) {
        message = `برای عبارت "${searchQuery}" هیچ آگهی‌ای یافت نشد.`;
        suggestion = '💡 پیشنهاد: عبارت جستجو را کوتاه‌تر کنید یا فیلترها را پاک کنید';
      } else if (statusFilter !== 'all') {
        message = `برای وضعیت "${getStatusText(statusFilter)}" هیچ آگهی‌ای یافت نشد.`;
        suggestion = '💡 پیشنهاد: فیلتر وضعیت را پاک کنید یا تغییر دهید';
      } else if (subscriptionFilter !== 'all') {
        message = `برای نوع اشتراک "${getSubscriptionText(subscriptionFilter)}" هیچ آگهی‌ای یافت نشد.`;
        suggestion = '💡 پیشنهاد: فیلتر نوع اشتراک را پاک کنید یا تغییر دهید';
      }
      
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 2,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: 1,
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '1.2rem', sm: '1.4rem' }
            }}
          >
            {title}
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 3,
              maxWidth: 400,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            {message}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.9rem' }
            }}
          >
            {suggestion}
          </Typography>
        </Box>
      );
    }
    // اگر اصلاً آگهی‌ای وجود ندارد
    return <EmptyJobsState />;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: { xs: 2, sm: 3, md: 4 },
        '& > div': {
          height: '100%',
          minHeight: { xs: '260px', sm: '280px', md: '300px' }
        }
      }}
    >
      {jobs.map((job, index) => (
        <Box key={job.id} sx={{ height: '100%' }}>
          <EmployerJobCard job={job} />
        </Box>
      ))}
    </Box>
  );
};

export default JobsGrid; 