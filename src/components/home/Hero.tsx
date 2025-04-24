'use client'

import { Box, Container, Typography, TextField, MenuItem, Button, useTheme, useMediaQuery, InputAdornment, MenuProps, FormControl, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState, useEffect } from 'react';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';

// تعریف داده‌های فارسی برای فیلدهای انتخابی
const jobCategories = [
  { value: '', label: 'همه گروه‌های شغلی' },
  { value: 'dev', label: 'برنامه‌نویسی و توسعه' },
  { value: 'design', label: 'طراحی و خلاقیت' },
  { value: 'marketing', label: 'بازاریابی و فروش' },
  { value: 'content', label: 'تولید محتوا و ترجمه' },
  { value: 'business', label: 'کسب و کار' },
  { value: 'engineering', label: 'مهندسی و معماری' }
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [jobCategory, setJobCategory] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const jobSeekerColors = useJobSeekerTheme();
  
  // رنگ‌های کارفرما برای استفاده در این کامپوننت
  const employerColors = EMPLOYER_THEME;

  // Filtered cities based on selected province
  const [filteredCities, setFilteredCities] = useState(cities);

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

  // یافتن برچسب فارسی مناسب برای مقدار انتخاب شده
  const getJobCategoryLabel = () => {
    const category = jobCategories.find(cat => cat.value === jobCategory);
    return category ? category.label : 'گروه شغلی';
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
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px', // کمی گردتر
      height: { xs: '52px', md: '48px' }, // ارتفاع بیشتر در موبایل برای لمس راحت‌تر
      backgroundColor: theme.palette.background.paper,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      direction: 'rtl', // اضافه کردن direction rtl به کل فیلد
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
        borderColor: employerColors.primary,
        borderWidth: '1px',
        boxShadow: `0 0 0 2px ${employerColors.primary}33` // اضافه کردن focus ring با رنگ کارفرما
      },
      '&:hover .MuiOutlinedInput-notchedOutline': { 
         borderColor: employerColors.bgLight, // پررنگ‌تر در هاور
      },
      '.MuiOutlinedInput-notchedOutline': { 
         borderColor: employerColors.bgLight,
       }
    },
    // وسط‌چین کردن متن ورودی
    '& .MuiInputBase-input': {
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
        pt: { xs: 4, md: 6 },
        pb: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.6rem', sm: '2rem', md: '2.2rem' },
              color: theme.palette.text.primary,
              mb: 1
            }}
          >
            هوشمند انتخاب کن، سریع استخدام شو
          </Typography>
          <Typography variant="body1" color="text.secondary">
            بهترین فرصت‌های شغلی و پروژه‌ها در دسترس شماست
          </Typography>
        </Box>
        
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 1.5, sm: 1 },
            backgroundColor: theme.palette.background.paper,
            p: 1.5,
            borderRadius: '8px',
            boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.07)',
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <FormControl fullWidth>
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
                  <InputAdornment position="start" sx={{ position: 'absolute', right: '8px' }}>
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

          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <FormControl fullWidth>
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
                  <InputAdornment position="start" sx={{ position: 'absolute', right: '8px' }}>
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

          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={city}
                onChange={(e: SelectChangeEvent<string>) => setCity(e.target.value)}
                disabled={filteredCities.length === 0}
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
                  <InputAdornment position="start" sx={{ position: 'absolute', right: '8px' }}>
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

          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon sx={{ ml: 0.5 }} />}
              fullWidth
              sx={{ 
                height: '48px',
                borderRadius: '6px',
                background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
                boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                   background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)`,
                   boxShadow: '0px 5px 12px rgba(0, 0, 0, 0.15)',
                },
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                textTransform: 'none'
              }}
            >
              جستجو در مشاغل
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}