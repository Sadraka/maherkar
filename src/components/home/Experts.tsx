'use client'

import { 
  Box, 
  Typography, 
  Container, 
  Button,
  useTheme,
  Grid
} from '@mui/material';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import ExpertCard, { ExpertType } from './ExpertCard';

export default function Experts() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  
  const experts: ExpertType[] = [
    {
      id: 1,
      name: 'علی محمدی',
      jobTitle: 'توسعه‌دهنده فرانت‌اند ارشد',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: 'تهران',
      rating: 4.9,
      completedProjects: 48,
      skills: ['React', 'NextJS', 'TypeScript'],
      isVerified: true,
      hourlyRate: '۲۰۰ هزار تومان'
    },
    {
      id: 2,
      name: 'سارا احمدی',
      jobTitle: 'طراح رابط کاربری و تجربه کاربری',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      location: 'اصفهان',
      rating: 4.8,
      completedProjects: 36,
      skills: ['UI/UX', 'Figma', 'طراحی محصول'],
      isVerified: true,
      hourlyRate: '۱۸۰ هزار تومان'
    },
    {
      id: 3,
      name: 'محمد کریمی',
      jobTitle: 'برنامه‌نویس بک‌اند',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      location: 'شیراز',
      rating: 4.7,
      completedProjects: 29,
      skills: ['Node.js', 'Express', 'MongoDB'],
      isVerified: false,
      hourlyRate: '۱۹۰ هزار تومان'
    },
    {
      id: 4,
      name: 'نازنین رضایی',
      jobTitle: 'متخصص دیجیتال مارکتینگ',
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
      location: 'مشهد',
      rating: 4.6,
      completedProjects: 22,
      skills: ['SEO', 'گوگل ادز', 'شبکه‌های اجتماعی'],
      isVerified: true,
      hourlyRate: '۱۷۰ هزار تومان'
    },
    {
      id: 5,
      name: 'حسین نوری',
      jobTitle: 'مهندس DevOps',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      location: 'تهران',
      rating: 4.9,
      completedProjects: 41,
      skills: ['Docker', 'Kubernetes', 'AWS'],
      isVerified: true,
      hourlyRate: '۲۳۰ هزار تومان'
    },
    {
      id: 6,
      name: 'مریم موسوی',
      jobTitle: 'گرافیست و طراح',
      avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
      location: 'تبریز',
      rating: 4.8,
      completedProjects: 35,
      skills: ['فتوشاپ', 'ایلاستریتور', 'طراحی لوگو'],
      isVerified: false,
      hourlyRate: '۱۶۰ هزار تومان'
    },
  ];
  
  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f7fa' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: theme.palette.text.primary,
              position: 'relative',
              display: 'inline-block',
              pb: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '80px',
                height: '4px',
                backgroundColor: jobSeekerColors.primary,
                bottom: 0,
                left: 'calc(50% - 40px)',
                borderRadius: '2px'
              }
            }}
          >
            متخصصان برتر و زبده ماهرکار
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mt: 2,
              fontSize: '1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            با بهترین متخصصان در حوزه‌های مختلف آشنا شوید و به راحتی پروژه‌های خود را با اطمینان به آنها بسپارید
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {experts.map((expert) => (
            <Grid key={expert.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ExpertCard expert={expert} />
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            disableElevation
            color="success"
            sx={{ 
              px: 4,
              py: 1.2,
              fontWeight: 700,
              borderRadius: 2,
              fontSize: '1rem',
              background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
              boxShadow: `0 4px 8px rgba(0, 112, 60, 0.2)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                boxShadow: `0 6px 10px rgba(0, 112, 60, 0.3)`,
              }
            }}
          >
            مشاهده همه متخصصان
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 