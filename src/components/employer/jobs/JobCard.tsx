'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  AccountBalance as SalaryIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
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

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  index,
  onEdit,
  onDelete,
  onView
}) => {
  const router = useRouter();

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A': return 'success';
      case 'P': return 'warning';
      case 'R': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    return JOB_STATUS_CHOICES[status as keyof typeof JOB_STATUS_CHOICES] || status;
  };

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

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: `translateY(${index * 10}px)`,
        animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          '& .job-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '@keyframes slideInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
      onClick={handleCardClick}
    >
      {/* Header with company info */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={getImageUrl(job.company.logo) || undefined}
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'primary.main',
              '& img': {
                objectFit: 'contain'
              }
            }}
          >
            <BusinessIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
              noWrap
            >
              {job.company.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {job.location.name}
                {job.location.province && `, ${job.location.province.name}`}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={getStatusText(job.status)}
            size="small"
            color={getStatusColor(job.status) as any}
            variant="filled"
          />
        </Box>

        {/* Job Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            lineHeight: 1.3,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {job.title}
        </Typography>

        {/* Job Description */}
        {job.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
              mb: 2,
            }}
          >
            {job.description}
          </Typography>
        )}
      </Box>

      <CardContent sx={{ pt: 0, pb: 1, flex: 1 }}>
        {/* Job Details */}
        <Stack spacing={1.5}>
          {/* Industry */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {job.industry.name}
            </Typography>
          </Box>

          {/* Job Type and Salary */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {job.job_type && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {JOB_TYPE_CHOICES[job.job_type as keyof typeof JOB_TYPE_CHOICES]}
                </Typography>
              </Box>
            )}
            {job.salary && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SalaryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {SALARY_CHOICES[job.salary as keyof typeof SALARY_CHOICES]}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Requirements */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {job.gender && job.gender !== 'N' && (
              <Chip
                icon={<PersonIcon sx={{ fontSize: 16 }} />}
                label={GENDER_CHOICES[job.gender as keyof typeof GENDER_CHOICES]}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
            {job.degree && (
              <Chip
                icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                label={DEGREE_CHOICES[job.degree as keyof typeof DEGREE_CHOICES]}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
            {job.soldier_status && job.soldier_status !== 'NS' && (
              <Chip
                icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                label={SOLDIER_STATUS_CHOICES[job.soldier_status as keyof typeof SOLDIER_STATUS_CHOICES]}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(job.created_at)}
          </Typography>
          
          {/* Action Buttons */}
          <Box
            className="job-actions"
            sx={{
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              transform: 'translateY(8px)',
              transition: 'all 0.2s ease-out',
            }}
          >
            <Tooltip title="مشاهده جزئیات">
              <IconButton
                size="small"
                onClick={handleView}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <ViewIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="ویرایش">
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{
                  bgcolor: 'warning.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            {onDelete && (
              <Tooltip title="حذف">
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'error.dark',
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default JobCard; 