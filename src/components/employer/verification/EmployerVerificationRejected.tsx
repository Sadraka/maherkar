'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/axios';
import { 
  Box, 
  Typography, 
  Button,
  Paper, 
  Alert,
  AlertTitle,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import { EMPLOYER_THEME } from '@/constants/colors';
import { useAuth } from '@/store/authStore';

// تعریف interface برای وضعیت تایید
interface VerificationStatus {
  verification_status: 'P' | 'A' | 'R';
  has_complete_documents: boolean;
  verification_date?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * کامپوننت صفحه رد تایید کارفرما
 */
export default function EmployerVerificationRejected() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // تابع دریافت وضعیت تایید
  const fetchVerificationStatus = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/profiles/employers/');
      const data = response.data as any;
      
      setVerificationData({
        verification_status: data.verification_status,
        has_complete_documents: data.has_complete_documents,
        verification_date: data.verification_date,
        admin_notes: data.admin_notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      });

      // اگر وضعیت تایید شده، به داشبورد برو
      if (data.verification_status === 'A') {
        router.push('/employer/dashboard');
      }
      // اگر در انتظار تایید، به صفحه انتظار برو
      else if (data.verification_status === 'P') {
        router.push('/verification/pending');
      }

      setError(null);
    } catch (err: any) {
      console.error('خطا در دریافت وضعیت تایید:', err);
      setError('خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  // تابع محاسبه زمان سپری شده
  const getTimeElapsed = (dateString: string): string => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'کمتر از یک ساعت پیش';
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} روز پیش`;
  };

  // تابع رفتن به صفحه ویرایش اطلاعات
  const handleEditInformation = () => {
    router.push('/verification/complete');
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          در حال بررسی وضعیت تایید...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>خطا</AlertTitle>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchVerificationStatus}
          sx={{ 
            bgcolor: EMPLOYER_THEME.primary,
            '&:hover': { bgcolor: EMPLOYER_THEME.dark }
          }}
        >
          تلاش مجدد
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* هدر صفحه */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <CancelIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          درخواست تایید رد شد
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          متأسفانه اطلاعات ارسالی شما مورد تایید قرار نگرفت
        </Typography>
      </Paper>

      {/* کارت وضعیت */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ color: 'error.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  وضعیت تایید هویت
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  تاریخ رد: {verificationData?.verification_date ? getTimeElapsed(verificationData.verification_date) : 'نامشخص'}
                </Typography>
              </Box>
            </Box>
            
            <Chip 
              label="رد شده" 
              color="error" 
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* دلیل رد */}
          {verificationData?.admin_notes && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>دلیل رد درخواست</AlertTitle>
              {verificationData.admin_notes}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditInformation}
              sx={{ 
                bgcolor: EMPLOYER_THEME.primary,
                '&:hover': { bgcolor: EMPLOYER_THEME.dark }
              }}
            >
              ویرایش و ارسال مجدد
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchVerificationStatus}
              sx={{ borderColor: EMPLOYER_THEME.primary, color: EMPLOYER_THEME.primary }}
            >
              بروزرسانی وضعیت
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* دلایل رایج رد درخواست */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            دلایل رایج رد درخواست
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <InfoIcon sx={{ color: 'info.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="کیفیت پایین تصاویر"
                secondary="تصاویر کارت ملی باید واضح، خوانا و با کیفیت مناسب باشند"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <InfoIcon sx={{ color: 'info.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="عدم تطابق اطلاعات"
                secondary="اطلاعات وارد شده با مدارک ارسالی مطابقت ندارد"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <InfoIcon sx={{ color: 'info.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="مدارک ناقص"
                secondary="تصاویر روی یا پشت کارت ملی ارسال نشده یا کامل نیست"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <InfoIcon sx={{ color: 'info.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="کد ملی نامعتبر"
                secondary="کد ملی وارد شده صحیح نیست یا تکراری است"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* راهنمایی برای ارسال مجدد */}
      <Alert severity="warning" sx={{ mb: 4 }}>
        <AlertTitle>راهنمایی برای ارسال مجدد</AlertTitle>
        <Typography variant="body2" sx={{ mb: 2 }}>
          برای ارسال مجدد درخواست تایید، لطفاً موارد زیر را رعایت کنید:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <li>اطلاعات شخصی را به‌دقت و کامل وارد کنید</li>
          <li>تصاویر کارت ملی را با کیفیت بالا و در نور مناسب بگیرید</li>
          <li>مطمئن شوید که تمام متن‌های روی کارت ملی کاملاً خوانا هستند</li>
          <li>از فرمت‌های مجاز (JPG, PNG) استفاده کنید</li>
        </Box>
      </Alert>

      {/* پشتیبانی */}
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <ContactSupportIcon sx={{ fontSize: 48, color: EMPLOYER_THEME.primary, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            نیاز به راهنمایی دارید؟
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            اگر در مورد دلیل رد درخواست سوالی دارید یا نیاز به کمک برای ارسال مجدد دارید، 
            با تیم پشتیبانی ماهرکار تماس بگیرید
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              sx={{ borderColor: EMPLOYER_THEME.primary, color: EMPLOYER_THEME.primary }}
            >
              تماس با پشتیبانی
            </Button>
            <Button 
              variant="outlined"
              sx={{ borderColor: EMPLOYER_THEME.primary, color: EMPLOYER_THEME.primary }}
            >
              راهنمای تایید هویت
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
