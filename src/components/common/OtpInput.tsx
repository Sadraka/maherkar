'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EMPLOYER_THEME } from '@/constants/colors';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

// تبدیل اعداد انگلیسی به فارسی برای نمایش
const convertToPersian = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, match => persianDigits[parseInt(match)]);
};

// تبدیل اعداد فارسی به انگلیسی برای ارسال به سرور
const convertToEnglish = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[۰-۹]/g, match => persianDigits.indexOf(match).toString());
};

const StyledInput = styled('input')({
  width: '100%',
  height: '100%',
  border: `2px solid ${EMPLOYER_THEME.bgLight}`,
  borderRadius: '16px',
  fontSize: '1.6rem',
  fontWeight: '700',
  textAlign: 'center',
  outline: 'none',
  backgroundColor: '#ffffff',
  color: EMPLOYER_THEME.primary, // رنگ متن آبی کارفرما
  fontFamily: 'IRANSansX, sans-serif',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 2px 8px ${EMPLOYER_THEME.bgVeryLight}`,
  '&:focus': {
    border: `2px solid ${EMPLOYER_THEME.primary}`,
    boxShadow: `0 0 0 4px ${EMPLOYER_THEME.bgLight}, 0 4px 12px ${EMPLOYER_THEME.bgLight}`,
    transform: 'translateY(-2px) scale(1.02)',
    backgroundColor: '#ffffff',
    color: EMPLOYER_THEME.primary, // اطمینان از رنگ متن در حالت focus
  },
  '&:hover:not(:focus)': {
    border: `2px solid ${EMPLOYER_THEME.light}`,
    boxShadow: `0 4px 12px ${EMPLOYER_THEME.bgLight}`,
    transform: 'translateY(-1px)',
    backgroundColor: '#fafbff',
    color: EMPLOYER_THEME.primary, // اطمینان از رنگ متن در حالت hover
  },
  '&.error': {
    border: '2px solid #ef4444',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    '&:focus': {
      border: '2px solid #ef4444',
      boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.15), 0 4px 12px rgba(239, 68, 68, 0.2)',
      color: '#dc2626', // رنگ قرمز در حالت خطا
    },
    '&:hover': {
      backgroundColor: '#fef2f2',
      border: '2px solid #f87171',
      color: '#dc2626', // رنگ قرمز در حالت خطا
    },
  },
  '&:disabled': {
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    border: '2px solid #e2e8f0',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
});

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  error = false,
  helperText,
  disabled = false,
  autoFocus = false,
  onFocus,
  onBlur,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [values, setValues] = useState<string[]>(Array(length).fill(''));

  // همگام‌سازی با value خارجی
  useEffect(() => {
    const newValues = Array(length).fill('');
    for (let i = 0; i < value.length && i < length; i++) {
      newValues[i] = value[i] || '';
    }
    setValues(newValues);
  }, [value, length]);

  const updateValue = (newValues: string[]) => {
    setValues(newValues);
    onChange(newValues.join(''));
  };

  const handleInputChange = (index: number, inputValue: string) => {
    // تبدیل اعداد فارسی به انگلیسی
    const englishValue = convertToEnglish(inputValue);
    
    // فقط اعداد انگلیسی قبول کن
    if (!/^[0-9]*$/.test(englishValue)) return;

    const newValues = [...values];
    
    if (englishValue.length > 1) {
      // اگر چند رقم پیست شده
      const digits = englishValue.split('').slice(0, length - index);
      for (let i = 0; i < digits.length; i++) {
        if (index + i < length) {
          newValues[index + i] = digits[i];
        }
      }
      updateValue(newValues);
      
      // فوکوس روی آخرین خانه پر شده
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // یک رقم وارد شده
      newValues[index] = englishValue;
      updateValue(newValues);
      
      // اگر رقم وارد شده و خانه بعدی وجود دارد، به آن برو
      if (englishValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const newValues = [...values];
      
      if (values[index]) {
        // اگر خانه فعلی پر است، آن را خالی کن
        newValues[index] = '';
        updateValue(newValues);
      } else if (index > 0) {
        // اگر خانه فعلی خالی است، به خانه قبلی برو و آن را خالی کن
        newValues[index - 1] = '';
        updateValue(newValues);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    // تبدیل اعداد فارسی به انگلیسی و حذف غیر اعداد
    const englishText = convertToEnglish(pastedText);
    const pastedData = englishText.replace(/\D/g, '');
    
    if (pastedData) {
      const newValues = Array(length).fill('');
      const digits = pastedData.split('').slice(0, length);
      
      for (let i = 0; i < digits.length; i++) {
        newValues[i] = digits[i];
      }
      
      updateValue(newValues);
      
      // فوکوس روی آخرین خانه پر شده یا آخرین خانه
      const focusIndex = Math.min(digits.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 3,
      py: 2 
    }}>
      {/* کانتینر input ها */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: { xs: 1.5, sm: 2 }, 
          justifyContent: 'center', 
          alignItems: 'center',
          px: 1,
        }}
      >
        {Array.from({ length }, (_, index) => {
          // معکوس کردن index برای نمایش درست در RTL
          const reverseIndex = length - 1 - index;
          return (
            <Box
              key={reverseIndex}
              sx={{
                width: { xs: '48px', sm: '56px', md: '64px' },
                height: { xs: '56px', sm: '64px', md: '72px' },
                position: 'relative',
              }}
            >
              <StyledInput
                ref={(el) => { inputRefs.current[reverseIndex] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={convertToPersian(values[reverseIndex] || '')}
                onChange={(e) => handleInputChange(reverseIndex, e.target.value)}
                onKeyDown={(e) => handleKeyDown(reverseIndex, e)}
                onPaste={handlePaste}
                onFocus={() => { if (onFocus) onFocus(); }}
                onBlur={() => { if (onBlur) onBlur(); }}
                className={error ? 'error' : ''}
                disabled={disabled}
                autoFocus={autoFocus && reverseIndex === 0}
              />
            </Box>
          );
        })}
      </Box>
      
      {/* نمایش خطا */}
      {error && helperText && (
        <Box sx={{
          color: '#ef4444',
          fontSize: '0.875rem',
          textAlign: 'center',
          direction: 'rtl',
          fontWeight: '500',
          px: 2,
          py: 1,
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          {helperText}
        </Box>
      )}
    </Box>
  );
};

export default OtpInput; 