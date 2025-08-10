'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { useRouter } from 'next/navigation';
import { 
  JobAdvertisement, 
  GENDER_CHOICES, 
  SOLDIER_STATUS_CHOICES, 
  DEGREE_CHOICES, 
  SALARY_CHOICES, 
  JOB_TYPE_CHOICES,
  JOB_STATUS_CHOICES
} from '@/types';

interface JobCardProps {
  job: JobAdvertisement;
  index: number;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onView?: (jobId: string) => void;
}

// تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
const convertToFarsiNumber = (num: string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

// تابع کمکی برای تبدیل وضعیت‌ها به متن فارسی مناسب
const getSalaryText = (salary: string): string => {
  switch (salary) {
    case '5 to 10': return convertToFarsiNumber('5') + ' تا ' + convertToFarsiNumber('10') + ' میلیون تومان';
    case '10 to 15': return convertToFarsiNumber('10') + ' تا ' + convertToFarsiNumber('15') + ' میلیون تومان';
    case '15 to 20': return convertToFarsiNumber('15') + ' تا ' + convertToFarsiNumber('20') + ' میلیون تومان';
    case '20 to 30': return convertToFarsiNumber('20') + ' تا ' + convertToFarsiNumber('30') + ' میلیون تومان';
    case '30 to 50': return convertToFarsiNumber('30') + ' تا ' + convertToFarsiNumber('50') + ' میلیون تومان';
    case 'More than 50': return 'بیش از ' + convertToFarsiNumber('50') + ' میلیون تومان';
    case 'Negotiable':
    default: return 'توافقی';
  }
};

const getJobTypeText = (jobType: string): string => {
  switch (jobType) {
    case 'Full-Time': return 'تمام وقت';
    case 'Part-Time': return 'پاره وقت';
    case 'Remote': return 'دورکاری';
    case 'Internship': return 'کارآموزی';
    default: return jobType;
  }
};

const getStatusText = (status: string) => {
  return JOB_STATUS_CHOICES[status as keyof typeof JOB_STATUS_CHOICES] || status;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'A': return 'success';
    case 'P': return 'warning';
    case 'R': return 'error';
    default: return 'default';
  }
};

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  index,
  onEdit,
  onDelete,
  onView
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const handleCardClick = () => {
    if (onView) {
      onView(job.id);
    } else {
      router.push(`/employer/jobs/${job.id}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(job.id);
    } else {
      router.push(`/employer/jobs/edit/${job.id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(job.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 2, sm: 2.5, md: 3 },
        border: `1px solid #E0E0E0`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.25s ease-in-out',
        p: 0,
        width: '100%',
        mx: 'auto',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: { xs: 1.2, sm: 1.5 }, pb: "0px !important", flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* عنوان شغل در بالای کارت */}
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
            color: 'text.primary',
            lineHeight: 1.3,
            mb: { xs: 1.2, sm: 1.5 },
            textAlign: 'right',
          }}
        >
          {job.title}
        </Typography>

        {/* اطلاعات شغلی */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.2 } }}>
          {/* محل کار */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0.5,
                mr: { xs: 0.8, sm: 1 },
              }}
            >
              <LocationOnOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
            >
              {job.location.name}
              {job.location.province && `, ${job.location.province.name}`}
            </Typography>
          </Box>

          {/* زمان انتشار */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0.5,
                mr: { xs: 0.8, sm: 1 },
              }}
            >
              <AccessTimeOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
            >
              {formatDate(job.created_at)}
            </Typography>
          </Box>

          {/* نوع کار */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0.5,
                mr: { xs: 0.8, sm: 1 },
              }}
            >
              <WorkOutlineIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
            >
              {job.job_type ? getJobTypeText(job.job_type) : 'نامشخص'}
            </Typography>
          </Box>

          {/* حقوق */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0.5,
                mr: { xs: 0.8, sm: 1 },
              }}
            >
              <PaidOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#1976d2',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
            >
              {job.salary ? getSalaryText(job.salary) : 'توافقی'}
            </Typography>
          </Box>
        </Box>

        {/* دکمه‌های عملیات */}
        <Box sx={{ mt: { xs: 1.2, sm: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<VisibilityOutlinedIcon fontSize="small" />}
              onClick={handleCardClick}
              sx={{
                py: { xs: 0.8, sm: 1 },
                fontWeight: 'bold',
                borderRadius: 1.5,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                background: 'linear-gradient(135deg, #4299e1 0%, #1976d2 100%)',
                color: '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              مشاهده آگهی
            </Button>
            
            <Tooltip title="ویرایش">
              <IconButton
                onClick={handleEdit}
                sx={{
                  bgcolor: '#ff9800',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: '#f57c00',
                  },
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                }}
              >
                <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
              </IconButton>
            </Tooltip>
            
            {onDelete && (
              <Tooltip title="حذف">
                <IconButton
                  onClick={handleDelete}
                  sx={{
                    bgcolor: '#f44336',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#d32f2f',
                    },
                    width: { xs: 40, sm: 44 },
                    height: { xs: 40, sm: 44 },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard; 