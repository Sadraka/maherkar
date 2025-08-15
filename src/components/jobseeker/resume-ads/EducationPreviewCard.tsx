'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import SchoolIcon from '@mui/icons-material/School';

import { JOB_SEEKER_THEME } from '@/constants/colors';

// تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return num?.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d, 10)]) ?? '';
};

// تابع تبدیل مدرک تحصیلی به فارسی
const getDegreeText = (degree: string): string => {
  const degreeMap: { [key: string]: string } = {
    'Diploma': 'دیپلم',
    'Associate': 'کاردانی',
    'Bachelor': 'کارشناسی',
    'Master': 'کارشناسی ارشد',
    'Doctorate': 'دکتری'
  };
  return degreeMap[degree] || degree;
};

interface Education {
  id?: number;
  degree: string;
  field_of_study: string;
  institution: string;
  start_year: number;
  end_year?: number;
  grade?: string;
  description?: string;
  is_current: boolean;
}

interface EducationPreviewCardProps {
  education: Education;
}

export default function EducationPreviewCard({ education }: EducationPreviewCardProps) {
  const jobseekerColors = JOB_SEEKER_THEME;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: `1px solid ${alpha(jobseekerColors.primary, 0.2)}`,
        borderRadius: 2,
        overflow: 'hidden',
        background: 'transparent',
        boxShadow: 'none'
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        background: 'transparent',
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
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              mb: 0.25,
              color: jobseekerColors.primary,
              fontSize: '1.1rem'
            }}>
              {education.field_of_study}
            </Typography>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 0.75,
              color: 'text.primary',
              fontSize: '0.95rem'
            }}>
              {education.institution}
            </Typography>
            
            {/* Chips Section */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              <Chip 
                label={getDegreeText(education.degree)}
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
              {education.is_current && (
                <Chip 
                  label="در حال تحصیل"
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
              {education.grade && (
                <Chip 
                  label={`معدل: ${convertToPersianNumbers(education.grade || '')}`}
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
            </Box>

            {/* Date Section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75,
              color: 'text.secondary',
              fontSize: '0.75rem',
              mb: education.description ? 0.75 : 0
            }}>
              <SchoolIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                سال شروع: {convertToPersianNumbers(education.start_year || '')} 
                {education.is_current ? ' - در حال تحصیل' : ` - سال پایان: ${convertToPersianNumbers(education.end_year || '')}`}
              </Typography>
            </Box>

            {/* Description Section */}
            {education.description && (
              <Box sx={{ mt: 0.75 }}>
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
                  {education.description}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Mobile Layout */}
        <Box sx={{ 
          display: { xs: 'block', sm: 'none' }
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            mb: 0.25,
            color: jobseekerColors.primary,
            fontSize: '0.95rem'
          }}>
            {education.field_of_study}
          </Typography>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 0.75,
            color: 'text.primary',
            fontSize: '0.85rem'
          }}>
            {education.institution}
          </Typography>
          
          {/* Chips Section */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
            <Chip 
              label={getDegreeText(education.degree)}
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
            {education.is_current && (
              <Chip 
                label="در حال تحصیل"
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
            {education.grade && (
              <Chip 
                label={`معدل: ${convertToPersianNumbers(education.grade || '')}`}
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
          </Box>

          {/* Date Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.75,
            color: 'text.secondary',
            fontSize: '0.75rem',
            mb: education.description ? 0.75 : 0
          }}>
            <SchoolIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              سال شروع: {convertToPersianNumbers(education.start_year || '')} 
              {education.is_current ? ' - در حال تحصیل' : ` - سال پایان: ${convertToPersianNumbers(education.end_year || '')}`}
            </Typography>
          </Box>

          {/* Description Section */}
          {education.description && (
            <Box sx={{ mt: 0.75 }}>
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
                {education.description}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
