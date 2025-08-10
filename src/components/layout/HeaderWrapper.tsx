'use client'

import { useEffect, useState } from 'react'
import Header from './Header'

export default function HeaderWrapper() {
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

  return <Header promoBarClosed={promoBarClosed} promoBarLoaded={promoBarLoaded} />;
} 