'use client'

import { Box } from '@mui/material';
import { HeaderProvider } from '@/contexts/HeaderContext';
import AppHeader from './AppHeader';
import MobileMenu from './MobileMenu';
import MenuPopover from './MenuPopover';

export default function Header() {
  return (
    <HeaderProvider>
      <Box sx={{ position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
        <AppHeader />
        <MenuPopover />
      </Box>
      <MobileMenu />
    </HeaderProvider>
  );
} 