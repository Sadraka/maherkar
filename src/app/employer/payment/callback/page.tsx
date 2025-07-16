'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, Paper, Alert, Button, CircularProgress } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WorkIcon from '@mui/icons-material/Work';
import { EMPLOYER_THEME } from '@/constants/colors';
import { apiGet } from '@/lib/axios';

/**
 * صفحه callback پرداخت زرین‌پال - تطابق با بک‌اند
 * بک‌اند خودش verify می‌کند و فقط نتیجه را نمایش می‌دهیم
 */
export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [hasRedirected, setHasRedirected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // دریافت پارامترهای ارسالی از زرین‌پال
  const authority = searchParams.get('Authority');
  const statusParam = searchParams.get('Status');
  const orderId = searchParams.get('order_id');
  const returnTo = searchParams.get('returnTo') || '/employer/jobs';

  useEffect(() => {
    const key = `payment_verified_${orderId}`;
    if (!orderId) return;

    // اگر قبلاً پرداخت تایید شده، دیگر verify نکن
    if (sessionStorage.getItem(key)) {
      setStatus('success');
      setMessage('پرداخت قبلاً تایید شده است. در حال انتقال...');
      setLoading(false);
      startCountdown();
      return;
    }

    const processCallback = async () => {
      setLoading(true);
      if (statusParam === 'NOK') {
        setStatus('failed');
        setMessage('پرداخت توسط کاربر لغو شد یا با خطا مواجه شد.');
        setLoading(false);
        return;
      }
      if (!authority) {
        setStatus('failed');
        setMessage('Authority نامعتبر است.');
        setLoading(false);
        return;
      }
      if (!orderId) {
        setStatus('failed');
        setMessage('شناسه سفارش یافت نشد.');
        setLoading(false);
        return;
      }
      if (statusParam === 'OK') {
        try {
          const response = await apiGet(`/payments/zarinpal-verify/?Authority=${authority}&order_id=${orderId}`);
          const responseData = response.data as { status: string; message?: string };
          if (responseData.status === 'success') {
            setStatus('success');
            setMessage('پرداخت با موفقیت انجام شد. آگهی شما ایجاد شده و در انتظار تأیید ادمین است.');
            setLoading(false);
            sessionStorage.setItem(key, 'true');
            startCountdown();
          } else {
            setStatus('failed');
            setMessage(responseData.message || 'خطا در تایید پرداخت');
            setLoading(false);
          }
        } catch (error: any) {
          if (error.response?.status === 500) {
            setStatus('success');
            setMessage('پرداخت قبلاً انجام شده است. در حال انتقال...');
            setLoading(false);
            sessionStorage.setItem(key, 'true');
            startCountdown();
          } else {
            setStatus('failed');
            setMessage('خطا در تایید پرداخت. لطفاً با پشتیبانی تماس بگیرید.');
            setLoading(false);
          }
        }
      } else {
        setStatus('failed');
        setMessage('وضعیت پرداخت نامشخص است. لطفاً با پشتیبانی تماس بگیرید.');
        setLoading(false);
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authority, statusParam, orderId, returnTo]);

  // شمارش معکوس و انتقال فقط یک بار
  const startCountdown = () => {
    if (hasRedirected) return;
    setHasRedirected(true);
    setCountdown(3);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          timeoutRef.current = setTimeout(() => {
            router.push(returnTo);
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleContinue = () => {
    router.push(returnTo);
  };

  const handleBackToJobs = () => {
    router.push('/employer/jobs');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }} dir="rtl">
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: '1px solid #f0f0f0',
          textAlign: 'center',
          direction: 'rtl',
        }}
      >
        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: EMPLOYER_THEME.primary, mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              در حال بررسی نتیجه پرداخت...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              لطفاً صبر کنید، اطلاعات پرداخت در حال پردازش است.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            {status === 'success' ? (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: '#4caf50', 
                    mb: 3,
                    display: 'block',
                    mx: 'auto',
                  }} 
                />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#4caf50', mb: 2, textAlign: 'center' }}>
                  پرداخت موفق
                </Typography>
                <Alert severity="success" sx={{ mb: 3, direction: 'ltr', textAlign: 'right' }}>
                  {message}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  {countdown > 0 ? `در حال انتقال... (${countdown})` : 'در حال انتقال...'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleContinue}
                  sx={{
                    bgcolor: EMPLOYER_THEME.primary,
                    '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'medium',
                    mx: 'auto',
                    display: 'block',
                  }}
                >
                  ادامه
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <ErrorIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: '#f44336', 
                    mb: 3,
                    display: 'block',
                    mx: 'auto',
                  }} 
                />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#f44336', mb: 2, textAlign: 'center' }}>
                  پرداخت ناموفق
                </Typography>
                <Alert severity="error" sx={{ mb: 3, direction: 'ltr', textAlign: 'right' }}>
                  {message}
                </Alert>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', direction: 'rtl' }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackToJobs}
                    sx={{
                      borderColor: EMPLOYER_THEME.primary,
                      color: EMPLOYER_THEME.primary,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: EMPLOYER_THEME.dark,
                        color: EMPLOYER_THEME.dark,
                      },
                      direction: 'rtl',
                    }}
                  >
                    بازگشت به آگهی‌ها
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => window.history.back()}
                    sx={{
                      bgcolor: EMPLOYER_THEME.primary,
                      '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'medium',
                      direction: 'rtl',
                    }}
                  >
                    تلاش مجدد
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
} 