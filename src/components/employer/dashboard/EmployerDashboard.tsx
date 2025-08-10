'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/axios';
import { useAuth } from '@/store/authStore';
import { EMPLOYER_THEME } from '@/constants/colors';
import { Box, Container, Typography, Button, Paper, Divider, Avatar, Chip, CircularProgress } from '@mui/material';

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
import CompanyCard from '@/components/employer/companies/CompanyCard';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DomainIcon from '@mui/icons-material/Domain';
import EmployerJobCard, { EmployerJobType } from './EmployerJobCard';
import EmployerJobCardSkeleton from './EmployerJobCardSkeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListAlt,
  faClipboardList,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';

// تعریف interface برای شرکت
interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  industry?: {
    id: number;
    name: string;
  };
  location?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  number_of_employees?: number;
  created_at: string;
}

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
export default function EmployerDashboard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [jobsData, setJobsData] = useState<any>(null);
  const [applicationsData, setApplicationsData] = useState<any>(null);
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
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
          apiGet('/ads/job/my-jobs/'),
          apiGet('/ads/applications/'),
          apiGet('/companies/')
        ]);

        setProfileData(profileResponse.data);
        setJobsData((jobsResponse.data as { count: number; results: any[] }).results);
        setApplicationsData(applicationsResponse.data);
        setCompaniesData(companiesResponse.data as Company[]);
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
  const activeJobs = jobsData?.filter((job: any) => job.status === 'A')?.length || 0;
  const totalApplications = applicationsData?.length || 0;
  const totalCompanies = companiesData?.length || 0;

  // Helper: convert English digits to Persian digits
  const toPersianDigits = (value: number | string): string =>
    value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

  // نمایش loading state کلی - فقط دایره لودینگ بدون متن
  if (loading.profile || loading.jobs || loading.applications || loading.companies) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh',
        bgcolor: '#fafafa'
      }}>
        <CircularProgress 
          size={60} 
          sx={{ 
            color: EMPLOYER_THEME.primary 
          }} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* هدر داشبورد - مشابه صفحه اصلی */}
        <Box 
          sx={{ 
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 3, md: 4 },
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 1,
            bgcolor: 'background.paper', // سفید
            border: `2px solid ${EMPLOYER_THEME.primary}`,
            color: 'text.primary',
            mb: 4,
            textAlign: { xs: 'center', sm: 'left' },
            direction: 'ltr', // تغییر به LTR
            boxShadow: '0 6px 24px rgba(66,133,244,0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/images/circuit-board-smaller.svg)',
              backgroundSize: { xs: '60%', sm: '50%', md: '40%' },
              backgroundRepeat: 'repeat',
              opacity: 0.05,
              zIndex: 0
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '6px',
              background: `linear-gradient(to left, ${EMPLOYER_THEME.primary} 0%, ${EMPLOYER_THEME.light} 50%, ${EMPLOYER_THEME.primary} 100%)`,
              opacity: 0.9,
              borderBottomLeftRadius: 'inherit',
              borderBottomRightRadius: 'inherit',
              zIndex: 0
            }
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold', color: EMPLOYER_THEME.primary, position: 'relative', zIndex: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.4rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
            خوش‌آمدید، <Box component="span" sx={{ color: EMPLOYER_THEME.contrast }}>
              {profileData?.user?.full_name || user?.full_name || user?.username || 'کارفرما'}
            </Box>
          </Typography>
          <Typography sx={{ position: 'relative', zIndex: 1, color: EMPLOYER_THEME.primary, fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' }, whiteSpace: { xs: 'normal', sm: 'nowrap' }, overflow: 'visible', textOverflow: 'clip', letterSpacing: '0.015em', textShadow: '0 1px 3px rgba(66,133,244,0.25)', alignSelf: { xs: 'center', sm: 'flex-end' }, textAlign: { xs: 'center', sm: 'left' } }}>
            با ماهرکار، فقط با چند کلیک <Box component="span" sx={{ color: EMPLOYER_THEME.contrast, fontWeight: 'bold' }}>بهترین</Box> نیروی کار رو استخدام کن
          </Typography>
        </Box>
        
        {/* کارت‌های آماری */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            }, 
            gap: { xs: 2, sm: 3, md: 4 } 
          }}>
            {            /* کارت آگهی‌های فعال */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(66,133,244,0.05)',
                height: '100%',
                minHeight: { xs: 100, sm: 120 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${EMPLOYER_THEME.primary}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(66,133,244,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, color: EMPLOYER_THEME.primary, mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faListAlt} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 0.25, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                {loading.jobs ? '...' : toPersianDigits(activeJobs)}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                آگهی‌های فعال
              </Typography>
            </Paper>
            
            {/* کارت درخواست‌های کاریابی */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(66,133,244,0.05)',
                height: '100%',
                minHeight: { xs: 100, sm: 120 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${EMPLOYER_THEME.primary}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(66,133,244,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, color: EMPLOYER_THEME.primary, mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faClipboardList} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 0.25, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                {loading.applications ? '...' : toPersianDigits(totalApplications)}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                درخواست‌های کاریابی
              </Typography>
            </Paper>
            
            {/* کارت شرکت‌های من */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(66,133,244,0.05)',
                height: '100%',
                minHeight: { xs: 100, sm: 120 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${EMPLOYER_THEME.primary}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(66,133,244,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, color: EMPLOYER_THEME.primary, mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faBuilding} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 0.25, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                {loading.companies ? '...' : toPersianDigits(totalCompanies)}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                شرکت‌های من
              </Typography>
            </Paper>
            
            {/* کارت ثبت آگهی جدید */}
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 18px rgba(66,133,244,0.25)',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(66,133,244,0.35)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Link
                href="/employer/jobs/create"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '24px',
                  background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary} 0%, ${EMPLOYER_THEME.light} 100%)`,
                  textDecoration: 'none'
                }}
              >
                <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }, color: '#ffffff', textAlign: 'center', lineHeight: 1.8 }}>
                  ثبت آگهی استخدامی
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
            mb: { xs: 3, sm: 4 }, 
            justifyContent: 'space-between',
            px: { xs: 0.5, sm: 1 },
            py: { xs: 1, sm: 1.5 },
            borderBottom: '1px solid #f0f0f0',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: { xs: 1, sm: 0 }
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
                <KeyboardArrowLeftIcon sx={{ fontSize: { xs: 16, sm: 18 }, mt: 0.2, ml: { xs: 0.3, sm: 0.5 } }} />
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }
                }}>
                  همه آگهی‌ها
                </Typography>
              </Box>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }
              }}>
                آگهی‌های تایید شده
              </Typography>
              <Box sx={{ 
                color: EMPLOYER_THEME.primary, 
                ml: { xs: '0.5rem', sm: '0.8rem' }, 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <FontAwesomeIcon icon={faListAlt} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3, md: 4 }, direction: 'ltr' }}>
            {loading.jobs ? (
              // نمایش وضعیت بارگذاری
              Array.from(new Array(6)).map((_, index) => (
                <Box key={index} sx={{ height: '100%' }}>
                  <EmployerJobCardSkeleton />
                </Box>
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
            ) : jobsData && jobsData.filter((job: EmployerJobType) => job.status === 'A').length > 0 ? (
              // نمایش آگهی‌ها با استفاده از کامپوننت جدید - فقط آگهی‌های فعال
              jobsData.filter((job: EmployerJobType) => job.status === 'A').slice(0, 6).map((job: EmployerJobType, index: number) => (
                <Box key={job.id || index} sx={{ height: '100%' }}>
                  <EmployerJobCard job={job} />
                </Box>
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
                <Box sx={{ fontSize: '3rem', color: '#e0e0e0', mb: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faListAlt} />
                </Box>
                <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                  {jobsData && jobsData.length > 0 
                    ? 'هیچ آگهی فعال ندارید' 
                    : 'هنوز آگهی شغلی ثبت نکرده‌اید'
                  }
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
        <Box sx={{ mb: { xs: 6, sm: 8 } }}>
          {/* سربرگ بخش درخواست‌های کاریابی */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: { xs: 3, sm: 4 }, 
            justifyContent: 'space-between',
            px: { xs: 0.5, sm: 1 },
            py: { xs: 1, sm: 1.5 },
            borderBottom: '1px solid #f0f0f0',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: { xs: 1, sm: 0 }
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
                <KeyboardArrowLeftIcon sx={{ fontSize: { xs: 16, sm: 18 }, mt: 0.2, ml: { xs: 0.3, sm: 0.5 } }} />
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }
                }}>
                  همه درخواست‌ها
                  {applicationsData && applicationsData.length > 6 && (
                    <Box component="span" sx={{ 
                      direction: 'ltr',
                      mr: { xs: 0.5, sm: 1 },
                      bgcolor: '#e3f2fd',
                      color: '#0d47a1',
                      px: { xs: 0.5, sm: 0.8 },
                      py: { xs: 0.1, sm: 0.2 },
                      borderRadius: 1,
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      fontWeight: 'bold'
                    }}>
                 +   {applicationsData.length - 6}
                    </Box>
                  )}
                </Typography>
              </Box>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }
              }}>
                درخواست‌های کاریابی
              </Typography>
              <Box sx={{ 
                color: EMPLOYER_THEME.primary, 
                ml: { xs: '0.5rem', sm: '0.8rem' }, 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <FontAwesomeIcon icon={faClipboardList} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3, md: 4 } }}>
            {loading.applications ? (
              // نمایش وضعیت بارگذاری
              Array.from(new Array(6)).map((_, index) => (
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
              applicationsData.slice(0, 6).map((application: any, index: number) => (
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
                <Box sx={{ fontSize: '3rem', color: '#e0e0e0', mb: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faClipboardList} />
                </Box>
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
        <Box sx={{ mb: { xs: 3, sm: 4 } }} >
          {/* سربرگ بخش شرکت‌های من */}
                              <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            justifyContent: { xs: 'flex-start', sm: 'space-between' },
            px: { xs: 0.5, sm: 1 },
            py: { xs: 1, sm: 1.5 },
            borderBottom: '1px solid #f0f0f0',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }} >
                        {/* در موبایل: عنوان + لینک همه شرکت‌ها در یک خط */}
            <Box sx={{ 
              display: { xs: 'flex', sm: 'none' }, 
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              order: { xs: 1, sm: 0 }
            }}>
              {/* لینک همه شرکت‌ها */}
              <Link href="/employer/companies" style={{ textDecoration: 'none' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: EMPLOYER_THEME.primary,
                  '&:hover': {
                    color: EMPLOYER_THEME.dark
                  }
                }}>
                  <KeyboardArrowLeftIcon sx={{ fontSize: 16, mt: 0.2, ml: 0.3 }} />
                  <Typography variant="body2" sx={{ 
                    fontWeight: 500,
                    fontSize: '0.7rem'
                  }}>
                    همه شرکت‌ها
                    {companiesData && companiesData.length > 6 && (
                      <Box component="span" sx={{ 
                        direction: 'ltr',
                        mr: 0.5,
                        bgcolor: '#e3f2fd',
                        color: '#0d47a1',
                        px: 0.5,
                        py: 0.1,
                        borderRadius: 1,
                        fontSize: '0.6rem',
                        fontWeight: 'bold'
                      }}>
                        +{companiesData.length - 6}
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Link>

              {/* عنوان و آیکون */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ 
                  fontSize: '0.8rem',
                  lineHeight: 1.2
                }}>
                  شرکت‌های من
                </Typography>
                <Box sx={{
                  color: EMPLOYER_THEME.primary,
                  ml: '0.3rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <FontAwesomeIcon icon={faBuilding} />
                </Box>
              </Box>
            </Box>

            {/* در موبایل: دکمه ثبت شرکت جدید - وسط‌چین */}
            <Box sx={{ 
              display: { xs: 'flex', sm: 'none' }, 
              justifyContent: 'center',
              order: { xs: 2, sm: 0 }
            }}>
              <Link href="/employer/companies/create" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: EMPLOYER_THEME.primary,
                    '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                    borderRadius: 2,
                    px: 2,
                    py: 0.6,
                    fontWeight: 'medium',
                    fontSize: '0.7rem',
                    boxShadow: '0 2px 8px rgba(66, 133, 244, 0.2)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ثبت شرکت جدید
                </Button>
              </Link>
            </Box>

            {/* در دسکتاپ: layout اصلی */}
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center', 
              gap: 2
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
                  <Typography variant="body2" sx={{ 
                    fontWeight: 500,
                    fontSize: { sm: '0.8rem', md: '0.85rem' }
                  }}>
                    همه شرکت‌ها
                    {companiesData && companiesData.length > 6 && (
                      <Box component="span" sx={{ 
                        direction: 'ltr',
                        mr: 1,
                        bgcolor: '#e3f2fd',
                        color: '#0d47a1',
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        +{companiesData.length - 6}
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Link>
              <Link href="/employer/companies/create" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: EMPLOYER_THEME.primary,
                    '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                    borderRadius: 2,
                    px: 2,
                    py: 0.7,
                    fontWeight: 'medium',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 8px rgba(66, 133, 244, 0.2)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ثبت شرکت جدید
                </Button>
              </Link>
            </Box>
            
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center' 
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                fontSize: { sm: '1rem', md: '1.1rem' },
                lineHeight: { sm: 1.3, md: 1.4 }
              }}>
                شرکت‌های من
              </Typography>
              <Box sx={{ 
                color: EMPLOYER_THEME.primary, 
                ml: '0.8rem', 
                fontSize: { sm: '1.1rem', md: '1.2rem' }, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <FontAwesomeIcon icon={faBuilding} />
              </Box>
            </Box>
           </Box>

          <Box sx={{ 
            direction: 'ltr',
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)'
            }, 
            gap: { 
              xs: 2, 
              sm: 3, 
              md: 4 
            },
            '& > *': {
              height: 'auto',
              maxHeight: { xs: '260px', sm: '280px', md: '300px' }
            }
          }}>
            {loading.companies ? (
              // نمایش وضعیت بارگذاری
              Array.from(new Array(6)).map((_, index) => (
                <Paper 
                  key={index}
                  elevation={0} 
                  sx={{ 
                    p: 0, 
                    borderRadius: 3,
                    boxShadow: '0 3px 10px rgba(66, 133, 244, 0.05)',
                    border: '1px solid #e3f2fd',
                    overflow: 'hidden',
                    height: '100%',
                    backgroundColor: 'red'
                  }}
                >
                  <Box sx={{ p: 3, bgcolor: '#f8fafd', height: '100px' }}></Box>
                </Paper>
              ))
            ) : error.companies ? (
              // نمایش خطا
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'left',
                  color: '#d32f2f',
                  borderRadius: 3,
                  border: '1px solid #ffcdd2',
                  bgcolor: '#fff5f5',
                  gridColumn: '1 / -1'
                }}
              >
                {error.companies}
              </Paper>
            ) : companiesData && companiesData.length > 0 ? (
              // نمایش شرکت‌ها با استفاده از CompanyCard
              companiesData.slice(0, 6).map((company: Company, index: number) => (
                <Link key={company.id} href={`/employer/companies/${company.id}`} style={{ textDecoration: 'none' }}>
                  <CompanyCard company={company} index={index} />
                </Link>
              ))
            ) : (
              // نمایش حالت خالی
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5, 
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 3px 10px rgba(66, 133, 244, 0.05)',
                  border: '1px solid #e3f2fd',
                  bgcolor: '#f8fafd',
                  gridColumn: '1 / -1'
                }}
              >
                <Box sx={{ fontSize: '3rem', color: EMPLOYER_THEME.primary, mb: '1.5rem', opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faBuilding} />
                </Box>
                <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                  هنوز شرکتی ثبت نکرده‌اید
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ ml: 0.5, mr: -0.5 }} />}
                  sx={{ 
                    bgcolor: EMPLOYER_THEME.primary,
                    '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    boxShadow: '0 3px 8px rgba(66, 133, 244, 0.2)'
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