import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

// تابع تبدیل اعداد فارسی و عربی به انگلیسی
export const convertPersianToEnglish = (str: string): string => {
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

// کامپوننت TextField با پشتیبانی از اعداد فارسی و عربی
const NumberTextField = React.forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => {
  const { onChange, value, ...rest } = props;

  // هندلر برای تبدیل اعداد فارسی و عربی به انگلیسی
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalValue = e.target.value;
    const convertedValue = convertPersianToEnglish(originalValue);
    
    // فقط اگر مقدار تغییر کرده باشد، رویداد جدید ایجاد کنیم
    if (onChange) {
      // به جای ایجاد رویداد جدید، مستقیماً از رویداد اصلی استفاده می‌کنیم
      // و فقط مقدار را تغییر می‌دهیم
      e.target.value = convertedValue;
      onChange(e);
    }
  };

  // هندلر برای تشخیص کلیدهای فارسی و عربی هنگام تایپ
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // اجازه می‌دهیم کلیدها به صورت عادی کار کنند
    // و تبدیل را در handleChange انجام می‌دهیم
  };

  return (
    <TextField
      {...rest}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      ref={ref}
      onPaste={(e) => {
        // تبدیل اعداد فارسی و عربی در هنگام پیست
        const clipboardData = e.clipboardData.getData('text');
        const convertedData = convertPersianToEnglish(clipboardData);
        
        // اگر داده تغییر کرده، رفتار پیش‌فرض را متوقف کن و مقدار تبدیل شده را وارد کن
        if (convertedData !== clipboardData) {
          e.preventDefault();
          const target = e.target as HTMLInputElement;
          const start = target.selectionStart || 0;
          const end = target.selectionEnd || 0;
          
          // ایجاد مقدار جدید با جایگزینی متن انتخاب شده با مقدار پیست شده
          const currentValue = target.value;
          const newValue = currentValue.substring(0, start) + convertedData + currentValue.substring(end);
          
          // ایجاد یک رویداد تغییر مصنوعی
          const syntheticEvent = {
            target: {
              value: newValue,
              name: target.name
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          if (onChange) {
            onChange(syntheticEvent);
          }
          
          // تنظیم موقعیت کرسر بعد از متن پیست شده
          setTimeout(() => {
            target.selectionStart = start + convertedData.length;
            target.selectionEnd = start + convertedData.length;
          }, 0);
        }
      }}
    />
  );
});

NumberTextField.displayName = 'NumberTextField';

export default NumberTextField; 