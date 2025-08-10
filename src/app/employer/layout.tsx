'use client';

import React from 'react';
import { Box, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Divider, Avatar } from '@mui/material';
import EmployerAuthRequired from '@/components/auth/EmployerAuthRequired';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { EMPLOYER_THEME } from '@/constants/colors';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faListAlt,
  faClipboardList,
  faBuilding,
  faPlus,
  faCog,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore, useAuthActions } from '@/store/authStore';

// آیتم‌های منوی کارفرما - همان آیتم‌های موجود در UserMenu
const employerMenuItems = [
  { 
      title: 'پنل کارفرما', 
      path: '/employer/dashboard', 
      icon: faTachometerAlt,
  },
  { 
      title: 'ثبت آگهی جدید', 
      path: '/employer/jobs/create', 
      icon: faPlus,
  },
  { 
      title: 'آگهی‌های من', 
      path: '/employer/jobs', 
      icon: faListAlt,
  },
  { 
      title: 'درخواست‌های کاریابی', 
      path: '/employer/applications', 
      icon: faClipboardList,
  },
  { 
      title: 'شرکت‌های من', 
      path: '/employer/companies', 
      icon: faBuilding,
  },
  { 
      title: 'پروفایل', 
      path: '/employer/profile', 
      icon: faUser,
  }
];

/**
 * لایوت اصلی بخش کارفرما
 * این کامپوننت شامل بخش‌های مشترک پنل کارفرمایان مانند ساید‌بار و احراز هویت است
 * ساید‌بار و محتوا هر دو در عرض مشخص شده توسط هدر قرار می‌گیرند
 */
export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout: authLogout } = useAuthActions();
  // دریافت اطلاعات کاربر از store
  const user = useAuthStore(state => state.user);

  // بررسی اینکه آیا در صفحه‌ای هستیم که آیتم منو با آن تطبیق دارد
  const isActiveMenuItem = (path: string) => {
    if (path === pathname) return true;
    // برای آگهی‌ها: فقط صفحات جزئیات و ویرایش، نه صفحه درج جدید
    if (path === '/employer/jobs' && pathname?.startsWith('/employer/jobs/') && !pathname?.includes('/create')) return true;
    if (path === '/employer/companies' && pathname?.startsWith('/employer/companies/')) return true;
    if (path === '/employer/applications' && pathname?.startsWith('/employer/applications/')) return true;
    return false;
  };

  // حرف اول نام برای نمایش در آواتار
  const getAvatarText = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return 'ک';
  };

  // کامپوننت آواتار پیش‌فرض به جای حرف اول نام
  const UserDefaultAvatar = () => (
    <FontAwesomeIcon
      icon={faUser}
      style={{
        fontSize: '1rem',
        color: '#fff',
      }}
    />
  );

  return (
    <ThemeRegistry>
      <EmployerAuthRequired>
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: '#f8fafd',
            direction: 'rtl',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: { xs: 2, sm: 3 }
          }}
        >
          {/* کانتینر اصلی که هم سایدبار و هم محتوا را در بر می‌گیرد */}
          <Container 
            maxWidth="lg" 
            sx={{ 
              px: { xs: '16px', sm: '24px' } 
            }}
          >
            {/* فلکس باکس داخلی برای چیدمان سایدبار و محتوا */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse', // برای RTL: ساید‌بار سمت راست، محتوا سمت چپ
                width: '100%',
                maxWidth: '1200px',
                mx: 'auto'
              }}
            >
              {/* ساید‌بار دسکتاپ - با همان منوی موبایل */}
              <Box
                component="nav"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: 240,
                  flexShrink: 0,
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: 'calc(100vh - 130px)',
                  overflowY: 'auto',
                  position: 'sticky',
                  top: 130,
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  '&::-webkit-scrollbar': {
                    width: 4,
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#ddd',
                    borderRadius: 2,
                  },
                }}
              >
                {/* پروفایل کارفرما - مشابه هدر */}
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
                      bgcolor: EMPLOYER_THEME.primary,
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1.5rem',
                      mb: 1
                    }}
                  >
                    {user?.full_name ? getAvatarText() : <UserDefaultAvatar />}
                  </Avatar>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {user?.full_name || 'کارفرما'}
                  </Typography>
                  
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(90deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
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
                      کارفرما
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 1.5 }} />
                
                {/* منوی اصلی - همان منوی موبایل */}
                <List sx={{ px: 1, width: '100%', pb: 2 }}>
                  {employerMenuItems.map((item) => (
                    <ListItem key={item.path} sx={{ p: 0.5 }}>
                      <ListItemButton 
                        component={Link}
                        href={item.path}
                        selected={isActiveMenuItem(item.path)}
                        sx={{
                          borderRadius: 1,
                          py: 1,
                          width: '100%',
                          '&.Mui-selected': {
                            bgcolor: 'rgba(0, 168, 107, 0.08)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 168, 107, 0.12)',
                            },
                            '& .MuiListItemIcon-root': {
                              color: EMPLOYER_THEME.primary,
                            },
                            '& .MuiListItemText-primary': {
                              color: EMPLOYER_THEME.primary,
                              fontWeight: 'bold'
                            }
                          },
                          '&:hover': {
                            bgcolor: 'rgba(0, 168, 107, 0.06)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: 56,
                          color: isActiveMenuItem(item.path) ? EMPLOYER_THEME.primary : 'text.secondary',
                        }}>
                          <FontAwesomeIcon 
                            icon={item.icon} 
                            style={{ fontSize: '1.1rem' }} 
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: isActiveMenuItem(item.path) ? 'bold' : 'normal'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
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
                  gap: 2
                }}
              >
                {/* کامپوننت محتوا که به صورت پویا تغییر می‌کند */}
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
      </EmployerAuthRequired>
    </ThemeRegistry>
  );
} 