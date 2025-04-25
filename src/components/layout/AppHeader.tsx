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
  MenuItem,
} from '@mui/material';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faBuilding,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// کامپوننت AppBar اصلی
export default function AppHeader() {
  const theme = useTheme();
  const { 
    isMobile,
    mobileOpen,
    handleDrawerToggle,
    employerButtonRef,
    candidateButtonRef,
    handleEmployerMouseEnter,
    handleEmployerMouseLeave,
    handleCandidateMouseEnter,
    handleCandidateMouseLeave,
    isEmployerHovered,
    isCandidateHovered,
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
      title: '',
      color: 'primary', 
      href: '#', 
      variant: 'text',
      hasSubmenu: false,
      icon: faSignInAlt
    }
  ];

  const SubMenuItem = styled(MenuItem)(() => ({
    fontSize: 15,
    position: 'relative',
    marginRight: 16,
    padding: '8px 12px',
    minWidth: 'unset',
    color: '#333',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#000',
      '&::after': {
        width: '100%',
        backgroundColor: alpha(theme.palette.primary.main, 0.8),
        height: '3px',
      }
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '0%',
      height: '2px',
      backgroundColor: alpha(theme.palette.primary.main, 0.7),
    },
    '&.active': {
      fontWeight: 'bold',
      color: theme.palette.primary.main,
      '&::after': {
        width: '100%',
      }
    }
  }));

  return (
    <AppBar 
      position="sticky" 
      color="default"
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        zIndex: 1200,
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        '&.MuiPaper-root': {
          backdropFilter: 'blur(10px)' as any,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Toolbar sx={{ 
            justifyContent: { xs: 'space-between', md: 'space-between' }, 
            px: { xs: 1.5, md: 0 },
            py: { xs: 1, md: 1 },
            width: '100%',
          }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.3rem', md: '1.6rem' },
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

            {/* نمایش دکمه ورود/ثبت‌نام در هدر موبایل - فقط آیکون */}
            {isMobile && (
              <Button 
                variant="text"
                color="primary"
                href="#"
                sx={{ 
                  minWidth: 'auto',
                  borderRadius: '50%',
                  p: 1,
                  height: 40,
                  width: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FontAwesomeIcon icon={faSignInAlt} size="lg" />
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
                        onMouseEnter={item.menuId === 'employer-menu' ? handleEmployerMouseEnter : handleCandidateMouseEnter}
                        onMouseLeave={item.menuId === 'employer-menu' ? handleEmployerMouseLeave : handleCandidateMouseLeave}
                        color={item.color as any}
                        startIcon={<Avatar sx={{ 
                          width: 20,
                          height: 20,
                          bgcolor: item.bgColor,
                          color: item.textColor,
                        }}>
                          <FontAwesomeIcon icon={item.icon} size="xs" />
                        </Avatar>}
                        sx={{ 
                          borderRadius: '0px',
                          fontWeight: 400,
                          fontSize: '0.9rem',
                          px: item.variant === 'contained' ? 2 : 1,
                          py: 0,
                          height: '100%',
                          minHeight: '60px',
                          minWidth: item.variant === 'contained' ? 140 : 'auto',
                          border: 'none',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '0%',
                            height: '2px',
                            zIndex: 1200,
                            backgroundColor: item.color === 'employer' ? theme.palette.employer.main : 
                                           item.color === 'candidate' ? theme.palette.candidate.main :
                                           item.color === 'black' ? '#000000' : theme.palette.primary.main,
                          },
                          '&:hover': {
                            backgroundColor: 'transparent',
                            '&::after': {
                              width: '100%',
                            }
                          },
                          ...(item.color === 'employer' && item.variant === 'text' 
                            ? { 
                                color: theme.palette.employer.main,
                              } 
                            : {}),
                          ...(item.color === 'candidate' && item.variant === 'text' 
                            ? { 
                                color: theme.palette.candidate.main,
                              } 
                            : {}),
                          ...(item.color === 'primary' && item.variant === 'text' 
                            ? { 
                                color: theme.palette.primary.main,
                              } 
                            : {}),
                          ...(item.variant === 'contained'
                            ? {
                                borderRadius: '8px',
                                boxShadow: 'none',
                                ml: 2,
                                '&::after': {
                                  display: 'none'
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
                      sx={{ 
                        minWidth: 'auto',
                        borderRadius: '50%',
                        p: 1,
                        height: 40,
                        width: 40,
                        ml: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none'
                      }}
                    >
                      <FontAwesomeIcon icon={item.icon} size="lg" />
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          </Toolbar>
        </Box>
      </Container>
    </AppBar>
  );
} 