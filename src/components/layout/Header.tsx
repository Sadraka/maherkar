'use client'

import { useState, useEffect, useRef } from 'react';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie, 
  faCode, 
  faQuestionCircle, 
  faSignInAlt, 
  faUsers, 
  faProjectDiagram, 
  faPlus,
  faBriefcase,
  faFileAlt,
  faUserPlus,
  faChevronUp, 
  faChevronDown,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const employerButtonRef = useRef<HTMLButtonElement>(null);
  const candidateButtonRef = useRef<HTMLButtonElement>(null);
  
  const [employerAnchorEl, setEmployerAnchorEl] = useState<null | HTMLElement>(null);
  const [candidateAnchorEl, setCandidateAnchorEl] = useState<null | HTMLElement>(null);
  const [isEmployerHovered, setIsEmployerHovered] = useState(false);
  const [isCandidateHovered, setIsCandidateHovered] = useState(false);
  
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setExpandedMobileMenu(null);
  };

  const handleEmployerMouseEnter = () => {
    if (isMobile) return;
    setCandidateAnchorEl(null);
    setIsCandidateHovered(false);
    setEmployerAnchorEl(employerButtonRef.current);
    setIsEmployerHovered(true);
  };

  const handleEmployerMouseLeave = () => {
    if (isMobile) return;
    setTimeout(() => {
      const employerMenu = document.getElementById('employer-menu-content');
      const isOverEmployerMenu = employerMenu ? employerMenu.matches(':hover') : false;
      
      if (!isOverEmployerMenu && employerButtonRef.current && !employerButtonRef.current.matches(':hover')) {
        setIsEmployerHovered(false);
      }
    }, 50);
  };

  const handleCandidateMouseEnter = () => {
    if (isMobile) return;
    setEmployerAnchorEl(null);
    setIsEmployerHovered(false);
    setCandidateAnchorEl(candidateButtonRef.current);
    setIsCandidateHovered(true);
  };

  const handleCandidateMouseLeave = () => {
    if (isMobile) return;
    setTimeout(() => {
      const candidateMenu = document.getElementById('candidate-menu-content');
      const isOverCandidateMenu = candidateMenu ? candidateMenu.matches(':hover') : false;
      
      if (!isOverCandidateMenu && candidateButtonRef.current && !candidateButtonRef.current.matches(':hover')) {
        setIsCandidateHovered(false);
      }
    }, 50);
  };

  const handlePopoverMouseEnter = (type: 'employer' | 'candidate') => {
    if (type === 'employer') {
      setCandidateAnchorEl(null);
      setIsCandidateHovered(false);
      setIsEmployerHovered(true);
    } else {
      setEmployerAnchorEl(null);
      setIsEmployerHovered(false);
      setIsCandidateHovered(true);
    }
  };

  const handlePopoverMouseLeave = (type: 'employer' | 'candidate') => {
    if (type === 'employer') {
      if (employerButtonRef.current && !employerButtonRef.current.matches(':hover')) {
        setIsEmployerHovered(false);
      }
    } else {
      if (candidateButtonRef.current && !candidateButtonRef.current.matches(':hover')) {
        setIsCandidateHovered(false);
      }
    }
  };

  const toggleMobileMenu = (menuName: string) => {
    setExpandedMobileMenu(expandedMobileMenu === menuName ? null : menuName);
  };

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

  const navItems = [
    { 
      title: 'کارفرما هستم', 
      color: 'employer', 
      href: '#', 
      variant: 'text', 
      icon: <FontAwesomeIcon icon={faUserTie} />,
      hasSubmenu: true,
      menuItems: employerMenuItems,
      menuId: 'employer-menu',
      buttonRef: employerButtonRef
    },
    { 
      title: 'کارجو هستم', 
      color: 'candidate', 
      href: '#', 
      variant: 'text', 
      icon: <FontAwesomeIcon icon={faUserTie} />,
      hasSubmenu: true,
      menuItems: candidateMenuItems,
      menuId: 'candidate-menu',
      buttonRef: candidateButtonRef
    },
    { 
      title: 'راهنما', 
      color: 'inherit', 
      href: '#', 
      variant: 'text', 
      icon: <FontAwesomeIcon icon={faQuestionCircle} />,
      hasSubmenu: false
    },
    { 
      title: 'ورود / ثبت‌نام', 
      color: 'primary', 
      href: '#', 
      variant: 'contained', 
      icon: <FontAwesomeIcon icon={faSignInAlt} />,
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
                      ref={item.buttonRef}
                      variant={item.variant as "text" | "contained" | "outlined"}
                      onMouseEnter={item.menuId === 'employer-menu' ? handleEmployerMouseEnter : handleCandidateMouseEnter}
                      onMouseLeave={item.menuId === 'employer-menu' ? handleEmployerMouseLeave : handleCandidateMouseLeave}
                      color={item.color === 'employer' 
                        ? 'primary' 
                        : item.color === 'candidate' 
                          ? 'secondary' 
                          : (item.color as any)}
                      startIcon={item.icon}
                      endIcon={
                        (item.menuId === 'employer-menu' && isEmployerHovered) || 
                        (item.menuId === 'candidate-menu' && isCandidateHovered) ? 
                          <FontAwesomeIcon icon={faChevronUp} /> : 
                          <FontAwesomeIcon icon={faChevronDown} />
                      }
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
        disableRestoreFocus
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('employer'),
            onMouseLeave: () => handlePopoverMouseLeave('employer'),
            sx: {
              mt: 0.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 250,
              overflow: 'visible',
              pointerEvents: 'auto',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                height: 10,
                backgroundColor: 'transparent',
                zIndex: 1,
              },
            }
          }
        }}
      >
        <Paper id="employer-menu-content" sx={{ p: 4, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {employerMenuItems.map((item, index) => (
              <Box 
                key={index.toString()} 
                sx={{ 
                  width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                  display: 'flex',
                  flexDirection: 'column'
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
                    p: 2.5,
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}05`,
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" align="center" fontWeight="bold" fontSize="1.1rem" mb={1.5}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem" align="center">
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
        disableRestoreFocus
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('candidate'),
            onMouseLeave: () => handlePopoverMouseLeave('candidate'),
            sx: {
              mt: 0.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 250,
              overflow: 'visible',
              pointerEvents: 'auto',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                height: 10,
                backgroundColor: 'transparent',
                zIndex: 1,
              },
            }
          }
        }}
      >
        <Paper id="candidate-menu-content" sx={{ p: 4, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {candidateMenuItems.map((item, index) => (
              <Box 
                key={index.toString()} 
                sx={{ 
                  width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                  display: 'flex',
                  flexDirection: 'column'
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
                    p: 2.5,
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: `${theme.palette.secondary.main}05`,
                      borderColor: theme.palette.secondary.main,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" align="center" fontWeight="bold" fontSize="1.1rem" mb={1.5}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem" align="center">
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