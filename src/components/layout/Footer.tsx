'use client'

import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Link,
  Stack,
  IconButton
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 6, 
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #eee'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              کارفرمایان
            </Typography>
            <Stack spacing={1}>
              <Link href="#" underline="hover" color="text.secondary">
                ثبت آگهی استخدام
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                جستجوی رزومه
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                ارسال پیام به متخصصین
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                راهنمای استخدام
              </Link>
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              متخصصین
            </Typography>
            <Stack spacing={1}>
              <Link href="#" underline="hover" color="text.secondary">
                فرصت های شغلی
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                ثبت رزومه
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                راهنمای کاریابی
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                ثبت مهارت‌های پیشرفته
              </Link>
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              سایر لینک‌ها
            </Typography>
            <Stack spacing={1}>
              <Link href="#" underline="hover" color="text.secondary">
                سوالات متداول
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                قوانین و مقررات
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                حریم خصوصی
              </Link>
              <Link href="#" underline="hover" color="text.secondary">
                تماس با ما
              </Link>
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              ماهرکار
            </Typography>
            <Box 
              sx={{ 
                width: 120, 
                height: 120, 
                backgroundColor: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                borderRadius: 1
              }}
            >
              <Typography>لوگو</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" sx={{ color: '#666' }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#666' }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#666' }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#666' }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
        
        <Box 
          sx={{ 
            mt: 6, 
            pt: 3, 
            borderTop: '1px solid #ddd',
            textAlign: 'center' 
          }}
        >
          <Typography variant="body2" color="text.secondary">
            ماهرکار - تمامی حقوق محفوظ است
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 