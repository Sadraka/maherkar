'use client'

import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
        >
          ماهرکار
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Button color="inherit">کارفرما هستم</Button>
          <Button color="inherit">فریلنسر هستم</Button>
          <Button color="inherit">راهنما</Button>
          <Button variant="contained" color="primary">
            ورود / ثبت‌نام
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 