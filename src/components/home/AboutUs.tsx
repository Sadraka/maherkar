'use client'

import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  useTheme
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

export default function AboutUs() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  
  // آمار و ارقام مربوط به وب‌سایت به صورت ساده
  const stats = [
    { id: 1, value: '+۱۵,۰۰۰', label: 'متخصص' },
    { id: 2, value: '+۱۰,۰۰۰', label: 'آگهی' },
    { id: 3, value: '+۸,۰۰۰', label: 'کارفرما' },
    { id: 4, value: '۷/۲۴', label: 'پشتیبانی تمام وقت' },
  ];

  return (
    <Box sx={{ py: 6, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: jobSeekerColors.primary
            }}
          >
            ماهرکار؛ سامانه کاریابی پیشرو در ایران
          </Typography>
          <Typography 
            variant="h5" 
            component="h3"
            sx={{ 
              fontWeight: 500,
              mb: 4,
              color: 'text.secondary',
              maxWidth: 650, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            ارتباط مستقیم کارفرمایان با متخصصان برای انجام پروژه‌های دورکاری
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {stats.map((stat) => (
            <Grid size={{ xs: 6, sm: 3 }} key={stat.id}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                backgroundColor: '#fff',
                border: `1px solid ${jobSeekerColors.bgLight}`
              }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: jobSeekerColors.primary,
                    fontSize: { xs: '1.6rem', md: '2rem' },
                    mb: 0.5
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ color: 'text.secondary' }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<InfoIcon />}
            sx={{ 
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              color: jobSeekerColors.primary,
              borderColor: jobSeekerColors.primary,
              '&:hover': {
                borderColor: jobSeekerColors.dark,
                backgroundColor: jobSeekerColors.bgVeryLight
              },
              boxShadow: `0 4px 14px rgba(0, 0, 0, 0.05)`,
              transition: 'all 0.3s ease',
              '&:active': { transform: 'translateY(1px)' }
            }}
          >
            درباره ما
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 