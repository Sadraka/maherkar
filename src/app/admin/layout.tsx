'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Drawer,
  useTheme,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
  LinearProgress,
  Skeleton,
  Collapse
} from '@mui/material';
import { AdminProtector } from '@/components/admin/guards';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { ADMIN_THEME } from '@/constants/colors';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faBuilding,
  faBriefcase,
  faFileAlt,
  faCreditCard,
  faIndustry,
  faSubscript,
  faTags,
  faBell,
  faCog,
  faUser,
  faBars,
  faTimes,
  faHome,
  faChevronLeft,
  faChevronDown,
  faChevronUp,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/store/authStore';
import { useJobStatsStore } from '@/store/jobStatsStore';

// آیتم‌های منوی ادمین
const adminMenuItems: Array<{
  title: string;
  path: string;
  icon: any;
  emoji: string;
  group?: string;
  customIcon?: string;
}> = [
  {
    title: 'داشبورد',
    path: '/admin',
    icon: faTachometerAlt,
    emoji: '📊'
  },
  {
    title: 'کاربران',
    path: '/admin#users',
    icon: faUsers,
    emoji: '👥',
    group: 'user-management'
  },
  {
    title: 'شرکت‌ها',
    path: '/admin#companies',
    icon: faBuilding,
    emoji: '🏢',
    group: 'user-management'
  },
  {
    title: 'تایید کارفرمایان',
    path: '/admin#employer-verification',
    icon: faUserCheck,
    emoji: '✅',
    group: 'user-management'
  },
  {
    title: 'گروه‌های کاری',
    path: '/admin#industries',
    icon: faIndustry,
    emoji: '🏭'
  },
  {
    title: 'آگهی‌ها',
    path: '/admin#jobs',
    icon: faBriefcase,
    emoji: '📋',
    group: 'user-management'
  },
  {
    title: 'درخواست‌ها',
    path: '/admin#applications',
    icon: faFileAlt,
    emoji: '📝'
  },
  {
    title: 'پرداخت‌ها',
    path: '/admin#payments',
    icon: faCreditCard,
    emoji: '💳',
    group: 'user-management'
  },
  {
    title: 'اشتراک‌ها',
    path: '/admin#subscriptions',
    icon: null, // حذف ایکون
    emoji: '📈',
    group: 'user-management',
    customIcon: 'نردبان' // اضافه کردن آیکون سفارشی
  },
  {
    title: 'طرح‌های اشتراک',
    path: '/admin#subscription-plans',
    icon: faTags,
    emoji: '📋'
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);
  const { jobStats, jobStatsLoading } = useJobStatsStore();
  const [currentHash, setCurrentHash] = useState('');
  const [openManagement, setOpenManagement] = useState(true); // کنترل باز/بسته بودن آکاردئون
  const theme = useTheme();

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash.replace('#', ''));
      }
    };

    // فقط در client-side اجرا شود
    if (typeof window !== 'undefined') {
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);



  const isActiveMenuItem = (path: string) => {
    if (path === '/admin' && pathname === '/admin' && !currentHash) return true;
    if (path.includes('#') && pathname === '/admin') {
      const pathHash = path.split('#')[1];
      return pathHash === currentHash;
    }
    return false;
  };

  const getCurrentSectionTitle = () => {
    if (!currentHash) return 'داشبورد';
    const menuItem = adminMenuItems.find(item => item.path.includes(`#${currentHash}`));
    return menuItem ? menuItem.title : 'داشبورد';
  };

  const getCurrentSectionEmoji = () => {
    if (!currentHash) return '📊';
    const menuItem = adminMenuItems.find(item => item.path.includes(`#${currentHash}`));
    return menuItem ? menuItem.emoji : '📊';
  };

  const getAvatarText = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return 'ا';
  };

  const UserDefaultAvatar = () => (
    <FontAwesomeIcon
      icon={faUser}
      style={{
        fontSize: '1.5rem',
        color: '#fff',
      }}
    />
  );

  const handleMenuClick = (path: string) => {
    if (typeof window !== 'undefined') {
      if (path === '/admin') {
        window.history.pushState({}, '', '/admin');
      } else if (path.includes('#')) {
        window.history.pushState({}, '', path);
      }

      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };

  const SidebarContent = () => {
    const managementItems = adminMenuItems.filter(item => item.group === 'user-management');
    const dashboardItem = adminMenuItems.find(item => item.path === '/admin');
    const otherItems = adminMenuItems.filter(item => item.group !== 'user-management' && item.path !== '/admin');

    return (
      <>
        <Box sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          mb: 1
        }}>
          <Avatar
            src={user?.profile_picture}
            sx={{
              width: 60,
              height: 60,
              bgcolor: ADMIN_THEME.primary,
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              mb: 1
            }}
          >
            {user?.full_name ? getAvatarText() : <UserDefaultAvatar />}
          </Avatar>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
            {user?.full_name || 'مدیر'}
          </Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(90deg, ${ADMIN_THEME.primary}, ${ADMIN_THEME.light})`,
            borderRadius: '4px',
            px: 1.5,
            py: 0.2,
            minWidth: '60px',
            textAlign: 'center',
          }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                lineHeight: 1.2,
                color: '#fff',
                fontWeight: 500
              }}
            >
              مدیر سیستم
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <List sx={{ px: 1, width: '100%', pb: 2 }}>
          {/* آیتم داشبورد */}
          {dashboardItem && (
            <ListItem key={dashboardItem.path} sx={{ p: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(dashboardItem.path)}
                selected={isActiveMenuItem(dashboardItem.path)}
                sx={{
                  borderRadius: 1,
                  py: 1,
                  width: '100%',
                  '&.Mui-selected': {
                    bgcolor: ADMIN_THEME.bgLight,
                    '&:hover': {
                      bgcolor: ADMIN_THEME.bgVeryLight,
                    },
                    '& .MuiListItemIcon-root': {
                      color: ADMIN_THEME.primary,
                    },
                    '& .MuiListItemText-primary': {
                      color: ADMIN_THEME.primary,
                      fontWeight: 'bold'
                    }
                  },
                  '&:hover': {
                    bgcolor: ADMIN_THEME.bgVeryLight,
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 40,
                  color: isActiveMenuItem(dashboardItem.path) ? ADMIN_THEME.primary : 'text.secondary',
                }}>
                  <FontAwesomeIcon icon={dashboardItem.icon} style={{ fontSize: '1.1rem' }} />
                </ListItemIcon>
                <ListItemText
                  primary={dashboardItem.title}
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: isActiveMenuItem(dashboardItem.path) ? 'bold' : 'normal' } }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {/* منوی آکاردئونی مدیریت کاربران */}
          <ListItem sx={{ p: 0.5 }}>
            <ListItemButton
              onClick={() => setOpenManagement(prev => !prev)}
              sx={{
                borderRadius: 1,
                py: 1,
                width: '100%',
                '&:hover': {
                  bgcolor: ADMIN_THEME.bgVeryLight,
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 40,
                color: ADMIN_THEME.primary
              }}>
                <FontAwesomeIcon icon={faUsers} style={{ fontSize: '1.1rem' }} />
              </ListItemIcon>
              <FontAwesomeIcon icon={openManagement ? faChevronUp : faChevronDown} style={{ fontSize: '0.9rem', color: ADMIN_THEME.primary, marginLeft: '23px' }} />
              <ListItemText
                primary="مدیریت کاربران"
                sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: 'bold', color: ADMIN_THEME.primary } }}
              />
            </ListItemButton>
          </ListItem>

          <Collapse in={openManagement} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {managementItems.map((item) => (
                <ListItem key={item.path} sx={{ p: 0.5, pl: 3 }}>
                  <ListItemButton
                    onClick={() => handleMenuClick(item.path)}
                    selected={isActiveMenuItem(item.path)}
                    sx={{
                      borderRadius: 1,
                      py: 1,
                      width: '100%',
                      '&.Mui-selected': {
                        bgcolor: ADMIN_THEME.bgLight,
                        '&:hover': {
                          bgcolor: ADMIN_THEME.bgVeryLight,
                        },
                        '& .MuiListItemIcon-root': {
                          color: ADMIN_THEME.primary,
                        },
                        '& .MuiListItemText-primary': {
                          color: ADMIN_THEME.primary,
                          fontWeight: 'bold'
                        }
                      },
                      '&:hover': {
                        bgcolor: ADMIN_THEME.bgVeryLight,
                      },
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 32,
                      color: isActiveMenuItem(item.path) ? ADMIN_THEME.primary : 'text.secondary',
                    }}>
                      {item.customIcon ? (
                        <Box
                          sx={{
                            width: 32,
                            height: 20,
                            borderRadius: 0.5,
                            bgcolor: isActiveMenuItem(item.path) ? ADMIN_THEME.primary : 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            color: 'white',
                            textAlign: 'center',
                            lineHeight: 1
                          }}
                        >
                          {item.customIcon}
                        </Box>
                      ) : (
                        <FontAwesomeIcon icon={item.icon} style={{ fontSize: '1rem' }} />
                      )}
                    </ListItemIcon>
                    {item.path === '/admin#jobs' && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 24,
                          height: 18,
                          px: 0.8,
                          mr: 4,
                          ...(jobStats.pendingJobs > 0 ? {
                            bgcolor: '#ffe0b2',
                            boxShadow: '0 1px 4px rgba(255, 140, 0, 0.1)',
                            border: '1.2px solid #ff9800',
                            color: '#ff6d00'
                          } : {
                            bgcolor: 'transparent',
                            border: '1px solid #e0e0e0',
                            color: '#757575'
                          }),
                          borderRadius: 5,
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          lineHeight: 1,
                        }}
                      >
                        {jobStatsLoading ? (
                          <Skeleton variant="rectangular" width={16} height={12} sx={{ borderRadius: 1 }} />
                        ) : jobStats.pendingJobs > 0 ? (
                          jobStats.pendingJobs > 99 ? '+99' : jobStats.pendingJobs.toLocaleString('fa-IR')
                        ) : (
                          '۰'
                        )}
                      </Box>
                    )}
                    <ListItemText
                      primary={item.title}
                      sx={{ '& .MuiListItemText-primary': { fontSize: '0.825rem', fontWeight: isActiveMenuItem(item.path) ? 'bold' : 'normal' } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* سایر آیتم‌های منو */}
          {otherItems.map((item) => (
            <ListItem key={item.path} sx={{ p: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                selected={isActiveMenuItem(item.path)}
                sx={{
                  borderRadius: 1,
                  py: 1,
                  width: '100%',
                  '&.Mui-selected': {
                    bgcolor: ADMIN_THEME.bgLight,
                    '&:hover': {
                      bgcolor: ADMIN_THEME.bgVeryLight,
                    },
                    '& .MuiListItemIcon-root': {
                      color: ADMIN_THEME.primary,
                    },
                    '& .MuiListItemText-primary': {
                      color: ADMIN_THEME.primary,
                      fontWeight: 'bold'
                    }
                  },
                  '&:hover': {
                    bgcolor: ADMIN_THEME.bgVeryLight,
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 40,
                  color: isActiveMenuItem(item.path) ? ADMIN_THEME.primary : 'text.secondary',
                }}>
                  <FontAwesomeIcon icon={item.icon} style={{ fontSize: '1.1rem' }} />
                </ListItemIcon>
                {item.path === '/admin#jobs' && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 28,
                      height: 20,
                      px: 1,
                      mr: 6,
                      ...(jobStats.pendingJobs > 0 ? {
                        bgcolor: '#ffe0b2',
                        boxShadow: '0 1px 4px rgba(255, 140, 0, 0.1)',
                        border: '1.5px solid #ff9800',
                        color: '#ff6d00'
                      } : {
                        bgcolor: 'transparent',
                        border: '1px solid #e0e0e0',
                        color: '#757575'
                      }),
                      borderRadius: 6,
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {jobStatsLoading ? (
                      <Skeleton variant="rectangular" width={20} height={16} sx={{ borderRadius: 1 }} />
                    ) : jobStats.pendingJobs > 0 ? (
                      jobStats.pendingJobs > 99 ? '+99' : jobStats.pendingJobs.toLocaleString('fa-IR')
                    ) : (
                      '۰'
                    )}
                  </Box>
                )}
                <ListItemText
                  primary={item.title}
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: isActiveMenuItem(item.path) ? 'bold' : 'normal' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  const AdminHeader = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 1.5, md: 2 }, 
      mb: 3 
    }}>
      {/* Header اصلی */}
      <Paper
        elevation={0}
            sx={{
          background: `linear-gradient(135deg, ${ADMIN_THEME.bgLight} 0%, ${ADMIN_THEME.bgVeryLight} 100%)`,
          borderRadius: '12px',
          p: { xs: 2, md: 2.5 },
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          border: `2px solid ${ADMIN_THEME.bgLight}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='${ADMIN_THEME.primary.replace('#', '%23')}' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3Ccircle cx='20' cy='20' r='2' fill='${ADMIN_THEME.primary.replace('#', '%23')}' opacity='0.15'/%3E%3Ccircle cx='80' cy='40' r='1.5' fill='${ADMIN_THEME.primary.replace('#', '%23')}' opacity='0.1'/%3E%3Ccircle cx='40' cy='80' r='1' fill='${ADMIN_THEME.primary.replace('#', '%23')}' opacity='0.08'/%3E%3Ccircle cx='70' cy='70' r='1.2' fill='${ADMIN_THEME.primary.replace('#', '%23')}' opacity='0.12'/%3E%3Ccircle cx='30' cy='60' r='0.8' fill='${ADMIN_THEME.primary.replace('#', '%23')}' opacity='0.06'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }
            }}
          >
        <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 1, md: 1.5 } }}>
          {/* Breadcrumb */}
          <Breadcrumbs 
            separator={<FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '0.75rem', color: ADMIN_THEME.primary }} />}
            sx={{ mb: 1.5 }}
          >
            <Link
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('/admin');
              }}
              sx={{
                color: ADMIN_THEME.primary,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                '&:hover': {
                  color: ADMIN_THEME.dark,
                  textDecoration: 'none'
                }
              }}
              >
              <FontAwesomeIcon icon={faHome} style={{ fontSize: '0.875rem', marginLeft: '4px' }} />
              پنل ادمین
            </Link>
            {currentHash && (
              <Typography
                sx={{
                  color: ADMIN_THEME.primary,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                {getCurrentSectionTitle()}
              </Typography>
            )}
          </Breadcrumbs>

          {/* پیام خوش‌آمدگویی */}
          <Typography
            variant="h6"
            sx={{
              color: ADMIN_THEME.primary,
              fontWeight: 500,
              mb: 0.5,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            👋 سلام {user?.full_name || 'مدیر'} عزیز! خوش آمدید به ماهرکار 😊
          </Typography>

          {/* عنوان اصلی */}
          <Typography
            variant="h4"
            sx={{
              color: ADMIN_THEME.primary,
              fontWeight: 'bold',
              mb: 0.5,
              fontSize: { xs: '1.25rem', md: '1.75rem' }
            }}
          >
            {!currentHash ? '🎯 پنل مدیریت ماهرکار' : `${getCurrentSectionEmoji()} ${getCurrentSectionTitle()}`}
          </Typography>

          {/* توضیحات داینامیک */}
          <Typography
            variant="body1"
            sx={{
              color: ADMIN_THEME.dark,
              fontSize: '0.875rem',
              mb: 1.5
            }}
          >
            {!currentHash 
              ? '🎉 مدیریت کامل سیستم استخدام و کاریابی'
              : '🔧 در حال مدیریت و نظارت بر این بخش'
            }
          </Typography>

        </Box>
      </Paper>

      {/* بخش وضعیت آگهی‌ها فقط در داشبورد */}
      {pathname === '/admin' && (typeof window === 'undefined' || !window?.location?.hash || window.location.hash === '' || window.location.hash === '#') && (
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`,
          borderRadius: '12px',
          p: { xs: 2, md: 2.5 },
          width: { xs: '100%', md: '300px' },
          border: `2px solid ${ADMIN_THEME.bgLight}`,
          display: 'block'
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          fontWeight="bold" 
          sx={{ 
            color: ADMIN_THEME.primary, 
            mb: { xs: 1.5, md: 2 },
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}
        >
          📈 وضعیت آگهی‌ها
        </Typography>
        <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
          {jobStatsLoading ? (
            // Skeleton loading state
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 3, mb: 2 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 3 }} />
            </>
          ) : (
            // Actual content
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: ADMIN_THEME.dark,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}
                >
                  ✅ تایید شده
                </Typography>
                <Chip 
                  label={`${(jobStats.totalJobs - jobStats.pendingJobs).toLocaleString('fa-IR')} آگهی`} 
                  color="success" 
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.65rem', md: '0.7rem' },
                    height: { xs: '20px', md: '24px' }
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={jobStats.totalJobs > 0 ? (jobStats.totalJobs - jobStats.pendingJobs) / jobStats.totalJobs * 100 : 0}
                color="success"
                sx={{ 
                  height: { xs: 4, md: 6 }, 
                  borderRadius: { xs: 2, md: 3 }, 
                  mb: { xs: 1.5, md: 2 } 
                }}
              />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: ADMIN_THEME.dark,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}
                >
                  ⏳ در انتظار بررسی
                </Typography>
                <Chip 
                  label={`${jobStats.pendingJobs.toLocaleString('fa-IR')} آگهی`} 
                  color={jobStats.pendingJobs > 0 ? "warning" : "default"}
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.65rem', md: '0.7rem' },
                    height: { xs: '20px', md: '24px' },
                    ...(jobStats.pendingJobs === 0 && {
                      bgcolor: 'transparent',
                      border: '1px solid #e0e0e0',
                      color: '#757575'
                    })
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={jobStats.totalJobs > 0 ? jobStats.pendingJobs / jobStats.totalJobs * 100 : 0}
                color={jobStats.pendingJobs > 0 ? "warning" : "inherit"}
                sx={{ 
                  height: { xs: 4, md: 6 }, 
                  borderRadius: { xs: 2, md: 3 },
                  ...(jobStats.pendingJobs === 0 && {
                    opacity: 0.3
                  })
                }}
              />
            </>
          )}
        </Box>
      </Paper>
      )}
            </Box>
  );

  return (
    <AdminProtector>
      <ThemeRegistry>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafd', direction: 'rtl' }}>

          {/* کانتینر اصلی */}
          <Container
            maxWidth="lg"
            sx={{
              px: { xs: '16px', sm: '24px' },
              pt: { xs: 2, md: 3 },
              pb: 3
            }}
          >

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
                width: '100%',
                maxWidth: '1200px',
                mx: 'auto'
              }}
            >
              {/* سایدبار دسکتاپ */}
              <Box
                component="nav"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: 240,
                  flexShrink: 0,
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: 'auto',
                  overflow: 'visible',
                  position: 'static',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <SidebarContent />
              </Box>

              {/* محتوای اصلی */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  width: { xs: '100%', md: 'calc(100% - 240px - 24px)' },
                  ml: { md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  direction: 'ltr'
                }}
              >
                {/* Header مخصوص ادمین - فقط در داشبورد */}
                {pathname === '/admin' && (typeof window === 'undefined' || !window?.location?.hash || window.location.hash === '' || window.location.hash === '#') && (
                  <AdminHeader />
                )}

                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
      </ThemeRegistry>
    </AdminProtector>
  );
}
