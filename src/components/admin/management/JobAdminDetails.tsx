'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, IconButton, Button, Skeleton, Avatar, Card, CardContent, Stack, Divider, CircularProgress } from '@mui/material';
import { ADMIN_THEME } from '@/constants/colors';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import PaidIcon from '@mui/icons-material/Paid';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import DiamondIcon from '@mui/icons-material/Diamond';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState, useEffect } from 'react';
import { apiGet, apiPatch } from '@/lib/axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { 
  getJobTypeText, 
  getSalaryText, 
  getDegreeText, 
  getGenderText, 
  getSoldierStatusText, 
  formatDate 
} from '@/lib/jobUtils';

interface JobAdminDetailsProps {
  job: any;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}



const getStatusText = (status: string) => {
  const statusMap: Record<string, { text: string; color: string }> = {
    'P': { text: 'در انتظار تایید', color: '#ff9800' },
    'A': { text: 'تایید شده', color: '#4caf50' },
    'R': { text: 'رد شده', color: '#f44336' },
    'pending': { text: 'در انتظار پرداخت', color: '#ff9800' },
    'paid': { text: 'پرداخت موفق', color: '#4caf50' },
    'canceled': { text: 'لغو شده', color: '#f44336' },
    'cancelled': { text: 'لغو شده', color: '#f44336' },
    'failed': { text: 'پرداخت ناموفق', color: '#f44336' },
    'success': { text: 'موفق', color: '#4caf50' },
    'error': { text: 'خطا', color: '#f44336' },
    'processing': { text: 'در حال پردازش', color: '#2196f3' },
    'default': { text: 'عادی', color: '#9e9e9e' },
    'special': { text: 'ویژه', color: '#e91e63' },
    'active': { text: 'فعال', color: '#4caf50' },
    'inactive': { text: 'غیرفعال', color: '#9e9e9e' }
  };
  return statusMap[status] || { text: status, color: '#9e9e9e' };
};

// تابع کمکی برای بررسی اشتراک ویژه
const isSpecialSubscription = (job: any): boolean => {
  // بررسی بر اساس نام طرح در subscription_detail
  if (job.subscription_detail?.plan?.name) {
    const planName = job.subscription_detail.plan.name.toLowerCase();
    // فقط طرح‌های نردبان، ویژه، vip، یا ladder را به عنوان special در نظر بگیر
    if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
      return true;
    }
    // طرح‌های پایه را special در نظر نگیر
    if (planName.includes('پایه') || planName.includes('base') || planName.includes('basic')) {
      return false;
    }
  }
  
  // بررسی بر اساس subscription_status در subscription_detail
  if (job.subscription_detail?.subscription_status) {
    if (job.subscription_detail.subscription_status === 'special') {
      return true;
    }
  }
  
  // اگر subscription_detail نبود، از advertisement.subscription بررسی کن
  if (job.advertisement?.subscription?.subscription_status) {
    if (job.advertisement.subscription.subscription_status === 'special') {
      return true;
    }
  }
  
  // بررسی بر اساس نام طرح در advertisement
  if (job.advertisement?.subscription?.plan?.name) {
    const planName = job.advertisement.subscription.plan.name.toLowerCase();
    if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
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
      icon: '🔥'
    };
  }
  if (name.includes('ویژه') || name.includes('special')) {
    return {
      color: '#ff9800',
      bgColor: 'linear-gradient(45deg, #ff9800, #f57c00)',
      icon: '⭐'
    };
  }
  if (name.includes('vip') || name.includes('پریمیوم') || name.includes('premium')) {
    return {
      color: '#9c27b0',
      bgColor: 'linear-gradient(45deg, #9c27b0, #7b1fa2)',
      icon: '💎'
    };
  }
  if (name.includes('پایه') || name.includes('base') || name.includes('عادی') || name.includes('normal')) {
    return {
      color: '#2196F3',
      bgColor: 'linear-gradient(45deg, #2196F3, #1976D2)',
      icon: ''
    };
  }
  
  // طرح پیش‌فرض
  return {
    color: ADMIN_THEME.primary,
    bgColor: `linear-gradient(45deg, ${ADMIN_THEME.primary}, #2196F3)`,
    icon: '📄'
  };
};

const JobAdminDetailsSkeleton: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
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

const JobAdminDetails: React.FC<JobAdminDetailsProps> = ({ job, onApprove, onReject, onDelete, onClose }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // تابع دریافت اطلاعات به‌روز اشتراک
  const fetchSubscriptionData = async () => {
    if (!job?.advertisement?.subscription) {
      setSubscriptionData(null);
      return;
    }

    setLoadingSubscription(true);
    try {
      // ابتدا سعی کن از endpoint اشتراک‌ها اطلاعات رو دریافت کن
      const response = await apiGet(`/subscriptions/advertisement-subscription/${job.advertisement.subscription}/`);
      setSubscriptionData(response.data);
    } catch (error) {
      console.error('خطا در دریافت اطلاعات اشتراک:', error);
      
      // اگر از endpoint اشتراک‌ها نتوانست، از endpoint سفارش‌ها سعی کن
      try {
        const ordersResponse = await apiGet(`/orders/subscriptions/`);
        const allOrders = (ordersResponse.data as any).results || ordersResponse.data || [];
        
        // جستجو در سفارش‌ها برای پیدا کردن اشتراک مربوطه
        const relatedOrder = allOrders.find((order: any) => {
          if (!order.advertisement) return false;
          
          // جستجو در تمام IDهای ممکن
          const searchIds = [
            job.advertisement?.id,
            job.id,
            job.advertisement
          ].filter(Boolean);
          
          return searchIds.some(searchId => {
            if (typeof order.advertisement === 'object' && order.advertisement?.id) {
              return order.advertisement.id === searchId;
            }
            if (typeof order.advertisement === 'string') {
              return order.advertisement === searchId;
            }
            return false;
          });
        });
        
        if (relatedOrder) {
          // تبدیل فرمت سفارش به فرمت اشتراک
          const formattedSubscription = {
            id: relatedOrder.id,
            plan: {
              id: relatedOrder.plan?.id,
              name: relatedOrder.plan?.name || 'نامشخص',
              price_per_day: relatedOrder.plan?.price_per_day
            },
            subscription_status: relatedOrder.payment_status || 'pending',
            duration: relatedOrder.durations || 0,
            durations: relatedOrder.durations,
            start_date: relatedOrder.created_at,
            end_date: relatedOrder.updated_at,
            created_at: relatedOrder.created_at,
            updated_at: relatedOrder.updated_at,
            total_price: relatedOrder.total_price,
            payment_status: relatedOrder.payment_status,
            title: relatedOrder.title,
            advertisement: relatedOrder.advertisement,
            subscription: relatedOrder.subscription
          };
          setSubscriptionData(formattedSubscription);
        } else {
          // در صورت خطا، از اطلاعات موجود استفاده کن
          setSubscriptionData(job.subscription_detail);
        }
      } catch (ordersError) {
        console.error('خطا در دریافت اطلاعات از سفارش‌ها:', ordersError);
        // در صورت خطا، از اطلاعات موجود استفاده کن
        setSubscriptionData(job.subscription_detail);
      }
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    if (job) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [job]);

  // دریافت اطلاعات اشتراک هنگام تغییر job
  useEffect(() => {
    fetchSubscriptionData();
  }, [job?.advertisement?.subscription]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!job) {
        setPayments([]);
        setLoadingPayments(false);
        return;
      }

      setLoadingPayments(true);
      
      try {
        // دریافت تمام سفارش‌ها
        const res = await apiGet(`/orders/subscriptions/`);
        const allOrders = (res.data as any).results || res.data || [];
        
        // آرایه‌ای از IDهای مختلف برای جستجو
        const searchIds = [
          job.advertisement?.id,
          job.id,
          job.advertisement
        ].filter(Boolean); // فقط مقادیر truthy
        
        // جستجوی جامع
        let foundOrders = allOrders.filter((order: any) => {
          if (!order.advertisement) return false;
          
          // جستجو در تمام IDهای ممکن
          return searchIds.some(searchId => {
            // اگر advertisement یک object است
            if (typeof order.advertisement === 'object' && order.advertisement?.id) {
              return order.advertisement.id === searchId;
            }
            
            // اگر advertisement یک string ID است
            if (typeof order.advertisement === 'string') {
              return order.advertisement === searchId;
            }
            
            return false;
          });
        });
        
        // اگر هیچ سفارشی پیدا نشد و subscription_orders موجود است
        if (foundOrders.length === 0 && job.subscription_orders && job.subscription_orders.length > 0) {
          
          // تلاش برای دریافت جزئیات هر سفارش
          const orderPromises = job.subscription_orders.map(async (order: any) => {
            try {
              const orderRes = await apiGet(`/orders/subscriptions/${order.id}/`);
              return orderRes.data;
            } catch (err) {
              console.error(`خطا در دریافت جزئیات سفارش ${order.id}:`, err);
              // در صورت خطا، از اطلاعات محدود موجود استفاده کن
              return {
                id: order.id,
                payment_status: order.payment_status,
                total_price: null,
                durations: null,
                created_at: null,
                owner: null,
                plan: null,
                advertisement: null
              };
            }
          });
          
          const orderDetails = await Promise.all(orderPromises);
          setPayments(orderDetails);
        } else {
          setPayments(foundOrders);
        }
        
      } catch (err) {
        console.error('خطا در دریافت پرداخت‌ها:', err);
        
        // fallback: استفاده از subscription_orders اگر موجود باشد
        if (job.subscription_orders && job.subscription_orders.length > 0) {
          const fallbackPayments = job.subscription_orders.map((order: any) => ({
            id: order.id,
            payment_status: order.payment_status,
            total_price: null,
            durations: null,
            created_at: null,
            owner: null,
            plan: null,
            advertisement: null
          }));
          setPayments(fallbackPayments);
        } else {
          setPayments([]);
        }
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [job?.advertisement?.id, job?.id, job?.subscription_orders]);

  if (!job) return null;
  
  if (loading) {
    return <JobAdminDetailsSkeleton isMobile={isMobile} />;
  }
  
  // استفاده از subscriptionData state به جای job.subscription_detail
  const currentSubscription = subscriptionData || job.subscription_detail;

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
          border: `2px solid ${ADMIN_THEME.bgLight}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          width: 36,
          height: 36,
          '&:hover': { 
            bgcolor: ADMIN_THEME.bgLight,
            borderColor: ADMIN_THEME.primary
          }
        }}
      >
        <CloseIcon sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
      </IconButton>



      {/* کارت اصلی جزئیات آگهی - مشابه پنل کارفرما با استایل ادمین */}
      <Card
        elevation={0} 
        sx={{ 
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          borderRadius: 3,
          overflow: 'hidden',
          mb: 2
        }}
      >
        {/* هدر */}
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  color: ADMIN_THEME.primary,
                  mb: 1.5,
                  lineHeight: 1.3
                }}
              >
                {job.title}
              </Typography>
                  
              {/* اطلاعات اساسی */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 3 }}
                sx={{ color: 'text.secondary', fontSize: '0.9rem' }}
              >
                {/* اطلاعات شرکت با لوگو بزرگ و مشخص */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {job.company_detail?.logo ? (
                    <Avatar
                      src={job.company_detail.logo}
                      alt={job.company_detail.name}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        border: `3px solid ${ADMIN_THEME.primary}40`,
                        boxShadow: `0 4px 12px ${ADMIN_THEME.primary}25`
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{ 
                        width: 48, 
                        height: 48,
                        bgcolor: `${ADMIN_THEME.primary}15`,
                        border: `3px solid ${ADMIN_THEME.primary}40`
                      }}
                    >
                      <BusinessIcon 
                        sx={{ 
                          fontSize: 28, 
                          color: ADMIN_THEME.primary
                        }} 
                      />
                    </Avatar>
                  )}
                  <Typography
                    component="span"
                    sx={{
                      color: ADMIN_THEME.primary,
                      fontWeight: 800,
                      fontSize: '1.3rem'
                    }}
                  >
                    {job.company_detail?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 16 }} />
                  {job.location_detail?.name}
                  {job.location_detail?.province && `, ${typeof job.location_detail.province === 'object' && job.location_detail.province && 'name' in (job.location_detail.province as any)
                    ? (job.location_detail.province as any).name
                    : job.location_detail.province}`}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon sx={{ fontSize: 16 }} />
                  {job.created_at ? formatDate(job.created_at) : 'نامشخص'}
                </Box>
              </Stack>
            </Box>

            {/* برچسب‌ها */}
            <Stack direction="row" spacing={1}>
              {isSpecialSubscription(job) && (
                <Chip
                  label="نردبان"
                  size="small"
                  sx={{
                    bgcolor: '#e53935',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              )}
              <Chip
                label={getStatusText(job.status).text}
                size="small"
                sx={{
                  bgcolor: getStatusText(job.status).color,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 0.5,
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* محتوای اصلی */}
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* توضیحات شغل */}
          {job.description && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  fontSize: '1.1rem',
                  color: ADMIN_THEME.primary 
                }}
              >
                توضیحات شغل
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {job.description}
              </Typography>
            </Box>
          )}

          {/* شرایط و مزایا */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 600, 
                mb: 2.5, 
                fontSize: '1.1rem',
                color: ADMIN_THEME.primary
              }}
            >
              شرایط و مزایا
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
              gap: 2.5 
            }}>
              {/* حقوق */}
              {job.salary && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${ADMIN_THEME.primary}08`,
                      color: ADMIN_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <PaidIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      حقوق
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: ADMIN_THEME.primary,
                        fontSize: '0.95rem',
                        fontWeight: 600
                      }}
                    >
                      {getSalaryText(job.salary)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* نوع کار */}
              {job.job_type && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${ADMIN_THEME.primary}08`,
                      color: ADMIN_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <WorkIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      نوع کار
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getJobTypeText(job.job_type)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* مدرک تحصیلی */}
              {job.degree && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${ADMIN_THEME.primary}08`,
                      color: ADMIN_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      مدرک تحصیلی
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getDegreeText(job.degree)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* جنسیت */}
              {job.gender && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${ADMIN_THEME.primary}08`,
                      color: ADMIN_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      جنسیت
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getGenderText(job.gender)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* وضعیت سربازی */}
              {job.soldier_status && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${ADMIN_THEME.primary}08`,
                      color: ADMIN_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <MilitaryTechIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      وضعیت نظام وظیفه
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {getSoldierStatusText(job.soldier_status)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* گروه کاری */}
              {job.industry_detail?.name && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${ADMIN_THEME.primary}08`,
                      color: ADMIN_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <CategoryIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      گروه کاری
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}
                    >
                      {job.industry_detail.name}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* کارفرما */}
              {job.employer_detail?.full_name && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${ADMIN_THEME.primary}08`,
                      color: ADMIN_THEME.primary,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: '1.1rem' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mb: 0.25
                      }}
                    >
                      کارفرما
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        '&:hover': { color: ADMIN_THEME.primary }
                      }}
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          if (job.employer_detail?.phone) {
                            // جستجو بر اساس شماره تلفن (یونیک‌ترین گزینه)
                            window.location.hash = `#users?search=${job.employer_detail.phone}`;
                          } else if (job.employer_detail?.full_name) {
                            window.location.hash = `#users?search=${encodeURIComponent(job.employer_detail.full_name)}`;
                          }
                        }
                      }}
                    >
                      {job.employer_detail.full_name}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* اشتراک و پرداخت */}
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2} mb={2}>
        {/* اشتراک */}
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
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
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
                      اشتراک آگهی
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                      جزئیات طرح اشتراک
                    </Typography>
                  </Box>
                </Stack>
                <IconButton
                  onClick={fetchSubscriptionData}
                  disabled={loadingSubscription}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    },
                    '&:disabled': {
                      color: 'rgba(255,255,255,0.5)',
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {loadingSubscription ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ color: ADMIN_THEME.primary }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    در حال دریافت اطلاعات اشتراک...
                  </Typography>
                </Box>
              ) : currentSubscription ? (
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>نام طرح:</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {currentSubscription.plan?.name ? (
                        (() => {
                          const planInfo = getPlanInfo(currentSubscription.plan.name);
                          return (
                            <Chip
                              label={currentSubscription.plan.name}
                              sx={{
                                background: planInfo.bgColor,
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                px: 1.5,
                                borderRadius: 2,
                                boxShadow: `0 4px 12px ${planInfo.color}40`,
                                '& .MuiChip-label': {
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }
                              }}
                              icon={<span style={{ fontSize: '0.8rem' }}>{planInfo.icon}</span>}
                            />
                          );
                        })()
                      ) : (
                        <Typography variant="body2" fontWeight={600} sx={{ color: ADMIN_THEME.primary }}>
                          نامشخص
                        </Typography>
                      )}
            </Box>
          </Box>
                  
                  {[
                    { label: 'قیمت روزانه', value: currentSubscription.plan?.price_per_day ? new Intl.NumberFormat('fa-IR').format(currentSubscription.plan.price_per_day) + ' تومان' : 'نامشخص', icon: PaidIcon, color: '#10B981' },
                    { label: 'مدت', value: currentSubscription.synced_duration || currentSubscription.durations || currentSubscription.duration ? new Intl.NumberFormat('fa-IR').format(currentSubscription.synced_duration || currentSubscription.durations || currentSubscription.duration) + ' روز' : 'نامشخص', icon: AccessTimeIcon, color: '#3B82F6' },
                    { label: 'تاریخ شروع', value: currentSubscription.start_date ? new Date(currentSubscription.start_date).toLocaleDateString('fa-IR') : 'نامشخص', icon: EventIcon, color: '#8B5CF6' },
                    { label: 'تاریخ پایان', value: currentSubscription.end_date ? new Date(currentSubscription.end_date).toLocaleDateString('fa-IR') : 'نامشخص', icon: EventIcon, color: '#EF4444' }
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
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>اشتراکی ثبت نشده</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* پرداخت */}
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
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white'
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 48, 
                  height: 48,
                  backdropFilter: 'blur(10px)'
                }}>
                  <MonetizationOnIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Avatar>
                            <Box>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                    پرداخت‌ها {loadingPayments ? '' : `(${payments.length})`}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                    {loadingPayments ? 'در حال بارگذاری...' : 'تمام تراکنش‌های مالی'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {loadingPayments ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: `${ADMIN_THEME.bgLight}`, color: 'text.secondary', width: 48, height: 48, mx: 'auto', mb: 1.5 }}>
                    <MonetizationOnIcon fontSize="medium" />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>در حال بارگذاری...</Typography>
                </Box>
                            ) : payments && payments.length > 0 ? (
                <Stack spacing={2}>
                  {payments.map((payment, paymentIndex) => {
                    const getPaymentStatusColor = (status: string) => {
                      const colors = {
                        'pending': '#F59E0B',
                        'paid': '#10B981',
                        'failed': '#EF4444',
                        'canceled': '#6B7280'
                      };
                      return colors[status as keyof typeof colors] || '#6B7280';
                    };

                    const getPaymentStatusIcon = (status: string) => {
                      const icons = {
                        'pending': AccessTimeIcon,
                        'paid': CheckCircleIcon,
                        'failed': CancelIcon,
                        'canceled': CancelIcon
                      };
                      return icons[status as keyof typeof icons] || CheckCircleIcon;
                    };

                    return (
                      <Box 
                        key={payment.id || paymentIndex} 
                        sx={{ 
                          p: 2,
                          borderRadius: 3,
                          border: `2px solid ${getPaymentStatusColor(payment.payment_status)}20`,
                          bgcolor: `${getPaymentStatusColor(payment.payment_status)}08`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: getPaymentStatusColor(payment.payment_status),
                          }
                        }}
                      >
                        <Stack spacing={1.5}>
                          {/* هدر پرداخت */}
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                پرداخت #{paymentIndex + 1}
                              </Typography>
                              <Chip
                                label={getStatusText(payment.payment_status).text}
                                size="small"
                                sx={{
                                  bgcolor: getStatusText(payment.payment_status).color,
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
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
                          
                          {/* شماره سفارش */}
                          <Typography 
                            variant="body2" 
                            fontWeight={600} 
                            sx={{ 
                              fontFamily: 'monospace',
                              bgcolor: ADMIN_THEME.bgVeryLight,
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                              border: `1px solid ${ADMIN_THEME.bgLight}`,
                              fontSize: '0.75rem',
                              letterSpacing: '0.5px',
                              color: ADMIN_THEME.primary,
                              textAlign: 'center'
                            }}
                          >
                            {payment.id}
                          </Typography>
                          
                          {/* جزئیات پرداخت */}
                          <Box display="grid" gridTemplateColumns={{ xs: "1fr 1fr", md: "1fr 1fr" }} gap={1}>
                            {[
                              { 
                                label: 'مبلغ', 
                                value: payment.total_price ? new Intl.NumberFormat('fa-IR').format(payment.total_price) + ' تومان' : 'نامشخص', 
                                icon: PaidIcon, 
                                color: '#10B981' 
                              },
                              { 
                                label: 'وضعیت', 
                                value: getStatusText(payment.payment_status).text, 
                                icon: getPaymentStatusIcon(payment.payment_status), 
                                color: getStatusText(payment.payment_status).color 
                              },
                              { 
                                label: 'تاریخ', 
                                value: payment.created_at ? new Date(payment.created_at).toLocaleDateString('fa-IR') : 'نامشخص', 
                                icon: EventIcon, 
                                color: '#8B5CF6' 
                              },
                              { 
                                label: 'مدت', 
                                value: payment.durations ? new Intl.NumberFormat('fa-IR').format(payment.durations) + ' روز' : 'نامشخص', 
                                icon: AccessTimeIcon, 
                                color: '#F59E0B' 
                              }
                            ].map((item, index) => (
                              <Box key={index} sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: 2,
                                bgcolor: `${item.color}05`,
                                border: `1px solid ${item.color}15`,
                                minHeight: 60
                              }}>
                                <Avatar sx={{ bgcolor: `${item.color}15`, color: item.color, width: 24, height: 24, mb: 0.5 }}>
                                  <item.icon sx={{ fontSize: '14px' }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem" textAlign="center">
                                  {item.label}
                                </Typography>
                                <Typography variant="caption" fontWeight={600} sx={{ color: ADMIN_THEME.dark, fontSize: '0.75rem', textAlign: 'center' }}>
                                  {item.value}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: `${ADMIN_THEME.bgLight}`, color: 'text.secondary', width: 48, height: 48, mx: 'auto', mb: 1.5 }}>
                    <MonetizationOnIcon fontSize="medium" />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>پرداختی ثبت نشده</Typography>
          </Box>
              )}
              
              {/* لینک به صفحه پرداخت‌ها */}
              <Box sx={{ 
                mt: 3,
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
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // جستجو بر اساس شماره سفارش اگر پرداختی وجود داشته باشد
                  if (payments && payments.length > 0 && payments[0].id) {
                    window.location.hash = `#payments?search=${payments[0].id}`;
                  } else if (job.employer_detail?.full_name) {
                    window.location.hash = `#payments?search=${encodeURIComponent(job.employer_detail.full_name)}`;
                  } else if (job.id) {
                    window.location.hash = `#payments?search=${job.id}`;
                  } else {
                    window.location.hash = '#payments';
                  }
                }
              }}
              >
                <Avatar sx={{ 
                  bgcolor: `${ADMIN_THEME.primary}15`, 
                  color: ADMIN_THEME.primary,
                  width: 36,
                  height: 36
                }}>
                  <MonetizationOnIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Typography variant="body2" fontWeight={600} sx={{ color: ADMIN_THEME.primary, textAlign: 'center' }}>
                  مشاهده پرداخت‌های مرتبط با این آگهی
                </Typography>
              </Box>
          </Box>
          </CardContent>
        </Card>
        </Box>

        {/* دکمه‌های عملیات */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, white 100%)`
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="subtitle1" fontWeight="600" sx={{ color: ADMIN_THEME.primary, textAlign: 'center' }}>
              عملیات مدیریتی
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ width: '100%' }}>
              {onApprove && (job.status === 'R' || job.status === 'P') && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircleIcon fontSize="small" />}
                  onClick={onApprove}
                  sx={{
                    background: 'linear-gradient(45deg, #10B981, #059669)',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    minWidth: 100,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #059669, #047857)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  تایید
                </Button>
              )}
              
              {onReject && (job.status === 'A' || job.status === 'P') && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CancelIcon fontSize="small" />}
                  onClick={onReject}
                  sx={{
                    background: 'linear-gradient(45deg, #EF4444, #DC2626)',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    minWidth: 100,
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #DC2626, #B91C1C)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  رد
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DeleteIcon fontSize="small" />}
                  onClick={onDelete}
                  sx={{
                    background: 'linear-gradient(45deg, #EF4444, #DC2626)',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    minWidth: 100,
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #DC2626, #B91C1C)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  حذف
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default JobAdminDetails; 