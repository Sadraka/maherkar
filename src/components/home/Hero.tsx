'use client'

import { Box, Container, Typography, TextField, MenuItem, Button, useTheme, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import { useState, useEffect } from 'react';

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
  { value: 'tehran', label: 'تهران' },
  { value: 'isfahan', label: 'اصفهان' },
  { value: 'khorasan-razavi', label: 'خراسان رضوی' },
  { value: 'fars', label: 'فارس' },
  { value: 'east-azerbaijan', label: 'آذربایجان شرقی' }
];

const cities = [
  { value: '', label: 'همه شهرها', province: '' },
  { value: 'tehran-city', label: 'تهران', province: 'tehran' },
  { value: 'karaj', label: 'کرج', province: 'tehran' },
  { value: 'isfahan-city', label: 'اصفهان', province: 'isfahan' },
  { value: 'kashan', label: 'کاشان', province: 'isfahan' },
  { value: 'mashhad-city', label: 'مشهد', province: 'khorasan-razavi' },
  { value: 'neyshabur', label: 'نیشابور', province: 'khorasan-razavi' },
  { value: 'shiraz-city', label: 'شیراز', province: 'fars' },
  { value: 'marvdasht', label: 'مرودشت', province: 'fars' },
  { value: 'tabriz-city', label: 'تبریز', province: 'east-azerbaijan' },
  { value: 'maragheh', label: 'میانه', province: 'east-azerbaijan' }
];

export default function Hero() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [jobCategory, setJobCategory] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');

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
  
  return (
    <Box
      sx={{
        pt: { xs: 4, md: 6 },
        pb: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        mx: 'auto',
        maxWidth: '1200px',
        my: 3,
        borderRadius: `${theme.shape.borderRadius}px`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
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
            maxWidth: '1050px',
            mx: 'auto',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 1.5,
            backgroundColor: theme.palette.background.paper,
            p: 1.5,
            borderRadius: `${theme.shape.borderRadius}px`,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
              placeholder="گروه شغلی"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${theme.shape.borderRadius}px`,
                  height: '48px',
                  backgroundColor: theme.palette.background.paper,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '1px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                     borderColor: theme.palette.grey[400],
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                     borderColor: theme.palette.grey[300],
                   }
                },
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  paddingRight: '14px'
                },
                '& .MuiSelect-icon': {
                  right: 'auto',
                  left: '7px'
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: () => getJobCategoryLabel(),
                MenuProps: {
                  anchorOrigin: { vertical: "bottom", horizontal: "right" },
                  transformOrigin: { vertical: "top", horizontal: "right" },
                  PaperProps: {
                    sx: { 
                      textAlign: 'right',
                      '& .MuiMenuItem-root': { justifyContent: 'flex-end' }
                    }
                  }
                },
                IconComponent: props => <Box component="span" {...props} sx={{ transform: 'rotate(90deg)', marginLeft: '7px' }}>‹</Box>
              }}
            >
              {jobCategories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="استان"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${theme.shape.borderRadius}px`,
                  height: '48px',
                  backgroundColor: theme.palette.background.paper,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '1px',
                  },
                   '&:hover .MuiOutlinedInput-notchedOutline': {
                     borderColor: theme.palette.grey[400],
                  },
                   '.MuiOutlinedInput-notchedOutline': {
                     borderColor: theme.palette.grey[300],
                   }
                },
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  paddingRight: '14px',
                  paddingLeft: '40px'
                },
                '& .MuiSelect-icon': {
                  right: 'auto',
                  left: '7px'
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: () => getLocationLabel(),
                MenuProps: {
                  anchorOrigin: { vertical: "bottom", horizontal: "right" },
                  transformOrigin: { vertical: "top", horizontal: "right" },
                  PaperProps: {
                    sx: { 
                      textAlign: 'right',
                      '& .MuiMenuItem-root': { justifyContent: 'flex-end' }
                     }
                  }
                },
                IconComponent: props => <Box component="span" {...props} sx={{ transform: 'rotate(90deg)', marginLeft: '7px' }}>‹</Box>
              }}
              InputProps={{
                startAdornment: <LocationOnIcon fontSize="small" color="action" sx={{ position: 'absolute', left: '30px', opacity: 0.6 }} />,
              }}
            >
              {provinces.map((province) => (
                <MenuItem key={province.value} value={province.value}>
                  {province.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="شهر"
              disabled={!location}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${theme.shape.borderRadius}px`,
                  height: '48px',
                  backgroundColor: theme.palette.background.paper,
                   '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '1px',
                  },
                   '&:hover .MuiOutlinedInput-notchedOutline': {
                     borderColor: theme.palette.grey[400],
                  },
                   '.MuiOutlinedInput-notchedOutline': {
                     borderColor: theme.palette.grey[300],
                   },
                   '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.grey[200],
                   },
                    '&.Mui-disabled': {
                      backgroundColor: theme.palette.grey[100],
                   }
                },
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  paddingRight: '14px',
                  paddingLeft: '40px'
                },
                '& .MuiSelect-icon': {
                  right: 'auto',
                  left: '7px'
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: () => getCityLabel(),
                MenuProps: {
                  anchorOrigin: { vertical: "bottom", horizontal: "right" },
                  transformOrigin: { vertical: "top", horizontal: "right" },
                  PaperProps: {
                    sx: { 
                      textAlign: 'right',
                      '& .MuiMenuItem-root': { justifyContent: 'flex-end' }
                     }
                  }
                },
                IconComponent: props => <Box component="span" {...props} sx={{ transform: 'rotate(90deg)', marginLeft: '7px' }}>‹</Box>
              }}
              InputProps={{
                startAdornment: <LocationOnIcon fontSize="small" color="action" sx={{ position: 'absolute', left: '30px', opacity: 0.6 }} />,
              }}
            >
              {filteredCities.map((cityItem) => (
                <MenuItem key={cityItem.value} value={cityItem.value}>
                  {cityItem.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              fullWidth
              sx={{ 
                height: '48px',
                borderRadius: `${theme.shape.borderRadius}px`,
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                 boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                   background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                   boxShadow: '0px 5px 12px rgba(0, 0, 0, 0.15)',
                },
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold',
                fontSize: '0.95rem'
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