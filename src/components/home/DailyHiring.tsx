'use client'

import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { EMPLOYER_THEME } from '@/constants/colors';

export default function DailyHiring() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const employerColors = EMPLOYER_THEME;

  const features = [
    {
      icon: <TrendingUpIcon sx={{ color: employerColors.primary, fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' } }} />,
      title: "نردبان شده",
      description: "قرارگیری در بالاترین رتبه‌های جستجو"
    },
    {
      icon: <AccessTimeIcon sx={{ color: employerColors.primary, fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' } }} />,
      title: "استخدام سریع‌تر",
      description: "کاهش زمان جذب نیرو تا ۷۰٪"
    },
    {
      icon: <LocalOfferIcon sx={{ color: employerColors.primary, fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' } }} />,
      title: "قیمت مناسب",
      description: "تعرفه‌های رقابتی و مقرون به صرفه"
    },
  ];

  return (
    <Box sx={{
      pt: { xs: 1.5, sm: 2, md: 3 },
      pb: { xs: 1.5, sm: 2, md: 3 },
      backgroundColor: '#fff'
    }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3, md: 3 } }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
              color: 'primary.main',
              position: 'relative',
              display: 'inline-block',
              pb: { xs: 1.5, sm: 2 },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: { xs: '60px', sm: '70px', md: '80px' },
                height: { xs: '3px', md: '4px' },
                backgroundColor: employerColors.primary,
                bottom: 0,
                left: { xs: 'calc(50% - 30px)', sm: 'calc(50% - 35px)', md: 'calc(50% - 40px)' },
                borderRadius: '2px'
              }
            }}
          >
            استخدام روزانه، سریع و آسان
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: { xs: 1.5, md: 2 },
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
              maxWidth: { xs: '300px', sm: '450px', md: '600px' },
              mx: 'auto',
              lineHeight: { xs: 1.6, sm: 1.8 }
            }}
          >
            با آگهی نردبان، شانس دیده شدن آگهی شما توسط متخصصان تا ۳ برابر افزایش می‌یابد
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 4 }} key={index}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'column' },
                alignItems: { xs: 'center', sm: 'center' },
                textAlign: { xs: 'center', sm: 'center' },
                height: '100%',
                p: { xs: 1, sm: 2 },
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(10, 59, 121, 0.03)',
                }
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: '48px', sm: '48px', md: '52px' },
                  height: { xs: '48px', sm: '48px', md: '52px' },
                  borderRadius: '50%',
                  backgroundColor: 'rgba(10, 59, 121, 0.07)',
                  mb: { xs: 1.5, sm: 2 },
                  mr: { xs: 0, sm: 0 },
                  ml: { xs: 0, sm: 0 },
                  flexShrink: 0
                }}>
                  {feature.icon}
                </Box>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  alignItems: { xs: 'center', sm: 'center' }
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      mb: { xs: 0.5, sm: 1 },
                      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                      width: '100%',
                      textAlign: { xs: 'center', sm: 'center' }
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                      textAlign: { xs: 'center', sm: 'center' }
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={<WorkOutlineIcon />}
            sx={{
              backgroundColor: employerColors.primary,
              background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)`
              },
              py: { xs: 1, sm: 1.2 },
              px: { xs: 3, sm: 4 },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              boxShadow: `0 4px 14px ${employerColors.bgLight}`,
              transition: 'all 0.3s ease',
              '&:active': { transform: 'translateY(1px)' }
            }}
          >
            ثبت آگهی نردبان
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 