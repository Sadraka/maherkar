import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Card,
  CardContent, 
  Chip, 
  Divider, 
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { apiGet } from '@/lib/axios';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import TimerIcon from '@mui/icons-material/Timer';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { EMPLOYER_THEME } from '@/constants/colors';
import { 
  getJobTypeText, 
  getSalaryText, 
  getDegreeText, 
  getGenderText, 
  getSoldierStatusText, 
  formatDate 
} from '@/lib/jobUtils';

interface JobDetailsProps {
  job: {
    id: string;
    title: string;
    description?: string;
    company: string;
    location: number;
    industry: number;
    status: string;
    job_type?: string;
    salary?: string;
    gender?: string;
    degree?: string;
    soldier_status?: string;
    views_count?: number;
    applications_count?: number;
    created_at: string;
    updated_at?: string;
    expires_at?: string;
    employer_detail?: {
      id: string;
      full_name: string;
      phone: string;
      user_type: string;
    };
    subscription_detail?: {
      id: string;
      subscription_status: 'default' | 'special';
      plan?: {
        id: string;
        name: string;
        price_per_day: number;
      };
      duration: number;
      start_date?: string;
      end_date?: string;
      created_at: string;
      updated_at: string;
    };
    company_detail?: {
      id: string;
      name: string;
      description?: string;
      logo?: string;
      banner?: string;
      industry?: {
        id: number;
        name: string;
      };
      location?: {
        id: number;
        name: string;
        province?: {
          id: number;
          name: string;
        };
      };
      number_of_employees?: number;
      created_at: string;
    };
    location_detail?: {
      id: number;
      name: string;
      province?: {
        id: number;
        name: string;
      };
    };
    industry_detail?: {
      id: number;
      name: string;
      category?: {
        id: number;
        name: string;
      };
    };
  };
}

// Helper: convert English digits to Persian digits
const toPersianDigits = (value: number | string): string =>
  value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

// تابع کمکی برای بررسی اشتراک ویژه
const isSpecialSubscription = (job: any): boolean => {
  // بررسی بر اساس نام طرح در subscription_detail
  if (job.subscription_detail?.plan?.name) {
    const planName = job.subscription_detail.plan.name.toLowerCase();
    // فقط طرح‌های نردبان، ویژه، vip، یا ladder را به عنوان special در نظر بگیر
    if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
      return true;
    }
    // طرح‌های پایه را special در نظر نگیر
    if (planName.includes('پایه') || planName.includes('base') || planName.includes('basic')) {
      return false;
    }
  }
  
  // بررسی بر اساس subscription_status در subscription_detail
  if (job.subscription_detail?.subscription_status) {
    if (job.subscription_detail.subscription_status === 'special') {
      return true;
    }
  }
  
  // اگر subscription_detail نبود، از advertisement.subscription بررسی کن
  if (job.advertisement?.subscription?.subscription_status) {
    if (job.advertisement.subscription.subscription_status === 'special') {
      return true;
    }
  }
  
  // بررسی بر اساس نام طرح در advertisement
  if (job.advertisement?.subscription?.plan?.name) {
    const planName = job.advertisement.subscription.plan.name.toLowerCase();
    if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
      return true;
    }
  }
  
  return false;
};

// تابع کمکی برای دریافت نام شهر
const getLocationName = (job: any): string => {
  if (job.location_detail?.name) {
    return job.location_detail.province?.name ? 
      `${job.location_detail.province.name}، ${job.location_detail.name}` : 
      job.location_detail.name;
  }
  return 'موقعیت نامشخص';
};

