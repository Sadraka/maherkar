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

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumber = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (match) => persianDigits[parseInt(match)]);
};

// تابع برای تبدیل اعداد حقوق به فارسی
const convertSalaryToPersian = (salary: string): string => {
  return salary.replace(/\d+/g, (match) => {
    return match.replace(/\d/g, (digit) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(digit)]);
  });
};

export type ExpertType = {
  id: number;
  // اطلاعات پایه کاربر
  name: string; // از user.full_name
  username: string; // از user.username
  email?: string; // از user.email
  phone?: string; // از user.phone

  // اطلاعات پروفایل
  jobTitle: string; // از profile.headline یا job_seeker_profile.headline
  avatar: string; // از profile.profile_picture
  bio?: string; // از profile.bio

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

  // نمایش فقط 3 مهارت اول
  const topSkills = expert.skills.slice(0, 3);

  return (
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
          pb: { xs: 0.5, sm: 0.8 }
        }}>
          <Box sx={{ position: 'relative', mr: { xs: 1, sm: 1.5 } }}>
            <Avatar
              src={expert.avatar}
              alt={expert.name}
              sx={{
                width: { xs: 45, sm: 55 },
                height: { xs: 45, sm: 55 },
                border: 'none',
              }}
            />
          </Box>
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              mb: { xs: 0.1, sm: 0.2 },
              lineHeight: 1.2
            }}>
              {expert.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              lineHeight: 1.2
            }}>
              {expert.jobTitle}
            </Typography>
          </Box>
        </Box>

        {/* حذف Divider اضافی و نگه داشتن فقط یک خط */}
        <Divider sx={{
          mt: { xs: 0.2, sm: 0.4 },
          mb: { xs: 0.8, sm: 1 },
          borderColor: jobSeekerColors.bgLight,
          width: '100%' // خط سرتاسری
        }} />

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
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
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
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
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
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
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
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
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
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
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
              <Typography variant="body2" sx={{
                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                color: theme.palette.text.secondary,
                mt: 0.2
              }}>
                +{convertToPersianNumber(expert.skills.length - 3)} مهارت دیگر
              </Typography>
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
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              color: jobSeekerColors.primary,
              fontWeight: 500
            }}>
              <Box component="span" sx={{ fontWeight: 600 }}>حقوق درخواستی:</Box> {convertSalaryToPersian(expert.expectedSalary)}
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
            sx={{
              py: { xs: 0.6, sm: 0.8, md: 1 },
              fontWeight: 'bold',
              borderRadius: 1.5,
              fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
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
  );
} 