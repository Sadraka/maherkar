'use client'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Divider,
  useTheme,
  Avatar,
  Paper,
  useMediaQuery
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerIcon from '@mui/icons-material/Timer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faDollarSign, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import { CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredModal from '../../common/AuthRequiredModal';

// تعریف تایپ جاب برای کارفرما
export type EmployerJobType = {
  id: string;
  advertisement: {
    id: string;
    title: string;
    created_at: string;
    subscription?: {
      subscription_status?: 'default' | 'special';
    };
  };
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  location?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  location_detail?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  industry: {
    id: number;
    name: string;
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
  title: string;
  description?: string;
  status: 'P' | 'A' | 'R'; // P=در حال بررسی، A=تایید شده، R=رد شده
  salary?: string;
  job_type?: string;
  degree?: string;
  gender?: string;
  soldier_status?: string;
  created_at: string;
  updated_at: string;
};

interface EmployerJobCardProps {
  job: EmployerJobType | any; // برای سازگاری با JobAdvertisement
}

// تعریف ثابت‌ها برای حل مشکل نمایش آیکون‌های SVG
const ICON_SIZE = '0.9rem';
const SVG_ICON_STYLE = {
  width: ICON_SIZE,
  height: ICON_SIZE,
  fontSize: ICON_SIZE,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
};

// استایل ثابت برای آیکون‌های Font Awesome
const FA_ICON_STYLE: CSSProperties = {
  width: '0.85rem',
  height: '0.85rem',
  fontSize: '0.85rem',
  display: 'inline-block',
  verticalAlign: 'middle',
  overflow: 'hidden'
};

// کامپوننت آیکون کنترل شده
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: ICON_SIZE,
      height: ICON_SIZE,
      overflow: 'hidden',
      marginLeft: '4px'
    }}
  >
    {children}
  </span>
);

// تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
const convertToFarsiNumber = (num: string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

// تابع کمکی برای تبدیل وضعیت‌ها به متن فارسی مناسب
const getSalaryText = (salary?: string): string => {
  if (!salary) return 'توافقی';
  
  switch (salary) {
    case '5 to 10': return convertToFarsiNumber('5') + ' تا ' + convertToFarsiNumber('10') + ' میلیون تومان';
    case '10 to 15': return convertToFarsiNumber('10') + ' تا ' + convertToFarsiNumber('15') + ' میلیون تومان';
    case '15 to 20': return convertToFarsiNumber('15') + ' تا ' + convertToFarsiNumber('20') + ' میلیون تومان';
    case '20 to 30': return convertToFarsiNumber('20') + ' تا ' + convertToFarsiNumber('30') + ' میلیون تومان';
    case '30 to 50': return convertToFarsiNumber('30') + ' تا ' + convertToFarsiNumber('50') + ' میلیون تومان';
    case 'More than 50': return 'بیش از ' + convertToFarsiNumber('50') + ' میلیون تومان';
    case 'Negotiable':
    default: return 'توافقی';
  }
};

const getJobTypeText = (jobType?: string): string => {
  if (!jobType) return 'تمام وقت';
  
  switch (jobType) {
    case 'FT': return 'تمام وقت';
    case 'PT': return 'پاره وقت';
    case 'RE': return 'دورکاری';
    case 'IN': return 'کارآموزی';
    default: return jobType;
  }
};

const getDegreeText = (degree?: string): string => {
  if (!degree) return '';
  switch (degree) {
    case 'BD': return 'زیر دیپلم';
    case 'DI': return 'دیپلم';
    case 'AS': return 'فوق دیپلم';
    case 'BA': return 'لیسانس';
    case 'MA': return 'فوق لیسانس';
    case 'DO': return 'دکترا';
    default: return degree;
  }
};

const getSoldierStatusText = (status?: string): string => {
  if (!status) return '';
  switch (status) {
    case 'CO': return 'پایان خدمت';
    case 'EE': return 'معافیت تحصیلی';
    case 'NS': return 'مهم نیست';
    default: return status;
  }
};

const getGenderText = (gender?: string): string => {
  if (!gender) return 'مناسب برای همه';
  switch (gender) {
    case 'M': return 'مناسب برای آقایان';
    case 'F': return 'مناسب برای بانوان';
    case 'N': return 'مناسب برای همه';
    default: return gender;
  }
};

// تابع کمکی برای بررسی وضعیت subscription
const isSpecialSubscription = (job: any): boolean => {
  console.log('Job data for subscription check:', job);
  
  // بررسی بر اساس نام طرح در subscription_detail
  if (job.subscription_detail?.plan?.name) {
    const planName = job.subscription_detail.plan.name.toLowerCase();
    console.log('Plan name:', planName);
    // فقط طرح‌های نردبان، ویژه، vip، یا ladder را به عنوان special در نظر بگیر
    if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
      console.log('Special subscription detected by plan name');
      return true;
    }
    // طرح‌های پایه را special در نظر نگیر
    if (planName.includes('پایه') || planName.includes('base') || planName.includes('basic')) {
      console.log('Basic subscription detected by plan name');
      return false;
    }
  }
  
  // بررسی بر اساس subscription_status در subscription_detail
  if (job.subscription_detail?.subscription_status) {
    console.log('Subscription status:', job.subscription_detail.subscription_status);
    if (job.subscription_detail.subscription_status === 'special') {
      console.log('Special subscription detected by status');
      return true;
    }
  }
  
  // اگر subscription_detail نبود، از advertisement.subscription بررسی کن
  if (job.advertisement?.subscription?.subscription_status) {
    console.log('Advertisement subscription status:', job.advertisement.subscription.subscription_status);
    if (job.advertisement.subscription.subscription_status === 'special') {
      console.log('Special subscription detected by advertisement status');
      return true;
    }
  }
  
  // بررسی بر اساس نام طرح در advertisement
  if (job.advertisement?.subscription?.plan?.name) {
    const planName = job.advertisement.subscription.plan.name.toLowerCase();
    console.log('Advertisement plan name:', planName);
    if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
      console.log('Special subscription detected by advertisement plan name');
      return true;
    }
  }
  
  console.log('No special subscription detected');
  return false;
};

// تابع کمکی برای دریافت نام شهر
const getLocationName = (job: any): string => {
  if (job.location_detail?.name) return job.location_detail.name;
  if (job.location?.name) return job.location.name;
  return 'موقعیت نامشخص';
};

// تابع کمکی برای دریافت متن وضعیت آگهی
const getStatusText = (status?: string): string => {
  switch (status) {
    case 'P':
      return 'در انتظار بررسی';
    case 'A':
      return 'تایید شده';
    case 'R':
      return 'رد شده';
    default:
      return 'نامشخص';
  }
};

// تابع کمکی برای دریافت رنگ وضعیت آگهی
const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'P':
      return '#FF9800'; // نارنجی برای در انتظار
    case 'A':
      return '#4CAF50'; // سبز برای تایید شده
    case 'R':
      return '#F44336'; // قرمز برای رد شده
    default:
      return '#9E9E9E'; // خاکستری برای نامشخص
  }
};

// تابع کمکی برای محاسبه روزهای باقی‌مانده
const getRemainingDays = (job: any): number | null => {
  if (job.status !== 'A') return null; // فقط برای آگهی‌های تایید شده
  
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
  return `${convertToFarsiNumber(remainingDays.toString())} روز باقی‌مانده`;
};

