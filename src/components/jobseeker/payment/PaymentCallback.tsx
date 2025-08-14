"use client";

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Alert, Button, CircularProgress, Divider } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { JOB_SEEKER_THEME } from '@/constants/colors';
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
 * کامپوننت نمایش نتیجه‌ی پرداخت برای کارجو
 */
const PaymentCallback: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'canceled' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  // جلوگیری از اجرای دوباره‌ی processCallback (به‌خصوص در React.StrictMode)
  const executedRef = React.useRef(false);

  const authority = searchParams.get('Authority');
  const statusParam = searchParams.get('Status');
  const orderId = searchParams.get('order_id');
  const returnTo = searchParams.get('returnTo') || '/jobseeker/resume-ads';

  useEffect(() => {
    if (executedRef.current) return; // جلوگيرى از دوباره‌کارى
    executedRef.current = true;

    const key = `payment_verified_${orderId}`;
    if (!orderId) return;

    if (sessionStorage.getItem(key)) {
      setStatus('success');
      setMessage('پرداخت قبلاً تأیید شده است.');
      setLoading(false);
      return;
    }

    const processCallback = async () => {
      setLoading(true);

      if (statusParam === 'NOK') {
        try {
          const response = await apiGet(`/payments/zarinpal-verify/?Status=NOK&order_id=${orderId}`);
          const responseData = response.data as { status: string; message?: string };
          setStatus('canceled');
          setMessage(responseData.message || 'پرداخت توسط کاربر لغو شد.');
        } catch {
          setStatus('canceled');
          setMessage('پرداخت توسط کاربر لغو شد.');
        } finally {
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
            setMessage('پرداخت با موفقیت انجام شد. آگهی رزومه شما ایجاد شد و در انتظار تأیید ادمین است.');
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
            sessionStorage.setItem(key, 'true');
          } else if (responseData.status === 'canceled') {
            setStatus('canceled');
            setMessage(responseData.message || 'پرداخت توسط کاربر لغو شد');
          } else {
            setStatus('failed');
            setMessage(responseData.message || 'خطا در تأیید پرداخت');
          }
        } catch (error: any) {
          if (error.response?.status === 500) {
            setStatus('success');
            setMessage('پرداخت قبلاً انجام شده است.');
            sessionStorage.setItem(key, 'true');
          } else {
            setStatus('failed');
            setMessage('خطا در تأیید پرداخت. لطفاً با پشتیبانی تماس بگیرید.');
          }
        } finally {
          setLoading(false);
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

  const handleContinue = () => router.push(returnTo);
  const handleBackToResumeAds = () => router.push('/jobseeker/resume-ads');

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6, md: 8 }, px: { xs: 2, sm: 3 } }} dir="rtl">
      <Paper
        elevation={0}
        sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, border: '1px solid #f0f0f0', textAlign: 'center', direction: 'rtl' }}
      >
        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: JOB_SEEKER_THEME.primary, mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>در حال بررسی نتیجه پرداخت...</Typography>
            <Typography variant="body2" color="text.secondary">لطفاً صبر کنید، اطلاعات پرداخت در حال پردازش است.</Typography>
          </Box>
        ) : (
          <Box>
            {status === 'success' ? (
              <SuccessView message={message} details={paymentDetails} onContinue={handleContinue} />
            ) : status === 'canceled' ? (
              <CanceledView message={message} onRetry={() => window.history.back()} onBack={handleBackToResumeAds} />
            ) : (
              <FailedView message={message} onRetry={() => window.history.back()} onBack={handleBackToResumeAds} />
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentCallback;

// ===================== Sub Components ===================== //

interface ResultViewProps {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}

const CanceledView: React.FC<ResultViewProps> = ({ message, onBack, onRetry }) => (
  <Box sx={{ textAlign: 'center' }}>
    <CancelIcon sx={{ fontSize: 80, color: JOB_SEEKER_THEME.orange, mb: 3, display: 'block', mx: 'auto' }} />
    <Typography variant="h5" fontWeight="bold" sx={{ color: JOB_SEEKER_THEME.orange, mb: 2 }}>پرداخت لغو شد</Typography>
    <Alert severity="warning" sx={{ mb: 3, direction: 'ltr', textAlign: 'left' }}>{message}</Alert>
    <ResultActions onBack={onBack} onRetry={onRetry} />
  </Box>
);

const FailedView: React.FC<ResultViewProps> = ({ message, onBack, onRetry }) => (
  <Box sx={{ textAlign: 'center' }}>
    <ErrorIcon sx={{ fontSize: 80, color: JOB_SEEKER_THEME.red, mb: 3, display: 'block', mx: 'auto' }} />
    <Typography variant="h5" fontWeight="bold" sx={{ color: JOB_SEEKER_THEME.red, mb: 2 }}>پرداخت ناموفق</Typography>
    <Alert severity="error" sx={{ mb: 3, direction: 'ltr', textAlign: 'left' }}>{message}</Alert>
    <ResultActions onBack={onBack} onRetry={onRetry} />
  </Box>
);

interface SuccessViewProps {
  message: string;
  details: PaymentDetails | null;
  onContinue: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ message, details, onContinue }) => (
  <Box sx={{ textAlign: 'center' }}>
    <CheckCircleIcon sx={{ fontSize: 80, color: JOB_SEEKER_THEME.primary, mb: 3, display: 'block', mx: 'auto' }} />
    <Typography variant="h5" fontWeight="bold" sx={{ color: JOB_SEEKER_THEME.primary, mb: 2 }}>پرداخت موفق</Typography>
    <Alert severity="success" sx={{ mb: 3, direction: 'ltr', textAlign: 'left' }}>{message}</Alert>

    {details && <PaymentDetailsView details={details} />}

    <Divider sx={{ my: 3 }} />
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
      <Button
        variant="contained"
        onClick={onContinue}
        sx={{ bgcolor: JOB_SEEKER_THEME.primary, '&:hover': { bgcolor: JOB_SEEKER_THEME.dark }, px: 4, py: 1.5, borderRadius: 2, fontWeight: 'medium' }}
      >
        بازگشت به آگهی‌های رزومه
      </Button>
    </Box>
  </Box>
);

const ResultActions: React.FC<{ onBack: () => void; onRetry: () => void }> = ({ onBack, onRetry }) => (
  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', direction: 'rtl' }}>
    <Button variant="outlined" onClick={onBack} sx={{ borderColor: JOB_SEEKER_THEME.primary, color: JOB_SEEKER_THEME.primary, px: 3, py: 1.5, borderRadius: 2, '&:hover': { borderColor: JOB_SEEKER_THEME.dark, color: JOB_SEEKER_THEME.dark } }}>بازگشت به آگهی‌ها</Button>
    <Button variant="contained" onClick={onRetry} sx={{ bgcolor: JOB_SEEKER_THEME.primary, '&:hover': { bgcolor: JOB_SEEKER_THEME.dark }, px: 3, py: 1.5, borderRadius: 2, fontWeight: 'medium' }}>تلاش مجدد</Button>
  </Box>
);

const PaymentDetailsView: React.FC<{ details: PaymentDetails }> = ({ details }) => (
  <Box sx={{ mt: 4, mb: 4 }}>
    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: JOB_SEEKER_THEME.dark }}>
      <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> جزئیات پرداخت
    </Typography>
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
      <DetailRow label="شماره سفارش" value={details.order_id} color="#2563eb" bg="#e8f0ff" />
      {details.advertisement_id && <DetailRow label="شناسه آگهی رزومه" value={details.advertisement_id} color="#059669" bg="#e6fcef" />}
      {details.ref_id && <DetailRow label="شماره پیگیری" value={details.ref_id} color="#0284c7" bg="#e0f2fe" />}
      {typeof details.amount === 'number' && <DetailRow label="مبلغ (تومان)" value={new Intl.NumberFormat('fa-IR').format(details.amount)} color="#0f5132" bg="#d1e7dd" />}
      {details.card_pan && <DetailRow label="کارت" value={details.card_pan} color="#6c757d" bg="#f8f9fa" />}
    </Paper>
  </Box>
);

const DetailRow: React.FC<{ label: string; value: string | number | undefined; color: string; bg: string }> = ({ label, value, color, bg }) => (
  <Box sx={{ mb: { xs: 2, md: 1 }, display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, alignItems: { xs: 'center', md: 'center' }, gap: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>{label}</Typography>
    <Typography sx={{ direction: 'ltr', wordBreak: 'break-all', bgcolor: bg, px: 1.5, py: 0.5, borderRadius: 2, fontSize: { xs: '0.7rem', sm: '0.8rem' }, color, fontWeight: 'bold', width: { xs: '100%', md: 'auto' }, maxWidth: { md: 600 } }}>{value}</Typography>
  </Box>
);
