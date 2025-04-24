'use client'

import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Image from 'next/image';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

export default function AboutUs() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  
  // آمار و ارقام مربوط به وب‌سایت
  const stats = [
    { 
      id: 1, 
      value: '+۵۰,۰۰۰', 
      label: 'متخصص', 
      icon: <PeopleAltOutlinedIcon fontSize="large" color="primary" />
    },
    { 
      id: 2, 
      value: '+۳۰,۰۰۰', 
      label: 'پروژه انجام شده', 
      icon: <VerifiedOutlinedIcon fontSize="large" color="primary" />
    },
    { 
      id: 3, 
      value: '+۳۵,۰۰۰', 
      label: 'کارفرما', 
      icon: <PaymentsOutlinedIcon fontSize="large" color="primary" />
    },
    { 
      id: 4, 
      value: '۷/۲۴', 
      label: 'پشتیبانی', 
      icon: <SupportAgentOutlinedIcon fontSize="large" color="primary" />
    },
  ];

  // ویژگی‌های وب‌سایت
  const features = [
    {
      id: 1,
      title: 'دسترسی به متخصصان مجرب',
      description: 'با ماهرکار به شبکه بزرگی از متخصصان در زمینه‌های مختلف دسترسی خواهید داشت.',
      icon: <PeopleAltOutlinedIcon />
    },
    {
      id: 2,
      title: 'امنیت پرداخت',
      description: 'سیستم حساب امانی ماهرکار تضمین می‌کند که هزینه پروژه شما با امنیت کامل پرداخت شود.',
      icon: <PaymentsOutlinedIcon />
    },
    {
      id: 3,
      title: 'پشتیبانی ۲۴/۷',
      description: 'تیم پشتیبانی ما آماده پاسخگویی به سوالات و حل مشکلات شما در هر زمان است.',
      icon: <SupportAgentOutlinedIcon />
    },
    {
      id: 4,
      title: 'تضمین کیفیت',
      description: 'با سیستم امتیازدهی و نظرات کاربران، می‌توانید از کیفیت کار متخصصان اطمینان حاصل کنید.',
      icon: <VerifiedOutlinedIcon />
    },
    {
      id: 5,
      title: 'تنوع خدمات',
      description: 'از توسعه وب گرفته تا بازاریابی دیجیتال، تمام نیازهای کسب و کار شما را پوشش می‌دهیم.',
      icon: <PeopleAltOutlinedIcon />
    },
    {
      id: 6,
      title: 'قیمت‌گذاری شفاف',
      description: 'با دریافت پیشنهادهای متعدد از متخصصان مختلف، می‌توانید بهترین قیمت را برای پروژه خود پیدا کنید.',
      icon: <PaymentsOutlinedIcon />
    },
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* کادر سمت راست - معرفی ماهرکار */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: { xs: 0, md: 2 } }}>
              <Typography 
                variant="h2" 
                component="h2"
                sx={{ 
                  fontWeight: 900, 
                  fontSize: { xs: '1.75rem', md: '2.2rem' },
                  textAlign: { xs: 'center', md: 'right' },
                  mb: 2 
                }}
              >
                ماهرکار؛ سامانه فریلنسینگ پیشرو در ایران
              </Typography>
              
              <Typography 
                variant="body1" 
                paragraph
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  mb: 3,
                  textAlign: { xs: 'center', md: 'right' },
                }}
              >
                ماهرکار پلتفرمی جامع برای اتصال کارفرمایان به متخصصان آزادکار است.
                ما ارتباط موثر، امنیت پرداخت و کیفیت بالا را برای تمامی ذینفعان تضمین می‌کنیم.
                چه کارفرما باشید و چه متخصص، ماهرکار را برای تجربه‌ای مطمئن در انجام پروژه‌های دورکاری انتخاب کنید.
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                  <Grid size={{ xs: 6 }} key={stat.id}>
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: 2, 
                        border: `1px solid ${jobSeekerColors.bgLight}`,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: jobSeekerColors.primary,
                          mb: 0.5
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'text.secondary' }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ textAlign: { xs: 'center', md: 'right' }, mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  size="large"
                  startIcon={<InfoIcon />}
                  sx={{ 
                    mr: 2, 
                    px: 3,
                    py: 1.2,
                    boxShadow: `0 4px 14px ${jobSeekerColors.bgLight}`,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                    }
                  }}
                >
                  درباره ما
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<ContactSupportIcon />}
                  sx={{ 
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderColor: jobSeekerColors.primary,
                    color: jobSeekerColors.primary,
                    '&:hover': {
                      borderColor: jobSeekerColors.dark,
                      bgcolor: 'rgba(0, 128, 0, 0.04)',
                    }
                  }}
                >
                  تماس با ما
                </Button>
              </Box>
            </Box>
          </Grid>
          
          {/* کادر سمت چپ - تصویر و ویژگی‌ها */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ 
              position: 'relative', 
              height: '100%',
              mt: { xs: 4, md: 0 }
            }}>
              <Box 
                component="img"
                src="/images/about-team.jpg"
                alt="تیم ماهرکار"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  mb: 4
                }}
              />
              
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  textAlign: { xs: 'center', md: 'right' },
                }}
              >
                ویژگی‌های ما
              </Typography>
              
              <Grid container spacing={2}>
                {features.map((feature) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={feature.id}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      bgcolor: 'background.paper',
                      p: 2,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: `1px solid ${jobSeekerColors.bgLight}`,
                      height: '100%',
                    }}>
                      <Box 
                        sx={{ 
                          mr: 1.5, 
                          color: jobSeekerColors.primary,
                          bgcolor: jobSeekerColors.bgVeryLight,
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 0.5, 
                            fontSize: '1rem' 
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            lineHeight: 1.6 
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 