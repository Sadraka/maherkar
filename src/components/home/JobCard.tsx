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
  Paper
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import WorkIcon from '@mui/icons-material/Work';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faDollarSign, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import { CSSProperties } from 'react';

// تعریف تایپ جاب
export type JobType = {
  id: number;
  title: string;
  location: string; // مرتبط با مدل City
  salary:
  | '5 to 10'     // 5 تا 10 میلیون تومان
  | '10 to 15'    // 10 تا 15 میلیون تومان
  | '15 to 20'    // 15 تا 20 میلیون تومان
  | '20 to 30'    // 20 تا 30 میلیون تومان
  | '30 to 50'    // 30 تا 50 میلیون تومان
  | 'More than 50' // بیش از 50 میلیون تومان
  | 'Negotiable';  // توافقی
  jobType: 'Full-Time' | 'Part-Time' | 'Remote' | 'Internship'; // نوع کار
  gender?: 'Male' | 'Female' | 'Not Specified'; // جنسیت مورد نیاز
  soldierStatus?: 'Completed' | 'Permanent Exemption' | 'Educational Exemption' | 'Not Specified'; // وضعیت سربازی
  degree?: 'Below Diploma' | 'Diploma' | 'Associate' | 'Bachelor' | 'Master' | 'Doctorate'; // حداقل مدرک تحصیلی
  advertiseCode?: string; // کد آگهی
  status?: 'Pending' | 'Approved' | 'Rejected'; // وضعیت آگهی
  industry?: string; // صنعت مربوطه - مرتبط با مدل Industry
  description?: string; // توضیحات شغل
  descriptionPosition?: string; // توضیحات موقعیت شغلی
  slug?: string; // اسلاگ آگهی برای استفاده در URL
  created_at?: string; // تاریخ ایجاد آگهی
  updated_at?: string; // تاریخ به‌روزرسانی آگهی
  company: string; // نام شرکت - مرتبط با مدل Company
  companyLogo?: string; // لوگوی شرکت - از مدل Company
  subscriptionStatus?: 'default' | 'special'; // نوع اشتراک آگهی از مدل AdvertisementSubscription
  timePosted?: string; // محاسبه شده از created_at
  skills: string[]; // مهارت‌های مورد نیاز - ممکن است در جدول دیگری در بک‌اند ذخیره شود
  owner?: {
    id: number;
    username: string;
    email?: string;
  };
};

interface JobCardProps {
  job: JobType;
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
  overflow: 'hidden' // جلوگیری از نمایش بیرون زدگی آیکون
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

// کامپوننت آیکون کنترل شده - بدون استفاده از Box
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: ICON_SIZE,
      height: ICON_SIZE,
      overflow: 'hidden',
      marginLeft: '4px' // تغییر از راست به چپ برای زبان فارسی
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
const getSalaryText = (salary: JobType['salary']): string => {
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

const getJobTypeText = (jobType: JobType['jobType']): string => {
  switch (jobType) {
    case 'Full-Time': return 'تمام وقت';
    case 'Part-Time': return 'پاره وقت';
    case 'Remote': return 'دورکاری';
    case 'Internship': return 'کارآموزی';
    default: return jobType;
  }
};

const getDegreeText = (degree?: JobType['degree']): string => {
  if (!degree) return '';
  switch (degree) {
    case 'Below Diploma': return 'زیر دیپلم';
    case 'Diploma': return 'دیپلم';
    case 'Associate': return 'فوق دیپلم';
    case 'Bachelor': return 'لیسانس';
    case 'Master': return 'فوق لیسانس';
    case 'Doctorate': return 'دکترا';
    default: return degree;
  }
};

const getSoldierStatusText = (status?: JobType['soldierStatus']): string => {
  if (!status) return '';
  switch (status) {
    case 'Completed': return 'پایان خدمت';
    case 'Permanent Exemption': return 'معافیت دائم';
    case 'Educational Exemption': return 'معافیت تحصیلی';
    case 'Not Specified': return 'مهم نیست';
    default: return status;
  }
};

const getGenderText = (gender?: JobType['gender']): string => {
  if (!gender) return 'مناسب برای همه';
  switch (gender) {
    case 'Male': return 'مناسب برای آقایان';
    case 'Female': return 'مناسب برای بانوان';
    case 'Not Specified': return 'مناسب برای همه';
    default: return gender;
  }
};

export default function JobCard({ job }: JobCardProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();

  // استفاده از رنگ‌های کارفرما
  const employerColors = EMPLOYER_THEME;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid #E0E0E0`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.25s ease-in-out',
        p: 0,
        maxWidth: '100%',
        width: { xs: '100%', sm: '270px', md: '290px' },
        mx: 'auto',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          border: `1px solid #BDBDBD`,
        }
      }}
    >
      <CardContent sx={{ p: 0, pb: "0px !important" }}>
        {/* هدر کارت با نمایش عنوان و برچسب نردبان */}
        <Box
          sx={{
            p: 1.2,
            pb: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            minHeight: 50,
            px: 0.8,
          }}
        >
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.primary',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              height: 'auto',
              maxWidth: '85%',
              flexGrow: 1,
              mr: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {job.title}
          </Typography>

          {/* نمایش برچسب نردبان با طراحی بهتر */}
          {job.subscriptionStatus === 'special' && (
            <Box
              component="span"
              sx={{
                bgcolor: '#e53935',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                px: 0.8,
                py: 0.3,
                borderRadius: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'auto',
                height: 22,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                mr: 0.5,
                alignSelf: 'center',
              }}
            >
              نردبان
            </Box>
          )}
        </Box>

        {/* بدنه کارت - اطلاعات شغلی با فاصله کمتر */}
        <Box sx={{ px: 0.8, py: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'grid', gap: 1.2 }}>
            {/* محل کار */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: '#1976d2',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 0.5,
                  mr: 1,
                }}
              >
                <LocationOnOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {job.location}
              </Typography>
            </Box>

            {/* زمان انتشار */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: '#1976d2',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 0.5,
                  mr: 1,
                }}
              >
                <AccessTimeOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {job.timePosted || (job.created_at ? new Date(job.created_at).toLocaleDateString('fa-IR') : '')}
              </Typography>
            </Box>

            {/* نوع کار */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: '#1976d2',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 0.5,
                  mr: 1,
                }}
              >
                <WorkOutlineIcon sx={{ fontSize: '1.1rem' }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {getJobTypeText(job.jobType)}
              </Typography>
            </Box>

            {/* حقوق */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: '#1976d2',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 0.5,
                  mr: 1,
                }}
              >
                <PaidOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: '#1976d2',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {getSalaryText(job.salary)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* دکمه مشاهده آگهی با آیکون چشم - به صورت مستطیلی */}
        <Box sx={{ px: 1.2, pb: 1.5, pt: 0.5 }}>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            startIcon={<VisibilityOutlinedIcon fontSize="small" />}
            sx={{
              py: 1,
              fontWeight: 'bold',
              borderRadius: 1.5,
              fontSize: '0.9rem',
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
  );
} 