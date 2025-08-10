'use client';

import React, { useEffect } from 'react';
import { JOB_SEEKER_THEME, EMPLOYER_THEME, ADMIN_THEME } from '@/constants/colors';

interface ScrollbarProviderProps {
  children: React.ReactNode;
  userType?: 'jobseeker' | 'employer' | 'admin' | 'guest';
}

const ScrollbarProvider: React.FC<ScrollbarProviderProps> = ({ children, userType = 'guest' }) => {
  useEffect(() => {
    const getThemeColor = () => {
      switch (userType) {
        case 'jobseeker':
          return JOB_SEEKER_THEME.primary;
        case 'employer':
          return EMPLOYER_THEME.primary;
        case 'admin':
          return ADMIN_THEME.primary;
        default:
          return '#6b7280'; // خاکستری برای کاربران مهمان
      }
    };

    const primaryColor = getThemeColor();

    // تبدیل رنگ hex یا rgb به rgba
    const colorToRgba = (color: string, alpha: number) => {
      // اگر رنگ به صورت rgb است
      if (color.startsWith('rgb(')) {
        const rgbValues = color.match(/\d+/g);
        if (rgbValues && rgbValues.length >= 3) {
          const r = parseInt(rgbValues[0]);
          const g = parseInt(rgbValues[1]);
          const b = parseInt(rgbValues[2]);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
      }
      
      // اگر رنگ به صورت hex است
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      
      // اگر رنگ به صورت نام است، به hex تبدیل کنیم
      return color;
    };

    const scrollbarColor = colorToRgba(primaryColor, 0.3);
    const scrollbarHoverColor = colorToRgba(primaryColor, 0.5);

    // اعمال استایل‌های اسکرول‌بار
    const style = document.createElement('style');
    style.textContent = `
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb {
        background: ${scrollbarColor} !important;
        border-radius: 3px;
        transition: background 0.2s ease;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${scrollbarHoverColor} !important;
      }

      ::-webkit-scrollbar-corner {
        background: transparent;
      }

      * {
        scrollbar-width: thin !important;
        scrollbar-color: ${scrollbarColor} transparent !important;
      }

      @media (prefers-color-scheme: dark) {
        ::-webkit-scrollbar-thumb {
          background: ${colorToRgba(primaryColor, 0.4)} !important;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${colorToRgba(primaryColor, 0.6)} !important;
        }
        
        * {
          scrollbar-color: ${colorToRgba(primaryColor, 0.4)} transparent !important;
        }
      }
    `;

    // حذف استایل قبلی اگر وجود دارد
    const existingStyle = document.getElementById('dynamic-scrollbar-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    style.id = 'dynamic-scrollbar-style';
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      const styleElement = document.getElementById('dynamic-scrollbar-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [userType]);

  return <>{children}</>;
};

export default ScrollbarProvider; 