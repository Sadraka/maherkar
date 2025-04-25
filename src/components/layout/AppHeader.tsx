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
  IconButton,
  Tooltip,
} from '@mui/material';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faBuilding,
  faUserTie,
  faSignInAlt,
  faUserPlus,
  faRightToBracket,
  faUserCircle,
  faBell,
  faHeadset
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
    }
  ];

  const SubMenuItem = styled(MenuItem)(() => ({
    fontSize: 15,
    position: 'relative',
    marginRight: 16,
    padding: '8px 12px',
    minWidth: 'unset',
    color: '#333',
    fontWeight: 400,
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
      fontWeight: 500,
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
        boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
        zIndex: 1200,
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        '&.MuiPaper-root': {
          backdropFilter: 'blur(15px)' as any,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Toolbar sx={{ 
            justifyContent: { xs: 'space-between', md: 'space-between' }, 
            px: { xs: 1.5, md: 0 },
            py: { xs: 1, md: 0.5 },
            width: '100%',
          }}>
            {/* لوگو و منوی راست */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: { xs: 2, md: 3 }
              }}
            >
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
                  letterSpacing: '-0.5px',
                  textShadow: '0 1px 1px rgba(0,0,0,0.05)'
                }}
              >
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  ماهرکار
                </Link>
              </Typography>

              {/* آیتم‌های منو برای دسکتاپ - کارفرما/کارجو */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center', 
                gap: 2
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
                          sx={{ 
                            borderRadius: '0px',
                            fontWeight: 400,
                            fontSize: '0.9rem',
                            px: 1,
                            py: 0,
                            height: '100%',
                            minHeight: '60px',
                            minWidth: 'auto',
                            border: 'none',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
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
                              transition: 'width 0.3s ease',
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
                          <Box
                            sx={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.25s ease',
                              backgroundColor: item.bgColor,
                              boxShadow: `0 2px 6px ${alpha(
                                item.color === 'employer' ? theme.palette.employer.main : theme.palette.candidate.main, 
                                0.1
                              )}`
                            }}
                          >
                            <FontAwesomeIcon 
                              icon={item.icon} 
                              style={{ 
                                fontSize: '0.9rem', 
                                color: item.textColor
                              }} 
                            />
                          </Box>
                          {item.title}
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                ))}
                
                {/* ارتباط با پشتیبانی */}
                <Box>
                  <Button 
                    variant="text"
                    color="primary"
                    href="/support"
                    sx={{ 
                      borderRadius: '0px',
                      fontWeight: 400,
                      fontSize: '0.9rem',
                      px: 1,
                      py: 0,
                      height: '100%',
                      minHeight: '60px',
                      minWidth: 'auto',
                      border: 'none',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      color: theme.palette.primary.main,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '0%',
                        height: '2px',
                        zIndex: 1200,
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                        '&::after': {
                          width: '100%',
                        }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.25s ease',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.08)}`
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
                    ارتباط با پشتیبانی
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* آیکون‌های سمت چپ */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, md: 2 }
            }}>
              {/* آیکون اعلان‌ها (زنگوله) */}
              <Tooltip title="اعلان‌ها" arrow>
                <Box
                  component="a"
                  href="#"
                  sx={{
                    width: { xs: '38px', md: '42px' },
                    height: { xs: '38px', md: '42px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      '& .icon-container': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.18),
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                      },
                      '& .icon': {
                        color: '#fff'
                      }
                    }
                  }}
                >
                  <Box
                    className="icon-container"
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.25s ease',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={faBell} 
                      className="icon"
                      style={{ 
                        fontSize: '1.2rem',
                        color: theme.palette.primary.main,
                        transition: 'all 0.25s ease'
                      }} 
                    />
                  </Box>
                </Box>
              </Tooltip>
              
              {/* آیکون ورود/ثبت‌نام */}
              <Tooltip title="ورود/ثبت‌نام" arrow>
                <Box
                  component="a"
                  href="/login"
                  sx={{
                    width: { xs: '42px', md: '46px' },
                    height: { xs: '42px', md: '46px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      '& .icon-container': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.18),
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                      },
                      '& .icon': {
                        color: '#fff'
                      }
                    }
                  }}
                >
                  <Box
                    className="icon-container"
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.25s ease',
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="icon"
                      style={{ 
                        fontSize: '1.3rem',
                        color: theme.palette.primary.main,
                        transition: 'all 0.25s ease'
                      }} 
                    />
                  </Box>
                </Box>
              </Tooltip>
            </Box>
          </Toolbar>
        </Box>
      </Container>
    </AppBar>
  );
} 