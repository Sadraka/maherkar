import React from 'react';
import { Typography, Box, Button, Paper, Chip } from '@mui/material';
import Link from 'next/link';
import BusinessIcon from '@mui/icons-material/Business';
import { EMPLOYER_THEME } from '@/constants/colors';

interface CompanyCardProps {
  company: any;
  index: number;
}

/**
 * کامپوننت کارت شرکت برای نمایش اطلاعات شرکت
 */
const CompanyCard = ({ company, index }: CompanyCardProps) => {
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
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
          borderColor: '#e6e6e6'
        }
      }}
    >
      {company.banner ? (
        <Box
          sx={{
            height: 120,
            backgroundImage: `url(${company.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ) : (
        <Box sx={{ height: 120, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BusinessIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
        </Box>
      )}
      
      <Box sx={{ p: 3, borderBottom: '1px solid #f5f5f5', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {company.logo ? (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundImage: `url(${company.logo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid #f0f0f0',
                ml: 2
              }}
            />
          ) : (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 2
              }}
            >
              <BusinessIcon sx={{ fontSize: 24, color: '#bdbdbd' }} />
            </Box>
          )}
          <Typography fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            {company.name || 'نام شرکت'}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {company.industry?.name || 'صنعت'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {company.description || 'توضیحات شرکت در اینجا نمایش داده می‌شود...'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
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
  );
};

export default CompanyCard; 