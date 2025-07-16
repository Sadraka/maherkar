'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack
} from '@mui/material';
import {
  Work as WorkIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const EmptyJobsState: React.FC = () => {
  const router = useRouter();

  const handleCreateJob = () => {
    router.push('/employer/jobs/create');
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          border: '2px dashed',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={4} alignItems="center">
          {/* Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                opacity: 0.1,
                animation: 'pulse 2s infinite',
              },
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 0.1,
                },
                '50%': {
                  transform: 'scale(1.1)',
                  opacity: 0.2,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 0.1,
                },
              },
            }}
          >
            <WorkIcon
              sx={{
                fontSize: 60,
                color: 'primary.main',
                zIndex: 1,
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            color="text.primary"
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
          >
            هنوز آگهی شغلی ندارید
          </Typography>

          {/* Description */}
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 500,
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            با ایجاد اولین آگهی شغل خود، بهترین استعدادها را جذب کنید و تیم موفق خود را تشکیل دهید.
          </Typography>

          {/* Features */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
              mt: 4,
              mb: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                افزایش بازدید
              </Typography>
              <Typography variant="body2" color="text.secondary">
                دسترسی به هزاران متقاضی
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <WorkIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                فیلتر هوشمند
              </Typography>
              <Typography variant="body2" color="text.secondary">
                پیدا کردن بهترین استعدادها
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <AddIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                ثبت آسان
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ایجاد آگهی در کمتر از ۵ دقیقه
              </Typography>
            </Box>
          </Box>

          {/* Action Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateJob}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            ایجاد اولین آگهی شغل
          </Button>

          {/* Help Text */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              fontStyle: 'italic',
            }}
          >
            💡 راهنمای ایجاد آگهی موثر را در بخش کمک مطالعه کنید
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default EmptyJobsState; 