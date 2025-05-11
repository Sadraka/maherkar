'use client'

import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Stack,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import Link from 'next/link';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import { EMPLOYER_THEME, JOB_SEEKER_THEME } from '@/constants/colors';

export default function Footer() {
  const employerColors = EMPLOYER_THEME;
  const jobSeekerColors = JOB_SEEKER_THEME;

  // لینک‌های دسته‌بندی شده فوتر
  const footerLinks = [
    {
      title: 'کارفرمایان',
      links: [
        { title: 'ثبت آگهی استخدام', url: '#' },
        { title: 'جستجوی رزومه', url: '#' },
        { title: 'ارسال پیام به متخصصین', url: '#' },
        { title: 'راهنمای استخدام', url: '#' }
      ]
    },
    {
      title: 'متخصصین',
      links: [
        { title: 'فرصت‌های شغلی', url: '#' },
        { title: 'ثبت رزومه', url: '#' },
        { title: 'راهنمای کاریابی', url: '#' },
        { title: 'ثبت مهارت‌های پیشرفته', url: '#' }
      ]
    },
    {
      title: 'دسترسی سریع',
      links: [
        { title: 'سوالات متداول', url: '#' },
        { title: 'شرایط و قوانین', url: '/terms' },
        { title: 'حریم خصوصی', url: '/privacy' },
        { title: 'تماس با ما', url: '#' }
      ]
    }
  ];

  // شبکه‌های اجتماعی
  const socialLinks = [
    { icon: <InstagramIcon />, url: '#' },
    { icon: <TelegramIcon />, url: '#' },
    { icon: <LinkedInIcon />, url: '#' },
    { icon: <TwitterIcon />, url: '#' }
  ];

  return (
    <Box 
      component="footer" 
      sx={{ 
        pt: { xs: 2, md: 8 },
        pb: { xs: 10, sm: 6, md: 4 }, 
        backgroundColor: '#fff',
        borderTop: '1px solid #eee',
        boxShadow: 'inset 0 1px 0 0 rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 1, md: 4 }}>
          {/* بخش لوگو و توضیحات */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ 
              mb: 3,
              display: { xs: 'flex', md: 'block' },
              flexDirection: { xs: 'column', md: 'column' },
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'right' }
            }}>
              <Box 
                sx={{ 
                  width: { xs: 90, md: 120 }, 
                  height: { xs: 40, md: 50 },
                  backgroundColor: '#f8f8f8',
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  borderRadius: 1,
                  border: '1px solid #eee'
                }}
              >
                <Typography sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', md: '1rem' }
                }}>لوگو ماهرکار</Typography>
              </Box>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary', 
                lineHeight: 1.7, 
                mt: 2,
                maxWidth: { xs: '80%', md: '100%' },
                display: { xs: 'none', md: 'block' },
                textAlign: 'left',
                width: '100%',
                direction: 'rtl'
              }}>
                ماهرکار، پلتفرم اتصال کارفرمایان و متخصصان برای انجام پروژه‌های دورکاری و استخدامی
              </Typography>
            </Box>

            {/* بخش شبکه‌های اجتماعی - فقط در دسکتاپ */}
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ 
                mt: 3,
                justifyContent: { xs: 'center', md: 'flex-start' },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              {socialLinks.map((social, index) => (
                <IconButton 
                  key={index} 
                  component={Link}
                  href={social.url} 
                  size="small" 
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      color: index % 2 === 0 ? employerColors.primary : jobSeekerColors.primary,
                      backgroundColor: index % 2 === 0 ? employerColors.bgVeryLight : jobSeekerColors.bgVeryLight
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>

            {/* بخش نمادهای اعتماد - فقط در دسکتاپ */}
            <Box sx={{ 
              mt: 4, 
              display: { xs: 'none', md: 'flex' }, 
              flexDirection: 'column', 
              gap: 2,
              alignItems: { xs: 'center', md: 'flex-start' }
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                نمادهای اعتماد
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #eee',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>زرین‌پال</Typography>
                </Paper>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #eee',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>اینماد</Typography>
                </Paper>
              </Box>
            </Box>
          </Grid>

          {/* لینک‌های فوتر */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Grid container spacing={{ xs: 0.5, md: 4 }}>
              {/* دو دسته اول در یک ردیف */}
              {footerLinks.slice(0, 2).map((category, index) => (
                <Grid size={{ xs: 6, sm: 4 }} key={index}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: { xs: 1, md: 3 }, 
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      px: { xs: 1, md: 0 }
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Stack spacing={{ xs: 1, md: 1.5 }} sx={{ px: { xs: 1, md: 0 } }}>
                    {category.links.map((link, linkIndex) => (
                      <Box 
                        key={linkIndex}
                        component={Link}
                        href={link.url} 
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.8rem', md: '0.9rem' },
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            color: index === 0 ? employerColors.primary : (
                              index === 1 ? jobSeekerColors.primary : '#333'
                            ),
                            transform: 'translateX(-2px)'
                          },
                          display: 'inline-block',
                          textDecoration: 'none'
                        }}
                      >
                        {link.title}
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              ))}

              {/* دسته سوم با نمادهای اعتماد */}
              <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* دسته سوم - دسترسی سریع */}
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: { xs: 1, md: 3 }, 
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      px: { xs: 1, md: 0 }
                    }}
                  >
                    {footerLinks[2].title}
                  </Typography>
                  <Stack spacing={{ xs: 1, md: 1.5 }} sx={{ px: { xs: 1, md: 0 } }}>
                    {footerLinks[2].links.map((link, linkIndex) => (
                      <Box 
                        key={linkIndex}
                        component={Link}
                        href={link.url} 
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.8rem', md: '0.9rem' },
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            color: '#333',
                            transform: 'translateX(-2px)'
                          },
                          display: 'inline-block',
                          textDecoration: 'none'
                        }}
                      >
                        {link.title}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              {/* نمادهای اعتماد - فقط در موبایل و تبلت - جدا از دسترسی سریع */}
              <Grid size={{ xs: 6, sm: 4 }} sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column' }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: { xs: 1, md: 3 },
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem' },
                    px: { xs: 1, md: 0 }
                  }}
                >
                  نمادهای اعتماد
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.5,
                  px: { xs: 1, md: 0 }
                }}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        width: 70, 
                        height: 70, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #eee',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>زرین‌پال</Typography>
                    </Paper>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        width: 70, 
                        height: 70, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #eee',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>اینماد</Typography>
                    </Paper>
                  </Box>
                  
                  {/* شبکه‌های اجتماعی در موبایل زیر نمادها */}
                  <Box sx={{ mt: 1 }}>
                    <Stack 
                      direction="row" 
                      spacing={0.5} 
                      sx={{ 
                        justifyContent: 'flex-start',
                      }}
                    >
                      {socialLinks.map((social, index) => (
                        <IconButton 
                          key={index} 
                          component={Link}
                          href={social.url} 
                          size="small" 
                          sx={{ 
                            color: 'text.secondary',
                            padding: '4px',
                            fontSize: '0.9rem',
                            '&:hover': { 
                              color: index % 2 === 0 ? employerColors.primary : jobSeekerColors.primary,
                              backgroundColor: index % 2 === 0 ? employerColors.bgVeryLight : jobSeekerColors.bgVeryLight
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {social.icon}
                        </IconButton>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: { xs: 1, md: 4 }, opacity: 0.6 }} />
        
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-end' },
            textAlign: { xs: 'center', sm: 'right' },
            mt: { xs: 0.5, sm: 2 },
            mb: { xs: 0, sm: 0 },
            position: { xs: 'relative', sm: 'static' },
            bottom: { xs: 0, sm: 'auto' },
            left: { xs: 0, sm: 'auto' },
            right: { xs: 0, sm: 'auto' },
            width: '100%',
            backgroundColor: '#fff',
            py: { xs: 1, sm: 0 }
          }}
        >
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}>
            ماهرکار - تمامی حقوق محفوظ است
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            mt: { xs: 0.5, sm: 0 },
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}>
            طراحی و توسعه توسط تیم ماهرکار
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 