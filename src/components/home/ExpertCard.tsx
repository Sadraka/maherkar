'use client'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Button,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import HistoryIcon from '@mui/icons-material/History';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredModal from '../common/AuthRequiredModal';

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumber = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (match) => persianDigits[parseInt(match)]);
};

// تابع برای تبدیل اعداد حقوق به فارسی و اصلاح فرمت
const convertSalaryToPersian = (salary: string): string => {
  if (!salary) return '';
  
  // اگر توافقی باشد
  if (salary === 'Negotiable' || salary === 'توافقی') return 'توافقی';
  
  // اگر بیش از 50 میلیون باشد
  if (salary === 'More than 50' || salary.includes('More than')) {
    return 'بیش از ۵۰ میلیون تومان';
  }
  
  // تبدیل "30 to 50" به "۳۰ تا ۵۰ میلیون تومان"
  return salary
    .replace(/\s+to\s+/g, ' تا ')
    .replace(/\d+/g, (match) => {
      return match.replace(/\d/g, (digit) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(digit)]);
    });
};

export type ExpertType = {
  id: number;
  resumeId?: number; // شناسه رزومه برای لینک مشاهده رزومه
  // اطلاعات پایه کاربر
  name: string; // از user.full_name
  username: string; // از user.username
  email?: string; // از user.email
  phone?: string; // از user.phone

  // اطلاعات پروفایل
  jobTitle: string; // از profile.headline یا job_seeker_profile.headline
  title?: string; // عنوان آگهی رزومه
  avatar: string; // از profile.profile_picture
  bio?: string; // از profile.bio
  status?: 'P' | 'A' | 'R'; // وضعیت آگهی (P: در انتظار، A: تایید شده، R: رد شده)

  // اطلاعات مکان
  location: string; // از profile.location (City)

  // اطلاعات رزومه
  skills: string[]; // از JobSeekerSkill های مرتبط با resume
  isVerified: boolean; // از user.id_card_info.id_card_status === 'V'
  industry?: string; // از resume.industry
  experienceYears?: number; // از resume.years_of_experience
  preferredJobType?: string; // از resume.preferred_job_type
  expectedSalary?: string; // از resume.expected_salary

  // اطلاعات تکمیلی
  degree?: string; // از resume.degree
  gender?: string; // از resume.gender
  soldierStatus?: string; // از resume.soldier_status
  website?: string; // از resume.website
  linkedinProfile?: string; // از resume.linkedin_profile
  availability?: string; // از resume.availability
  experience?: string; // از resume.experience (سابقه کاری به صورت متنی)

  // زمان‌ها
  createdAt?: string; // از resume.created_at
  updatedAt?: string; // از resume.updated_at
};

interface ExpertCardProps {
  expert: ExpertType;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // وضعیت نمایش مدال
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // نمایش فقط 3 مهارت اول
  const topSkills = expert.skills.slice(0, 3);
  
