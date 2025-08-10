'use client';

import React from 'react';
import { Typography, Box, Button, useMediaQuery, useTheme, Container } from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import { EMPLOYER_THEME } from '@/constants/colors';

/**
 * کامپوننت هدر صفحه شرکت‌ها
 */
const CompaniesHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container 
      disableGutters 
      sx={{
        width: '100%',
        maxWidth: '100%',
        px: { xs: 1, sm: 2 }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: { xs: 3, sm: 4 },
          gap: { xs: 2, sm: 0 },
          width: '100%',
          direction: 'rtl'
        }}
      >
        <Button
          variant="contained"
        
          sx={{
            bgcolor: EMPLOYER_THEME.primary,
            '&:hover': { bgcolor: EMPLOYER_THEME.dark },
            borderRadius: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            fontWeight: 'medium',
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            width: { xs: '100%', sm: 'auto' },
            whiteSpace: 'nowrap',
            order: { xs: 2, sm: 1 },
            alignSelf: { xs: 'flex-end', sm: 'auto' }
          }}
          component={Link}
          href="/employer/companies/create"
        >
          ثبت شرکت جدید
        </Button>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            order: { xs: 1, sm: 2 },
            justifyContent: { xs: 'flex-end', sm: 'flex-start' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <BusinessIcon color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }  }} />
          <Typography 
            variant="h5" 
            component="h1" 
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              textAlign: { xs: 'right', sm: 'left' }
            }}
          >
            شرکت‌های من
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default CompaniesHeader; 