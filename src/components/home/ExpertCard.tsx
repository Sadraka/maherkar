'use client'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  Stack,
  Button,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
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

  // تابع تبدیل تاریخ به عبارت "چند ساعت/دقیقه پیش"
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHrs > 24) {
      return `${convertToPersianNumber(Math.floor(diffHrs / 24))} روز پیش`;
    }
    if (diffHrs > 0) {
      return `${convertToPersianNumber(diffHrs)} ساعت پیش`;
    }
    return `${convertToPersianNumber(diffMins)} دقیقه پیش`;
  };

  return (
    <Card
      sx={{
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${jobSeekerColors.bgLight}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        width: { xs: '100%', sm: '270px' },
        mx: 'auto',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ p: 2.5, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1.5, position: 'relative' }}>
          <Box sx={{ position: 'relative', mb: 1 }}>
            <Avatar
              src={expert.avatar}
              alt={expert.name}
              sx={{
                width: 80,
                height: 80,
                border: 'none',
                boxShadow: 'none'
              }}
            />

            {expert.isVerified && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: jobSeekerColors.primary,
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid white',
                  boxShadow: 'none',
                  zIndex: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: 'none',
                  }
                }}
              >
                <CheckIcon sx={{ fontSize: '1rem' }} />
              </Box>
            )}
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 0.3 }}>
              {expert.name}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.7, fontSize: '0.9rem' }}>
              {expert.jobTitle}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1, borderColor: jobSeekerColors.bgLight }} />

        <Box sx={{ mb: 1.5, p: 1.5, bgcolor: jobSeekerColors.bgVeryLight, borderRadius: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
            <LocationOnOutlinedIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '1rem', ml: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {expert.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
            <WorkOutlineIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '1rem', ml: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {expert.preferredJobType || "تمام وقت"}
            </Typography>
          </Box>

          {expert.experienceYears && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '1rem', ml: 0.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                {convertToPersianNumber(expert.experienceYears)} سال سابقه
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.9rem' }}>
            مهارت‌ها:
          </Typography>
          <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.2}>
            {expert.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 128, 0, 0.1)',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  borderRadius: 1,
                  color: jobSeekerColors.primary,
                  py: 0.2,
                  px: 0.2,
                  m: 0.2,
                  height: '20px',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ mb: 1, p: 1.5, bgcolor: 'rgba(0, 128, 0, 0.05)', borderRadius: 1.5, border: `1px dashed ${jobSeekerColors.bgLight}` }}>
          {expert.expectedSalary && (
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: jobSeekerColors.primary, fontWeight: 500 }}>
              <Box component="span" sx={{ fontWeight: 600 }}>حقوق درخواستی:</Box> {expert.expectedSalary}
            </Typography>
          )}
          {expert.degree && (
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: jobSeekerColors.primary, fontWeight: 500, mt: 0.5 }}>
              <Box component="span" sx={{ fontWeight: 600 }}>تحصیلات:</Box> {expert.degree}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1, borderColor: jobSeekerColors.bgLight }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1.5 }}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{
              py: 1.2,
              fontWeight: 'bold',
              borderRadius: 1.5,
              fontSize: '0.95rem',
              height: '45px',
              background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
              boxShadow: `0 4px 8px rgba(0, 112, 60, 0.2)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                boxShadow: `0 4px 12px rgba(0, 112, 60, 0.3)`,
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