'use client'

import { Box, Container, Typography, Paper, TextField, MenuItem, Button, Grid, Stack, Avatar, Chip, useTheme, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import Image from 'next/image';
import { useState } from 'react';

export default function Hero() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [jobType, setJobType] = useState('all');
  
  return (
    <Box
      sx={{
        pt: { xs: 5, md: 8 },
        pb: { xs: 7, md: 10 },
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' }, mb: { xs: 4, md: 0 } }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' }, 
                mb: 3,
                color: theme.palette.text.primary
              }}
            >
              انجام با کیفیت و سریع کار شما
            </Typography>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 4, 
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.4rem' }
              }}
            >
              با برترین متخصصان <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>ماهرکار</Box>
            </Typography>
            
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: 2,
                textAlign: 'right'
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontWeight: 600, fontSize: '1rem' }}
                >
                  جستجو در فرصت‌های شغلی
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant={jobType === 'employer' ? 'contained' : 'outlined'} 
                    color="primary"
                    onClick={() => setJobType('employer')}
                    sx={{ 
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}
                  >
                    کارفرما
                  </Button>
                  <Button 
                    size="small" 
                    variant={jobType === 'candidate' ? 'contained' : 'outlined'} 
                    color="secondary"
                    onClick={() => setJobType('candidate')}
                    sx={{ 
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}
                  >
                    کارجو
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  select
                  label="گروه شغلی"
                  fullWidth
                  variant="outlined"
                  defaultValue=""
                  size="small"
                  InputLabelProps={{ style: { fontFamily: 'Vazirmatn' } }}
                >
                  <MenuItem value="">همه گروه‌های شغلی</MenuItem>
                  <MenuItem value="dev">برنامه‌نویسی و توسعه</MenuItem>
                  <MenuItem value="design">طراحی و خلاقیت</MenuItem>
                  <MenuItem value="marketing">بازاریابی و فروش</MenuItem>
                  <MenuItem value="content">تولید محتوا و ترجمه</MenuItem>
                  <MenuItem value="business">کسب و کار</MenuItem>
                  <MenuItem value="engineering">مهندسی و معماری</MenuItem>
                </TextField>

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="استان"
                      fullWidth
                      variant="outlined"
                      defaultValue=""
                      size="small"
                      InputLabelProps={{ style: { fontFamily: 'Vazirmatn' } }}
                      InputProps={{
                        startAdornment: <LocationOnIcon fontSize="small" color="action" sx={{ ml: 1, opacity: 0.6 }} />,
                      }}
                    >
                      <MenuItem value="">همه استان‌ها</MenuItem>
                      <MenuItem value="tehran">تهران</MenuItem>
                      <MenuItem value="isfahan">اصفهان</MenuItem>
                      <MenuItem value="mashhad">مشهد</MenuItem>
                      <MenuItem value="shiraz">شیراز</MenuItem>
                      <MenuItem value="tabriz">تبریز</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="نوع همکاری"
                      fullWidth
                      variant="outlined"
                      defaultValue=""
                      size="small"
                      InputLabelProps={{ style: { fontFamily: 'Vazirmatn' } }}
                      InputProps={{
                        startAdornment: <WorkIcon fontSize="small" color="action" sx={{ ml: 1, opacity: 0.6 }} />,
                      }}
                    >
                      <MenuItem value="">همه</MenuItem>
                      <MenuItem value="full-time">تمام وقت</MenuItem>
                      <MenuItem value="part-time">پاره وقت</MenuItem>
                      <MenuItem value="remote">دورکاری</MenuItem>
                      <MenuItem value="project">پروژه‌ای</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  label="جستجو در مشاغل"
                  fullWidth
                  variant="outlined"
                  placeholder="عنوان شغلی، مهارت یا شرکت..."
                  size="small"
                  InputLabelProps={{ style: { fontFamily: 'Vazirmatn' } }}
                />

                <Button
                  variant="contained"
                  color={jobType === 'candidate' ? 'secondary' : 'primary'}
                  startIcon={<SearchIcon />}
                  fullWidth
                  sx={{ 
                    py: 1.2,
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    mt: 1
                  }}
                >
                  جستجوی فرصت‌های شغلی
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                width: { xs: '100%', md: 'auto' }
              }}
            >
              <Box
                component="div"
                sx={{
                  width: { xs: '280px', sm: '320px', md: '380px' },
                  height: { xs: '280px', sm: '320px', md: '380px' },
                  borderRadius: '50%',
                  background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 10px 40px ${theme.palette.primary.main}33`,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-15px',
                    left: '-15px',
                    right: '-15px',
                    bottom: '-15px',
                    borderRadius: '50%',
                    border: `2px dashed ${theme.palette.primary.main}33`,
                    animation: 'spin 30s linear infinite'
                  },
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)'
                    },
                    '100%': {
                      transform: 'rotate(360deg)'
                    }
                  }
                }}
              >
                <Box
                  component="div"
                  sx={{
                    width: '90%',
                    height: '90%',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src="/professional-working.svg" 
                    alt="متخصص در حال کار"
                    style={{
                      width: '85%',
                      height: '85%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              </Box>
              
              {/* Feature badges floating around the image */}
              <Chip
                icon={<PersonIcon fontSize="small" color="primary" />}
                label="متخصصین برتر"
                sx={{
                  position: 'absolute',
                  top: '15%',
                  left: { xs: '5%', md: '10%' },
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid #f0f0f0',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  py: 1.5,
                  px: 1,
                  zIndex: 2
                }}
              />
              
              <Chip
                icon={<BusinessCenterIcon fontSize="small" color="primary" />}
                label="فرصت‌های شغلی متنوع"
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: { xs: '2%', md: '5%' },
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid #f0f0f0',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  py: 1.5,
                  px: 1,
                  zIndex: 2
                }}
              />
              
              <Chip
                icon={<SchoolIcon fontSize="small" color="secondary" />}
                label="متناسب با تخصص شما"
                sx={{
                  position: 'absolute',
                  top: '30%',
                  right: { xs: '5%', md: '10%' },
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid #f0f0f0',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  py: 1.5,
                  px: 1,
                  zIndex: 2
                }}
              />
              
              <Chip
                icon={<CheckCircleIcon fontSize="small" color="secondary" />}
                label="پرداخت امن و آسان"
                sx={{
                  position: 'absolute',
                  bottom: '10%',
                  right: { xs: '8%', md: '15%' },
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid #f0f0f0',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  py: 1.5,
                  px: 1,
                  zIndex: 2
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* آمار و ارقام */}
        <Box sx={{ mt: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              mb: 4, 
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            آمار ماهرکار و خدمات‌دهی به متخصصین
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ py: 3, px: 2, borderRadius: 2, bgcolor: 'rgba(10, 59, 121, 0.05)' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  ۱۰,۰۰۰+
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                  کارفرما
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ py: 3, px: 2, borderRadius: 2, bgcolor: 'rgba(10, 121, 64, 0.05)' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                  ۳۵,۰۰۰+
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                  متخصص
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ py: 3, px: 2, borderRadius: 2, bgcolor: 'rgba(10, 59, 121, 0.05)' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  ۵,۰۰۰+
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                  پروژه موفق
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ py: 3, px: 2, borderRadius: 2, bgcolor: 'rgba(10, 121, 64, 0.05)' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                  ۴.۶
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                  رضایت مشتری
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}