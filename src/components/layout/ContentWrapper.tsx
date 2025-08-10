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
  const [promoBarClosed, setPromoBarClosed] = useState(false);
  const [promoBarLoaded, setPromoBarLoaded] = useState(false);

  // گوش دادن به رویداد بسته شدن پرومو بار
  useEffect(() => {
    const handlePromoBarClosed = () => {
      setPromoBarClosed(true);
    };

    const handlePromoBarLoaded = () => {
      setPromoBarLoaded(true);
    };

    window.addEventListener('promoBarClosed', handlePromoBarClosed);
    window.addEventListener('promoBarLoaded', handlePromoBarLoaded);
    
    return () => {
      window.removeEventListener('promoBarClosed', handlePromoBarClosed);
      window.removeEventListener('promoBarLoaded', handlePromoBarLoaded);
    };
  }, []);

  return (
    <Box sx={{ 
      pt: isAuthPage ? 0 : '60px',
      transition: 'padding-top 0.3s ease'
    }}>
      {children}
    </Box>
  );
} 