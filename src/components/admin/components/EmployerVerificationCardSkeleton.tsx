'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Skeleton,
  Divider
} from '@mui/material';
import { ADMIN_THEME } from '@/constants/colors';

const EmployerVerificationCardSkeleton: React.FC = () => {
  return (
    <Card 
      sx={{ 
        borderRadius: 3,
        border: `2px solid ${ADMIN_THEME.bgLight}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* هدر کارت */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={50} height={50} />
            <Box>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={100} height={20} />
            </Box>
          </Box>
          
          {/* وضعیت تایید */}
          <Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: 3 }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* اطلاعات اضافی */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 2,
            mb: 1
          }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <Skeleton variant="text" width="100%" height={16} />
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <Skeleton variant="text" width="100%" height={16} />
            </Box>
          </Box>
          <Box>
            <Skeleton variant="text" width="80%" height={16} />
          </Box>
        </Box>

        {/* وضعیت مدارک */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 3 }} />
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="circular" width={16} height={16} />
          </Box>
        </Box>

        {/* بیوگرافی */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="70%" height={16} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* دکمه‌های عملیات */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={100} height={16} />
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmployerVerificationCardSkeleton;
