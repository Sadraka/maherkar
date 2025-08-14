'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, IconButton, Button, Skeleton, Avatar, Card, CardContent, Stack, Divider, Link, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress } from '@mui/material';
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
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';


import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { apiGet, apiPut } from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface SubscriptionRecord {
  id: string;
  owner: {
    id?: string;
    full_name: string;
    phone: string;
    user_type?: string; // نوع کاربر: EM, JS
  };
  plan: {
    id?: string;
    name: string;
    price_per_day?: number;
    plan_type?: string; // نوع طرح: B, J, R
  };
  subscription_status: string;
  duration: number;
  durations?: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  total_price?: number;
  payment_status?: string;
  title?: string;
  advertisement?: {
    id?: string;
    title: string;
  };
  subscription?: string;
  ad_type?: string; // نوع آگهی: J, R
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_per_day: number;
  description?: string;
  active: boolean;
  is_free: boolean;
  plan_type?: string; // نوع طرح: B, J, R
}

interface SubscriptionAdminDetailsProps {
  subscription: SubscriptionRecord;
  onClose: () => void;
  onUpdate?: (updatedSubscription: SubscriptionRecord) => void;
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

const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
};

const gregorianToJalali = (gy: number, gm: number, gd: number): [number, number, number] => {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = 0;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'نامشخص';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'نامشخص';
    const [year, month, day] = gregorianToJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    const formattedDate = `${convertToPersianNumbers(year.toString().padStart(4, '0'))}/${convertToPersianNumbers(month.toString().padStart(2, '0'))}/${convertToPersianNumbers(day.toString().padStart(2, '0'))}`;
    return formattedDate;
  } catch (error) {
    return 'نامشخص';
  }
};

