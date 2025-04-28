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
import { faBuilding, faMoneyBill, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
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
  isUrgent: boolean;
  isPromoted?: boolean; // آگهی نردبان شده یا پرومت شده
  timePosted: string;
  company: string;
  companyLogo?: string; // لوگوی شرکت (اختیاری)
  jobType: string;
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
        border: `2px solid ${employerColors.bgLight}`, // افزودن حاشیه برای مشخص‌تر شدن
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.25s ease-in-out',
        p: 2,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: `2px solid ${employerColors.primary}`,
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
          <WorkOutlineIcon sx={{ ml: 1, fontSize: '1.1rem', color: employerColors.primary }} />
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
              alignItems: 'center'
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {job.isUrgent && (
            <Box
              component="span"
              sx={{
                bgcolor: 'rgba(255, 145, 0, 0.9)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                px: 1,
                py: 0.3,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                ml: 1,
                boxShadow: '0 2px 5px rgba(255, 145, 0, 0.3)',
              }}
            >
              <LocalFireDepartmentIcon sx={{ fontSize: '0.75rem', mr: 0.5 }} />
              فوری
            </Box>
          )}

          {job.isPromoted && (
            <Box
              component="span"
              sx={{
                bgcolor: 'rgba(211, 47, 47, 0.9)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                px: 1,
                py: 0.3,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                ml: 1,
                boxShadow: '0 2px 5px rgba(211, 47, 47, 0.3)',
              }}
            >
              <StarIcon sx={{ fontSize: '0.75rem', mr: 0.5 }} />
              ویژه
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ ml: 1, color: employerColors.primary }}>
            <FontAwesomeIcon
              icon={faMoneyBillWave}
              style={{
                fontSize: '1.2rem',
                color: employerColors.primary
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: employerColors.dark,
              fontSize: '0.9rem'
            }}
          >
            {job.salary}
          </Typography>
        </Box>
      </Box>

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