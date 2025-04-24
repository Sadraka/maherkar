'use client'

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faChevronUp, 
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useHeaderContext } from '@/contexts/HeaderContext';

// کامپوننت AppBar اصلی
export default function AppHeader() {
  const theme = useTheme();
  const { 
    isMobile,
    employerButtonRef,
    candidateButtonRef,
    handleEmployerMouseEnter,
    handleEmployerMouseLeave,
    handleCandidateMouseEnter,
    handleCandidateMouseLeave,
    isEmployerHovered,
    isCandidateHovered,
  } = useHeaderContext();

  // اطلاعات منوها
  const navItems = [
    { 
      title: 'کارفرما هستم', 
      color: 'employer', 
      href: '#', 
      variant: 'text', 
      hasSubmenu: true,
      menuId: 'employer-menu',
      buttonRef: employerButtonRef
    },
    { 
      title: 'کارجو هستم', 
      color: 'candidate', 
      href: '#', 
      variant: 'text', 
      hasSubmenu: true,
      menuId: 'candidate-menu',
      buttonRef: candidateButtonRef
    },
    { 
      title: 'راهنما', 
      color: 'inherit', 
      href: '#', 
      variant: 'text', 
      hasSubmenu: false
    },
    { 
      title: 'ورود / ثبت‌نام', 
      color: 'primary', 
      href: '#', 
      variant: 'contained', 
      hasSubmenu: false
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
                      endIcon={
                        (item.menuId === 'employer-menu' && isEmployerHovered) || 
                        (item.menuId === 'candidate-menu' && isCandidateHovered) ? 
                          <FontAwesomeIcon icon={faChevronUp} /> : 
                          <FontAwesomeIcon icon={faChevronDown} />
                      }
                      sx={{ 
                        borderRadius: '10px',
                        fontWeight: 800,
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
                    sx={{ 
                      borderRadius: '10px',
                      fontWeight: 800,
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
        </Toolbar>
      </Container>
    </AppBar>
  );
} 