"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, IconButton, CircularProgress, Button, Paper, CardHeader, CardActions } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
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
          viewCount: 0,
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
      } catch (error) {
        console.error('خطا در دریافت اطلاعات داشبورد:', error);
        setError('خطا در دریافت اطلاعات از سرور. لطفاً دوباره تلاش کنید.');
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
  
  const handleAddNewJob = () => {
    router.push('/employer/jobs/new');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="bold">
          داشبورد کارفرما
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddNewJob}
          sx={{ 
            bgcolor: EMPLOYER_BLUE,
            '&:hover': { bgcolor: EMPLOYER_THEME.dark }
          }}
        >
          افزودن آگهی جدید
        </Button>
      </Box>
      
      {error && (
        <Box mb={3}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#fff8e1' }}>
            <Typography color="error">{error}</Typography>
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
        <Box sx={{ width: { xs: '100%', md: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14}>
                    کل آگهی‌ها
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>
                    {stats?.totalJobs ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={50} height={50} borderRadius="50%">
                  <WorkIcon sx={{ color: EMPLOYER_BLUE }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14}>
                    آگهی‌های فعال
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>
                    {stats?.activeJobs ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={50} height={50} borderRadius="50%">
                  <TrendingUpIcon sx={{ color: EMPLOYER_BLUE }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14}>
                    درخواست‌ها
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>
                    {stats?.totalApplications ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={50} height={50} borderRadius="50%">
                  <PeopleAltIcon sx={{ color: EMPLOYER_BLUE }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '50%', lg: '25%' }, p: 1.5 }}>
          <Card sx={{ 
            bgcolor: 'white',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontSize={14}>
                    بازدیدها
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>
                    {stats?.viewCount ?? 0}
                  </Typography>
                </Box>
                <Box bgcolor={EMPLOYER_THEME.bgVeryLight} display="flex" alignItems="center" justifyContent="center" width={50} height={50} borderRadius="50%">
                  <VisibilityIcon sx={{ color: EMPLOYER_BLUE }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ 
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
        mb: 4
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              درخواست‌های اخیر
            </Typography>
            <Button 
              onClick={() => router.push('/employer/applications')}
              size="small" 
              sx={{ color: EMPLOYER_BLUE }}
            >
              مشاهده همه
            </Button>
          </Box>

          {recentApplications.length === 0 ? (
            <Typography color="text.secondary" align="center" py={3}>
              هیچ درخواستی وجود ندارد
            </Typography>
          ) : (
            <Box>
              {recentApplications.map((application) => (
                <Box 
                  key={application.id} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  p={2} 
                  mb={1}
                  bgcolor="background.paper"
                  borderRadius={1}
                  border="1px solid #eee"
                >
                  <Box>
                    <Typography fontWeight="medium">
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
                        bgcolor: `${getStatusColor(application.status)}20`,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      {getStatusText(application.status)}
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ ml: 1 }}
                      onClick={() => router.push(`/employer/applications/${application.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              
              <Box display="flex" justifyContent="center" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push('/employer/applications')}
                  sx={{ color: EMPLOYER_BLUE, borderColor: EMPLOYER_BLUE }}
                >
                  مشاهده همه
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>فعالیت‌های اخیر</Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box 
          display="flex" 
          flexWrap="wrap"
          sx={{ mx: -1 }}
        >
          {stats?.recentActivity?.map((activity) => (
            <Box 
              key={activity.id} 
              sx={{ 
                width: { xs: '100%', md: '50%' },
                p: 1
              }}
            >
              <Card variant="outlined">
                <CardHeader
                  title={activity.title}
                  subheader={activity.date}
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {activity.type === 'application' && 'یک درخواست جدید دریافت کرده‌اید.'}
                    {activity.type === 'view' && 'آگهی شما بازدید جدید داشته است.'}
                    {activity.type === 'job' && 'وضعیت آگهی شما تغییر کرده است.'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => activity.type === 'application' ? 
                      router.push('/employer/applications') : 
                      router.push('/employer/jobs')}
                  >
                    مشاهده جزئیات
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
} 