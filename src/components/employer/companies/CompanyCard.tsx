import React from 'react';
import { Typography, Box, Button, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DomainIcon from '@mui/icons-material/Domain';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import StoreIcon from '@mui/icons-material/Store';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { EMPLOYER_THEME } from '@/constants/colors';

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  status?: 'P' | 'A' | 'R';
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

interface CompanyCardProps {
  company: Company;
  index: number;
}

/**
 * کامپوننت کارت شرکت برای نمایش اطلاعات شرکت
 */
const CompanyCard = ({ company, index }: CompanyCardProps) => {
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

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
        border: '1px solid #f1f1f1',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 15px rgba(66, 133, 244, 0.1)',
          borderColor: '#e6e6e6',
          transform: 'translateY(-2px)'
        },
        textAlign: 'right'
      }}
    >
      {/* بنر شرکت */}
      <Box
        sx={{
          height: 80, // ارتفاع ثابت برای بنر
          position: 'relative',
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: company.banner ? 'none' : 'linear-gradient(45deg, #f8fafd 30%, #e3f2fd 90%)',
          flexShrink: 0
        }}
      >
        {company.banner ? (
          <>
            <Image
              src={getImageUrl(company.banner) || ''}
              alt={`${company.name} banner`}
              fill
              style={{ objectFit: 'cover' }}
            />
            {/* برچسب وضعیت */}
            {company.status && company.status !== 'A' && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                <Box sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#fff',
                  bgcolor: company.status === 'R' ? '#c62828' : '#f9a825',
                }}>
                  {company.status === 'R' ? 'رد شده' : 'در انتظار تایید'}
                </Box>
              </Box>
            )}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(66, 133, 244, 0.1), rgba(66, 133, 244, 0.2))',
                zIndex: 1
              }}
            />
          </>
        ) : (
          <>
            <CorporateFareIcon sx={{ fontSize: 42, color: EMPLOYER_THEME.primary }} />
            {company.status && company.status !== 'A' && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                <Box sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#fff',
                  bgcolor: company.status === 'R' ? '#c62828' : '#f9a825',
                }}>
                  {company.status === 'R' ? 'رد شده' : 'در انتظار تایید'}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
      
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        borderBottom: '1px solid #f5f5f5', 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* لوگو و نام شرکت */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 1.5 }, justifyContent: 'flex-start' }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              position: 'relative',
              borderRadius: '50%',
              overflow: 'hidden',
              ml: { xs: 1, sm: 1.5 },
              border: '1px solid #e3f2fd',
              boxShadow: '0 2px 8px rgba(66, 133, 244, 0.1)',
              bgcolor: '#f8fafd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {company.logo ? (
              <Image
                src={getImageUrl(company.logo) || ''}
                alt={`${company.name} logo`}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              // استفاده از آیکون متفاوت بر اساس ایندکس برای تنوع بیشتر
              index % 4 === 0 ? (
                <DomainIcon sx={{ fontSize: 24, color: EMPLOYER_THEME.primary }} />
              ) : index % 4 === 1 ? (
                <StoreIcon sx={{ fontSize: 24, color: EMPLOYER_THEME.primary }} />
              ) : index % 4 === 2 ? (
                <AccountBalanceIcon sx={{ fontSize: 24, color: EMPLOYER_THEME.primary }} />
              ) : (
                <ApartmentIcon sx={{ fontSize: 24, color: EMPLOYER_THEME.primary }} />
              )
            )}
          </Box>
          <Typography 
            fontWeight="bold" 
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.9rem' }, 
              color: EMPLOYER_THEME.dark,
              maxWidth: 'calc(100% - 60px)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3
            }}
          >
            {company.name.length > 16 ? `${company.name.substring(0, 16)}...` : company.name}
          </Typography>
        </Box>
        
        {/* اطلاعات اضافی */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, sm: 1 }, mb: { xs: 1.5, sm: 2 } }}>
          {/* گروه کاری - فقط اگر وجود داشت */}
          {company.industry?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
              <CategoryIcon sx={{ fontSize: 16, color: EMPLOYER_THEME.primary, flexShrink: 0 }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  maxWidth: 'calc(100% - 24px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:after': {
                    content: company.industry.name.length > 30 ? '"..."' : '""',
                    display: 'inline'
                  }
                }}
              >
                {company.industry.name.length > 30 ? company.industry.name.substring(0, 30) : company.industry.name}
              </Typography>
            </Box>
          )}

          {/* موقعیت - فقط اگر هم شهر و هم استان وجود داشت */}
          {company.location?.name && company.location?.province?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
              <LocationOnIcon sx={{ fontSize: 16, color: EMPLOYER_THEME.primary, flexShrink: 0 }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.85rem',
                  maxWidth: 'calc(100% - 24px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:after': {
                    content: `${company.location.province.name}، ${company.location.name}`.length > 35 ? '"..."' : '""',
                    display: 'inline'
                  }
                }}
              >
                {`${company.location.province.name}، ${company.location.name}`.length > 35 
                  ? `${company.location.province.name}، ${company.location.name}`.substring(0, 35)
                  : `${company.location.province.name}، ${company.location.name}`}
              </Typography>
            </Box>
          )}

          {/* تعداد کارمندان - فقط اگر وجود داشت و بزرگتر از صفر بود */}
          {company.number_of_employees && company.number_of_employees > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
              <GroupIcon sx={{ fontSize: 16, color: EMPLOYER_THEME.primary, flexShrink: 0 }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.85rem',
                  maxWidth: 'calc(100% - 24px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {company.number_of_employees} نفر
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* توضیحات - فقط اگر وجود داشت */}
        {company.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 0, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.6,
              maxHeight: '3.2em',
              color: 'text.secondary',
              fontSize: '0.85rem',
              mt: 'auto'
            }}
          >
            {company.description}
          </Typography>
        )}
      </Box>
      
      {/* دکمه مشاهده */}
      <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8fafd', borderTop: '1px solid #f5f5f5', flexShrink: 0 }}>
        <Link href={`/employer/companies/${company.id}`} style={{ textDecoration: 'none' }}>
          <Button
            fullWidth
            variant="text"
            size="small"
            sx={{
              color: EMPLOYER_THEME.primary,
              fontSize: '0.85rem',
              fontWeight: 500,
              py: 0.75,
              '&:hover': {
                bgcolor: 'rgba(66, 133, 244, 0.05)'
              }
            }}
          >
            مشاهده شرکت
          </Button>
        </Link>
      </Box>
    </Paper>
  );
};

export default CompanyCard; 