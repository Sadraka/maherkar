'use client';

import React, { useState } from 'react';
import { Box, Container, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Divider, Avatar, Collapse } from '@mui/material';
import JobSeekerAuthRequired from '@/components/auth/JobSeekerAuthRequired';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUser,
  faFileAlt,
  faClipboardList,
  faBullhorn,
  faSearch,
  faChevronDown,
  faChevronUp,
  faEye,
  faEdit,
  faBriefcase,
  faGraduationCap,
  faTools,
  faPlus,
  faList
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/store/authStore';

// آیتم‌های منوی کارجو بر اساس بک‌اند موجود
const jobSeekerMenuItems = [
  { 
    title: 'داشبورد', 
    path: '/jobseeker/dashboard', 
    icon: faTachometerAlt,
  },
  { 
    title: 'پروفایل', 
    path: '/jobseeker/profile', 
    icon: faUser,
    hasSubmenu: true,
    submenu: [
      { title: 'اطلاعات شخصی', path: '/jobseeker/resume', icon: faUser },
      { title: 'تجربیات کاری', path: '/jobseeker/resume/experiences', icon: faBriefcase },
      { title: 'تحصیلات', path: '/jobseeker/resume/educations', icon: faGraduationCap },
      { title: 'مهارت‌ها', path: '/jobseeker/resume/skills', icon: faTools },
    ]
  },
  { 
    title: 'آگهی‌های رزومه', 
    path: '/jobseeker/resume-ads', 
    icon: faBullhorn,
  },
  { 
    title: 'درخواست‌های ارسالی', 
    path: '/jobseeker/applications', 
    icon: faClipboardList,
  },
  { 
    title: 'آگهی‌های شغلی', 
    path: '/jobseeker/job-ads', 
    icon: faSearch,
  }
];

/**
 * لایوت اصلی بخش کارجو
 * این کامپوننت شامل بخش‌های مشترک پنل کارجو مانند ساید‌بار و احراز هویت است
 */
