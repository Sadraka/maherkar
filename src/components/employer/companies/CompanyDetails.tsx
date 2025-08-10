'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Divider, 
  Avatar, 
  Skeleton,
  Link as MuiLink,
  IconButton,
  styled,
  Grid,
  Container
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { EMPLOYER_THEME } from '@/constants/colors';
import { dir } from 'console';

// استایل‌های سفارشی
const StyledPaper = styled(Paper)({
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
  border: '1px solid #f0f0f0',
  marginBottom: 16
});

const SectionTitle = styled(Typography)({
  fontSize: '1.1rem',
  fontWeight: 700,
  marginBottom: 16,
  position: 'relative',
  display: 'inline-block'
});

const InfoItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 12
});

const InfoIcon = styled(Box)({
  marginLeft: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: EMPLOYER_THEME.primary
});

const InfoText = styled(Typography)({
  fontSize: '0.9rem'
});

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
  status?: 'P' | 'A' | 'R';
  photos?: Array<{
    id: number;
    image: string;
    created_at: string;
  }>;
}

interface CompanyDetailsProps {
  company: Company;
  loading?: boolean;
}

/**
 * کامپوننت نمایش جزئیات شرکت
 */
const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company, loading = false }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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

  // تابع برای بارگذاری و پخش ویدیو
  const handlePlayVideo = () => {
    setVideoLoaded(true);
    
    // کمی تاخیر برای اطمینان از بارگذاری ویدیو
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(error => {
          console.error('خطا در پخش ویدیو:', error);
        });
      }
    }, 100);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <StyledPaper>
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={80} height={80} sx={{ ml: 2 }} />
              <Box>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={150} height={24} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={100} />
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
        </StyledPaper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <StyledPaper>
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

        {/* وضعیت شرکت */}
        {company.status && company.status !== ('A' as any) && (
          <Box sx={{ p: 3, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
              <Box sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#fff',
                bgcolor: company.status === 'R' ? '#c62828' : '#f9a825',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}>
                {company.status === 'R' ? 'رد شده' : 'در انتظار تایید'}
              </Box>
            </Box>
          </Box>
        )}

        {/* محتوای اصلی */}
        <Box sx={{ p: 3 }}>
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
            <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, width: '100%' } }dir="rtl">
              <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 1 }} textAlign="start">
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
              <SectionTitle variant="h6">
                درباره شرکت
              </SectionTitle>
              <Typography variant="body1" sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
                {company.description}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* اطلاعات تماس و جزئیات */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            <Box>
              <SectionTitle variant="h6">
                اطلاعات تماس
              </SectionTitle>
              
              <Box>
                {company.website && (
                  <InfoItem>
                    <InfoIcon>
                      <LanguageIcon fontSize="small" />
                    </InfoIcon>
                    <MuiLink href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none', color: EMPLOYER_THEME.primary }}>
                      {company.website}
                    </MuiLink>
                  </InfoItem>
                )}
                
                {company.email && (
                  <InfoItem>
                    <InfoIcon>
                      <EmailIcon fontSize="small" />
                    </InfoIcon>
                    <MuiLink href={`mailto:${company.email}`} sx={{ textDecoration: 'none', color: EMPLOYER_THEME.primary }}>
                      {company.email}
                    </MuiLink>
                  </InfoItem>
                )}
                
                {company.phone_number && (
                  <InfoItem>
                    <InfoIcon>
                      <PhoneIcon fontSize="small" />
                    </InfoIcon>
                    <MuiLink href={`tel:${company.phone_number}`} sx={{ textDecoration: 'none', color: EMPLOYER_THEME.primary }}>
                      {company.phone_number}
                    </MuiLink>
                  </InfoItem>
                )}
                
                {company.address && (
                  <InfoItem>
                    <InfoIcon sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                      <LocationOnIcon fontSize="small" />
                    </InfoIcon>
                    <InfoText>
                      {company.address}
                      {company.postal_code && ` - کد پستی: ${company.postal_code}`}
                    </InfoText>
                  </InfoItem>
                )}
              </Box>

              {/* شبکه‌های اجتماعی */}
              {(company.linkedin || company.twitter || company.instagram) && (
                <Box sx={{ mt: 4 }}>
                  <SectionTitle variant="h6">
                    شبکه‌های اجتماعی
                  </SectionTitle>
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
              <SectionTitle variant="h6">
                اطلاعات شرکت
              </SectionTitle>
              
              <Box>
                {company.founded_date && (
                  <InfoItem>
                    <InfoIcon>
                      <CalendarTodayIcon fontSize="small" />
                    </InfoIcon>
                    <InfoText>
                      <Box component="span" fontWeight="medium">تاریخ تأسیس:</Box> {formatDate(company.founded_date)}
                    </InfoText>
                  </InfoItem>
                )}
                
                {company.number_of_employees && company.number_of_employees > 0 && (
                  <InfoItem>
                    <InfoIcon>
                      <PeopleAltIcon fontSize="small" />
                    </InfoIcon>
                    <InfoText>
                      <Box component="span" fontWeight="medium">تعداد کارکنان:</Box> {formatEmployeeCount(company.number_of_employees)}
                    </InfoText>
                  </InfoItem>
                )}
                
                <InfoItem>
                  <InfoIcon>
                    <CalendarTodayIcon fontSize="small" />
                  </InfoIcon>
                  <InfoText>
                    <Box component="span" fontWeight="medium">تاریخ ثبت در سامانه:</Box> {formatDate(company.created_at)}
                  </InfoText>
                </InfoItem>
              </Box>
            </Box>
          </Box>

          {/* گالری عکس‌های شرکت */}
          {company.photos && company.photos.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <SectionTitle variant="h6">
                گالری عکس‌ها
              </SectionTitle>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
                gap: 2
              }}>
                {company.photos.map((p) => (
                  <Box key={p.id} sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 2, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                    <Image
                      src={getImageUrl(p.image) || ''}
                      alt={`company-photo-${p.id}`}
                      fill
                      sizes="(max-width: 600px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          
          {/* ویدیوی معرفی شرکت */}
          {company.intro_video && (
            <Box sx={{ mt: 4 }}>
              <SectionTitle variant="h6">
                ویدیوی معرفی
              </SectionTitle>
              
              <Box 
                sx={{ 
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f5',
                  position: 'relative',
                  height: '350px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!videoLoaded ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      }
                    }}
                    onClick={handlePlayVideo}
                  >
                    <IconButton
                      sx={{
                        backgroundColor: EMPLOYER_THEME.primary,
                        width: 80,
                        height: 80,
                        '&:hover': {
                          backgroundColor: EMPLOYER_THEME.primary,
                          opacity: 0.9,
                        }
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 40, color: 'white' }} />
                    </IconButton>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 2,
                        color: 'text.primary',
                        fontWeight: 'medium',
                      }}
                    >
                      پخش ویدیو
                    </Typography>
                  </Box>
                ) : null}
                
                {videoLoaded && (
                  <video
                    ref={videoRef}
                    src={getImageUrl(company.intro_video) || ''}
                    controls
                    preload="metadata"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default CompanyDetails; 