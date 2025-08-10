'use client';

import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';

// تبدیل اعداد انگلیسی به فارسی برای نمایش
export const convertEnglishToPersian = (str: string): string => {
  if (!str) return str;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, match => persianDigits[parseInt(match)]);
};

// تبدیل اعداد فارسی به انگلیسی برای ارسال به سرور
export const convertPersianToEnglish = (str: string): string => {
  if (!str) return str;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[۰-۹]/g, match => persianDigits.indexOf(match).toString());
};

interface NumberTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile?: boolean; // اضافه شد
}

const NumberTextField: React.FC<NumberTextFieldProps> = ({ value, onChange, sx, isMobile = false, ...props }) => {
  const [displayValue, setDisplayValue] = useState('');

  // همگام‌سازی با value خارجی
  useEffect(() => {
    const newDisplayValue = typeof value === 'string' ? convertEnglishToPersian(value) : String(value || '');
    setDisplayValue(newDisplayValue);
  }, [value]);

  // مدیریت تغییرات داخلی
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const englishValue = convertPersianToEnglish(inputValue);
    const persianValue = convertEnglishToPersian(englishValue);
    
    // بروزرسانی نمایش
    setDisplayValue(persianValue);
    
    // ارسال مقدار انگلیسی به والد
    const syntheticEvent = {
      ...event,
      target: {
        ...event.target,
        value: englishValue,
        name: event.target.name // اطمینان از پاس کردن name
      }
    };
    
    // Debug log برای بررسی مقادیر
    console.log('NumberTextField:', {
      inputValue,
      englishValue,
      persianValue,
      name: event.target.name
    });
    
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <TextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      onFocus={(e) => props.onFocus && props.onFocus(e)}
      onBlur={(e) => props.onBlur && props.onBlur(e)}
      inputProps={{
        ...(props.inputProps || {}),
        dir: "ltr", // شماره تلفن همیشه از چپ شروع شود
        ...(isMobile ? { inputMode: 'numeric', type: 'tel' } : {}),
      }}
      sx={{
        '& .MuiInputBase-input': {
          color: EMPLOYER_THEME.primary, // رنگ متن آبی کارفرما
        },
        ...sx
      }}
    />
  );
};

export default NumberTextField; 