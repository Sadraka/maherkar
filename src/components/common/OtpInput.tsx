'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

// کامپوننت استایل شده برای هر سلول ورودی OTP
const StyledInput = styled('input')(({ theme }) => ({
  width: '100%',
  height: '100%',
  border: `1.5px solid ${theme.palette.grey[300]}`,
  borderRadius: '8px',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  textAlign: 'center',
  caretColor: theme.palette.primary.main,
  outline: 'none',
  padding: 0,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  '&:focus': {
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    transform: 'translateY(-2px)',
  },
  '&.error': {
    border: `1.5px solid ${theme.palette.error.main}`,
    backgroundColor: `${theme.palette.error.main}05`,
    '&:focus': {
      border: `2px solid ${theme.palette.error.main}`,
      boxShadow: `0 0 0 3px ${theme.palette.error.main}20`,
      transform: 'translateY(-2px)',
    },
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    border: `1.5px solid ${theme.palette.grey[200]}`,
  },
}));

// کامپوننت مستقل برای نمایش پیام خطا
const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div style={{
      width: '100%',
      textAlign: 'center',
      color: '#d32f2f', // رنگ خطای Material UI
      fontSize: '0.8rem',
      marginTop: '12px',
      fontFamily: 'inherit',
      direction: 'rtl',
      position: 'relative',
      animation: 'fadeIn 0.3s ease-in-out',
    }} dir="rtl">
      {message}
    </div>
  );
};

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  error = false,
  helperText,
  disabled = false,
  autoFocus = false,
}) => {
  const theme = useTheme();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [localValue, setLocalValue] = useState<string[]>(
    value.split('').concat(Array(length - value.length).fill(''))
  );

  // تبدیل اعداد فارسی به انگلیسی
  const convertPersianToEnglish = (str: string): string => {
    if (!str) return str;
    
    // تبدیل اعداد فارسی به انگلیسی (کد یونیکد ۰۶۰۰-۰۶۶۹)
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    // تبدیل اعداد عربی به انگلیسی (کد یونیکد ۰۶۶۰-۰۶۶۹)
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    
    let result = str;
    
    // تبدیل اعداد فارسی
    result = result.replace(/[۰-۹]/g, match => String(persianDigits.indexOf(match)));
    
    // تبدیل اعداد عربی
    result = result.replace(/[٠-٩]/g, match => String(arabicDigits.indexOf(match)));
    
    return result;
  };

  // ایجاد رفرنس برای هر سلول
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // آپدیت مقدار محلی وقتی مقدار از بیرون تغییر کند
  useEffect(() => {
    setLocalValue(value.split('').concat(Array(length - value.length).fill('')));
  }, [value, length]);

  // هندل کردن تغییرات در هر سلول
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const target = e.target;
    const newValue = target.value;
    
    // فقط اعداد را قبول کن
    if (newValue && !/^\d+$/.test(newValue)) {
      return;
    }
    
    // مدیریت حالتی که کاربر چند رقم را کپی و پیست می‌کند
    if (newValue.length > 1) {
      const digits = newValue.split('');
      const newValues = [...localValue];
      
      // توزیع ارقام کپی شده در سلول‌های مناسب
      for (let i = 0; i < digits.length && index + i < length; i++) {
        newValues[index + i] = digits[i];
      }
      
      setLocalValue(newValues);
      onChange(newValues.join(''));
      
      // حرکت به سلول مناسب بعد از پیست
      const nextIndex = Math.min(index + newValue.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }
    
    const newValues = [...localValue];
    newValues[index] = newValue;
    setLocalValue(newValues);
    onChange(newValues.join(''));
    
    // حرکت به سلول بعدی اگر مقدار وارد شد
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // مدیریت کلیدهای خاص مانند Backspace, Delete, Arrow keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const target = e.target as HTMLInputElement;
    
    // بررسی اعداد فارسی و عربی در هنگام تایپ مستقیم
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    
    if (persianDigits.includes(e.key)) {
      // جلوگیری از رفتار پیش‌فرض برای اعداد فارسی
      e.preventDefault();
      
      // تبدیل عدد فارسی به انگلیسی
      const englishDigit = String(persianDigits.indexOf(e.key));
      
      // اعمال تغییر به صورت دستی
      const newValues = [...localValue];
      newValues[index] = englishDigit;
      setLocalValue(newValues);
      onChange(newValues.join(''));
      
      // حرکت به سلول بعدی
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      
      return;
    } else if (arabicDigits.includes(e.key)) {
      // جلوگیری از رفتار پیش‌فرض برای اعداد عربی
      e.preventDefault();
      
      // تبدیل عدد عربی به انگلیسی
      const englishDigit = String(arabicDigits.indexOf(e.key));
      
      // اعمال تغییر به صورت دستی
      const newValues = [...localValue];
      newValues[index] = englishDigit;
      setLocalValue(newValues);
      onChange(newValues.join(''));
      
      // حرکت به سلول بعدی
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      
      return;
    }
    
    switch (e.key) {
      case 'Backspace':
        if (!target.value && index > 0) {
          // اگر سلول فعلی خالی است، به سلول قبلی برو و مقدارش را پاک کن
          const newValues = [...localValue];
          newValues[index - 1] = '';
          setLocalValue(newValues);
          onChange(newValues.join(''));
          inputRefs.current[index - 1]?.focus();
        }
        break;
        
      case 'Delete':
        if (target.value) {
          // مقدار سلول فعلی را پاک کن
          const newValues = [...localValue];
          newValues[index] = '';
          setLocalValue(newValues);
          onChange(newValues.join(''));
        }
        break;
        
      case 'ArrowLeft':
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          // جلوگیری از حرکت کرسر در داخل سلول
          e.preventDefault();
        }
        break;
        
      case 'ArrowRight':
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
          // جلوگیری از حرکت کرسر در داخل سلول
          e.preventDefault();
        }
        break;
        
      default:
        break;
    }
  };

  // مدیریت پیست شدن
  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // اگر داده‌های پیست شده عددی نیستند، از پردازش صرف نظر کن
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits = pastedData.split('');
    const newValues = [...localValue];
    
    // توزیع ارقام در سلول‌های مناسب
    for (let i = 0; i < digits.length && index + i < length; i++) {
      newValues[index + i] = digits[i];
    }
    
    setLocalValue(newValues);
    onChange(newValues.join(''));
    
    // فوکوس روی سلول مناسب بعد از پیست
    const focusIndex = Math.min(index + digits.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };
  
  // مدیریت کلیک روی سلول‌ها
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.select();
  };

  // ساخت آرایه معکوس برای نمایش از چپ به راست
  const renderInputs = () => {
    const inputs = [];
    for (let i = 0; i < length; i++) {
      inputs.push(
        <Box 
          key={i} 
          sx={{ 
            width: { xs: '42px', sm: '50px' },
            height: { xs: '50px', sm: '58px' },
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)'
            }
          }}
        >
          <StyledInput
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={localValue[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={(e) => handlePaste(e, i)}
            onClick={handleClick}
            className={error ? 'error' : ''}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            aria-label={`کد تایید رقم ${i + 1}`}
            style={{ direction: 'ltr' }}
          />
        </Box>
      );
    }
    // معکوس کردن ترتیب فیلدها برای نمایش از چپ به راست در محیط RTL
    return inputs.reverse(); 
  };

  return (
    <div style={{ width: '100%' }}>
      <Box 
        sx={{ 
          display: 'flex',
          direction: 'ltr',
          justifyContent: 'center',
          gap: { xs: 1.5, sm: 2.5 },
          marginY: 2
        }}
      >
        {renderInputs()}
      </Box>
      
      {error && helperText && <ErrorMessage message={helperText} />}
    </div>
  );
};

export default OtpInput; 