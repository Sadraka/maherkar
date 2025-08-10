'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faBriefcase,
  faFileAlt,
  faCreditCard,
  faIndustry,
  faUser,
  faBell,
  faArrowUp,
  faFilter,
  faSort,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import CustomPagination from '../../common/CustomPagination';
import { apiGet } from '@/lib/axios';
import { ADMIN_THEME } from '@/constants/colors';

// تابع تبدیل اعداد به فارسی
const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};
import { useJobStatsStore } from '@/store/jobStatsStore';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  pendingJobs: number;
  activeSubscriptions: number;
  recentActivity: any[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const getColorConfig = (color: string) => {
    switch (color) {
      case 'primary':
        return { bg: '#e3f2fd', text: '#1976d2', icon: '#1976d2' };
      case 'secondary':
        return { bg: '#f3e5f5', text: '#7b1fa2', icon: '#7b1fa2' };
      case 'success':
        return { bg: '#e8f5e8', text: '#2e7d32', icon: '#2e7d32' };
      case 'warning':
        return { bg: '#fff3e0', text: '#f57c00', icon: '#f57c00' };
      case 'error':
        return { bg: '#ffebee', text: '#d32f2f', icon: '#d32f2f' };
      case 'info':
        return { bg: '#e1f5fe', text: '#0288d1', icon: '#0288d1' };
      default:
        return { bg: '#f5f5f5', text: '#757575', icon: '#757575' };
    }
  };

  const colorConfig = getColorConfig(color);

  return (
    <Card elevation={1} sx={{ 
      height: { xs: 'auto', md: '100%' }, 
      position: 'relative', 
      overflow: 'visible',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      border: `1px solid ${colorConfig.bg}`,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 2,
        borderColor: colorConfig.text,
      }
    }}>
      <CardContent sx={{ p: { xs: 3, md: 2.5 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ flexDirection: { xs: 'row', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' } }}>
          <Box sx={{ flex: 1, textAlign: { xs: 'left', md: 'left' } }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: '1.8rem', md: '1.75rem' },
                lineHeight: 1.2,
                color: colorConfig.text,
                fontWeight: 'bold'
              }}
              gutterBottom
            >
              {value.toLocaleString('fa-IR', { useGrouping: false })}
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontSize: { xs: '0.9rem', md: '0.9rem' },
                lineHeight: 1.2,
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              {title}
            </Typography>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-start' } }}>
                <FontAwesomeIcon
                  icon={faArrowUp}
                  style={{
                    fontSize: '14px',
                    color: trend > 0 ? '#2e7d32' : '#d32f2f',
                    marginRight: '4px'
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ 
                    fontSize: { xs: '0.8rem', md: '0.8rem' },
                    color: trend > 0 ? 'success.main' : 'error.main',
                    fontWeight: 500
                  }}
                >
                  {trend > 0 ? '+' : ''}{convertToPersianNumbers(trend)}% نسبت به ماه قبل
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: { xs: 2, md: 2 },
              borderRadius: 2,
              bgcolor: colorConfig.bg,
              color: colorConfig.icon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: { xs: 2, md: 1 }
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState('');
  const [activitySortBy, setActivitySortBy] = useState('timestamp');
  const [activitySortOrder, setActivitySortOrder] = useState('desc');
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(20);
  const { jobStats, jobStatsLoading, fetchJobStats } = useJobStatsStore();

  useEffect(() => {
    // ابتدا آمار آگهی‌ها را بارگذاری کن
    fetchJobStats();
    fetchStats();
  }, [fetchJobStats]);

  // آپدیت stats وقتی jobStats تغییر می‌کند
  useEffect(() => {
    if (stats && jobStats) {
      // فقط اگر واقعاً تغییر کرده، آپدیت کن
      if (stats.totalJobs !== jobStats.totalJobs || stats.pendingJobs !== jobStats.pendingJobs) {
        setStats(prev => prev ? {
          ...prev,
          totalJobs: jobStats.totalJobs,
          pendingJobs: jobStats.pendingJobs
        } : null);
      }
    }
  }, [jobStats, stats]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // فراخوانی API های مختلف برای دریافت آمار
      const [
        usersResponse, 
        companiesResponse, 
        jobsResponse, 
        applicationsResponse,
        subscriptionsResponse
      ] = await Promise.all([
        apiGet('/users/').catch((err) => {
          console.error('Error fetching users:', err);
          return { data: [] };
        }),
        apiGet('/companies/').catch((err) => {
          console.error('Error fetching companies:', err);
          return { data: [] };
        }),
        apiGet('/ads/job/').catch((err) => {
          console.error('Error fetching jobs:', err);
          return { data: [] };
        }),
        apiGet('/ads/applications/').catch((err) => {
          console.error('Error fetching applications:', err);
          return { data: [] };
        }),
        apiGet('/orders/subscriptions/').catch((err) => {
          console.error('Error fetching subscriptions:', err);
          return { data: [] };
        })
      ]);

      const users = Array.isArray((usersResponse.data as any)) ? (usersResponse.data as any) : [];
      const companies = Array.isArray((companiesResponse.data as any)) ? (companiesResponse.data as any) : [];
      const jobs = Array.isArray((jobsResponse.data as any)) ? (jobsResponse.data as any) : [];
      const applications = Array.isArray((applicationsResponse.data as any)) ? (applicationsResponse.data as any) : [];
      const subscriptions = Array.isArray((subscriptionsResponse.data as any)) ? (subscriptionsResponse.data as any) : [];
      
      // استفاده از آمار آگهی‌ها از store
      const pendingJobs = jobStats.pendingJobs;

      // محاسبه اشتراک‌های فعال
      const activeSubscriptions = subscriptions.filter((sub: any) => {
        const isActive = sub.payment_status === 'paid' || 
                        sub.payment_status === 'active' || 
                        sub.subscription_status === 'active' || 
                        sub.subscription_status === 'special';
        

        
        return isActive;
      }).length;



      // ایجاد فعالیت‌های اخیر از داده‌های موجود
      const recentActivity: any[] = [];
      
      // کاربران جدید (10 کاربر آخر)
      const recentUsers = users.slice(0, 10);
      recentUsers.forEach((user: any) => {
        const userType = user.user_type === 'JS' ? 'کارجو' : 
                        user.user_type === 'EM' ? 'کارفرما' : 
                        user.user_type === 'AD' ? 'ادمین' : 'کاربر';
        const userDate = user.joined_date ? new Date(user.joined_date) : null;
        
        // ترکیب نام و شماره کاربر
        const userName = user.full_name || user.phone || 'کاربر جدید';
        const userPhone = user.phone || '';
        const userDisplay = userPhone ? `${userName} (${convertToPersianNumbers(userPhone)})` : userName;
        
        recentActivity.push({
          action: 'کاربر جدید ثبت نام کرد',
          description: `${userDisplay} (${userType}) به سیستم پیوست`,
          timestamp: userDate ? userDate.toLocaleString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]) : 'اخیراً',
          originalDate: userDate,
          type: 'user',
          icon: <FontAwesomeIcon icon={faUser} style={{ fontSize: '1rem' }} />
        });
      });
      
      // آگهی‌های جدید (10 آگهی آخر)
      const recentJobs = jobs.slice(0, 10);
      recentJobs.forEach((job: any) => {
        const jobStatus = job.status === 'A' ? 'فعال' : job.status === 'P' ? 'در انتظار تایید' : 'غیرفعال';
        const jobDate = job.created_at ? new Date(job.created_at) : null;
        recentActivity.push({
          action: 'آگهی جدید ثبت شد',
          description: `آگهی "${job.title || job.advertisement?.title || 'آگهی جدید'}" (${jobStatus}) ثبت شد`,
          timestamp: jobDate ? jobDate.toLocaleString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]) : 'اخیراً',
          originalDate: jobDate,
          type: 'job',
          icon: <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '1rem' }} />
        });
      });
      
      // درخواست‌های جدید
      if (applications.length > 0) {
        const recentApplications = applications.slice(0, 10);
        recentApplications.forEach((app: any) => {
          const appDate = app.created_at ? new Date(app.created_at) : null;
          recentActivity.push({
            action: 'درخواست جدید دریافت شد',
            description: `درخواست برای آگهی "${app.job?.title || app.advertisement?.title || 'آگهی'}" از ${app.applicant?.full_name || 'کاربر'}`,
            timestamp: appDate ? appDate.toLocaleString('fa-IR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]) : 'اخیراً',
            originalDate: appDate,
            type: 'application',
            icon: <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '1rem' }} />
          });
        });
      }

      // شرکت‌های جدید (10 شرکت آخر)
      const recentCompanies = companies.slice(0, 10);
      recentCompanies.forEach((company: any) => {
        const companyDate = company.created_at ? new Date(company.created_at) : null;
        recentActivity.push({
          action: 'شرکت جدید ثبت شد',
          description: `شرکت "${company.name || 'شرکت جدید'}" ثبت شد`,
          timestamp: companyDate ? companyDate.toLocaleString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]) : 'اخیراً',
          originalDate: companyDate,
          type: 'company',
          icon: <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '1rem' }} />
        });
      });

      // اشتراک‌های جدید
      const recentSubscriptions = subscriptions.filter((sub: any) => 
        sub.payment_status === 'paid' || sub.subscription_status === 'active'
      ).slice(0, 10);
      
      recentSubscriptions.forEach((subscription: any) => {
        const planType = subscription.plan?.type === 'special' ? 'ویژه' : subscription.plan?.type === 'premium' ? 'پریمیوم' : 'عادی';
        const subDate = subscription.created_at ? new Date(subscription.created_at) : null;
        

        
        // تلاش برای پیدا کردن نام و شماره کاربر از فیلدهای مختلف
        const userName = subscription.owner?.full_name || 
                        subscription.owner?.name ||
                        subscription.employer?.full_name || 
                        subscription.employer?.name ||
                        subscription.user?.full_name ||
                        subscription.user?.name ||
                        subscription.customer?.full_name ||
                        subscription.customer?.name ||
                        'کاربر';
        
        const userPhone = subscription.owner?.phone ||
                         subscription.employer?.phone ||
                         subscription.user?.phone ||
                         subscription.customer?.phone ||
                         '';
        
        // ترکیب نام و شماره
        const userDisplay = userPhone ? `${userName} (${convertToPersianNumbers(userPhone)})` : userName;
        
        recentActivity.push({
          action: 'اشتراک جدید خریداری شد',
          description: `${userDisplay} اشتراک ${planType} "${subscription.plan?.name || 'اشتراک'}" خریداری کرد`,
          timestamp: subDate ? subDate.toLocaleString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]) : 'اخیراً',
          originalDate: subDate,
          type: 'subscription',
          icon: <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: '1rem' }} />
        });
      });

      // مرتب‌سازی اولیه بر اساس زمان (جدیدترین اول)
      recentActivity.sort((a, b) => {
        const dateA = a.originalDate || new Date(0);
        const dateB = b.originalDate || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      // نمایش حداکثر 50 فعالیت اخیر
      const finalRecentActivity = recentActivity.slice(0, 50);

      setStats({
        totalUsers: users.length,
        totalCompanies: companies.length,
        totalJobs: jobStats.totalJobs, // استفاده از store
        totalApplications: applications.length,
        pendingJobs,
        activeSubscriptions,
        recentActivity: finalRecentActivity
      });
    } catch (error: any) {
      console.error('خطا در دریافت آمار:', error);
      setError('خطا در دریافت اطلاعات آماری');

      // در صورت خطا، آمار صفر نمایش داده می‌شود
      setStats({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: jobStats.totalJobs, // استفاده از store
        totalApplications: 0,
        pendingJobs: jobStats.pendingJobs, // استفاده از store
        activeSubscriptions: 0,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          در حال بارگذاری آمار...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.
        </Typography>
      </Paper>
    );
  }

  const statCards = [
    {
      title: 'کل کاربران',
      value: stats?.totalUsers || 0,
      icon: <FontAwesomeIcon icon={faUsers} style={{ fontSize: '1.2rem' }} />,
      color: 'primary' as const
    },
    {
      title: 'کل شرکت‌ها',
      value: stats?.totalCompanies || 0,
      icon: <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '1.2rem' }} />,
      color: 'secondary' as const
    },
    {
      title: 'کل آگهی‌ها',
      value: stats?.totalJobs || 0,
      icon: <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '1.2rem' }} />,
      color: 'success' as const
    },
    {
      title: 'کل درخواست‌ها',
      value: stats?.totalApplications || 0,
      icon: <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '1.2rem' }} />,
      color: 'warning' as const
    },
    {
      title: 'آگهی‌های در انتظار',
      value: stats?.pendingJobs || 0,
      icon: <FontAwesomeIcon icon={faBell} style={{ fontSize: '1.2rem' }} />,
      color: 'info' as const
    },
    {
      title: 'اشتراک‌های فعال',
      value: stats?.activeSubscriptions || 0,
      icon: <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: '1.2rem' }} />,
      color: 'success' as const
    }
  ];

  return (
    <Box>
      <Box sx={{ 
        display: { xs: 'flex', md: 'grid' },
        flexDirection: { xs: 'column', md: 'unset' },
        gridTemplateColumns: { md: 'repeat(3, 1fr)' },
        gap: { xs: 3, md: 2.5 },
        px: { xs: 0, md: 0 }
      }}>
        {statCards.map((card, index) => (
          <Box key={index} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <StatCard {...card} />
          </Box>
        ))}
      </Box>

      {/* بخش آمار تکمیلی */}
      <Box sx={{ 
        mt: 2.5 
      }}>
        <Card elevation={2}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography variant="h6" fontWeight="bold">
                🔔 فعالیت‌های اخیر
              </Typography>
              
              {/* فیلتر و مرتب‌سازی */}
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 1 }, 
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-end' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                {/* فیلتر بر اساس نوع فعالیت */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <FontAwesomeIcon icon={faFilter} style={{ fontSize: '0.9rem', color: ADMIN_THEME.primary }} />
                  <FormControl size="small" sx={{ 
                    minWidth: { xs: '100%', sm: 120 },
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <InputLabel>نوع فعالیت</InputLabel>
                    <Select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      label="نوع فعالیت"
                      sx={{
                        borderRadius: 1,
                        fontSize: '0.8rem',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: ADMIN_THEME.bgLight,
                        }
                      }}
                    >
                      <MenuItem value="">همه فعالیت‌ها</MenuItem>
                      <MenuItem value="user">کاربران</MenuItem>
                      <MenuItem value="job">آگهی‌ها</MenuItem>
                      <MenuItem value="application">درخواست‌ها</MenuItem>
                      <MenuItem value="company">شرکت‌ها</MenuItem>
                      <MenuItem value="subscription">اشتراک‌ها</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* مرتب‌سازی */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '0.9rem', color: ADMIN_THEME.primary }} />
                  <FormControl size="small" sx={{ 
                    minWidth: { xs: '100%', sm: 120 },
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <InputLabel>مرتب‌سازی</InputLabel>
                    <Select
                      value={activitySortBy}
                      onChange={(e) => setActivitySortBy(e.target.value)}
                      label="مرتب‌سازی"
                      sx={{
                        borderRadius: 1,
                        fontSize: '0.8rem',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: ADMIN_THEME.bgLight,
                        }
                      }}
                    >
                      <MenuItem value="timestamp">تاریخ</MenuItem>
                      <MenuItem value="type">نوع فعالیت</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* دکمه تغییر جهت مرتب‌سازی */}
                <IconButton
                  size="small"
                  onClick={() => setActivitySortOrder(activitySortOrder === 'desc' ? 'asc' : 'desc')}
                  sx={{
                    bgcolor: ADMIN_THEME.bgLight,
                    color: ADMIN_THEME.primary,
                    '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight },
                    width: { xs: 40, sm: 32 },
                    height: { xs: 40, sm: 32 }
                  }}
                >
                  <FontAwesomeIcon 
                    icon={faArrowUp} 
                    style={{ 
                      fontSize: '0.8rem',
                      transform: activitySortOrder === 'asc' ? 'rotate(180deg)' : 'none'
                    }} 
                  />
                </IconButton>

                {/* دکمه بازنشانی */}
                <IconButton
                  size="small"
                  onClick={() => {
                    setActivityFilter('');
                    setActivitySortBy('timestamp');
                    setActivitySortOrder('desc');
                    setActivityPage(1);
                  }}
                  sx={{
                    bgcolor: ADMIN_THEME.bgLight,
                    color: ADMIN_THEME.primary,
                    '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight },
                    width: { xs: 40, sm: 32 },
                    height: { xs: 40, sm: 32 }
                  }}
                >
                  <FontAwesomeIcon icon={faRefresh} style={{ fontSize: '0.8rem' }} />
                </IconButton>
              </Box>
            </Box>
            
            {/* کنترل تعداد نمایش */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 2,
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                نمایش:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={activityPageSize}
                  onChange={(e) => {
                    setActivityPageSize(Number(e.target.value));
                    setActivityPage(1); // بازگشت به صفحه اول
                  }}
                  sx={{
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value={10}>۱۰</MenuItem>
                  <MenuItem value={20}>۲۰</MenuItem>
                  <MenuItem value={30}>۳۰</MenuItem>
                  <MenuItem value={50}>۵۰</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                از {convertToPersianNumbers(stats?.recentActivity?.length || 0)} فعالیت
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {(() => {
                // فیلتر و مرتب‌سازی فعالیت‌ها در زمان render
                let filteredActivities = stats?.recentActivity || [];
                
                // فیلتر بر اساس نوع
                if (activityFilter) {
                  filteredActivities = filteredActivities.filter(activity => activity.type === activityFilter);
                }
                
                // مرتب‌سازی
                filteredActivities.sort((a, b) => {
                  if (activitySortBy === 'timestamp') {
                    const dateA = a.originalDate || new Date(0);
                    const dateB = b.originalDate || new Date(0);
                    return activitySortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
                  } else if (activitySortBy === 'type') {
                    const activityOrder = ['user', 'job', 'application', 'company', 'subscription'];
                    const orderA = activityOrder.indexOf(a.type);
                    const orderB = activityOrder.indexOf(b.type);
                    return activitySortOrder === 'desc' ? orderB - orderA : orderA - orderB;
                  }
                  return 0;
                });
                
                // محاسبه صفحه‌بندی
                const totalActivities = filteredActivities.length;
                const totalPages = Math.ceil(totalActivities / activityPageSize);
                const startIndex = (activityPage - 1) * activityPageSize;
                const endIndex = startIndex + activityPageSize;
                const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
                
                return filteredActivities.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {paginatedActivities.map((activity, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 1, 
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: 'action.selected',
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}>
                      {/* آیکون فعالیت */}
                      <Box sx={{ 
                        mr: { xs: 0, sm: 2 }, 
                        mb: { xs: 1, sm: 0 },
                        mt: { xs: 0, sm: 0.5 },
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activity.type === 'user' ? 'primary.main' :
                               activity.type === 'job' ? 'success.main' :
                               activity.type === 'application' ? 'warning.main' :
                               activity.type === 'company' ? 'info.main' :
                               activity.type === 'subscription' ? 'secondary.main' : 'text.secondary'
                      }}>
                        {activity.icon || <FontAwesomeIcon icon={faBell} style={{ fontSize: '1rem' }} />}
                      </Box>
                      
                      {/* محتوای فعالیت */}
                      <Box sx={{ 
                        flex: 1,
                        width: { xs: '100%', sm: 'auto' },
                        textAlign: { xs: 'center', sm: 'left' }
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500, 
                            mb: 0.5,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          {activity.action || 'فعالیت جدید'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            lineHeight: { xs: 1.4, sm: 1.5 }
                          }}
                        >
                          {activity.description || 'توضیحات فعالیت'}
                        </Typography>
                      </Box>
                      
                      {/* زمان */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          ml: { xs: 0, sm: 1 },
                          mt: { xs: 1, sm: 0 },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          textAlign: { xs: 'center', sm: 'left' },
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        {activity.timestamp || 'اخیراً'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  textAlign="center" 
                  py={{ xs: 3, sm: 4 }}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  📝 هیچ فعالیت اخیری یافت نشد
                </Typography>
              );
              })()}
            </Box>
            
            {/* صفحه‌بندی */}
            {(() => {
              const totalActivities = stats?.recentActivity?.length || 0;
              const totalPages = Math.ceil(totalActivities / activityPageSize);
              
              return totalPages > 1 ? (
                <Box sx={{ mt: 3 }}>
                  <CustomPagination
                    page={activityPage}
                    totalPages={totalPages}
                    pageSize={activityPageSize}
                    onPageChange={setActivityPage}
                    onPageSizeChange={setActivityPageSize}
                    theme={ADMIN_THEME}
                    showPageSizeSelector={false}
                  />
                </Box>
              ) : null;
            })()}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminStats;