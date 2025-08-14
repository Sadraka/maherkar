'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, IconButton, Button, Skeleton, Avatar, Card, CardContent, Stack, Divider, Link } from '@mui/material';
import { ADMIN_THEME } from '@/constants/colors';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DiamondIcon from '@mui/icons-material/Diamond';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface PaymentRecord {
  id: string;
  owner: {
    id?: string;
    full_name: string;
    phone: string;
    user_type?: string; // نوع کاربر: EM, JS
  };
  total_price: number;
  payment_status: string;
  ad_type: string;
  durations: number;
  created_at: string;
  updated_at: string;
  title: string;
  plan?: {
    id?: string;
    name: string;
    price_per_day?: number;
    plan_type?: string; // نوع طرح: B, J, R
  };
  advertisement?: {
    id?: string;
    title: string;
    status?: string;
    company?: {
      id?: string;
      name?: string;
    };
  };
}

interface PaymentAdminDetailsProps {
  payment: PaymentRecord;
  onClose?: () => void;
}

const getStatusText = (status: string) => {
  const statusMap: any = {
    'pending': 'در انتظار پرداخت',
    'paid': 'پرداخت شده',
    'canceled': 'لغو شده',
    'cancelled': 'لغو شده',
    'failed': 'پرداخت ناموفق'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  const colors = {
    'pending': '#F59E0B',
    'paid': '#10B981',
    'failed': '#EF4444',
    'canceled': '#EF4444',
    'cancelled': '#EF4444'
  };
  return colors[status as keyof typeof colors] || '#6B7280';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return CheckCircleIcon;
    case 'pending':
      return ScheduleIcon;
    case 'failed':
      return ErrorIcon;
    case 'canceled':
      return CancelIcon;
    default:
      return ScheduleIcon;
  }
};

const getAdTypeText = (type: string) => {
  const types = {
    'J': 'آگهی شغلی',
    'R': 'آگهی رزومه'
  };
  return types[type as keyof typeof types] || type;
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// تابع تبدیل نوع کاربر به متن فارسی
const getUserTypeText = (userType: string) => {
  const typeMap = {
    'EM': 'کارفرما',
    'JS': 'کارجو',
    'AD': 'ادمین',
    'SU': 'پشتیبان'
  };
  return typeMap[userType as keyof typeof typeMap] || userType;
};

// تابع رنگ برای نوع کاربر
const getUserTypeColor = (userType: string) => {
  const colors = {
    'EM': '#3B82F6', // آبی برای کارفرما
    'JS': '#8B5CF6', // بنفش برای کارجو
    'AD': '#EF4444', // قرمز برای ادمین
    'SU': '#F59E0B'  // زرد برای پشتیبان
  };
  return colors[userType as keyof typeof colors] || '#6B7280';
};

// تابع رنگ برای نوع آگهی
const getAdTypeColor = (adType: string) => {
  const colors = {
    'J': '#06B6D4', // آبی روشن برای آگهی شغل
    'R': '#10B981'  // سبز برای آگهی رزومه
  };
  return colors[adType as keyof typeof colors] || '#6B7280';
};

const PaymentAdminDetailsSkeleton: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <Box sx={{ p: 2, maxWidth: '100%', overflow: 'hidden' }}>
    <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3, mb: 2 }} />
    <Box 
      display="grid" 
      gridTemplateColumns={{ xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }} 
      gap={1} 
      mb={2}
      sx={{ maxWidth: '100%', overflow: 'hidden' }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1.5 }} />
      ))}
    </Box>
    <Box display="flex" flexDirection="column" gap={2}>
      <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3 }} />
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
      </Box>
    </Box>
  </Box>
);

