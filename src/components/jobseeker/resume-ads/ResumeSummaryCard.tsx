import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Box,
  Chip,
  Button
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import { GENDER_CHOICES, DEGREE_CHOICES, JOB_TYPE_CHOICES, SALARY_CHOICES } from '@/types';
import { JOB_SEEKER_THEME } from '@/constants/colors';

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

// تابع تبدیل نوع شغل به فارسی
const getJobTypeText = (jobType: string): string => {
  const jobTypeMap: { [key: string]: string } = {
    'Full-Time': 'تمام وقت',
    'Part-Time': 'پاره وقت',
    'Remote': 'دورکاری',
    'Internship': 'کارآموزی'
  };
  return jobTypeMap[jobType] || jobType;
};

// تابع تبدیل حقوق به فارسی
const getSalaryText = (salary: string): string => {
  const salaryMap: { [key: string]: string } = {
    '5 to 10': '۵ تا ۱۰ میلیون تومان',
    '10 to 15': '۱۰ تا ۱۵ میلیون تومان',
    '15 to 20': '۱۵ تا ۲۰ میلیون تومان',
    '20 to 30': '۲۰ تا ۳۰ میلیون تومان',
    '30 to 50': '۳۰ تا ۵۰ میلیون تومان',
    'More than 50': 'بیش از ۵۰ میلیون تومان',
    'Negotiable': 'توافقی'
  };
  return salaryMap[salary] || salary;
};

// تابع تبدیل اعداد انگلیسی به فارسی
const toPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
};

// تابع تبدیل وضعیت دسترسی به فارسی
const getAvailabilityText = (availability: string): string => {
  const availabilityMap: { [key: string]: string } = {
    'immediately': 'فوری',
    'with_notice': 'با اطلاع',
    'not_available': 'غیرقابل دسترسی'
  };
  return availabilityMap[availability] || availability;
};

// نوع مینیمال رزومه (مثل همان MinimalResume در CreateResumeAdForm)
export interface ResumeSummary {
  id: string;
  headline?: string | null;
  industry?: { id: number; name: string } | null;
  location?: { id: number; name: string; province?: { id: number; name: string } } | null;
  // فیلدهای اضافی اختیاری برای توسعهٔ آینده
  avatar_url?: string | null;
  experience_years?: number | null;
  expected_salary?: keyof typeof SALARY_CHOICES | null;
  preferred_job_type?: keyof typeof JOB_TYPE_CHOICES | null;
  gender?: keyof typeof GENDER_CHOICES | null;
  degree?: keyof typeof DEGREE_CHOICES | null;
  educations?: any[];
  experiences?: any[];
  skills?: any[];
  bio?: string | null; // Added bio field
  website?: string | null;
  linkedin_profile?: string | null;
  availability?: string | null; // Added availability field
}

interface ResumeSummaryCardProps {
  resume: ResumeSummary;
  onEdit?: () => void;
}

export default function ResumeSummaryCard({ resume, onEdit }: ResumeSummaryCardProps) {
  const colors = JOB_SEEKER_THEME;

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${colors.primary}33`,
        borderRadius: 2,
        mb: 3,
        p: 1.5,
        backgroundColor: 'background.paper'
      }}
    >
      <CardHeader
        avatar={<Avatar src={resume.avatar_url ?? undefined}>{resume.headline?.[0] ?? 'CV'}</Avatar>}
        title={
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: colors.primary }}>
            {resume.headline || 'بدون عنوان'}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {resume.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="caption">
                  {resume.location.province?.name && `${resume.location.province.name} - `}
                  {resume.location.name}
                </Typography>
              </Box>
            )}
            {resume.industry && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon fontSize="small" color="action" />
                <Typography variant="caption">{resume.industry.name}</Typography>
              </Box>
            )}
          </Box>
        }
      />

      {/* توضیحات رزومه */}
      {resume.bio && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
            {resume.bio}
          </Typography>
        </Box>
      )}

      {/* در آینده می‌توان اطلاعات بیشتری اضافه کرد */}
      <CardContent sx={{ pt: 0, pb: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {resume.gender && (
            <Chip
              icon={<PeopleIcon fontSize="small" />}
              label={GENDER_CHOICES[resume.gender]}
              size="small"
            />
          )}
          {resume.degree && (
            <Chip
              icon={<SchoolIcon fontSize="small" />}
              label={getDegreeText(resume.degree)}
              size="small"
            />
          )}
          {resume.preferred_job_type && (
            <Chip
              icon={<WorkIcon fontSize="small" />}
              label={getJobTypeText(resume.preferred_job_type)}
              size="small"
            />
          )}
          {resume.expected_salary && (
            <Chip
              icon={<AttachMoneyIcon fontSize="small" />}
              label={getSalaryText(resume.expected_salary)}
              size="small"
            />
          )}
          {typeof resume.experience_years === 'number' && resume.experience_years >=0 && (
            <Chip
              icon={<WorkIcon fontSize="small" />}
              label={`سابقه: ${toPersianNumbers(resume.experience_years)} سال`}
              size="small"
            />
          )}
          {resume.availability && (
            <Chip
              icon={<WorkIcon fontSize="small" />}
              label={getAvailabilityText(resume.availability)}
              size="small"
            />
          )}
        </Box>

        {/* تحصیلات */}
        {resume.educations && resume.educations.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.primary, mb: 1 }}>
              تحصیلات:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {resume.educations.slice(0, 3).map((edu: any, index: number) => (
                <Chip
                  key={index}
                  label={`${getDegreeText(edu.degree || '')} ${edu.field_of_study || ''}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {resume.educations.length > 3 && (
                <Chip
                  label={`+${toPersianNumbers(resume.educations.length - 3)} مورد دیگر`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* تجربیات کاری */}
        {resume.experiences && resume.experiences.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.primary, mb: 1 }}>
              تجربیات کاری:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {resume.experiences.slice(0, 3).map((exp: any, index: number) => (
                <Chip
                  key={index}
                  label={`${exp.title || ''} در ${exp.company || ''}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {resume.experiences.length > 3 && (
                <Chip
                  label={`+${toPersianNumbers(resume.experiences.length - 3)} مورد دیگر`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* مهارت‌ها */}
        {resume.skills && resume.skills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.primary, mb: 1 }}>
              مهارت‌ها:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {resume.skills.slice(0, 6).map((skill: any, index: number) => (
                <Chip
                  key={index}
                  label={skill.skill?.name || skill.skill || 'نامشخص'}
                  size="small"
                  sx={{ 
                    bgcolor: `${colors.primary}22`, 
                    color: colors.primary, 
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              ))}
              {resume.skills.length > 6 && (
                <Chip
                  label={`+${toPersianNumbers(resume.skills.length - 6)} مهارت دیگر`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>

      {onEdit && (
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Button variant="outlined" size="small" onClick={onEdit}>
            ویرایش رزومه
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
