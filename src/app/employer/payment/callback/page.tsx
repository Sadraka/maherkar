
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, Paper, Alert, Button, CircularProgress, Divider, Chip } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { EMPLOYER_THEME } from '@/constants/colors';
import { apiGet } from '@/lib/axios';

interface PaymentDetails {
  order_id: string;
  advertisement_id?: string;
  ref_id?: string;
  card_pan?: string;
  card_hash?: string;
  fee_type?: string;
  fee?: string;
  amount?: number;
  subscription_plan?: string;
}

/**
 * صفحه callback پرداخت زرین‌پال - تطابق با بک‌اند
 * بک‌اند خودش verify می‌کند و فقط نتیجه را نمایش می‌دهیم
 */
export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'canceled' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
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
      setMessage('پرداخت قبلاً تایید شده است.');
      setLoading(false);
      return;
    }

    const processCallback = async () => {
      setLoading(true);
      if (statusParam === 'NOK') {
        // ارسال درخواست به بک‌اند برای به‌روزرسانی وضعیت
        try {
          const response = await apiGet(`/payments/zarinpal-verify/?Status=NOK&order_id=${orderId}`);
          const responseData = response.data as { status: string; message?: string };
          setStatus('canceled');
          setMessage(responseData.message || 'پرداخت توسط کاربر لغو شد.');
          setLoading(false);
        } catch (error) {
          setStatus('canceled');
          setMessage('پرداخت توسط کاربر لغو شد.');
          setLoading(false);
        }
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
          const responseData = response.data as { 
            status: string; 
            message?: string;
            order_id?: string;
            advertisement_id?: string;
            ref_id?: string;
            card_pan?: string;
            card_hash?: string;
            fee_type?: string;
            fee?: string;
            amount?: number;
          };
          
          if (responseData.status === 'success') {
            setStatus('success');
            setMessage('پرداخت با موفقیت انجام شد. آگهی شما ایجاد شده و در انتظار تأیید ادمین است.');
            setPaymentDetails({
              order_id: responseData.order_id || orderId,
              advertisement_id: responseData.advertisement_id,
              ref_id: responseData.ref_id,
              card_pan: responseData.card_pan,
              card_hash: responseData.card_hash,
              fee_type: responseData.fee_type,
              fee: responseData.fee,
              amount: responseData.amount,
            });
            setLoading(false);
            sessionStorage.setItem(key, 'true');
          } else if (responseData.status === 'canceled') {
            setStatus('canceled');
            setMessage(responseData.message || 'پرداخت توسط کاربر لغو شد');
            setLoading(false);
          } else {
            setStatus('failed');
            setMessage(responseData.message || 'خطا در تایید پرداخت');
            setLoading(false);
          }
        } catch (error: any) {
          if (error.response?.status === 500) {
            setStatus('success');
            setMessage('پرداخت قبلاً انجام شده است.');
            setLoading(false);
            sessionStorage.setItem(key, 'true');
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

  const handleContinue = () => {
    router.push(returnTo);
  };

  const handleBackToJobs = () => {
    router.push('/employer/jobs');
  };





  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6, md: 8 }, px: { xs: 2, sm: 3 } }} dir="rtl">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
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
                <Alert severity="success" sx={{ mb: 3, direction: 'ltr', textAlign: 'left' }}>
                  {message}
                </Alert>

                {/* نمایش جزئیات پرداخت */}
                {paymentDetails && (
                  <Box sx={{ mt: 4, mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: EMPLOYER_THEME.dark }}>
                      <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      جزئیات پرداخت
                    </Typography>
                    
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        bgcolor: '#f8f9fa', 
                        borderRadius: 2,
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ mb: { xs: 2, md: 1 }, display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, alignItems: { xs: 'center', md: 'center' }, gap: 1, textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>
                            شماره سفارش
                          </Typography>
                                                      <Typography sx={{ direction: 'ltr', textAlign: { xs: 'center', md: 'left' }, wordBreak: 'break-all', bgcolor: '#e8f0ff', px: 1.5, py: 0.5, borderRadius: 2, fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: '#2563eb', fontWeight: 'bold', width: { xs: '100%', md: 'auto' }, maxWidth: { md: 600 } }}>
                              {paymentDetails.order_id}
                            </Typography>
                        </Box>
                        
                        {paymentDetails.advertisement_id && (
                          <Box sx={{ mb: { xs: 2, md: 1 }, display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, alignItems: { xs: 'center', md: 'center' }, gap: 1, textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>
                              شناسه آگهی
                            </Typography>
                            <Typography sx={{ direction: 'ltr', textAlign: { xs: 'center', md: 'left' }, wordBreak: 'break-all', bgcolor: '#e6fcef', px: 1.5, py: 0.5, borderRadius: 2, fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: '#059669', fontWeight: 'bold', width: { xs: '100%', md: 'auto' }, maxWidth: { md: 600 } }}>
                              {paymentDetails.advertisement_id}
                            </Typography>
                          </Box>
                        )}

                        {paymentDetails.ref_id && (
                          <Box sx={{ mb: { xs: 2, md: 1 }, display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, alignItems: { xs: 'center', md: 'center' }, gap: 1, textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>
                              شماره پیگیری
                            </Typography>
                            <Typography sx={{ direction: 'ltr', textAlign: { xs: 'center', md: 'left' }, wordBreak: 'break-all', bgcolor: '#e0f2fe', px: 1.5, py: 0.5, borderRadius: 2, fontSize: { xs: '0.7rem', sm: '0.8rem' }, color: '#0284c7', fontWeight: 'bold', width: { xs: '100%', md: 'auto' }, maxWidth: { md: 600 } }}>
                              {paymentDetails.ref_id}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* دکمه بازگشت */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
                    }}
                  >
                    بازگشت به آگهی‌ها
                  </Button>
                </Box>
              </Box>
            ) : status === 'canceled' ? (
              <Box sx={{ textAlign: 'center' }}>
                <CancelIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: '#ff9800', 
                    mb: 3,
                    display: 'block',
                    mx: 'auto',
                  }} 
                />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ff9800', mb: 2, textAlign: 'center' }}>
                  پرداخت لغو شد
                </Typography>
                <Alert severity="warning" sx={{ mb: 3, direction: 'ltr', textAlign: 'left' }}>
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
                <Alert severity="error" sx={{ mb: 3, direction: 'ltr', textAlign: 'left' }}>
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