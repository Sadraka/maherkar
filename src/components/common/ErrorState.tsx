import React from 'react';
import { Paper } from '@mui/material';

interface ErrorStateProps {
  message: string;
}

/**
 * کامپوننت نمایش خطا
 */
const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        color: 'red',
        borderRadius: 3,
        border: '1px solid #ffdddd',
        my: 4
      }}
    >
      {message}
    </Paper>
  );
};

export default ErrorState; 