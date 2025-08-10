'use client'

import { Box } from '@mui/material';
import { HeaderProvider } from '@/contexts/HeaderContext';
import AppHeaderNew from './AppHeaderNew';
import MobileMenu from './MobileMenu';
import MenuPopover from './MenuPopover';
import { useJobStatsStore } from '@/store/jobStatsStore';

interface HeaderProps {
  promoBarClosed?: boolean;
  promoBarLoaded?: boolean;
}

export default function Header({ promoBarClosed = false, promoBarLoaded = false }: HeaderProps) {
  
  return (
    <HeaderProvider>
      <Box 
        sx={{ position: 'fixed', top: 0, zIndex: 1199 }}
        data-testid="main-header"
      >
        <AppHeaderNew promoBarClosed={promoBarClosed} promoBarLoaded={promoBarLoaded} />
        <MenuPopover />
      </Box>
      <MobileMenu />
    </HeaderProvider>
  );
} 