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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import SecurityIcon from '@mui/icons-material/Security';
import BadgeIcon from '@mui/icons-material/Badge';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
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
 * کامپوننت صفحه انتظار تایید ادمین
 */
export default function EmployerVerificationPending() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // تابع دریافت وضعیت تایید
  const fetchVerificationStatus = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
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
      // اگر رد شده، به صفحه رد شدن برو
      else if (data.verification_status === 'R') {
        router.push('/verification/rejected');
      }

      setError(null);
    } catch (err: any) {
      console.error('خطا در دریافت وضعیت تایید:', err);
      setError('خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
          onClick={() => fetchVerificationStatus()}
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
          background: `linear-gradient(135deg, ${EMPLOYER_THEME.light} 0%, ${EMPLOYER_THEME.primary} 100%)`,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <HourglassEmptyIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          در انتظار تایید
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          اطلاعات شما در حال بررسی توسط تیم ماهرکار است
        </Typography>
      </Paper>

      {/* کارت وضعیت */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SecurityIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 32 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  وضعیت تایید هویت
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  آخرین بروزرسانی: {verificationData?.updated_at ? getTimeElapsed(verificationData.updated_at) : 'نامشخص'}
                </Typography>
              </Box>
            </Box>
            
            <Chip 
              label="در حال بررسی" 
              color="warning" 
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <LinearProgress 
            variant="determinate" 
            value={75} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              mb: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: EMPLOYER_THEME.primary
              }
            }} 
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            مرحله 3 از 4: بررسی اطلاعات توسط ادمین
          </Typography>

          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={() => fetchVerificationStatus(true)}
            disabled={refreshing}
            sx={{ borderColor: EMPLOYER_THEME.primary, color: EMPLOYER_THEME.primary }}
          >
            {refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی وضعیت'}
          </Button>
        </CardContent>
      </Card>

      {/* مراحل فرآیند */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            مراحل فرآیند تایید
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="ثبت اطلاعات شخصی"
                secondary="اطلاعات شخصی شما با موفقیت ثبت شد"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="آپلود مدارک هویتی"
                secondary="تصاویر کارت ملی آپلود و ثبت شد"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <HourglassEmptyIcon sx={{ color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="بررسی توسط ادمین"
                secondary="در حال بررسی اطلاعات و مدارک توسط تیم ماهرکار"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: 'grey.400' }} />
              </ListItemIcon>
              <ListItemText 
                primary="تایید نهایی"
                secondary="دریافت تایید و فعال‌سازی حساب کارفرمایی"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* اطلاعات ارسال شده */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            اطلاعات ارسال شده
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BadgeIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">نام و نام خانوادگی</Typography>
                <Typography variant="body1" fontWeight="medium">{user?.full_name}</Typography>
              </Box>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PhotoCameraIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">مدارک هویتی</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {verificationData?.has_complete_documents ? 'آپلود شده ✓' : 'آپلود نشده ✗'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* راهنمایی و پشتیبانی */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>زمان بررسی</AlertTitle>
        معمولاً فرآیند بررسی اطلاعات بین 24 تا 72 ساعت زمان می‌برد. 
        در صورت نیاز به اطلاعات تکمیلی، از طریق ایمیل یا پیامک با شما تماس خواهیم گرفت.
      </Alert>

      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <ContactSupportIcon sx={{ fontSize: 48, color: EMPLOYER_THEME.primary, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            نیاز به راهنمایی دارید؟
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            در صورت داشتن سوال یا نیاز به کمک، با تیم پشتیبانی ماهرکار تماس بگیرید
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