export default function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // دریافت اطلاعات کاربر از store
  const user = useAuthStore(state => state.user);
  // state برای مدیریت باز/بسته بودن زیرمنوها
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});
  
  // بررسی اینکه آیا در صفحه‌ای هستیم که آیتم منو با آن تطبیق دارد
  const isActiveMenuItem = (path: string) => {
    if (path === pathname) return true;
    // بررسی برای زیرصفحات
    if (path === '/jobseeker/resume' && pathname?.startsWith('/jobseeker/resume/')) return true;
    if (path === '/jobseeker/applications' && pathname?.startsWith('/jobseeker/applications/')) return true;
    if (path === '/jobseeker/job-ads' && pathname?.startsWith('/jobseeker/job-ads/')) return true;
    if (path === '/jobseeker/resume-ads' && pathname?.startsWith('/jobseeker/resume-ads/')) return true;
    return false;
  };

  // بررسی اینکه آیا یک زیرمنو باید باز باشد
  const shouldSubmenuBeOpen = (item: any) => {
    if (!item.hasSubmenu || !item.submenu) return false;
    return item.submenu.some((subItem: any) => isActiveMenuItem(subItem.path));
  };

  // تغییر وضعیت زیرمنو
  const toggleSubmenu = (itemTitle: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [itemTitle]: !prev[itemTitle]
    }));
  };

  // کامپوننت آواتار پیش‌فرض به جای حرف اول نام
  const UserDefaultAvatar = () => (
    <FontAwesomeIcon
      icon={faUser}
      style={{
        fontSize: '1.2rem',
        color: '#fff',
      }}
    />
  );

  return (
    <JobSeekerAuthRequired>
      <ThemeRegistry>
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
              {/* ساید‌بار دسکتاپ */}
              <Box
                component="nav"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: 240,
                  flexShrink: 0,
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: 'fit-content',
                  position: 'sticky',
                  top: 130,
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'visible',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {/* پروفایل کارجو */}
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
                      bgcolor: JOB_SEEKER_THEME.primary,
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1.5rem',
                      mb: 1
                    }}
                  >
                    {user?.profile_picture ? null : <UserDefaultAvatar />}
                  </Avatar>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {user?.full_name || 'کارجو'}
                  </Typography>
                  
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(90deg, ${JOB_SEEKER_THEME.primary}, ${JOB_SEEKER_THEME.light})`,
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
                      کارجو
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* منوی اصلی */}
                <List sx={{ 
                  px: 1, 
                  width: '100%',
                  pb: 2
                }}>
                    {jobSeekerMenuItems.map((item) => (
                      <Box key={item.path}>
                        {/* آیتم اصلی منو */}
                        <ListItem sx={{ p: 0.5 }}>
                          <ListItemButton
                            component={item.hasSubmenu ? 'div' : Link}
                            href={!item.hasSubmenu ? item.path : undefined}
                            onClick={item.hasSubmenu ? () => toggleSubmenu(item.title) : undefined}
                            selected={isActiveMenuItem(item.path)}
                            sx={{
                              borderRadius: 1,
                              py: 1,
                              width: '100%',
                              '&.Mui-selected': {
                                bgcolor: JOB_SEEKER_THEME.bgLight,
                                '&:hover': {
                                  bgcolor: JOB_SEEKER_THEME.bgVeryLight,
                                },
                                '& .MuiListItemIcon-root': {
                                  color: JOB_SEEKER_THEME.primary,
                                },
                                '& .MuiListItemText-primary': {
                                  color: JOB_SEEKER_THEME.primary,
                                  fontWeight: 'bold'
                                }
                              },
                              '&:hover': {
                                bgcolor: JOB_SEEKER_THEME.bgVeryLight,
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 56,
                                color: isActiveMenuItem(item.path) ? JOB_SEEKER_THEME.primary : 'text.secondary',
                              }}
                            >
                              <FontAwesomeIcon icon={item.icon} style={{ fontSize: '1.1rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.title}
                              primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: isActiveMenuItem(item.path) ? 'bold' : 'normal',
                              }}
                            />
                            {item.hasSubmenu && (
                              <FontAwesomeIcon 
                                icon={openSubmenus[item.title] || shouldSubmenuBeOpen(item) ? faChevronUp : faChevronDown} 
                                style={{ fontSize: '0.8rem', marginLeft: '8px' }} 
                              />
                            )}
                          </ListItemButton>
                        </ListItem>

                        {/* زیرمنو */}
                        {item.hasSubmenu && item.submenu && (
                          <Collapse 
                            in={openSubmenus[item.title] || shouldSubmenuBeOpen(item)} 
                            timeout={300}
                            easing="ease-in-out"
                            unmountOnExit={false}
                          >
                            <List component="div" disablePadding sx={{ 
                              pl: 0,
                              bgcolor: `${JOB_SEEKER_THEME.primary}08`, // پس‌زمینه محو شده
                              borderRadius: 0,
                              mx: 0,
                              py: 0.5,
                              mt: 0.5,
                              mb: 0.5,
                              border: 'none',
                              width: '100%',
                            }}>
                              {item.submenu.map((subItem: any) => (
                                <ListItem key={subItem.path} sx={{ p: 0.5 }}>
                                  <ListItemButton
                                    component={Link}
                                    href={subItem.path}
                                    selected={isActiveMenuItem(subItem.path)}
                                    sx={{
                                      borderRadius: 1,
                                      py: 1,
                                      width: '100%',
                                      minHeight: '40px',
                                      '&.Mui-selected': {
                                        bgcolor: JOB_SEEKER_THEME.bgVeryLight,
                                        borderRight: `3px solid ${JOB_SEEKER_THEME.primary}`,
                                        '&:hover': {
                                          bgcolor: JOB_SEEKER_THEME.bgLight,
                                        },
                                        '& .MuiListItemIcon-root': {
                                          color: JOB_SEEKER_THEME.primary,
                                        },
                                        '& .MuiListItemText-primary': {
                                          color: JOB_SEEKER_THEME.primary,
                                          fontWeight: 'bold'
                                        }
                                      },
                                      '&:hover': {
                                        bgcolor: JOB_SEEKER_THEME.bgVeryLight,
                                      },
                                    }}
                                  >
                                    <ListItemIcon
                                      sx={{
                                        minWidth: 48,
                                        color: isActiveMenuItem(subItem.path) ? JOB_SEEKER_THEME.primary : 'text.secondary',
                                      }}
                                    >
                                      <FontAwesomeIcon icon={subItem.icon} style={{ fontSize: '0.9rem' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={subItem.title}
                                      primaryTypographyProps={{
                                        fontSize: '0.8rem',
                                        fontWeight: isActiveMenuItem(subItem.path) ? 'bold' : 'normal',
                                      }}
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

              {/* محتوای اصلی */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  ml: { md: 3 },
                  width: { xs: '100%', md: 'calc(100% - 240px - 24px)' }
                }}
              >
                {children}
              </Box>
            </Box>
          </Container>
        </Box>
      </ThemeRegistry>
    </JobSeekerAuthRequired>
  );
} 