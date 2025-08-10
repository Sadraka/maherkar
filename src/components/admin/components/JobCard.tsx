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
  Business,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { ADMIN_THEME } from '@/constants/colors';
import ActionButtons from './ActionButtons';
import { 
  getJobTypeText, 
  getSalaryText, 
  getDegreeText, 
  getStatusLabel, 
  getStatusColor, 
  formatDate 
} from '@/lib/jobUtils';

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



interface JobCardProps {
  job: {
    id: string;
    title?: string;
    status?: string;
    degree?: string;
    salary?: string;
    job_type?: string;
    created_at?: string;
    company_detail?: { name?: string };
    location_detail?: { name?: string; province?: string };
    employer_detail?: { full_name?: string };
    industry_detail?: { name?: string };
    subscription_orders?: Array<{ id: string; payment_status: string }>;
  };
  onView: (job: any) => void;
  onApprove?: (job: any) => void;
  onReject?: (job: any) => void;
  onDelete: (job: any) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onView, onApprove, onReject, onDelete }) => {
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
            sx={{
              width: 48,
              height: 48,
              bgcolor: ADMIN_THEME.primary,
              fontSize: '1.1rem',
              fontWeight: 600,
              mr: 2
            }}
          >
            <WorkIcon />
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: ADMIN_THEME.dark,
                mb: 0.5,
                fontSize: '1rem',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={job.title}
            >
              {job.title || 'بدون عنوان'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              {job.company_detail?.name || 'بدون شرکت'}
            </Typography>
          </Box>

          <Chip 
            label={getStatusLabel(job.status || '')}
            color={getStatusColor(job.status || '') as any}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        </Box>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        {/* Info Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.5,
          mb: 2
        }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.25,
                fontSize: '0.7rem'
              }}
            >
              کارفرما
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.75rem',
                lineHeight: 1.2
              }}
            >
              {job.employer_detail?.full_name || 'نامشخص'}
            </Typography>
          </Box>
          
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.25,
                fontSize: '0.7rem'
              }}
            >
              موقعیت
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.75rem',
                lineHeight: 1.2
              }}
            >
              {job.location_detail?.name || 'نامشخص'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.25,
                fontSize: '0.7rem'
              }}
            >
              نوع کار
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.75rem',
                lineHeight: 1.2
              }}
            >
              {getJobTypeText(job.job_type)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.25,
                fontSize: '0.7rem'
              }}
            >
              حقوق
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.75rem',
                lineHeight: 1.2
              }}
            >
              {getSalaryText(job.salary)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.25,
                fontSize: '0.7rem'
              }}
            >
              مدرک تحصیلی
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.75rem',
                lineHeight: 1.2
              }}
            >
              {getDegreeText(job.degree)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.25,
                fontSize: '0.7rem'
              }}
            >
              تاریخ ثبت
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark,
                fontSize: '0.75rem',
                lineHeight: 1.2
              }}
            >
              {convertToJalali(job.created_at || '')}
            </Typography>
          </Box>

          {job.subscription_orders && job.subscription_orders.length > 0 && (
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
                شماره سفارش
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: ADMIN_THEME.primary,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                  wordBreak: 'break-all'
                }}
              >
                {job.subscription_orders[0].id}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 0.5,
          flexWrap: 'wrap'
        }}>
          <Tooltip title="مشاهده جزئیات">
            <IconButton
              size="small"
              onClick={() => onView(job)}
              sx={{
                color: ADMIN_THEME.primary,
                bgcolor: `${ADMIN_THEME.primary}08`,
                '&:hover': {
                  bgcolor: `${ADMIN_THEME.primary}15`,
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {job.status === 'R' && onApprove && (
            <Tooltip title="تایید آگهی">
              <IconButton
                size="small"
                onClick={() => onApprove(job)}
                sx={{
                  color: '#10B981',
                  bgcolor: '#ECFDF5',
                  '&:hover': {
                    bgcolor: '#D1FAE5',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {job.status === 'A' && onReject && (
            <Tooltip title="رد آگهی">
              <IconButton
                size="small"
                onClick={() => onReject(job)}
                sx={{
                  color: '#F59E0B',
                  bgcolor: '#FFFBEB',
                  '&:hover': {
                    bgcolor: '#FEF3C7',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {job.status === 'P' && onApprove && (
            <Tooltip title="تایید آگهی">
              <IconButton
                size="small"
                onClick={() => onApprove(job)}
                sx={{
                  color: '#10B981',
                  bgcolor: '#ECFDF5',
                  '&:hover': {
                    bgcolor: '#D1FAE5',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {job.status === 'P' && onReject && (
            <Tooltip title="رد آگهی">
              <IconButton
                size="small"
                onClick={() => onReject(job)}
                sx={{
                  color: '#F59E0B',
                  bgcolor: '#FFFBEB',
                  '&:hover': {
                    bgcolor: '#FEF3C7',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="حذف آگهی">
            <IconButton
              size="small"
              onClick={() => onDelete(job)}
              sx={{
                color: '#EF4444',
                bgcolor: '#FEF2F2',
                '&:hover': {
                  bgcolor: '#FEE2E2',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
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

export default React.memo(JobCard); 