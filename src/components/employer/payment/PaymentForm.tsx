import React, { useState } from 'react';
import { Typography, Box, Button, Paper, Card, CardContent, Divider, Alert, AlertTitle, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { EMPLOYER_THEME } from '@/constants/colors';
import { apiPost, apiGet } from '@/lib/axios';

interface PaymentFormProps {
  subscription: any;
  returnTo: string;
}

/**
 * کامپوننت فرم پرداخت
 */
const PaymentForm = ({ subscription, returnTo }: PaymentFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // مرحله 1: ایجاد سفارش اشتراک  
      const orderResponse = await apiPost('/orders/', {
        plan_id: subscription.plan?.id, // شناسه طرح
        advertisement_id: subscription.advertisement?.id, // شناسه آگهی موجود
        duration: subscription.duration || 1, // مدت اشتراک
      });

      if (!orderResponse.data || typeof orderResponse.data !== 'object' || !('id' in orderResponse.data)) {
        setError('خطا در ایجاد سفارش. لطفاً دوباره تلاش کنید.');
        return;
      }

      const orderId = (orderResponse.data as any).id;

      // مرحله 2: ارسال درخواست پرداخت با order_id
      const paymentResponse = await apiGet(`/payments/zarinpal-pay/${orderId}/`);

      if (paymentResponse.data && typeof paymentResponse.data === 'object' && 'url' in paymentResponse.data && paymentResponse.data.url) {
        // هدایت به درگاه زرین‌پال
        window.location.href = paymentResponse.data.url as string;
      } else {
        setError('خطا در دریافت لینک پرداخت. لطفاً دوباره تلاش کنید.');
      }
    } catch (err: any) {
      console.error('خطا در درخواست پرداخت:', err);
      setError(err.response?.data?.Message || err.response?.data?.Massage || 'خطا در برقراری ارتباط با درگاه پرداخت');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Box>
      {/* هدر */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: EMPLOYER_THEME.primary, mb: 2 }}>
          پرداخت اشتراک
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', maxWidth: 600, mx: 'auto' }}>
          تکمیل فرآیند خرید اشتراک آگهی نردبان
        </Typography>
      </Box>

      {/* نمایش خطا */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>خطا در پرداخت</AlertTitle>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* کارت اطلاعات اشتراک */}
        <Card sx={{ borderRadius: 3, border: '1px solid #f0f0f0' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <StarIcon sx={{ fontSize: 32, color: EMPLOYER_THEME.primary }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: EMPLOYER_THEME.primary }}>
                  آگهی نردبان
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  اشتراک ویژه برای نمایش در بالای لیست
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.primary' }}>
              ویژگی‌های این اشتراک:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {[
                `نمایش آگهی به مدت ${subscription.duration_days || 60} روز`,
                'نمایش در بالای لیست آگهی‌ها',
                'برچسب ویژه و بازدید بیشتر',
                'آمار تفصیلی بازدید',
                'امکان تمدید آسان',
                'پشتیبانی تلفنی'
              ].map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: EMPLOYER_THEME.primary }} />
                  <Typography variant="body2" color="text.secondary">
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* اطلاعات امنیت */}
            <Alert 
              severity="info" 
              icon={<SecurityIcon />}
              sx={{ backgroundColor: '#f8fafd', border: '1px solid #e3f2fd' }}
            >
              <Typography variant="body2">
                پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود و اطلاعات شما محفوظ است.
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* کارت خلاصه پرداخت */}
        <Card sx={{ borderRadius: 3, border: '1px solid #f0f0f0', height: 'fit-content' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: EMPLOYER_THEME.primary }}>
              خلاصه سفارش
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                نوع اشتراک:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                آگهی نردبان
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                مدت زمان:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {subscription.duration_days || 60} روز
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                مبلغ قابل پرداخت:
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: EMPLOYER_THEME.primary }}>
                {formatPrice(subscription.price)} تومان
              </Typography>
            </Box>

            {/* دکمه‌های عمل */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handlePayment}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                sx={{
                  backgroundColor: EMPLOYER_THEME.primary,
                  color: 'white',
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                  '&:hover': {
                    backgroundColor: EMPLOYER_THEME.dark,
                    boxShadow: '0 6px 16px rgba(66, 133, 244, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    boxShadow: 'none',
                    transform: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'در حال اتصال...' : 'پرداخت آنلاین'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleGoBack}
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderColor: EMPLOYER_THEME.primary,
                  color: EMPLOYER_THEME.primary,
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    borderColor: EMPLOYER_THEME.dark,
                    color: EMPLOYER_THEME.dark,
                    backgroundColor: 'rgba(66, 133, 244, 0.05)'
                  }
                }}
              >
                بازگشت
              </Button>
            </Box>

            {/* یادآوری */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              پس از پرداخت موفق، به صفحه ثبت آگهی منتقل خواهید شد
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PaymentForm; 