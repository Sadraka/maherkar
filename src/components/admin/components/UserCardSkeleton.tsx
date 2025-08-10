import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Box
} from '@mui/material';
import { ADMIN_THEME } from '@/constants/colors';

const UserCardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${ADMIN_THEME.bgLight}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
          
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>

        {/* Divider */}
        <Skeleton variant="rectangular" width="100%" height={1} sx={{ my: 2 }} />

        {/* Info Grid Skeleton */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          mb: 2.5
        }}>
          <Box>
            <Skeleton variant="text" width="50%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={20} />
          </Box>
          
          <Box>
            <Skeleton variant="text" width="60%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        </Box>

        {/* Actions Skeleton */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCardSkeleton; 