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
      username: 'alirad',
      email: 'ali.rad@example.com',
      phone: '09123456789',
      jobTitle: 'توسعه‌دهنده فرانت‌اند ارشد',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'توسعه‌دهنده با تجربه در زمینه فرانت‌اند و تسلط به فریم‌ورک‌های مدرن',
      location: 'تبریز',
      skills: ['React', 'NextJS', 'TypeScript'],
      isVerified: true,
      industry: 'فناوری اطلاعات',
      experienceYears: 8,
      preferredJobType: 'تمام وقت',
      expectedSalary: '20 تا 30 میلیون تومان',
      degree: 'کارشناسی ارشد مهندسی نرم‌افزار',
      gender: 'مرد',
      soldierStatus: 'پایان خدمت',
      availability: 'فوری',
      experience: 'بیشتر از 6 سال',
      createdAt: '2023-10-15',
      updatedAt: '2024-05-20',
    },
    {
      id: 2,
      name: 'سارا احمدی',
      username: 'sara_a',
      email: 'sara.ahmadi@example.com',
      phone: '09123456788',
      jobTitle: 'طراح رابط کاربری و تجربه کاربری',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'طراح خلاق با 6 سال تجربه در طراحی UI/UX و تمرکز بر تجربه کاربری',
      location: 'اصفهان',
      skills: ['UI/UX', 'Figma', 'طراحی محصول'],
      isVerified: true,
      industry: 'طراحی و هنر',
      experienceYears: 6,
      preferredJobType: 'دورکاری',
      expectedSalary: '15 تا 20 میلیون تومان',
      degree: 'کارشناسی طراحی گرافیک',
      gender: 'زن',
      availability: 'با اطلاع',
      experience: '3 تا 6 سال',
      createdAt: '2023-09-10',
      updatedAt: '2024-06-01',
    },
    {
      id: 3,
      name: 'محمد کریمی',
      username: 'mohammad_k',
      email: 'mohammad.karimi@example.com',
      phone: '09123456787',
      jobTitle: 'برنامه‌نویس بک‌اند',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      bio: 'برنامه‌نویس بک‌اند با تسلط به Node.js و Express',
      location: 'شیراز',
      skills: ['Node.js', 'Express', 'MongoDB'],
      isVerified: false,
      industry: 'فناوری اطلاعات',
      experienceYears: 5,
      preferredJobType: 'تمام وقت',
      expectedSalary: 'توافقی',
      degree: 'کارشناسی مهندسی کامپیوتر',
      gender: 'مرد',
      soldierStatus: 'معافیت دائم',
      availability: 'فوری',
      experience: '3 تا 6 سال',
      createdAt: '2024-01-05',
      updatedAt: '2024-05-10',
    },
    {
      id: 4,
      name: 'نازنین رضایی',
      username: 'nazanin_r',
      email: 'nazanin.rezaei@example.com',
      phone: '09123456786',
      jobTitle: 'متخصص دیجیتال مارکتینگ',
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
      bio: 'متخصص دیجیتال مارکتینگ با تجربه در SEO و تبلیغات آنلاین',
      location: 'مشهد',
      skills: ['SEO', 'گوگل ادز', 'شبکه‌های اجتماعی'],
      isVerified: true,
      industry: 'تبلیغات و بازاریابی',
      experienceYears: 4,
      preferredJobType: 'پاره وقت',
      expectedSalary: '10 تا 15 میلیون تومان',
      degree: 'کارشناسی بازاریابی',
      gender: 'زن',
      availability: 'با اطلاع',
      experience: '3 تا 6 سال',
      createdAt: '2023-12-15',
      updatedAt: '2024-06-12',
    },
    {
      id: 5,
      name: 'حسین نوری',
      username: 'h_noori',
      email: 'h.noori@example.com',
      phone: '09123456785',
      jobTitle: 'مهندس DevOps',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      bio: 'مهندس DevOps با تخصص در Docker و AWS',
      location: 'تهران',
      skills: ['Docker', 'Kubernetes', 'AWS'],
      isVerified: true,
      industry: 'فناوری اطلاعات',
      experienceYears: 7,
      preferredJobType: 'پروژه‌ای',
      expectedSalary: '30 تا 50 میلیون تومان',
      degree: 'کارشناسی ارشد مهندسی کامپیوتر',
      gender: 'مرد',
      soldierStatus: 'پایان خدمت',
      availability: 'فوری',
      experience: 'بیشتر از 6 سال',
      createdAt: '2023-08-20',
      updatedAt: '2024-04-12',
    },
    {
      id: 6,
      name: 'مریم موسوی',
      username: 'maryam_m',
      email: 'maryam.mousavi@example.com',
      phone: '09123456784',
      jobTitle: 'گرافیست و طراح',
      avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
      bio: 'گرافیست با تجربه در طراحی لوگو و هویت بصری',
      location: 'تبریز',
      skills: ['فتوشاپ', 'ایلاستریتور', 'طراحی لوگو'],
      isVerified: false,
      industry: 'طراحی و هنر',
      experienceYears: 5,
      preferredJobType: 'دورکاری',
      expectedSalary: 'توافقی',
      degree: 'کارشناسی هنرهای تجسمی',
      gender: 'زن',
      availability: 'با اطلاع',
      experience: '3 تا 6 سال',
      createdAt: '2024-02-10',
      updatedAt: '2024-05-28',
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
          {experts
            .filter(expert => expert.isVerified)
            .slice(0, 4)
            .map((expert) => (
              <Box key={expert.id} sx={{
                width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' },
                height: '345px'
              }}>
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