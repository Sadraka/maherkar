'use client';

import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import { EMPLOYER_THEME } from '@/constants/colors';

interface JobInfoProps {
  jobTitle?: string;
}

/**
 * کامپوننت نمایش اطلاعات آگهی شغلی
 */
export default function JobInfo({ jobTitle }: JobInfoProps) {
  return (
    <Paper elevation={0} sx={{ 
      p: { xs: 3, sm: 4 }, 
      borderRadius: 3,
      boxShadow: '0 3px 10px rgba(66, 133, 244, 0.05)',
      border: '1px solid #e3f2fd'
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ 
        mb: 3, 
        color: EMPLOYER_THEME.primary,
        fontSize: { xs: '1.1rem', sm: '1.25rem' }
      }}>
        اطلاعات آگهی
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <WorkIcon sx={{ color: EMPLOYER_THEME.primary }} />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{
            fontSize: { xs: '0.8rem', sm: '0.85rem' }
          }}>
            عنوان شغل
          </Typography>
          <Typography fontWeight="bold" sx={{
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}>
            {jobTitle || 'عنوان نامشخص'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}