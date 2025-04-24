'use client'

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Stack,
  Chip,
  IconButton,
  Divider,
  Tab,
  Tabs,
  TextField,
  InputAdornment
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

type JobType = {
  id: number;
  title: string;
  location: string;
  isRemote: boolean;
  salary: string;
  skills: string[];
  isFavorite: boolean;
  isUrgent: boolean;
  timePosted: string;
  company: string;
  jobType: string;
};

export default function JobListings() {
  const [jobs, setJobs] = useState<JobType[]>([
    {
      id: 1,
      title: 'توسعه‌دهنده فرانت‌اند ارشد',
      company: 'شرکت فناوری نوین',
      location: 'تهران',
      isRemote: true,
      salary: '۳۰-۲۰ میلیون تومان',
      skills: ['React', 'TypeScript', 'NextJS'],
      isFavorite: false,
      isUrgent: true,
      timePosted: '۲ ساعت پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 2,
      title: 'طراح ارشد محصول',
      company: 'استودیو طراحی دیدار',
      location: 'اصفهان',
      isRemote: false,
      salary: '۱۵-۱۰ میلیون تومان',
      skills: ['UI/UX', 'Figma', 'Adobe XD'],
      isFavorite: false,
      isUrgent: false,
      timePosted: '۳ ساعت پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 3,
      title: 'مهندس DevOps',
      company: 'گروه فناوری آسان',
      location: 'تهران',
      isRemote: true,
      salary: '۴۰-۲۵ میلیون تومان',
      skills: ['Docker', 'Kubernetes', 'CI/CD'],
      isFavorite: false,
      isUrgent: true,
      timePosted: '۴ ساعت پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 4,
      title: 'کارشناس تولید محتوا',
      company: 'مجموعه دیجیتال مارکتینگ نگار',
      location: 'شیراز',
      isRemote: true,
      salary: '۱۰-۷ میلیون تومان',
      skills: ['SEO', 'تولید محتوا', 'مدیریت شبکه‌های اجتماعی'],
      isFavorite: false,
      isUrgent: false,
      timePosted: '۶ ساعت پیش',
      jobType: 'پاره‌وقت'
    },
    {
      id: 5,
      title: 'مدیر پروژه نرم‌افزاری',
      company: 'هلدینگ توسعه فناوری ایران',
      location: 'تهران',
      isRemote: false,
      salary: '۳۵-۲۵ میلیون تومان',
      skills: ['Scrum', 'Jira', 'مدیریت تیم'],
      isFavorite: false,
      isUrgent: true,
      timePosted: '۱ روز پیش',
      jobType: 'تمام‌وقت'
    },
    {
      id: 6,
      title: 'طراح گرافیک',
      company: 'استودیو خلاقیت بصیر',
      location: 'مشهد',
      isRemote: true,
      salary: '۱۵-۱۰ میلیون تومان',
      skills: ['فتوشاپ', 'ایلاستریتور', 'طراحی'],
      isFavorite: false,
      isUrgent: false,
      timePosted: '۱ روز پیش',
      jobType: 'پروژه‌ای'
    },
  ]);

  const [currentTab, setCurrentTab] = useState(0);

  const toggleFavorite = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isFavorite: !job.isFavorite } : job
    ));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ py: 6, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ fontWeight: 'bold' }}
          >
            فرصت‌های شغلی
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              placeholder="جستجو در مشاغل..."
              size="small"
              sx={{ 
                minWidth: { xs: 150, md: 250 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ 
                borderRadius: 2,
                borderColor: '#e0e0e0',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              فیلتر
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              sx={{ 
                borderRadius: 2,
                borderColor: '#e0e0e0',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              مرتب‌سازی
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{ 
              '.MuiTab-root': { fontSize: '0.95rem', fontWeight: 'medium' } 
            }}
          >
            <Tab label="همه مشاغل" />
            <Tab label="تمام‌وقت" />
            <Tab label="پاره‌وقت" />
            <Tab label="دورکاری" />
            <Tab label="پروژه‌ای" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} sm={6} lg={4} key={job.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ mb: 0.5, fontWeight: 'bold', fontSize: '1.1rem' }}
                      >
                        {job.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {job.company}
                      </Typography>
                    </Box>
                    
                    <IconButton 
                      size="small" 
                      onClick={() => toggleFavorite(job.id)}
                      sx={{ padding: 0 }}
                    >
                      {job.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                    </IconButton>
                  </Box>
                  
                  <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mb: 2 }}>
                    {job.skills.map((skill, index) => (
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
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location} {job.isRemote && '• دورکاری'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.timePosted} • {job.jobType}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      sx={{ 
                        backgroundColor: 'var(--primary-color)',
                        '&:hover': { backgroundColor: '#1565c0' },
                        fontSize: '0.8rem',
                        borderRadius: 2,
                        px: 2,
                        py: 0.75
                      }}
                    >
                      مشاهده و درخواست
                    </Button>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                      {job.salary}
                    </Typography>
                  </Box>
                  
                  {job.isUrgent && (
                    <Chip 
                      label="استخدام فوری" 
                      size="small" 
                      sx={{ 
                        position: 'absolute',
                        top: 15,
                        left: 15,
                        fontSize: '0.65rem', 
                        height: 24, 
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        color: '#d32f2f',
                        fontWeight: 'bold'
                      }} 
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
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
            مشاهده همه فرصت‌های شغلی
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 