const formatAmount = (amount?: number) => {
  if (!amount) return 'نامشخص';
  return `${convertToPersianNumbers(amount.toLocaleString())} تومان`;
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

// تابع تبدیل نوع آگهی به متن فارسی
const getAdTypeText = (adType: string) => {
  const typeMap = {
    'J': 'آگهی شغل',
    'R': 'آگهی رزومه'
  };
  return typeMap[adType as keyof typeof typeMap] || adType;
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

const SubscriptionAdminDetailsSkeleton: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <Box sx={{ p: 2 }}>
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
      {!isMobile && <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />}
    </Stack>
  </Box>
);

const SubscriptionAdminDetails: React.FC<SubscriptionAdminDetailsProps> = ({ subscription, onClose, onUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubscription, setEditedSubscription] = useState<SubscriptionRecord>(subscription);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState<SubscriptionPlan[]>([]);

  // دریافت لیست طرح‌ها
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const response = await apiGet('/subscriptions/plans/');
        setPlans(response.data as SubscriptionPlan[]);
      } catch (error) {
        console.error('خطا در دریافت طرح‌ها:', error);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // فیلتر کردن طرح‌ها بر اساس نوع کاربر
  useEffect(() => {
    if (plans.length === 0) {
      setFilteredPlans([]);
      return;
    }

    const userType = subscription.owner?.user_type;
    const adType = subscription.ad_type;
    
    let filtered = plans.filter(plan => {
      // اگر طرح برای همه است (B) همیشه نمایش داده شود
      if (plan.plan_type === 'B') {
        return true;
      }
      
      // اگر نوع آگهی مشخص است، بر اساس آن فیلتر کن
      if (adType && plan.plan_type === adType) {
        return true;
      }
      
      // اگر نوع کاربر مشخص است، بر اساس آن فیلتر کن
      if (userType === 'EM' && plan.plan_type === 'J') {
        return true;
      }
      
      if (userType === 'JS' && plan.plan_type === 'R') {
        return true;
      }
      
      return false;
    });

    setFilteredPlans(filtered);
  }, [plans, subscription.owner?.user_type, subscription.ad_type]);

  const statusColor = getStatusColor(subscription.payment_status || subscription.subscription_status);
  const StatusIcon = getStatusIcon(subscription.payment_status || subscription.subscription_status);
  
  // حفظ رنگ اصلی در حالت ویرایش
  const currentStatusColor = isEditing ? statusColor : statusColor;

  const navigateToUsers = () => {
    if (typeof window !== 'undefined') {
      if (subscription.owner?.phone) {
        // جستجو بر اساس شماره تلفن (یونیک‌ترین گزینه)
        window.location.hash = `#users?search=${subscription.owner.phone}`;
      } else if (subscription.owner?.id) {
        window.location.hash = `#users?search=${subscription.owner.id}`;
      } else if (subscription.owner?.full_name) {
        window.location.hash = `#users?search=${encodeURIComponent(subscription.owner.full_name)}`;
      } else {
        window.location.hash = '#users';
      }
    }
  };

  const navigateToJobs = () => {
    if (typeof window !== 'undefined') {
      // جستجو بر اساس شناسه اشتراک یا عنوان آگهی
      if (subscription.advertisement?.id) {
        window.location.hash = `#jobs?search=${subscription.advertisement.id}`;
      } else if (subscription.advertisement?.title) {
        window.location.hash = `#jobs?search=${encodeURIComponent(subscription.advertisement.title)}`;
      } else if (subscription.id) {
        window.location.hash = `#jobs?search=${subscription.id}`;
      } else {
        window.location.hash = '#jobs';
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedSubscription(subscription);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        payment_status: editedSubscription.payment_status,
        durations: editedSubscription.duration
      };

              // اگر طرح تغییر کرده باشد
        if (editedSubscription.plan?.id && editedSubscription.plan.id !== subscription.plan?.id) {
          updateData.plan_id = editedSubscription.plan.id;
        }

        // اگر مدت زمان تغییر کرده باشد
        const currentDuration = subscription.durations || subscription.duration;
        if (editedSubscription.duration && editedSubscription.duration !== currentDuration) {
          updateData.durations = editedSubscription.duration;
        }

      const response = await apiPut(`/orders/subscriptions/${subscription.id}/`, updateData);
      
      // بروزرسانی داده‌های محلی
      const responseData = response.data as any;
      const updatedSubscription: SubscriptionRecord = {
        ...subscription,
        plan: editedSubscription.plan || subscription.plan,
        duration: editedSubscription.duration || subscription.durations || subscription.duration,
        payment_status: editedSubscription.payment_status || subscription.payment_status,
        start_date: responseData?.start_date || subscription.start_date,
        end_date: responseData?.end_date || subscription.end_date
      };
      
      // فراخوانی callback برای بروزرسانی جدول
      if (onUpdate) {
        onUpdate(updatedSubscription);
      }
      
      toast.success('اشتراک با موفقیت بروزرسانی شد');
      setIsEditing(false);
    } catch (error: any) {
      console.error('خطا در بروزرسانی اشتراک:', error);
      toast.error('خطا در بروزرسانی اشتراک');
    } finally {
      setLoading(false);
    }
  };



  const handleInputChange = (field: keyof SubscriptionRecord, value: any) => {
    setEditedSubscription(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <SubscriptionAdminDetailsSkeleton isMobile={isMobile} />;
  }

  return (
    <Box sx={{ p: 2, position: 'relative', maxWidth: '900px', mx: 'auto' }}>
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

      {/* هدر اصلی */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          background: `linear-gradient(135deg, ${ADMIN_THEME.primary}08 0%, ${ADMIN_THEME.primary}03 100%)`,
          mb: 1.5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${ADMIN_THEME.primary}, #2196F3, #9C27B0)`,
            borderRadius: '2px 2px 0 0'
          }
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: `linear-gradient(135deg, ${ADMIN_THEME.primary}, #2196F3)`,
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
                }}
              >
                <DiamondIcon sx={{ fontSize: '1.2rem' }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  sx={{ 
                    color: ADMIN_THEME.dark, 
                    mb: 0.5, 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    letterSpacing: '-0.25px'
                  }}
                >
                  {subscription.title || subscription.plan?.name || 'اشتراک آگهی'}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PersonIcon fontSize="small" sx={{ color: ADMIN_THEME.primary }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {subscription.owner?.full_name || 'نامشخص'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ReceiptIcon fontSize="small" sx={{ color: ADMIN_THEME.primary }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      شناسه پرداخت: {subscription.id}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
            <Chip
              label={getStatusText(subscription.payment_status || subscription.subscription_status)}
              icon={<StatusIcon />}
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.8rem',
                px: 2,
                py: 0.5,
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                bgcolor: `${currentStatusColor}15`,
                color: currentStatusColor,
                border: `1px solid ${currentStatusColor}30`
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
                اطلاعات اشتراک
              </Typography>
            </Stack>
          </Box>
          
          <Box sx={{ p: 1.5 }}>
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr 1fr 1fr 1fr" }} 
              gap={1}
            >
              {[
                { 
                  icon: PersonIcon, 
                  label: 'کاربر', 
                  value: subscription.owner?.full_name, 
                  color: '#3B82F6',
                  isLink: true,
                  onClick: navigateToUsers,
                  linkText: 'مشاهده کاربر'
                },
                { 
                  icon: BusinessIcon, 
                  label: 'نوع کاربر', 
                  value: getUserTypeText(subscription.owner?.user_type || ''), 
                  color: getUserTypeColor(subscription.owner?.user_type || '')
                },
                { 
                  icon: PhoneIcon, 
                  label: 'شماره تماس', 
                  value: subscription.owner?.phone, 
                  color: '#10B981' 
                },
                { 
                  icon: MonetizationOnIcon, 
                  label: 'مبلغ', 
                  value: formatAmount(subscription.total_price), 
                  color: '#F59E0B' 
                },
                { 
                  icon: CheckCircleIcon, 
                  label: 'وضعیت پرداخت', 
                  value: isEditing ? (
                    <FormControl size="small" sx={{ mt: 1, minWidth: 120 }}>
                      <Select
                        value={editedSubscription.payment_status || subscription.subscription_status}
                        onChange={(e) => handleInputChange('payment_status', e.target.value)}
                        displayEmpty
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderColor: statusColor,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: statusColor,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: statusColor,
                            },
                          },
                          '& .MuiSelect-select': {
                            color: ADMIN_THEME.dark,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }
                        }}
                      >
                        <MenuItem value="pending" sx={{ fontSize: '0.7rem' }}>در انتظار پرداخت</MenuItem>
                        <MenuItem value="paid" sx={{ fontSize: '0.7rem' }}>پرداخت شده</MenuItem>
                        <MenuItem value="canceled" sx={{ fontSize: '0.7rem' }}>لغو شده</MenuItem>
                        <MenuItem value="failed" sx={{ fontSize: '0.7rem' }}>پرداخت ناموفق</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    getStatusText(subscription.payment_status || subscription.subscription_status)
                  ), 
                  color: statusColor 
                },
                { 
                  icon: WorkIcon, 
                  label: 'آگهی مرتبط', 
                  value: subscription.title || subscription.advertisement?.title || 'آگهی ایجاد نشده', 
                  color: '#8B5CF6',
                  isLink: true,
                  onClick: navigateToJobs,
                  linkText: 'مشاهده آگهی'
                },
                { 
                  icon: CategoryIcon, 
                  label: 'نوع آگهی', 
                  value: getAdTypeText(subscription.ad_type || ''), 
                  color: getAdTypeColor(subscription.ad_type || '')
                },
                { 
                  icon: DiamondIcon, 
                  label: 'طرح', 
                  value: isEditing ? (
                    <FormControl size="small" sx={{ mt: 1, minWidth: 120 }}>
                      <Select
                        value={editedSubscription.plan?.id || subscription.plan?.id || ''}
                        onChange={(e) => {
                          const selectedPlan = filteredPlans.find(plan => plan.id === e.target.value);
                          handleInputChange('plan', selectedPlan);
                        }}
                        displayEmpty
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderColor: '#EF4444',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#EF4444',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#EF4444',
                            },
                          },
                          '& .MuiSelect-select': {
                            color: ADMIN_THEME.dark,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }
                        }}
                      >
                        {plansLoading ? (
                          <MenuItem disabled>در حال بارگذاری...</MenuItem>
                        ) : filteredPlans.length === 0 ? (
                          <MenuItem disabled>هیچ طرحی برای این نوع کاربر وجود ندارد</MenuItem>
                        ) : (
                          filteredPlans.map((plan) => (
                            <MenuItem key={plan.id} value={plan.id} sx={{ fontSize: '0.7rem' }}>
                              {plan.name} {plan.plan_type && `(${plan.plan_type === 'B' ? 'همه' : plan.plan_type === 'J' ? 'شغل' : 'رزومه'})`}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  ) : (
                    `${subscription.plan?.name || 'نامشخص'}${subscription.plan?.plan_type ? ` (${subscription.plan.plan_type === 'B' ? 'همه' : subscription.plan.plan_type === 'J' ? 'شغل' : 'رزومه'})` : ''}`
                  ), 
                  color: '#EF4444'
                },
                { 
                  icon: AccessTimeIcon, 
                  label: 'مدت', 
                  value: isEditing ? (
                    <TextField
                      type="number"
                      value={editedSubscription.duration || subscription.durations || subscription.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      size="small"
                      sx={{ 
                        mt: 1,
                        '& .MuiOutlinedInput-root': {
                          borderColor: '#06B6D4',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#06B6D4',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#06B6D4',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: ADMIN_THEME.dark,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textAlign: 'center',
                        }
                      }}
                    />
                  ) : (
                    `${convertToPersianNumbers(subscription.durations || subscription.duration)} روز`
                  ), 
                  color: '#06B6D4' 
                },
                { 
                  icon: EventIcon, 
                  label: 'تاریخ شروع', 
                  value: formatDate(subscription.start_date), 
                  color: '#84CC16' 
                },
                { 
                  icon: EventIcon, 
                  label: 'تاریخ پایان', 
                  value: formatDate(subscription.end_date), 
                  color: '#F97316' 
                }
              ].map((item, index) => (
                <Card key={index} elevation={0} sx={{ 
                  p: 0.5, 
                  border: `1px solid ${ADMIN_THEME.bgLight}`,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  cursor: item.isLink ? 'pointer' : 'default',
                  minHeight: 55,
                  '&:hover': {
                    transform: item.isLink ? 'translateY(-1px)' : 'none',
                    boxShadow: item.isLink ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    borderColor: item.isLink ? item.color : ADMIN_THEME.bgLight,
                  }
                }}
                onClick={item.isLink ? item.onClick : undefined}
                >
                  <Stack spacing={0.25} alignItems="center" textAlign="center">
                    <Avatar sx={{ 
                      bgcolor: `${item.color}15`, 
                      color: item.color,
                      width: 28, 
                      height: 28,
                      fontSize: '0.8rem'
                    }}>
                      <item.icon sx={{ fontSize: '0.9rem' }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.7rem' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ 
                      color: isEditing ? ADMIN_THEME.dark : ADMIN_THEME.dark,
                      fontSize: '0.7rem',
                      lineHeight: 1.1,
                      minHeight: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.value || 'نامشخص'}
                    </Typography>
                    {item.isLink && item.linkText && !isEditing && (
                      <Typography variant="caption" sx={{ 
                        color: item.color, 
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}>
                        {item.linkText}
                      </Typography>
                    )}
                  </Stack>
                </Card>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

            {/* دکمه‌های عملیات */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          mb: 2,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                size="small"
                sx={{
                  borderColor: ADMIN_THEME.primary,
                  color: ADMIN_THEME.primary,
                  '&:hover': {
                    borderColor: ADMIN_THEME.primary,
                    bgcolor: `${ADMIN_THEME.primary}08`
                  }
                }}
              >
                ویرایش
              </Button>
            ) : (
              <>
                <Button
                  variant="text"
                  startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  size="small"
                  style={{
                    backgroundColor: ADMIN_THEME.primary,
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: `${ADMIN_THEME.dark} !important`
                    }
                  }}
                >
                  ذخیره
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                  size="small"
                  sx={{
                    borderColor: ADMIN_THEME.border,
                    color: ADMIN_THEME.dark,
                    bgcolor: 'white',
                    '&:hover': {
                      borderColor: ADMIN_THEME.border,
                      bgcolor: ADMIN_THEME.bgLight,
                      color: ADMIN_THEME.dark
                    }
                  }}
                >
                  انصراف
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* هشدار */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>توجه:</strong> تغییرات در این بخش مستقیماً بر روی اشتراک کاربر تأثیر می‌گذارد. طرح‌های قابل انتخاب بر اساس نوع کاربر ({getUserTypeText(subscription.owner?.user_type || '')}) و نوع آگهی ({getAdTypeText(subscription.ad_type || '')}) فیلتر شده‌اند.
        </Typography>
      </Alert>


    </Box>
  );
};

export default SubscriptionAdminDetails; 