  // تابع کلیک بر روی دکمه مشاهده رزومه
  const handleViewResume = () => {
    if (isAuthenticated) {
      // اگر کاربر وارد شده باشد، به صفحه رزومه برو
      // استفاده از resumeId اگر موجود باشد، در غیر این صورت از id استفاده کن
      const resumeIdToUse = expert.resumeId || expert.id;
      router.push(`/resume/${resumeIdToUse}`);
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
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 1.5, sm: 2 },
          border: `1px solid ${jobSeekerColors.bgLight}`,
          boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          width: { xs: '100%', sm: '100%', md: '100%' },
          mx: 'auto',
          height: '100%', // مثل JobCard
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
          height: '100%'
        }}>
          {/* هدر کارت - آواتار و نام */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 1, sm: 1.5 },
            minHeight: { xs: 40, sm: 45, md: 50 },  // همانند JobCard
            py: { xs: 0.5, sm: 0.8 }, // اضافه کردن پدینگ بالا و پایین یکسان
            pb: 0
          }}>
            <Box sx={{ position: 'relative', mr: { xs: 1, sm: 1.5 } }}>
              <Avatar
                src={expert.avatar}
                alt={expert.name}
                sx={{
                  width: { xs: 45, sm: 55 },
                  height: { xs: 45, sm: 55 },
                  border: 'none',
                  bgcolor: jobSeekerColors.primary, // رنگ پس‌زمینه برای آواتارهای بدون عکس
                  color: 'white', // رنگ متن برای آواتارهای بدون عکس
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                  fontWeight: 'bold',
                }}
              >
                {expert.name ? expert.name.charAt(0).toUpperCase() : ''}
              </Avatar>
              {/* نمایش وضعیت آگهی (فقط اگر در انتظار تایید یا رد شده باشد) */}
              {expert.status && expert.status !== 'A' && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: expert.status === 'P' ? 'warning.main' : 'error.main',
                    border: '1px solid white',
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  mb: { xs: 0.3, sm: 0.4 },
                  lineHeight: 1.3
                }}>
                  {expert.name}
                </Typography>
                {/* نمایش وضعیت آگهی با متن (فقط اگر در انتظار تایید یا رد شده باشد) */}
                {expert.status && expert.status !== 'A' && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: 'white',
                      bgcolor: expert.status === 'P' ? 'warning.main' : 'error.main',
                      borderRadius: 1,
                      px: 0.5,
                      py: 0.1,
                    }}
                  >
                    {expert.status === 'P' ? 'در انتظار تایید' : 'رد شده'}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                lineHeight: 1.3,
                mt: { xs: 0.1, sm: 0.2 }
              }}>
                {expert.title || expert.jobTitle}
              </Typography>
            </Box>
          </Box>

          {/* خط سرتاسری زیر هدر */}
          <Box sx={{
            position: 'relative',
            mt: { xs: 0.2, sm: 0.4 },
            mb: { xs: 0.8, sm: 1 },
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
            mb: { xs: 0.8, sm: 1 },
            p: 0,
            pb: { xs: 0.8, sm: 1 },
            bgcolor: theme.palette.background.paper, // پس‌زمینه سفید
            border: 'none', // حذف بوردر
            borderRadius: 1.5,
            fontSize: { xs: '0.75rem', sm: '0.8rem' }
          }}>
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
                {expert.location}
              </Typography>
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
                {expert.preferredJobType || "تمام وقت"}
              </Typography>
            </Box>

            {expert.experienceYears && (
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
                  {convertToPersianNumber(expert.experienceYears)} سال سابقه
                </Typography>
              </Box>
            )}
          </Box>

          {/* مهارت‌ها */}
          <Box sx={{ mb: { xs: 0.8, sm: 1.2 } }}>
            <Typography variant="body2" sx={{
              mb: { xs: 0.2, sm: 0.3 },
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.8rem', sm: '0.85rem' }
            }}>
              مهارت‌های کلیدی:
            </Typography>
            <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.2}>
              {topSkills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: `rgba(0, 112, 60, 0.08)`, // پس‌زمینه سبز کم‌رنگ
                    border: 'none', // حذف بوردر
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
              {expert.skills.length > 3 && (
                <Chip
                  label={`+${convertToPersianNumber(expert.skills.length - 3)}`}
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
            bgcolor: `rgba(0, 112, 60, 0.04)`, // پس‌زمینه خیلی کم‌رنگ
            borderRadius: 1.5,
            border: 'none', // حذف بوردر
            mb: { xs: 0.8, sm: 1 }
          }}>
            {expert.expectedSalary && (
              <Typography variant="body2" sx={{
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                color: jobSeekerColors.primary,
                fontWeight: 500
              }}>
                <Box component="span" sx={{ fontWeight: 600 }}>حقوق درخواستی:</Box> {
                  expert.expectedSalary === 'توافقی' || expert.expectedSalary === 'Negotiable' ? 'توافقی' : convertSalaryToPersian(expert.expectedSalary)
                }
              </Typography>
            )}
          </Box>

          {/* فضای خالی بین محتوا و دکمه */}
          <Box sx={{ flexGrow: 1 }} />

          {/* دکمه مشاهده رزومه */}
          <Box sx={{ pt: { xs: 0.3, sm: 0.5 }, pb: { xs: 1, sm: 1.2, md: 1.5 } }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleViewResume}
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
              مشاهده رزومه
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* استفاده از کامپوننت مدال احراز هویت با تم کارجو */}
      <AuthRequiredModal
        open={loginModalOpen}
        onClose={handleCloseModal}
        redirectUrl={`/resume/${expert.resumeId || expert.id}`}
        title="نیاز به ورود به حساب کاربری"
        message="برای مشاهده رزومه کامل این متخصص، لازم است وارد حساب کاربری خود شوید."
        submessage="پس از ورود، می‌توانید به تمامی جزئیات رزومه دسترسی داشته باشید."
        themeType="jobSeeker"
      />
    </>
  );
} 