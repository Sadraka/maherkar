'use client';

import React from 'react';
import { Paper, Box, Typography, Avatar, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { EMPLOYER_THEME } from '@/constants/colors';

interface ApplicantInfoProps {
  applicant: {
    user?: {
      username?: string;
      full_name?: string;
      email?: string;
      phone_number?: string;
      profile_picture?: string;
    };
  };
  jobTitle?: string;
}

/**
 * کامپوننت نمایش اطلاعات متقاضی
 */
export default function ApplicantInfo({ applicant, jobTitle }: ApplicantInfoProps) {
  const user = applicant?.user;

  return (
    <Paper elevation={0} sx={{ 
      p: { xs: 3, sm: 4 }, 
      borderRadius: 3,
      boxShadow: '0 3px 10px rgba(66, 133, 244, 0.05)',
      border: '1px solid #e3f2fd'
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ 
        mb: 3, 
        color: EMPLOYER_THEME.primary,
        fontSize: { xs: '1.1rem', sm: '1.25rem' }
      }}>
        اطلاعات متقاضی
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
        {/* آواتار و نام */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user?.profile_picture ? (
            <Avatar 
              src={user.profile_picture} 
              alt={user?.username || 'کاربر'} 
              sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 } }} 
            />
          ) : (
            <Avatar sx={{ 
              width: { xs: 64, sm: 80 }, 
              height: { xs: 64, sm: 80 }, 
              bgcolor: EMPLOYER_THEME.light 
            }}>
              <PersonIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: EMPLOYER_THEME.primary }} />
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ 
              color: EMPLOYER_THEME.dark,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
              {user?.full_name || user?.username || 'نام متقاضی'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }}>
              متقاضی برای: {jobTitle || 'عنوان شغلی'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* اطلاعات تماس */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
        gap: 3 
      }}>
        {user?.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EmailIcon sx={{ color: EMPLOYER_THEME.primary }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem' }
              }}>
                ایمیل
              </Typography>
              <Typography sx={{ 
                direction: 'ltr', 
                textAlign: 'left',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        
        {user?.phone_number && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PhoneIcon sx={{ color: EMPLOYER_THEME.primary }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem' }
              }}>
                شماره تماس
              </Typography>
              <Typography sx={{ 
                direction: 'ltr', 
                textAlign: 'left',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                {user.phone_number}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}