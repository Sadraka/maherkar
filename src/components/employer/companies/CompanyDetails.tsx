'use client';

import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Grid, 
  Divider, 
  Avatar, 
  Skeleton,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

// آیکون‌ها
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { EMPLOYER_THEME } from '@/constants/colors';

// تعریف interface برای شرکت بر اساس سریالایزر بک‌اند
interface Company {
  id: string;
  employer?: {
    id: string;
    username: string;
    full_name?: string;
    profile_picture?: string;
  };
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone_number?: string;
  logo?: string;
  banner?: string;
  intro_video?: string;
  address?: string;
  location?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  postal_code?: string;
  founded_date?: string;
  industry?: {
    id: number;
    name: string;
  };
  number_of_employees?: number;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  created_at: string;
  updated_at?: string;
}

interface CompanyDetailsProps {
  company: Company;
  loading?: boolean;
}

/**
 * کامپوننت نمایش جزئیات شرکت
 */
const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company, loading = false }) => {
  // تابع کمکی برای تبدیل آدرس نسبی به آدرس کامل
  const getImageUrl = (path?: string) => {
    if (!path) return null;
    // اگر آدرس با http یا https شروع شود، مستقیماً برگردانده می‌شود
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // در غیر این صورت، آدرس را به آدرس کامل API تبدیل می‌کنیم
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  // تابع برای فرمت کردن تاریخ به شمسی
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fa-IR').format(date);
    } catch (error) {
      return '';
    }
  };

  // تابع برای نمایش تعداد کارمندان
  const formatEmployeeCount = (count?: number) => {
    if (!count) return '';
    return `${count.toLocaleString('fa-IR')} نفر`;
  };

  if (loading) {
    return (
      <Box sx={{width: '100%' }}>
        <Paper 
          elevation={0}
          sx={{ 
            direction: 'rtl',
            p: 0, 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0',
            mb: 4
          }}
        >
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
              <Box>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={150} height={24} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={100} />
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', textAlign: 'right' }} dir="rtl">
      <Paper 
        elevation={0}
        sx={{ 
          p: 0, 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
          border: '1px solid #f0f0f0',
          mb: 4
        }}
      >
        {/* بنر شرکت */}
        <Box 
          sx={{ 
            height: 200, 
            width: '100%', 
            bgcolor: '#f5f5f5',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {company.banner ? (
            <Image 
              src={getImageUrl(company.banner) || '/images/default-banner.jpg'} 
              alt={`${company.name} banner`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="100vw"
            />
          ) : (
            <Box 
              sx={{ 
                height: '100%', 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: EMPLOYER_THEME.light,
                opacity: 0.7
              }}
            >
              <BusinessIcon sx={{ fontSize: 80, color: EMPLOYER_THEME.primary, opacity: 0.4 }} />
            </Box>
          )}
        </Box>

        {/* محتوای اصلی */}
        <Box sx={{ p: { xs: 2, sm: 4 } }} dir="rtl">
          {/* هدر با لوگو و نام شرکت */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, mb: 4 }}>
            <Avatar 
              src={company.logo ? (getImageUrl(company.logo) as string) : undefined}
              alt={company.name}
              sx={{ 
                width: { xs: 80, sm: 100 }, 
                height: { xs: 80, sm: 100 }, 
                border: '4px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                mt: { xs: -6, sm: -8 },
                ml: { xs: 0, sm: 2 },
                mb: { xs: 2, sm: 0 },
                bgcolor: EMPLOYER_THEME.light
              }}
            >
              {!company.logo && <BusinessIcon sx={{ fontSize: 40, color: EMPLOYER_THEME.primary }} />}
            </Avatar>
            <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
              <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
                {company.name}
              </Typography>
              {company.industry && (
                <Chip 
                  label={company.industry.name} 
                  size="small" 
                  sx={{ 
                    bgcolor: EMPLOYER_THEME.light, 
                    color: EMPLOYER_THEME.primary,
                    fontWeight: 'medium',
                    mb: 1
                  }} 
                />
              )}
              {company.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, mt: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary', ml: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {company.location.province?.name && `${company.location.province.name}، `}
                    {company.location.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* توضیحات شرکت */}
          {company.description && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                درباره شرکت
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
                {company.description}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* اطلاعات تماس و جزئیات */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                اطلاعات تماس
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {company.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LanguageIcon sx={{ fontSize: 20, color: EMPLOYER_THEME.primary, ml: 2 }} />
                    <MuiLink href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none', color: EMPLOYER_THEME.primary }}>
                      {company.website}
                    </MuiLink>
                  </Box>
                )}
                
                {company.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ fontSize: 20, color: EMPLOYER_THEME.primary, ml: 2 }} />
                    <MuiLink href={`mailto:${company.email}`} sx={{ textDecoration: 'none', color: EMPLOYER_THEME.primary }}>
                      {company.email}
                    </MuiLink>
                  </Box>
                )}
                
                {company.phone_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ fontSize: 20, color: EMPLOYER_THEME.primary, ml: 2 }} />
                    <MuiLink href={`tel:${company.phone_number}`} sx={{ textDecoration: 'none', color: EMPLOYER_THEME.primary }}>
                      {company.phone_number}
                    </MuiLink>
                  </Box>
                )}
                
                {company.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOnIcon sx={{ fontSize: 20, color: EMPLOYER_THEME.primary, ml: 2, mt: 0.3 }} />
                    <Typography variant="body2">
                      {company.address}
                      {company.postal_code && ` - کد پستی: ${company.postal_code}`}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* شبکه‌های اجتماعی */}
              {(company.linkedin || company.twitter || company.instagram) && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
                    شبکه‌های اجتماعی
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {company.linkedin && (
                      <MuiLink href={company.linkedin} target="_blank" rel="noopener noreferrer">
                        <Avatar sx={{ bgcolor: '#0077b5' }}>
                          <LinkedInIcon />
                        </Avatar>
                      </MuiLink>
                    )}
                    {company.twitter && (
                      <MuiLink href={company.twitter} target="_blank" rel="noopener noreferrer">
                        <Avatar sx={{ bgcolor: '#1DA1F2' }}>
                          <TwitterIcon />
                        </Avatar>
                      </MuiLink>
                    )}
                    {company.instagram && (
                      <MuiLink href={company.instagram} target="_blank" rel="noopener noreferrer">
                        <Avatar sx={{ bgcolor: '#E4405F' }}>
                          <InstagramIcon />
                        </Avatar>
                      </MuiLink>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                اطلاعات شرکت
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {company.founded_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ fontSize: 20, color: EMPLOYER_THEME.primary, ml: 2 }} />
                    <Typography variant="body2">
                      <Box component="span" fontWeight="medium">تاریخ تأسیس:</Box> {formatDate(company.founded_date)}
                    </Typography>
                  </Box>
                )}
                
                {company.number_of_employees && company.number_of_employees > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleAltIcon sx={{ fontSize: 20, color: EMPLOYER_THEME.primary, ml: 2 }} />
                    <Typography variant="body2">
                      <Box component="span" fontWeight="medium">تعداد کارکنان:</Box> {formatEmployeeCount(company.number_of_employees)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ fontSize: 20, color: EMPLOYER_THEME.primary, ml: 2 }} />
                  <Typography variant="body2">
                    <Box component="span" fontWeight="medium">تاریخ ثبت در سامانه:</Box> {formatDate(company.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CompanyDetails; 