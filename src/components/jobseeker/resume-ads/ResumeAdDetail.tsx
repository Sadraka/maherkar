'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import { apiGet, apiDelete } from '@/lib/axios';
import { JOB_SEEKER_THEME } from '@/constants/colors';

interface ResumeAdDetailProps {
  adId: string;
}

/**
 * کامپوننت نمایش جزئیات آگهی رزومه
 */
export default function ResumeAdDetail({ adId }: ResumeAdDetailProps) {
  const router = useRouter();
  const [resumeAd, setResumeAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // دریافت جزئیات آگهی رزومه
  const fetchResumeAdDetail = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/ads/resume/${adId}/my-resume-detail/`);
      setResumeAd(response.data);
      setError(null);
    } catch (err: any) {
      console.error('خطا در دریافت جزئیات آگهی رزومه:', err);
      setError(err.response?.data?.error || 'خطا در بارگذاری جزئیات آگهی رزومه');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adId) {
      fetchResumeAdDetail();
    }
  }, [adId]);

  // حذف آگهی رزومه
  const handleDelete = async () => {
    if (!confirm('آیا از حذف این آگهی رزومه اطمینان دارید؟')) return;
    
    try {
      setDeleting(true);
      await apiDelete(`/ads/resume/${adId}/`);
      router.push('/jobseeker/resume-ads');
    } catch (error) {
      console.error('خطا در حذف آگهی رزومه:', error);
      alert('خطا در حذف آگهی رزومه');
    } finally {
      setDeleting(false);
    }
  };

  // تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
  const convertToFarsiNumber = (num: string): string => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
  };

  // تابع کمکی برای تبدیل وضعیت‌ها به متن فارسی
  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'P': return 'در انتظار بررسی';
      case 'A': return 'تایید شده';
      case 'R': return 'رد شده';
      default: return 'نامشخص';
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'P': return '#FF9800';
      case 'A': return '#4CAF50';
      case 'R': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getSalaryText = (salary?: string): string => {
    if (!salary) return 'توافقی';
    
    switch (salary) {
      case '5 to 10': return convertToFarsiNumber('5') + ' تا ' + convertToFarsiNumber('10') + ' میلیون تومان';
      case '10 to 15': return convertToFarsiNumber('10') + ' تا ' + convertToFarsiNumber('15') + ' میلیون تومان';
      case '15 to 20': return convertToFarsiNumber('15') + ' تا ' + convertToFarsiNumber('20') + ' میلیون تومان';
      case '20 to 30': return convertToFarsiNumber('20') + ' تا ' + convertToFarsiNumber('30') + ' میلیون تومان';
      case '30 to 50': return convertToFarsiNumber('30') + ' تا ' + convertToFarsiNumber('50') + ' میلیون تومان';
      case 'More than 50': return 'بیش از ' + convertToFarsiNumber('50') + ' میلیون تومان';
      case 'Negotiable':
      default: return 'توافقی';
    }
  };

  const getJobTypeText = (jobType?: string): string => {
    if (!jobType) return 'تمام وقت';
    
    switch (jobType) {
      case 'FT': return 'تمام وقت';
      case 'PT': return 'پاره وقت';
      case 'RE': return 'دورکاری';
      case 'IN': return 'کارآموزی';
      default: return jobType;
    }
  };

  const getDegreeText = (degree?: string): string => {
    if (!degree) return '';
    switch (degree) {
      case 'BD': return 'زیر دیپلم';
      case 'DI': return 'دیپلم';
      case 'AS': return 'فوق دیپلم';
      case 'BA': return 'لیسانس';
      case 'MA': return 'فوق لیسانس';
      case 'DO': return 'دکترا';
      default: return degree;
    }
  };

  const getGenderText = (gender?: string): string => {
    if (!gender) return '';
    switch (gender) {
      case 'M': return 'آقا';
      case 'F': return 'خانم';
      case 'N': return 'مهم نیست';
      default: return gender;
    }
  };

  const getSoldierStatusText = (status?: string): string => {
    if (!status) return '';
    switch (status) {
      case 'CO': return 'پایان خدمت';
      case 'EE': return 'معافیت تحصیلی';
      case 'NS': return 'مهم نیست';
      default: return status;
    }
  };

  // محاسبه زمان انتشار
  const getTimePosted = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'کمتر از ۱ ساعت پیش';
    if (diffInHours < 24) return `${convertToFarsiNumber(diffInHours.toString())} ساعت پیش`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${convertToFarsiNumber(diffInDays.toString())} روز پیش`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${convertToFarsiNumber(diffInWeeks.toString())} هفته پیش`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${convertToFarsiNumber(diffInMonths.toString())} ماه پیش`;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <CircularProgress 
          size={60} 
          sx={{ 
            color: JOB_SEEKER_THEME.primary,
            mb: 2
          }} 
        />
        <Typography color="text.secondary">
          در حال بارگذاری جزئیات آگهی رزومه...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchResumeAdDetail}
          sx={{ backgroundColor: JOB_SEEKER_THEME.primary }}
        >
          تلاش مجدد
        </Button>
      </Container>
    );
  }

  if (!resumeAd) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          آگهی رزومه مورد نظر یافت نشد.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        {/* دکمه بازگشت */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{
              borderColor: JOB_SEEKER_THEME.primary,
              color: JOB_SEEKER_THEME.primary,
              '&:hover': {
                borderColor: JOB_SEEKER_THEME.dark,
                color: JOB_SEEKER_THEME.dark,
                backgroundColor: `${JOB_SEEKER_THEME.primary}08`
              }
            }}
          >
            بازگشت
          </Button>
        </Box>

        {/* کارت اصلی */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, sm: 4, md: 5 }, 
            borderRadius: 3,
            border: '1px solid #E0E0E0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
          }}
        >
          {/* هدر */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{ 
                    fontWeight: 700,
                    color: JOB_SEEKER_THEME.primary,
                    mb: 2,
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                  }}
                >
                  {resumeAd.title}
                </Typography>
                
                <Chip
                  label={getStatusText(resumeAd.status)}
                  sx={{
                    backgroundColor: `${getStatusColor(resumeAd.status)}15`,
                    color: getStatusColor(resumeAd.status),
                    fontWeight: 600,
                    border: `1px solid ${getStatusColor(resumeAd.status)}30`,
                    fontSize: '0.9rem',
                    height: 32
                  }}
                />
              </Box>

              {/* دکمه‌های عملیات */}
              <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => router.push(`/jobseeker/resume-ads/${adId}/edit`)}
                  sx={{
                    borderColor: JOB_SEEKER_THEME.primary,
                    color: JOB_SEEKER_THEME.primary,
                    '&:hover': {
                      borderColor: JOB_SEEKER_THEME.dark,
                      color: JOB_SEEKER_THEME.dark
                    }
                  }}
                >
                  ویرایش
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'در حال حذف...' : 'حذف'}
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* اطلاعات اصلی */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 4
          }}>
            {/* موقعیت مکانی */}
            {resumeAd.location && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                      color: JOB_SEEKER_THEME.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <LocationOnIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      موقعیت مکانی
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {resumeAd.location.name}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* زمان انتشار */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                    color: JOB_SEEKER_THEME.primary,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <AccessTimeIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    زمان انتشار
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getTimePosted(resumeAd.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* صنعت */}
            {resumeAd.industry && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                      color: JOB_SEEKER_THEME.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <BusinessIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      صنعت
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {resumeAd.industry.name}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* حقوق مورد انتظار */}
            {resumeAd.salary && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                      color: JOB_SEEKER_THEME.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <AttachMoneyIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      حقوق مورد انتظار
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color={JOB_SEEKER_THEME.primary}>
                      {getSalaryText(resumeAd.salary)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* نوع کار */}
            {resumeAd.job_type && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                      color: JOB_SEEKER_THEME.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <WorkIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      نوع کار مورد نظر
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getJobTypeText(resumeAd.job_type)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* تحصیلات */}
            {resumeAd.degree && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                      color: JOB_SEEKER_THEME.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <SchoolIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      سطح تحصیلات
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getDegreeText(resumeAd.degree)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* جنسیت */}
            {resumeAd.gender && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                      color: JOB_SEEKER_THEME.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      جنسیت
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getGenderText(resumeAd.gender)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* وضعیت نظام وظیفه */}
            {resumeAd.soldier_status && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                      color: JOB_SEEKER_THEME.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <SecurityIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      وضعیت نظام وظیفه
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getSoldierStatusText(resumeAd.soldier_status)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* توضیحات */}
          {resumeAd.description && (
            <>
              <Divider sx={{ mb: 3 }} />
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    color: JOB_SEEKER_THEME.primary
                  }}
                >
                  توضیحات تکمیلی
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.8,
                    color: 'text.secondary',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {resumeAd.description}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
