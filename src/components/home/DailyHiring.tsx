'use client'

import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button,
  Paper,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import Image from 'next/image';

export default function DailyHiring() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const jobSeekerColors = useJobSeekerTheme();
  const employerColors = EMPLOYER_THEME;

  // ویژگی‌های استخدام روزانه
  const features = [
    {
      icon: <TrendingUpIcon sx={{ color: employerColors.primary, fontSize: '1.5rem' }} />,
      title: "مشاهده بیشتر",
      description: "نمایش آگهی شما در بالاترین رتبه‌های جستجو"
    },
    {
      icon: <AccessTimeIcon sx={{ color: employerColors.primary, fontSize: '1.5rem' }} />,
      title: "استخدام سریع‌تر",
      description: "کاهش زمان استخدام تا ۷۰٪"
    },
    {
      icon: <LocalOfferIcon sx={{ color: employerColors.primary, fontSize: '1.5rem' }} />,
      title: "هزینه مناسب",
      description: "قیمت‌گذاری رقابتی و مقرون به صرفه"
    },
  ];

  return (
    <Box 
      sx={{ 
        py: { xs: 4, md: 6 }, 
        backgroundColor: '#ffffff',
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h2"
                sx={{ 
                  fontWeight: 800,
                  mb: 1.5,
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                  color: employerColors.primary
                }}
              >
                استخدام روزانه، سریع و مطمئن
              </Typography>
              
              <Typography 
                variant="h5" 
                component="h3"
                sx={{ 
                  fontWeight: 500,
                  mb: 2.5,
                  color: theme.palette.text.secondary
                }}
              >
                با آگهی ویژه، استخدام را سرعت ببخشید
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3.5, 
                  color: theme.palette.text.secondary, 
                  lineHeight: 1.8,
                  maxWidth: '95%'
                }}
              >
                با استفاده از سرویس آگهی ویژه استخدام روزانه، آگهی‌های شما در بالای لیست نمایش داده می‌شوند و شانس دیده شدن توسط متخصصان مناسب تا ۳ برابر افزایش می‌یابد.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<WorkOutlineIcon />}
                  sx={{ 
                    backgroundColor: employerColors.primary,
                    '&:hover': { backgroundColor: employerColors.dark },
                    py: 1.2,
                    px: 3,
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ثبت آگهی ویژه
                </Button>
                
                <Button 
                  variant="text" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: employerColors.primary,
                    fontWeight: 'medium',
                    '&:hover': { 
                      backgroundColor: 'transparent',
                      color: employerColors.dark, 
                      transform: 'translateX(-4px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  اطلاعات بیشتر
                </Button>
              </Stack>
              
              <Divider sx={{ mb: 3, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
              
              {/* ویژگی‌های استخدام روزانه */}
              <Grid container spacing={3} sx={{ mt: 0 }}>
                {features.map((feature, index) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={index}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        textAlign: { xs: 'right', sm: 'center' },
                      }}
                    >
                      <Box 
                        sx={{ 
                          backgroundColor: 'rgba(10, 59, 121, 0.06)',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          mb: 1.5
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 0.5, 
                          fontSize: '1rem', 
                          fontWeight: 'bold', 
                          color: theme.palette.text.primary 
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontSize: '0.85rem',
                          maxWidth: { sm: '90%' }
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: '270px', md: '360px' },
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'none',
                border: `1px solid rgba(0, 0, 0, 0.08)`,
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h5" color={employerColors.primary} sx={{ fontWeight: 'bold', opacity: 0.7 }}>
                تصویر تبلیغاتی استخدام روزانه
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 