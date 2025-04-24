'use client'

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LoginIcon from '@mui/icons-material/Login';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { 
      title: 'کارفرما هستم', 
      color: 'employer', 
      href: '#', 
      variant: 'text', 
      icon: <WorkOutlineIcon fontSize="small" />
    },
    { 
      title: 'فریلنسر هستم', 
      color: 'candidate', 
      href: '#', 
      variant: 'text', 
      icon: <EngineeringIcon fontSize="small" />
    },
    { 
      title: 'راهنما', 
      color: 'inherit', 
      href: '#', 
      variant: 'text', 
      icon: <HelpOutlineIcon fontSize="small" />
    },
    { 
      title: 'ورود / ثبت‌نام', 
      color: 'primary', 
      href: '#', 
      variant: 'contained', 
      icon: <LoginIcon fontSize="small" />
    }
  ];

  const drawer = (
    <Box sx={{ textAlign: 'center', pt: 1, pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
        <Typography variant="h5" component="div" 
          sx={{ 
            fontWeight: 800, 
            color: theme.palette.primary.main,
            backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}
        >
          ماهرکار
        </Typography>
        <IconButton
          color="inherit"
          aria-label="close drawer"
          edge="end"
          onClick={handleDrawerToggle}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2, mt: 1 }} />
      <List sx={{ px: 2 }}>
        {navItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component="a" 
              href={item.href}
              sx={{ 
                borderRadius: 2,
                textAlign: 'center',
                py: 1,
                ...(item.variant === 'contained' 
                  ? { 
                      bgcolor: item.color === 'primary' 
                        ? theme.palette.primary.main 
                        : item.color === 'employer'
                          ? theme.palette.employer.main
                          : theme.palette.candidate.main,
                      color: '#fff',
                      '&:hover': {
                        bgcolor: item.color === 'primary' 
                          ? theme.palette.primary.dark 
                          : item.color === 'employer'
                            ? theme.palette.employer.dark
                            : theme.palette.candidate.dark,
                      }
                    } 
                  : {}),
                ...(item.color === 'employer' && item.variant === 'text' 
                  ? { color: theme.palette.employer.main } 
                  : {}),
                ...(item.color === 'candidate' && item.variant === 'text' 
                  ? { color: theme.palette.candidate.main } 
                  : {})
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
                <ListItemText primary={item.title} />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      color="default"
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'box-shadow 0.3s ease',
        '&.MuiPaper-root': {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: { xs: 'center', md: 'space-between' }, px: { xs: 0, sm: 2 }, position: 'relative' }}>
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
              position: { xs: 'absolute', md: 'static' },
              left: { xs: '50%', md: 'auto' },
              transform: { xs: 'translateX(-50%)', md: 'none' }
            }}
          >
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              ماهرکار
            </Link>
          </Typography>

          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 2.5,
            mr: { md: 2 }
          }}>
            {navItems.map((item, index) => (
              <Button 
                key={index}
                variant={item.variant as "text" | "contained" | "outlined"}
                color={item.color === 'employer' 
                  ? 'primary' 
                  : item.color === 'candidate' 
                    ? 'secondary' 
                    : (item.color as any)}
                component="a"
                href={item.href}
                startIcon={item.icon}
                sx={{ 
                  borderRadius: '10px',
                  fontWeight: 600,
                  px: item.variant === 'contained' ? 2.5 : 1.5,
                  py: item.variant === 'contained' ? 1 : 0.75,
                  minWidth: item.variant === 'contained' ? 140 : 'auto',
                  transition: 'all 0.3s ease',
                  ...(item.color === 'employer' && item.variant === 'text' 
                    ? { 
                        color: theme.palette.employer.main,
                        border: '1px solid transparent',
                        '&:hover': {
                          backgroundColor: `${theme.palette.employer.main}10`,
                          transform: 'translateY(-3px)',
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
                          transform: 'translateY(-3px)',
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
                          transform: 'translateY(-3px)',
                          border: `1px solid ${theme.palette.divider}`,
                        }
                      } 
                    : {}),
                  ...(item.variant === 'contained'
                    ? {
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        '&:hover': {
                          boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                          transform: 'translateY(-3px)'
                        }
                      }
                    : {})
                }}
              >
                {item.title}
              </Button>
            ))}
          </Box>
          
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ 
              display: { md: 'none' },
              position: { xs: 'absolute', md: 'static' },
              right: { xs: 16, md: 'auto' },
              top: '50%',
              transform: { xs: 'translateY(-50%)', md: 'none' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
} 