// تابع کمکی برای محاسبه زمان انتشار
const getTimePosted = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'کمتر از ۱ ساعت پیش';
  if (diffInHours < 24) return `${convertToFarsiNumber(diffInHours.toString())} ساعت پیش`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${convertToFarsiNumber(diffInDays.toString())} روز پیش`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${convertToFarsiNumber(diffInWeeks.toString())} هفته پیش`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${convertToFarsiNumber(diffInMonths.toString())} ماه پیش`;
};

// تابع کمکی برای تعیین اندازه فونت بر اساس طول عنوان و وجود برچسب نردبان
const getTitleFontSize = (title: string, isMobile: boolean, isTablet: boolean, hasLadderBadge: boolean) => {
  const titleLength = title.length;
  
  // اگر برچسب نردبان وجود دارد، فونت کوچک‌تر شود
  const ladderReduction = hasLadderBadge ? 0.1 : 0;
  
  if (isMobile) {
    if (titleLength <= 15) return `${0.9 - ladderReduction}rem`;
    if (titleLength <= 25) return `${0.85 - ladderReduction}rem`;
    return `${0.8 - ladderReduction}rem`;
  }
  
  if (isTablet) {
    if (titleLength <= 20) return `${0.95 - ladderReduction}rem`;
    if (titleLength <= 30) return `${0.9 - ladderReduction}rem`;
    return `${0.85 - ladderReduction}rem`;
  }
  
  // Desktop
  if (titleLength <= 25) return `${1 - ladderReduction}rem`;
  if (titleLength <= 35) return `${0.95 - ladderReduction}rem`;
  return `${0.9 - ladderReduction}rem`;
};

export default function EmployerJobCard({ job }: EmployerJobCardProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const router = useRouter();
  const { isAuthenticated } = useAuth();



  // استفاده از رنگ‌های کارفرما
  const employerColors = EMPLOYER_THEME;
  
  // وضعیت نمایش مدال
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // تابع کلیک بر روی دکمه مشاهده آگهی
  const handleViewJob = () => {
    if (isAuthenticated) {
      // اگر کاربر وارد شده باشد، به صفحه آگهی برو
      router.push(`/employer/jobs/${job.id}`);
    } else {
      // اگر کاربر وارد نشده باشد، مدال لاگین را نمایش بده
      setLoginModalOpen(true);
    }
  };
  
  // بستن مدال
  const handleCloseModal = () => {
    setLoginModalOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          minHeight: { xs: '260px', sm: '280px', md: '300px' },
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          border: `1px solid #E0E0E0`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.25s ease-in-out',
          p: 0,
          width: '100%',
          mx: 'auto',
          direction: 'ltr',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          }
        }}
      >
        <CardContent sx={{ p: 0, pb: "0px !important", height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* هدر کارت با نمایش عنوان و برچسب نردبان */}
          <Box
            sx={{
              p: 1,
              pb: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
              height: { xs: 36, sm: 40, md: 45 },
              px: { xs: 0.8, sm: 1, md: 1.2 },
            }}
          >
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 700,
                fontSize: getTitleFontSize(job.title, isMobile, isTablet, isSpecialSubscription(job)),
                color: '#1976d2', // رنگ آبی کارفرما
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textAlign: 'left',
                wordBreak: 'break-word',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flex: 1,
                mr: 1,
              }}
            >
              {job.title}
            </Typography>

            {/* نمایش برچسب نردبان در بالای کارت */}
            {(() => {
              const isSpecial = isSpecialSubscription(job);
              return isSpecial ? (
                <Box
                  component="span"
                  sx={{
                    bgcolor: '#e53935',
                    color: '#fff',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    fontWeight: 700,
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 'auto',
                    height: { xs: 20, sm: 22 },
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  نردبان
                </Box>
              ) : null;
            })()}
          </Box>

          {/* بدنه کارت - اطلاعات شغلی با فاصله کمتر */}
          <Box sx={{ px: { xs: 0.8, sm: 1, md: 1.2 }, py: { xs: 0.6, sm: 0.8, md: 1 }, flex: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Box sx={{ display: 'grid', gap: { xs: 0.8, sm: 1, md: 1.2 } }}>
                                {/* محل کار و وضعیت بررسی */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          color: '#1976d2',
                          width: { xs: 24, sm: 28, md: 32 },
                          height: { xs: 24, sm: 28, md: 32 },
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ml: 0.5,
                          mr: { xs: 0.8, sm: 1 },
                        }}
                      >
                        <LocationOnOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                          textAlign: 'left',
                          flex: 1
                        }}
                      >
                        {getLocationName(job)}
                      </Typography>
                    </Box>
                    
                    {/* نمایش برچسب وضعیت بررسی */}
                    {job.status !== 'A' && (
                      <Box
                        component="span"
                        sx={{
                          backgroundColor: job.status === 'P' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                          color: job.status === 'P' ? '#FF9800' : '#F44336',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          fontWeight: 600,
                          px: { xs: 0.8, sm: 1 },
                          py: { xs: 0.3, sm: 0.4 },
                          borderRadius: '12px',
                          border: `1px solid ${job.status === 'P' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                          whiteSpace: 'nowrap',
                          ml: 1,
                        }}
                      >
                        {getStatusText(job.status)}
                      </Box>
                    )}
                  </Box>

                                {/* زمان انتشار */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: '#1976d2',
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ml: 0.5,
                        mr: { xs: 0.8, sm: 1 },
                      }}
                    >
                      <AccessTimeOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        textAlign: 'left'
                      }}
                    >
                      {getTimePosted(job.created_at)}
                    </Typography>
                  </Box>



                                {/* نوع کار */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: '#1976d2',
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ml: 0.5,
                        mr: { xs: 0.8, sm: 1 },
                      }}
                    >
                      <WorkOutlineIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        textAlign: 'left'
                      }}
                    >
                      {getJobTypeText(job.job_type)}
                    </Typography>
                  </Box>

              {/* حقوق */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2',
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 0.5,
                    mr: { xs: 0.8, sm: 1 },
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#1976d2',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    textAlign: 'right'
                  }}
                >
                  {getSalaryText(job.salary)}
                </Typography>
              </Box>

              {/* مدت زمان باقی‌مانده - برای آگهی‌های تایید شده */}
              {job.status === 'A' && getRemainingDaysText(job) && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                      color: '#4CAF50',
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 0.5,
                      mr: { xs: 0.8, sm: 1 },
                    }}
                  >
                    <TimerIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getRemainingDays(job) === 0 ? '#F44336' : '#4CAF50',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      textAlign: 'left',
                      fontWeight: getRemainingDays(job) === 0 ? 600 : 400,
                    }}
                  >
                    {getRemainingDaysText(job)}
                  </Typography>
                </Box>
              )}

              {/* پیام برای آگهی‌های تایید نشده */}
              {job.status !== 'A' && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(158, 158, 158, 0.08)',
                      color: '#9E9E9E',
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 0.5,
                      mr: { xs: 0.8, sm: 1 },
                    }}
                  >
                    <TimerIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#9E9E9E',
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      textAlign: 'left',
                      fontWeight: 400,
                    }}
                  >
                    بعد از تایید محاسبه می‌شود
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>



          {/* دکمه مشاهده آگهی با آیکون چشم - به صورت مستطیلی */}
          <Box sx={{ px: { xs: 1, sm: 1.2 }, pb: { xs: 1.2, sm: 1.5 }, pt: 0.5 }}>
            <Button
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<VisibilityOutlinedIcon fontSize="small" />}
              onClick={handleViewJob}
              sx={{
                py: { xs: 0.8, sm: 1 },
                fontWeight: 'bold',
                borderRadius: 1.5,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                backgroundColor: '#4299e1',
                color: '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#1976d2',
                  boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              مشاهده آگهی
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* استفاده از کامپوننت مدال احراز هویت با تم کارفرما */}
      <AuthRequiredModal
        open={loginModalOpen}
        onClose={handleCloseModal}
        redirectUrl={`/employer/jobs/${job.id}`}
        themeType="employer" 
        title="ورود به حساب کاربری"
        message="برای مشاهده جزئیات این آگهی شغلی، لازم است وارد حساب کاربری خود شوید."
        submessage="پس از ورود، می‌توانید به تمامی جزئیات این آگهی شغلی دسترسی داشته باشید."
      />
    </>
  );
} 