// تابع کمکی برای محاسبه روزهای باقی‌مانده
const getRemainingDays = (job: any): number | null => {
  if (job.status !== 'A') return null;
  
  const endDate = job.subscription_detail?.end_date;
  if (!endDate) return null;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

// تابع کمکی برای نمایش مدت زمان باقی‌مانده
const getRemainingDaysText = (job: any): string => {
  const remainingDays = getRemainingDays(job);
  if (remainingDays === null) return '';
  if (remainingDays === 0) return 'امروز پایان می‌یابد';
  if (remainingDays === 1) return 'فردا پایان می‌یابد';
  return `${toPersianDigits(remainingDays.toString())} روز باقی‌مانده`;
};

// تابع کمکی برای محاسبه زمان انتشار
const getTimePosted = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'کمتر از ۱ ساعت پیش';
  if (diffInHours < 24) return `${toPersianDigits(diffInHours.toString())} ساعت پیش`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${toPersianDigits(diffInDays.toString())} روز پیش`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${toPersianDigits(diffInWeeks.toString())} هفته پیش`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${toPersianDigits(diffInMonths.toString())} ماه پیش`;
};

  // تابع تبدیل وضعیت به فارسی
  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'P': { text: 'در انتظار تایید', color: '#ff9800' },
      'A': { text: 'تایید شده', color: '#4caf50' },
      'R': { text: 'رد شده', color: '#f44336' }
    };
    return statusMap[status] || { text: 'نامشخص', color: '#757575' };
  };

/**
 * کامپوننت نمایش جزئیات آگهی شغلی به سبک مینیمال و کاربرپسند
 */
const JobDetails = ({ job }: JobDetailsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statusInfo = getStatusText(job.status);

  return (
    <Box sx={{ py: 3, maxWidth: '800px', mx: 'auto' }}>
      {/* دکمه بازگشت */}
      <Button
        component={Link}
        href="/employer/jobs"
        variant="text"
        startIcon={<ArrowBackIcon />}
        sx={{
          mb: 3,
          color: 'text.secondary',
          '&:hover': { 
            backgroundColor: 'rgba(0,0,0,0.04)',
            color: 'text.primary'
          }
        }}
      >
        بازگشت
      </Button>
              
      {/* کارت اصلی پیوسته */}
      <Card
        elevation={0} 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* هدر */}
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  color: EMPLOYER_THEME.primary,
                  mb: 1.5,
                  lineHeight: 1.3
                }}
              >
                {job.title}
              </Typography>
                  
              {/* اطلاعات اساسی */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 3 }}
                sx={{ color: 'text.secondary', fontSize: '0.9rem' }}
              >
                {/* اطلاعات شرکت با لوگو بزرگ و مشخص */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {job.company_detail?.logo ? (
                    <Avatar
                      src={job.company_detail.logo}
                      alt={job.company_detail.name}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        border: `3px solid ${EMPLOYER_THEME.primary}40`,
                        boxShadow: `0 4px 12px ${EMPLOYER_THEME.primary}25`
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{ 
                        width: 48, 
                        height: 48,
                        bgcolor: `${EMPLOYER_THEME.primary}15`,
                        border: `3px solid ${EMPLOYER_THEME.primary}40`
                      }}
                    >
                      <BusinessIcon 
                        sx={{ 
                          fontSize: 28, 
                          color: EMPLOYER_THEME.primary
                        }} 
                      />
                    </Avatar>
                  )}
                  <Typography
                    component="span"
                    sx={{
                      color: EMPLOYER_THEME.primary,
                      fontWeight: 800,
                      fontSize: '1.3rem'
                    }}
                  >
                    {job.company_detail?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 16 }} />
                  {getLocationName(job)}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  {getTimePosted(job.created_at)}
                </Box>
              </Stack>
            </Box>

            {/* برچسب‌ها */}
            <Stack direction="row" spacing={1}>
              {isSpecialSubscription(job) && (
                <Chip
                  label="نردبان"
                  size="small"
                  sx={{
                    bgcolor: '#e53935',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              )}
              {job.status !== 'A' && (
                <Chip
                  label={statusInfo.text}
                  size="small"
                  sx={{
                    bgcolor: statusInfo.color,
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* محتوای اصلی */}
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                    {/* توضیحات شغل */}
          {job.description && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  fontSize: '1.1rem',
                  color: EMPLOYER_THEME.primary 
                }}
              >
                توضیحات شغل
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {job.description}
              </Typography>
            </Box>
          )}

          {/* شرایط و مزایا */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 600, 
                mb: 2.5, 
                fontSize: '1.1rem',
                color: EMPLOYER_THEME.primary
              }}
            >
              شرایط و مزایا
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
              gap: 2.5 
            }}>
              {/* حقوق */}
              {job.salary && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: EMPLOYER_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <AccountBalanceWalletIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      حقوق
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: EMPLOYER_THEME.primary,
                        fontSize: '0.95rem',
                        fontWeight: 600
                      }}
                    >
                      {getSalaryText(job.salary)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* نوع کار */}
              {job.job_type && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: EMPLOYER_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <WorkOutlineIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      نوع کار
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getJobTypeText(job.job_type)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* مدرک تحصیلی */}
              {job.degree && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: EMPLOYER_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      مدرک تحصیلی
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getDegreeText(job.degree)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* جنسیت */}
              {job.gender && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: EMPLOYER_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      جنسیت
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getGenderText(job.gender)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* وضعیت سربازی - فقط برای مردان */}
              {job.soldier_status && job.gender !== 'F' && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: EMPLOYER_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <MilitaryTechIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      وضعیت سربازی
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getSoldierStatusText(job.soldier_status)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* گروه کاری */}
              {job.industry_detail && (
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: '1 / -1' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: EMPLOYER_THEME.primary,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: '1.1rem' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          mb: 0.25
                        }}
                      >
                        گروه کاری
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.primary',
                          fontSize: '0.95rem',
                          fontWeight: 500
                        }}
                      >
                        {job.industry_detail.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* زمان باقی‌مانده */}
          {job.status === 'A' && getRemainingDaysText(job) && (
            <Box sx={{ 
              p: 3,
              bgcolor: getRemainingDays(job) === 0 ? 'rgba(244, 67, 54, 0.03)' : 'rgba(76, 175, 80, 0.03)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: getRemainingDays(job) === 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
              textAlign: 'center'
            }}>
              <Box
                sx={{
                  backgroundColor: getRemainingDays(job) === 0 ? 'rgba(244, 67, 54, 0.08)' : 'rgba(76, 175, 80, 0.08)',
                  color: getRemainingDays(job) === 0 ? '#F44336' : '#4CAF50',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <TimerIcon sx={{ fontSize: '1.8rem' }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: getRemainingDays(job) === 0 ? '#F44336' : '#4CAF50',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 0.5
                }}
              >
                {getRemainingDaysText(job)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem'
                }}
              >
                زمان باقی‌مانده برای درخواست
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default JobDetails; 