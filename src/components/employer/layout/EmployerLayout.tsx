"use client"
import React, { ReactNode, useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  useMediaQuery, 
  Avatar, 
  Badge, 
  Tooltip,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faBuilding,
  faUser,
  faSignOutAlt,
  faBriefcase,
  faClipboardList,
  faCog,
  faBars,
  faBell,
  faChevronLeft,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useAuthActions, useAuthStore } from '@/store/authStore';
import authService from '@/lib/authService';

const drawerWidth = 280;

interface EmployerLayoutProps {
  children: ReactNode;
}

// آیتم‌های منوی سایدبار
const menuItems = [
  { 
    text: 'داشبورد', 
    icon: <FontAwesomeIcon icon={faTachometerAlt} fontSize="1.2rem" />, 
    path: '/employer/dashboard', 
    color: '#2E5BFF' 
  },
  { 
    text: 'آگهی‌های شغلی', 
    icon: <FontAwesomeIcon icon={faBriefcase} fontSize="1.2rem" />, 
    path: '/employer/jobs', 
    color: '#FF6B2B' 
  },
  { 
    text: 'درخواست‌های استخدام', 
    icon: <FontAwesomeIcon icon={faClipboardList} fontSize="1.2rem" />, 
    path: '/employer/applications', 
    color: '#33AC2E' 
  },
  { 
    text: 'پروفایل شرکت', 
    icon: <FontAwesomeIcon icon={faBuilding} fontSize="1.2rem" />, 
    path: '/employer/profile', 
    color: '#7747FF' 
  },
];

export default function EmployerLayout({ children }: EmployerLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [pageTitle, setPageTitle] = useState('پنل کارفرمایان');
  const [notificationCount, setNotificationCount] = useState(0);
  
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isSmScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // استفاده از Zustand با سلکتور برای بهینه‌سازی رندر
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { logout, refreshUserData } = useAuthActions();

  // بارگذاری اطلاعات کاربر در ابتدای کار
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (isAuthenticated) {
          // بررسی اعتبار توکن و دریافت اطلاعات کاربر در صورت نیاز
          await authService.validateAndRefreshTokenIfNeeded();
          
          // دریافت داده‌های به‌روز کاربر
          await refreshUserData();
          
          // بررسی نوع کاربر - در صورتی که کارفرما نباشد، به صفحه اصلی هدایت می‌شود
          if (user && user.user_type !== 'employer' && user.user_type !== 'EM') {
            router.push('/');
            return;
          }
          
          // تنظیم عنوان صفحه براساس مسیر
          const currentMenuItem = menuItems.find(item => pathname === item.path);
          if (currentMenuItem) {
            setPageTitle(currentMenuItem.text);
          }
          
          // دریافت تعداد اعلان‌ها از API
          // این بخش در یک پیاده‌سازی واقعی باید با API واقعی جایگزین شود
          setNotificationCount(3); // مقدار نمونه
        }
      } catch (error) {
        console.error('خطا در بارگذاری اطلاعات کاربر:', error);
      }
    };
    
    loadUserData();
  }, [pathname, isAuthenticated, refreshUserData, user, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('خطا در خروج از حساب کاربری:', error);
    }
  };
  
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // محتوای سایدبار
  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#FAFBFC',
      borderLeft: '1px solid #E0E7FF'
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #E0E7FF'
      }}>
        <Typography variant="h6" component="div" sx={{ 
          fontWeight: 700, 
          color: '#2E5BFF', 
          textAlign: 'center' 
        }}>
          پنل مدیریت کارفرما
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              href={item.path}
              sx={{
                py: 1.5,
                mx: 1,
                mb: 0.5,
                borderRadius: '8px',
                color: pathname === item.path ? '#fff' : '#505A6C',
                bgcolor: pathname === item.path ? item.color : 'transparent',
                '&:hover': {
                  bgcolor: pathname === item.path ? item.color : '#F0F3FF',
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: '40px', 
                color: pathname === item.path ? '#fff' : item.color
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid #E0E7FF' }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<FontAwesomeIcon icon={faSignOutAlt} />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'right',
            py: 1,
            borderRadius: '8px',
          }}
        >
          خروج از حساب کاربری
        </Button>
      </Box>
    </Box>
  );

  // افزودن آگهی شغلی جدید
  const handleAddNewJob = () => {
    router.push('/employer/jobs/add');
  };

  // در صورتی که کاربر احراز هویت نشده باشد، محتوایی نمایش داده نمی‌شود
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F5F6FA', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mr: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <FontAwesomeIcon icon={faBars} />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            {pageTitle}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={handleAddNewJob}
              sx={{
                borderRadius: '8px',
                boxShadow: 'none',
                mr: 2,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              آگهی جدید
            </Button>
            
            <Tooltip title="اعلان‌ها">
              <IconButton 
                color="inherit" 
                onClick={handleNotificationMenuOpen}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <FontAwesomeIcon icon={faBell} />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={notificationMenuAnchor}
              open={Boolean(notificationMenuAnchor)}
              onClose={handleNotificationMenuClose}
              sx={{ mt: 2 }}
            >
              <MenuItem onClick={handleNotificationMenuClose}>
                <Typography variant="body2">اعلان جدید: درخواست استخدام تازه</Typography>
              </MenuItem>
              <MenuItem onClick={handleNotificationMenuClose}>
                <Typography variant="body2">اعلان جدید: بروزرسانی سیستم</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleNotificationMenuClose}>
                <Typography variant="body2" color="primary">مشاهده همه اعلان‌ها</Typography>
              </MenuItem>
            </Menu>
            
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ 
                p: 0,
                ml: 1,
                border: '2px solid #E0E7FF',
                overflow: 'hidden'
              }}
            >
              <Avatar 
                src={user.avatar || "/images/default-avatar.png"} 
                alt={user.name || "کاربر"}
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              sx={{ mt: 2 }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.name || "کاربر"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email || ""}
                </Typography>
              </Box>
              <Divider />
              <MenuItem 
                onClick={() => {
                  handleUserMenuClose();
                  router.push('/employer/profile');
                }}
              >
                <ListItemIcon>
                  <FontAwesomeIcon icon={faUser} fontSize="1.2rem" />
                </ListItemIcon>
                <ListItemText primary="پروفایل" />
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleUserMenuClose();
                  router.push('/settings');
                }}
              >
                <ListItemIcon>
                  <FontAwesomeIcon icon={faCog} fontSize="1.2rem" />
                </ListItemIcon>
                <ListItemText primary="تنظیمات" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faSignOutAlt} fontSize="1.2rem" color="#f44336" />
                </ListItemIcon>
                <ListItemText primary="خروج" sx={{ color: '#f44336' }} />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              direction: 'rtl'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              direction: 'rtl'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function EmployerDashboardStats() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await authService.validateAndRefreshTokenIfNeeded();
        
        const response = await fetch('/api/employer/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`خطا در دریافت آمار: ${response.status}`);
        }
        
        const data = await response.json();
        setStats({
          totalJobs: data.total_jobs || 0,
          activeJobs: data.active_jobs || 0,
          totalApplications: data.total_applications || 0,
          newApplications: data.new_applications || 0
        });
      } catch (error) {
        console.error('خطا در دریافت آمار داشبورد:', error);
        setError('خطا در دریافت اطلاعات داشبورد. لطفا دوباره تلاش کنید.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return { stats, loading, error };
} 