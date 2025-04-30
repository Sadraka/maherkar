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

  // استفاده از رنگ‌های کارفرما
  const employerColors = EMPLOYER_THEME;

  // اضافه کردن وضعیت بارگذاری
  const [loading, setLoading] = useState(true);

  // تعداد کارت‌ها براساس سایز صفحه
  const jobsToShow = isMobile ? 4 : 7;

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

        <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
          {/* لینک مشاهده آگهی‌های بیشتر */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              endIcon={<ArrowBackIcon />}
              sx={{
                color: employerColors.primary,
                fontWeight: 600,
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: employerColors.dark,
                }
              }}
            >
              مشاهده آگهی‌های بیشتر
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: { xs: 2, md: 1 },
              '& > div': {
                height: '100%' // همه کارت‌ها ارتفاع یکسان داشته باشند
              }
            }}
          >
            {loading ? (
              // نمایش Skeleton در حالت بارگذاری
              Array.from(new Array(8)).map((_, index) => (
                <Box key={index} sx={{ height: '100%' }}>
                  <JobCardSkeleton />
                </Box>
              ))
            ) : (
              // نمایش کارت‌های واقعی بعد از بارگذاری
              <>
                {/* دسکتاپ: نمایش 7 آگهی واقعی + 1 کارت ثبت پروژه (مجموعا 8 کارت) */}
                {/* موبایل: نمایش 4 آگهی واقعی + 1 کارت ثبت پروژه (مجموعا 5 کارت) */}
                {sortedJobs.slice(0, jobsToShow).map((job) => (
                  <Box key={job.id} sx={{ height: '100%' }}>
                    <JobCard job={job} />
                  </Box>
                ))}

                {/* کارت دعوت به ثبت آگهی */}
                <Box sx={{ height: '100%' }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '2px dashed rgba(25, 118, 210, 0.3)',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: 'rgba(25, 118, 210, 0.02)',
                      transition: 'all 0.25s ease-in-out',
                      p: 0,
                      maxWidth: '100%',
                      width: { xs: '100%', sm: '270px', md: '290px' },
                      mx: 'auto',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                        border: '2px dashed rgba(25, 118, 210, 0.5)',
                      }
                    }}
                  >
                    <Box sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1
                    }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          color: '#1976d2',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <AddIcon sx={{ fontSize: '2rem' }} />
                      </Box>

                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: 'text.primary',
                          textAlign: 'center',
                          mb: 1
                        }}
                      >
                        آگهی خود را ثبت کنید
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          mb: 2,
                          px: 1
                        }}
                      >
                        با ثبت آگهی شغلی، بهترین متخصصان را پیدا کنید
                      </Typography>

                      <Button
                        variant="contained"
                        disableElevation
                        sx={{
                          py: 0.8,
                          px: 2,
                          fontWeight: 'bold',
                          borderRadius: 1.5,
                          fontSize: '0.85rem',
                          backgroundColor: '#4299e1',
                          color: '#fff',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#1976d2',
                            boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                          }
                        }}
                      >
                        ثبت آگهی جدید
                      </Button>
                    </Box>
                  </Card>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 