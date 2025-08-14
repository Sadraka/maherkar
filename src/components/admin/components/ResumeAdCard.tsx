'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  LocationOn,
  Business,
  AccessTime,
  Visibility,
  CheckCircle,
  Cancel,
  Delete,
  Work,
  School,
  People,
  AttachMoney
} from '@mui/icons-material';
import { ADMIN_THEME } from '@/constants/colors';
import { ResumeAdvertisement } from '@/types';
import {
  getJobTypeText,
  getSalaryText,
  getDegreeText,
  getGenderText,
  formatDate
} from '@/lib/jobUtils';

interface ResumeAdCardProps {
  resumeAd: ResumeAdvertisement;
  onView: (resumeAd: ResumeAdvertisement) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, { text: string; color: string }> = {
    'P': { text: 'در انتظار تایید', color: '#ff9800' },
    'A': { text: 'تایید شده', color: '#4caf50' },
    'R': { text: 'رد شده', color: '#f44336' }
  };
  return statusMap[status] || { text: 'نامشخص', color: '#9e9e9e' };
};

const getSoldierStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    'CO': 'پایان خدمت',
    'EE': 'معافیت تحصیلی',
    'NS': 'مهم نیست'
  };
  return statusMap[status || ''] || 'نامشخص';
};

// تابع کمکی برای بررسی اشتراک ویژه
const isSpecialSubscription = (resumeAd: ResumeAdvertisement): boolean => {
  // بررسی بر اساس نام طرح در subscription_detail
  if (resumeAd.subscription_detail?.plan?.name) {
    const planName = resumeAd.subscription_detail.plan.name.toLowerCase();
    // فقط طرح‌های نردبان، فوری، ویژه، vip، یا ladder را به عنوان special در نظر بگیر
    if (planName.includes('نردبان') || planName.includes('فوری') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
      return true;
    }
    // طرح‌های پایه را special در نظر نگیر
    if (planName.includes('پایه') || planName.includes('base') || planName.includes('basic')) {
      return false;
    }
  }
  
  // بررسی بر اساس subscription_status در subscription_detail
  if (resumeAd.subscription_detail?.subscription_status) {
    if (resumeAd.subscription_detail.subscription_status === 'special') {
      return true;
    }
  }
  
  return false;
};

// تابع دریافت اطلاعات طرح بر اساس نام
const getPlanInfo = (planName: string) => {
  const name = planName.toLowerCase();
  
  if (name.includes('نردبان') || name.includes('ladder')) {
    return {
      color: '#e53935',
      bgColor: 'linear-gradient(45deg, #e53935, #d32f2f)',
      icon: '🔥',
      label: 'نردبان'
    };
  }
  if (name.includes('فوری') || name.includes('urgent')) {
    return {
      color: '#ff9800',
      bgColor: 'linear-gradient(45deg, #ff9800, #f57c00)',
      icon: '⚡',
      label: 'فوری'
    };
  }
  if (name.includes('ویژه') || name.includes('special')) {
    return {
      color: '#ff9800',
      bgColor: 'linear-gradient(45deg, #ff9800, #f57c00)',
      icon: '⭐',
      label: 'ویژه'
    };
  }
  if (name.includes('vip') || name.includes('پریمیوم') || name.includes('premium')) {
    return {
      color: '#9c27b0',
      bgColor: 'linear-gradient(45deg, #9c27b0, #7b1fa2)',
      icon: '💎',
      label: 'VIP'
    };
  }
  if (name.includes('پایه') || name.includes('base') || name.includes('عادی') || name.includes('normal')) {
    return {
      color: '#2196F3',
      bgColor: 'linear-gradient(45deg, #2196F3, #1976D2)',
      icon: '',
      label: 'پایه'
    };
  }
  
  // طرح پیش‌فرض
  return {
    color: ADMIN_THEME.primary,
    bgColor: `linear-gradient(45deg, ${ADMIN_THEME.primary}, #2196F3)`,
    icon: '📄',
    label: 'عادی'
  };
};

