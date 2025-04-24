'use client'

import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Rating,
  Chip,
  Stack,
  Button,
  Divider
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

type ExpertType = {
  id: number;
  name: string;
  jobTitle: string;
  avatar: string;
  location: string;
  rating: number;
  completedProjects: number;
  skills: string[];
  isVerified: boolean;
  hourlyRate: string;
};

export default function Experts() {
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
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ fontWeight: 'bold', mb: 1.5 }}
          >
            متخصصان برتر و زبده ماهرکار
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: 650, mx: 'auto' }}
          >
            با بهترین متخصصان در حوزه‌های مختلف آشنا شوید و به راحتی پروژه‌های خود را با اطمینان به آنها بسپارید
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {experts.map((expert) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={expert.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'visible',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={expert.avatar} 
                      alt={expert.name}
                      sx={{ 
                        width: 90, 
                        height: 90, 
                        mb: 1.5,
                        border: '3px solid white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }} 
                    />
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                          {expert.name}
                        </Typography>
                        {expert.isVerified && (
                          <CheckCircleOutlineIcon 
                            sx={{ ml: 0.5, color: 'var(--primary-color)', fontSize: '1rem' }} 
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {expert.jobTitle}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                        <Rating 
                          value={expert.rating} 
                          precision={0.1} 
                          readOnly 
                          size="small" 
                          sx={{ mr: 0.5 }} 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {expert.rating}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem', ml: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {expert.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkOutlineIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem', ml: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {expert.completedProjects} پروژه موفق
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 2 }}>
                    {expert.skills.map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.7rem', 
                          height: 24, 
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          color: 'primary.main',
                          my: 0.5
                        }} 
                      />
                    ))}
                  </Stack>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      sx={{ 
                        backgroundColor: 'var(--primary-color)',
                        '&:hover': { backgroundColor: '#1565c0' },
                        fontSize: '0.8rem',
                        borderRadius: 2,
                        px: 2
                      }}
                    >
                      استخدام متخصص
                    </Button>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                      ساعتی {expert.hourlyRate}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button 
            variant="outlined" 
            sx={{ 
              color: 'var(--primary-color)', 
              borderColor: 'rgba(25, 118, 210, 0.5)',
              '&:hover': {
                borderColor: 'var(--primary-color)',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              },
              px: 4,
              py: 1,
              borderRadius: 2
            }}
          >
            مشاهده همه متخصصان
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 