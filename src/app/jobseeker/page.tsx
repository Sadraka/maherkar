'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * صفحه اصلی پنل کارجو که به داشبورد ریدایرکت می‌کند
 */
export default function JobSeekerIndexPage() {
  const router = useRouter();
  
  // ریدایرکت به صفحه داشبورد
  useEffect(() => {
    router.push('/jobseeker/dashboard');
  }, [router]);
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
} 