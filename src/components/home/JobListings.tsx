'use client'

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  useTheme
} from '@mui/material';
import JobCard, { JobType } from './JobCard';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

export default function JobListings() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  
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

  // مرتب‌سازی آگهی‌ها - آگهی‌های ویژه در اول نمایش داده می‌شوند
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.isPromoted && !b.isPromoted) return -1;
    if (!a.isPromoted && b.isPromoted) return 1;
    return 0;
  });

  return (
    <Box 
      sx={{ 
        py: 6, 
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
                backgroundColor: jobSeekerColors.primary,
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {sortedJobs.map((job) => (
              <Box key={job.id}>
                <JobCard job={job} />
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            disableElevation
            color="success"
            sx={{ 
              px: 4,
              py: 1.2,
              fontWeight: 700,
              borderRadius: 2,
              fontSize: '1rem',
              boxShadow: '0 4px 8px rgba(0, 112, 60, 0.2)',
            }}
          >
            مشاهده همه آگهی‌ها
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 