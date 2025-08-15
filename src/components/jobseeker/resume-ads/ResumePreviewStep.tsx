'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Button,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';

import { JOB_SEEKER_THEME } from '@/constants/colors';

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (num: number | string | undefined): string => {
  if (num === undefined || num === null) return '';
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

// تابع تبدیل سطح مهارت به فارسی
const getSkillLevelText = (level: string): { label: string; color: string } => {
  const levelMap: { [key: string]: { label: string; color: string } } = {
    'beginner': { label: 'مبتدی', color: '#ff9800' },
    'intermediate': { label: 'متوسط', color: '#2196f3' },
    'advanced': { label: 'پیشرفته', color: '#4caf50' },
    'expert': { label: 'خبره', color: '#9c27b0' }
  };
  return levelMap[level] || { label: level, color: '#757575' };
};

// تابع تبدیل نوع استخدام به فارسی
const getEmploymentTypeText = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'full_time': 'تمام وقت',
    'part_time': 'پاره وقت',
    'contractual': 'قراردادی'
  };
  return typeMap[type] || type;
};

// تابع دریافت نام فایل از URL
const getFileNameFromUrl = (url: string): string => {
  try {
    const withoutQuery = url.split('?')[0];
    const name = withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1);
    return decodeURIComponent(name || 'resume.pdf');
  } catch {
    return 'resume.pdf';
  }
};

/**
 * تایپ‌های مورد نیاز
 */
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

interface Skill {
  id?: number;
  skill?: number | {
    id: number;
    name: string;
    icon?: string;
    industry: { id: number; name: string };
  };
  level: string;
}

interface ResumeInfo {
  id: string;
  headline?: string | null;
  industry?: { id: number; name: string } | null;
  location?: { id: number; name: string; province?: { id: number; name: string } } | null;
  gender?: string | null;
  degree?: string | null;
  expected_salary?: string | null;
  preferred_job_type?: string | null;
  experience_years?: number | null;
  educations?: Education[];
  experiences?: Experience[];
  skills?: Skill[];
  bio?: string | null;
  website?: string | null;
  linkedin_profile?: string | null;
  availability?: string | null;
  cv?: string | null; // فایل PDF رزومه
}

interface ResumePreviewStepProps {
  resumeInfo: ResumeInfo | null;
}

/**
 * کامپوننت کارت تجربه کاری (مطابق با ExperiencesForm)
 */
const ExperienceCard = ({ experience, jobSeekerColors }: { experience: Experience; jobSeekerColors: any }) => {
  const employmentTypeOptions = [
    { value: 'full_time', label: 'تمام وقت' },
    { value: 'part_time', label: 'پاره وقت' },
    { value: 'contractual', label: 'قراردادی' }
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: `1px solid ${alpha(jobSeekerColors.primary, 0.2)}`,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: 'none'
      }}
    >
      <Box sx={{ 
        background: '#ffffff',
        p: { xs: 1.5, sm: 2 }
      }}>
        {/* Desktop Layout */}
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
                <WorkIcon sx={{ fontSize: 16, color: jobSeekerColors.primary }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: jobSeekerColors.primary,
                  fontSize: '1.1rem'
                }}>
                  {experience.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <BusinessIcon sx={{ fontSize: 16, color: jobSeekerColors.primary }} />
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
                    bgcolor: alpha(jobSeekerColors.primary, 0.15),
                    color: jobSeekerColors.primary,
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
                      borderColor: alpha(jobSeekerColors.primary, 0.3),
                      color: jobSeekerColors.primary,
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
                <CalendarTodayIcon sx={{ fontSize: 14, color: jobSeekerColors.primary }} />
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
                  color: jobSeekerColors.primary,
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
              <WorkIcon sx={{ fontSize: 16, color: jobSeekerColors.primary }} />
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: jobSeekerColors.primary,
                fontSize: '0.95rem'
              }}>
                {experience.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <BusinessIcon sx={{ fontSize: 16, color: jobSeekerColors.primary }} />
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
                  bgcolor: alpha(jobSeekerColors.primary, 0.15),
                  color: jobSeekerColors.primary,
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
                    borderColor: alpha(jobSeekerColors.primary, 0.3),
                    color: jobSeekerColors.primary,
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
              <CalendarTodayIcon sx={{ fontSize: 14, color: jobSeekerColors.primary }} />
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
                color: jobSeekerColors.primary,
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
};

/**
 * کامپوننت کارت تحصیلات (مطابق با EducationForm)
 */
