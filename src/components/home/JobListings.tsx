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
  CardContent,
  useMediaQuery
} from '@mui/material';
import JobCard, { JobType } from './JobCard';
import AddJobCard from './AddJobCard';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';

export default function JobListings() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // استفاده از رنگ‌های کارفرما
  const employerColors = EMPLOYER_THEME;

  // اضافه کردن وضعیت بارگذاری
  const [loading, setLoading] = useState(true);

  // تعداد کارت‌ها براساس سایز صفحه
  const jobsToShow = isMobile ? 3 : isTablet ? 5 : 7;

  const [jobs, setJobs] = useState<JobType[]>([
    {
      id: 1,
      title: 'توسعه‌دهنده فرانت‌اند ارشد ',
      company: 'شرکت فناوری نوین',
      location: 'تهران',
      salary: '30 to 50',
      skills: ['React', 'TypeScript', 'NextJS'],
      subscriptionStatus: 'special', // آگهی با اشتراک ویژه (نردبان)
      timePosted: '۲ ساعت پیش',
      jobType: 'Full-Time',
      industry: 'فناوری اطلاعات',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'طراح ارشد محصول',
      company: 'استودیو طراحی دیدار',
      location: 'اصفهان',
      salary: '10 to 15',
      skills: ['UI/UX', 'Figma', 'Adobe XD'],
      subscriptionStatus: 'default',
      timePosted: '۳ ساعت پیش',
      jobType: 'Full-Time',
      industry: 'طراحی دیجیتال',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'مهندس DevOps',
      company: 'گروه فناوری آسان',
      location: 'تهران',
      salary: '30 to 50',
      skills: ['Docker', 'Kubernetes', 'CI/CD'],
      subscriptionStatus: 'special', // آگهی با اشتراک ویژه (نردبان)
      timePosted: '۴ ساعت پیش',
      jobType: 'Full-Time',
      industry: 'فناوری اطلاعات',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'کارشناس تولید محتوا',
      company: 'مجموعه دیجیتال مارکتینگ نگار',
      location: 'شیراز',
      salary: '5 to 10',
      skills: ['SEO', 'تولید محتوا', 'مدیریت شبکه‌های اجتماعی'],
      subscriptionStatus: 'default',
      timePosted: '۶ ساعت پیش',
      jobType: 'Part-Time',
      industry: 'بازاریابی دیجیتال',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'مدیر پروژه نرم‌افزاری',
      company: 'هلدینگ توسعه فناوری ایران',
      location: 'تهران',
      salary: '30 to 50',
      skills: ['Scrum', 'Jira', 'مدیریت تیم'],
      subscriptionStatus: 'default',
      timePosted: '۱ روز پیش',
      jobType: 'Full-Time',
      industry: 'مدیریت پروژه',
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'طراح گرافیک',
      company: 'استودیو خلاقیت بصیر',
      location: 'مشهد',
      salary: '10 to 15',
      skills: ['فتوشاپ', 'ایلاستریتور', 'طراحی'],
      subscriptionStatus: 'default',
      timePosted: '۱ روز پیش',
      jobType: 'Remote',
      industry: 'طراحی گرافیک',
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      title: 'طراح گرافیک',
      company: 'استودیو خلاقیت بصیر',
      location: 'تبریز',
      salary: '10 to 15',
      skills: ['فتوشاپ', 'ایلاستریتور', 'طراحی'],
      subscriptionStatus: 'default',
      timePosted: '۱ روز پیش',
      jobType: 'Full-Time',
      industry: 'طراحی گرافیک',
      created_at: new Date().toISOString()
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

  // مرتب‌سازی آگهی‌ها - آگهی‌های ویژه (نردبان) در اول نمایش داده می‌شوند
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.subscriptionStatus === 'special' && b.subscriptionStatus !== 'special') return -1;
    if (a.subscriptionStatus !== 'special' && b.subscriptionStatus === 'special') return 1;
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

  // تابع برای مدیریت کلیک روی دکمه ثبت آگهی
  const handleAddJobClick = () => {
    console.log('ثبت آگهی جدید');
    // در اینجا می‌توانید هدایت به صفحه ثبت آگهی یا نمایش مودال مربوطه را پیاده‌سازی کنید
  }

  // تعداد کارت‌ها در هر ردیف بر اساس سایز صفحه
  const getSkeletonCardsCount = () => {
    if (isMobile) return 4;
    if (isTablet) return 6;
    return 8;
  };

  return (
    <Box sx={{
      pt: { xs: 5, sm: 6, md: 7 },
      pb: { xs: 3, sm: 4, md: 5 },
      backgroundColor: theme.palette.background.default
    }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ mb: { xs: 3, sm: 3, md: 3 }, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
              color: theme.palette.text.primary,
              position: 'relative',
              display: 'inline-block',
              pb: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                width: { xs: '60px', sm: '70px', md: '80px' },
                height: { xs: '3px', md: '4px' },
                backgroundColor: employerColors.primary,
                bottom: 0,
                left: { xs: 'calc(50% - 30px)', sm: 'calc(50% - 35px)', md: 'calc(50% - 40px)' },
                borderRadius: '2px'
              }
            }}
          >
            فرصت‌های شغلی
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: { xs: 1.5, md: 2 },
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
              maxWidth: { xs: '300px', sm: '450px', md: '600px' },
              mx: 'auto'
            }}
          >
            جدیدترین فرصت‌های شغلی متناسب با مهارت‌های شما
          </Typography>
        </Box>

        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: { xs: 2, sm: 2, md: 2.5 },
              '& > div': {
                height: '100%' // همه کارت‌ها ارتفاع یکسان داشته باشند
              }
            }}
          >
            {loading ? (
              // نمایش Skeleton در حالت بارگذاری
              Array.from(new Array(getSkeletonCardsCount())).map((_, index) => (
                <Box key={index} sx={{ height: '100%' }}>
                  <JobCardSkeleton />
                </Box>
              ))
            ) : (
              // نمایش کارت‌های واقعی بعد از بارگذاری
              <>
                {sortedJobs.slice(0, jobsToShow).map((job) => (
                  <Box key={job.id} sx={{ height: '100%' }}>
                    <JobCard job={job} />
                  </Box>
                ))}

                {/* کارت دعوت به ثبت آگهی با استفاده از کامپوننت جدید */}
                <Box sx={{ height: '100%' }}>
                  <AddJobCard onClick={handleAddJobClick} />
                </Box>
              </>
            )}
          </Box>

          {/* لینک مشاهده آگهی‌های بیشتر - منتقل شده به پایین کارت‌ها */}
          {!loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: { xs: 3, sm: 4, md: 5 }
              }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowBackIcon />}
                sx={{
                  backgroundColor: employerColors.primary,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  py: { xs: 1, md: 1.2 },
                  px: { xs: 2, md: 3 },
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: employerColors.dark,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
                  }
                }}
              >
                مشاهده آگهی‌های بیشتر
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
} 