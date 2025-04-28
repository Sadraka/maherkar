'use client'

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  useTheme,
  Skeleton,
  Card,
  CardContent
} from '@mui/material';
import JobCard, { JobType } from './JobCard';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';

export default function JobListings() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  
  // استفاده از رنگ‌های کارفرما
  const employerColors = EMPLOYER_THEME;
  
  // اضافه کردن وضعیت بارگذاری
  const [loading, setLoading] = useState(true);
  
  const [jobs, setJobs] = useState<JobType[]>([
    {
      id: 1,
      title: 'توسعه‌دهنده فرانت‌اند ارشد',
      company: 'شرکت فناوری نوین',
      location: 'تهران',
      isRemote: true,
      salary: '۳۰-۲۰ میلیون تومان',
      skills: ['React', 'TypeScript', 'NextJS'],
      isUrgent: true,
      isPromoted: true, // آگهی نردبان شده
      timePosted: '۲ ساعت پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 2,
      title: 'طراح ارشد محصول',
      company: 'استودیو طراحی دیدار',
      location: 'اصفهان',
      isRemote: false,
      salary: '۱۵-۱۰ میلیون تومان',
      skills: ['UI/UX', 'Figma', 'Adobe XD'],
      isUrgent: false,
      timePosted: '۳ ساعت پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 3,
      title: 'مهندس DevOps',
      company: 'گروه فناوری آسان',
      location: 'تهران',
      isRemote: true,
      salary: '۴۰-۲۵ میلیون تومان',
      skills: ['Docker', 'Kubernetes', 'CI/CD'],
      isUrgent: true,
      isPromoted: true, // آگهی نردبان شده
      timePosted: '۴ ساعت پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 4,
      title: 'کارشناس تولید محتوا',
      company: 'مجموعه دیجیتال مارکتینگ نگار',
      location: 'شیراز',
      isRemote: true,
      salary: '۱۰-۷ میلیون تومان',
      skills: ['SEO', 'تولید محتوا', 'مدیریت شبکه‌های اجتماعی'],
      isUrgent: false,
      timePosted: '۶ ساعت پیش',
      jobType: 'پاره‌وقت'
    },
    {
      id: 5,
      title: 'مدیر پروژه نرم‌افزاری',
      company: 'هلدینگ توسعه فناوری ایران',
      location: 'تهران',
      isRemote: false,
      salary: '۳۵-۲۵ میلیون تومان',
      skills: ['Scrum', 'Jira', 'مدیریت تیم'],
      isUrgent: true,
      timePosted: '۱ روز پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 6,
      title: 'طراح گرافیک',
      company: 'استودیو خلاقیت بصیر',
      location: 'مشهد',
      isRemote: true,
      salary: '۱۵-۱۰ میلیون تومان',
      skills: ['فتوشاپ', 'ایلاستریتور', 'طراحی'],
      isUrgent: false,
      timePosted: '۱ روز پیش',
      jobType: 'پروژه‌ای'
    },
  ]);

  // شبیه‌سازی بارگذاری داده‌ها
  useEffect(() => {
    // شبیه‌سازی API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // مرتب‌سازی آگهی‌ها - آگهی‌های ویژه در اول نمایش داده می‌شوند
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.isPromoted && !b.isPromoted) return -1;
    if (!a.isPromoted && b.isPromoted) return 1;
    return 0;
  });

  // کامپوننت نمایش‌دهنده Skeleton
  const JobCardSkeleton = () => (
    <Card
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${employerColors.bgLight}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* ناحیه برچسب - در wrapper مطلق قرار می‌گیرد */}
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: 'auto',
        zIndex: 2
      }}>
        {/* اسکلتون برچسب فوری یا ویژه */}
        <Skeleton 
          variant="rectangular" 
          width={60} 
          height={24} 
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            borderRadius: '20px'
          }} 
        />
      </Box>
      
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex',
        flexDirection: 'column',
        p: 2, 
        pt: 2,
        pb: 2,
        '&:last-child': { pb: 2 }
      }}>
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
        
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1.5, mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Skeleton variant="rectangular" width={60} height={22} sx={{ borderRadius: 0.8 }} />
            <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: 0.8 }} />
            <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: 0.8 }} />
          </Box>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Skeleton variant="rectangular" height={48} width="100%" sx={{ borderRadius: 1.5 }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box 
      sx={{ 
        pt: 3,
        pb: 6,
        backgroundColor: '#ffffff'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: theme.palette.text.primary,
              position: 'relative',
              display: 'inline-block',
              pb: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '80px',
                height: '4px',
                backgroundColor: employerColors.primary,
                bottom: 0,
                left: 'calc(50% - 40px)',
                borderRadius: '2px'
              }
            }}
          >
            فرصت‌های شغلی
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              mt: 2,
              color: theme.palette.text.secondary,
              fontSize: '1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            جدیدترین فرصت‌های شغلی متناسب با مهارت‌های شما
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
              gap: 3,
              '& > div': {
                height: '100%' // همه کارت‌ها ارتفاع یکسان داشته باشند
              }
            }}
          >
            {loading ? (
              // نمایش Skeleton در حالت بارگذاری
              Array.from(new Array(6)).map((_, index) => (
                <Box key={index} sx={{ height: '100%' }}>
                  <JobCardSkeleton />
                </Box>
              ))
            ) : (
              // نمایش کارت‌های واقعی بعد از بارگذاری
              sortedJobs.map((job) => (
                <Box key={job.id} sx={{ height: '100%' }}>
                  <JobCard job={job} />
                </Box>
              ))
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            disableElevation
            color="primary"
            sx={{ 
              px: 4,
              py: 1.2,
              fontWeight: 700,
              borderRadius: 2,
              fontSize: '1rem',
              background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
              boxShadow: `0 4px 8px rgba(10, 59, 121, 0.2)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)`,
                boxShadow: `0 6px 10px rgba(10, 59, 121, 0.3)`,
              }
            }}
          >
            مشاهده همه آگهی‌ها
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 