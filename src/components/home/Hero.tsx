'use client'

import { Box, Container, Typography, TextField, MenuItem, Button, useTheme, useMediaQuery, InputAdornment, MenuProps, FormControl, OutlinedInput, Select, SelectChangeEvent, Radio, RadioGroup, FormControlLabel, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SchoolIcon from '@mui/icons-material/School';
import LaptopIcon from '@mui/icons-material/Laptop';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopHouse, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

// تعریف داده‌های فارسی برای فیلدهای انتخابی
const jobCategories = [
  { value: '', label: 'همه گروه‌های کاری' },
  { value: 'dev', label: 'برنامه‌نویسی و توسعه' },
  { value: 'design', label: 'طراحی و خلاقیت' },
  { value: 'marketing', label: 'بازاریابی و فروش' },
  { value: 'content', label: 'تولید محتوا و ترجمه' },
  { value: 'business', label: 'کسب و کار' },
  { value: 'engineering', label: 'مهندسی و معماری' }
];

// زیرگروه‌های کاری
const jobSubCategories = [
  { value: '', label: 'همه زیرگروه‌ها', parentCategory: '' },
  // برنامه‌نویسی و توسعه
  { value: 'frontend', label: 'فرانت‌اند', parentCategory: 'dev' },
  { value: 'backend', label: 'بک‌اند', parentCategory: 'dev' },
  { value: 'mobile', label: 'موبایل', parentCategory: 'dev' },
  { value: 'fullstack', label: 'فول‌استک', parentCategory: 'dev' },
  // طراحی و خلاقیت
  { value: 'ui-ux', label: 'رابط و تجربه کاربری', parentCategory: 'design' },
  { value: 'graphic', label: 'گرافیک', parentCategory: 'design' },
  { value: 'motion', label: 'موشن گرافیک', parentCategory: 'design' },
  // بازاریابی و فروش
  { value: 'digital-marketing', label: 'دیجیتال مارکتینگ', parentCategory: 'marketing' },
  { value: 'sales', label: 'فروش', parentCategory: 'marketing' },
  // تولید محتوا و ترجمه
  { value: 'content-creation', label: 'تولید محتوا', parentCategory: 'content' },
  { value: 'translation', label: 'ترجمه', parentCategory: 'content' },
  // کسب و کار
  { value: 'management', label: 'مدیریت', parentCategory: 'business' },
  { value: 'finance', label: 'مالی و حسابداری', parentCategory: 'business' },
  // مهندسی و معماری
  { value: 'civil', label: 'عمران', parentCategory: 'engineering' },
  { value: 'architecture', label: 'معماری', parentCategory: 'engineering' },
];

const provinces = [
  { value: '', label: 'همه استان‌ها' },
  { value: 'east-azerbaijan', label: 'آذربایجان شرقی' },
  { value: 'tehran', label: 'تهران' },
  { value: 'isfahan', label: 'اصفهان' },
  { value: 'khorasan-razavi', label: 'خراسان رضوی' },
  { value: 'fars', label: 'فارس' },

];

const cities = [
  { value: '', label: 'همه شهرها', province: '' },
  { value: 'tehran-city', label: 'تهران', province: 'tehran' },
  { value: 'tabriz-city', label: 'تبریز', province: 'east-azerbaijan' },
  { value: 'maragheh', label: 'میانه', province: 'east-azerbaijan' },
  { value: 'karaj', label: 'کرج', province: 'tehran' },
  { value: 'isfahan-city', label: 'اصفهان', province: 'isfahan' },
  { value: 'kashan', label: 'کاشان', province: 'isfahan' },
  { value: 'mashhad-city', label: 'مشهد', province: 'khorasan-razavi' },
  { value: 'neyshabur', label: 'نیشابور', province: 'khorasan-razavi' },
  { value: 'shiraz-city', label: 'شیراز', province: 'fars' },
  { value: 'marvdasht', label: 'مرودشت', province: 'fars' }

];

export default function Hero() {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();

  // رنگ‌های کارفرما برای استفاده در این کامپوننت
  const employerColors = EMPLOYER_THEME;

  const [jobCategory, setJobCategory] = useState('');
  const [jobSubCategory, setJobSubCategory] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [filterOption, setFilterOption] = useState('');

  // Filtered cities based on selected province
  const [filteredCities, setFilteredCities] = useState(cities);

  // زیرگروه‌های فیلتر شده بر اساس گروه کاری انتخاب شده
  const [filteredSubCategories, setFilteredSubCategories] = useState(jobSubCategories);

  // تابع برای تغییر وضعیت فیلترها (فعال/غیرفعال)
  const handleFilterChange = (value: string) => {
    // اگر همان گزینه دوباره انتخاب شد، آن را غیرفعال کن
    if (filterOption === value) {
      setFilterOption('');
    } else {
      setFilterOption(value);
    }
  };

  // Effect to update filtered cities when province changes
  useEffect(() => {
    if (location) {
      // Filter cities for the selected province, always include "همه شهرها"
      setFilteredCities(cities.filter(c => c.province === location || c.province === ''));
    } else {
      // If no province is selected, show all cities
      setFilteredCities(cities);
    }
    // Reset city selection when province changes
    setCity('');
  }, [location]); // Rerun effect when location (province) changes

  // به‌روزرسانی زیرگروه‌های کاری بر اساس گروه کاری انتخاب شده
  useEffect(() => {
    if (jobCategory) {
      // زیرگروه‌های مرتبط با گروه کاری انتخاب شده به علاوه گزینه "همه زیرگروه‌ها"
      setFilteredSubCategories(jobSubCategories.filter(sc => sc.parentCategory === jobCategory || sc.parentCategory === ''));
    } else {
      // اگر گروه کاری انتخاب نشده باشد، همه زیرگروه‌ها نمایش داده شوند
      setFilteredSubCategories(jobSubCategories);
    }
    // ریست کردن انتخاب زیرگروه کاری هنگام تغییر گروه کاری
    setJobSubCategory('');
  }, [jobCategory]);

  // یافتن برچسب فارسی مناسب برای مقدار انتخاب شده
  const getJobCategoryLabel = () => {
    const category = jobCategories.find(cat => cat.value === jobCategory);
    return category ? category.label : 'گروه کاری';
  };

  const getJobSubCategoryLabel = () => {
    const subCategory = jobSubCategories.find(sc => sc.value === jobSubCategory);
    return subCategory ? subCategory.label : 'زیرگروه کاری';
  };

  const getLocationLabel = () => {
    const province = provinces.find(prov => prov.value === location);
    return province ? province.label : 'استان';
  };

  const getCityLabel = () => {
    const selectedCity = cities.find(c => c.value === city);
    return selectedCity ? selectedCity.label : 'شهر';
  };

  // تنظیمات مشترک منوی کشویی
  const menuPropsRTL: Partial<MenuProps> = {
    anchorOrigin: { vertical: "bottom", horizontal: "center" },
    transformOrigin: { vertical: "top", horizontal: "center" },
    PaperProps: {
      sx: {
        marginTop: '8px',
        textAlign: 'center',
        direction: 'rtl',
        width: 'auto',
        maxHeight: { xs: '250px', sm: '280px', md: '300px' },
        maxWidth: { xs: '100%', md: 'none' },
        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        // در موبایل منو به اندازه کامپوننت Select باشد
        [theme.breakpoints.down('sm')]: {
          minWidth: '100%',
        },
        '& .MuiMenuItem-root': {
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          padding: { xs: '12px 16px', md: '8px 16px' },
          fontSize: { xs: '0.95rem', md: '0.875rem' },
          minHeight: { xs: '50px', md: '36px' },
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          lineHeight: '1.4',
          '&:hover': {
            backgroundColor: employerColors.bgVeryLight,
          },
          '&.Mui-selected': {
            backgroundColor: employerColors.bgLight,
            color: employerColors.primary,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: employerColors.bgLight,
            }
          }
        },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.15)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.25)',
          },
        }
      }
    },
    MenuListProps: {
      sx: {
        paddingTop: '8px',
        paddingBottom: '8px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }
    }
  };

  // استایل مشترک برای فیلدها
  const textFieldStyles = {
    width: '100%',
    height: '100%',
    '& .MuiOutlinedInput-root': {
      width: '100%',
      height: '100%',
      borderRadius: '6px', // کمی گردتر
      boxSizing: 'border-box',
      backgroundColor: theme.palette.background.paper,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      direction: 'rtl', // اضافه کردن direction rtl به کل فیلد
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent', // حذف border در حالت focus
        borderWidth: 0,
        boxShadow: `0 0 0 2px ${employerColors.primary}20` // سایه نامحسوس در زمان focus
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent', // حذف border در حالت hover
      },
      '.MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent', // حذف border در حالت عادی
        borderWidth: 0
      }
    },
    // وسط‌چین کردن متن ورودی
    '& .MuiInputBase-input': {
      height: '100%',
      textAlign: 'center',
      direction: 'rtl',
      paddingLeft: '36px',  // افزایش پدینگ چپ برای آیکون
      paddingRight: '36px',  // افزایش پدینگ راست برای آیکون
      fontSize: { xs: '0.95rem', md: '0.9rem' } // فونت بزرگتر در موبایل
    },
    // انتقال آیکون دراپ‌داون به سمت چپ
    '& .MuiSelect-icon': {
      right: 'auto',
      left: '7px',
      color: employerColors.primary
    },
    '& .MuiSelect-select': {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      paddingRight: '28px',
      paddingLeft: '28px',
      width: '100%'
    }
  };

  // استایل برای فیلدهایی که آیکون شروع دارند
  const textFieldWithStartIconStyles = {
    ...textFieldStyles,
    '& .MuiInputBase-input': {
      textAlign: 'right',
      direction: 'rtl',
      paddingRight: '36px',  // پدینگ بیشتر برای جا دادن آیکون در سمت راست
      paddingLeft: '36px'    // پدینگ بیشتر در سمت چپ
    },
  };

  return (
    <Box
      sx={{
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 2, sm: 3, md: 4 },
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: { xs: '10px', sm: '12px', md: '16px' },
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #3366cc 0%, #4477dd 100%)',
            p: { xs: 2.5, sm: 3, md: 4 },
            mb: { xs: 0, sm: 0 },
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%)',
              pointerEvents: 'none',
              zIndex: 0
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/images/circuit-board-white-smaller.svg)',
              backgroundSize: { xs: '45%', sm: '40%', md: '35%' },
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              opacity: 0.4,
              zIndex: 0
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 3.5, md: 4 }, position: 'relative', zIndex: 1 }}>
            {/* نمایش عنوان در حالت دسکتاپ و تبلت */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
                color: '#ffffff',
                mb: { xs: 0, sm: 0 },
                display: { xs: 'none', sm: 'block', md: 'block' }
              }}
            >
              هوشمند انتخاب کن، <Box
                component="span"
                sx={{
                  color: '#FFDA3E',
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: { xs: '-6px', sm: '-8px' },
                    left: 0,
                    width: '100%',
                    height: { xs: '6px', sm: '8px' },
                    backgroundImage: 'url(/images/underline-yellow.svg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center bottom',
                  }
                }}
              >
                سریع
              </Box> استخدام شو
            </Typography>

            {/* نمایش عنوان در حالت موبایل به صورت دو سطری */}
            <Box sx={{ display: { xs: 'block', sm: 'none', md: 'none' }, mb: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  color: '#ffffff',
                  mb: 0.5,
                  lineHeight: 1.4
                }}
              >
                هوشمند انتخاب کن،
              </Typography>
              <Typography
                variant="h4"
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  color: '#ffffff',
                  lineHeight: 1.4,
                  position: 'relative'
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: '#FFDA3E',
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-6px',
                      left: 0,
                      width: '100%',
                      height: '6px',
                      backgroundImage: 'url(/images/underline-yellow.svg)',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center bottom',
                    }
                  }}
                >
                  سریع
                </Box> استخدام شو
              </Typography>
            </Box>
          </Box>

          {/* فیلدهای جستجو */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: { xs: 'nowrap', sm: 'wrap', md: 'nowrap' },
              alignItems: 'center',
              gap: { xs: 1.25, sm: 1, md: 1 },
              backgroundColor: theme.palette.background.paper,
              p: { xs: 1.5, sm: 1.5, md: 1.5 },
              borderRadius: { xs: '8px', sm: '10px', md: '12px' },
              boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 1,
              mb: { xs: 2, sm: 2.5, md: 3 }
            }}
          >
            {/* گروه کاری */}
            <Box sx={{
              width: { xs: '100%', sm: '48%', md: '20%' },
              height: { xs: '54px', sm: '50px', md: '48px' },
              display: 'flex',
              alignItems: 'center',
              mb: { xs: 0, sm: 1, md: 0 }
            }}>
              <FormControl fullWidth sx={{ height: '100%' }}>
                <Select
                  displayEmpty
                  value={jobCategory}
                  onChange={(e: SelectChangeEvent<string>) => setJobCategory(e.target.value)}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={() => {
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {getJobCategoryLabel()}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <WorkIcon fontSize="small" sx={{ color: employerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                  )}
                >
                  {jobCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* زیرگروه کاری */}
            <Box sx={{
              width: { xs: '100%', sm: '48%', md: '20%' },
              height: { xs: '54px', sm: '50px', md: '48px' },
              display: 'flex',
              alignItems: 'center',
              mb: { xs: 0, sm: 1, md: 0 }
            }}>
              <FormControl fullWidth sx={{ height: '100%' }}>
                <Select
                  displayEmpty
                  value={jobSubCategory}
                  onChange={(e: SelectChangeEvent<string>) => setJobSubCategory(e.target.value)}
                  disabled={filteredSubCategories.length <= 1}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={() => {
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {getJobSubCategoryLabel()}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <WorkIcon fontSize="small" sx={{ color: employerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                  )}
                >
                  {filteredSubCategories.map((subCategory) => (
                    <MenuItem key={subCategory.value} value={subCategory.value}>
                      {subCategory.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* استان */}
            <Box sx={{
              width: { xs: '100%', sm: '48%', md: '20%' },
              height: { xs: '54px', sm: '50px', md: '48px' },
              display: 'flex',
              alignItems: 'center',
              mb: { xs: 0, sm: 1, md: 0 }
            }}>
              <FormControl fullWidth sx={{ height: '100%' }}>
                <Select
                  displayEmpty
                  value={location}
                  onChange={(e: SelectChangeEvent<string>) => setLocation(e.target.value)}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={() => {
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {getLocationLabel()}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <LocationOnIcon fontSize="small" sx={{ color: employerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                  )}
                >
                  {provinces.map((province) => (
                    <MenuItem key={province.value} value={province.value}>
                      {province.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* شهر */}
            <Box sx={{
              width: { xs: '100%', sm: '48%', md: '20%' },
              height: { xs: '54px', sm: '50px', md: '48px' },
              display: 'flex',
              alignItems: 'center',
              mb: { xs: 0, sm: 1, md: 0 }
            }}>
              <FormControl fullWidth sx={{ height: '100%' }}>
                <Select
                  displayEmpty
                  value={city}
                  onChange={(e: SelectChangeEvent<string>) => setCity(e.target.value)}
                  disabled={filteredCities.length <= 1}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={() => {
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {getCityLabel()}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <LocationOnIcon fontSize="small" sx={{ color: employerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                  )}
                >
                  {filteredCities.map((cityItem) => (
                    <MenuItem key={cityItem.value} value={cityItem.value}>
                      {cityItem.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* دکمه جستجو */}
            <Box
              sx={{
                width: { xs: '100%', sm: '100%', md: '20%' },
                height: { xs: '54px', sm: '50px', md: '48px' },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon sx={{ ml: 0.5 }} />}
                fullWidth
                disableElevation
                sx={{
                  height: '100%',
                  minHeight: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
                  boxShadow: 'none',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)`,
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                  },
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '0.95rem' },
                  textTransform: 'none',
                  border: 'none'
                }}
              >
                جستجو در مشاغل
              </Button>
            </Box>
          </Box>

          {/* بخش گزینه‌های فیلتر */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              mt: { xs: 2, sm: 2.5, md: 3 }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: { xs: 2.5, sm: 3, md: 4 }
              }}
            >
              <Box
                onClick={() => handleFilterChange('internship')}
                sx={{
                  cursor: 'pointer',
                  margin: 0,
                  backgroundColor: filterOption === 'internship' ? 'rgba(255, 218, 62, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  border: `2px solid ${filterOption === 'internship' ? '#FFDA3E' : 'rgba(255, 255, 255, 0.4)'}`,
                  padding: { xs: '0px 16px', sm: '0px 20px' },
                  boxShadow: filterOption === 'internship' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: '125px', sm: '140px', md: '150px' },
                  minWidth: { xs: '125px', sm: '140px', md: '150px' },
                  height: { xs: '52px', sm: '50px', md: '48px' },
                  gap: '10px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: filterOption === 'internship' ? 'rgba(255, 218, 62, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                <span>
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    style={{
                      color: filterOption === 'internship' ? '#FFDA3E' : 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem'
                    }}
                  />
                </span>
                <Typography
                  sx={{
                    color: filterOption === 'internship' ? '#FFDA3E' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: filterOption === 'internship' ? '700' : '500',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    textShadow: filterOption === 'internship' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    userSelect: 'none',
                  }}
                >
                  کارآموزی
                </Typography>
              </Box>
              <Box
                onClick={() => handleFilterChange('remote')}
                sx={{
                  cursor: 'pointer',
                  margin: 0,
                  backgroundColor: filterOption === 'remote' ? 'rgba(255, 218, 62, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  border: `2px solid ${filterOption === 'remote' ? '#FFDA3E' : 'rgba(255, 255, 255, 0.4)'}`,
                  padding: { xs: '0px 16px', sm: '0px 20px' },
                  boxShadow: filterOption === 'remote' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: '125px', sm: '140px', md: '150px' },
                  minWidth: { xs: '125px', sm: '140px', md: '150px' },
                  height: { xs: '52px', sm: '50px', md: '48px' },
                  gap: '10px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: filterOption === 'remote' ? 'rgba(255, 218, 62, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                <span>
                  <FontAwesomeIcon
                    icon={faLaptopHouse}
                    style={{
                      color: filterOption === 'remote' ? '#FFDA3E' : 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem'
                    }}
                  />
                </span>
                <Typography
                  sx={{
                    color: filterOption === 'remote' ? '#FFDA3E' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: filterOption === 'remote' ? '700' : '500',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    textShadow: filterOption === 'remote' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    userSelect: 'none',
                  }}
                >
                  دورکاری
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}