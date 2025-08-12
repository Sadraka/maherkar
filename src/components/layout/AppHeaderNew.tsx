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
  Tooltip
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
  faHeadset,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useState, memo, useEffect, useRef } from 'react';
import UserMenu from './UserMenu';
import { useAuthStore, useAuthActions } from '@/store/authStore';
import { useJobStatsStore } from '@/store/jobStatsStore';
import authService from '@/lib/authService';

// کامپوننت AppBar اصلی
function AppHeaderNew({ promoBarClosed = false, promoBarLoaded = false }: { promoBarClosed?: boolean, promoBarLoaded?: boolean }) {
  const theme = useTheme();
  const { jobStats, jobStatsLoading } = useJobStatsStore();
  
  // استفاده از selectorهای جداگانه برای کاهش رندرهای غیرضروری
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const { refreshUserData } = useAuthActions();
  const dataLoadedRef = useRef(false);
  
  // بررسی نوع کاربر برای تنظیم موقعیت هدر
  const shouldShowPromoBar = () => {
    // اگر هنوز در حال بارگذاری اطلاعات کاربر هستیم، منتظر می‌مانیم
    if (loading) return null;
    
    // اگر کاربر لاگین نکرده، پرومو بار را نمایش می‌دهیم
    if (!isAuthenticated) return true;
    
    // اگر کاربر لاگین کرده، فقط کارفرماها پرومو بار را می‌بینند
    return user?.user_type === 'EM';
  }
  
  const promoBarStatus = shouldShowPromoBar();
  const headerTop = promoBarStatus === null 
    ? 0 // منتظر می‌مانیم تا وضعیت مشخص شود
    : promoBarStatus 
      ? (promoBarClosed ? 0 : (promoBarLoaded ? '48px' : 0)) // برای کارفرما و کاربران غیرلاگین
      : 0; // برای کارجو، ادمین و پشتیبان همیشه بالا

  const {
    isMobile,
    mobileOpen,
    setMobileOpen,
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

  // بارگذاری اطلاعات کاربر در ابتدای لود هدر
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (isAuthenticated && !dataLoadedRef.current) {
          // بررسی اعتبار توکن و دریافت اطلاعات کاربر در صورت نیاز
          await Promise.all([
            authService.validateAndRefreshTokenIfNeeded(),
            refreshUserData()
          ]);
          
          // ذخیره زمان بارگذاری داده‌ها برای استفاده در کامپوننت UserMenu
          (window as any)._userMenuLastFetch = Date.now();
          
          // ثبت اینکه داده‌ها حداقل یک بار بارگیری شده‌اند
          dataLoadedRef.current = true;
          
          console.log('[AppHeader] اطلاعات کاربر با موفقیت بارگیری شد');
        }
      } catch (error) {
        console.error('خطا در بارگذاری اطلاعات کاربر در هدر:', error);
      }
    };
    
    loadUserData();
  }, [isAuthenticated, refreshUserData]);

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

  // فیلتر کردن آیتم‌های منو بر اساس نوع کاربر
  const filteredNavItems = navItems.filter(item => {
    // اگر کاربر لاگین نکرده باشد، هر دو گزینه نمایش داده شود
    if (!isAuthenticated) {
      return true;
    }
    
    // اگر کاربر ادمین (AD) یا پشتیبان (SU) باشد، هیچ‌کدام نمایش داده نشود
    if (user?.user_type === 'AD' || user?.user_type === 'SU') {
      return false;
    }
    
    // اگر کاربر کارفرما (EM) باشد، فقط "کارفرما هستم" نمایش داده شود
    if (user?.user_type === 'EM') {
      return item.title === 'کارفرما هستم';
    }
    
    // اگر کاربر کارجو (JS) باشد، فقط "کارجو هستم" نمایش داده شود
    if (user?.user_type === 'JS') {
      return item.title === 'کارجو هستم';
    }
    
    return true;
  });

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
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
        zIndex: 1199, // کمتر از پرومو بار
        top: headerTop, // در ابتدا بالا، بعد از لود پرومو بار پایین
        left: 0,
        right: 0,
        width: '100%',
        transition: 'top 0.3s ease', // انیمیشن برای حرکت هدر
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
            px: { xs: 0, md: 0 },
            py: { xs: 1, md: 0.5 },
            width: '100%',
            position: 'relative', // برای قرار دادن لوگو در وسط
          }}>
            {/* لوگوی سایت در موبایل - در وسط */}
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 800,
                fontSize: '1.4rem',
                backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: { xs: 'block', md: 'none' },
                letterSpacing: '-0.5px',
                textShadow: '0 1px 1px rgba(0,0,0,0.05)',
                zIndex: 1
              }}
            >
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                ماهرکار
              </Link>
            </Typography>

            {/* آیکون‌های سمت راست */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, md: 3 }, // افزایش فاصله آیکون‌ها در موبایل
                zIndex: 2
              }}
            >
              {/* دکمه منو برای موبایل */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  backgroundColor: 'transparent',
                  borderRadius: '10px',
                  padding: 0,
                  height: { xs: 34, md: 40 }, // اندازه یکسان با سایر آیکون‌ها
                  width: { xs: 34, md: 40 }, // اندازه یکسان با سایر آیکون‌ها
                  ml: { xs: 0, md: 0 },
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={mobileOpen ? faTimes : faBars}
                  style={{
                    fontSize: '1.2rem',
                    width: '20px',
                    height: '20px',
                    color: theme.palette.primary.main
                  }}
                />
              </IconButton>

              {/* آیکون اعلان‌ها (زنگوله) - فقط برای کاربران لاگین شده در موبایل */}
              {isAuthenticated && (
                <Tooltip title="اعلان‌ها" arrow>
                  <Box
                    component="a"
                    href="#"
                    sx={{
                      width: { xs: '36px', md: '42px' },
                      height: { xs: '36px', md: '42px' },
                      display: { xs: 'flex', md: 'none' }, // فقط در موبایل نمایش داده شود
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '& .icon': {
                          color: theme.palette.primary.dark
                        }
                      }
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faBell}
                      className="icon"
                      style={{
                        fontSize: '1.1rem',
                        width: '18px',
                        height: '18px',
                        color: theme.palette.primary.main,
                        transition: 'all 0.25s ease'
                      }}
                    />
                  </Box>
                </Tooltip>
              )}

              {/* لوگوی سایت - فقط در دسکتاپ */}
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', md: '1.8rem' },
                  backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  display: { xs: 'none', md: 'flex' },
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
                {filteredNavItems.map((item, index) => (
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
                            gap: 0.5,
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
                          <FontAwesomeIcon
                            icon={item.icon}
                            style={{
                              fontSize: '1.2rem',
                              width: '22px',
                              height: '22px',
                              color: item.textColor,
                              marginLeft: '4px'
                            }}
                          />
                          {item.title}
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant={item.variant as "text" | "contained" | "outlined"}
                        color={item.color as any}
                        href={item.href}
                        sx={{
                          borderRadius: '8px',
                          minWidth: 'auto',
                          fontWeight: 400,
                          fontSize: '0.9rem',
                          py: 0.5,
                          px: 1.5,
                          transition: 'all 0.2s ease',
                          ...(item.color === 'primary' && item.variant === 'text'
                            ? {
                              color: theme.palette.primary.main,
                            }
                            : {}),
                          ...(item.variant === 'contained'
                            ? {
                              boxShadow: 'none',
                              ml: 2
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
            </Box>

            {/* آیکون‌های سمت چپ */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, md: 2 }, // افزایش فاصله آیکون‌ها در موبایل
                mr: { xs: 0, md: 0 },
                zIndex: 2
              }}
            >
              {/* درخواست مشاوره - فقط در دسکتاپ */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  component={Button}
                  variant="text"
                  href="/support"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: '8px',
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    padding: '6px 16px',
                    color: theme.palette.primary.main,
                    transition: 'all 0.25s ease',
                    textTransform: 'none',
                    border: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      transform: 'translateY(-2px)',
                      color: theme.palette.primary.dark,
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHeadset}
                    style={{
                      fontSize: '1.2rem',
                      width: '22px',
                      height: '22px',
                      color: 'inherit',
                      transition: 'all 0.25s ease'
                    }}
                  />
                  ارتباط با پشتیبانی
                </Box>
              </Box>

              {/* آیکون اعلان‌ها (زنگوله) - فقط برای کاربران لاگین شده در دسکتاپ */}
              {isAuthenticated && (
                <Tooltip title="اعلان‌ها" arrow>
                  <Box
                    component="a"
                    href="#"
                    sx={{
                      width: { xs: '36px', md: '42px' },
                      height: { xs: '36px', md: '42px' },
                      display: { xs: 'none', md: 'flex' }, // فقط در دسکتاپ نمایش داده شود
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '& .icon': {
                          color: theme.palette.primary.dark
                        }
                      }
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faBell}
                      className="icon"
                      style={{
                        fontSize: '1.1rem',
                        width: '18px',
                        height: '18px',
                        color: theme.palette.primary.main,
                        transition: 'all 0.25s ease'
                      }}
                    />
                  </Box>
                </Tooltip>
              )}

              {/* مکان آواتار و منوی کاربر */}
              <UserMenu
                isLoggedIn={isAuthenticated}
                user={user ? {
                  name: user.full_name || '',
                  role: user.user_type,
                  avatar: user.profile_picture || ''
                } : undefined}
              />
            </Box>
          </Toolbar>
        </Box>
      </Container>
    </AppBar>
  );
}

// استفاده از memo برای کاهش رندرهای غیرضروری
export default memo(AppHeaderNew); 