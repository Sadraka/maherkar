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
import Image from 'next/image';

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
        pt: { xs: 4, md: 6 },
        pb: { xs: 2, md: 3 },
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #3366cc 0%, #4477dd 100%)',
            p: { xs: 4, md: 5 },
            mb: 4,
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
            '&::before': {  // پس‌زمینه با اندازه دقیق کادر
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/images/circuit-board-white-smaller.svg)',
              backgroundSize: '35%', // تنظیم دقیق سایز الگو به 35 درصد
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              opacity: 0.4, // کاهش شفافیت
              zIndex: 0
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 }, position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.1rem' },
                color: '#ffffff',
                mb: 2,
                display: { xs: 'none', sm: 'block' } // نمایش فقط در حالت دسکتاپ و تبلت
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
                    bottom: '-8px',
                    left: 0,
                    width: '100%',
                    height: '8px',
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
            <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.3rem',
                  color: '#ffffff',
                  mb: 0.5,
                  lineHeight: 1.3
                }}
              >
                هوشمند انتخاب کن،
              </Typography>
              <Typography 
                variant="h4" 
                component="span" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.3rem',
                  color: '#ffffff',
                  lineHeight: 1.3,
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
                      bottom: '-8px',
                      left: 0,
                      width: '100%',
                      height: '8px',
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
            
            <Typography 
              variant="body1" 
              sx={{
                fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
                maxWidth: { xs: '95%', sm: '90%' },
                mx: 'auto',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.9)',
                whiteSpace: 'nowrap', // مطمئن می‌شویم که همیشه یک خطی نمایش داده شود
                overflow: 'hidden',
                textOverflow: 'ellipsis' // اگر متن طولانی باشد، با سه نقطه نمایش داده می‌شود
              }}
            >
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
              p: { xs: 2, md: 1.5 },
              borderRadius: '8px',
              boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 1,
              mb: { xs: 3, md: 4 }
            }}
          >
            {/* گروه شغلی */}
            <Box sx={{ width: { xs: '100%', sm: '25%' }, height: { xs: '52px', md: '48px' }, display: 'flex', alignItems: 'center' }}>
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

            {/* استان */}
            <Box sx={{ width: { xs: '100%', sm: '25%' }, height: { xs: '52px', md: '48px' }, display: 'flex', alignItems: 'center' }}>
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

            {/* شهر */}
            <Box sx={{ width: { xs: '100%', sm: '25%' }, height: { xs: '52px', md: '48px' }, display: 'flex', alignItems: 'center' }}>
              <FormControl fullWidth sx={{ height: '100%' }}>
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

            {/* دکمه جستجو */}
            <Box 
              sx={{ 
                width: { xs: '100%', sm: '25%' }, 
                height: { xs: '52px', md: '48px' },
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
                  borderRadius: '6px',
                  background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
                  boxShadow: 'none',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)`,
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                  },
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  border: 'none'
                }}
              >
                جستجو در مشاغل
              </Button>
            </Box>
          </Box>
          
          {/* بخش کلمات پرجستجو */}
          <Box 
            sx={{ 
              position: 'relative', 
              zIndex: 1, 
              textAlign: 'center',
              mt: 2 
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                gap: { xs: 1, md: 1.5 } 
              }}
            >
              {['کارآموزی', 'طراح وب', 'برنامه‌نویس React', 'مترجم انگلیسی', 'گرافیست', 'دورکاری', 'پاره‌وقت', 'حسابدار', 'مدیر فروش', 'متخصص دیجیتال مارکتینگ', 'تولید محتوا'].map((keyword, idx) => {
                return (
                  <Button 
                    key={idx}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: '#ffffff',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      fontSize: { xs: '0.75rem', md: '0.85rem' },
                      py: { xs: 0.5, md: 0.7 },
                      px: { xs: 1.5, md: 2 },
                      minWidth: 'unset',
                      textTransform: 'none',
                      borderRadius: '4px',
                      fontWeight: 'medium',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    {keyword}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}