'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AuthRequiredModal from '@/components/common/AuthRequiredModal';
import ResumeAdCardSkeleton from './ResumeAdCardSkeleton';
import { getJobTypeText, getSalaryText, getDegreeText, getGenderText, getSoldierStatusText } from '@/lib/jobUtils';
import TimerIcon from '@mui/icons-material/Timer';

// تایپ مهارت از بک‌اند
type SkillType = {
  id?: number;
  skill?: number | {
    id: number;
    name: string;
    icon?: string;
    industry: {
      id: number;
      name: string;
    };
  };
  level: string;
};

// تایپ رزومه از بک‌اند
type ResumeType = {
  id: number;
  years_of_experience?: number;
  headline?: string;
  bio?: string;
  website?: string;
  linkedin_profile?: string;
  experience?: string;
  expected_salary?: string;
  preferred_job_type?: string;
  availability?: string;
  degree?: string;
  gender?: string;
  soldier_status?: string;
};

// تعریف تایپ آگهی رزومه بر اساس API
export type ResumeAdType = {
  id: string;
  title: string;
  status: 'P' | 'A' | 'R';
  description?: string;

  // اطلاعات کاربر از job_seeker_detail
  job_seeker_detail?: {
    id: number;
    full_name: string;
    phone?: string;
    profile_picture?: string;
    user_type: string;
    status: string;
    joined_date: string;
    last_updated: string;
    is_active: boolean;
    is_admin: boolean;
    last_login?: string;
  };

  // اطلاعات مکان از location_detail
  location_detail?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };

  // اطلاعات صنعت از industry_detail
  industry_detail?: {
    id: number;
    name: string;
  };

  // اطلاعات آگهی
  salary?: string;
  job_type?: string;
  degree?: string;
  gender?: string;
  soldier_status?: string;

  // فیلدهای مستقیم
  job_seeker: number;
  resume: number;
  industry: number;
  advertisement: string | {
    id: string;
    subscription?: {
      id: string;
      plan?: {
        name: string;
        price: number;
      };
      subscription_status?: string;
    };
  };
  location: number;

  // تاریخ‌ها
  created_at: string;
  updated_at: string;
};

interface JobSeekerResumeAdCardProps {
  resumeAd: ResumeAdType;
  onUpdate: () => void;
  hideTimeDisplay?: boolean; // برای مخفی کردن نمایش زمان در داشبورد
}

// تابع پردازش URL تصویر پروفایل
const processProfilePicture = (profilePicture?: string): string => {
  if (!profilePicture) {
    // اگر تصویر پروفایل وجود نداشت، رشته خالی برگردان
    return '';
  }

  // اگر URL کامل باشد (با http یا https شروع شود)، همان را برگردان
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }

  // اگر URL نسبی باشد، آن را به URL کامل تبدیل کن
  if (profilePicture.startsWith('/')) {
    // اگر با / شروع شود، آن را به URL کامل تبدیل کن
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${profilePicture}`;
  }

  // در غیر این صورت، فرض می‌کنیم که مسیر نسبی به دایرکتوری media است
  return `${process.env.NEXT_PUBLIC_API_URL || ''}/media/${profilePicture}`;
};

// تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
const convertToFarsiNumber = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (match) => persianDigits[parseInt(match)]);
};

// تابع کمکی برای محاسبه روزهای باقی‌مانده
const getRemainingDays = (resumeAd: any): number | null => {
  if (resumeAd.status !== 'A') return null; // فقط برای آگهی‌های تایید شده
  
  const endDate = resumeAd.subscription_detail?.end_date;
  if (!endDate) return null;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

// تابع کمکی برای نمایش مدت زمان باقی‌مانده
const getRemainingDaysText = (resumeAd: any): string => {
  const remainingDays = getRemainingDays(resumeAd);
  if (remainingDays === null) return '';
  if (remainingDays === 0) return 'امروز پایان می‌یابد';
  if (remainingDays === 1) return 'فردا پایان می‌یابد';
  return `${convertToFarsiNumber(remainingDays)} روز باقی‌مانده`;
};


// تابع تبدیل مهارت‌های API به آرایه رشته
const convertSkillsToStringArray = (skills: SkillType[], availableSkills: any[] = []): string[] => {
  return skills.map(skill => {
    if (typeof skill.skill === 'object' && skill.skill?.name) {
      return skill.skill.name;
    } else if (typeof skill.skill === 'number') {
      // اگر skill یک ID است، از availableSkills نام را پیدا کن
      const foundSkill = availableSkills.find(s => s.id === skill.skill);
      return foundSkill?.name || 'مهارت نامشخص';
    }
    return 'مهارت نامشخص';
  });
};

export default function JobSeekerResumeAdCard({ resumeAd, onUpdate, hideTimeDisplay = false }: JobSeekerResumeAdCardProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [skills, setSkills] = useState<string[]>([]);
  const [resume, setResume] = useState<ResumeType | undefined>();
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // دریافت مهارت‌ها و رزومه کاربر از API
  useEffect(() => {
    // اگر در صفحه اصلی هستیم (صفحه هوم)، نیازی به دریافت اطلاعات API نیست
    // تشخیص صفحه اصلی با وجود resumeAd.advertisement به صورت آبجکت
    if (resumeAd.advertisement && typeof resumeAd.advertisement === 'object') {
      // در حالت نمایش در صفحه اصلی هستیم - بدون درخواست API
      setLoading(false);
      // مهارت‌های فیک برای صفحه اصلی - بر اساس صنعت و عنوان شغلی
      if (resumeAd.industry_detail?.name === 'طراحی و هنر') {
        setSkills(['Photoshop', 'Illustrator', 'UI/UX', 'Figma', 'Adobe XD']);
      } else if (resumeAd.industry_detail?.name === 'تبلیغات و بازاریابی') {
        setSkills(['SEO', 'Google Ads', 'Content Marketing', 'Social Media', 'Analytics']);
      } else if (resumeAd.title?.includes('بک‌اند')) {
        setSkills(['Node.js', 'Express', 'MongoDB', 'SQL', 'REST API']);
      } else if (resumeAd.title?.includes('DevOps')) {
        setSkills(['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux']);
      } else if (resumeAd.title?.includes('محصول')) {
        setSkills(['Agile', 'Scrum', 'Product Strategy', 'User Research', 'Roadmap']);
      } else {
        // پیش‌فرض برای توسعه‌دهنده فرانت‌اند
        setSkills(['React', 'Next.js', 'TypeScript', 'JavaScript', 'Material UI']);
      }
      return;
    }
    


    const fetchData = async () => {
      try {
        const [skillsResponse, resumeResponse, availableSkillsResponse] = await Promise.all([
          apiGet('/resumes/skills/'),
          apiGet('/resumes/resumes/'),
          apiGet('/industries/skills/')
        ]);

        // پردازش مهارت‌ها با availableSkills
        const skillsData = skillsResponse.data as SkillType[];
        const availableSkills = Array.isArray(availableSkillsResponse.data) ? availableSkillsResponse.data : [];
        const skillNames = convertSkillsToStringArray(skillsData, availableSkills);
        setSkills(skillNames);

        // پردازش رزومه
        const resumesData = Array.isArray(resumeResponse.data) ? resumeResponse.data : [];
        if (resumesData.length > 0) {
          setResume(resumesData[0] as ResumeType);
        }

      } catch (error) {
        console.error('خطا در دریافت اطلاعات:', error);
        setSkills([]); // در صورت خطا، مهارت‌ها خالی باشد
        setResume(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resumeAd.advertisement]);

  // تابع کلیک بر روی دکمه مشاهده آگهی
  const handleViewAd = () => {
    if (isAuthenticated) {
      // اگر کاربر وارد شده باشد، به صفحه جزئیات آگهی برو
      router.push(`/jobseeker/resume-ads/${resumeAd.id}`);
    } else {
      // اگر کاربر وارد نشده باشد، مدال لاگین را نمایش بده
      setLoginModalOpen(true);
    }
  };
  
  // بستن مدال
  const handleCloseModal = () => {
    setLoginModalOpen(false);
  };

  // نمایش فقط 3 مهارت اول
  const topSkills = skills.slice(0, 3);

  // فقط وقتی اسکلتون را نمایش بده که در صفحه اصلی نباشیم (به عنوان کارت معمولی)
  if (loading && typeof resumeAd.advertisement !== 'object') {
    return <ResumeAdCardSkeleton />;
  }

  return (
    <>
      <Card
        sx={{
          borderRadius: { xs: 1.5, sm: 2 },
          border: `1px solid ${jobSeekerColors.bgLight}`,
          boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
          }
        }}
      >
        <CardContent sx={{
          p: { xs: 1.5, sm: 2 },
          pb: { xs: "6px !important", sm: "8px !important" },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexGrow: 1
        }}>
          {/* هدر کارت - آواتار و نام */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 0.5, sm: 0.8 },
            minHeight: { xs: 40, sm: 45, md: 50 },
            py: { xs: 0.3, sm: 0.5 },
            pb: 0
          }}>
            <Box sx={{ position: 'relative', mr: { xs: 1, sm: 1.5 } }}>
              <Avatar
                src={processProfilePicture(resumeAd.job_seeker_detail?.profile_picture)}
                alt={resumeAd.job_seeker_detail?.full_name || ''}
                sx={{
                  width: { xs: 45, sm: 55 },
                  height: { xs: 45, sm: 55 },
                  border: 'none',
                  bgcolor: jobSeekerColors.primary,
                  color: 'white',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                  fontWeight: 'bold',
                }}
              >
                {resumeAd.job_seeker_detail?.profile_picture ? 
                  (resumeAd.job_seeker_detail.full_name ? resumeAd.job_seeker_detail.full_name.charAt(0).toUpperCase() : '') :
                  <PersonIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                }
              </Avatar>
              
              {/* نشان وضعیت آگهی روی آواتار حذف شد */}
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  mb: { xs: 0.3, sm: 0.4 },
                  lineHeight: 1.3
                }}>
                  {resumeAd.job_seeker_detail?.full_name || 'کاربر ماهرکار'}
                </Typography>
                
                {/* وضعیت آگهی از این پس در بخش جداگانه زیر هدر نمایش داده می‌شود */}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                lineHeight: 1.3,
                mt: { xs: 0.1, sm: 0.2 }
              }}>
                {resumeAd.title}
              </Typography>
            </Box>
          </Box>



          {/* خط سرتاسری زیر هدر */}
          <Box sx={{
            position: 'relative',
            mt: { xs: 0.1, sm: 0.2 },
            mb: { xs: 0.5, sm: 0.6 },
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
            mb: { xs: 0.5, sm: 0.8 },
            p: 0,
            pb: { xs: 0.5, sm: 0.8 },
            bgcolor: theme.palette.background.paper,
            border: 'none',
            borderRadius: 1.5,
            fontSize: { xs: '0.75rem', sm: '0.8rem' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.2, sm: 0.3 }, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: { xs: 22, sm: 24 },
                  height: { xs: 22, sm: 24 },
                  borderRadius: '50%',
                  backgroundColor: `rgba(0, 112, 60, 0.1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 0
                }}>
                  <LocationOnOutlinedIcon fontSize="small" sx={{
                    color: jobSeekerColors.primary,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  mr: 0,
                  ml: { xs: 1.2, sm: 1.5 }
                }}>
                  {resumeAd.location_detail?.name || 'موقعیت نامشخص'}
                </Typography>
              </Box>
              
              {/* نمایش وضعیت آگهی در کنار فیلد شهر */}
              {resumeAd.status !== 'A' && (
                <Chip
                  label={resumeAd.status === 'P' ? 'در انتظار تایید' : 'رد شده'}
                  size="small"
                  sx={{
                    bgcolor: resumeAd.status === 'P' ? 'warning.main' : 'error.main',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 22 },
                    '& .MuiChip-label': {
                      px: { xs: 0.8, sm: 1 }
                    }
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.5 } }}>
              <Box sx={{
                width: { xs: 22, sm: 24 },
                height: { xs: 22, sm: 24 },
                borderRadius: '50%',
                backgroundColor: `rgba(0, 112, 60, 0.1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0
              }}>
                <WorkOutlineIcon fontSize="small" sx={{
                  color: jobSeekerColors.primary,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }} />
              </Box>
                             <Typography variant="body2" color="text.secondary" sx={{
                 fontSize: { xs: '0.8rem', sm: '0.85rem' },
                 mr: 0,
                 ml: { xs: 1.2, sm: 1.5 }
               }}>
                 {getJobTypeText(resumeAd.job_type) || getJobTypeText(resume?.preferred_job_type) || "تمام وقت"}
               </Typography>
            </Box>

                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
               <Box sx={{
                 width: { xs: 22, sm: 24 },
                 height: { xs: 22, sm: 24 },
                 borderRadius: '50%',
                 backgroundColor: `rgba(0, 112, 60, 0.1)`,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 ml: 0
               }}>
                 <HistoryIcon fontSize="small" sx={{
                   color: jobSeekerColors.primary,
                   fontSize: { xs: '0.8rem', sm: '0.9rem' }
                 }} />
               </Box>
               <Typography variant="body2" color="text.secondary" sx={{
                 fontSize: { xs: '0.8rem', sm: '0.85rem' },
                 mr: 0,
                 ml: { xs: 1.2, sm: 1.5 }
               }}>
                 {typeof resumeAd.advertisement === 'object' 
                   ? `${convertToFarsiNumber(5)} سال سابقه` 
                   : resume?.years_of_experience 
                     ? `${convertToFarsiNumber(resume.years_of_experience)} سال سابقه`
                     : `${convertToFarsiNumber(3)} سال سابقه`
                 }
               </Typography>
             </Box>

                           {/* مدت زمان باقی‌مانده - برای آگهی‌های تایید شده */}
              {!hideTimeDisplay && (
                resumeAd.status === 'A' && getRemainingDaysText(resumeAd) ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 0.2, sm: 0.3 } }}>
                    <Box sx={{
                      width: { xs: 22, sm: 24 },
                      height: { xs: 22, sm: 24 },
                      borderRadius: '50%',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 0
                    }}>
                      <TimerIcon fontSize="small" sx={{
                        color: getRemainingDays(resumeAd) === 0 ? '#F44336' : '#4CAF50',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{
                      color: getRemainingDays(resumeAd) === 0 ? '#F44336' : '#4CAF50',
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      mr: 0,
                      ml: { xs: 1.2, sm: 1.5 },
                      fontWeight: getRemainingDays(resumeAd) === 0 ? 600 : 400,
                    }}>
                      {getRemainingDaysText(resumeAd)}
                    </Typography>
                  </Box>
                ) : (
                  // پیام برای کارت‌های تایید نشده
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 0.2, sm: 0.3 } }}>
                    <Box sx={{
                      width: { xs: 22, sm: 24 },
                      height: { xs: 22, sm: 24 },
                      borderRadius: '50%',
                      backgroundColor: 'rgba(158, 158, 158, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 0
                    }}>
                      <TimerIcon fontSize="small" sx={{
                        color: '#9E9E9E',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{
                      color: '#9E9E9E',
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      mr: 0,
                      ml: { xs: 1.2, sm: 1.5 },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      بعد از تایید محاسبه می‌شود
                    </Typography>
                  </Box>
                )
              )}
          </Box>

          {/* مهارت‌ها */}
          <Box sx={{ mb: { xs: 0.8, sm: 1.2 }, height: '60px' }}>
            <Typography variant="body2" sx={{
              mb: { xs: 0.2, sm: 0.3 },
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.8rem', sm: '0.85rem' }
            }}>
              مهارت‌های کلیدی:
            </Typography>
            <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.2} sx={{ minHeight: '24px' }}>
              {topSkills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: `rgba(0, 112, 60, 0.08)`,
                    border: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    borderRadius: 1,
                    color: jobSeekerColors.primary,
                    py: 0,
                    px: 0,
                    m: 0.1,
                    height: { xs: '16px', sm: '18px' },
                    '& .MuiChip-label': {
                      px: { xs: 0.6, sm: 0.8 }
                    }
                  }}
                />
              ))}
              {skills.length > 3 && (
                <Chip
                  label={`+${convertToFarsiNumber(skills.length - 3)}`}
                  size="small"
                  sx={{
                    bgcolor: `rgba(0, 112, 60, 0.08)`,
                    border: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    borderRadius: 1,
                    color: jobSeekerColors.primary,
                    py: 0,
                    px: 0,
                    m: 0.1,
                    height: { xs: '16px', sm: '18px' },
                    '& .MuiChip-label': {
                      px: { xs: 0.6, sm: 0.8 }
                    }
                  }}
                />
              )}
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
            <Typography variant="body2" sx={{
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              color: jobSeekerColors.primary,
              fontWeight: 500
            }}>
              <Box component="span" sx={{ fontWeight: 600 }}>حقوق درخواستی:</Box> {
                getSalaryText(resumeAd.salary || resume?.expected_salary)
              }
            </Typography>
          </Box>
          


          {/* فضای خالی بین محتوا و دکمه */}
          <Box sx={{ flexGrow: 1 }} />

          {/* دکمه مشاهده آگهی */}
          <Box sx={{ pt: { xs: 0.3, sm: 0.5 }, pb: { xs: 1, sm: 1.2, md: 1.5 } }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleViewAd}
              sx={{
                py: { xs: 0.6, sm: 0.8, md: 1 },
                fontWeight: 'bold',
                borderRadius: 1.5,
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
                boxShadow: `0 3px 6px rgba(0, 112, 60, 0.2)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                  boxShadow: `0 3px 8px rgba(0, 112, 60, 0.3)`,
                }
              }}
            >
              مشاهده آگهی
            </Button>
          </Box>
          {/* نمایش نوع اشتراک */}
          {(() => {
            // بررسی subscription_detail از API واقعی
            const subscriptionDetail = (resumeAd as any).subscription_detail;
            const planName = subscriptionDetail?.plan?.name?.toLowerCase();
            
            // بررسی advertisement.subscription برای داده‌های فیک صفحه اصلی
            const adSubscription = typeof resumeAd.advertisement === 'object' ? resumeAd.advertisement.subscription : null;
            const adPlanName = adSubscription?.plan?.name?.toLowerCase();
            
            // تعیین نوع اشتراک
            let subscriptionType = '';
            let bgColor = '#4CAF50';
            
            if (planName) {
              if (planName === 'نردبان' || planName === 'ladder') {
                subscriptionType = 'نردبان';
                bgColor = '#E53935';
              } else if (planName === 'فوری' || planName === 'urgent') {
                subscriptionType = 'فوری';
                bgColor = '#FF9800';
              } else if (planName !== 'پایه' && planName !== 'basic') {
                subscriptionType = planName;
                bgColor = '#4CAF50';
              }
            } else if (adPlanName) {
              if (adPlanName === 'نردبان' || adPlanName === 'ladder') {
                subscriptionType = 'نردبان';
                bgColor = '#E53935';
              } else if (adPlanName === 'فوری' || adPlanName === 'urgent') {
                subscriptionType = 'فوری';
                bgColor = '#FF9800';
              } else if (adPlanName !== 'پایه' && adPlanName !== 'basic') {
                subscriptionType = adPlanName;
                bgColor = '#4CAF50';
              }
            }
            
            // فقط اگر نوع اشتراک غیر از پایه باشد نمایش بده
            return subscriptionType && subscriptionType !== 'پایه' && subscriptionType !== 'basic' ? (
              <Box sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: bgColor,
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                px: 1.5,
                py: 0.5,
                borderRadius: 0.5,
                zIndex: 10,
                minWidth: '45px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                textAlign: 'center',
                pointerEvents: 'none',
                transform: 'none !important',
                transition: 'none !important'
              }}>
                {subscriptionType}
              </Box>
            ) : null;
          })()}

          

        </CardContent>
      </Card>
      
      {/* استفاده از کامپوننت مدال احراز هویت با تم کارجو */}
      <AuthRequiredModal
        open={loginModalOpen}
        onClose={handleCloseModal}
        redirectUrl={`/jobseeker/resume-ads/${resumeAd.id}`}
        title="نیاز به ورود به حساب کاربری"
        message="برای مشاهده جزئیات این آگهی رزومه، لازم است وارد حساب کاربری خود شوید."
        submessage="پس از ورود، می‌توانید به تمامی جزئیات آگهی دسترسی داشته باشید."
        themeType="jobSeeker"
      />
    </>
  );
}
