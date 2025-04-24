'use client'

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faChevronUp, 
  faChevronDown,
  faQuestion,
  faBuilding,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { useHeaderContext } from '@/contexts/HeaderContext';

// کامپوننت AppBar اصلی
export default function AppHeader() {
  const theme = useTheme();
  const { 
    isMobile,
    mobileOpen,
    handleDrawerToggle,
    employerButtonRef,
    candidateButtonRef,
    helpButtonRef,
    handleEmployerMouseEnter,
    handleEmployerMouseLeave,
    handleCandidateMouseEnter,
    handleCandidateMouseLeave,
    handleHelpMouseEnter,
    handleHelpMouseLeave,
    isEmployerHovered,
    isCandidateHovered,
    isHelpHovered,
  } = useHeaderContext();

  // اطلاعات منوها - با استایل یکسان با منوی موبایل
  const navItems = [
    { 
      title: 'کارفرما هستم', 
      color: 'employer', 
      href: '#', 
      variant: 'text', 
      hasSubmenu: true,
      menuId: 'employer-menu',
      buttonRef: employerButtonRef,
      icon: faBuilding,
      bgColor: alpha(theme.palette.employer.main, 0.15),
      textColor: theme.palette.employer.main
    },
    { 
      title: 'کارجو هستم', 
      color: 'candidate', 
      href: '#', 
      variant: 'text', 
      hasSubmenu: true,
      menuId: 'candidate-menu',
      buttonRef: candidateButtonRef,
      icon: faUserTie,
      bgColor: alpha(theme.palette.candidate.main, 0.15),
      textColor: theme.palette.candidate.main
    },
    { 
      title: 'راهنما', 
      color: 'black',
      href: '#', 
      variant: 'text', 
      hasSubmenu: true,
      menuId: 'help-menu',
      buttonRef: helpButtonRef,
      icon: faQuestion,
      bgColor: alpha('#000000', 0.15),
      textColor: '#000000'
    },
    { 
      title: 'ورود / ثبت‌نام', 
      color: 'primary', 
      href: '#', 
      variant: 'contained', 
      hasSubmenu: false,
      icon: faSignInAlt
    }
  ];

  return (
    <AppBar 
      position="static" 
      color="default"
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        zIndex: 1100,
        '&.MuiPaper-root': {
          backdropFilter: 'blur(10px)' as any,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: { xs: 'space-between', md: 'space-between' }, px: { xs: 0, sm: 2 } }}>
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
            }}
          >
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              ماهرکار
            </Link>
          </Typography>

          {/* نمایش دکمه ورود/ثبت‌نام در هدر موبایل */}
          {isMobile && (
            <Button 
              variant="contained"
              color="primary"
              href="#"
              startIcon={<FontAwesomeIcon icon={faSignInAlt} />}
              sx={{ 
                borderRadius: '10px',
                fontWeight: 800,
                px: 2,
                py: 0.75,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                }
              }}
            >
              ورود / ثبت‌نام
            </Button>
          )}

          {/* منوی دسکتاپ */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 0,
            ml: { md: 2 }
          }}>
            {navItems.map((item, index) => (
              <Box key={index}>
                {item.hasSubmenu ? (
                  <Box>
                    <Button 
                      ref={item.buttonRef}
                      variant={item.variant as "text" | "contained" | "outlined"}
                      onMouseEnter={item.menuId === 'employer-menu' ? handleEmployerMouseEnter : item.menuId === 'candidate-menu' ? handleCandidateMouseEnter : handleHelpMouseEnter}
                      onMouseLeave={item.menuId === 'employer-menu' ? handleEmployerMouseLeave : item.menuId === 'candidate-menu' ? handleCandidateMouseLeave : handleHelpMouseLeave}
                      color={item.color as any}
                      startIcon={<Avatar sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: item.bgColor,
                        color: item.textColor,
                      }}>
                        <FontAwesomeIcon icon={item.icon} size="sm" />
                      </Avatar>}
                      endIcon={
                        (item.menuId === 'employer-menu' && isEmployerHovered) || 
                        (item.menuId === 'candidate-menu' && isCandidateHovered) ||
                        (item.menuId === 'help-menu' && isHelpHovered) ? 
                          <FontAwesomeIcon icon={faChevronUp} /> : 
                          <FontAwesomeIcon icon={faChevronDown} />
                      }
                      sx={{ 
                        borderRadius: '0px',
                        fontWeight: 800,
                        px: item.variant === 'contained' ? 2.5 : 1.5,
                        py: 0,
                        height: '100%',
                        minHeight: '64px',
                        minWidth: item.variant === 'contained' ? 140 : 'auto',
                        border: 'none',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '0%',
                          height: '3px',
                          transition: 'width 0.2s ease',
                          zIndex: 1200,
                        },
                        ...(item.title === 'راهنما' 
                          ? { 
                              color: '#000000',
                              '&:hover': {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '&::after': {
                                  width: '100%',
                                  backgroundColor: '#000000',
                                }
                              },
                              ...(isHelpHovered ? {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '&::after': {
                                  width: '100%',
                                  backgroundColor: '#000000',
                                }
                              } : {})
                            } 
                          : {}),
                        ...(item.color === 'employer' && item.variant === 'text' 
                          ? { 
                              color: theme.palette.employer.main,
                              '&:hover': {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '&::after': {
                                  width: '100%',
                                  backgroundColor: theme.palette.employer.main,
                                }
                              },
                              ...(isEmployerHovered ? {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '&::after': {
                                  width: '100%',
                                  backgroundColor: theme.palette.employer.main,
                                }
                              } : {})
                            } 
                          : {}),
                        ...(item.color === 'candidate' && item.variant === 'text' 
                          ? { 
                              color: theme.palette.candidate.main,
                              '&:hover': {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '&::after': {
                                  width: '100%',
                                  backgroundColor: theme.palette.candidate.main,
                                }
                              },
                              ...(isCandidateHovered ? {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '&::after': {
                                  width: '100%',
                                  backgroundColor: theme.palette.candidate.main,
                                }
                              } : {})
                            } 
                          : {}),
                        ...(item.color === 'primary' && item.variant === 'text' 
                          ? { 
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '&::after': {
                                  width: '100%',
                                  backgroundColor: theme.palette.primary.main,
                                }
                              }
                            } 
                          : {}),
                        ...(item.variant === 'contained'
                          ? {
                              borderRadius: '10px',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                              ml: 2,
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
                    color={item.color as any}
                    component="a"
                    href={item.href}
                    startIcon={item.variant === 'contained' ? 
                      <FontAwesomeIcon icon={item.icon} /> : 
                      (item.variant === 'text' ? 
                        <Avatar sx={{ 
                          width: 24, 
                          height: 24, 
                          bgcolor: item.bgColor,
                          color: item.textColor, 
                        }}>
                          <FontAwesomeIcon icon={item.icon} size="sm" />
                        </Avatar> : undefined)
                    }
                    sx={{ 
                      borderRadius: '10px',
                      fontWeight: 800,
                      px: item.variant === 'contained' ? 2.5 : 1.5,
                      py: 0.75,
                      height: '42px',
                      minWidth: item.variant === 'contained' ? 140 : 'auto',
                      ml: 2,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    {item.title}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 