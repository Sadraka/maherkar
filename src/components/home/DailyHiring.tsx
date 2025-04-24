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
  useMediaQuery
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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
        py: { xs: 5, md: 8 }, 
        backgroundColor: theme.palette.mode === 'dark' ? '#0a1929' : '#f8fafc',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* اضافه کردن شکل‌های مدرن به پس‌زمینه */}
      <Box 
        sx={{ 
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${employerColors.bgLight} 0%, rgba(10, 59, 121, 0.03) 100%)`,
          top: '-100px',
          right: '-100px',
          zIndex: 0
        }} 
      />
      
      <Box 
        sx={{ 
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${employerColors.bgLight} 0%, rgba(10, 59, 121, 0.03) 100%)`,
          bottom: '-80px',
          left: '-80px',
          zIndex: 0
        }} 
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h2"
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                  backgroundImage: `linear-gradient(135deg, ${employerColors.dark} 0%, ${employerColors.primary} 100%)`,
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitBackgroundClip: 'text'
                }}
              >
                استخدام روزانه، سریع و مطمئن
              </Typography>
              
              <Typography 
                variant="h5" 
                component="h3"
                sx={{ 
                  fontWeight: 500,
                  mb: 3,
                  color: theme.palette.text.secondary
                }}
              >
                با آگهی ویژه، استخدام را سرعت ببخشید
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  color: theme.palette.text.secondary, 
                  lineHeight: 1.8 
                }}
              >
                با استفاده از سرویس آگهی ویژه استخدام روزانه، آگهی‌های شما در بالای لیست نمایش داده می‌شوند و شانس دیده شدن توسط متخصصان مناسب تا ۳ برابر افزایش می‌یابد. این سرویس به شما کمک می‌کند فرآیند استخدام را تسریع کنید.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<WorkOutlineIcon />}
                  sx={{ 
                    backgroundColor: employerColors.primary,
                    '&:hover': { backgroundColor: employerColors.dark },
                    py: 1.5,
                    px: 4,
                    borderRadius: '8px',
                    boxShadow: `0 4px 14px ${employerColors.bgLight}`,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  ثبت آگهی ویژه
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderColor: employerColors.primary,
                    color: employerColors.primary,
                    '&:hover': { 
                      borderColor: employerColors.dark,
                      backgroundColor: employerColors.bgVeryLight 
                    },
                    py: 1.5,
                    px: 4,
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  اطلاعات بیشتر
                </Button>
              </Stack>
              
              {/* ویژگی‌های استخدام روزانه */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {features.map((feature, index) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={index}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                      <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem', fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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
                height: { xs: '300px', md: '450px' },
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                border: `1px solid ${employerColors.bgLight}`
              }}
            >
              {/* اینجا می‌توانید یک تصویر واقعی جایگزین کنید */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${employerColors.bgLight} 0%, ${employerColors.bgVeryLight} 100%)`,
                  position: 'relative'
                }}
              >
                <Typography variant="h5" color={employerColors.primary} sx={{ fontWeight: 'bold', position: 'absolute', zIndex: 2 }}>
                  تصویر تبلیغاتی استخدام روزانه
                </Typography>
                
                {/* نمونه طراحی گرافیکی به جای تصویر */}
                <Box sx={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.7 }}>
                  {[...Array(20)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: `${30 + Math.random() * 40}px`,
                        height: `${30 + Math.random() * 40}px`,
                        borderRadius: '50%',
                        background: `rgba(10, 59, 121, ${0.05 + Math.random() * 0.1})`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 