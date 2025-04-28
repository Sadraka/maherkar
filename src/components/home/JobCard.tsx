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
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import { CSSProperties } from 'react';

// تعریف تایپ جاب
export type JobType = {
  id: number;
  title: string;
  location: string;
  isRemote: boolean;
  salary: string;
  skills: string[];
  isUrgent?: boolean; // فوری بودن آگهی (اختیاری)
  isPromoted?: boolean; // برجسته شدن آگهی (اختیاری)
  subscriptionStatus?: 'default' | 'special'; // وضعیت اشتراک (از مدل AdvertisementSubscription)
  timePosted: string;
  company: string;
  companyLogo?: string; // لوگوی شرکت (اختیاری)
  jobType: string; // نوع کار (تمام وقت، پاره وقت، دورکاری، کارآموزی)
  gender?: string; // جنسیت مورد نیاز (Male، Female، Not Specified)
  soldierStatus?: string; // وضعیت سربازی (Completed، Permanent Exemption، Educational Exemption، Not Specified)
  degree?: string; // حداقل مدرک تحصیلی (Below Diploma، Diploma، Associate، Bachelor، Master، Doctorate)
  advertiseCode?: string; // کد آگهی
  status?: 'Pending' | 'Approved' | 'Rejected'; // وضعیت آگهی (در حال بررسی، تایید شده، رد شده)
  industry?: string; // صنعت مربوطه
  description?: string; // توضیحات شغل
  descriptionPosition?: string; // توضیحات موقعیت
  slug?: string; // اسلاگ آگهی برای استفاده در URL
  created_at?: string; // تاریخ ایجاد آگهی
  updated_at?: string; // تاریخ به‌روزرسانی آگهی
  plan?: {
    name: string; // نام طرح اشتراک
    isFree: boolean; // رایگان بودن طرح
  };
  // فیلدهای ارتباطی برای ارتباطات با مدل‌های دیگر
  owner?: {
    id: number;
    username: string;
    email?: string;
  };
  subscriptionInfo?: {
    id: number;
    name: string;
    type: 'default' | 'special';
    expiry_date: string;
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

export default function JobCard({ job }: JobCardProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();

  // استفاده از رنگ‌های کارفرما
  const employerColors = EMPLOYER_THEME;

  return (
    <Card
      sx={{
        height: '100%', // ارتفاع کامل برای یکسان بودن ارتفاع تمام کارت‌ها
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.25s ease-in-out',
        p: 2,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        }
      }}
    >
      {/* عنوان شغل در بالای کارت */}
      <Box sx={{ mb: 2, px: 1 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: '1rem',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {job.title}
        </Typography>
      </Box>

      {/* کادر درونی با حاشیه آبی */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          border: `1.5px solid ${employerColors.primary}`,
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        {/* اطلاعات موقعیت */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 1.5
            }}
          >
            <LocationOnOutlinedIcon
              sx={{
                color: employerColors.primary,
                fontSize: '1.2rem',
                ml: 1,
                mt: 0.3
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}
            >
              {job.location}
              {job.isRemote &&
                <Chip
                  label="دورکاری"
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: 18,
                    mr: 1,
                    backgroundColor: employerColors.bgVeryLight,
                    color: employerColors.dark,
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}
                />
              }
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1.5
            }}
          >
            <AccessTimeOutlinedIcon
              sx={{
                color: employerColors.primary,
                fontSize: '1.2rem',
                ml: 1
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem'
              }}
            >
              {job.timePosted}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1.5
            }}
          >
            <WorkOutlineIcon
              sx={{
                color: employerColors.primary,
                fontSize: '1.2rem',
                ml: 1
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem'
              }}
            >
              {job.jobType}
            </Typography>
          </Box>

          {/* نمایش صنعت */}
          {job.industry && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1.5
              }}
            >
              <Box
                sx={{
                  color: employerColors.primary,
                  fontSize: '1.2rem',
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <FontAwesomeIcon icon={faBuilding} style={FA_ICON_STYLE} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem'
                }}
              >
                صنعت: {job.industry}
              </Typography>
            </Box>
          )}

          {/* نمایش جنسیت مورد نیاز */}
          {job.gender && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1.5
              }}
            >
              <Chip
                label={job.gender === 'Male' ? 'مناسب برای آقایان' : job.gender === 'Female' ? 'مناسب برای بانوان' : 'مناسب برای همه'}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  color: 'text.secondary',
                  borderRadius: 1,
                }}
              />
            </Box>
          )}
        </Box>

        {/* مهارت‌ها */}
        {job.skills.length > 0 && (
          <Box>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.85rem'
                }}
              >
                مهارت‌های مورد نیاز:
              </Typography>
            </Box>
            <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.7}>
              {job.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: employerColors.bgVeryLight,
                    border: `1px solid ${employerColors.bgLight}`,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    borderRadius: 2,
                    color: employerColors.dark,
                    py: 0.1,
                    px: 0.1,
                    height: '22px',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* توضیحات مختصر */}
        {job.descriptionPosition && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.85rem',
                mb: 0.5
              }}
            >
              شرح موقعیت:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {job.descriptionPosition}
            </Typography>
          </Box>
        )}
      </Box>

      {/* نمایش حقوق به همراه برچسب‌های فوری و ویژه در خارج کادر داخلی */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          px: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', height: '28px' }}>
          {/* نمایش برچسب ویژه - بر اساس وضعیت اشتراک یا پرومت شدن */}
          {(job.isPromoted || job.subscriptionStatus === 'special') && (
            <Box
              component="span"
              sx={{
                bgcolor: 'rgba(211, 47, 47, 0.9)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: '600',
                px: 1,
                py: 0.3,
                height: '28px',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                ml: 1,
                boxShadow: 'none',
                border: 'none',
              }}
            >
              <StarIcon sx={{ fontSize: '0.7rem', mr: 0.3 }} />
              ویژه
            </Box>
          )}

          {/* نمایش کد آگهی */}
          {job.advertiseCode && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                mr: 1,
                display: { xs: 'none', sm: 'inline' }
              }}
            >
              کد: {job.advertiseCode}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: employerColors.bgLight,
            px: 1.5,
            py: 0.5,
            height: '28px',
            borderRadius: 1,
            boxShadow: 'none',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: employerColors.dark,
              fontSize: '0.85rem',
              fontWeight: 'medium',
              textAlign: 'center'
            }}
          >
            {job.salary}
          </Typography>
        </Box>
      </Box>

      {/* نمایش اطلاعات تکمیلی در یک ردیف */}
      {(job.degree || job.soldierStatus) && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
            px: 1
          }}
        >
          {job.degree && (
            <Chip
              size="small"
              label={`مدرک: ${job.degree === 'Below Diploma' ? 'زیر دیپلم' :
                job.degree === 'Diploma' ? 'دیپلم' :
                  job.degree === 'Associate' ? 'فوق دیپلم' :
                    job.degree === 'Bachelor' ? 'لیسانس' :
                      job.degree === 'Master' ? 'فوق لیسانس' :
                        job.degree === 'Doctorate' ? 'دکترا' : job.degree
                }`}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                color: 'text.secondary',
                fontSize: '0.7rem',
                height: '22px',
                borderRadius: 1
              }}
            />
          )}

          {job.soldierStatus && (
            <Chip
              size="small"
              label={`وضعیت سربازی: ${job.soldierStatus === 'Completed' ? 'پایان خدمت' :
                job.soldierStatus === 'Permanent Exemption' ? 'معافیت دائم' :
                  job.soldierStatus === 'Educational Exemption' ? 'معافیت تحصیلی' :
                    job.soldierStatus === 'Not Specified' ? 'مهم نیست' : job.soldierStatus
                }`}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                color: 'text.secondary',
                fontSize: '0.7rem',
                height: '22px',
                borderRadius: 1
              }}
            />
          )}
        </Box>
      )}

      {/* دکمه در پایین کارت */}
      <Button
        fullWidth
        variant="contained"
        disableElevation
        sx={{
          mt: 'auto',
          py: 1.2,
          fontWeight: 'bold',
          borderRadius: 2,
          fontSize: '0.9rem',
          backgroundColor: employerColors.primary,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: employerColors.dark,
            boxShadow: `0 5px 15px ${employerColors.bgLight}`,
          }
        }}
      >
        مشاهده آگهی
      </Button>
    </Card>
  );
} 