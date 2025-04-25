'use client'

import { 
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  Paper,
  Avatar,
  Badge,
  Tooltip,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faProjectDiagram,
  faPlus,
  faBriefcase,
  faFileAlt,
  faUserPlus,
  faBuilding,
  faUserTie,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import {
  EMPLOYER_BLUE,
  JOB_SEEKER_GREEN
} from '@/constants/colors';

export default function MobileMenu() {
  const theme = useTheme();
  const { 
    isMobile,
    mobileOpen,
    setMobileOpen,
    mobileView,
    setMobileView,
    handleMobileNavigation,
  } = useHeaderContext();

  const [activeIndex, setActiveIndex] = useState(-1);

  // ریست حالت منو هنگام بستن
  useEffect(() => {
    if (!mobileOpen) {
      setActiveIndex(-1);
    }
  }, [mobileOpen]);

  // ریست پارامترها هنگام تغییر منو
  useEffect(() => {
    setActiveIndex(-1);
  }, [mobileView]);

  // تعریف رنگ‌های اصلی برای هر منو - استفاده از ثابت‌های رنگ تعریف شده
  const employerColor = EMPLOYER_BLUE; // '#0a3b79' - سرمه‌ای برای کارفرما
  const candidateColor = JOB_SEEKER_GREEN; // '#00703c' - سبز کارجو

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام کارجویان', 
      icon: <FontAwesomeIcon icon={faUsers} size="lg" />, 
      href: '#',
      description: 'کارجویان فعال در ماهرکار را مشاهده کرده و براساس مهارت مورد نظر خود انتخاب کنید.',
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} size="lg" />, 
      href: '#',
      description: 'مهارت مورد نظر را جستجو کرده، پروژه یا نمونه کار را در این دسته‌بندی مشاهده کنید.',
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <FontAwesomeIcon icon={faPlus} size="lg" />, 
      href: '#',
      description: 'با ایجاد پروژه امکان همکاری با هزاران نیروی متخصص را خواهید داشت.',
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} size="lg" />, 
      href: '#',
      description: 'آخرین فرصت‌های شغلی مناسب با تخصص شما',
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} size="lg" />, 
      href: '#',
      description: 'رزومه خود را آماده کنید و به کارفرمایان معتبر ارسال کنید',
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} size="lg" />, 
      href: '#',
      description: 'پروفایل حرفه‌ای خود را تکمیل کنید تا شانس استخدام افزایش یابد',
    }
  ];

  // محتوای منو بر اساس حالت انتخاب شده
  const mobileDrawerContent = () => {
    if (mobileView === 'employer') {
      return (
        <Box 
          sx={{ 
            p: 3, 
            background: `linear-gradient(180deg, ${alpha(employerColor, 0.05)} 0%, rgba(255,255,255,0) 100%)`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(employerColor, 0.1), 
                  color: employerColor,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faBuilding} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color={employerColor}>
                کارفرما هستم
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setMobileOpen(false)}
              sx={{ 
                bgcolor: alpha(employerColor, 0.1),
                color: employerColor,
                '&:hover': {
                  bgcolor: alpha(employerColor, 0.2),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <List sx={{ px: 0 }}>
            {employerMenuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                <ListItemButton 
                  component="a" 
                  href={item.href}
                  onClick={() => setActiveIndex(index)}
                  sx={{ 
                    p: 0,
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    transform: activeIndex === index ? 'scale(0.98)' : 'scale(1)',
                    '&:active': {
                      transform: 'scale(0.97)',
                    }
                  }}
                >
                  <Paper
                    elevation={activeIndex === index ? 4 : 1}
                    sx={{ 
                      p: 2.5,
                      width: '100%',
                      borderRadius: 3,
                      background: `linear-gradient(135deg, white 0%, ${alpha(employerColor, 0.1)} 100%)`,
                      border: '1px solid',
                      borderColor: activeIndex === index ? employerColor : 'divider',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ 
                          mr: 2,
                          bgcolor: alpha(employerColor, 0.15),
                          color: employerColor,
                          boxShadow: activeIndex === index ? `0 4px 8px ${alpha(employerColor, 0.25)}` : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight={800} variant="subtitle1" color={employerColor} gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    } else if (mobileView === 'candidate') {
      return (
        <Box 
          sx={{ 
            p: 3, 
            background: `linear-gradient(180deg, ${alpha(candidateColor, 0.05)} 0%, rgba(255,255,255,0) 100%)`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(candidateColor, 0.1), 
                  color: candidateColor,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faUserTie} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color={candidateColor}>
                کارجو هستم
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setMobileOpen(false)}
              sx={{ 
                bgcolor: alpha(candidateColor, 0.1),
                color: candidateColor,
                '&:hover': {
                  bgcolor: alpha(candidateColor, 0.2),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <List sx={{ px: 0 }}>
            {candidateMenuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                <ListItemButton 
                  component="a" 
                  href={item.href}
                  onClick={() => setActiveIndex(index)}
                  sx={{ 
                    p: 0,
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    transform: activeIndex === index ? 'scale(0.98)' : 'scale(1)',
                    '&:active': {
                      transform: 'scale(0.97)',
                    }
                  }}
                >
                  <Paper
                    elevation={activeIndex === index ? 4 : 1}
                    sx={{ 
                      p: 2.5,
                      width: '100%',
                      borderRadius: 3,
                      background: `linear-gradient(135deg, white 0%, ${alpha(candidateColor, 0.1)} 100%)`,
                      border: '1px solid',
                      borderColor: activeIndex === index ? candidateColor : 'divider',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ 
                          mr: 2,
                          bgcolor: alpha(candidateColor, 0.15),
                          color: candidateColor,
                          boxShadow: activeIndex === index ? `0 4px 8px ${alpha(candidateColor, 0.25)}` : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight={800} variant="subtitle1" color={candidateColor} gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    }
    
    return null;
  };

  
  const navValue = mobileOpen ? mobileView : '';

  if (!isMobile) return null;

  return (
    <>
      {/* منوی موبایل */}
      <Drawer
        anchor="bottom"
        variant="temporary"
        open={mobileOpen}
        onClose={() => {
          setMobileOpen(false);
          setActiveIndex(-1);
          setMobileView('');
        }}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '100%',
            height: 'auto',
            maxHeight: 'calc(100% - 100px)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            bottom: 40,
            top: 'auto',
            boxShadow: '0 -8px 25px rgba(0,0,0,0.1)',
            zIndex: (theme) => theme.zIndex.drawer,
            pb: 1.5
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'none',
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }
        }}
        SlideProps={{
          direction: "up",
          timeout: {
            enter: 400,
            exit: 300
          }
        }}
      >
        {mobileDrawerContent()}
      </Drawer>

      {/* نوار ناوبری پایین صفحه برای موبایل */}
      <Paper 
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper',
        }}
      >
        <BottomNavigation
          showLabels
          value={navValue}
          onChange={(event, newValue) => {
            handleMobileNavigation(newValue);
          }}
          sx={{
            height: 70,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: { xs: 'flex', md: 'none' },
            backgroundColor: 'background.paper',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              paddingTop: 1.2,
            }
          }}
        >
          <BottomNavigationAction
            label="کارفرما هستم"
            value="employer"
            icon={
              <Badge
                variant="dot"
                invisible={navValue !== 'employer'}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: employerColor,
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: navValue === 'employer' 
                      ? alpha(employerColor, 0.15) 
                      : alpha(theme.palette.text.secondary, 0.05),
                    color: navValue === 'employer' 
                      ? employerColor 
                      : theme.palette.text.secondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faBuilding} size="sm" />
                </Avatar>
              </Badge>
            }
            sx={{
              color: navValue === 'employer' ? employerColor : theme.palette.text.secondary,
              fontWeight: 800,
              fontSize: '0.75rem',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 800,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: navValue === 'employer' ? 'translateY(1px) scale(1.05)' : 'translateY(0) scale(1)',
                opacity: navValue === 'employer' ? 1 : 0.7,
              }
            }}
          />
          <BottomNavigationAction
            label="کارجو هستم"
            value="candidate"
            icon={
              <Badge
                variant="dot"
                invisible={navValue !== 'candidate'}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: candidateColor,
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: navValue === 'candidate' 
                      ? alpha(candidateColor, 0.15) 
                      : alpha(theme.palette.text.secondary, 0.05),
                    color: navValue === 'candidate' 
                      ? candidateColor 
                      : theme.palette.text.secondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faUserTie} size="sm" />
                </Avatar>
              </Badge>
            }
            sx={{
              color: navValue === 'candidate' ? candidateColor : theme.palette.text.secondary,
              fontWeight: 800,
              fontSize: '0.75rem',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 800,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: navValue === 'candidate' ? 'translateY(1px) scale(1.05)' : 'translateY(0) scale(1)',
                opacity: navValue === 'candidate' ? 1 : 0.7,
              }
            }}
          />
        </BottomNavigation>
      </Paper>
    </>
  );
} 