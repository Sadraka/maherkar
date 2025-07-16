import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Paper, Chip, Divider, Grid } from '@mui/material';
import Link from 'next/link';
import { apiGet } from '@/lib/axios';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { EMPLOYER_THEME } from '@/constants/colors';

interface JobDetailsProps {
  job: {
    id: string;
    title: string;
    description?: string;
    company: string; // Company ID
    location: number; // Location ID  
    industry: number; // Industry ID
    status: string;
    job_type?: string;
    salary?: string;
    gender?: string;
    degree?: string;
    soldier_status?: string;
    views_count?: number;
    applications_count?: number;
    created_at: string;
    updated_at?: string;
    expires_at?: string;
  };
}

// تایپ‌های کمکی
interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone_number?: string;
  location?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  industry?: {
    id: number;
    name: string;
  };
}

interface Location {
  id: number;
  name: string;
  province?: {
    id: number;
    name: string;
  };
}

interface Industry {
  id: number;
  name: string;
}

/**
 * کامپوننت نمایش جزئیات آگهی شغلی
 */
const JobDetails = ({ job }: JobDetailsProps) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);

  // فراخوانی داده‌های مربوطه
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const [companyRes, locationRes, industryRes] = await Promise.all([
          job.company ? apiGet(`/companies/${job.company}/`) : Promise.resolve(null),
          job.location ? apiGet(`/locations/cities/${job.location}/`) : Promise.resolve(null),
          job.industry ? apiGet(`/industries/industries/${job.industry}/`) : Promise.resolve(null)
        ]);

        if (companyRes?.data) setCompany(companyRes.data as Company);
        if (locationRes?.data) setLocation(locationRes.data as Location);
        if (industryRes?.data) setIndustry(industryRes.data as Industry);
      } catch (error) {
        console.error('خطا در دریافت اطلاعات آگهی:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [job.company, job.location, job.industry]);

  // تابع تبدیل وضعیت به فارسی
  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'P': { text: 'در انتظار تایید', color: '#ff9800' },
      'A': { text: 'تایید شده', color: '#4caf50' },
      'R': { text: 'رد شده', color: '#f44336' }
    };
    return statusMap[status] || { text: 'نامشخص', color: '#757575' };
  };

  // تابع تبدیل نوع قرارداد
  const getJobTypeText = (jobType?: string) => {
    const typeMap: Record<string, string> = {
      'FT': 'تمام وقت',
      'PT': 'پاره وقت', 
      'RE': 'دورکاری',
      'IN': 'کارآموزی'
    };
    return jobType ? typeMap[jobType] || jobType : '';
  };

  // تابع تبدیل جنسیت
  const getGenderText = (gender?: string) => {
    const genderMap: Record<string, string> = {
      'M': 'آقا',
      'F': 'خانم'
    };
    return gender ? genderMap[gender] || 'فرقی ندارد' : 'فرقی ندارد';
  };

  // تابع تبدیل مدرک
  const getDegreeText = (degree?: string) => {
    const degreeMap: Record<string, string> = {
      'DI': 'دیپلم',
      'AD': 'فوق دیپلم',
      'BA': 'لیسانس',
      'MA': 'فوق لیسانس',
      'PH': 'دکتری'
    };
    return degree ? degreeMap[degree] || 'فرقی ندارد' : 'فرقی ندارد';
  };

  // تابع تبدیل وضعیت سربازی
  const getSoldierStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      'EE': 'معافیت',
      'CO': 'پایان خدمت',
      'SE': 'در حال خدمت'
    };
    return status ? statusMap[status] || 'فرقی ندارد' : 'فرقی ندارد';
  };

  // تابع تبدیل حقوق به فارسی
  const getSalaryText = (salary?: string) => {
    if (!salary) return '';
    const convertToFarsiNumber = (num: string): string => {
      const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
    };

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

  // تابع فرمت تاریخ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR');
    } catch {
      return 'تاریخ نامعلوم';
    }
  };

  const statusInfo = getStatusText(job.status);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography>در حال بارگذاری...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* هدر صفحه */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={Link}
            href="/employer/jobs"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: EMPLOYER_THEME.primary,
              color: EMPLOYER_THEME.primary,
              '&:hover': { 
                borderColor: EMPLOYER_THEME.dark,
                backgroundColor: `${EMPLOYER_THEME.primary}08`
              }
            }}
          >
            بازگشت
          </Button>
          
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: EMPLOYER_THEME.primary, mb: 0.5 }}>
              جزئیات آگهی شغلی
            </Typography>
            <Typography color="text.secondary">
              مشاهده و مدیریت اطلاعات آگهی
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          href={`/employer/jobs/edit/${job.id}`}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{
            bgcolor: EMPLOYER_THEME.primary,
            '&:hover': { bgcolor: EMPLOYER_THEME.dark },
            px: 3,
            py: 1.2
          }}
        >
          ویرایش آگهی
        </Button>
      </Box>

             <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
         {/* اطلاعات اصلی آگهی */}
         <Box sx={{ flex: 1 }}>
           <Paper elevation={0} sx={{ p: 4, border: '1px solid #f0f0f0', borderRadius: 3 }}>
             {/* عنوان و وضعیت */}
             <Box sx={{ mb: 4 }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                 <Typography variant="h5" fontWeight="bold" sx={{ color: EMPLOYER_THEME.dark, flex: 1 }}>
                   {job.title}
                 </Typography>
                 
                 <Chip
                   label={statusInfo.text}
                   sx={{
                     backgroundColor: statusInfo.color,
                     color: 'white',
                     fontWeight: 500
                   }}
                 />
               </Box>
               
               {job.description && (
                 <Typography color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '1rem' }}>
                   {job.description}
                 </Typography>
               )}
             </Box>

             <Divider sx={{ my: 4 }} />

             {/* جزئیات آگهی */}
             <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
               {/* نوع قرارداد */}
               {job.job_type && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <WorkIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
                   <Box>
                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                       نوع قرارداد
                     </Typography>
                     <Typography fontWeight="500">
                       {getJobTypeText(job.job_type)}
                     </Typography>
                   </Box>
                 </Box>
               )}

               {/* حقوق */}
               {job.salary && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <AttachMoneyIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
                   <Box>
                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                       حقوق
                     </Typography>
                     <Typography fontWeight="500" sx={{ color: EMPLOYER_THEME.primary }}>
                       {getSalaryText(job.salary)}
                     </Typography>
                   </Box>
                 </Box>
               )}

               {/* جنسیت */}
               {job.gender && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <PersonIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
                   <Box>
                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                       جنسیت
                     </Typography>
                     <Typography fontWeight="500">
                       {getGenderText(job.gender)}
                     </Typography>
                   </Box>
                 </Box>
               )}

               {/* مدرک تحصیلی */}
               {job.degree && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <SchoolIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
                   <Box>
                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                       حداقل مدرک
                     </Typography>
                     <Typography fontWeight="500">
                       {getDegreeText(job.degree)}
                     </Typography>
                   </Box>
                 </Box>
               )}

               {/* وضعیت سربازی */}
               {job.soldier_status && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <MilitaryTechIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
                   <Box>
                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                       وضعیت سربازی
                     </Typography>
                     <Typography fontWeight="500">
                       {getSoldierStatusText(job.soldier_status)}
                     </Typography>
                   </Box>
                 </Box>
               )}

               {/* تاریخ انتشار */}
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <CalendarTodayIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
                 <Box>
                   <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                     تاریخ انتشار
                   </Typography>
                   <Typography fontWeight="500">
                     {formatDate(job.created_at)}
                   </Typography>
                 </Box>
               </Box>

               {/* آخرین بروزرسانی */}
               {job.updated_at && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <AccessTimeIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
                   <Box>
                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                       آخرین بروزرسانی
                     </Typography>
                     <Typography fontWeight="500">
                       {formatDate(job.updated_at)}
                     </Typography>
                   </Box>
                 </Box>
               )}
             </Box>
           </Paper>
         </Box>

         {/* اطلاعات جانبی */}
         <Box sx={{ width: { xs: '100%', md: '350px' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* اطلاعات شرکت */}
            {company && (
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: EMPLOYER_THEME.primary }}>
                  اطلاعات شرکت
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <BusinessIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography fontWeight="500">{company.name}</Typography>
                </Box>

                {company.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {company.description}
                  </Typography>
                )}

                {company.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {company.location.province?.name ? 
                        `${company.location.province.name}، ${company.location.name}` : 
                        company.location.name
                      }
                    </Typography>
                  </Box>
                )}

                {company.industry && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {company.industry.name}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* موقعیت مکانی */}
            {location && (
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: EMPLOYER_THEME.primary }}>
                  موقعیت شغل
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography fontWeight="500">
                    {location.province?.name ? 
                      `${location.province.name}، ${location.name}` : 
                      location.name
                    }
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* صنعت */}
            {industry && (
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: EMPLOYER_THEME.primary }}>
                  صنعت
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography fontWeight="500">{industry.name}</Typography>
                </Box>
              </Paper>
            )}

            {/* آمار آگهی */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: EMPLOYER_THEME.primary }}>
                آمار آگهی
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">بازدید</Typography>
                  </Box>
                  <Typography fontWeight="500">{job.views_count || 0}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">متقاضی</Typography>
                  </Box>
                  <Typography fontWeight="500">{job.applications_count || 0}</Typography>
                </Box>
              </Box>
            </Paper>
                     </Box>
         </Box>
       </Box>
    </Box>
  );
};

export default JobDetails; 