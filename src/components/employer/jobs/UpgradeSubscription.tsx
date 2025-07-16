import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { 
  Upgrade as UpgradeIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { EMPLOYER_THEME } from '@/constants/colors';
import { apiGet, apiPost } from '@/lib/axios';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

interface UpgradeSubscriptionProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  active: boolean;
  is_free: boolean;
  features?: string[];
}

interface OrderResponse {
  id: string;
  [key: string]: any;
}

interface PaymentResponse {
  url: string;
  [key: string]: any;
}

/**
 * کامپوننت ارتقا اشتراک آگهی شغلی
 */
export default function UpgradeSubscription({ 
  jobId, 
  open, 
  onClose, 
  onUpgradeSuccess 
}: UpgradeSubscriptionProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [duration, setDuration] = useState(7); // پیش‌فرض 7 روز

  // بارگذاری طرح‌های اشتراک از بک‌اند
  useEffect(() => {
    if (open) {
      const fetchSubscriptionPlans = async () => {
        try {
          setLoading(true);
          const response = await apiGet('/subscriptions/plans/');
          
          // فیلتر کردن طرح‌های فعال و غیررایگان
          const activePaidPlans = (response.data as SubscriptionPlan[]).filter(
            plan => plan.active && !plan.is_free
          );
          
          setSubscriptionPlans(activePaidPlans);
          setError(null);
        } catch (err: any) {
          console.error('خطا در دریافت طرح‌های اشتراک:', err);
          setError('خطا در بارگذاری طرح‌های اشتراک');
        } finally {
          setLoading(false);
        }
      };

      fetchSubscriptionPlans();
    }
  }, [open]);

  // محاسبه قیمت کل (شامل مالیات 10%)
  const calculateTotalPrice = (plan: SubscriptionPlan) => {
    const basePrice = plan.price_per_day * duration;
    const taxAmount = Math.floor(basePrice * 10 / 100);
    return basePrice + taxAmount;
  };

  // محاسبه قیمت بدون مالیات
  const calculateBasePrice = (plan: SubscriptionPlan) => {
    return plan.price_per_day * duration;
  };

  // محاسبه مالیات
  const calculateTax = (plan: SubscriptionPlan) => {
    const basePrice = calculateBasePrice(plan);
    return Math.floor(basePrice * 10 / 100);
  };

  // فرمت قیمت با اعداد فارسی
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  // انتخاب طرح
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  // ارتقا اشتراک
  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      setUpgrading(true);
      
      // ایجاد سفارش اشتراک - تطابق با بک‌اند
      const orderResponse = await apiPost('/orders/subscriptions/', {
        advertisement_id: jobId,
        plan_id: selectedPlan.id,
        durations: duration,
        ad_type: 'J' // J برای Job
      });

      const orderData = orderResponse.data as OrderResponse;
      if (!orderData?.id) {
        throw new Error('خطا در ایجاد سفارش');
      }

      // ایجاد لینک پرداخت - تطابق با بک‌اند
      const paymentResponse = await apiGet(`/payments/zarinpal-pay/${orderData.id}/`);
      
      // بررسی پاسخ بک‌اند - فرمت جدید
      if (paymentResponse.data && 
          typeof paymentResponse.data === 'object' && 
          'status' in paymentResponse.data && 
          paymentResponse.data.status === true &&
          'url' in paymentResponse.data && 
          paymentResponse.data.url) {
        // هدایت به درگاه پرداخت
        window.location.href = paymentResponse.data.url as string;
      } else {
        // بررسی کد خطا از بک‌اند
        const errorCode = (paymentResponse.data as any)?.code || 'unknown';
        let errorMessage = 'خطا در دریافت لینک پرداخت';
        
        if (errorCode === 'timeout') {
          errorMessage = 'زمان درخواست به پایان رسید. لطفاً دوباره تلاش کنید.';
        } else if (errorCode === 'connection error') {
          errorMessage = 'خطا در اتصال به درگاه پرداخت. لطفاً اتصال اینترنت خود را بررسی کنید.';
        }
        
        throw new Error(errorMessage);
      }

    } catch (err: any) {
      console.error('خطا در ارتقا اشتراک:', err);
      setError(err.message || err.response?.data?.Massage || err.response?.data?.Message || 'خطا در ارتقا اشتراک');
    } finally {
      setUpgrading(false);
    }
  };

  // رندر محتوا
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (subscriptionPlans.length === 0) {
      return (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          در حال حاضر طرح اشتراک ویژه‌ای موجود نیست.
        </Alert>
      );
    }

    return (
      <Box>
        {/* توضیحات */}
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            آگهی شما با موفقیت ثبت شد! برای افزایش بازدید و نمایش در بالای لیست، می‌توانید اشتراک خود را ارتقا دهید.
          </Typography>
        </Alert>

        {/* انتخاب مدت زمان */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            مدت زمان اشتراک:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[3, 7, 15, 30].map((days) => (
              <Chip
                key={days}
                label={`${formatPrice(days)} روز`}
                variant={duration === days ? 'filled' : 'outlined'}
                color={duration === days ? 'primary' : 'default'}
                onClick={() => setDuration(days)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>

        {/* طرح‌های اشتراک */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
            gap: 2 
          }}
        >
          {subscriptionPlans.map((plan) => {
            const totalPrice = calculateTotalPrice(plan);
            const basePrice = calculateBasePrice(plan);
            const taxAmount = calculateTax(plan);
            const isSelected = selectedPlan?.id === plan.id;
            
            return (
              <Card
                key={plan.id}
                elevation={0}
                sx={{
                  border: isSelected ? `2px solid ${EMPLOYER_THEME.primary}` : '1px solid #e0e0e0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: EMPLOYER_THEME.primary,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => handleSelectPlan(plan)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {plan.description}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckCircleIcon sx={{ color: EMPLOYER_THEME.primary }} />
                    )}
                  </Box>

                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ 
                      color: EMPLOYER_THEME.primary,
                      fontSize: { xs: '1.5rem', sm: '1.8rem' }
                    }}>
                      {formatPrice(basePrice)} تومان
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      برای {formatPrice(duration)} روز
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      + ۱۰٪ مالیات بر ارزش افزوده
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ 
                      color: EMPLOYER_THEME.primary, 
                      mt: 1,
                      fontSize: { xs: '1.1rem', sm: '1.3rem' }
                    }}>
                      جمع کل: {formatPrice(totalPrice)} تومان
                    </Typography>
                  </Box>

                  {/* ویژگی‌های طرح از بک‌اند یا پیش‌فرض */}
                  <Box>
                    {(plan.features && plan.features.length > 0 ? plan.features : [
                      'نمایش در بالای لیست آگهی‌ها',
                      'هایلایت شدن با رنگ خاص', 
                      'افزایش بازدید تا 5 برابر',
                      'پشتیبانی اولویت‌دار'
                    ]).map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* دکمه‌های عملیات */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={upgrading}
            sx={{
              borderColor: EMPLOYER_THEME.primary,
              color: EMPLOYER_THEME.primary,
              px: 4
            }}
          >
            بعداً
          </Button>
          
          <Button
            variant="contained"
            onClick={handleUpgrade}
            disabled={!selectedPlan || upgrading}
            startIcon={upgrading ? null : <PaymentIcon />}
            sx={{
              backgroundColor: EMPLOYER_THEME.primary,
              '&:hover': { backgroundColor: EMPLOYER_THEME.dark },
              px: 4
            }}
          >
            {upgrading ? 'در حال پردازش...' : 'پرداخت و ارتقا'}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UpgradeIcon sx={{ color: EMPLOYER_THEME.primary }} />
          <Typography variant="h6" fontWeight="bold">
            ارتقا اشتراک آگهی
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 