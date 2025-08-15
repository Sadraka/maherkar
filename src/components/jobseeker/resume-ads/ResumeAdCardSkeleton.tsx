'use client';

import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

/**
 * کامپوننت اسکلتون برای نمایش در زمان بارگذاری کارت آگهی رزومه
 */
export default function ResumeAdCardSkeleton() {
  const jobSeekerColors = useJobSeekerTheme();

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 1.5, sm: 2 },
        border: `1px solid ${jobSeekerColors.bgLight}`,
        boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        width: { xs: '100%', sm: '100%', md: '100%' },
        mx: 'auto',
        height: '100%',
      }}
    >
      <CardContent sx={{
        p: { xs: 1.5, sm: 2 },
        pb: { xs: "6px !important", sm: "8px !important" },
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* هدر کارت - آواتار و نام */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: { xs: 1, sm: 1.5 },
          minHeight: { xs: 40, sm: 45, md: 50 },
          py: { xs: 0.5, sm: 0.8 },
          pb: 0
        }}>
          <Box sx={{ position: 'relative', mr: { xs: 1, sm: 1.5 } }}>
            <Skeleton
              variant="circular"
              width={{ xs: 45, sm: 55 }}
              height={{ xs: 45, sm: 55 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>

        {/* خط سرتاسری زیر هدر */}
        <Box sx={{
          position: 'relative',
          mt: { xs: 0.2, sm: 0.4 },
          mb: { xs: 0.8, sm: 1 },
          mx: { xs: -1.5, sm: -2 },
          height: 1
        }}>
          <Box sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            bgcolor: jobSeekerColors.bgLight
          }} />
        </Box>

        {/* اطلاعات اصلی */}
        <Box sx={{ mb: { xs: 0.8, sm: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.5 } }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.5 } }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5 }} />
            <Skeleton variant="text" width="30%" height={16} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5 }} />
            <Skeleton variant="text" width="35%" height={16} />
          </Box>
        </Box>

        {/* مهارت‌ها */}
        <Box sx={{ mb: { xs: 0.8, sm: 1.2 } }}>
          <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
          <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.5}>
            <Skeleton variant="rounded" width={60} height={18} />
            <Skeleton variant="rounded" width={70} height={18} />
            <Skeleton variant="rounded" width={50} height={18} />
          </Stack>
        </Box>

        {/* اطلاعات تکمیلی */}
        <Box sx={{
          p: { xs: 0.8, sm: 1 },
          bgcolor: `rgba(0, 112, 60, 0.04)`,
          borderRadius: 1.5,
          border: 'none',
          mb: { xs: 0.8, sm: 1 }
        }}>
          <Skeleton variant="text" width="70%" height={16} />
        </Box>

        {/* فضای خالی بین محتوا و دکمه */}
        <Box sx={{ flexGrow: 1 }} />

        {/* دکمه مشاهده رزومه */}
        <Box sx={{ pt: { xs: 0.3, sm: 0.5 }, pb: { xs: 1, sm: 1.2, md: 1.5 } }}>
          <Skeleton 
            variant="rounded" 
            width="100%" 
            height={40} 
            sx={{ borderRadius: 1.5 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
