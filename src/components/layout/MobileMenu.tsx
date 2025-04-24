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
  faQuestion,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function MobileMenu() {
  const theme = useTheme();
  const { 
    isMobile,
    mobileOpen,
    setMobileOpen,
    mobileView,
    handleMobileNavigation,
  } = useHeaderContext();

  const [activeIndex, setActiveIndex] = useState(-1);

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام کارجویان', 
      icon: <FontAwesomeIcon icon={faUsers} size="lg" />, 
      href: '#',
      description: 'کارجویان فعال در ماهرکار را مشاهده کرده و براساس مهارت مورد نظر خود انتخاب کنید.',
      color: '#3949AB',
      bgColor: '#3949AB15'
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} size="lg" />, 
      href: '#',
      description: 'مهارت مورد نظر را جستجو کرده، پروژه یا نمونه کار را در این دسته‌بندی مشاهده کنید.',
      color: '#1E88E5',
      bgColor: '#1E88E515'
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <FontAwesomeIcon icon={faPlus} size="lg" />, 
      href: '#',
      description: 'با ایجاد پروژه امکان همکاری با هزاران نیروی متخصص را خواهید داشت.',
      color: '#5E35B1',
      bgColor: '#5E35B115'
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} size="lg" />, 
      href: '#',
      description: 'آخرین فرصت‌های شغلی مناسب با تخصص شما',
      color: '#26A69A',
      bgColor: '#26A69A15'
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} size="lg" />, 
      href: '#',
      description: 'رزومه خود را آماده کنید و به کارفرمایان معتبر ارسال کنید',
      color: '#43A047',
      bgColor: '#43A04715'
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} size="lg" />, 
      href: '#',
      description: 'پروفایل حرفه‌ای خود را تکمیل کنید تا شانس استخدام افزایش یابد',
      color: '#7CB342',
      bgColor: '#7CB34215'
    }
  ];

  // منوی راهنما
  const helpMenuItems = [
    { 
      title: 'راهنمای کارفرمایان', 
      icon: <FontAwesomeIcon icon={faBuilding} size="lg" />, 
      href: '#',
      description: 'آموزش کامل نحوه ثبت پروژه و استخدام کارجو',
      color: '#E53935',
      bgColor: '#E5393515'
    },
    { 
      title: 'راهنمای کارجویان', 
      icon: <FontAwesomeIcon icon={faUserTie} size="lg" />, 
      href: '#',
      description: 'آموزش کامل نحوه ثبت رزومه و یافتن شغل مناسب',
      color: '#F4511E',
      bgColor: '#F4511E15'
    },
    { 
      title: 'سوالات متداول', 
      icon: <FontAwesomeIcon icon={faQuestion} size="lg" />, 
      href: '#',
      description: 'پاسخ به سوالات رایج کاربران',
      color: '#FB8C00',
      bgColor: '#FB8C0015'
    },
    { 
      title: 'نکات و ترفندها', 
      icon: <FontAwesomeIcon icon={faLightbulb} size="lg" />, 
      href: '#',
      description: 'نکات مفید برای موفقیت در ماهرکار',
      color: '#FFB300',
      bgColor: '#FFB30015'
    }
  ];

  // محتوای منو بر اساس حالت انتخاب شده
  const mobileDrawerContent = () => {
    if (mobileView === 'employer') {
      return (
        <Box 
          sx={{ 
            p: 3, 
            background: `linear-gradient(180deg, ${alpha(theme.palette.employer.main, 0.05)} 0%, rgba(255,255,255,0) 100%)`
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
                  bgcolor: alpha(theme.palette.employer.main, 0.1), 
                  color: theme.palette.employer.main,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faBuilding} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color="employer.main">
                کارفرما هستم
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setMobileOpen(false)}
              sx={{ 
                bgcolor: alpha(theme.palette.employer.main, 0.1),
                color: theme.palette.employer.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.employer.main, 0.2),
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
                      background: `linear-gradient(135deg, white 0%, ${item.bgColor} 100%)`,
                      border: '1px solid',
                      borderColor: activeIndex === index ? item.color : 'divider',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ 
                          mr: 2,
                          bgcolor: alpha(item.color, 0.15),
                          color: item.color,
                          boxShadow: activeIndex === index ? `0 4px 8px ${alpha(item.color, 0.25)}` : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight={800} variant="subtitle1" color={item.color} gutterBottom>
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
            background: `linear-gradient(180deg, ${alpha(theme.palette.candidate.main, 0.05)} 0%, rgba(255,255,255,0) 100%)`
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
                  bgcolor: alpha(theme.palette.candidate.main, 0.1), 
                  color: theme.palette.candidate.main,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faUserTie} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color="candidate.main">
                کارجو هستم
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setMobileOpen(false)}
              sx={{ 
                bgcolor: alpha(theme.palette.candidate.main, 0.1),
                color: theme.palette.candidate.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.candidate.main, 0.2),
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
                      background: `linear-gradient(135deg, white 0%, ${item.bgColor} 100%)`,
                      border: '1px solid',
                      borderColor: activeIndex === index ? item.color : 'divider',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ 
                          mr: 2,
                          bgcolor: alpha(item.color, 0.15),
                          color: item.color,
                          boxShadow: activeIndex === index ? `0 4px 8px ${alpha(item.color, 0.25)}` : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight={800} variant="subtitle1" color={item.color} gutterBottom>
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
    } else if (mobileView === 'help') {
      return (
        <Box 
          sx={{ 
            p: 3, 
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, rgba(255,255,255,0) 100%)`
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
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: theme.palette.primary.main,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faQuestion} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                راهنما
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setMobileOpen(false)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <List sx={{ px: 0 }}>
            {helpMenuItems.map((item, index) => (
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
                      background: `linear-gradient(135deg, white 0%, ${item.bgColor} 100%)`,
                      border: '1px solid',
                      borderColor: activeIndex === index ? item.color : 'divider',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ 
                          mr: 2,
                          bgcolor: alpha(item.color, 0.15),
                          color: item.color,
                          boxShadow: activeIndex === index ? `0 4px 8px ${alpha(item.color, 0.25)}` : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight={800} variant="subtitle1" color={item.color} gutterBottom>
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

  if (!isMobile) return null;

  return (
    <>
      {/* منوی موبایل */}
      <Drawer
        anchor="bottom"
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '100%',
            height: 'auto',
            maxHeight: 'calc(100% - 65px)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bottom: 0,
            top: 'auto',
            boxShadow: '0 -8px 25px rgba(0,0,0,0.1)',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'none',
          },
          '& .MuiPaper-root': {
            transform: 'translateY(0) !important',
            transition: 'transform 0.3s ease-out !important',
            '&.MuiDrawer-paperAnchorBottom': {
              transform: 'translateY(100%) !important',
            }
          }
        }}
        transitionDuration={300}
        SlideProps={{
          appear: true,
          direction: "up",
          easing: { enter: 'cubic-bezier(0.4, 0, 0.2, 1)', exit: 'cubic-bezier(0.4, 0, 0.2, 1)' }
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
          zIndex: (theme) => theme.zIndex.drawer - 1,
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <BottomNavigation
          showLabels
          value={mobileView}
          onChange={(event, newValue) => {
            handleMobileNavigation(newValue);
            setActiveIndex(-1);
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
                invisible={mobileView !== 'employer'}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: theme.palette.employer.main,
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: mobileView === 'employer' 
                      ? alpha(theme.palette.employer.main, 0.15) 
                      : alpha(theme.palette.text.secondary, 0.05),
                    color: mobileView === 'employer' 
                      ? theme.palette.employer.main 
                      : theme.palette.text.secondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faBuilding} size="sm" />
                </Avatar>
              </Badge>
            }
            sx={{
              color: mobileView === 'employer' ? theme.palette.employer.main : theme.palette.text.secondary,
              fontWeight: 800,
              fontSize: '0.75rem',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 800,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: mobileView === 'employer' ? 'translateY(1px) scale(1.05)' : 'translateY(0) scale(1)',
                opacity: mobileView === 'employer' ? 1 : 0.7,
              }
            }}
          />
          <BottomNavigationAction
            label="کارجو هستم"
            value="candidate"
            icon={
              <Badge
                variant="dot"
                invisible={mobileView !== 'candidate'}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: theme.palette.candidate.main,
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: mobileView === 'candidate' 
                      ? alpha(theme.palette.candidate.main, 0.15) 
                      : alpha(theme.palette.text.secondary, 0.05),
                    color: mobileView === 'candidate' 
                      ? theme.palette.candidate.main 
                      : theme.palette.text.secondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faUserTie} size="sm" />
                </Avatar>
              </Badge>
            }
            sx={{
              color: mobileView === 'candidate' ? theme.palette.candidate.main : theme.palette.text.secondary,
              fontWeight: 800,
              fontSize: '0.75rem',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 800,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: mobileView === 'candidate' ? 'translateY(1px) scale(1.05)' : 'translateY(0) scale(1)',
                opacity: mobileView === 'candidate' ? 1 : 0.7,
              }
            }}
          />
          <BottomNavigationAction
            label="راهنما"
            value="help"
            icon={
              <Badge
                variant="dot"
                invisible={mobileView !== 'help'}
                color="primary"
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: mobileView === 'help' 
                      ? alpha(theme.palette.primary.main, 0.15) 
                      : alpha(theme.palette.text.secondary, 0.05),
                    color: mobileView === 'help' 
                      ? theme.palette.primary.main 
                      : theme.palette.text.secondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faQuestion} size="sm" />
                </Avatar>
              </Badge>
            }
            sx={{
              color: mobileView === 'help' ? theme.palette.primary.main : theme.palette.text.secondary,
              fontWeight: 800,
              fontSize: '0.75rem',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 800,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: mobileView === 'help' ? 'translateY(1px) scale(1.05)' : 'translateY(0) scale(1)',
                opacity: mobileView === 'help' ? 1 : 0.7,
              }
            }}
          />
        </BottomNavigation>
      </Paper>
    </>
  );
} 