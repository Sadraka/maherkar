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
  Button,
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
import { useState, useEffect } from 'react';

export default function MobileMenu() {
  const theme = useTheme();
  const { 
    isMobile,
    mobileOpen,
    setMobileOpen,
    handleDrawerToggle,
  } = useHeaderContext();

  // حالت‌های آکاردئون
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
      icon: <FontAwesomeIcon icon={faUsers} style={{ fontSize: '0.8rem', color: theme.palette.employer.main }} />, 
      href: '#',
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} style={{ fontSize: '0.8rem', color: theme.palette.employer.main }} />, 
      href: '#',
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.8rem', color: theme.palette.employer.main }} />, 
      href: '#',
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '0.8rem', color: theme.palette.candidate.main }} />, 
      href: '#',
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '0.8rem', color: theme.palette.candidate.main }} />, 
      href: '#',
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '0.8rem', color: theme.palette.candidate.main }} />, 
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
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.employer.main, 0.15),
                  mr: 2
                }}
              >
                <FontAwesomeIcon 
                  icon={faBuilding} 
                  style={{ 
                    fontSize: '0.9rem', 
                    color: theme.palette.employer.main
                  }} 
                />
              </Box>
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
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.employer.main, 0.12),
                    }}
                  >
                    {item.icon}
                  </Box>
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
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.candidate.main, 0.15),
                  mr: 2
                }}
              >
                <FontAwesomeIcon 
                  icon={faUserTie} 
                  style={{ 
                    fontSize: '0.9rem', 
                    color: theme.palette.candidate.main
                  }} 
                />
              </Box>
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
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.candidate.main, 0.12),
                    }}
                  >
                    {item.icon}
                  </Box>
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
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  mr: 2
                }}
              >
                <FontAwesomeIcon 
                  icon={faHeadset} 
                  style={{ 
                    fontSize: '0.9rem', 
                    color: theme.palette.primary.main
                  }} 
                />
              </Box>
              <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>ارتباط با پشتیبانی</Typography>
            </Box>
          </ListItemButton>
        </Box>
      </Box>
    );
  };

  if (!isMobile) return null;

  // محاسبه ارتفاع مناسب برای منو با توجه به وجود Promobar
  const headerHeight = { xs: '112px', sm: '120px' }; // ارتفاع هدر + ارتفاع Promobar

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
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '100%',
            top: headerHeight,
            maxHeight: { xs: `calc(100% - ${headerHeight.xs})`, sm: `calc(100% - ${headerHeight.sm})` },
            boxShadow: 'none',
            borderTop: '1px solid',
            borderColor: 'divider',
            overflowY: 'auto'
          }
        }}
      >
        {accordionMenu()}
      </Drawer>
    </>
  );
} 