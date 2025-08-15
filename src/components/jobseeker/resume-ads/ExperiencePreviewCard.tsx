'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { JOB_SEEKER_THEME } from '@/constants/colors';

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
};

// تابع تبدیل تاریخ میلادی به شمسی
const gregorianToJalali = (gy: number, gm: number, gd: number): [number, number, number] => {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = 0;
  
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  
  jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  
  let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  
  return [jy, jm, jd];
};

// تابع فرمت کردن تاریخ
const formatDate = (dateString: string) => {
  if (!dateString) return 'نامشخص';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'نامشخص';
    
    const [year, month, day] = gregorianToJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    
    return `${convertToPersianNumbers(year)}/${convertToPersianNumbers(month.toString().padStart(2, '0'))}/${convertToPersianNumbers(day.toString().padStart(2, '0'))}`;
  } catch (error) {
    return 'نامشخص';
  }
};

interface Experience {
  id?: number;
  employment_type: string;
  title: string;
  company: string;
  location?: { id: number; name: string; province?: { id: number; name: string } };
  start_date: string;
  end_date?: string | null;
  description?: string;
  is_current?: boolean;
}

interface ExperiencePreviewCardProps {
  experience: Experience;
}

export default function ExperiencePreviewCard({ experience }: ExperiencePreviewCardProps) {
  const jobseekerColors = JOB_SEEKER_THEME;
  
  const employmentTypeOptions = [
    { value: 'full_time', label: 'تمام وقت' },
    { value: 'part_time', label: 'پاره وقت' },
    { value: 'contractual', label: 'قراردادی' }
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: `1px solid ${alpha(jobseekerColors.primary, 0.2)}`,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: 'none'
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        background: '#ffffff',
        p: { xs: 1.5, sm: 2 }
      }}>
        {/* Desktop Layout - بدون دکمه‌های عمل */}
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 1 
        }}>
          <Box sx={{ flex: 1 }}>
            {/* خط اول: عنوان و شرکت */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center', 
              gap: 3, 
              mb: 1 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <WorkIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: jobseekerColors.primary,
                  fontSize: '1.1rem'
                }}>
                  {experience.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <BusinessIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: '0.95rem'
                }}>
                  {experience.company}
                </Typography>
              </Box>
            </Box>
            
            {/* خط دوم: chips و تاریخ */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5, 
              flexWrap: 'wrap' 
            }}>
              {/* Chips Section */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.75,
                flexDirection: 'row'
              }}>
                <Chip 
                  label={employmentTypeOptions.find(opt => opt.value === experience.employment_type)?.label || experience.employment_type}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(jobseekerColors.primary, 0.15),
                    color: jobseekerColors.primary,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: '22px',
                    '& .MuiChip-label': {
                      px: 1.25
                    }
                  }}
                />
                {experience.location && (
                  <Chip 
                    label={experience.location.name}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: alpha(jobseekerColors.primary, 0.3),
                      color: jobseekerColors.primary,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      height: '22px',
                      '& .MuiChip-label': {
                        px: 1.25
                      }
                    }}
                  />
                )}
                {experience.is_current && (
                  <Chip 
                    label="شغل فعلی"
                    size="small"
                    color="success"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: '22px',
                      '& .MuiChip-label': {
                        px: 1.25
                      }
                    }}
                  />
                )}
              </Box>

              {/* Date Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.75,
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}>
                <CalendarTodayIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatDate(experience.start_date)} 
                  {experience.end_date ? ` تا ${formatDate(experience.end_date)}` : ' تاکنون'}
                </Typography>
              </Box>
            </Box>

            {/* Description Section */}
            {experience.description && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  color: jobseekerColors.primary,
                  mb: 0.25,
                  fontSize: '0.7rem'
                }}>
                  توضیحات:
                </Typography>
                <Typography variant="body2" sx={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.3,
                  color: 'text.secondary',
                  fontSize: '0.7rem'
                }}>
                  {experience.description}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Mobile Layout */}
        <Box sx={{ 
          display: { xs: 'block', sm: 'none' }
        }}>
          {/* خط اول: عنوان و شرکت */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start', 
            gap: 1, 
            mb: 1 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <WorkIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: jobseekerColors.primary,
                fontSize: '0.95rem'
              }}>
                {experience.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <BusinessIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                fontSize: '0.85rem'
              }}>
                {experience.company}
              </Typography>
            </Box>
          </Box>
          
          {/* خط دوم: chips و تاریخ */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1, 
            flexWrap: 'wrap' 
          }}>
            {/* Chips Section */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.75,
              flexDirection: 'column'
            }}>
              <Chip 
                label={employmentTypeOptions.find(opt => opt.value === experience.employment_type)?.label || experience.employment_type}
                size="small"
                sx={{ 
                  bgcolor: alpha(jobseekerColors.primary, 0.15),
                  color: jobseekerColors.primary,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: '22px',
                  '& .MuiChip-label': {
                    px: 1.25
                  }
                }}
              />
              {experience.location && (
                <Chip 
                  label={experience.location.name}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: alpha(jobseekerColors.primary, 0.3),
                    color: jobseekerColors.primary,
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: '22px',
                    '& .MuiChip-label': {
                      px: 1.25
                    }
                  }}
                />
              )}
              {experience.is_current && (
                <Chip 
                  label="شغل فعلی"
                  size="small"
                  color="success"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: '22px',
                    '& .MuiChip-label': {
                      px: 1.25
                    }
                  }}
                />
              )}
            </Box>

            {/* Date Section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75,
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(experience.start_date)} 
                {experience.end_date ? ` تا ${formatDate(experience.end_date)}` : ' تاکنون'}
              </Typography>
            </Box>
          </Box>

          {/* Description Section */}
          {experience.description && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600,
                color: jobseekerColors.primary,
                mb: 0.25,
                fontSize: '0.7rem'
              }}>
                توضیحات:
              </Typography>
              <Typography variant="body2" sx={{ 
                whiteSpace: 'pre-line',
                lineHeight: 1.3,
                color: 'text.secondary',
                fontSize: '0.7rem'
              }}>
                {experience.description}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