export default function ResumeAdCard({ 
  resumeAd, 
  onView, 
  onApprove, 
  onReject, 
  onDelete 
}: ResumeAdCardProps) {
  const statusInfo = getStatusText(resumeAd.status);
  const planInfo = resumeAd.subscription_detail?.plan?.name ? getPlanInfo(resumeAd.subscription_detail.plan.name) : null;

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: `1px solid ${ADMIN_THEME.bgLight}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: `0 8px 25px rgba(0,0,0,0.1)`,
          transform: 'translateY(-4px)',
          borderColor: ADMIN_THEME.primary
        },
        cursor: 'pointer'
      }}
      onClick={() => onView(resumeAd)}
    >
      {/* برچسب طرح اشتراک در بالا */}
      {planInfo && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: planInfo.bgColor,
            zIndex: 1
          }}
        />
      )}

      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: ADMIN_THEME.primary, 
                  fontWeight: 700,
                  mb: 1,
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  fontSize: '1.1rem'
                }}
              >
                {resumeAd.title}
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                <Chip
                  label={statusInfo.text}
                  size="small"
                  sx={{
                    bgcolor: statusInfo.color,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
                
                {planInfo && (
                  <Chip
                    label={planInfo.label}
                    size="small"
                    sx={{
                      background: planInfo.bgColor,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 24,
                      '& .MuiChip-label': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }
                    }}
                    icon={planInfo.icon ? <span style={{ fontSize: '0.7rem' }}>{planInfo.icon}</span> : undefined}
                  />
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="مشاهده جزئیات">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(resumeAd);
                  }}
                  sx={{
                    bgcolor: `${ADMIN_THEME.primary}15`,
                    color: ADMIN_THEME.primary,
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: `${ADMIN_THEME.primary}25`
                    }
                  }}
                >
                  <Visibility sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>

              {resumeAd.status === 'P' && onApprove && (
                <Tooltip title="تایید">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove();
                    }}
                    sx={{
                      bgcolor: '#10B98115',
                      color: '#10B981',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: '#10B98125'
                      }
                    }}
                  >
                    <CheckCircle sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              )}

              {resumeAd.status !== 'R' && onReject && (
                <Tooltip title="رد">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject();
                    }}
                    sx={{
                      bgcolor: '#EF444415',
                      color: '#EF4444',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: '#EF444425'
                      }
                    }}
                  >
                    <Cancel sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              )}

              {onDelete && (
                <Tooltip title="حذف">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    sx={{
                      bgcolor: '#EF444415',
                      color: '#EF4444',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: '#EF444425'
                      }
                    }}
                  >
                    <Delete sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {/* اطلاعات اصلی */}
          <Box sx={{ 
            p: 2, 
            bgcolor: `${ADMIN_THEME.primary}05`,
            borderRadius: 2,
            border: `1px solid ${ADMIN_THEME.primary}15`
          }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ 
                  bgcolor: `${ADMIN_THEME.primary}15`, 
                  color: ADMIN_THEME.primary, 
                  width: 32, 
                  height: 32 
                }}>
                  <Person sx={{ fontSize: '1.1rem' }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600, fontSize: '0.9rem' }}>
                    {resumeAd.job_seeker_detail?.full_name || 'نامشخص'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    کارجو
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ 
                  bgcolor: `${ADMIN_THEME.secondary}15`, 
                  color: ADMIN_THEME.secondary, 
                  width: 32, 
                  height: 32 
                }}>
                  <LocationOn sx={{ fontSize: '1.1rem' }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, fontWeight: 500, fontSize: '0.9rem' }}>
                    {resumeAd.location_detail?.name || 'نامشخص'}
                  </Typography>
                  {resumeAd.location_detail?.province && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {typeof resumeAd.location_detail.province === 'object' && resumeAd.location_detail.province && 'name' in (resumeAd.location_detail.province as any)
                        ? (resumeAd.location_detail.province as any).name
                        : resumeAd.location_detail.province}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ 
                  bgcolor: `${ADMIN_THEME.warning}15`, 
                  color: ADMIN_THEME.warning, 
                  width: 32, 
                  height: 32 
                }}>
                  <Business sx={{ fontSize: '1.1rem' }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, fontWeight: 500, fontSize: '0.9rem' }}>
                    {resumeAd.industry_detail?.name || 'نامشخص'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    صنعت
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* جزئیات اضافی */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 1.5,
            p: 2,
            bgcolor: `${ADMIN_THEME.bgVeryLight}`,
            borderRadius: 2,
            border: `1px solid ${ADMIN_THEME.bgLight}`
          }}>
            {resumeAd.job_type && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work sx={{ color: ADMIN_THEME.info, fontSize: '1rem' }} />
                <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, fontWeight: 500 }}>
                  {getJobTypeText(resumeAd.job_type)}
                </Typography>
              </Box>
            )}

            {resumeAd.salary && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ color: ADMIN_THEME.success, fontSize: '1rem' }} />
                <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, fontWeight: 500 }}>
                  {getSalaryText(resumeAd.salary)}
                </Typography>
              </Box>
            )}

            {resumeAd.degree && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School sx={{ color: ADMIN_THEME.secondary, fontSize: '1rem' }} />
                <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, fontWeight: 500 }}>
                  {getDegreeText(resumeAd.degree)}
                </Typography>
              </Box>
            )}

            {resumeAd.gender && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People sx={{ color: ADMIN_THEME.primary, fontSize: '1rem' }} />
                <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, fontWeight: 500 }}>
                  {getGenderText(resumeAd.gender)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* توضیحات */}
          {resumeAd.description && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'white',
              borderRadius: 2,
              border: `1px solid ${ADMIN_THEME.bgLight}`
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: ADMIN_THEME.text, 
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: '0.85rem'
                }}
              >
                {resumeAd.description}
              </Typography>
            </Box>
          )}

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime sx={{ color: 'text.secondary', fontSize: '0.9rem' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {formatDate(resumeAd.created_at)}
              </Typography>
            </Stack>

            {resumeAd.subscription_detail?.plan && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  قیمت روزانه:
                </Typography>
                <Typography variant="caption" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                  {resumeAd.subscription_detail.plan.price_per_day ? 
                    `${new Intl.NumberFormat('fa-IR').format(resumeAd.subscription_detail.plan.price_per_day)} تومان` : 
                    'نامشخص'
                  }
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}