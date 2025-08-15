'use client'

import {
  Box,
  Typography,
  Container,
  Button,
  useTheme,
  Grid,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Skeleton,
  Stack,
  Chip
} from '@mui/material';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { JobSeekerResumeAdCard } from '@/components/jobseeker/resume-ads';
import { ResumeAdType } from '@/components/jobseeker/resume-ads/JobSeekerResumeAdCard';
import AddResumeCard from './AddResumeCard';
import { ExpertType } from './ExpertCard';
import { useState, useEffect } from 'react';

export default function Experts() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // اضافه کردن state برای بارگذاری
  const [loading, setLoading] = useState(true);

  // داده‌های کاملا فیک برای کارت‌های آگهی رزومه
  const resumeAdsData: ResumeAdType[] = [
    {
      id: "1",
      title: "توسعه‌دهنده فرانت‌اند ارشد",
      status: "A", // تایید شده 'A' = تایید شده، 'P' = در انتظار، 'R' = رد شده
      description: "توسعه‌دهنده با تجربه در زمینه فرانت‌اند و تسلط به فریم‌ورک‌های مدرن",
      job_seeker_detail: {
        id: 101,
        full_name: 'علی راد',
        phone: '09123456789',
        profile_picture: 'https://randomuser.me/api/portraits/men/32.jpg',
        user_type: 'jobseeker',
        status: 'active',
        joined_date: '2023-10-15',
        last_updated: '2024-05-20',
        is_active: true,
        is_admin: false
      },
      location_detail: {
        id: 1,
        name: 'تبریز',
        province: { id: 1, name: 'آذربایجان شرقی' }
      },
      industry_detail: {
        id: 1,
        name: 'فناوری اطلاعات'
      },
      salary: '20 to 30',
      job_type: 'FT',
      degree: 'MA',
      gender: 'M',
      soldier_status: 'CO',
      job_seeker: 101,
      resume: 1001,
      industry: 1,
      advertisement: {
        id: 'ad1',
        subscription: {
          id: 'sub1',
          plan: {
            name: 'premium',
            price: 1000000
          },
          subscription_status: 'active'
        }
      },
      location: 1,
      created_at: '2023-10-15',
      updated_at: '2024-05-20'
    },
    {
      id: "2",
      title: "طراح رابط کاربری و تجربه کاربری",
      status: "A", // تایید شده
      description: "طراح خلاق با 6 سال تجربه در طراحی UI/UX و تمرکز بر تجربه کاربری",
      job_seeker_detail: {
        id: 102,
        full_name: 'سارا احمدی',
        phone: '09123456788',
        profile_picture: 'https://randomuser.me/api/portraits/women/44.jpg',
        user_type: 'jobseeker',
        status: 'active',
        joined_date: '2023-09-10',
        last_updated: '2024-06-01',
        is_active: true,
        is_admin: false
      },
      location_detail: {
        id: 2,
        name: 'اصفهان',
        province: { id: 2, name: 'اصفهان' }
      },
      industry_detail: {
        id: 2,
        name: 'طراحی و هنر'
      },
      salary: '15 to 20',
      job_type: 'RE',
      degree: 'BA',
      gender: 'F',
      job_seeker: 102,
      resume: 1002,
      industry: 2,
      advertisement: {
        id: 'ad2',
        subscription: {
          id: 'sub2',
          plan: {
            name: 'basic',
            price: 500000
          },
          subscription_status: 'active'
        }
      },
      location: 2,
      created_at: '2023-09-10',
      updated_at: '2024-06-01'
    },
    {
      id: "3",
      title: "برنامه‌نویس بک‌اند",
      status: "A", // تایید شده
      description: "برنامه‌نویس بک‌اند با تسلط به Node.js و Express",
      job_seeker_detail: {
        id: 103,
        full_name: 'محمد کریمی',
        phone: '09123456787',
        profile_picture: 'https://randomuser.me/api/portraits/men/22.jpg',
        user_type: 'jobseeker',
        status: 'active',
        joined_date: '2024-01-05',
        last_updated: '2024-05-10',
        is_active: true,
        is_admin: false
      },
      location_detail: {
        id: 3,
        name: 'شیراز',
        province: { id: 3, name: 'فارس' }
      },
      industry_detail: {
        id: 1,
        name: 'فناوری اطلاعات'
      },
      salary: 'Negotiable',
      job_type: 'FT',
      degree: 'BA',
      gender: 'M',
      soldier_status: 'PE',
      job_seeker: 103,
      resume: 1003,
      industry: 1,
      advertisement: {
        id: 'ad3',
        subscription: {
          id: 'sub3',
          plan: {
            name: 'basic',
            price: 500000
          },
          subscription_status: 'active'
        }
      },
      location: 3,
      created_at: '2024-01-05',
      updated_at: '2024-05-10'
    },
    {
      id: "4",
      title: "متخصص دیجیتال مارکتینگ",
      status: "A", // تایید شده
      description: "متخصص دیجیتال مارکتینگ با تجربه در SEO و تبلیغات آنلاین",
      job_seeker_detail: {
        id: 104,
        full_name: 'نازنین رضایی',
        phone: '09123456786',
        profile_picture: 'https://randomuser.me/api/portraits/women/62.jpg',
        user_type: 'jobseeker',
        status: 'active',
        joined_date: '2023-12-15',
        last_updated: '2024-06-12',
        is_active: true,
        is_admin: false
      },
      location_detail: {
        id: 4,
        name: 'مشهد',
        province: { id: 4, name: 'خراسان رضوی' }
      },
      industry_detail: {
        id: 3,
        name: 'تبلیغات و بازاریابی'
      },
      salary: '10 to 15',
      job_type: 'PT',
      degree: 'BA',
      gender: 'F',
      job_seeker: 104,
      resume: 1004,
      industry: 3,
      advertisement: {
        id: 'ad4',
        subscription: {
          id: 'sub4',
          plan: {
            name: 'premium',
            price: 1000000
          },
          subscription_status: 'active'
        }
      },
      location: 4,
      created_at: '2023-12-15',
      updated_at: '2024-06-12'
    },
    {
      id: "5",
      title: "مهندس DevOps",
      status: "A", // تایید شده
      description: "مهندس DevOps با تخصص در Docker و AWS",
      job_seeker_detail: {
        id: 105,
        full_name: 'حسین نوری',
        phone: '09123456785',
        profile_picture: 'https://randomuser.me/api/portraits/men/42.jpg',
        user_type: 'jobseeker',
        status: 'active',
        joined_date: '2023-08-20',
        last_updated: '2024-04-12',
        is_active: true,
        is_admin: false
      },
      location_detail: {
        id: 5,
        name: 'تهران',
        province: { id: 5, name: 'تهران' }
      },
      industry_detail: {
        id: 1,
        name: 'فناوری اطلاعات'
      },
      salary: '30 to 50',
      job_type: 'FT',
      degree: 'MA',
      gender: 'M',
      soldier_status: 'CO',
      job_seeker: 105,
      resume: 1005,
      industry: 1,
      advertisement: {
        id: 'ad5',
        subscription: {
          id: 'sub5',
          plan: {
            name: 'ladder',
            price: 1500000
          },
          subscription_status: 'special'
        }
      },
      location: 5,
      created_at: '2023-08-20',
      updated_at: '2024-04-12'
    },
    {
      id: "6",
      title: "گرافیست و طراح",
      status: "A", // تایید شده
      description: "گرافیست با تجربه در طراحی لوگو و هویت بصری",
      job_seeker_detail: {
        id: 106,
        full_name: 'مریم موسوی',
        phone: '09123456784',
        profile_picture: 'https://randomuser.me/api/portraits/women/24.jpg',
        user_type: 'jobseeker',
        status: 'active',
        joined_date: '2024-02-10',
        last_updated: '2024-05-28',
        is_active: true,
        is_admin: false
      },
      location_detail: {
        id: 1,
        name: 'تبریز',
        province: { id: 1, name: 'آذربایجان شرقی' }
      },
      industry_detail: {
        id: 2,
        name: 'طراحی و هنر'
      },
      salary: 'Negotiable',
      job_type: 'RE',
      degree: 'BA',
      gender: 'F',
      job_seeker: 106,
      resume: 1006,
      industry: 2,
      advertisement: {
        id: 'ad6',
        subscription: {
          id: 'sub6',
          plan: {
            name: 'basic',
            price: 500000
          },
          subscription_status: 'active'
        }
      },
      location: 1,
      created_at: '2024-02-10',
      updated_at: '2024-05-28'
    },
    {
      id: "7",
      title: "مدیر محصول دیجیتال",
      status: "A", // تایید شده
      description: "مدیر محصول با 5 سال تجربه در تیم‌های چابک و توسعه محصولات نرم‌افزاری",
      job_seeker_detail: {
        id: 107,
        full_name: 'امیر حسینی',
        phone: '09123456783',
        profile_picture: 'https://randomuser.me/api/portraits/men/55.jpg',
        user_type: 'jobseeker',
        status: 'active',
        joined_date: '2023-11-18',
        last_updated: '2024-06-05',
        is_active: true,
        is_admin: false
      },
      location_detail: {
        id: 5,
        name: 'تهران',
        province: { id: 5, name: 'تهران' }
      },
      industry_detail: {
        id: 1,
        name: 'فناوری اطلاعات'
      },
      salary: '25 to 35',
      job_type: 'FT',
      degree: 'MA',
      gender: 'M',
      soldier_status: 'CO',
      job_seeker: 107,
      resume: 1007,
      industry: 1,
      advertisement: {
        id: 'ad7',
        subscription: {
          id: 'sub7',
          plan: {
            name: 'ladder',
            price: 1500000
          },
          subscription_status: 'special'
        }
      },
      location: 5,
      created_at: '2023-11-18',
      updated_at: '2024-06-05'
    },
  ];

  // برای سازگاری با کد موجود، همچنان آرایه experts را نگه می‌داریم
  const experts: ExpertType[] = [];

  // شبیه‌سازی بارگذاری داده‌ها
  useEffect(() => {
    // شبیه‌سازی API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // کامپوننت نمایش‌دهنده Skeleton
  const ExpertCardSkeleton = () => (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 1.5, sm: 2 },
        border: `1px solid ${jobSeekerColors.bgLight}`,
        boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        width: { xs: '100%', sm: '100%', md: '100%' },
        mx: 'auto',
        height: '100%'
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
              width={isMobile ? 45 : 55}
              height={isMobile ? 45 : 55}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '70%' }}>
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={18} />
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
        <Box sx={{
          mb: { xs: 0.8, sm: 1 },
          p: 0,
          pb: { xs: 0.8, sm: 1 },
          bgcolor: theme.palette.background.paper,
          border: 'none',
          borderRadius: 1.5,
          fontSize: { xs: '0.75rem', sm: '0.8rem' }
        }}>
          {/* محل کار */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.5 } }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ ml: 1.5 }}
            />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>

          {/* نوع کار ترجیحی */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.5 } }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ ml: 1.5 }}
            />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>

          {/* سابقه کاری */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ ml: 1.5 }}
            />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        </Box>

        {/* مهارت‌ها */}
        <Box sx={{ mb: { xs: 0.8, sm: 1.2 } }}>
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.8 }} />
          <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.5}>
            <Skeleton variant="rectangular" width={60} height={18} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={18} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={55} height={18} sx={{ borderRadius: 1 }} />
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
          <Skeleton variant="text" width="80%" height={20} />
        </Box>

        {/* فضای خالی بین محتوا و دکمه */}
        <Box sx={{ flexGrow: 1 }} />

        {/* دکمه مشاهده رزومه */}
        <Box sx={{ pt: { xs: 0.3, sm: 0.5 }, pb: { xs: 1, sm: 1.2, md: 1.5 } }}>
          <Skeleton
            variant="rectangular"
            height={44}
            width="100%"
            sx={{ borderRadius: 1.5 }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  // تعداد کارت‌های نمایشی بر اساس سایز صفحه
  const visibleExperts = isMobile ? 4 : 7;

  // تعداد کارت‌های اسکلتون بر اساس سایز صفحه
  const getSkeletonCardsCount = () => {
    if (isMobile) return 4;
    return 8;
  };

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
          {loading ? (
            // نمایش Skeleton در حالت بارگذاری
            Array.from(new Array(getSkeletonCardsCount())).map((_, index) => (
              <Box key={index} sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 20px)',
                  md: 'calc(33.33% - 24px)',
                  lg: 'calc(25% - 24px)'
                },
                height: { xs: 'auto', sm: '345px' }
              }}>
                <ExpertCardSkeleton />
              </Box>
            ))
          ) : (
            // نمایش کارت‌های واقعی بعد از بارگذاری
            <>
                              {resumeAdsData
                  .filter(resumeAd => resumeAd.status === "A") // فقط آگهی‌های تایید شده
                  .slice(0, visibleExperts)
                  .map((resumeAd) => (
                  <Box key={resumeAd.id} sx={{
                    width: {
                      xs: '100%',
                      sm: 'calc(50% - 20px)',
                      md: 'calc(33.33% - 24px)',
                      lg: 'calc(25% - 24px)'
                    },
                    height: { xs: 'auto', sm: '345px' }
                  }}>
                    <JobSeekerResumeAdCard resumeAd={resumeAd} onUpdate={() => console.log('بروزرسانی کارت')} />
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
            </>
          )}
        </Box>

        {!loading && (
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
        )}
      </Container>
    </Box>
  );
} 