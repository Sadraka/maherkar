'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Chip, Button } from '@mui/material';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { EMPLOYER_THEME } from '@/constants/colors';

interface ApplicationCardProps {
  application: {
    id: string | number;
    job_seeker?: {
      user?: {
        username?: string;
        full_name?: string;
        email?: string;
        phone_number?: string;
        profile_picture?: string;
      };
    };
    advertisement?: {
      advertisement?: {
        title?: string;
      };
    };
    created_at: string;
  };
}

/**
 * کامپوننت کارت نمایش درخواست کاریابی
 */
export default function ApplicationCard({ application }: ApplicationCardProps) {
  const jobSeeker = application.job_seeker;
  const user = jobSeeker?.user;
  const advertisement = application.advertisement?.advertisement;

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 3,
        boxShadow: '0 3px 10px rgba(66, 133, 244, 0.05)',
        border: '1px solid #e3f2fd',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 15px rgba(66, 133, 244, 0.1)',
          borderColor: '#e6e6e6',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        {/* اطلاعات متقاضی */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {user?.profile_picture ? (
            <Avatar 
              src={user.profile_picture} 
              alt={user?.username || 'کاربر'} 
              sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 }, ml: 2 }} 
            />
          ) : (
            <Avatar sx={{ 
              width: { xs: 48, sm: 56 }, 
              height: { xs: 48, sm: 56 }, 
              ml: 2, 
              bgcolor: EMPLOYER_THEME.light 
            }}>
              <PersonIcon sx={{ color: EMPLOYER_THEME.primary }} />
            </Avatar>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight="bold" sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              color: EMPLOYER_THEME.dark
            }}>
              {user?.full_name || user?.username || 'نام متقاضی'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              fontSize: { xs: '0.8rem', sm: '0.85rem' }
            }}>
              {advertisement?.title || 'عنوان شغلی'}
            </Typography>
          </Box>
        </Box>

        {/* اطلاعات تماس */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {user?.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 16, color: EMPLOYER_THEME.primary }} />
              <Typography variant="body2" sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                direction: 'ltr',
                textAlign: 'left'
              }}>
                {user.email}
              </Typography>
            </Box>
          )}
          {user?.phone_number && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, color: EMPLOYER_THEME.primary }} />
              <Typography variant="body2" sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                direction: 'ltr',
                textAlign: 'left'
              }}>
                {user.phone_number}
              </Typography>
            </Box>
          )}
        </Box>

        {/* وضعیت درخواست */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip 
            label="درخواست جدید"
            size="small"
            sx={{ 
              bgcolor: '#e8f5e8',
              color: '#2e7d32',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}>
            {new Date(application.created_at).toLocaleDateString('fa-IR')}
          </Typography>
        </Box>
      </CardContent>

      {/* دکمه‌های عملیات */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<VisibilityIcon />}
          sx={{
            color: EMPLOYER_THEME.primary,
            borderColor: EMPLOYER_THEME.primary,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            py: { xs: 0.8, sm: 1 },
            '&:hover': {
              bgcolor: 'rgba(66, 133, 244, 0.05)',
              borderColor: EMPLOYER_THEME.dark
            }
          }}
          component={Link}
          href={`/employer/applications/${application.id}`}
        >
          بررسی درخواست
        </Button>
      </Box>
    </Card>
  );
}