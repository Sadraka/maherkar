"use client"
import React, { ReactNode } from 'react';
import { Box, Drawer, AppBar, Toolbar, IconButton, Typography, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Container, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { EMPLOYER_BLUE } from '../../../constants/colors';

const drawerWidth = 240;

interface EmployerLayoutProps {
  children: ReactNode;
}

// آیتم‌های منوی سایدبار
const menuItems = [
  { text: 'داشبورد', icon: <DashboardIcon />, path: '/employer/dashboard' },
  { text: 'آگهی‌های شغلی', icon: <WorkIcon />, path: '/employer/jobs' },
  { text: 'پروفایل', icon: <PersonIcon />, path: '/employer/profile' },
];

export default function EmployerLayout({ children }: EmployerLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isSmScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // منطق خروج از حساب کاربری
    console.log('خروج از حساب کاربری');
    // پاک کردن کوکی‌ها و انتقال به صفحه اصلی
    router.push('/');
  };

  const drawer = (
    <Box sx={{ bgcolor: 'background.paper', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ color: EMPLOYER_BLUE, fontWeight: 700 }}>
          پنل کارفرمایان
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Link href={item.path} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'rgba(65, 135, 255, 0.08)',
                    borderRight: `3px solid ${EMPLOYER_BLUE}`,
                    '&:hover': {
                      bgcolor: 'rgba(65, 135, 255, 0.12)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: pathname === item.path ? EMPLOYER_BLUE : 'inherit',
                  minWidth: 40 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="خروج" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mr: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ ml: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {menuItems.find(item => pathname === item.path)?.text || 'پنل کارفرمایان'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* نسخه موبایل */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // برای بهبود عملکرد در موبایل
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* نسخه دسکتاپ */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderLeft: 'none' },
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
          mt: '64px', // ارتفاع AppBar
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
} 