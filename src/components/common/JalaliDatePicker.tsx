'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Popover,
  IconButton, 
  Typography,
  Grid,
  styled
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// تعریف نوع داده‌های مورد استفاده
interface JalaliDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

// ماه‌های شمسی
const persianMonths = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

// الگوریتم دقیق تبدیل تاریخ میلادی به شمسی
const gregorianToJalali = (gy: number, gm: number, gd: number): [number, number, number] => {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = 0;
  
  // تصحیح برای سال کبیسه میلادی
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  
  jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  
  let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  
  return [jy, jm, jd];
};

// الگوریتم دقیق تبدیل تاریخ شمسی به میلادی
const jalaliToGregorian = (jy: number, jm: number, jd: number): [number, number, number] => {
  let days = -355668 + (365 * (jy + 1595)) + Math.floor((jy + 1595) / 33) * 8 + Math.floor(((jy + 1595) % 33 + 3) / 4);
  
  if (jm <= 6) {
    days += (jm - 1) * 31;
  } else {
    days += ((jm - 7) * 30) + 186;
  }
  
  days += (jd - 1);
  
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  
  let gm = 0;
  let gd = days + 1;
  
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) {
    gd -= sal_a[gm];
  }
  
  return [gy, gm, gd];
};

// تعیین آخرین روز ماه در تقویم شمسی
const getJalaliMonthLength = (year: number, month: number): number => {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  
  // اسفند: در سال کبیسه ۳۰ روز، در غیر این صورت ۲۹ روز
  // بررسی کبیسه بودن سال جلالی
  const r = year % 33;
  if (r === 1 || r === 5 || r === 9 || r === 13 || r === 17 || r === 22 || r === 26 || r === 30) {
    return 30;
  }
  return 29;
};

// استایل دادن به روزهای تقویم
const DayButton = styled('button')(({ theme }) => ({
  width: '100%',
  padding: '8px 4px',
  margin: '1px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s, color 0.3s',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
  '&.selected': {
    backgroundColor: '#1976d2',
    color: 'white',
  },
  '&:disabled': {
    opacity: 0.3,
    cursor: 'default',
  },
  fontFamily: 'inherit',
  fontSize: '0.9rem',
}));

// استایل دادن به دکمه‌های سال و ماه
const NavButton = styled(IconButton)(({ theme }) => ({
  padding: '4px',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
  transition: 'all 0.3s ease-in-out',
}));

// استایل برای افکت انیمیشن
const AnimatedBox = styled(Box)(({ theme }) => ({
  transition: 'all 0.3s ease',
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(-10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  }
}));

