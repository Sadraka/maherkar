
'use client'

import { Box, Container, Typography, TextField, MenuItem, Button, useTheme, useMediaQuery, InputAdornment, MenuProps, FormControl, OutlinedInput, Select, SelectChangeEvent, Radio, RadioGroup, FormControlLabel, Stack, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SchoolIcon from '@mui/icons-material/School';
import LaptopIcon from '@mui/icons-material/Laptop';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopHouse, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/store/authStore';
import { apiGet } from '@/lib/axios';
import { InitialData, Industry, Province, City } from '@/lib/initialData';

interface HeroProps {
  initialData: InitialData;
}

export default function Hero({ initialData }: HeroProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();

  // رنگ‌های کارفرما برای استفاده در این کامپوننت
  const employerColors = EMPLOYER_THEME;

  // دریافت اطلاعات کاربر
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // تعیین نوع کاربر
  const isEmployer = isAuthenticated && user?.user_type === 'EM';

  const [jobCategory, setJobCategory] = useState('');
  const [jobSubCategory, setJobSubCategory] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [filterOption, setFilterOption] = useState('');

  // State برای داده‌های دریافتی از API
  const [industries, setIndustries] = useState<Industry[]>(initialData.industries);
  const [provinces, setProvinces] = useState<Province[]>(initialData.provinces);
  const [cities, setCities] = useState<City[]>(initialData.cities);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(false);

  // تبدیل داده‌های API به فرمت مورد نیاز
  const jobCategories = React.useMemo(() => {
    if (industries.length > 0) {
      // استخراج دسته‌بندی‌های یکتا از صنایع
      const uniqueCategories = new Map();
      industries.forEach(industry => {
        if (industry.category) {
          uniqueCategories.set(industry.category.id, industry.category);
        }
      });
      
      return [
        { value: '', label: 'همه گروه‌های کاری' },
        ...Array.from(uniqueCategories.values()).map(category => ({
          value: category.id.toString(),
          label: category.name
        }))
      ];
    }
    return [];
  }, [industries]);

  const provincesList = React.useMemo(() => {
    if (provinces.length > 0) {
      return [
        { value: '', label: 'همه استان‌ها' },
        ...provinces.map(province => ({
          value: province.id.toString(),
          label: province.name
        }))
      ];
    }
    return [];
  }, [provinces]);

  const citiesList = React.useMemo(() => {
    if (cities.length > 0) {
      return [
        { value: '', label: 'همه شهرها', province: '' },
        ...cities.map(city => ({
          value: city.id.toString(),
          label: city.name,
          province: city.province?.id.toString() || ''
        }))
      ];
    }
    return [];
  }, [cities]);

  // Filtered cities based on selected province
  const [filteredCities, setFilteredCities] = useState(citiesList);

  // زیرگروه‌های فیلتر شده بر اساس گروه کاری انتخاب شده
  const [filteredSubCategories, setFilteredSubCategories] = useState<Industry[]>([]);

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
      setFilteredCities(citiesList.filter(c => c.province === location || c.province === ''));
    } else {
      // If no province is selected, show all cities
      setFilteredCities(citiesList);
    }
    // Reset city selection when province changes
    setCity('');
  }, [location, citiesList]); // Rerun effect when location (province) changes

  // به‌روزرسانی زیرگروه‌های کاری بر اساس گروه کاری انتخاب شده
  useEffect(() => {
    if (jobCategory && industries.length > 0) {
      // فیلتر کردن صنایع بر اساس دسته‌بندی انتخاب شده
      const filtered = industries.filter(industry => 
        industry.category?.id.toString() === jobCategory
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
    // ریست کردن انتخاب زیرگروه کاری هنگام تغییر گروه کاری
    setJobSubCategory('');
  }, [jobCategory, industries]);

  // یافتن برچسب فارسی مناسب برای مقدار انتخاب شده
  const getJobCategoryLabel = () => {
    if (dataLoading) return 'در حال بارگذاری...';
    if (industries.length === 0) return 'گروه کاری';
    const category = jobCategories.find(cat => cat.value === jobCategory);
    return category ? category.label : 'گروه کاری';
  };

  const getJobSubCategoryLabel = () => {
    if (dataLoading) return 'در حال بارگذاری...';
    if (jobSubCategory === '') {
      return 'همه زیرگروه‌ها';
    }
    if (jobSubCategory && filteredSubCategories.length > 0) {
      const subCategory = filteredSubCategories.find(sc => sc.id.toString() === jobSubCategory);
      return subCategory ? subCategory.name : 'زیرگروه کاری';
    }
    return 'زیرگروه کاری';
  };

  const getLocationLabel = () => {
    if (dataLoading) return 'در حال بارگذاری...';
    if (provinces.length === 0) return 'در حال بارگذاری استان‌ها...';
    const province = provincesList.find(prov => prov.value === location);
    return province ? province.label : 'استان';
  };

  const getCityLabel = () => {
    if (dataLoading) return 'در حال بارگذاری...';
    if (cities.length === 0) return 'در حال بارگذاری شهرها...';
    const selectedCity = citiesList.find(c => c.value === city);
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
              {isEmployer ? (
                <>
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
                  </Box> استخدام کن
                </>
              ) : (
                <>
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
                </>
              )}
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
                </Box> {isEmployer ? 'استخدام کن' : 'استخدام شو'}
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
                  disabled={industries.length === 0}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={(selected) => {
                    return getJobCategoryLabel();
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
                  {industries.length > 0 ? jobCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  )) : [
                    <MenuItem key="no-data" value="" disabled>
                      گروه‌های کاری در دسترس نیست
                    </MenuItem>
                  ]}
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
                  disabled={filteredSubCategories.length === 0 || industries.length === 0}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={(selected) => {
                    return getJobSubCategoryLabel();
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
                  {filteredSubCategories.length > 0 ? [
                    <MenuItem key="all" value="">
                      همه زیرگروه‌ها
                    </MenuItem>,
                    ...filteredSubCategories.map((subCategory) => (
                      <MenuItem key={subCategory.id} value={subCategory.id.toString()}>
                        {subCategory.name}
                      </MenuItem>
                    ))
                  ] : [
                    <MenuItem key="disabled" value="" disabled>
                      {industries.length === 0 ? 'گروه‌های کاری در دسترس نیست' : 'ابتدا یک گروه کاری انتخاب کنید'}
                    </MenuItem>
                  ]}
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
                  disabled={provinces.length === 0}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={(selected) => {
                    return getLocationLabel();
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
                  {provinces.length > 0 ? provincesList.map((province) => (
                    <MenuItem key={province.value} value={province.value}>
                      {province.label}
                    </MenuItem>
                  )) : [
                    <MenuItem key="loading" value="" disabled>
                      در حال بارگذاری استان‌ها...
                    </MenuItem>
                  ]}
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
                  disabled={!location || filteredCities.length <= 1 || cities.length === 0}
                  input={<OutlinedInput sx={textFieldStyles} />}
                  renderValue={(selected) => {
                    return getCityLabel();
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
                  {cities.length > 0 ? filteredCities.map((cityItem) => (
                    <MenuItem key={cityItem.value} value={cityItem.value}>
                      {cityItem.label}
                    </MenuItem>
                  )) : [
                    <MenuItem key="loading" value="" disabled>
                      در حال بارگذاری شهرها...
                    </MenuItem>
                  ]}
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
                {isEmployer ? 'جستجو در رزومه‌ها' : 'جستجو در مشاغل'}
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