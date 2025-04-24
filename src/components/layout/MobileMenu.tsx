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
  ListItemIcon,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  useTheme
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
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

export default function MobileMenu() {
  const theme = useTheme();
  const { 
    isMobile,
    mobileOpen,
    setMobileOpen,
    mobileView,
    handleMobileNavigation,
  } = useHeaderContext();

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام کارجویان', 
      icon: <FontAwesomeIcon icon={faUsers} size="2x" color={theme.palette.primary.main} />, 
      href: '#',
      description: 'کارجویان فعال در ماهرکار را مشاهده کرده و براساس مهارت مورد نظر خود انتخاب کنید.'
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} size="2x" color={theme.palette.primary.main} />, 
      href: '#',
      description: 'مهارت مورد نظر را جستجو کرده، پروژه یا نمونه کار را در این دسته‌بندی مشاهده کنید.'
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <FontAwesomeIcon icon={faPlus} size="2x" color={theme.palette.primary.main} />, 
      href: '#',
      description: 'با ایجاد پروژه امکان همکاری با هزاران نیروی متخصص را خواهید داشت.'
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} size="2x" color={theme.palette.secondary.main} />, 
      href: '#',
      description: 'آخرین فرصت‌های شغلی مناسب با تخصص شما'
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} size="2x" color={theme.palette.secondary.main} />, 
      href: '#',
      description: 'رزومه خود را آماده کنید و به کارفرمایان معتبر ارسال کنید'
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} size="2x" color={theme.palette.secondary.main} />, 
      href: '#',
      description: 'پروفایل حرفه‌ای خود را تکمیل کنید تا شانس استخدام افزایش یابد'
    }
  ];

  // محتوای منو بر اساس حالت انتخاب شده
  const mobileDrawerContent = () => {
    if (mobileView === 'employer') {
      return (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={800} color="employer.main">کارفرما هستم</Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {employerMenuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                <ListItemButton 
                  component="a" 
                  href={item.href}
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ mr: 2 }}>{item.icon}</Box>
                  <ListItemText 
                    primary={item.title} 
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    } else if (mobileView === 'candidate') {
      return (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={800} color="candidate.main">کارجو هستم</Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {candidateMenuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                <ListItemButton 
                  component="a" 
                  href={item.href}
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ mr: 2 }}>{item.icon}</Box>
                  <ListItemText 
                    primary={item.title} 
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    } else if (mobileView === 'help') {
      return (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={800} color="primary.main">راهنما</Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ p: 2 }}>
            محتوای راهنما در این قسمت قرار می‌گیرد.
          </Typography>
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
        anchor="left"
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
            maxHeight: 'calc(100% - 180px)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bottom: 65,
            top: 'auto',
            boxShadow: '0 -8px 25px rgba(0,0,0,0.1)',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)' as any,
          },
        }}
      >
        {mobileDrawerContent()}
      </Drawer>

      {/* نوار ناوبری پایین صفحه برای موبایل */}
      <BottomNavigation
        showLabels
        value={mobileView}
        onChange={(event, newValue) => {
          handleMobileNavigation(newValue);
        }}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 65,
          zIndex: (theme) => theme.zIndex.drawer - 1,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: { xs: 'flex', md: 'none' },
          backgroundColor: 'background.paper',
        }}
      >
        <BottomNavigationAction
          label="کارفرما هستم"
          value="employer"
          sx={{
            color: mobileView === 'employer' ? theme.palette.employer.main : theme.palette.text.secondary,
            fontWeight: 700,
            fontSize: '0.75rem',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 700,
            }
          }}
        />
        <BottomNavigationAction
          label="کارجو هستم"
          value="candidate"
          sx={{
            color: mobileView === 'candidate' ? theme.palette.candidate.main : theme.palette.text.secondary,
            fontWeight: 700,
            fontSize: '0.75rem',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 700,
            }
          }}
        />
        <BottomNavigationAction
          label="راهنما"
          value="help"
          sx={{
            color: mobileView === 'help' ? theme.palette.primary.main : theme.palette.text.secondary,
            fontWeight: 700,
            fontSize: '0.75rem',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 700,
            }
          }}
        />
      </BottomNavigation>
    </>
  );
} 