const EducationCard = ({ education, jobSeekerColors }: { education: Education; jobSeekerColors: any }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: `1px solid ${alpha(jobSeekerColors.primary, 0.2)}`,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: 'none'
      }}
    >
      <Box sx={{ 
        background: '#ffffff',
        p: { xs: 1.5, sm: 2 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          mb: 1
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <SchoolIcon sx={{ fontSize: 16, color: jobSeekerColors.primary }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: jobSeekerColors.primary,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                {getDegreeText(education.degree)}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              mb: 0.5
            }}>
              {education.field_of_study}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}>
              {education.institution}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            gap: 0.5
          }}>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 500
            }}>
              {convertToPersianNumbers(education.start_year)} 
              {education.end_year ? ` - ${convertToPersianNumbers(education.end_year)}` : ' - ادامه دارد'}
            </Typography>
            {education.is_current && (
              <Chip 
                label="در حال تحصیل"
                size="small"
                color="info"
                sx={{ fontSize: '0.6rem', height: '18px' }}
              />
            )}
          </Box>
        </Box>

        {education.grade && (
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontSize: '0.75rem',
            mb: 0.5
          }}>
            <strong>معدل:</strong> {convertToPersianNumbers(education.grade)}
          </Typography>
        )}

        {education.description && (
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontSize: '0.75rem',
            lineHeight: 1.4,
            whiteSpace: 'pre-line'
          }}>
            {education.description}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

/**
 * کامپوننت نمایش مرحله پیش‌نمایش رزومه
 */
