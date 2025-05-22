"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faUsers,
  faFileAlt,
  faCheckCircle,
  faExclamationCircle,
  faSync,
  faChevronLeft,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/store/authStore';
import authService from '@/lib/authService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns-jalali';
import { EmployerDashboardStats } from '../layout/EmployerLayout';

interface Job {
  id: number;
  title: string;
  company_name: string;
  status: string;
  created_at: string;
  applications_count: number;
  is_urgent: boolean;
}

interface Application {
  id: number;
  job_title: string;
  candidate_name: string;
  status: string;
  applied_at: string;
}

export default function EmployerDashboard() {
  const { stats, loading: statsLoading, error: statsError } = EmployerDashboardStats();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [errorJobs, setErrorJobs] = useState<string | null>(null);
  const [errorApplications, setErrorApplications] = useState<string | null>(null);

  const user = useAuthStore(state => state.user);
  const router = useRouter();

  useEffect(() => {
    // بررسی دسترسی کاربر
    if (user && user.user_type !== 'employer' && user.user_type !== 'EM') {
      router.push('/');
      return;
    }
    
    // دریافت آگهی‌های شغلی
    const fetchJobs = async () => {
      setLoadingJobs(true);
      setErrorJobs(null);
      
      try {
        await authService.validateAndRefreshTokenIfNeeded();
        
        const response = await fetch('/api/jobs/employer/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          let errorMessage = 'خطا در دریافت آگهی‌های شغلی';
          
          if (response.status === 401) {
            errorMessage = 'لطفاً مجدداً وارد حساب کاربری خود شوید';
          } else if (response.status === 403) {
            errorMessage = 'شما به این بخش دسترسی ندارید';
          } else if (response.status === 404) {
            errorMessage = 'اطلاعاتی یافت نشد';
          } else if (response.status >= 500) {
            errorMessage = 'خطای سرور، لطفاً بعداً تلاش کنید';
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('خطا در دریافت آگهی‌های شغلی:', error);
        setErrorJobs(error instanceof Error ? error.message : 'خطا در دریافت آگهی‌های شغلی');
      } finally {
        setLoadingJobs(false);
      }
    };
    
    // دریافت درخواست‌های استخدام
    const fetchApplications = async () => {
      setLoadingApplications(true);
      setErrorApplications(null);
      
      try {
        await authService.validateAndRefreshTokenIfNeeded();
        
        const response = await fetch('/api/applications/employer/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          let errorMessage = 'خطا در دریافت درخواست‌های استخدام';
          
          if (response.status === 401) {
            errorMessage = 'لطفاً مجدداً وارد حساب کاربری خود شوید';
          } else if (response.status === 403) {
            errorMessage = 'شما به این بخش دسترسی ندارید';
          } else if (response.status === 404) {
            errorMessage = 'اطلاعاتی یافت نشد';
          } else if (response.status >= 500) {
            errorMessage = 'خطای سرور، لطفاً بعداً تلاش کنید';
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (error) {
        console.error('خطا در دریافت درخواست‌های استخدام:', error);
        setErrorApplications(error instanceof Error ? error.message : 'خطا در دریافت درخواست‌های استخدام');
      } finally {
        setLoadingApplications(false);
      }
    };
    
    fetchJobs();
    fetchApplications();
  }, [user, router]);

  // بارگذاری مجدد داده‌ها
  const handleRefresh = async () => {
    // دریافت مجدد آمار، آگهی‌ها و درخواست‌ها
    setLoadingJobs(true);
    setLoadingApplications(true);
    setErrorJobs(null);
    setErrorApplications(null);
    
    try {
      await authService.validateAndRefreshTokenIfNeeded();
      
      // دریافت آگهی‌های شغلی
      const jobsResponse = await fetch('/api/jobs/employer/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs || []);
      } else {
        throw new Error('خطا در دریافت آگهی‌های شغلی');
      }
      
      // دریافت درخواست‌های استخدام
      const applicationsResponse = await fetch('/api/applications/employer/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications || []);
      } else {
        throw new Error('خطا در دریافت درخواست‌های استخدام');
      }
    } catch (error) {
      console.error('خطا در بروزرسانی داده‌ها:', error);
    } finally {
      setLoadingJobs(false);
      setLoadingApplications(false);
    }
  };

  // وضعیت آگهی شغلی
  const getJobStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'فعال':
        return <Chip 
          label="فعال" 
          size="small" 
          color="success" 
          sx={{ fontWeight: 500 }} 
        />;
      case 'pending':
      case 'در انتظار تایید':
        return <Chip 
          label="در انتظار تایید" 
          size="small" 
          color="warning" 
          sx={{ fontWeight: 500 }} 
        />;
      case 'expired':
      case 'منقضی شده':
        return <Chip 
          label="منقضی شده" 
          size="small" 
          color="error" 
          sx={{ fontWeight: 500 }} 
        />;
      default:
        return <Chip 
          label={status} 
          size="small" 
          color="default" 
          sx={{ fontWeight: 500 }} 
        />;
    }
  };

  // وضعیت درخواست استخدام
  const getApplicationStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'در انتظار بررسی':
        return <Chip 
          label="در انتظار بررسی" 
          size="small" 
          color="warning" 
          sx={{ fontWeight: 500 }} 
        />;
      case 'shortlisted':
      case 'منتخب':
        return <Chip 
          label="منتخب" 
          size="small" 
          color="info" 
          sx={{ fontWeight: 500 }} 
        />;
      case 'interviewed':
      case 'مصاحبه شده':
        return <Chip 
          label="مصاحبه شده" 
          size="small" 
          color="primary" 
          sx={{ fontWeight: 500 }} 
        />;
      case 'rejected':
      case 'رد شده':
        return <Chip 
          label="رد شده" 
          size="small" 
          color="error" 
          sx={{ fontWeight: 500 }} 
        />;
      case 'hired':
      case 'استخدام شده':
        return <Chip 
          label="استخدام شده" 
          size="small" 
          color="success" 
          sx={{ fontWeight: 500 }} 
        />;
      default:
        return <Chip 
          label={status} 
          size="small" 
          color="default" 
          sx={{ fontWeight: 500 }} 
        />;
    }
  };

  // نمایش اسکلتون برای کارت‌های آمار
  const renderStatsSkeletons = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="40%" height={50} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={50} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // نمایش اسکلتون برای جدول‌ها
  const renderTableSkeleton = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {[1, 2, 3, 4, 5].map((item) => (
              <TableCell key={item}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3].map((row) => (
            <TableRow key={row}>
              {[1, 2, 3, 4, 5].map((col) => (
                <TableCell key={col}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* هدر داشبورد */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          داشبورد کارفرما
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FontAwesomeIcon icon={faSync} />}
          onClick={handleRefresh}
          disabled={statsLoading || loadingJobs || loadingApplications}
        >
          بروزرسانی
        </Button>
      </Box>

      {/* کارت‌های آمار */}
      {statsLoading ? (
        renderStatsSkeletons()
      ) : statsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>{statsError}</Alert>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: 'linear-gradient(135deg, #2E5BFF 0%, #4F7CFF 100%)',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  کل آگهی‌ها
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <FontAwesomeIcon icon={faBriefcase} />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ py: 2, fontWeight: 700 }}>
                {stats.totalJobs}
              </Typography>
              <Button 
                component={Link} 
                href="/employer/jobs"
                color="inherit"
                size="small"
                endIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                sx={{ 
                  mt: 'auto', 
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                مشاهده همه
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: 'linear-gradient(135deg, #33AC2E 0%, #4CD147 100%)',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  آگهی‌های فعال
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ py: 2, fontWeight: 700 }}>
                {stats.activeJobs}
              </Typography>
              <Button 
                component={Link} 
                href="/employer/jobs?status=active"
                color="inherit"
                size="small"
                endIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                sx={{ 
                  mt: 'auto', 
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                مشاهده فعال
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: 'linear-gradient(135deg, #7747FF 0%, #976FFF 100%)',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  کل درخواست‌ها
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <FontAwesomeIcon icon={faFileAlt} />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ py: 2, fontWeight: 700 }}>
                {stats.totalApplications}
              </Typography>
              <Button 
                component={Link} 
                href="/employer/applications"
                color="inherit"
                size="small"
                endIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                sx={{ 
                  mt: 'auto', 
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                مشاهده همه
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8F5C 100%)',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  درخواست‌های جدید
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <FontAwesomeIcon icon={faUsers} />
                </Avatar>
              </Box>
              <Typography variant="h3" component="div" sx={{ py: 2, fontWeight: 700 }}>
                {stats.newApplications}
              </Typography>
              <Button 
                component={Link} 
                href="/employer/applications?status=new"
                color="inherit"
                size="small"
                endIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                sx={{ 
                  mt: 'auto', 
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                مشاهده جدید
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* آگهی‌های شغلی اخیر */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Typography variant="h6" fontWeight={600}>
              آگهی‌های شغلی اخیر
            </Typography>
          }
          action={
            <Button 
              component={Link}
              href="/employer/jobs"
              endIcon={<FontAwesomeIcon icon={faChevronLeft} />}
              color="primary"
            >
              مشاهده همه
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {errorJobs && <Alert severity="error" sx={{ mb: 2 }}>{errorJobs}</Alert>}
          
          {loadingJobs ? (
            renderTableSkeleton()
          ) : jobs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                هنوز هیچ آگهی شغلی ثبت نکرده‌اید.
              </Typography>
              <Button 
                component={Link}
                href="/employer/jobs/add"
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
              >
                ایجاد آگهی جدید
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>عنوان شغلی</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>تعداد درخواست‌ها</TableCell>
                    <TableCell>تاریخ ایجاد</TableCell>
                    <TableCell>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {job.title}
                          </Typography>
                          {job.is_urgent && (
                            <Chip 
                              label="فوری" 
                              size="small" 
                              color="error" 
                              sx={{ mr: 1, fontWeight: 500, ml: 1 }} 
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{getJobStatusChip(job.status)}</TableCell>
                      <TableCell>{job.applications_count}</TableCell>
                      <TableCell>
                        {job.created_at ? format(new Date(job.created_at), 'yyyy/MM/dd') : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="مشاهده آگهی">
                          <IconButton 
                            size="small" 
                            component={Link}
                            href={`/employer/jobs/${job.id}`}
                            color="primary"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* درخواست‌های استخدام اخیر */}
      <Card>
        <CardHeader 
          title={
            <Typography variant="h6" fontWeight={600}>
              درخواست‌های استخدام اخیر
            </Typography>
          }
          action={
            <Button 
              component={Link}
              href="/employer/applications"
              endIcon={<FontAwesomeIcon icon={faChevronLeft} />}
              color="primary"
            >
              مشاهده همه
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {errorApplications && <Alert severity="error" sx={{ mb: 2 }}>{errorApplications}</Alert>}
          
          {loadingApplications ? (
            renderTableSkeleton()
          ) : applications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                هنوز هیچ درخواست استخدامی دریافت نکرده‌اید.
              </Typography>
              <Button 
                component={Link}
                href="/employer/jobs/add"
                variant="outlined" 
                color="primary"
                sx={{ mt: 2 }}
              >
                ایجاد آگهی شغلی جدید
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>نام کارجو</TableCell>
                    <TableCell>عنوان شغلی</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>تاریخ درخواست</TableCell>
                    <TableCell>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {application.candidate_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{application.job_title}</TableCell>
                      <TableCell>{getApplicationStatusChip(application.status)}</TableCell>
                      <TableCell>
                        {application.applied_at ? format(new Date(application.applied_at), 'yyyy/MM/dd') : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="مشاهده درخواست">
                          <IconButton 
                            size="small" 
                            component={Link}
                            href={`/employer/applications/${application.id}`}
                            color="primary"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 