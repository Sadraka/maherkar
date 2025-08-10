'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  CreditCard as CreditCardIcon,
  Image as ImageIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { ADMIN_THEME, EMPLOYER_THEME } from '@/constants/colors';

// تابع تبدیل تاریخ میلادی به شمسی
const convertToJalali = (gregorianDate: string): string => {
  try {
    const date = new Date(gregorianDate);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (error) {
    return gregorianDate || 'نامشخص';
  }
};

// تابع تبدیل اعداد به فارسی
const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

interface EmployerProfile {
  id: string;
  user: {
    id: string;
    full_name: string;
    phone: string;
    user_type: string;
    joined_date: string;
    last_login?: string;
  };
  personal_info: {
    gender: string;
    age: number;
  };
  location?: {
    id: string;
    name: string;
    province: {
      id: string;
      name: string;
    };
  };
  national_id?: string;
  national_card_front?: string;
  national_card_back?: string;
  verification_status: 'P' | 'A' | 'R';
  verification_date?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  bio?: string;
  verification_status_display: string;
  is_verified: boolean;
  has_complete_documents: boolean;
}

interface EmployerVerificationCardProps {
  employer: EmployerProfile;
  onView: (employer: EmployerProfile) => void;
}

const EmployerVerificationCard: React.FC<EmployerVerificationCardProps> = ({
  employer,
  onView
}) => {
  // وضعیت‌ها با همان استایل جدول (outlined و اندازه کوچک)
  const getStatusChip = (status: string) => {
    const commonSx = { fontWeight: 600, fontSize: '0.8rem' } as const;
    switch (status) {
      case 'P':
        return (
          <Chip
            label="در انتظار بررسی"
            color="warning"
            size="small"
            variant="outlined"
            sx={commonSx}
          />
        );
      case 'A':
        return (
          <Chip
            label="تایید شده"
            color="success"
            size="small"
            variant="outlined"
            sx={commonSx}
          />
        );
      case 'R':
        return (
          <Chip
            label="رد شده"
            color="error"
            size="small"
            variant="outlined"
            sx={commonSx}
          />
        );
      default:
        return (
          <Chip
            label="نامشخص"
            color="default"
            size="small"
            variant="outlined"
            sx={commonSx}
          />
        );
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `2px solid ${ADMIN_THEME.bgLight}`,
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: { xs: '100%', sm: '100%' },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px rgba(0,0,0,0.1)`,
          borderColor: ADMIN_THEME.primary
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        {/* هدر کارت */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 2 } }}>
            <Avatar
              sx={{ 
                width: { xs: 44, sm: 50 },
                height: { xs: 44, sm: 50 },
                bgcolor: EMPLOYER_THEME.primary,
                color: 'white',
                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                fontWeight: 'bold'
              }}
            >
              {employer.user.full_name?.charAt(0) || 'ک'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: ADMIN_THEME.primary, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {employer.user.full_name || 'بدون نام'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <PhoneIcon sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {convertToPersianNumbers(employer.user.phone)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* وضعیت تایید */}
          <Box sx={{ textAlign: 'center' }}>
            {getStatusChip(employer.verification_status)}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* اطلاعات اضافی */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 }, mb: 1 }}>
            <Box sx={{ 
              flex: '1 1 45%',
              minWidth: { xs: '140px', sm: '200px' },
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5 
            }}>
              <CalendarTodayIcon sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                عضویت: {convertToJalali(employer.user.joined_date)}
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: '1 1 45%',
              minWidth: { xs: '140px', sm: '200px' },
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5 
            }}>
              <PersonIcon sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {employer.personal_info.gender === 'M' ? 'آقا' : 'خانوم'} - {convertToPersianNumbers(employer.personal_info.age)} ساله
              </Typography>
            </Box>
          </Box>

          {employer.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {employer.location.name}, {employer.location.province.name}
              </Typography>
            </Box>
          )}
        </Box>

        {/* وضعیت مدارک */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            وضعیت مدارک:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 }, flexWrap: 'wrap' }}>
            <Chip
              label={employer.has_complete_documents ? 'کامل' : 'ناقص'}
              color={employer.has_complete_documents ? 'success' : 'error'}
              size="small"
            />
            {employer.national_id && (
              <Tooltip title="کد ملی موجود">
                <CreditCardIcon sx={{ color: 'green', fontSize: '1rem' }} />
              </Tooltip>
            )}
            {employer.national_card_front && employer.national_card_back && (
              <Tooltip title="تصاویر کارت ملی موجود">
                <ImageIcon sx={{ color: 'green', fontSize: '1rem' }} />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* بیوگرافی */}
        {employer.bio && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              📝 {employer.bio}
            </Typography>
          </Box>
        )}

        {/* توضیحات ادمین */}
        {employer.admin_notes && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{
              fontStyle: 'italic',
              display: 'block',
              p: 1,
              bgcolor: 'grey.50',
              borderRadius: 1
            }}>
              💬 توضیحات ادمین: {employer.admin_notes}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* دکمه‌های عملیات */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 0.75, sm: 1 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
            درخواست: {convertToJalali(employer.created_at)}
          </Typography>
          
          {/* دکمه مشاهده - فقط آیکون */}
          <IconButton
            onClick={() => onView(employer)}
            size="small"
            sx={{
              bgcolor: ADMIN_THEME.primary,
              color: 'white',
              '&:hover': { 
                bgcolor: ADMIN_THEME.dark,
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmployerVerificationCard;
