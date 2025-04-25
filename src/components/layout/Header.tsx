'use client'

import { Box } from '@mui/material';
import { HeaderProvider } from '@/contexts/HeaderContext';
import AppHeaderNew from './AppHeaderNew';
import MobileMenuV2 from './MobileMenuV2';
import MenuPopover from './MenuPopover';

export default function Header() {
  return (
    <HeaderProvider>
      <Box sx={{ position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
        <AppHeaderNew />
        <MenuPopover />
      </Box>
      <MobileMenuV2 />
    </HeaderProvider>
  );
} 