'use client';

import { useEffect, useState } from 'react';

export default function FontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // بررسی اینکه آیا فونت‌ها لود شده‌اند یا نه
    const checkFontsLoaded = async () => {
      try {
        await document.fonts.ready;
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Font loading check failed:', error);
        // در صورت خطا، بعد از 2 ثانیه فونت‌ها را لود شده در نظر بگیر
        setTimeout(() => setFontsLoaded(true), 2000);
      }
    };

    checkFontsLoaded();
  }, []);

  useEffect(() => {
    // اضافه کردن کلاس به body وقتی فونت‌ها لود شدند
    if (fontsLoaded) {
      document.body.classList.add('fonts-loaded');
    }
  }, [fontsLoaded]);

  return null;
}