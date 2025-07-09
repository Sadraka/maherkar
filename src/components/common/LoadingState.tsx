import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';

interface LoadingStateProps {
  color?: string;
}

/**
 * کامپوننت نمایش وضعیت بارگذاری
 */
const LoadingState = ({ color = EMPLOYER_THEME.primary }: LoadingStateProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
      <CircularProgress sx={{ color }} />
    </Box>
  );
};

export default LoadingState; 