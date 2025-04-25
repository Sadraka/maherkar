'use client'

import React, { useContext, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Badge,
  Tooltip,
  Avatar,
  useMediaQuery
} from '@mui/material';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faQuestion, 
  faBuilding, 
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { HeaderContext } from '@/contexts/HeaderContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { styled } from '@mui/material/styles';

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
    isAuthenticated,
    user,
    userMenuAnchorEl,
    handleUserMenuOpen,
    handleUserMenuClose,
    handleLogout,
  } = useHeaderContext();
  const router = useRouter();

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
      position="static"
      sx={{
        color: 'common.black',
        backgroundColor: 'common.white',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            height: 70,
            px: { xs: 1, md: 2 },
            justifyContent: 'space-between',
          }}
        >
          {/* Logo and Site Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/')}
          >
            <Image
              src="/assets/images/logo.svg"
              alt="ماهرکار"
              width={40}
              height={40}
              style={{ marginLeft: '10px' }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                color: (theme) => theme.palette.primary.main,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              ماهرکار
            </Typography>
          </Box>

          {/* Navigation Links - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                sx={{
                  color: 'text.primary',
                  mx: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                onMouseEnter={item.hasSubmenu ? () => handleOpenMenu(item.id) : undefined}
                onClick={!item.hasSubmenu ? () => router.push(item.route) : undefined}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FontAwesomeIcon icon={item.icon} size="sm" />
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>

          {/* Mobile Menu Trigger */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ p: 1 }}
            >
              <Box
                component="img"
                src="/assets/images/icons/menu.svg"
                alt="menu"
                sx={{ width: 24, height: 24 }}
              />
            </IconButton>
          </Box>

          {/* Right side buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
            {/* Authentication Buttons or User Profile */}
            {isAuthenticated ? (
              <>
                {/* Notification Bell for logged in users */}
                <Tooltip title="اعلان‌ها">
                  <IconButton 
                    color="default" 
                    sx={{ 
                      mr: 1,
                      transition: 'all 0.2s',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                {/* User Avatar */}
                <Tooltip title="پروفایل کاربری">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      p: 0,
                      border: '2px solid',
                      borderColor: 'primary.light',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Avatar alt="user" src={user?.avatar || ''} sx={{ width: 35, height: 35 }}>
                      {!user?.avatar && <PersonIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                {/* User Menu */}
                <Menu
                  anchorEl={userMenuAnchorEl}
                  open={Boolean(userMenuAnchorEl)}
                  onClose={handleUserMenuClose}
                  sx={{ mt: '45px' }}
                >
                  <MenuItem onClick={() => router.push('/dashboard')}>داشبورد</MenuItem>
                  <MenuItem onClick={() => router.push('/profile')}>پروفایل</MenuItem>
                  <MenuItem onClick={handleLogout}>خروج</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => router.push('/login')}
                  sx={{
                    color: 'text.primary',
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: 'primary.main' },
                  }}
                  startIcon={<LoginIcon />}
                >
                  ورود
                </Button>
                <Button
                  variant="text"
                  onClick={() => router.push('/register')}
                  sx={{
                    color: 'text.primary',
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: 'primary.main' },
                  }}
                  startIcon={<HowToRegIcon />}
                >
                  ثبت‌نام
                </Button>
                
                {/* Mobile Authentication Icon */}
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <IconButton
                    color="inherit"
                    onClick={() => router.push('/login')}
                    sx={{ '&:hover': { color: 'primary.main' } }}
                  >
                    <LoginIcon />
                  </IconButton>
                </Box>
              </>
            )}
            
            {/* Post Ad Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/post-job')}
              sx={{
                borderRadius: '8px',
                py: { xs: 0.5, md: 0.8 },
                px: { xs: 1, md: 2 },
                fontSize: { xs: '0.75rem', md: '0.85rem' },
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(0, 112, 244, 0.25)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0, 112, 244, 0.35)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              ثبت آگهی
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 