const PaymentAdminDetails: React.FC<PaymentAdminDetailsProps> = ({ payment, onClose }) => {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (payment) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [payment]);

  if (!payment) return null;
  
  if (loading) {
    return <PaymentAdminDetailsSkeleton isMobile={isMobile} />;
  }

  const StatusIcon = getStatusIcon(payment.payment_status);
  const statusColor = getStatusColor(payment.payment_status);

  // توابع ناوبری با جستجوی مستقیم
  const navigateToUsers = () => {
    if (typeof window !== 'undefined') {
      if (payment.owner?.phone) {
        // جستجو بر اساس شماره تلفن (اولویت اول)
        window.location.hash = `#users?search=${payment.owner.phone}`;
      } else if (payment.owner?.id) {
        // جستجو بر اساس ID کاربر
        window.location.hash = `#users?search=${payment.owner.id}`;
      } else if (payment.owner?.full_name) {
        // جستجو بر اساس نام کاربر
        window.location.hash = `#users?search=${encodeURIComponent(payment.owner.full_name)}`;
      } else {
        window.location.hash = '#users';
      }
    }
  };

  const navigateToJobs = () => {
    if (typeof window !== 'undefined') {
      // تعیین نوع آگهی بر اساس ad_type
      const adTypeParam = payment.ad_type === 'R' ? 'resume' : 'job';
      
      if (payment.id) {
        window.location.hash = `#jobs?search=${payment.id}&type=${adTypeParam}`;
      } else {
        window.location.hash = `#jobs?type=${adTypeParam}`;
      }
    }
  };

  const navigateToCompanies = () => {
    if (typeof window !== 'undefined') {
      if (payment.advertisement?.company?.id) {
        // جستجو بر اساس ID شرکت
        window.location.hash = `#companies?search=${payment.advertisement.company.id}`;
      } else if (payment.advertisement?.company?.name) {
        // جستجو بر اساس نام شرکت
        window.location.hash = `#companies?search=${encodeURIComponent(payment.advertisement.company.name)}`;
      } else if (payment.owner?.full_name) {
        // جستجو بر اساس نام کارفرما (ممکن است شرکت متعلق به این کارفرما باشد)
        window.location.hash = `#companies?search=${encodeURIComponent(payment.owner.full_name)}`;
      } else {
        window.location.hash = '#companies';
      }
    }
  };

  const navigateToSubscriptions = () => {
    if (typeof window !== 'undefined') {
      if (payment.plan?.id) {
        // جستجو بر اساس ID طرح
        window.location.hash = `#subscriptions?search=${payment.plan.id}`;
      } else if (payment.plan?.name) {
        // جستجو بر اساس نام طرح
        window.location.hash = `#subscriptions?search=${encodeURIComponent(payment.plan.name)}`;
      } else if (payment.owner?.full_name) {
        // جستجو بر اساس نام کاربر
        window.location.hash = `#subscriptions?search=${encodeURIComponent(payment.owner.full_name)}`;
      } else {
        window.location.hash = '#subscriptions';
      }
    }
  };

  const navigateToPayments = () => {
    if (typeof window !== 'undefined') {
      if (payment.owner?.phone) {
        // جستجو بر اساس شماره تلفن کاربر (یونیک‌ترین گزینه)
        window.location.hash = `#payments?search=${payment.owner.phone}`;
      } else if (payment.owner?.full_name) {
        // جستجو بر اساس نام کاربر
        window.location.hash = `#payments?search=${encodeURIComponent(payment.owner.full_name)}`;
      } else if (payment.id) {
        // جستجو بر اساس ID پرداخت
        window.location.hash = `#payments?search=${payment.id}`;
      } else {
        window.location.hash = '#payments';
      }
    }
  };

  let adStatusChip: React.ReactNode = null;
  if (payment.advertisement) {
    const adStatus = payment.advertisement.status;
    if (adStatus === 'A') {
      adStatusChip = <Chip label="تایید شده" color="success" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, '& .MuiChip-label': { px: 1.5 } }} />;
    } else if (adStatus === 'P') {
      adStatusChip = <Chip label="در انتظار" color="warning" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, '& .MuiChip-label': { px: 1.5 } }} />;
    } else if (adStatus === 'R') {
      adStatusChip = <Chip label="رد شده" color="error" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, '& .MuiChip-label': { px: 1.5 } }} />;
    } else {
      adStatusChip = <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>وضعیت نامشخص</Typography>;
    }
  }

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      {/* دکمه بستن */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: 'white',
          border: `2px solid #e0e7ff`,
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)',
          zIndex: 1000,
          width: 36,
          height: 36,
          '&:hover': { 
            bgcolor: '#f3f4f6',
            borderColor: '#7c3aed'
          }
        }}
      >
        <CloseIcon sx={{ color: '#7c3aed', fontSize: '1.2rem' }} />
      </IconButton>

      {/* هدر اصلی */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid #e0e7ff`,
          background: `linear-gradient(135deg, #7c3aed08 0%, #7c3aed03 100%)`,
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, #7c3aed, #8b5cf6, #a855f7)`,
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: `linear-gradient(135deg, #7c3aed, #8b5cf6)`,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                }}
              >
                <PaymentIcon sx={{ fontSize: '1.5rem' }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  sx={{ 
                    color: ADMIN_THEME.dark, 
                    mb: 0.5, 
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    letterSpacing: '-0.25px'
                  }}
                >
                  {payment.title || 'پرداخت آگهی'}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PersonIcon fontSize="small" sx={{ color: ADMIN_THEME.primary }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {payment.owner?.full_name || 'نامشخص'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ReceiptIcon fontSize="small" sx={{ color: ADMIN_THEME.primary }} />
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      fontWeight={500}
                      sx={{
                        wordBreak: 'break-all',
                        lineHeight: 1.2,
                        maxWidth: '120px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.65rem'
                      }}
                      title={`شماره سفارش: ${payment.id}`}
                    >
                      شماره سفارش: {payment.id}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
            <Chip
              label={getStatusText(payment.payment_status)}
              icon={<StatusIcon />}
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.8rem',
                px: 2,
                py: 0.5,
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                bgcolor: `${statusColor}15`,
                color: statusColor,
                border: `1px solid ${statusColor}30`
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* اطلاعات اصلی */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          mb: 2,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 1.5, 
            background: `linear-gradient(135deg, ${ADMIN_THEME.primary}05 0%, transparent 100%)`,
            borderBottom: `1px solid ${ADMIN_THEME.bgLight}`
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ 
                bgcolor: ADMIN_THEME.primary, 
                width: 28, 
                height: 28,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <CategoryIcon sx={{ fontSize: '16px' }} />
              </Avatar>
              <Typography variant="body2" fontWeight="600" sx={{ color: ADMIN_THEME.primary }}>
                اطلاعات پرداخت
              </Typography>
            </Stack>
          </Box>
          
          <Box sx={{ p: 1.5 }}>
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr 1fr 1fr" }} 
              gap={1}
            >
              {[
                { 
                  icon: PersonIcon, 
                  label: 'کاربر', 
                  value: payment.owner?.full_name, 
                  color: '#3B82F6',
                  isLink: true,
                  onClick: navigateToUsers,
                  linkText: 'مشاهده کاربر'
                },
                { 
                  icon: BusinessIcon, 
                  label: 'نوع کاربر', 
                  value: getUserTypeText(payment.owner?.user_type || ''), 
                  color: getUserTypeColor(payment.owner?.user_type || '')
                },
                { 
                  icon: PhoneIcon, 
                  label: 'شماره تماس', 
                  value: payment.owner?.phone, 
                  color: '#10B981' 
                },
                { icon: MonetizationOnIcon, label: 'مبلغ', value: formatAmount(payment.total_price), color: '#F59E0B' },
                { 
                  icon: WorkIcon, 
                  label: 'نوع آگهی', 
                  value: getAdTypeText(payment.ad_type), 
                  color: getAdTypeColor(payment.ad_type),
                  isLink: true,
                  onClick: navigateToJobs,
                  linkText: 'مشاهده آگهی'
                },
                { 
                  icon: DiamondIcon, 
                  label: 'طرح', 
                  value: payment.plan?.name, 
                  color: payment.plan?.name?.includes('نردبان') ? '#ef4444' : '#EF4444',
                  isLink: true,
                  onClick: navigateToSubscriptions,
                  linkText: 'مشاهده اشتراک',
                  specialStyle: payment.plan?.name?.includes('نردبان') ? {
                    color: '#ef4444',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  } : undefined
                },
                { icon: AccessTimeIcon, label: 'مدت', value: payment.durations ? `${payment.durations} روز` : 'نامشخص', color: '#06B6D4' },
                { icon: EventIcon, label: 'تاریخ ثبت', value: formatDate(payment.created_at), color: '#84CC16' },
                { icon: EventIcon, label: 'آخرین بروزرسانی', value: formatDate(payment.updated_at), color: '#F97316' }
              ].map((item, index) => (
                <Card key={index} elevation={0} sx={{ 
                  p: 1, 
                  border: `1px solid ${ADMIN_THEME.bgLight}`,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  cursor: item.isLink ? 'pointer' : 'default',
                  minHeight: 60,
                  '&:hover': {
                    transform: item.isLink ? 'translateY(-1px)' : 'none',
                    boxShadow: item.isLink ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    borderColor: item.isLink ? item.color : ADMIN_THEME.bgLight,
                  }
                }}
                onClick={item.isLink ? item.onClick : undefined}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Avatar sx={{ 
                      bgcolor: `${item.color}15`, 
                      color: item.color,
                      width: 24,
                      height: 24
                    }}>
                      <item.icon sx={{ fontSize: '14px' }} />
                    </Avatar>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: 1, display: 'block', mb: 0.25 }}>
                        {item.label}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        fontWeight={600} 
                        sx={{ 
                          color: item.specialStyle?.color || ADMIN_THEME.dark, 
                          fontSize: item.specialStyle?.fontSize || '0.75rem', 
                          lineHeight: 1.2, 
                          wordBreak: 'break-word',
                          fontWeight: item.specialStyle?.fontWeight || 600
                        }}
                      >
                        {item.value || 'نامشخص'}
                      </Typography>
                      {item.isLink && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <WorkIcon sx={{ fontSize: '12px', color: item.color }} />
                          <Typography variant="caption" sx={{ color: item.color, fontSize: '0.65rem', fontWeight: 500 }}>
                            {item.linkText}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* اطلاعات آگهی */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          mb: 2,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 2, 
            background: `linear-gradient(135deg, ${ADMIN_THEME.primary}05 0%, transparent 100%)`,
            borderBottom: `1px solid ${ADMIN_THEME.bgLight}`
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ 
                bgcolor: '#6366F1', 
                width: 32, 
                height: 32,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <DescriptionIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: ADMIN_THEME.primary }}>
                اطلاعات آگهی
              </Typography>
            </Stack>
          </Box>
          
          <Box sx={{ p: 2 }}>
            {!payment.advertisement ? (
              <Card elevation={0} sx={{ 
                border: `2px dashed ${ADMIN_THEME.bgLight}`,
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, #F3F4F6 0%, #FAFAFA 100%)`
                }}>
                  <Avatar sx={{ 
                    bgcolor: '#6B728015', 
                    color: '#6B7280',
                    width: 48, 
                    height: 48,
                    mx: 'auto',
                    mb: 1.5
                  }}>
                    <WorkIcon fontSize="medium" />
                  </Avatar>
                  {payment.payment_status === 'pending' ? (
                    <>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
                        آگهی هنوز ایجاد نشده
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        پس از تایید پرداخت، آگهی ایجاد خواهد شد
                      </Typography>
                    </>
                  ) : payment.payment_status === 'canceled' ? (
                    <>
                      <Typography variant="body2" color="error" fontWeight={600} sx={{ mb: 0.5 }}>
                        پرداخت لغو شده و آگهی ایجاد نشد
                      </Typography>
                    </>
                  ) : payment.payment_status === 'failed' ? (
                    <>
                      <Typography variant="body2" color="error" fontWeight={600} sx={{ mb: 0.5 }}>
                        پرداخت ناموفق بود و آگهی ایجاد نشد
                      </Typography>
                    </>
                  ) : null}
                </Box>
              </Card>
            ) : (
              <Card 
                elevation={0} 
                sx={{ 
                  border: `1px solid ${ADMIN_THEME.bgLight}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: ADMIN_THEME.primary,
                  }
                }}
                onClick={navigateToJobs}
              >
                {/* هدر آگهی */}
                <Box sx={{ 
                  p: 2, 
                  background: `linear-gradient(135deg, ${ADMIN_THEME.primary}08 0%, ${ADMIN_THEME.primary}03 100%)`,
                  borderBottom: `1px solid ${ADMIN_THEME.bgLight}`
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ 
                      bgcolor: ADMIN_THEME.primary, 
                      width: 36, 
                      height: 36,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <WorkIcon sx={{ fontSize: '18px' }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ 
                        color: ADMIN_THEME.dark,
                        mb: 0.5,
                        lineHeight: 1.3
                      }}>
                        {payment.title}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}>
                        {getAdTypeText(payment.ad_type)}
                      </Typography>
                    </Box>
                    {adStatusChip}
                  </Stack>
                </Box>

                {/* جزئیات آگهی */}
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    {/* اطلاعات شرکت */}
                    {payment.advertisement?.company && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#10B98108',
                        border: '1px solid #10B98120'
                      }}>
                        <Avatar sx={{ 
                          bgcolor: '#10B98115', 
                          color: '#10B981',
                          width: 28,
                          height: 28
                        }}>
                          <BusinessIcon sx={{ fontSize: '14px' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            شرکت
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: ADMIN_THEME.dark, fontSize: '0.8rem' }}>
                            {payment.advertisement.company.name}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* دکمه مشاهده */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 1, 
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${ADMIN_THEME.primary}08`,
                      border: `1px solid ${ADMIN_THEME.primary}20`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: `${ADMIN_THEME.primary}15`,
                      }
                    }}>
                      <WorkIcon sx={{ fontSize: '16px', color: ADMIN_THEME.primary }} />
                      <Typography variant="body2" sx={{ 
                        color: ADMIN_THEME.primary, 
                        fontSize: '0.8rem', 
                        fontWeight: 600
                      }}>
                        مشاهده آگهی
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* جزئیات طرح و پرداخت */}
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2} mb={2}>
        {/* طرح اشتراک */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${ADMIN_THEME.bgLight}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            }
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
              color: 'white'
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 48, 
                  height: 48,
                  backdropFilter: 'blur(10px)'
                }}>
                  <DiamondIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                    طرح اشتراک
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                    جزئیات طرح انتخاب شده
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {payment.plan ? (
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>نام طرح:</Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ 
                        color: payment.plan.name?.includes('نردبان') ? '#ef4444' : '#7c3aed',
                        fontSize: payment.plan.name?.includes('نردبان') ? '0.9rem' : '0.85rem',
                        fontWeight: payment.plan.name?.includes('نردبان') ? 700 : 600
                      }}
                    >
                      {payment.plan.name}
                    </Typography>
                  </Box>
                  
                  {[
                    { label: 'قیمت روزانه', value: payment.plan.price_per_day ? formatAmount(payment.plan.price_per_day) : 'نامشخص', icon: MonetizationOnIcon, color: '#10B981' },
                    { label: 'مدت اشتراک', value: payment.durations ? `${payment.durations} روز` : 'نامشخص', icon: AccessTimeIcon, color: '#3B82F6' },
                    { label: 'قیمت کل', value: formatAmount(payment.total_price), icon: PaymentIcon, color: '#F59E0B' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${item.color}08`,
                      border: `1px solid ${item.color}20`
                    }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: `${item.color}15`, color: item.color, width: 28, height: 28 }}>
                          <item.icon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} fontSize="0.85rem">{item.label}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={600} sx={{ color: ADMIN_THEME.dark }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: `${ADMIN_THEME.bgLight}`, color: 'text.secondary', width: 48, height: 48, mx: 'auto', mb: 1.5 }}>
                    <DiamondIcon fontSize="medium" />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>طرحی انتخاب نشده</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* وضعیت پرداخت */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${ADMIN_THEME.bgLight}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            }
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%)`,
              color: 'white'
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 48, 
                  height: 48,
                  backdropFilter: 'blur(10px)'
                }}>
                  <StatusIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                    وضعیت پرداخت
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                    {getStatusText(payment.payment_status)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>شماره سفارش:</Typography>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ 
                        fontFamily: 'monospace',
                        bgcolor: '#f3f4f6',
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        border: `1px solid #e0e7ff`,
                        fontSize: '0.7rem',
                        letterSpacing: '0.3px',
                        color: '#7c3aed',
                        wordBreak: 'break-all',
                        lineHeight: 1.2,
                        maxWidth: '180px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      title={payment.id}
                    >
                      {payment.id}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => navigator.clipboard.writeText(payment.id)}
                      sx={{ 
                        color: ADMIN_THEME.primary,
                        bgcolor: `${ADMIN_THEME.primary}08`,
                        '&:hover': { bgcolor: `${ADMIN_THEME.primary}15` }
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {[
                  { label: 'وضعیت', value: getStatusText(payment.payment_status), icon: StatusIcon, color: statusColor },
                  { label: 'تاریخ ثبت', value: formatDate(payment.created_at), icon: EventIcon, color: '#8B5CF6' },
                  { label: 'آخرین بروزرسانی', value: formatDate(payment.updated_at), icon: EventIcon, color: '#F59E0B' }
                ].map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${item.color}08`,
                    border: `1px solid ${item.color}20`
                  }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: `${item.color}15`, color: item.color, width: 28, height: 28 }}>
                        <item.icon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} fontSize="0.85rem">{item.label}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600} sx={{ color: ADMIN_THEME.dark }}>{item.value}</Typography>
                  </Box>
                ))}
                
                {/* لینک به صفحه پرداخت‌ها */}
                <Box sx={{ 
                  mt: 2,
                  p: 2,
                  border: `2px dashed ${ADMIN_THEME.primary}40`,
                  borderRadius: 3,
                  bgcolor: `${ADMIN_THEME.primary}05`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: ADMIN_THEME.primary,
                    bgcolor: `${ADMIN_THEME.primary}10`,
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={navigateToPayments}
                >
                  <Avatar sx={{ 
                    bgcolor: `${ADMIN_THEME.primary}15`, 
                    color: ADMIN_THEME.primary,
                    width: 36,
                    height: 36
                  }}>
                    <PaymentIcon sx={{ fontSize: '1.2rem' }} />
                  </Avatar>
                  <Typography variant="body2" fontWeight={600} sx={{ color: ADMIN_THEME.primary, textAlign: 'center' }}>
                    مشاهده همه پرداخت‌های این کاربر
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>


    </Box>
  );
};

export default PaymentAdminDetails; 