export default function ResumePreviewStep({ resumeInfo }: ResumePreviewStepProps) {
  const router = useRouter();
  const jobSeekerColors = JOB_SEEKER_THEME;

  if (!resumeInfo) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          اطلاعات رزومه یافت نشد. لطفاً ابتدا رزومه خود را تکمیل کنید.
        </Typography>
      </Alert>
    );
  }

  const { experiences = [], educations = [], skills = [], cv } = resumeInfo;

  return (
    <Box dir="rtl">
      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ 
          mb: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          در ادامه، اطلاعات رزومه شما که در آگهی نمایش داده خواهد شد را مشاهده می‌کنید. 
          برای ویرایش هر بخش، روی دکمه "ویرایش" کلیک کنید.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* بخش تجربیات کاری */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            border: `1px solid ${alpha(jobSeekerColors.primary, 0.2)}`,
            background: '#ffffff'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WorkIcon sx={{ 
                fontSize: { xs: 24, md: 28 }, 
                color: jobSeekerColors.primary 
              }} />
              <Typography variant="h6" sx={{ 
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: jobSeekerColors.primary,
                fontWeight: 700
              }}>
                تجربیات کاری ({convertToPersianNumbers(experiences.length)} مورد)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => router.push('/jobseeker/resume/experiences')}
              sx={{
                borderColor: jobSeekerColors.primary,
                color: jobSeekerColors.primary,
                fontSize: '0.75rem',
                px: 2,
                py: 0.5,
                '&:hover': {
                  borderColor: jobSeekerColors.dark,
                  backgroundColor: alpha(jobSeekerColors.primary, 0.05)
                }
              }}
            >
              ویرایش
            </Button>
          </Box>

          {experiences.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                هنوز هیچ تجربه کاری ثبت نکرده‌اید. برای بهتر دیده شدن آگهی، حداقل یک تجربه کاری اضافه کنید.
              </Typography>
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {experiences.slice(0, 5).map((experience, index) => (
                <ExperienceCard 
                  key={experience.id || index} 
                  experience={experience} 
                  jobSeekerColors={jobSeekerColors}
                />
              ))}
              
              {experiences.length > 5 && (
                <Typography variant="body2" sx={{ 
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  mt: 1
                }}>
                  و {convertToPersianNumbers(experiences.length - 5)} تجربه دیگر...
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* بخش تحصیلات */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            border: `1px solid ${alpha(jobSeekerColors.primary, 0.2)}`,
            background: '#ffffff'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SchoolIcon sx={{ 
                fontSize: { xs: 24, md: 28 }, 
                color: jobSeekerColors.primary 
              }} />
              <Typography variant="h6" sx={{ 
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: jobSeekerColors.primary,
                fontWeight: 700
              }}>
                تحصیلات ({convertToPersianNumbers(educations.length)} مورد)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => router.push('/jobseeker/resume/educations')}
              sx={{
                borderColor: jobSeekerColors.primary,
                color: jobSeekerColors.primary,
                fontSize: '0.75rem',
                px: 2,
                py: 0.5,
                '&:hover': {
                  borderColor: jobSeekerColors.dark,
                  backgroundColor: alpha(jobSeekerColors.primary, 0.05)
                }
              }}
            >
              ویرایش
            </Button>
          </Box>

          {educations.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                هنوز هیچ مدرک تحصیلی ثبت نکرده‌اید. برای بهتر دیده شدن آگهی، حداقل یک مدرک تحصیلی اضافه کنید.
              </Typography>
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {educations.slice(0, 5).map((education, index) => (
                <EducationCard 
                  key={education.id || index} 
                  education={education} 
                  jobSeekerColors={jobSeekerColors}
                />
              ))}
              
              {educations.length > 5 && (
                <Typography variant="body2" sx={{ 
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  mt: 1
                }}>
                  و {convertToPersianNumbers(educations.length - 5)} مدرک دیگر...
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* بخش مهارت‌ها */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            border: `1px solid ${alpha(jobSeekerColors.primary, 0.2)}`,
            background: '#ffffff'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BuildIcon sx={{ 
                fontSize: { xs: 24, md: 28 }, 
                color: jobSeekerColors.primary 
              }} />
              <Typography variant="h6" sx={{ 
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: jobSeekerColors.primary,
                fontWeight: 700
              }}>
                مهارت‌ها ({convertToPersianNumbers(skills.length)} مورد)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => router.push('/jobseeker/resume/skills')}
              sx={{
                borderColor: jobSeekerColors.primary,
                color: jobSeekerColors.primary,
                fontSize: '0.75rem',
                px: 2,
                py: 0.5,
                '&:hover': {
                  borderColor: jobSeekerColors.dark,
                  backgroundColor: alpha(jobSeekerColors.primary, 0.05)
                }
              }}
            >
              ویرایش
            </Button>
          </Box>

          {skills.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                هنوز هیچ مهارتی ثبت نکرده‌اید. برای بهتر دیده شدن آگهی، مهارت‌های خود را اضافه کنید.
              </Typography>
            </Alert>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              alignItems: 'center'
            }}>
              {skills.slice(0, 15).map((skill, index) => {
                const skillName = typeof skill.skill === 'object' ? skill.skill?.name : 'مهارت نامشخص';
                const levelInfo = getSkillLevelText(skill.level);
                
                return (
                  <Chip
                    key={skill.id || index}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 12, color: levelInfo.color }} />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          {skillName}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.6rem',
                          color: levelInfo.color,
                          fontWeight: 600
                        }}>
                          ({levelInfo.label})
                        </Typography>
                      </Box>
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: alpha(levelInfo.color, 0.3),
                      color: levelInfo.color,
                      backgroundColor: alpha(levelInfo.color, 0.05),
                      fontSize: '0.7rem',
                      height: '28px',
                      '& .MuiChip-label': {
                        px: 1
                      }
                    }}
                  />
                );
              })}
              
              {skills.length > 15 && (
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: '0.75rem'
                }}>
                  و {convertToPersianNumbers(skills.length - 15)} مهارت دیگر...
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* بخش فایل رزومه PDF */}
        {cv && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderRadius: 2,
              border: `1px solid ${alpha(jobSeekerColors.primary, 0.2)}`,
              background: '#ffffff'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AttachFileIcon sx={{ 
                  fontSize: { xs: 24, md: 28 }, 
                  color: jobSeekerColors.primary 
                }} />
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  color: jobSeekerColors.primary,
                  fontWeight: 700
                }}>
                  فایل رزومه (PDF)
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => router.push('/jobseeker/resume')}
                sx={{
                  borderColor: jobSeekerColors.primary,
                  color: jobSeekerColors.primary,
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5,
                  '&:hover': {
                    borderColor: jobSeekerColors.dark,
                    backgroundColor: alpha(jobSeekerColors.primary, 0.05)
                  }
                }}
              >
                ویرایش
              </Button>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              border: `1px solid ${alpha(jobSeekerColors.primary, 0.1)}`,
              borderRadius: 1,
              backgroundColor: alpha(jobSeekerColors.primary, 0.02)
            }}>
              <PersonIcon sx={{ 
                fontSize: 32, 
                color: jobSeekerColors.primary 
              }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '0.9rem'
                }}>
                  {getFileNameFromUrl(cv)}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.75rem'
                }}>
                  فایل PDF رزومه شما که در آگهی نمایش داده خواهد شد
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => window.open(cv, '_blank')}
                sx={{
                  borderColor: jobSeekerColors.primary,
                  color: jobSeekerColors.primary,
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5,
                  '&:hover': {
                    borderColor: jobSeekerColors.dark,
                    backgroundColor: alpha(jobSeekerColors.primary, 0.05)
                  }
                }}
              >
                مشاهده
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}