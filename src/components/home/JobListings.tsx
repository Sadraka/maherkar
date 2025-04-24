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
  InputAdornment,
  useTheme
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
  const theme = useTheme();
  
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
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: { xs: 2, md: 0 },
          mb: 4 
        }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.6rem', md: '2rem' },
              color: theme.palette.text.primary
            }}
          >
            فرصت‌های شغلی
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            width: { xs: '100%', md: 'auto' },
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}>
            <TextField
              placeholder="جستجو در مشاغل..."
              size="small"
              sx={{ 
                flex: { xs: 1, md: 'initial' },
                minWidth: { xs: 'auto', md: 250 },
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
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}0a`
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
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}0a`
                }
              }}
            >
              مرتب‌سازی
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '.MuiTab-root': { 
                fontSize: '0.9rem', 
                fontWeight: 500,
                minWidth: 'auto',
                px: 2
              },
              '.MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab label="همه مشاغل" />
            <Tab label="تمام‌وقت" />
            <Tab label="پاره‌وقت" />
            <Tab label="دورکاری" />
            <Tab label="پروژه‌ای" />
          </Tabs>
        </Box>

        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid 
                key={job.id} 
                sx={{ 
                  width: { 
                    xs: '100%', 
                    sm: '50%', 
                    lg: '33.33%' 
                  },
                  px: 1.5
                }}
              >
                <Box sx={{ p: 1.5 }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 2,
                      borderColor: 'transparent',
                      boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        height: '6px', 
                        background: job.isUrgent 
                          ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` 
                          : 'transparent' 
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1, p: 3, '&:last-child': { pb: 3 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography 
                            variant="h6" 
                            component="h3"
                            sx={{ 
                              mb: 0.5, 
                              fontWeight: 'bold', 
                              fontSize: '1.1rem',
                              color: theme.palette.text.primary
                            }}
                          >
                            {job.title}
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              mb: 1.5,
                              color: theme.palette.text.secondary,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <BusinessCenterIcon fontSize="small" sx={{ color: theme.palette.primary.main, opacity: 0.8, fontSize: '1rem' }} />
                            {job.company}
                          </Typography>
                        </Box>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => toggleFavorite(job.id)}
                          sx={{ color: job.isFavorite ? theme.palette.primary.main : '#bdbdbd' }}
                        >
                          {job.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </Box>
                      
                      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            color: theme.palette.text.secondary,
                            fontSize: '0.875rem'
                          }}
                        >
                          <LocationOnOutlinedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {job.location}
                          {job.isRemote && <Chip 
                            label="دورکاری" 
                            size="small" 
                            sx={{ 
                              ml: 1, 
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: `${theme.palette.secondary.main}15`,
                              color: theme.palette.secondary.main,
                              borderRadius: '4px',
                              fontWeight: 'bold'
                            }} 
                          />}
                        </Box>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            color: theme.palette.text.secondary,
                            fontSize: '0.875rem'
                          }}
                        >
                          <AccessTimeOutlinedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {job.timePosted}
                        </Box>
                      </Stack>
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            color: theme.palette.text.secondary,
                            fontSize: '0.875rem'
                          }}
                        >
                          <WorkOutlineIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {job.jobType}
                        </Box>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            color: theme.palette.text.secondary,
                            fontSize: '0.875rem'
                          }}
                        >
                          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {job.salary}
                        </Box>
                      </Stack>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {job.skills.map((skill, index) => (
                            <Chip 
                              key={index} 
                              label={skill} 
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(0,0,0,0.04)',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                borderRadius: 1
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        fullWidth
                        sx={{ 
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}10`,
                            borderColor: theme.palette.primary.main,
                          }
                        }}
                      >
                        مشاهده آگهی
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ 
              px: 4,
              py: 1,
              fontWeight: 'bold',
              borderRadius: 2
            }}
          >
            مشاهده همه آگهی‌ها
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 