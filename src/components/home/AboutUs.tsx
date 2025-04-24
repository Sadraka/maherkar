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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Image from 'next/image';

export default function AboutUs() {
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
      description: 'با ماهرکار به شبکه بزرگی از متخصصان در زمینه‌های مختلف دسترسی خواهید داشت.'
    },
    {
      id: 2,
      title: 'امنیت پرداخت',
      description: 'سیستم حساب امانی ماهرکار تضمین می‌کند که هزینه پروژه شما با امنیت کامل پرداخت شود.'
    },
    {
      id: 3,
      title: 'پشتیبانی ۲۴/۷',
      description: 'تیم پشتیبانی ما آماده پاسخگویی به سوالات و حل مشکلات شما در هر زمان است.'
    },
    {
      id: 4,
      title: 'تضمین کیفیت',
      description: 'با سیستم امتیازدهی و نظرات کاربران، می‌توانید از کیفیت کار متخصصان اطمینان حاصل کنید.'
    },
    {
      id: 5,
      title: 'تنوع خدمات',
      description: 'از توسعه وب گرفته تا بازاریابی دیجیتال، تمام نیازهای کسب و کار شما را پوشش می‌دهیم.'
    },
    {
      id: 6,
      title: 'قیمت‌گذاری شفاف',
      description: 'با دریافت پیشنهادهای متعدد از متخصصان مختلف، می‌توانید بهترین قیمت را برای پروژه خود پیدا کنید.'
    },
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* بخش متن */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ fontWeight: 'bold', mb: 2 }}
              >
                درباره ماهرکار
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}
              >
                ماهرکار، پلتفرم جامع اتصال کارفرمایان و متخصصان در سراسر ایران است. هدف ما ایجاد فضایی امن و مطمئن برای همکاری‌های کاری و فریلنسری است که به رشد اقتصاد دیجیتال کشور کمک می‌کند.
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}
              >
                ما با بیش از ۵ سال سابقه فعالیت، توانسته‌ایم بیش از ۵۰ هزار متخصص و ۳۵ هزار کارفرما را در پلتفرم خود گردهم آوریم و زمینه انجام بیش از ۳۰ هزار پروژه موفق را فراهم کنیم.
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 5 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'var(--primary-color)', 
                    '&:hover': { bgcolor: '#1565c0' },
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  ثبت‌نام در ماهرکار
                </Button>
                <Button 
                  variant="outlined" 
                  endIcon={<ArrowBackIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  مشاهده خدمات
                </Button>
              </Stack>
              
              {/* کارت‌های آمار */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                  <Grid item xs={6} key={stat.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        borderRadius: 2,
                        height: '100%',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                        },
                      }}
                    >
                      <Box sx={{ mb: 1.5 }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          {/* بخش تصویر و ویژگی‌ها */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: { xs: 300, md: 380 }, mb: 4 }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                {/* تصویر نمونه - جایگزین با تصویر واقعی */}
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: '#1976d2',
                  backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h5" color="white" sx={{ fontWeight: 'bold' }}>
                    تصویر ماهرکار
                  </Typography>
                </div>
              </Box>
            </Box>
            
            <Typography 
              variant="h5" 
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
              چرا ماهرکار را انتخاب کنید؟
            </Typography>
            
            <Grid container spacing={2}>
              {features.map((feature) => (
                <Grid item xs={12} sm={6} key={feature.id}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 