'use client'

import { 
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  useTheme,
  alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  faHeadset
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';

export default function MobileMenu() {
  const theme = useTheme();
  const { 
    isMobile,
    mobileOpen,
    setMobileOpen,
  } = useHeaderContext();

  // رفرنس به هدر برای محاسبه ارتفاع
  const [headerHeight, setHeaderHeight] = useState<number>(60);
  
  // وضعیت باز و بسته شدن منوها
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({
    employer: false,
    candidate: false,
  });

  // تغییر وضعیت نمایش هر منو
  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // محاسبه ارتفاع واقعی هدر شامل PromoBar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const calculateHeaderHeight = () => {
        // پیدا کردن هدر و محاسبه ارتفاع کل
        const header = document.querySelector('header') || document.querySelector('.MuiAppBar-root');
        if (header) {
          const headerRect = header.getBoundingClientRect();
          const totalHeight = headerRect.bottom;
          setHeaderHeight(totalHeight);
        }
      };

      // محاسبه اولیه
      calculateHeaderHeight();
      
      // هنگام اسکرول مجدداً محاسبه کنید
      const handleScroll = () => {
        calculateHeaderHeight();
      };

      // هنگام تغییر اندازه پنجره مجدداً محاسبه کنید
      const handleResize = () => {
        calculateHeaderHeight();
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [mobileOpen]);

  // ریست حالت منو هنگام بستن
  useEffect(() => {
    if (!mobileOpen) {
      setExpandedMenus({
        employer: false,
        candidate: false,
      });
    }
  }, [mobileOpen]);

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام کارجویان', 
      icon: <FontAwesomeIcon icon={faUsers} style={{ fontSize: '1rem', width: '20px', height: '20px', color: theme.palette.employer.main }} />, 
      href: '#',
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} style={{ fontSize: '1rem', width: '20px', height: '20px', color: theme.palette.employer.main }} />, 
      href: '#',
    },
    { 
      title: 'ثبت سریع آگهی', 
      icon: <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem', width: '20px', height: '20px', color: theme.palette.employer.main }} />, 
      href: '#',
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '1rem', width: '20px', height: '20px', color: theme.palette.candidate.main }} />, 
      href: '#',
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '1rem', width: '20px', height: '20px', color: theme.palette.candidate.main }} />, 
      href: '#',
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '1rem', width: '20px', height: '20px', color: theme.palette.candidate.main }} />, 
      href: '#',
    }
  ];

  // محتوای منوی آکاردئونی
  const accordionMenu = () => {
    return (
      <Box sx={{ p: 2, pb: 10 }}>
        {/* کارفرما هستم */}
        <Box sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => toggleMenu('employer')}
            sx={{
              borderRadius: '8px',
              py: 1.5,
              backgroundColor: expandedMenus.employer ? alpha(theme.palette.employer.main, 0.05) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.employer.main, 0.1)
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FontAwesomeIcon 
                icon={faBuilding} 
                style={{ 
                  fontSize: '1.2rem', 
                  width: '22px',
                  height: '22px',
                  color: theme.palette.employer.main,
                  marginLeft: '4px',
                  marginRight: '12px'
                }} 
              />
              <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>کارفرما هستم</Typography>
              {expandedMenus.employer ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
          </ListItemButton>
          
          <Collapse in={expandedMenus.employer} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {employerMenuItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  component="a"
                  href={item.href}
                  sx={{ 
                    py: 1,
                    px: 2,
                    pl: 4,
                    borderRadius: '8px',
                    ml: 4,
                    my: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  {item.icon}
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 400 
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>

        {/* کارجو هستم */}
        <Box sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => toggleMenu('candidate')}
            sx={{
              borderRadius: '8px',
              py: 1.5,
              backgroundColor: expandedMenus.candidate ? alpha(theme.palette.candidate.main, 0.05) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.candidate.main, 0.1)
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FontAwesomeIcon 
                icon={faUserTie} 
                style={{ 
                  fontSize: '1.2rem', 
                  width: '22px',
                  height: '22px',
                  color: theme.palette.candidate.main,
                  marginLeft: '4px',
                  marginRight: '12px'
                }} 
              />
              <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>کارجو هستم</Typography>
              {expandedMenus.candidate ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
          </ListItemButton>
          
          <Collapse in={expandedMenus.candidate} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {candidateMenuItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  component="a"
                  href={item.href}
                  sx={{ 
                    py: 1,
                    px: 2,
                    pl: 4,
                    borderRadius: '8px',
                    ml: 4,
                    my: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  {item.icon}
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 400 
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>

        {/* ارتباط با پشتیبانی */}
        <Box sx={{ mb: 1 }}>
          <ListItemButton
            component="a"
            href="/support"
            sx={{
              borderRadius: '8px',
              py: 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FontAwesomeIcon 
                icon={faHeadset} 
                style={{ 
                  fontSize: '1.2rem', 
                  width: '22px',
                  height: '22px',
                  color: theme.palette.primary.main,
                  marginLeft: '4px',
                  marginRight: '12px'
                }} 
              />
              <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>ارتباط با پشتیبانی</Typography>
            </Box>
          </ListItemButton>
        </Box>
      </Box>
    );
  };

  if (!isMobile) return null;

  return (
    <>
      {/* منوی موبایل */}
      <Drawer
        anchor="top"
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        SlideProps={{
          timeout: 0
        }}
        hideBackdrop={false}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: 1099,
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '100%',
            position: 'fixed',
            top: `${headerHeight}px`,
            height: `calc(100vh - ${headerHeight}px)`,
            maxHeight: 'none',
            boxShadow: 'none',
            borderTop: '1px solid',
            borderColor: 'divider',
            overflowY: 'auto'
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            marginTop: `${headerHeight}px`,
          }
        }}
      >
        {accordionMenu()}
      </Drawer>
    </>
  );
} 