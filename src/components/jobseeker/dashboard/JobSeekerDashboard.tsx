'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/axios';
import { useAuth } from '@/store/authStore';
import { JOB_SEEKER_THEME } from '@/constants/colors';
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
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DomainIcon from '@mui/icons-material/Domain';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faClipboardList,
  faBriefcase,
  faPlus,
  faUser,
  faBullhorn
} from '@fortawesome/free-solid-svg-icons';
import { JobSeekerResumeAdCard } from '@/components/jobseeker/resume-ads';
import { ResumeAdType } from '@/components/jobseeker/resume-ads/JobSeekerResumeAdCard';

// تعریف interface برای رزومه
interface Resume {
  id: string;
  headline?: string;
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
  created_at: string;
}



// تعریف interface برای state ارور
interface ErrorState {
  profile: string | null;
  resumes: string | null;
  applications: string | null;
  resumeAds: string | null;
}

/**
 * کامپوننت داشبورد کارجو مطابق با طراحی صفحه اصلی
 */
export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [resumesData, setResumesData] = useState<any>(null);
  const [applicationsData, setApplicationsData] = useState<any>(null);
  const [resumeAdsData, setResumeAdsData] = useState<any>(null);
  const [loading, setLoading] = useState({
    profile: true,
    resumes: true,
    applications: true,
    resumeAds: true
  });
  const [error, setError] = useState<ErrorState>({
    profile: null,
    resumes: null,
    applications: null,
    resumeAds: null
  });

  // تابع بارگذاری داده‌ها
  const fetchDashboardData = async () => {
    try {
      const [profileResponse, resumesResponse, applicationsResponse, resumeAdsResponse] = await Promise.all([
        apiGet('/profiles/job-seekers/'),
        apiGet('/resumes/resumes/'),
        apiGet('/ads/applications/'),
        apiGet('/ads/resume/my-resumes/')
      ]);

      setProfileData(profileResponse.data);
      setResumesData(resumesResponse.data);
      setApplicationsData(applicationsResponse.data);
      // API my-resumes یک آبجکت با ساختار {count, results} برمی‌گرداند
      setResumeAdsData((resumeAdsResponse.data as any)?.results || resumeAdsResponse.data || []);
    } catch (err) {
      console.error('خطا در دریافت اطلاعات داشبورد:', err);
      setError({
        profile: 'خطا در بارگذاری اطلاعات پروفایل',
        resumes: 'خطا در بارگذاری رزومه',
        applications: 'خطا در بارگذاری درخواست‌ها',
        resumeAds: 'خطا در بارگذاری آگهی‌های رزومه'
      });
    } finally {
      setLoading({
        profile: false,
        resumes: false,
        applications: false,
        resumeAds: false
      });
    }
  };

  // بارگذاری داده‌ها به صورت موازی
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // محاسبه آمار
  const hasResume = resumesData && resumesData.length > 0;
  const totalApplications = applicationsData?.length || 0;
  const activeResumeAds = Array.isArray(resumeAdsData) ? resumeAdsData.filter((ad: any) => ad.status === 'A')?.length || 0 : 0;

  // Helper: convert English digits to Persian digits
  const toPersianDigits = (value: number | string): string =>
    value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

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
            border: `2px solid ${JOB_SEEKER_THEME.primary}`,
            color: 'text.primary',
            mb: 4,
            textAlign: { xs: 'center', sm: 'left' },
            direction: 'ltr', // تغییر به LTR
            boxShadow: '0 6px 24px rgba(10,155,84,0.1)',
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
              background: `linear-gradient(to left, ${JOB_SEEKER_THEME.primary} 0%, ${JOB_SEEKER_THEME.light} 50%, ${JOB_SEEKER_THEME.primary} 100%)`,
              opacity: 0.9,
              borderBottomLeftRadius: 'inherit',
              borderBottomRightRadius: 'inherit',
              zIndex: 0
            }
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold', color: JOB_SEEKER_THEME.primary, position: 'relative', zIndex: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.4rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
            خوش‌آمدید <Box component="span" sx={{ color: JOB_SEEKER_THEME.contrast }}>
              {profileData?.user?.full_name || user?.full_name || user?.username || 'کارجو'}
            </Box>
          </Typography>
          <Typography sx={{ position: 'relative', zIndex: 1, color: JOB_SEEKER_THEME.primary, fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' }, whiteSpace: { xs: 'normal', sm: 'nowrap' }, overflow: 'visible', textOverflow: 'clip', letterSpacing: '0.015em', textShadow: '0 1px 3px rgba(10,155,84,0.25)', alignSelf: { xs: 'center', sm: 'flex-end' }, textAlign: { xs: 'center', sm: 'left' } }}>
            با ماهرکار، فقط با چند کلیک <Box component="span" sx={{ color: JOB_SEEKER_THEME.contrast, fontWeight: 'bold' }}>بهترین</Box> شغل رو پیدا کن
          </Typography>
        </Box>
        
        {/* کارت‌های آماری */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            }, 
            gap: { xs: 2, sm: 3, md: 4 } 
          }}>
            {/* کارت درخواست‌های ارسالی */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(10,155,84,0.05)',
                height: '100%',
                minHeight: { xs: 100, sm: 120 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${JOB_SEEKER_THEME.primary}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(10,155,84,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, color: JOB_SEEKER_THEME.primary, mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faClipboardList} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 0.25, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                {loading.applications ? '...' : toPersianDigits(totalApplications)}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                درخواست‌های ارسالی
              </Typography>
            </Paper>
            
            {/* کارت آگهی‌های رزومه فعال */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(10,155,84,0.05)',
                height: '100%',
                minHeight: { xs: 100, sm: 120 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${JOB_SEEKER_THEME.primary}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(10,155,84,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, color: JOB_SEEKER_THEME.primary, mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faBullhorn} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 0.25, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                {loading.resumeAds ? '...' : toPersianDigits(activeResumeAds)}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                آگهی‌های رزومه فعال
              </Typography>
            </Paper>
            
            {/* کارت ایجاد رزومه جدید یا آگهی رزومه */}
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 18px rgba(10,155,84,0.25)',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(10,155,84,0.35)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Link
                href={hasResume ? "/jobseeker/resume-ads/create" : "/jobseeker/resume/create"}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '24px',
                  background: `linear-gradient(135deg, ${JOB_SEEKER_THEME.primary} 0%, ${JOB_SEEKER_THEME.light} 100%)`,
                  textDecoration: 'none'
                }}
              >
                <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }, color: '#ffffff', textAlign: 'center', lineHeight: 1.8 }}>
                  {hasResume ? 'ایجاد آگهی رزومه' : 'ایجاد رزومه'}
                </Typography>
              </Link>
            </Paper>
          </Box>
        </Box>

        {/* بخش آگهی‌های رزومه */}
        <Box sx={{ mb: 8 }}>
          {/* سربرگ بخش آگهی‌های رزومه */}
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
            <Link href="/jobseeker/resume-ads" style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: JOB_SEEKER_THEME.primary,
                '&:hover': {
                  color: JOB_SEEKER_THEME.dark
                }
              }}>
                <KeyboardArrowLeftIcon sx={{ fontSize: { xs: 16, sm: 18 }, mt: 0.2, ml: { xs: 0.3, sm: 0.5 } }} />
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }
                }}>
                  همه آگهی‌های رزومه
                </Typography>
              </Box>
            </Link>
            <Typography variant="h6" fontWeight="bold" sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
              color: JOB_SEEKER_THEME.primary
            }}>
              آگهی‌های رزومه
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3, md: 4 }, direction: 'ltr' }}>
            {loading.resumeAds ? (
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
            ) : error.resumeAds ? (
              // نمایش خطا
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'left',
                  color: 'red',
                  borderRadius: 3,
                  border: '1px solid #ffdddd',
                  gridColumn: '1 / -1'
                }}
              >
                {error.resumeAds}
              </Paper>
            ) : resumeAdsData && resumeAdsData.length > 0 ? (
              // نمایش آگهی‌های رزومه فعال و تایید شده
              resumeAdsData
                .filter((resumeAd: ResumeAdType) => resumeAd.status === 'A') // فقط آگهی‌های تایید شده
                .slice(0, 6)
                .map((resumeAd: ResumeAdType, index: number) => (
                  <Box key={resumeAd.id || index} sx={{ height: '100%' }}>
                    <JobSeekerResumeAdCard 
                      resumeAd={resumeAd} 
                      onUpdate={() => {
                        // بروزرسانی لیست آگهی‌ها
                        fetchDashboardData();
                      }}
                      hideTimeDisplay={true} // مخفی کردن نمایش زمان در داشبورد
                    />
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
                  gridColumn: '1 / -1'
                }}
              >
                <Box sx={{ fontSize: '3rem', color: '#e0e0e0', mb: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faBullhorn} />
                </Box>
                <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                  هنوز آگهی رزومه‌ای ایجاد نکرده‌اید
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 6,
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    boxShadow: '0 3px 8px rgba(10, 155, 84, 0.3)'
                  }}
                  component={Link}
                  href="/jobseeker/job-ads"
                >
                  مشاهده آگهی‌های شغلی
                </Button>
              </Paper>
            )}
          </Box>
        </Box>

        {/* بخش درخواست‌های اخیر */}
        <Box sx={{ mb: { xs: 6, sm: 8 } }}>
          {/* سربرگ بخش درخواست‌های اخیر */}
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
            <Link href="/jobseeker/applications" style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: JOB_SEEKER_THEME.primary,
                '&:hover': {
                  color: JOB_SEEKER_THEME.dark
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
                      bgcolor: JOB_SEEKER_THEME.bgLight,
                      color: JOB_SEEKER_THEME.primary,
                      px: { xs: 0.5, sm: 0.8 },
                      py: { xs: 0.1, sm: 0.2 },
                      borderRadius: 1,
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      fontWeight: 'bold'
                    }}>
                      +{applicationsData.length - 6}
                    </Box>
                  )}
                </Typography>
              </Box>
            </Link>
            <Typography variant="h6" fontWeight="bold" sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
              color: JOB_SEEKER_THEME.primary
            }}>
              درخواست‌های اخیر
            </Typography>
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
                  gridColumn: '1 / -1'
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
                    <Typography fontWeight="bold" sx={{ textAlign: 'left', fontSize: '1rem', mb: 1 }}>
                      {application.advertisement?.title || 'عنوان شغلی'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left', mb: 1 }}>
                      {application.advertisement?.company?.name || 'شرکت'}
                    </Typography>
                    <Chip 
                      label={application.status === 'PE' ? 'در انتظار' : 
                             application.status === 'IR' ? 'در حال بررسی' :
                             application.status === 'AC' ? 'پذیرفته شده' : 'رد شده'}
                      size="small"
                      sx={{ 
                        bgcolor: application.status === 'AC' ? JOB_SEEKER_THEME.primary : 
                                application.status === 'RE' ? 'error.main' : 'warning.main',
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f9f9f9', borderTop: '1px solid #f5f5f5' }}>
                    <Link href={`/jobseeker/applications/${application.id}`} style={{ textDecoration: 'none' }}>
                      <Button 
                        fullWidth 
                        variant="text" 
                        size="small" 
                        sx={{ 
                          color: JOB_SEEKER_THEME.primary,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'rgba(10, 155, 84, 0.05)'
                          }
                        }}
                      >
                        مشاهده جزئیات
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
                  gridColumn: '1 / -1'
                }}
              >
                <Box sx={{ fontSize: '3rem', color: '#e0e0e0', mb: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faClipboardList} />
                </Box>
                <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                  هنوز درخواستی ارسال نکرده‌اید
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 6,
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    boxShadow: '0 3px 8px rgba(10, 155, 84, 0.3)'
                  }}
                  component={Link}
                  href="/jobseeker/job-ads"
                >
                  مشاهده آگهی‌های شغلی
                </Button>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 