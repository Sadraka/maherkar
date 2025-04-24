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

export default function JobListings() {
  const theme = useTheme();
  
  const [jobs, setJobs] = useState<JobType[]>([
    {
      id: 1,
      title: 'توسعه‌دهنده فرانت‌اند ارشد',
      company: 'شرکت فناوری نوین',
      location: 'تهران',
      isRemote: true,
      salary: '۳۰-۲۰ میلیون تومان',
      skills: ['React', 'TypeScript', 'NextJS'],
      isFavorite: false,
      isUrgent: true,
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
      isFavorite: false,
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
      isFavorite: false,
      isUrgent: true,
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
      isFavorite: false,
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
      isFavorite: false,
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
      isFavorite: false,
      isUrgent: false,
      timePosted: '۱ روز پیش',
      jobType: 'پروژه‌ای'
    },
  ]);

  const toggleFavorite = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isFavorite: !job.isFavorite } : job
    ));
  };

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mb: 4 
        }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.6rem', md: '2rem' },
              color: theme.palette.text.primary
            }}
          >
            فرصت‌های شغلی
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {jobs.slice(0, 6).map((job) => (
              <Box key={job.id}>
                <JobCard job={job} onToggleFavorite={toggleFavorite} />
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ 
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 2,
              fontSize: '1rem'
            }}
          >
            مشاهده همه آگهی‌ها
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 