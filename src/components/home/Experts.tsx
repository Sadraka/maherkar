'use client'

import {
  Box,
  Typography,
  Container,
  Button,
  useTheme,
  Grid,
  useMediaQuery
} from '@mui/material';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import ExpertCard, { ExpertType } from './ExpertCard';
import AddResumeCard from './AddResumeCard';

export default function Experts() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      isVerified: true,
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
      isVerified: true,
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
    {
      id: 7,
      name: 'امیر حسینی',
      username: 'amir_h',
      email: 'amir.hosseini@example.com',
      phone: '09123456783',
      jobTitle: 'مدیر محصول دیجیتال',
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      bio: 'مدیر محصول با 5 سال تجربه در تیم‌های چابک و توسعه محصولات نرم‌افزاری',
      location: 'تهران',
      skills: ['مدیریت محصول', 'اسکرام', 'تحلیل کسب و کار'],
      isVerified: true,
      industry: 'فناوری اطلاعات',
      experienceYears: 5,
      preferredJobType: 'تمام وقت',
      expectedSalary: '25 تا 35 میلیون تومان',
      degree: 'کارشناسی ارشد MBA',
      gender: 'مرد',
      soldierStatus: 'پایان خدمت',
      availability: 'فوری',
      experience: '3 تا 6 سال',
      createdAt: '2023-11-18',
      updatedAt: '2024-06-05',
    },
  ];

  // تعداد کارت‌های نمایشی بر اساس سایز صفحه
  const visibleExperts = isMobile ? 4 : 7;

  return (
    <Box sx={{
      pt: { xs: 5, sm: 6, md: 7 },
      pb: { xs: 3, sm: 4, md: 5 },
      backgroundColor: '#f5f7fa'
    }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 3, md: 3 } }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
              color: theme.palette.text.primary,
              position: 'relative',
              display: 'inline-block',
              pb: { xs: 1.5, sm: 2 },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: { xs: '60px', sm: '80px' },
                height: { xs: '3px', sm: '4px' },
                backgroundColor: jobSeekerColors.primary,
                bottom: 0,
                left: { xs: 'calc(50% - 30px)', sm: 'calc(50% - 40px)' },
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
              mt: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              maxWidth: { xs: '95%', sm: '85%', md: '80%', lg: '900px' },
              mx: 'auto',
              lineHeight: { xs: 1.6, md: 1.8 },
              whiteSpace: { md: 'nowrap' },
              overflow: { md: 'hidden' },
              textOverflow: { md: 'ellipsis' }
            }}
          >
            مجموعه‌ای از متخصصین حرفه‌ای و کارآزموده در زمینه‌های مختلف که آماده همکاری با کارفرمایان محترم هستند
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 2, sm: 2.5, md: 3 },
          justifyContent: 'flex-start',
          px: { xs: 1, sm: 2, md: 0 }
        }}>
          {experts
            .filter(expert => expert.isVerified)
            .slice(0, visibleExperts)
            .map((expert) => (
              <Box key={expert.id} sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 20px)',
                  md: 'calc(33.33% - 24px)',
                  lg: 'calc(25% - 24px)'
                },
                height: { xs: 'auto', sm: '345px' }
              }}>
                <ExpertCard expert={expert} />
              </Box>
            ))}

          {/* کارت ثبت رزومه - همیشه آخرین کارت */}
          <Box sx={{
            width: {
              xs: '100%',
              sm: 'calc(50% - 20px)',
              md: 'calc(33.33% - 24px)',
              lg: 'calc(25% - 24px)'
            },
            height: { xs: 'auto', sm: '345px' }
          }}>
            <AddResumeCard onClick={() => console.log('ثبت رزومه جدید')} />
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 4, sm: 5, md: 6 }, textAlign: 'center' }}>
          <Button
            variant="contained"
            disableElevation
            color="success"
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.2 },
              fontWeight: 700,
              borderRadius: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
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