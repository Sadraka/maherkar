'use client'

import {
  Box,
  Typography,
  Container,
  Button,
  useTheme,
  Grid
} from '@mui/material';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import ExpertCard, { ExpertType } from './ExpertCard';

export default function Experts() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();

  const experts: ExpertType[] = [
    {
      id: 1,
      name: 'علی راد',
      jobTitle: 'توسعه‌دهنده فرانت‌اند ارشد',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: 'تبریز',
      skills: ['React', 'NextJS', 'TypeScript'],
      isVerified: true,
      experienceYears: 8,
      preferredJobType: 'تمام وقت',
      expectedSalary: '20 تا 30 میلیون تومان',
      degree: 'کارشناسی ارشد مهندسی نرم‌افزار'
    },
    {
      id: 2,
      name: 'سارا احمدی',
      jobTitle: 'طراح رابط کاربری و تجربه کاربری',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      location: 'اصفهان',
      skills: ['UI/UX', 'Figma', 'طراحی محصول'],
      isVerified: true,
      experienceYears: 6,
      preferredJobType: 'دورکاری',
      expectedSalary: '15 تا 20 میلیون تومان',
      degree: 'کارشناسی طراحی گرافیک'
    },
    {
      id: 3,
      name: 'محمد کریمی',
      jobTitle: 'برنامه‌نویس بک‌اند',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      location: 'شیراز',
      skills: ['Node.js', 'Express', 'MongoDB'],
      isVerified: false,
      experienceYears: 5,
      preferredJobType: 'تمام وقت',
      expectedSalary: 'توافقی',
      degree: 'کارشناسی مهندسی کامپیوتر'
    },
    {
      id: 4,
      name: 'نازنین رضایی',
      jobTitle: 'متخصص دیجیتال مارکتینگ',
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
      location: 'مشهد',
      skills: ['SEO', 'گوگل ادز', 'شبکه‌های اجتماعی'],
      isVerified: true,
      experienceYears: 4,
      preferredJobType: 'پاره وقت',
      expectedSalary: '10 تا 15 میلیون تومان',
      degree: 'کارشناسی بازاریابی'
    },
    {
      id: 5,
      name: 'حسین نوری',
      jobTitle: 'مهندس DevOps',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      location: 'تهران',
      skills: ['Docker', 'Kubernetes', 'AWS'],
      isVerified: true,
      experienceYears: 7,
      preferredJobType: 'پروژه‌ای',
      expectedSalary: '30 تا 50 میلیون تومان',
      degree: 'کارشناسی ارشد مهندسی کامپیوتر'
    },
    {
      id: 6,
      name: 'مریم موسوی',
      jobTitle: 'گرافیست و طراح',
      avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
      location: 'تبریز',
      skills: ['فتوشاپ', 'ایلاستریتور', 'طراحی لوگو'],
      isVerified: false,
      experienceYears: 5,
      preferredJobType: 'دورکاری',
      expectedSalary: 'توافقی',
      degree: 'کارشناسی هنرهای تجسمی'
    },
  ];

  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f7fa' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
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
            متخصصین جویای کار
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 2,
              fontSize: '1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            مجموعه‌ای از متخصصین حرفه‌ای و کارآزموده در زمینه‌های مختلف که آماده همکاری با کارفرمایان محترم هستند
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {experts.slice(0, 3).map((expert) => (
            <Box key={expert.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' } }}>
              <ExpertCard expert={expert} />
            </Box>
          ))}
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
              background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
              boxShadow: `0 4px 8px rgba(0, 112, 60, 0.2)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                boxShadow: `0 6px 10px rgba(0, 112, 60, 0.3)`,
              }
            }}
          >
            مشاهده همه متخصصین جویای کار
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 