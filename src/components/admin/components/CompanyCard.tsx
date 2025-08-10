import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business,
  LocationOn as LocationOnIcon,
  PeopleAlt as PeopleAltIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { ADMIN_THEME } from '@/constants/colors';

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
    console.error('خطا در تبدیل تاریخ:', error);
    return gregorianDate || 'نامشخص';
  }
};

// تابع تبدیل اعداد به فارسی
const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    industry?: number;
    location?: {
      name: string;
      province?: {
        name: string;
      };
    };
    number_of_employees?: number;
    founded_date?: string;
    created_at: string;
    logo?: string;
    description?: string;
    status?: 'P' | 'A' | 'R';
  };
  onView: (company: any) => void;
  onEdit: (company: any) => void;
  onDelete: (company: any) => void;
  onApprove?: (company: any) => void;
  onReject?: (company: any) => void;
  industries: Array<{ id: number; name: string }>;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onView, onEdit, onDelete, onApprove, onReject, industries }) => {
  const getIndustryName = (industryId: number | undefined, industriesList: Array<{ id: number; name: string }>) => {
    if (!industryId) return 'نامشخص';
    const industry = industriesList.find(ind => ind.id === industryId);
    return industry ? industry.name : 'نامشخص';
  };

  const getFullImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${ADMIN_THEME.bgLight}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: ADMIN_THEME.primary,
          transform: 'translateY(-1px)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Avatar
            src={getFullImageUrl(company.logo)}
            sx={{
              width: 48,
              height: 48,
              bgcolor: ADMIN_THEME.primary,
              fontSize: '1.1rem',
              fontWeight: 600,
              mr: 2
            }}
            onError={(e) => {
              console.error('خطا در بارگذاری لوگو:', company.logo);
            }}
          >
            {company.name ? company.name[0].toUpperCase() : 'C'}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: ADMIN_THEME.dark,
                mb: 0.5,
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}
              title={company.name}
            >
              {company.name.length > 15 ? `${company.name.substring(0, 15)}...` : company.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              {getIndustryName(company.industry, industries)}
            </Typography>
          </Box>

          {/* وضعیت تایید */}
          {company.status && (
            <Chip
              label={company.status === 'A' ? 'تایید شده' : company.status === 'R' ? 'رد شده' : 'در انتظار تایید'}
              size="small"
              color={company.status === 'A' ? 'success' : company.status === 'R' ? 'error' : 'warning'}
              sx={{ fontWeight: 700 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        {/* Info Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          mb: 2.5
        }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.5
              }}
            >
              موقعیت
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.8rem'
              }}
            >
              {company.location ? (
                <>
                  {company.location.province?.name && `${company.location.province.name}، `}
                  {company.location.name}
                </>
              ) : (
                'نامشخص'
              )}
            </Typography>
          </Box>
          
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.5
              }}
            >
              تاریخ ثبت
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.8rem'
              }}
            >
              {convertToJalali(company.created_at)}
            </Typography>
          </Box>

          {company.number_of_employees && company.number_of_employees > 0 && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  display: 'block',
                  mb: 0.5
                }}
              >
                تعداد کارکنان
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: ADMIN_THEME.dark,
                  fontSize: '0.8rem'
                }}
              >
                {convertToPersianNumbers(company.number_of_employees)} نفر
              </Typography>
            </Box>
          )}

          {company.founded_date && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  display: 'block',
                  mb: 0.5
                }}
              >
                تاریخ تأسیس
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: ADMIN_THEME.dark,
                  fontSize: '0.8rem'
                }}
              >
                {convertToJalali(company.founded_date)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          {/* رد شرکت (اگر تایید نشده) */}
          {company.status !== 'R' && (
            <Tooltip title="رد شرکت">
              <IconButton
                size="small"
                onClick={() => onReject && onReject(company)}
                sx={{
                  color: '#EF4444',
                  bgcolor: '#FEE2E2',
                  '&:hover': { bgcolor: '#FECACA' }
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* تایید شرکت (اگر تایید نشده) */}
          {company.status !== 'A' && (
            <Tooltip title="تایید شرکت">
              <IconButton
                size="small"
                onClick={() => onApprove && onApprove(company)}
                sx={{
                  color: '#2e7d32',
                  bgcolor: '#E8F5E9',
                  '&:hover': { bgcolor: '#C8E6C9' }
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="مشاهده جزئیات">
            <IconButton
              size="small"
              onClick={() => onView(company)}
              sx={{
                color: ADMIN_THEME.primary,
                bgcolor: `${ADMIN_THEME.primary}10`,
                '&:hover': {
                  bgcolor: `${ADMIN_THEME.primary}20`
                }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="ویرایش شرکت">
            <IconButton
              size="small"
              onClick={() => onEdit(company)}
              sx={{
                color: ADMIN_THEME.primary,
                bgcolor: `${ADMIN_THEME.primary}10`,
                '&:hover': {
                  bgcolor: `${ADMIN_THEME.primary}20`
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="حذف شرکت">
            <IconButton
              size="small"
              onClick={() => onDelete(company)}
              sx={{
                color: '#EF4444',
                bgcolor: '#FEE2E2',
                '&:hover': {
                  bgcolor: '#FECACA'
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CompanyCard; 