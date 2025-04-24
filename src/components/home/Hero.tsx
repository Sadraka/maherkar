'use client'

import { Box, Container, Typography, Paper, TextField, MenuItem, Button, Grid, Stack, Avatar, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Image from 'next/image';

export default function Hero() {
  return (
    <Box
      sx={{
        pt: 8,
        pb: 10,
        backgroundColor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'center', md: 'right' }, mb: { xs: 4, md: 0 } }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '2rem', md: '2.5rem' }, 
                mb: 3
              }}
            >
              انجام با کیفیت و سریع کار شما
            </Typography>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 4, 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: { xs: '1.2rem', md: '1.4rem' }
              }}
            >
              با برترین متخصصان <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>ماهرکار</span>
            </Typography>
            
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: 2,
                textAlign: 'right'
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}
              >
                جستجو در فرصت‌های شغلی
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  select
                  label="گروه شغلی"
                  fullWidth
                  variant="outlined"
                  defaultValue=""
                  size="small"
                >
                  <MenuItem value="">همه گروه‌های شغلی</MenuItem>
                  <MenuItem value="dev">برنامه‌نویسی و توسعه</MenuItem>
                  <MenuItem value="design">طراحی و خلاقیت</MenuItem>
                  <MenuItem value="marketing">بازاریابی و فروش</MenuItem>
                  <MenuItem value="content">تولید محتوا و ترجمه</MenuItem>
                  <MenuItem value="business">کسب و کار</MenuItem>
                  <MenuItem value="engineering">مهندسی و معماری</MenuItem>
                </TextField>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    label="استان"
                    fullWidth
                    variant="outlined"
                    defaultValue=""
                    size="small"
                  >
                    <MenuItem value="">همه استان‌ها</MenuItem>
                    <MenuItem value="tehran">تهران</MenuItem>
                    <MenuItem value="isfahan">اصفهان</MenuItem>
                    <MenuItem value="mashhad">مشهد</MenuItem>
                    <MenuItem value="shiraz">شیراز</MenuItem>
                    <MenuItem value="tabriz">تبریز</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="نوع همکاری"
                    fullWidth
                    variant="outlined"
                    defaultValue=""
                    size="small"
                  >
                    <MenuItem value="">همه</MenuItem>
                    <MenuItem value="full-time">تمام وقت</MenuItem>
                    <MenuItem value="part-time">پاره وقت</MenuItem>
                    <MenuItem value="remote">دورکاری</MenuItem>
                    <MenuItem value="project">پروژه‌ای</MenuItem>
                  </TextField>
                </Box>

                <TextField
                  label="جستجو در مشاغل"
                  fullWidth
                  variant="outlined"
                  placeholder="عنوان شغلی، مهارت یا..."
                  size="small"
                />

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  fullWidth
                  sx={{ 
                    py: 1,
                    backgroundColor: 'var(--primary-color)',
                    '&:hover': { backgroundColor: '#1565c0' },
                    fontWeight: 'bold'
                  }}
                >
                  جستجوی فرصت‌های شغلی
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }} sx={{ position: 'relative' }}>
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Box
                component="div"
                sx={{
                  width: { xs: '280px', md: '380px' },
                  height: { xs: '280px', md: '380px' },
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #1976d2, #64b5f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 40px rgba(25, 118, 210, 0.2)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-15px',
                    left: '-15px',
                    right: '-15px',
                    bottom: '-15px',
                    borderRadius: '50%',
                    border: '2px dashed rgba(25, 118, 210, 0.3)',
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
                icon={<PersonIcon fontSize="small" />}
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
                  px: 1
                }}
              />
              
              <Chip
                icon={<BusinessCenterIcon fontSize="small" />}
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
                  px: 1
                }}
              />
              
              <Chip
                icon={<SchoolIcon fontSize="small" />}
                label="متناسب با تخصص شما"
                sx={{
                  position: 'absolute',
                  top: '30%',
                  right: { xs: '5%', md: '0' },
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid #f0f0f0',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  py: 1.5,
                  px: 1
                }}
              />
            </Box>
          </Grid>
        </Grid>
        
        {/* Stats section */}
        <Box 
          sx={{ 
            mt: 6, 
            py: 4,
            px: 3,
            borderRadius: 2,
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <Grid container spacing={2} justifyContent="space-around" alignItems="center">
            <Grid size={12} sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                مورد اعتماد کسب‌وکارها و متخصصین
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 6, md: 3 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                +۱۰,۰۰۰
              </Typography>
              <Typography variant="body2" color="text.secondary">
                فرصت شغلی فعال
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 6, md: 3 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                +۲۵,۰۰۰
              </Typography>
              <Typography variant="body2" color="text.secondary">
                متخصص فعال
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 6, md: 3 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                +۵,۰۰۰
              </Typography>
              <Typography variant="body2" color="text.secondary">
                کارفرمای فعال
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 6, md: 3 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                ۹۵٪
              </Typography>
              <Typography variant="body2" color="text.secondary">
                رضایت کارفرمایان
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
      
      {/* Background elements */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.4,
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '30%',
            left: 0,
            width: '100%',
            height: '1px',
            backgroundColor: '#ddd'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '40%',
            width: '1px',
            height: '100%',
            backgroundColor: '#ddd'
          }
        }}
      />
    </Box>
  );
} 