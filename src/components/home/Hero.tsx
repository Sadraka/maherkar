'use client'

import { Box, Container, Typography, TextField, MenuItem, Button, useTheme, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import { useState } from 'react';

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
  { value: 'mashhad', label: 'مشهد' },
  { value: 'shiraz', label: 'شیراز' },
  { value: 'tabriz', label: 'تبریز' }
];

const cities = [
  { value: '', label: 'همه' },
  { value: 'tehran', label: 'تهران' },
  { value: 'isfahan', label: 'اصفهان' },
  { value: 'mashhad', label: 'مشهد' },
  { value: 'shiraz', label: 'شیراز' },
  { value: 'tabriz', label: 'تبریز' }
];

export default function Hero() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [jobCategory, setJobCategory] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');

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
        pt: { xs: 4, md: 5 },
        pb: { xs: 4, md: 5 },
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #eee',
        borderStyle: 'dashed',
        mx: 'auto',
        maxWidth: '1200px',
        my: 2,
        borderRadius: `${theme.shape.borderRadius}px`
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }, 
              color: theme.palette.text.primary
            }}
          >
            هوشمند انتخاب کن، سریع استخدام شو
          </Typography>
        </Box>
        
        <Box
          sx={{
            maxWidth: '1050px',
            mx: 'auto',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2
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
                  backgroundColor: theme.palette.background.paper
                },
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  paddingRight: '14px'
                },
                '& .MuiSelect-icon': {
                  right: 'auto',
                  left: '14px'
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: () => getJobCategoryLabel(),
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
                  backgroundColor: theme.palette.background.paper
                },
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  paddingRight: '14px'
                },
                '& .MuiSelect-icon': {
                  right: 'auto',
                  left: '14px'
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: () => getLocationLabel(),
                IconComponent: props => <Box component="span" {...props} sx={{ transform: 'rotate(90deg)', marginLeft: '7px' }}>‹</Box>
              }}
              InputProps={{
                startAdornment: <LocationOnIcon fontSize="small" color="action" sx={{ position: 'absolute', right: 'auto', left: '36px', opacity: 0.6 }} />,
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${theme.shape.borderRadius}px`,
                  height: '48px',
                  backgroundColor: theme.palette.background.paper
                },
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  paddingRight: '14px'
                },
                '& .MuiSelect-icon': {
                  right: 'auto',
                  left: '14px'
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: () => getCityLabel(),
                IconComponent: props => <Box component="span" {...props} sx={{ transform: 'rotate(90deg)', marginLeft: '7px' }}>‹</Box>
              }}
              InputProps={{
                startAdornment: <WorkIcon fontSize="small" color="action" sx={{ position: 'absolute', right: 'auto', left: '36px', opacity: 0.6 }} />,
              }}
            >
              {cities.map((city) => (
                <MenuItem key={city.value} value={city.value}>
                  {city.label}
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
                backgroundColor: '#000',
                '&:hover': {
                  backgroundColor: '#333'
                },
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold'
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