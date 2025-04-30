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
        borderRadius: 2,
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
      <CardContent sx={{ p: 2, pb: "8px !important", display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* هدر کارت - آواتار و نام */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 1.5,
          minHeight: { xs: 45, sm: 50 },  // همانند JobCard
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
          pb: 0.8
        }}>
          <Box sx={{ position: 'relative', mr: 1.5 }}>
            <Avatar
              src={expert.avatar}
              alt={expert.name}
              sx={{
                width: 55,
                height: 55,
                border: 'none',
              }}
            />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.95rem', mb: 0.2, lineHeight: 1.2 }}>
              {expert.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
              {expert.jobTitle}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 0.8, borderColor: jobSeekerColors.bgLight }} />

        {/* اطلاعات اصلی */}
        <Box sx={{ mb: 1, p: 1, bgcolor: jobSeekerColors.bgVeryLight, borderRadius: 1.5, fontSize: '0.8rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <LocationOnOutlinedIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '0.9rem', ml: 0.3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {expert.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <WorkOutlineIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '0.9rem', ml: 0.3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {expert.preferredJobType || "تمام وقت"}
            </Typography>
          </Box>

          {expert.experienceYears && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '0.9rem', ml: 0.3 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {convertToPersianNumber(expert.experienceYears)} سال سابقه
              </Typography>
            </Box>
          )}
        </Box>

        {/* مهارت‌ها */}
        <Box sx={{ mb: 1.2 }}>
          <Typography variant="body2" sx={{ mb: 0.3, fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
            مهارت‌های کلیدی:
          </Typography>
          <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.2}>
            {topSkills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 128, 0, 0.1)',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  borderRadius: 1,
                  color: jobSeekerColors.primary,
                  py: 0,
                  px: 0,
                  m: 0.1,
                  height: '18px',
                  '& .MuiChip-label': {
                    px: 0.8
                  }
                }}
              />
            ))}
            {expert.skills.length > 3 && (
              <Typography variant="body2" sx={{ fontSize: '0.65rem', color: theme.palette.text.secondary, mt: 0.2 }}>
                +{convertToPersianNumber(expert.skills.length - 3)} مهارت دیگر
              </Typography>
            )}
          </Stack>
        </Box>

        {/* اطلاعات تکمیلی */}
        <Box sx={{
          p: 1,
          bgcolor: 'rgba(0, 128, 0, 0.05)',
          borderRadius: 1.5,
          border: `1px dashed ${jobSeekerColors.bgLight}`,
          mb: 1
        }}>
          {expert.expectedSalary && (
            <Typography variant="body2" sx={{ fontSize: '0.7rem', color: jobSeekerColors.primary, fontWeight: 500 }}>
              <Box component="span" sx={{ fontWeight: 600 }}>حقوق درخواستی:</Box> {expert.expectedSalary}
            </Typography>
          )}
        </Box>

        {/* فضای خالی بین محتوا و دکمه */}
        <Box sx={{ flexGrow: 1 }} />

        {/* دکمه مشاهده رزومه */}
        <Box sx={{ pt: 0.5, pb: { xs: 1.2, sm: 1.5 } }}>  {/* مطابق با استایل JobCard */}
          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{
              py: { xs: 0.8, sm: 1 },  // مطابق با استایل JobCard
              fontWeight: 'bold',
              borderRadius: 1.5,
              fontSize: { xs: '0.85rem', sm: '0.9rem' },  // مطابق با استایل JobCard
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