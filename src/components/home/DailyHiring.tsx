'use client'

import { 
  Box, 
  Typography, 
  Container, 
  Button,
  Grid
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { EMPLOYER_THEME } from '@/constants/colors';

export default function DailyHiring() {
  const employerColors = EMPLOYER_THEME;

  const features = [
    {
      icon: <TrendingUpIcon sx={{ color: employerColors.primary, fontSize: '1.4rem' }} />,
      title: "نمایش ویژه",
      description: "در بالاترین رتبه‌های جستجو"
    },
    {
      icon: <AccessTimeIcon sx={{ color: employerColors.primary, fontSize: '1.4rem' }} />,
      title: "استخدام سریع‌تر",
      description: "کاهش زمان استخدام تا ۷۰٪"
    },
    {
      icon: <LocalOfferIcon sx={{ color: employerColors.primary, fontSize: '1.4rem' }} />,
      title: "قیمت مناسب",
      description: "تعرفه‌های رقابتی"
    },
  ];

  return (
    <Box sx={{ py: 5, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: 'primary.main'
            }}
          >
            استخدام روزانه، سریع و مطمئن
          </Typography>
          <Typography 
            variant="h5" 
            component="h3"
            sx={{ 
              fontWeight: 500,
              mb: 2,
              color: 'text.secondary',
              maxWidth: 650, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            با سرویس آگهی ویژه، شانس دیده شدن آگهی شما توسط متخصصان تا ۳ برابر افزایش می‌یابد
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 4 }} key={index}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(10, 59, 121, 0.07)',
                  mb: 2
                }}>
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 1, 
                    fontSize: '1.05rem' 
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    maxWidth: '90%',
                    mx: 'auto'
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<WorkOutlineIcon />}
            sx={{ 
              backgroundColor: employerColors.primary,
              background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
              '&:hover': { 
                background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)` 
              },
              py: 1.2,
              px: 4,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: `0 4px 14px ${employerColors.bgLight}`,
              transition: 'all 0.3s ease',
              '&:active': { transform: 'translateY(1px)' }
            }}
          >
            ثبت آگهی ویژه
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 