export default function JalaliDatePicker({
  value,
  onChange,
  label,
  placeholder = 'انتخاب تاریخ',
  error = false,
  helperText,
  fullWidth = false,
}: JalaliDatePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<[number, number, number]>(() => {
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return gregorianToJalali(year, month, day);
      }
    }
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  });
  
  const [currentView, setCurrentView] = useState<'days' | 'months' | 'years'>('years');
  const [displayYear, setDisplayYear] = useState<number>(selectedDate[0]);
  const [displayMonth, setDisplayMonth] = useState<number>(selectedDate[1]);
  
  const [displayValue, setDisplayValue] = useState<string>('');
  const selectedYearRef = useRef<HTMLButtonElement>(null);
  const currentYear = useRef<number>(selectedDate[0]);
  
  // تنظیم مقدار نمایشی براساس تاریخ انتخاب شده
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const jalali = gregorianToJalali(year, month, day);
        setDisplayValue(`${jalali[0]}/${jalali[1].toString().padStart(2, '0')}/${jalali[2].toString().padStart(2, '0')}`);
        setSelectedDate(jalali);
        setDisplayYear(jalali[0]);
        setDisplayMonth(jalali[1]);
      } else {
        setDisplayValue('');
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // باز و بسته کردن تقویم
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // هنگام باز شدن تقویم، نمایش را به سال‌ها تغییر می‌دهیم
    setCurrentView('years');
    // تنظیم سال نمایشی به سال انتخاب شده فعلی
    setDisplayYear(selectedDate[0]);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // هنگام بستن تقویم، برگرداندن نمایش به حالت پیش‌فرض
    setCurrentView('years');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'jalali-date-popover' : undefined;

  // اسکرول به سال انتخاب شده وقتی لیست سال‌ها نمایش داده می‌شود
  useEffect(() => {
    if (currentView === 'years' && open && selectedYearRef.current) {
      setTimeout(() => {
        selectedYearRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 100);
    }
  }, [currentView, open]);

  // انتخاب روز
  const handleDaySelect = (year: number, month: number, day: number) => {
    setSelectedDate([year, month, day]);
    const gDate = jalaliToGregorian(year, month, day);
    // فرمت تاریخ به صورت YYYY-MM-DD برای ذخیره در دیتابیس
    const formattedDate = `${gDate[0]}-${gDate[1].toString().padStart(2, '0')}-${gDate[2].toString().padStart(2, '0')}`;
    onChange(formattedDate);
    handleClose();
  };

  // نمایش ماه‌ها برای انتخاب
  const handleMonthViewClick = () => {
    setCurrentView('months');
  };

  // انتخاب ماه
  const handleMonthSelect = (month: number) => {
    setDisplayMonth(month);
    setCurrentView('days');
  };

  // نمایش سال‌ها برای انتخاب
  const handleYearViewClick = () => {
    setCurrentView('years');
  };

  // انتخاب سال
  const handleYearSelect = (year: number) => {
    setDisplayYear(year);
    setCurrentView('months');
  };

  // ماه قبل
  const prevMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear(prev => prev - 1);
    } else {
      setDisplayMonth(prev => prev - 1);
    }
  };

  // ماه بعد
  const nextMonth = () => {
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear(prev => prev + 1);
    } else {
      setDisplayMonth(prev => prev + 1);
    }
  };

  // سال قبل
  const prevYear = () => {
    setDisplayYear(prev => prev - 1);
  };

  // سال بعد
  const nextYear = () => {
    setDisplayYear(prev => prev + 1);
  };

  // ساخت روزهای ماه
  const renderDays = () => {
    const daysInMonth = getJalaliMonthLength(displayYear, displayMonth);
    const gDate = jalaliToGregorian(displayYear, displayMonth, 1);
    const firstDayOfMonth = new Date(gDate[0], gDate[1] - 1, gDate[2]).getDay();
    
    // تنظیم روز شروع هفته (شنبه = 6)
    const startDay = (firstDayOfMonth + 1) % 7;
    
    const days = [];
    const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    
    // نمایش نام روزهای هفته
    days.push(
      <Box 
        key="weekdays" 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          textAlign: 'center', 
          mb: 1,
          fontWeight: 'bold',
          color: 'text.secondary'
        }}
      >
        {weekDays.map((day, index) => (
          <Typography key={index} variant="caption" sx={{ p: 0.5 }}>
            {day}
          </Typography>
        ))}
      </Box>
    );

    let dayGrid = [];
    for (let i = 0; i < startDay; i++) {
      dayGrid.push(<Box key={`empty-${i}`} sx={{ width: '100%', height: '36px' }}></Box>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = 
        selectedDate[0] === displayYear && 
        selectedDate[1] === displayMonth && 
        selectedDate[2] === day;
      
      dayGrid.push(
        <DayButton 
          key={day} 
          className={isSelected ? 'selected' : ''}
          onClick={() => handleDaySelect(displayYear, displayMonth, day)}
          sx={{
            transform: 'scale(1)',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          {day}
        </DayButton>
      );
    }

    days.push(
      <AnimatedBox 
        key="days" 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 0.2
        }}
      >
        {dayGrid}
      </AnimatedBox>
    );

    return days;
  };

  // ساخت ماه‌ها برای انتخاب
  const renderMonths = () => {
    return (
      <AnimatedBox 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 1, 
          padding: 1,
        }}
      >
        {persianMonths.map((month, index) => (
          <Typography 
            key={index} 
            component="button"
            variant="body2"
            sx={{
              width: '100%',
              padding: '8px 4px',
              textAlign: 'center',
              backgroundColor: selectedDate[1] === index + 1 ? '#1976d2' : 'transparent',
              color: selectedDate[1] === index + 1 ? 'white' : 'inherit',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: selectedDate[1] === index + 1 ? '#1976d2' : '#f0f0f0',
                transform: 'scale(1.05)',
              },
              fontSize: '0.7rem', // فونت کوچک‌تر برای نمایش کامل ماه‌ها
            }}
            onClick={() => handleMonthSelect(index + 1)}
          >
            {month}
          </Typography>
        ))}
      </AnimatedBox>
    );
  };

  // ساخت سال‌ها برای انتخاب
  const renderYears = () => {
    // محاسبه سال‌های قابل نمایش (از 1350 تا 1450)
    const startYear = 1350;
    const endYear = 1450;
    const years = [];
    
    for (let year = startYear; year <= endYear; year++) {
      const isSelected = displayYear === year;
      years.push(
        <Typography 
          key={year} 
          component="button"
          variant="body2"
          ref={isSelected ? selectedYearRef : null}
          sx={{
            width: '100%',
            padding: '8px 4px',
            textAlign: 'center',
            backgroundColor: isSelected ? '#1976d2' : 'transparent',
            color: isSelected ? 'white' : 'inherit',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: isSelected ? '#1976d2' : '#f0f0f0',
              transform: 'scale(1.05)',
            },
          }}
          onClick={() => handleYearSelect(year)}
        >
          {year}
        </Typography>
      );
    }
    
    return (
      <AnimatedBox 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1, 
          padding: 1,
          maxHeight: '280px',
          overflow: 'auto'
        }}
      >
        {years}
      </AnimatedBox>
    );
  };

  // نمایش هدر تقویم براساس حالت نمایش
  const renderCalendarHeader = () => {
    if (currentView === 'days') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <NavButton size="small" onClick={prevMonth}>
            <KeyboardArrowRightIcon fontSize="small" />
          </NavButton>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              onClick={handleMonthViewClick}
            >
              {persianMonths[displayMonth - 1]}
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              onClick={handleYearViewClick}
            >
              {displayYear}
            </Typography>
          </Box>
          <NavButton size="small" onClick={nextMonth}>
            <KeyboardArrowLeftIcon fontSize="small" />
          </NavButton>
        </Box>
      );
    } else if (currentView === 'months') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <NavButton size="small" onClick={prevYear}>
            <KeyboardArrowRightIcon fontSize="small" />
          </NavButton>
          <Typography 
            variant="subtitle2" 
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={handleYearViewClick}
          >
            {displayYear}
          </Typography>
          <NavButton size="small" onClick={nextYear}>
            <KeyboardArrowLeftIcon fontSize="small" />
          </NavButton>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
            انتخاب سال
          </Typography>
        </Box>
      );
    }
  };

  // نمایش تقویم براساس حالت نمایش
  const renderCalendarView = () => {
    switch (currentView) {
      case 'days':
        return renderDays();
      case 'months':
        return renderMonths();
      case 'years':
        return renderYears();
      default:
        return renderYears();
    }
  };

  return (
    <Box>
      <TextField
        fullWidth={fullWidth}
        variant="outlined"
        label={label}
        placeholder={placeholder}
        value={displayValue}
        onClick={handleClick}
        error={error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton 
              onClick={handleClick}
              sx={{ 
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(15deg)'
                }
              }}
            >
              <CalendarTodayIcon />
            </IconButton>
          ),
          sx: {
            cursor: 'pointer',
            textAlign: 'left',
            direction: 'ltr',
            borderRadius: 2,
            transition: 'all 0.3s ease'
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
                borderWidth: '1px'
              }
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
          },
        }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            p: 2,
            width: 280,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            animation: 'popoverFadeIn 0.3s ease-in-out',
            '@keyframes popoverFadeIn': {
              '0%': { opacity: 0, transform: 'translateY(-10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }
        }}
      >
        {renderCalendarHeader()}
        {renderCalendarView()}
      </Popover>
    </Box>
  );
}