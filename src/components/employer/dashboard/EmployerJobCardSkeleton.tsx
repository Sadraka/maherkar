'use client'

import {
  Box,
  Card,
  CardContent,
  Skeleton,
  useTheme
} from '@mui/material';

export default function EmployerJobCardSkeleton() {
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
        direction: 'rtl',
      }}
    >
      <CardContent sx={{ p: 0, pb: "0px !important" }}>
        {/* هدر کارت با نمایش عنوان و برچسب نردبان */}
        <Box
          sx={{
            p: 1.2,
            pb: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            minHeight: { xs: 45, sm: 50 },
            px: { xs: 1, sm: 1.2 },
          }}
        >
          <Skeleton
            variant="text"
            width="70%"
            height={32}
            sx={{
              borderRadius: 1
            }}
          />

          {/* اسکلتون برچسب نردبان */}
          <Skeleton
            variant="rectangular"
            width={45}
            height={22}
            sx={{
              borderRadius: '4px'
            }}
          />
        </Box>

        {/* بدنه کارت - اطلاعات شغلی با فاصله کمتر */}
        <Box sx={{ px: { xs: 1, sm: 1.2 }, py: { xs: 0.8, sm: 1 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'grid', gap: { xs: 1, sm: 1.2 } }}>
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
        </Box>

        {/* دکمه مشاهده آگهی */}
        <Box sx={{ px: { xs: 1, sm: 1.2 }, pb: { xs: 1.2, sm: 1.5 }, pt: 0.5 }}>
          <Skeleton
            variant="rectangular"
            height={44}
            width="100%"
            sx={{
              borderRadius: 1.5
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
} 