'use client'

import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ContentWrapperProps {
  children: React.ReactNode
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isVerificationPage = pathname?.includes('/verification/complete');

  return (
    <Box sx={{ 
      pt: (isAuthPage || isVerificationPage) ? 0 : '60px',
      position: 'relative'
    }}>
      {children}
    </Box>
  );
}