'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';

import { JOB_SEEKER_THEME } from '@/constants/colors';
import ExperiencePreviewCard from './ExperiencePreviewCard';
import EducationPreviewCard from './EducationPreviewCard';
import SkillsPreviewCard from './SkillsPreviewCard';

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (num: number | string | undefined): string => {
  if (num === undefined || num === null) return '';
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
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
 * کامپوننت نمایش مرحله پیش‌نمایش رزومه
 */
export default function ResumePreviewStep({ resumeInfo }: ResumePreviewStepProps) {
  const router = useRouter();
  const jobSeekerColors = JOB_SEEKER_THEME;
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  // دریافت مهارت‌های موجود برای نمایش نام صحیح مهارت‌ها
  useEffect(() => {
    const fetchAvailableSkills = async () => {
      try {
        const response = await apiGet('/industries/skills/');
        setAvailableSkills(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('خطا در دریافت مهارت‌های موجود:', error);
        setAvailableSkills([]);
      }
    };

    fetchAvailableSkills();
  }, []);

  if (!resumeInfo) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          اطلاعات شخصی یافت نشد. لطفاً ابتدا رزومه خود را تکمیل کنید.
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
          در ادامه، اطلاعات شخصی شما که در آگهی نمایش داده خواهد شد را مشاهده می‌کنید. 
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
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 1.5, sm: 0 },
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
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                px: { xs: 1.5, sm: 2 },
                py: 0.5,
                minWidth: { xs: 'auto', sm: 'auto' },
                alignSelf: { xs: 'flex-start', sm: 'center' },
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
                <ExperiencePreviewCard 
                  key={experience.id || index} 
                  experience={experience}
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
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 1.5, sm: 0 },
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
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                px: { xs: 1.5, sm: 2 },
                py: 0.5,
                minWidth: { xs: 'auto', sm: 'auto' },
                alignSelf: { xs: 'flex-start', sm: 'center' },
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
                <EducationPreviewCard 
                  key={education.id || index} 
                  education={education}
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
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 1.5, sm: 0 },
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
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                px: { xs: 1.5, sm: 2 },
                py: 0.5,
                minWidth: { xs: 'auto', sm: 'auto' },
                alignSelf: { xs: 'flex-start', sm: 'center' },
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
            <Box>
              <SkillsPreviewCard skills={skills} availableSkills={availableSkills} />
              
              {skills.length > 15 && (
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  mt: 2
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
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: { xs: 1.5, sm: 0 },
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
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: 0.5,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  alignSelf: { xs: 'flex-start', sm: 'center' },
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
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: { xs: 1.5, sm: 2 },
              p: { xs: 1.5, sm: 2 },
              border: `1px solid ${alpha(jobSeekerColors.primary, 0.1)}`,
              borderRadius: 1,
              backgroundColor: alpha(jobSeekerColors.primary, 0.02)
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 },
                flex: 1 
              }}>
                <PersonIcon sx={{ 
                  fontSize: { xs: 24, sm: 32 }, 
                  color: jobSeekerColors.primary 
                }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}>
                    {getFileNameFromUrl(cv)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}>
                    فایل PDF رزومه شما که در آگهی نمایش داده خواهد شد
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => window.open(cv, '_blank')}
                sx={{
                  borderColor: jobSeekerColors.primary,
                  color: jobSeekerColors.primary,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: 0.5,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  alignSelf: { xs: 'flex-start', sm: 'center' },
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