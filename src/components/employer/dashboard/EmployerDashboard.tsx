"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, IconButton, CircularProgress, Button, Paper, CardHeader, CardActions } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { EMPLOYER_BLUE, EMPLOYER_THEME } from '../../../constants/colors';
import { apiGet } from '../../../lib/axios';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  viewCount: number;
  recentActivity: Array<{
    id: number;
    type: string;
    title: string;
    date: string;
  }>;
}

interface RecentApplication {
  id: number;
  job_title: string;
  applicant_name: string;
  created_at: string;
  status: string;
}

interface JobAdvertisement {
  id: number;
  advertisement: {
    title: string;
    slug: string;
    status: string;
    created_at: string;
  };
}

export default function EmployerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [jobs, setJobs] = useState<JobAdvertisement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const jobsResponse = await apiGet<JobAdvertisement[]>(`${baseApiUrl}/job/`);
        
        const applicationsResponse = await apiGet<RecentApplication[]>(`${baseApiUrl}/applications/`);
        
        const activeJobs = jobsResponse.data.filter(job => job.advertisement.status === 'Approved').length;
        const totalApplicationsCount = applicationsResponse.data.length;
        
        setStats({
          totalJobs: jobsResponse.data.length,
          activeJobs: activeJobs,
          totalApplications: totalApplicationsCount,
          viewCount: 120,
          recentActivity: applicationsResponse.data.slice(0, 5).map(app => ({
            id: app.id,
            type: 'application',
            title: `درخواست جدید برای آگهی ${app.job_title}`,
            date: formatDate(app.created_at)
          }))
        });
        
        setJobs(jobsResponse.data);
        
        setRecentApplications(applicationsResponse.data.slice(0, 5).map(app => ({
          id: app.id,
          job_title: app.job_title,
          applicant_name: app.applicant_name,
          created_at: formatDate(app.created_at),
          status: app.status
        })));
        
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('خطا در دریافت اطلاعات داشبورد:', error);
        setError('خطا در دریافت اطلاعات از سرور. لطفاً دوباره تلاش کنید.');
        
        setStats({
          totalJobs: 3,
          activeJobs: 2,
          totalApplications: 5,
          viewCount: 120,
          recentActivity: []
        });
        
        setRecentApplications([
          {
            id: 1,
            job_title: 'برنامه‌نویس فرانت‌اند',
            applicant_name: 'علی محمدی',
            created_at: '۱۴۰۲/۰۴/۱۵',
            status: 'pending'
          },
          {
            id: 2,
            job_title: 'طراح گرافیک',
            applicant_name: 'مریم احمدی',
            created_at: '۱۴۰۲/۰۴/۱۴',
            status: 'viewed'
          }
        ]);
        
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fa-IR').format(date);
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pe':
      case 'pending': return '#f39c12';
      case 'ir':
      case 'viewed': return '#3498db';
      case 'ac':
      case 'accepted': return '#2ecc71';
      case 're':
      case 'rejected': return '#e74c3c';
      default: return '#777';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pe':
      case 'pending': return 'در انتظار بررسی';
      case 'ir':
      case 'viewed': return 'مشاهده شده';
      case 'ac':
      case 'accepted': return 'پذیرفته شده';
      case 're':
      case 'rejected': return 'رد شده';
      default: return status;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pe':
      case 'pending': return <HourglassEmptyIcon fontSize="small" />;
      case 'ir':
      case 'viewed': return <VisibilityIcon fontSize="small" />;
      case 'ac':
      case 'accepted': return <DoneIcon fontSize="small" />;
      case 're':
      case 'rejected': return <NotInterestedIcon fontSize="small" />;
      default: return <HourglassEmptyIcon fontSize="small" />;
    }
  };
  
  const handleAddNewJob = () => {
    router.push('/employer/jobs/new');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: EMPLOYER_BLUE }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: EMPLOYER_THEME.dark }}>
          داشبورد کارفرما
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddNewJob}
          sx={{ 
            bgcolor: EMPLOYER_BLUE,
            '&:hover': { bgcolor: EMPLOYER_THEME.dark },
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          افزودن آگهی جدید
        </Button>
      </Box>
      
      {error && (
        <Box mb={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              bgcolor: '#ffebee', 
              borderRadius: '12px',
              border: '1px solid #ffcdd2'
            }}
          >
            <Box display="flex" alignItems="center">
              <Box color="#d32f2f" mr={1}>
                <NotInterestedIcon />
              </Box>
              <Typography color="#d32f2f">{error}</Typography>
            </Box>
            <Box mt={2}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => window.location.reload()}
                sx={{ 
                  color: '#d32f2f', 
                  borderColor: '#d32f2f',
                  '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.04)' }
                }}
              >
                تلاش مجدد
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Box 
        display="flex" 
        flexWrap="wrap" 
        sx={{ 
          mx: -1.5,
          mb: 4 
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14} fontWeight="medium">
                    کل آگهی‌ها
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1} sx={{ color: EMPLOYER_THEME.dark }}>
                    {stats?.totalJobs ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={60} height={60} borderRadius="50%">
                  <WorkIcon sx={{ color: EMPLOYER_BLUE, fontSize: 30 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14} fontWeight="medium">
                    آگهی‌های فعال
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1} sx={{ color: EMPLOYER_THEME.dark }}>
                    {stats?.activeJobs ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={60} height={60} borderRadius="50%">
                  <TrendingUpIcon sx={{ color: EMPLOYER_BLUE, fontSize: 30 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14} fontWeight="medium">
                    درخواست‌ها
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1} sx={{ color: EMPLOYER_THEME.dark }}>
                    {stats?.totalApplications ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={60} height={60} borderRadius="50%">
                  <PeopleAltIcon sx={{ color: EMPLOYER_BLUE, fontSize: 30 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14} fontWeight="medium">
                    بازدیدها
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1} sx={{ color: EMPLOYER_THEME.dark }}>
                    {stats?.viewCount ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={60} height={60} borderRadius="50%">
                  <VisibilityIcon sx={{ color: EMPLOYER_BLUE, fontSize: 30 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ 
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: '12px',
        mb: 4,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          bgcolor: EMPLOYER_THEME.bgLight, 
          p: 2, 
          px: 3,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" sx={{ color: EMPLOYER_THEME.dark }}>
              درخواست‌های اخیر
            </Typography>
            <Button 
              onClick={() => router.push('/employer/applications')}
              size="small" 
              sx={{ 
                color: EMPLOYER_BLUE,
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              مشاهده همه
            </Button>
          </Box>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {recentApplications.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column"
              alignItems="center" 
              justifyContent="center" 
              py={5}
              px={3}
              textAlign="center"
            >
              <PeopleAltIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>
                هیچ درخواستی وجود ندارد
              </Typography>
              <Typography variant="body2" color="text.secondary" maxWidth="400px" mb={2}>
                هنوز هیچ درخواستی برای آگهی‌های شما ثبت نشده است. پس از دریافت درخواست، آن‌ها را در اینجا مشاهده خواهید کرد.
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => router.push('/employer/jobs')}
                sx={{ 
                  color: EMPLOYER_BLUE, 
                  borderColor: EMPLOYER_BLUE,
                  '&:hover': { borderColor: EMPLOYER_BLUE, bgcolor: 'rgba(33, 150, 243, 0.04)' }
                }}
              >
                مدیریت آگهی‌ها
              </Button>
            </Box>
          ) : (
            <Box>
              {recentApplications.map((application, index) => (
                <Box 
                  key={application.id} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  p={2.5} 
                  px={3}
                  sx={{
                    borderBottom: index < recentApplications.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium" color={EMPLOYER_THEME.dark}>
                      {application.job_title}
                    </Typography>
                    <Typography color="text.secondary" fontSize={14}>
                      {application.applicant_name} - {application.created_at}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography 
                      fontSize={13} 
                      fontWeight="medium" 
                      sx={{ 
                        color: getStatusColor(application.status),
                        bgcolor: `${getStatusColor(application.status)}15`,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      {getStatusIcon(application.status)}
                      {getStatusText(application.status)}
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        color: EMPLOYER_BLUE,
                        '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' }
                      }}
                      onClick={() => router.push(`/employer/applications/${application.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              
              <Box display="flex" justifyContent="center" p={3}>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push('/employer/applications')}
                  sx={{ 
                    color: EMPLOYER_BLUE, 
                    borderColor: EMPLOYER_BLUE,
                    borderRadius: '8px',
                    px: 3,
                    '&:hover': { 
                      borderColor: EMPLOYER_BLUE,
                      bgcolor: EMPLOYER_THEME.bgVeryLight
                    }
                  }}
                >
                  مشاهده همه درخواست‌ها
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card 
        sx={{ 
          p: 3, 
          mt: 4, 
          borderRadius: '12px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: EMPLOYER_THEME.dark }}>
          فعالیت‌های اخیر
        </Typography>
        
        <Box 
          display="flex" 
          flexWrap="wrap"
          sx={{ mx: -1.5 }}
        >
          {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
            <Box 
              width="100%" 
              textAlign="center" 
              py={4}
            >
              <Typography color="text.secondary">
                هیچ فعالیتی ثبت نشده است.
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                پس از دریافت درخواست‌ها یا فعالیت‌های جدید، آن‌ها در اینجا نمایش داده می‌شوند.
              </Typography>
            </Box>
          ) : (
            stats.recentActivity.map((activity) => (
              <Box 
                key={activity.id} 
                sx={{ 
                  width: { xs: '100%', md: '50%' },
                  p: 1.5
                }}
              >
                <Card 
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-3px)',
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardHeader
                    title={activity.title}
                    subheader={activity.date}
                    titleTypographyProps={{ fontSize: 16, fontWeight: 'medium', color: EMPLOYER_THEME.dark }}
                    subheaderTypographyProps={{ fontSize: 13 }}
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {activity.type === 'application' && 'یک درخواست جدید دریافت کرده‌اید.'}
                      {activity.type === 'view' && 'آگهی شما بازدید جدید داشته است.'}
                      {activity.type === 'job' && 'وضعیت آگهی شما تغییر کرده است.'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button 
                      size="small" 
                      sx={{ color: EMPLOYER_BLUE }}
                      onClick={() => activity.type === 'application' ? 
                        router.push('/employer/applications') : 
                        router.push('/employer/jobs')}
                    >
                      مشاهده جزئیات
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))
          )}
        </Box>
      </Card>
    </Box>
  );
} 