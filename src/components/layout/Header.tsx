'use client'

import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Avatar,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  Popover,
  Grid,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LoginIcon from '@mui/icons-material/Login';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SearchIcon from '@mui/icons-material/Search';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CategoryIcon from '@mui/icons-material/Category';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [employerAnchorEl, setEmployerAnchorEl] = useState<null | HTMLElement>(null);
  const [candidateAnchorEl, setCandidateAnchorEl] = useState<null | HTMLElement>(null);
  const [isEmployerHovered, setIsEmployerHovered] = useState(false);
  const [isCandidateHovered, setIsCandidateHovered] = useState(false);
  
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setExpandedMobileMenu(null);
  };

  const handleEmployerMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setCandidateAnchorEl(null);
    setIsCandidateHovered(false);
    setEmployerAnchorEl(event.currentTarget);
    setIsEmployerHovered(true);
  };

  const handleEmployerMouseLeave = () => {
    setIsEmployerHovered(false);
  };

  const handleCandidateMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setEmployerAnchorEl(null);
    setIsEmployerHovered(false);
    setCandidateAnchorEl(event.currentTarget);
    setIsCandidateHovered(true);
  };

  const handleCandidateMouseLeave = () => {
    setIsCandidateHovered(false);
  };

  const handlePopoverMouseEnter = (type: 'employer' | 'candidate') => {
    if (type === 'employer') {
      setIsCandidateHovered(false);
      setIsEmployerHovered(true);
    } else {
      setIsEmployerHovered(false);
      setIsCandidateHovered(true);
    }
  };

  const handlePopoverMouseLeave = (type: 'employer' | 'candidate') => {
    if (type === 'employer') {
      setIsEmployerHovered(false);
    } else {
      setIsCandidateHovered(false);
    }
  };

  const toggleMobileMenu = (menuName: string) => {
    setExpandedMobileMenu(expandedMobileMenu === menuName ? null : menuName);
  };

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام فریلنسرها', 
      icon: <PeopleOutlineIcon sx={{ fontSize: '2.5rem', color: theme.palette.primary.main }} />, 
      href: '#',
      description: 'فریلنسرهای فعال در ماهرکار را مشاهده کرده و براساس مهارت مورد نظر خود انتخاب کنید.'
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <CategoryIcon sx={{ fontSize: '2.5rem', color: theme.palette.primary.main }} />, 
      href: '#',
      description: 'مهارت مورد نظر را جستجو کرده، پروژه یا نمونه کار را در این دسته‌بندی مشاهده کنید.'
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <AddCircleOutlineIcon sx={{ fontSize: '2.5rem', color: theme.palette.primary.main }} />, 
      href: '#',
      description: 'با ایجاد پروژه امکان همکاری با هزاران نیروی متخصص را خواهید داشت.'
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <WorkIcon sx={{ fontSize: '2.5rem', color: theme.palette.secondary.main }} />, 
      href: '#',
      description: 'آخرین فرصت‌های شغلی مناسب با تخصص شما'
    },
    { 
      title: 'ارسال رزومه', 
      icon: <AssignmentIcon sx={{ fontSize: '2.5rem', color: theme.palette.secondary.main }} />, 
      href: '#',
      description: 'رزومه خود را آماده کنید و به کارفرمایان معتبر ارسال کنید'
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <PersonAddIcon sx={{ fontSize: '2.5rem', color: theme.palette.secondary.main }} />, 
      href: '#',
      description: 'پروفایل حرفه‌ای خود را تکمیل کنید تا شانس استخدام افزایش یابد'
    }
  ];

  const navItems = [
    { 
      title: 'کارفرما هستم', 
      color: 'employer', 
      href: '#', 
      variant: 'text', 
      icon: <WorkOutlineIcon fontSize="small" />,
      hasSubmenu: true,
      handleMouseEnter: handleEmployerMouseEnter,
      handleMouseLeave: handleEmployerMouseLeave,
      menuItems: employerMenuItems,
      menuId: 'employer-menu'
    },
    { 
      title: 'فریلنسر هستم', 
      color: 'candidate', 
      href: '#', 
      variant: 'text', 
      icon: <EngineeringIcon fontSize="small" />,
      hasSubmenu: true,
      handleMouseEnter: handleCandidateMouseEnter,
      handleMouseLeave: handleCandidateMouseLeave,
      menuItems: candidateMenuItems,
      menuId: 'candidate-menu'
    },
    { 
      title: 'راهنما', 
      color: 'inherit', 
      href: '#', 
      variant: 'text', 
      icon: <HelpOutlineIcon fontSize="small" />,
      hasSubmenu: false
    },
    { 
      title: 'ورود / ثبت‌نام', 
      color: 'primary', 
      href: '#', 
      variant: 'contained', 
      icon: <LoginIcon fontSize="small" />,
      hasSubmenu: false
    }
  ];

  const drawer = (
    <Box sx={{ textAlign: 'center', pt: 1, pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
        <Typography variant="h5" component="div" 
          sx={{ 
            fontWeight: 800, 
            color: theme.palette.primary.main,
            backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}
        >
          ماهرکار
        </Typography>
        <IconButton
          color="inherit"
          aria-label="close drawer"
          edge="end"
          onClick={handleDrawerToggle}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2, mt: 1 }} />
      <List sx={{ px: 2 }}>
        {navItems.map((item, index) => (
          <Box key={index}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              {item.hasSubmenu ? (
                <ListItemButton 
                  onClick={() => item.menuId && toggleMobileMenu(item.menuId)}
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    justifyContent: 'space-between',
                    ...(item.color === 'employer' && item.variant === 'text' 
                      ? { color: theme.palette.employer.main } 
                      : {}),
                    ...(item.color === 'candidate' && item.variant === 'text' 
                      ? { color: theme.palette.candidate.main } 
                      : {}),
                    ...(item.variant === 'contained' 
                      ? { 
                          bgcolor: item.color === 'primary' 
                            ? theme.palette.primary.main 
                            : item.color === 'employer'
                              ? theme.palette.employer.main
                              : theme.palette.candidate.main,
                          color: '#fff',
                        } 
                      : {})
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon && <Box sx={{ ml: 1 }}>{item.icon}</Box>}
                    <ListItemText primary={item.title} />
                  </Box>
                  {expandedMobileMenu === item.menuId ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </ListItemButton>
              ) : (
                <ListItemButton 
                  component="a" 
                  href={item.href}
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    ...(item.variant === 'contained' 
                      ? { 
                          bgcolor: item.color === 'primary' 
                            ? theme.palette.primary.main 
                            : item.color === 'employer'
                              ? theme.palette.employer.main
                              : theme.palette.candidate.main,
                          color: '#fff',
                        } 
                      : {}),
                    ...(item.color === 'employer' && item.variant === 'text' 
                      ? { color: theme.palette.employer.main } 
                      : {}),
                    ...(item.color === 'candidate' && item.variant === 'text' 
                      ? { color: theme.palette.candidate.main } 
                      : {})
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon && <Box sx={{ ml: 1 }}>{item.icon}</Box>}
                    <ListItemText primary={item.title} />
                  </Box>
                </ListItemButton>
              )}
            </ListItem>
            
            {item.hasSubmenu && (
              <Collapse in={expandedMobileMenu === item.menuId} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ mt: 1, mb: 2, pr: 2 }}>
                  {item.menuItems && item.menuItems.map((subItem, subIndex) => (
                    <ListItem key={subIndex} dense disablePadding>
                      <ListItemButton 
                        component="a"
                        href={subItem.href}
                        sx={{ 
                          py: 1,
                          borderRadius: 1,
                          bgcolor: `${item.color === 'employer' 
                            ? theme.palette.employer.main 
                            : theme.palette.candidate.main}05`,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={subItem.title}
                          secondary={subItem.description}
                          primaryTypographyProps={{ fontWeight: 'bold' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      color="default"
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        '&.MuiPaper-root': {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: { xs: 'center', md: 'space-between' }, px: { xs: 0, sm: 2 }, position: 'relative' }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '1.5rem', md: '1.8rem' },
              backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              position: { xs: 'absolute', md: 'static' },
              right: { xs: '50%', md: 'auto' },
              transform: { xs: 'translateX(50%)', md: 'none' }
            }}
          >
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              ماهرکار
            </Link>
          </Typography>

          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 2.5,
            ml: { md: 2 }
          }}>
            {navItems.map((item, index) => (
              <Box key={index}>
                {item.hasSubmenu ? (
                  <Box>
                    <Button 
                      aria-owns={item.color === 'employer' && isEmployerHovered ? 'employer-menu' : item.color === 'candidate' && isCandidateHovered ? 'candidate-menu' : undefined}
                      aria-haspopup="true"
                      variant={item.variant as "text" | "contained" | "outlined"}
                      onMouseEnter={item.handleMouseEnter}
                      onMouseLeave={item.handleMouseLeave}
                      color={item.color === 'employer' 
                        ? 'primary' 
                        : item.color === 'candidate' 
                          ? 'secondary' 
                          : (item.color as any)}
                      startIcon={item.icon}
                      endIcon={<KeyboardArrowDownIcon />}
                      sx={{ 
                        borderRadius: '10px',
                        fontWeight: 600,
                        px: item.variant === 'contained' ? 2.5 : 1.5,
                        py: item.variant === 'contained' ? 1 : 0.75,
                        minWidth: item.variant === 'contained' ? 140 : 'auto',
                        ...(item.color === 'employer' && item.variant === 'text' 
                          ? { 
                              color: theme.palette.employer.main,
                              border: '1px solid transparent',
                              '&:hover': {
                                backgroundColor: `${theme.palette.employer.main}10`,
                                border: `1px solid ${theme.palette.employer.main}30`,
                              }
                            } 
                          : {}),
                        ...(item.color === 'candidate' && item.variant === 'text' 
                          ? { 
                              color: theme.palette.candidate.main,
                              border: '1px solid transparent',
                              '&:hover': {
                                backgroundColor: `${theme.palette.candidate.main}10`,
                                border: `1px solid ${theme.palette.candidate.main}30`,
                              }
                            } 
                          : {}),
                        ...(item.color === 'inherit' && item.variant === 'text' 
                          ? { 
                              color: theme.palette.text.secondary,
                              border: '1px solid transparent',
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}05`,
                                border: `1px solid ${theme.palette.divider}`,
                              }
                            } 
                          : {}),
                        ...(item.variant === 'contained'
                          ? {
                              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                              '&:hover': {
                                boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                              }
                            }
                          : {})
                      }}
                    >
                      {item.title}
                    </Button>
                  </Box>
                ) : (
                  <Button 
                    variant={item.variant as "text" | "contained" | "outlined"}
                    color={item.color === 'employer' 
                      ? 'primary' 
                      : item.color === 'candidate' 
                        ? 'secondary' 
                        : (item.color as any)}
                    component="a"
                    href={item.href}
                    startIcon={item.icon}
                    sx={{ 
                      borderRadius: '10px',
                      fontWeight: 600,
                      px: item.variant === 'contained' ? 2.5 : 1.5,
                      py: item.variant === 'contained' ? 1 : 0.75,
                      minWidth: item.variant === 'contained' ? 140 : 'auto',
                      ...(item.color === 'employer' && item.variant === 'text' 
                        ? { 
                            color: theme.palette.employer.main,
                            border: '1px solid transparent',
                            '&:hover': {
                              backgroundColor: `${theme.palette.employer.main}10`,
                              border: `1px solid ${theme.palette.employer.main}30`,
                            }
                          } 
                        : {}),
                      ...(item.color === 'candidate' && item.variant === 'text' 
                        ? { 
                            color: theme.palette.candidate.main,
                            border: '1px solid transparent',
                            '&:hover': {
                              backgroundColor: `${theme.palette.candidate.main}10`,
                              border: `1px solid ${theme.palette.candidate.main}30`,
                            }
                          } 
                        : {}),
                      ...(item.color === 'inherit' && item.variant === 'text' 
                        ? { 
                            color: theme.palette.text.secondary,
                            border: '1px solid transparent',
                            '&:hover': {
                              backgroundColor: `${theme.palette.primary.main}05`,
                              border: `1px solid ${theme.palette.divider}`,
                            }
                          } 
                        : {}),
                      ...(item.variant === 'contained'
                        ? {
                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                            '&:hover': {
                              boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                            }
                          }
                        : {})
                    }}
                  >
                    {item.title}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
          
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ 
              display: { md: 'none' },
              position: { xs: 'absolute', md: 'static' },
              left: { xs: 16, md: 'auto' },
              top: '50%',
              transform: { xs: 'translateY(-50%)', md: 'none' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* منوی کارفرما */}
      <Popover
        id="employer-menu"
        open={isEmployerHovered}
        anchorEl={employerAnchorEl}
        onClose={() => setIsEmployerHovered(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('employer'),
            onMouseLeave: () => handlePopoverMouseLeave('employer'),
            sx: {
              mt: 1.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 250,
              pointerEvents: 'auto',
              overflow: 'visible',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                height: 10,
              },
            }
          }
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {employerMenuItems.map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                }}
              >
                <Box
                  component="a"
                  href={item.href}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    p: 2,
                    borderRadius: 2,
                    height: '100%',
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}08`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ ml: 2 }}>{item.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" fontSize="1.1rem">
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Popover>

      {/* منوی کارجو */}
      <Popover
        id="candidate-menu"
        open={isCandidateHovered}
        anchorEl={candidateAnchorEl}
        onClose={() => setIsCandidateHovered(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('candidate'),
            onMouseLeave: () => handlePopoverMouseLeave('candidate'),
            sx: {
              mt: 1.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 250,
              pointerEvents: 'auto',
              overflow: 'visible',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                height: 10,
              },
            }
          }
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {candidateMenuItems.map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                }}
              >
                <Box
                  component="a"
                  href={item.href}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    p: 2,
                    borderRadius: 2,
                    height: '100%',
                    '&:hover': {
                      backgroundColor: `${theme.palette.secondary.main}08`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ ml: 2 }}>{item.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" fontSize="1.1rem">
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Popover>

      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
} 