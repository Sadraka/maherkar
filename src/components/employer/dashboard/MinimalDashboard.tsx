'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/axios';
import { useAuth } from '@/store/authStore';
import { EMPLOYER_THEME } from '@/constants/colors';
import { Box, Container, Typography, Button, Paper, Divider, Avatar, Chip } from '@mui/material';

// آیکون‌های مورد نیاز
import WorkIcon from '@mui/icons-material/Work';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

// تعریف interface برای state ارور
interface ErrorState {
  profile: string | null;
  jobs: string | null;
  applications: string | null;
  companies: string | null;
}

/**
 * کامپوننت داشبورد کارفرما مطابق با طراحی صفحه اصلی
 */
export default function MinimalDashboard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [jobsData, setJobsData] = useState<any>(null);
  const [applicationsData, setApplicationsData] = useState<any>(null);
  const [companiesData, setCompaniesData] = useState<any>(null);
  const [loading, setLoading] = useState({
    profile: true,
    jobs: true,
    applications: true,
    companies: true
  });
  const [error, setError] = useState<ErrorState>({
    profile: null,
    jobs: null,
    applications: null,
    companies: null
  });

  // بارگذاری داده‌ها به صورت موازی
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileResponse, jobsResponse, applicationsResponse, companiesResponse] = await Promise.all([
          apiGet('/profiles/employers/'),
          apiGet('/ads/job/'),
          apiGet('/ads/applications/'),
          apiGet('/companies/')
        ]);

        setProfileData(profileResponse.data);
        setJobsData(jobsResponse.data);
        setApplicationsData(applicationsResponse.data);
        setCompaniesData(companiesResponse.data);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات داشبورد:', err);
        setError({
          profile: 'خطا در بارگذاری اطلاعات پروفایل',
          jobs: 'خطا در بارگذاری آگهی‌های شغلی',
          applications: 'خطا در بارگذاری درخواست‌ها',
          companies: 'خطا در بارگذاری اطلاعات شرکت‌ها'
        });
      } finally {
        setLoading({
          profile: false,
          jobs: false,
          applications: false,
          companies: false
        });
      }
    };

    fetchDashboardData();
  }, []);

  // محاسبه آمار
  const activeJobs = jobsData?.filter((job: any) => job.advertisement?.status === 'ACTIVE' || job.advertisement?.status === 'Approved')?.length || 0;
  const totalApplications = applicationsData?.length || 0;
  const totalCompanies = companiesData?.length || 0;

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* هدر داشبورد - مشابه صفحه اصلی */}
        <Box 
          sx={{ 
            bgcolor: '#4285F4', 
            p: 3, 
            borderRadius: '16px',
            color: 'white',
            mb: 4,
            textAlign: 'left'
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            خوش‌آمدید، {profileData?.user?.full_name || user?.full_name || user?.username || 'کارفرما'}
          </Typography>
          <Typography>
            {profileData?.personal_info ? 
              `به پنل مدیریت کارفرمایان خوش آمدید. از اینجا می‌توانید آگهی‌های شغلی، درخواست‌های کاریابی و شرکت‌های خود را مدیریت کنید.` :
              'به پنل مدیریت کارفرمایان خوش آمدید. از اینجا می‌توانید آگهی‌های شغلی، درخواست‌های کاریابی و شرکت‌های خود را مدیریت کنید.'
            }
          </Typography>
        </Box>
        
        {/* کارت‌های آماری */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 3, sm: 4 } }}>
            {/* کارت آگهی‌های فعال */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'left',
                borderRadius: 3,
                boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                border: '1px solid #f1f1f1',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                  borderColor: '#e6e6e6'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <WorkIcon sx={{ fontSize: 32, color: EMPLOYER_THEME.primary, ml: 1.5 }} />
                <Typography variant="h5" component="div" fontWeight="bold">
                  {loading.jobs ? '...' : activeJobs}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                آگهی‌های فعال
              </Typography>
            </Paper>
            
            {/* کارت درخواست‌های کاریابی */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'left',
                borderRadius: 3,
                boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                border: '1px solid #f1f1f1',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                  borderColor: '#e6e6e6'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PeopleAltIcon sx={{ fontSize: 32, color: EMPLOYER_THEME.primary, ml: 1.5 }} />
                <Typography variant="h5" component="div" fontWeight="bold">
                  {loading.applications ? '...' : totalApplications}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                درخواست‌های کاریابی
              </Typography>
            </Paper>
            
            {/* کارت شرکت‌های من */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'left',
                borderRadius: 3,
                boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                border: '1px solid #f1f1f1',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                  borderColor: '#e6e6e6'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <BusinessIcon sx={{ fontSize: 32, color: EMPLOYER_THEME.primary, ml: 1.5 }} />
                <Typography variant="h5" component="div" fontWeight="bold">
                  {loading.companies ? '...' : totalCompanies}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                شرکت‌های من
              </Typography>
            </Paper>
            
            {/* کارت ثبت آگهی جدید */}
            <Paper 
              elevation={0} 
              sx={{ 
                textAlign: 'center',
                borderRadius: 3,
                height: '100%',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(33, 150, 243, 0.2)'
                }
              }}
            >
              <Link 
                href="/employer/jobs/create" 
                style={{ 
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '24px',
                  background: '#4285F4',
                  color: 'white'
                }}
              >
                <Typography fontWeight="medium" sx={{ fontSize: '1.1rem' }}>
                  ثبت آگهی جدید
                </Typography>
              </Link>
            </Paper>
          </Box>
        </Box>

        {/* بخش آگهی‌های شغلی */}
        <Box sx={{ mb: 8 }}>
          {/* سربرگ بخش آگهی‌های شغلی */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4, 
            justifyContent: 'space-between',
            px: 1,
            py: 1.5,
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Link href="/employer/jobs" style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: EMPLOYER_THEME.primary,
                '&:hover': {
                  color: EMPLOYER_THEME.dark
                }
              }}>
                <KeyboardArrowLeftIcon sx={{ fontSize: 18, mt: 0.2, ml: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>همه آگهی‌ها</Typography>
              </Box>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ color: EMPLOYER_THEME.primary, ml: 1.5, fontSize: 24 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                آگهی‌های شغلی
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 3, sm: 4 } }}>
            {loading.jobs ? (
              // نمایش وضعیت بارگذاری
              Array.from(new Array(4)).map((_, index) => (
                <Paper 
                  key={index}
                  elevation={0} 
                  sx={{ 
                    p: 0, 
                    borderRadius: 3,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f1f1',
                    overflow: 'hidden',
                    height: '100%'
                  }}
                >
                  <Box sx={{ p: 3, bgcolor: '#f9f9f9', height: '120px' }}></Box>
                </Paper>
              ))
            ) : error.jobs ? (
              // نمایش خطا
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'left',
                  color: 'red',
                  borderRadius: 3,
                  border: '1px solid #ffdddd',
                  gridColumn: '1 / -1' // span across all columns
                }}
              >
                {error.jobs}
              </Paper>
            ) : jobsData && jobsData.length > 0 ? (
              // نمایش آگهی‌ها
              jobsData.slice(0, 4).map((job: any, index: number) => (
                <Paper 
                  key={job.id || index}
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f1f1',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                      borderColor: '#e6e6e6'
                    }
                  }}
                >
                  <Box sx={{ p: 3, borderBottom: '1px solid #f5f5f5', flexGrow: 1 }}>
                    <Typography fontWeight="bold" noWrap sx={{ textAlign: 'left', fontSize: '1rem', mb: 1 }}>
                      {job.advertisement?.title || 'عنوان شغل'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'left' }}>
                      {job.company?.name || 'نام شرکت'}
                    </Typography>
                  
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {job.advertisement?.location?.name || 'موقعیت مکانی'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {job.advertisement?.degree || 'تحصیلات مورد نیاز'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {job.advertisement?.created_at ? new Date(job.advertisement.created_at).toLocaleDateString('fa-IR') : 'تاریخ انتشار'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f9f9f9', borderTop: '1px solid #f5f5f5' }}>
                    <Link href={`/employer/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                      <Button 
                        fullWidth 
                        variant="text" 
                        size="small" 
                        sx={{ 
                          color: EMPLOYER_THEME.primary,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'rgba(33, 150, 243, 0.05)'
                          }
                        }}
                      >
                        مشاهده آگهی
                      </Button>
                    </Link>
                  </Box>
                </Paper>
              ))
            ) : (
              // نمایش حالت خالی
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5, 
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                  border: '1px solid #f1f1f1',
                  gridColumn: '1 / -1' // span across all columns
                }}
              >
                <WorkIcon sx={{ fontSize: 54, color: '#e0e0e0', mb: 3 }} />
                <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                  هنوز آگهی شغلی ثبت نکرده‌اید
                </Typography>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: '#4285F4',
                    '&:hover': { bgcolor: '#3367D6' },
                    px: 4,
                    py: 1.5,
                    borderRadius: 6,
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    boxShadow: '0 3px 8px rgba(66, 133, 244, 0.3)'
                  }}
                  component={Link}
                  href="/employer/jobs/create"
                >
                  ثبت آگهی جدید
                </Button>
              </Paper>
            )}
          </Box>
        </Box>

        {/* بخش درخواست‌های کاریابی */}
        <Box sx={{ mb: 8 }}>
          {/* سربرگ بخش درخواست‌های کاریابی */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4, 
            justifyContent: 'space-between',
            px: 1,
            py: 1.5,
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Link href="/employer/applications" style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: EMPLOYER_THEME.primary,
                '&:hover': {
                  color: EMPLOYER_THEME.dark
                }
              }}>
                <KeyboardArrowLeftIcon sx={{ fontSize: 18, mt: 0.2, ml: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>همه درخواست‌ها</Typography>
              </Box>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleAltIcon sx={{ color: EMPLOYER_THEME.primary, ml: 1.5, fontSize: 24 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                درخواست‌های کاریابی
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 3, sm: 4 } }}>
            {loading.applications ? (
              // نمایش وضعیت بارگذاری
              Array.from(new Array(4)).map((_, index) => (
                <Paper 
                  key={index}
                  elevation={0} 
                  sx={{ 
                    p: 0, 
                    borderRadius: 3,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f1f1',
                    overflow: 'hidden',
                    height: '100%'
                  }}
                >
                  <Box sx={{ p: 3, bgcolor: '#f9f9f9', height: '120px' }}></Box>
                </Paper>
              ))
            ) : error.applications ? (
              // نمایش خطا
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'left',
                  color: 'red',
                  borderRadius: 3,
                  border: '1px solid #ffdddd',
                  gridColumn: '1 / -1' // span across all columns
                }}
              >
                {error.applications}
              </Paper>
            ) : applicationsData && applicationsData.length > 0 ? (
              // نمایش درخواست‌ها
              applicationsData.slice(0, 4).map((application: any, index: number) => (
                <Paper 
                  key={application.id || index}
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f1f1',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                      borderColor: '#e6e6e6'
                    }
                  }}
                >
                  <Box sx={{ p: 3, borderBottom: '1px solid #f5f5f5', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {application.job_seeker?.user?.profile_picture ? (
                        <Avatar 
                          src={application.job_seeker.user.profile_picture} 
                          alt={application.job_seeker?.user?.username || 'کاربر'} 
                          sx={{ width: 48, height: 48, ml: 2 }} 
                        />
                      ) : (
                        <Avatar sx={{ width: 48, height: 48, ml: 2, bgcolor: EMPLOYER_THEME.light }}>
                          <PersonIcon sx={{ color: EMPLOYER_THEME.primary }} />
                        </Avatar>
                      )}
                      <Box>
                        <Typography fontWeight="bold" sx={{ textAlign: 'left', fontSize: '1rem' }}>
                          {application.job_seeker?.user?.full_name || application.job_seeker?.user?.username || 'نام متقاضی'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                          {application.advertisement?.advertisement?.title || 'عنوان شغلی'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f9f9f9', borderTop: '1px solid #f5f5f5' }}>
                    <Link href={`/employer/applications/${application.id}`} style={{ textDecoration: 'none' }}>
                      <Button 
                        fullWidth 
                        variant="text" 
                        size="small" 
                        sx={{ 
                          color: EMPLOYER_THEME.primary,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'rgba(33, 150, 243, 0.05)'
                          }
                        }}
                      >
                        بررسی درخواست
                      </Button>
                    </Link>
                  </Box>
                </Paper>
              ))
            ) : (
              // نمایش حالت خالی
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5, 
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                  border: '1px solid #f1f1f1',
                  gridColumn: '1 / -1' // span across all columns
                }}
              >
                <PeopleAltIcon sx={{ fontSize: 54, color: '#e0e0e0', mb: 3 }} />
                <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                  هنوز درخواست کاریابی دریافت نکرده‌اید
                </Typography>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: '#4285F4',
                    '&:hover': { bgcolor: '#3367D6' },
                    px: 4,
                    py: 1.5,
                    borderRadius: 6,
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    boxShadow: '0 3px 8px rgba(66, 133, 244, 0.3)'
                  }}
                  component={Link}
                  href="/employer/jobs/create"
                >
                  ثبت آگهی جدید
                </Button>
              </Paper>
            )}
          </Box>
        </Box>

        {/* بخش شرکت‌های من */}
        <Box sx={{ mb: 4 }}>
          {/* سربرگ بخش شرکت‌های من */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4, 
            justifyContent: 'space-between',
            px: 1,
            py: 1.5,
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Link href="/employer/companies" style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: EMPLOYER_THEME.primary,
                '&:hover': {
                  color: EMPLOYER_THEME.dark
                }
              }}>
                <KeyboardArrowLeftIcon sx={{ fontSize: 18, mt: 0.2, ml: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>همه شرکت‌ها</Typography>
              </Box>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ color: EMPLOYER_THEME.primary, ml: 1.5, fontSize: 24 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                شرکت‌های من
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 3, sm: 4 } }}>
            {loading.companies ? (
              // نمایش وضعیت بارگذاری
              Array.from(new Array(4)).map((_, index) => (
                <Paper 
                  key={index}
                  elevation={0} 
                  sx={{ 
                    p: 0, 
                    borderRadius: 3,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f1f1',
                    overflow: 'hidden',
                    height: '100%'
                  }}
                >
                  <Box sx={{ p: 3, bgcolor: '#f9f9f9', height: '120px' }}></Box>
                </Paper>
              ))
            ) : error.companies ? (
              // نمایش خطا
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'left',
                  color: 'red',
                  borderRadius: 3,
                  border: '1px solid #ffdddd',
                  gridColumn: '1 / -1' // span across all columns
                }}
              >
                {error.companies}
              </Paper>
            ) : companiesData && companiesData.length > 0 ? (
              // نمایش شرکت‌ها
              companiesData.slice(0, 4).map((company: any, index: number) => (
                <Paper 
                  key={company.id || index}
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f1f1',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                      borderColor: '#e6e6e6'
                    }
                  }}
                >
                  <Box sx={{ p: 3, borderBottom: '1px solid #f5f5f5', flexGrow: 1 }}>
                    <Typography fontWeight="bold" sx={{ textAlign: 'left', fontSize: '1rem', mb: 1 }}>
                      {company.name || 'نام شرکت'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                      {company.industry?.name || 'صنعت'}
                    </Typography>
                    
                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      {company.approved ? (
                        <Chip 
                          label="تایید شده" 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(76, 175, 80, 0.1)', 
                            color: '#4caf50',
                            fontWeight: 500,
                            borderRadius: 1.5
                          }} 
                        />
                      ) : (
                        <Chip 
                          label="در انتظار تایید" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(255, 152, 0, 0.1)', 
                            color: '#ff9800',
                            fontWeight: 500,
                            borderRadius: 1.5
                          }} 
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f9f9f9', borderTop: '1px solid #f5f5f5' }}>
                    <Link href={`/employer/companies/${company.id}`} style={{ textDecoration: 'none' }}>
                      <Button 
                        fullWidth 
                        variant="text" 
                        size="small" 
                        sx={{ 
                          color: EMPLOYER_THEME.primary,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'rgba(33, 150, 243, 0.05)'
                          }
                        }}
                      >
                        مشاهده شرکت
                      </Button>
                    </Link>
                  </Box>
                </Paper>
              ))
            ) : (
              // نمایش حالت خالی
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5, 
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                  border: '1px solid #f1f1f1',
                  gridColumn: '1 / -1' // span across all columns
                }}
              >
                <BusinessIcon sx={{ fontSize: 54, color: '#e0e0e0', mb: 3 }} />
                <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                  هنوز شرکتی ثبت نکرده‌اید
                </Typography>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: '#4285F4',
                    '&:hover': { bgcolor: '#3367D6' },
                    px: 4,
                    py: 1.5,
                    borderRadius: 6,
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    boxShadow: '0 3px 8px rgba(66, 133, 244, 0.3)'
                  }}
                  component={Link}
                  href="/employer/companies/create"
                >
                  ثبت شرکت جدید
                </Button>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 