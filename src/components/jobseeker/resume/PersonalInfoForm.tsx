'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/axios';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  MenuItem, 
  Paper, 
  Alert,
  AlertTitle,
  IconButton,
  CircularProgress,
  InputAdornment,
  Select,
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  MenuProps,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import CakeIcon from '@mui/icons-material/Cake';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import ImageCropper from '@/components/common/ImageCropper';

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
};

/**
 * تایپ استان برای TypeScript
 */
type Province = {
  id: number;
  name: string;
};

/**
 * تایپ گروه کاری برای TypeScript
 */
type Industry = {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
  };
};

/**
 * تایپ شهر برای TypeScript
 */
type City = {
  id: number;
  name: string;
  province?: {
    id: number;
    name: string;
  };
};

/**
 * تایپ پروفایل کارجو
 */
type JobSeekerProfile = {
  id?: number;
  headline?: string;
  bio?: string;
  profile_picture?: string;
  website?: string;
  linkedin_profile?: string;
  location?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  industry?: {
    id: number;
    name: string;
  };
  personal_info?: {
    gender?: string;
    age?: number;
    kids_count?: number;
  };
};

/**
 * ورودی‌های فرم اطلاعات شخصی
 */
interface PersonalInfoFormInputs {
  headline: string;
  bio: string;
  profile_picture: FileList;
  province_id: number;
  city_id: number;
  industry_id: number;
  gender: string;
  age: number;
  kids_count: number;
  website: string;
  linkedin_profile: string;
}

/**
 * کامپوننت فرم اطلاعات شخصی کارجو
 */
export default function PersonalInfoForm() {
  const router = useRouter();
  const theme = useTheme();
  const jobseekerColors = JOB_SEEKER_THEME;
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors: formErrors },
    watch,
    setValue,
    reset
  } = useForm<PersonalInfoFormInputs>({
    defaultValues: {
      headline: '',
      bio: '',
      province_id: 0,
      city_id: 0,
      industry_id: 0,
      gender: '',
      age: 0,
      kids_count: 0,
      website: '',
      linkedin_profile: ''
    }
  });

  // نظارت بر تغییرات استان برای فیلتر کردن شهرها
  const selectedProvinceId = watch('province_id');
  
  // فیلتر کردن شهرها بر اساس استان انتخاب شده
  const filteredCities = React.useMemo(() => {
    if (!selectedProvinceId || selectedProvinceId === 0) return [];
    return cities.filter(city => city.province?.id === selectedProvinceId);
  }, [cities, selectedProvinceId]);

  // ریست کردن شهر هنگام تغییر استان
  useEffect(() => {
    if (selectedProvinceId && selectedProvinceId !== 0) {
      const currentCityId = watch('city_id');
      const isCurrentCityInProvince = filteredCities.some(city => city.id === currentCityId);
      if (!isCurrentCityInProvince) {
        setValue('city_id', 0);
      }
    }
  }, [selectedProvinceId, filteredCities, setValue, watch]);

  // تبدیل constants به آرایه گزینه‌ها برای Select ها
  const genderOptions = [
    { value: 'W', label: 'خانم' },
    { value: 'M', label: 'آقا' }
  ];

  // لود داده‌های مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [profileResponse, industriesResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/profiles/me/'),
          apiGet('/industries/industries/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/')
        ]);
        
        // تنظیم داده‌های فرم
        const profile = profileResponse.data as JobSeekerProfile;
        if (profile) {
          reset({
            headline: profile.headline || '',
            bio: profile.bio || '',
            province_id: profile.location?.province?.id || 0,
            city_id: profile.location?.id || 0,
            industry_id: profile.industry?.id || 0,
            gender: profile.personal_info?.gender || '',
            age: profile.personal_info?.age || 0,
            kids_count: profile.personal_info?.kids_count || 0,
            website: profile.website || '',
            linkedin_profile: profile.linkedin_profile || ''
          });

          // نمایش تصویر پروفایل اگر وجود داشته باشد
          if (profile.profile_picture) {
            const imageUrl = profile.profile_picture.startsWith('http') 
              ? profile.profile_picture 
              : `${process.env.NEXT_PUBLIC_API_URL}${profile.profile_picture}`;
            setProfilePicturePreview(imageUrl);
          }
        }
        
        setIndustries(industriesResponse.data as Industry[]);
        setCities(citiesResponse.data as City[]);
        setProvinces(provincesResponse.data as Province[]);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setErrors(['خطا در دریافت اطلاعات مورد نیاز. لطفاً دوباره تلاش کنید.']);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [reset]);

  // تابع پردازش فایل تصویر
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setShowImageCropper(true);
    }
  };

  // تابع تکمیل کراپ تصویر
  const handleImageCropComplete = (croppedImage: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedImage);
    const fileList = dataTransfer.files;
    
    setValue('profile_picture', fileList);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicturePreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedImage);
    
    setShowImageCropper(false);
    setSelectedImageFile(null);
  };

  // تابع حذف تصویر پروفایل
  const handleDeleteProfilePicture = () => {
    setValue('profile_picture', undefined as any);
    setProfilePicturePreview(null);
  };

  const onSubmit: SubmitHandler<PersonalInfoFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    try {
      const formDataToSend = new FormData();
      
      // اضافه کردن فیلدهای متنی
      formDataToSend.append('headline', data.headline || '');
      formDataToSend.append('bio', data.bio || '');
      formDataToSend.append('website', data.website || '');
      formDataToSend.append('linkedin_profile', data.linkedin_profile || '');
      
      // اضافه کردن شهر و صنعت
      if (data.city_id && data.city_id !== 0) {
        formDataToSend.append('location_id', String(data.city_id));
      }
      if (data.industry_id && data.industry_id !== 0) {
        formDataToSend.append('industry_id', String(data.industry_id));
      }
      
      // اضافه کردن اطلاعات شخصی
      const personalInfo = {
        gender: data.gender || '',
        age: data.age || 0,
        kids_count: data.kids_count || 0
      };
      formDataToSend.append('personal_info', JSON.stringify(personalInfo));
      
      // اضافه کردن تصویر پروفایل
      if (data.profile_picture && data.profile_picture.length > 0) {
        formDataToSend.append('profile_picture', data.profile_picture[0]);
      }

      await apiPut('/profiles/job-seekers/update/me/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      
      // اسکرول به بالای فرم بعد از ثبت موفقیت‌آمیز
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
    } catch (err: any) {
      console.error('خطا در ثبت اطلاعات:', err);
      
      const newErrors: string[] = [];
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          for (const [field, errors] of Object.entries(err.response.data)) {
            if (Array.isArray(errors)) {
              errors.forEach((msg: string) => {
                newErrors.push(`${field}: ${msg}`);
              });
            } else if (typeof errors === 'string') {
              newErrors.push(`${field}: ${errors}`);
            }
          }
        } else if (typeof err.response.data === 'string') {
          newErrors.push(err.response.data);
        }
      } else if (err.message) {
        newErrors.push(`خطا: ${err.message}`);
      }
      
      if (newErrors.length === 0) {
        newErrors.push('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
      }
      
      setErrors(newErrors);
      
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  // حذف یک خطا از لیست خطاها
  const removeError = (index: number) => {
    setErrors(errors.filter((_, i) => i !== index));
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
            backgroundColor: jobseekerColors.bgVeryLight,
          },
          '&.Mui-selected': {
            backgroundColor: alpha(jobseekerColors.primary, 0.1),
            color: jobseekerColors.primary,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: alpha(jobseekerColors.primary, 0.15),
            }
          }
        }
      }
    }
  };

  // استایل مشترک برای Select ها
  const selectStyles = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      width: '100%',
      borderRadius: '6px',
      boxSizing: 'border-box',
      backgroundColor: theme.palette.background.paper,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      direction: 'rtl',
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
        borderWidth: 0,
        boxShadow: `0 0 0 2px ${alpha(jobseekerColors.primary, 0.2)}`
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
      },
      '.MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
        borderWidth: 0
      }
    },
    '& .MuiInputBase-input': {
      textAlign: 'center',
      direction: 'rtl',
      paddingLeft: '36px',
      paddingRight: '36px',
      fontSize: { xs: '0.8rem', sm: '0.95rem', md: '0.9rem' },
      padding: { xs: '8px 36px', sm: '16.5px 36px' }
    },
    '& .MuiSelect-icon': {
      right: 'auto',
      left: '7px',
      color: jobseekerColors.primary
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      paddingRight: '28px',
      paddingLeft: '28px',
      width: '100%'
    }
  };

  if (dataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: jobseekerColors.primary }} />
      </Box>
    );
  }

  return (
    <Paper 
      ref={formRef}
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 5 }, 
        borderRadius: { xs: 2, md: 3 },
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        overflow: 'hidden'
      }}
      dir="rtl"
    >
      <Box sx={{ 
        mb: { xs: 3, md: 4 }, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon sx={{ 
            fontSize: { xs: 32, md: 42 }, 
            color: jobseekerColors.primary,
            transform: 'translateY(-2px)'
          }} />
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            color: jobseekerColors.primary,
            lineHeight: { xs: 1.3, sm: 1.4 }
          }}>
            اطلاعات شخصی
          </Typography>
        </Box>

        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ 
            backgroundColor: jobseekerColors.bgVeryLight,
            borderColor: jobseekerColors.primary,
            color: '#333',
            '& .MuiAlert-icon': {
              color: jobseekerColors.primary,
              display: { xs: 'none', sm: 'flex' }
            },
            '& .MuiAlert-message': {
              width: '100%',
              color: '#333'
            }
          }}
        >
          <Box>
            تکمیل اطلاعات شخصی به بهتر دیده شدن پروفایل شما کمک می‌کند.
          </Box>
        </Alert>
      </Box>

      {errors.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity="error" 
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setErrors([])}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>خطا در ثبت اطلاعات</AlertTitle>
            {errors.length === 1 ? errors[0] : (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  لطفاً موارد زیر را بررسی کنید:
                </Typography>
                <Box component="ul" sx={{ m: 0, pr: 3 }}>
                  {errors.map((error, index) => (
                    <Box 
                      component="li" 
                      key={index} 
                      sx={{ 
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2">{error}</Typography>
                      <IconButton
                        aria-label="حذف خطا"
                        color="inherit"
                        size="small"
                        onClick={() => removeError(index)}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        </Box>
      )}

      {success && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          severity="success" 
          sx={{ mb: 3 }}
        >
          اطلاعات شخصی با موفقیت به‌روزرسانی شد.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* عنوان شغلی و بیوگرافی */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* عنوان شغلی */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BusinessIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                عنوان شغلی
              </Typography>
            </Box>
            <Controller
              name="headline"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="مثال: برنامه‌نویس React"
                  error={Boolean(formErrors.headline)}
                  helperText={formErrors.headline?.message}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: jobseekerColors.primary
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* بیوگرافی */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <InfoIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              color: jobseekerColors.primary,
              fontWeight: 600
            }}>
              درباره من
            </Typography>
          </Box>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                placeholder="توضیح کوتاهی درباره خودتان، تخصص‌ها و علایق شغلی..."
                error={Boolean(formErrors.bio)}
                helperText={formErrors.bio?.message}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '6px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: jobseekerColors.primary
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.8rem', sm: '1rem' },
                    padding: { xs: '8px 14px', sm: '16.5px 14px' }
                  }
                }}
              />
            )}
          />
        </Box>

        {/* استان و شهر */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* استان */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOnIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                استان
              </Typography>
            </Box>
            <Controller
              name="province_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(formErrors.province_id)}>
                  <Select
                    {...field}
                    displayEmpty
                    input={<OutlinedInput sx={selectStyles} />}
                    renderValue={() => {
                      const selectedProvince = provinces.find(p => p.id === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          {selectedProvince ? selectedProvince.name : 'انتخاب استان'}
                        </Box>
                      );
                    }}
                    MenuProps={menuPropsRTL}
                    startAdornment={
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <LocationOnIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                      </InputAdornment>
                    }
                    IconComponent={(props: any) => (
                      <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                    )}
                  >
                    <MenuItem value={0} disabled>انتخاب استان</MenuItem>
                    {provinces.map((province) => (
                      <MenuItem key={province.id} value={province.id}>
                        {province.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.province_id && (
                    <FormHelperText>{formErrors.province_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>

          {/* شهر */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOnIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                شهر
              </Typography>
            </Box>
            <Controller
              name="city_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(formErrors.city_id)}>
                  <Select
                    {...field}
                    displayEmpty
                    disabled={!selectedProvinceId || selectedProvinceId === 0}
                    input={<OutlinedInput sx={selectStyles} />}
                    renderValue={() => {
                      const selectedCity = filteredCities.find(c => c.id === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          {selectedCity ? selectedCity.name : (selectedProvinceId ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید')}
                        </Box>
                      );
                    }}
                    MenuProps={menuPropsRTL}
                    startAdornment={
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <LocationOnIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                      </InputAdornment>
                    }
                    IconComponent={(props: any) => (
                      <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                    )}
                  >
                    <MenuItem value={0} disabled>
                      {selectedProvinceId ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}
                    </MenuItem>
                    {filteredCities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.city_id && (
                    <FormHelperText>{formErrors.city_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* صنعت و جنسیت */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* صنعت */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CategoryIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                حوزه کاری
              </Typography>
            </Box>
            <Controller
              name="industry_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(formErrors.industry_id)}>
                  <Select
                    {...field}
                    displayEmpty
                    input={<OutlinedInput sx={selectStyles} />}
                    renderValue={() => {
                      const selectedIndustry = industries.find(i => i.id === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          {selectedIndustry ? selectedIndustry.name : 'انتخاب حوزه کاری'}
                        </Box>
                      );
                    }}
                    MenuProps={menuPropsRTL}
                    startAdornment={
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <CategoryIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                      </InputAdornment>
                    }
                    IconComponent={(props: any) => (
                      <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                    )}
                  >
                    <MenuItem value={0} disabled>انتخاب حوزه کاری</MenuItem>
                    {industries.map((industry) => (
                      <MenuItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.industry_id && (
                    <FormHelperText>{formErrors.industry_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>

          {/* جنسیت */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PeopleIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                جنسیت
              </Typography>
            </Box>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(formErrors.gender)}>
                  <Select
                    {...field}
                    displayEmpty
                    input={<OutlinedInput sx={selectStyles} />}
                    renderValue={() => {
                      const selectedOption = genderOptions.find(opt => opt.value === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          {selectedOption ? selectedOption.label : 'انتخاب جنسیت'}
                        </Box>
                      );
                    }}
                    MenuProps={menuPropsRTL}
                    startAdornment={
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <PeopleIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                      </InputAdornment>
                    }
                    IconComponent={(props: any) => (
                      <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                    )}
                  >
                    <MenuItem value="" disabled>انتخاب جنسیت</MenuItem>
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.gender && (
                    <FormHelperText>{formErrors.gender.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* سن و تعداد فرزندان */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* سن */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CakeIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                سن
              </Typography>
            </Box>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ? convertToPersianNumbers(field.value) : ''}
                  onChange={(e) => {
                    // تبدیل اعداد فارسی به انگلیسی برای ذخیره
                    const englishValue = e.target.value.replace(/[۰-۹]/g, (d) => {
                      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                      return persianNumbers.indexOf(d).toString();
                    });
                    field.onChange(parseInt(englishValue) || 0);
                  }}
                  fullWidth
                  placeholder="سن شما"
                  error={Boolean(formErrors.age)}
                  helperText={formErrors.age?.message}
                  variant="outlined"
                  inputProps={{ min: 0, max: 100 }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: jobseekerColors.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* تعداد فرزندان */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ChildCareIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                تعداد فرزندان
              </Typography>
            </Box>
            <Controller
              name="kids_count"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ? convertToPersianNumbers(field.value) : ''}
                  onChange={(e) => {
                    // تبدیل اعداد فارسی به انگلیسی برای ذخیره
                    const englishValue = e.target.value.replace(/[۰-۹]/g, (d) => {
                      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                      return persianNumbers.indexOf(d).toString();
                    });
                    field.onChange(parseInt(englishValue) || 0);
                  }}
                  fullWidth
                  placeholder="تعداد فرزندان"
                  error={Boolean(formErrors.kids_count)}
                  helperText={formErrors.kids_count?.message}
                  variant="outlined"
                  inputProps={{ min: 0, max: 20 }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: jobseekerColors.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* وب‌سایت و لینکدین */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* وب‌سایت */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LanguageIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                وب‌سایت شخصی
              </Typography>
            </Box>
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="example.com یا www.example.com"
                  error={Boolean(formErrors.website)}
                  helperText={formErrors.website?.message}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: jobseekerColors.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* لینکدین */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LinkedInIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                پروفایل لینکدین
              </Typography>
            </Box>
            <Controller
              name="linkedin_profile"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="linkedin.com/in/yourprofile"
                  error={Boolean(formErrors.linkedin_profile)}
                  helperText={formErrors.linkedin_profile?.message}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: jobseekerColors.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* دکمه ذخیره */}
        <Box sx={{ 
          textAlign: { xs: 'center', sm: 'right' }, 
          mt: { xs: 3, md: 4 }
        }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: jobseekerColors.primary,
              px: { xs: 4, md: 6 },
              py: { xs: 1, md: 1.5 },
              borderRadius: 2,
              '&:hover': { bgcolor: jobseekerColors.dark },
              fontSize: { xs: '0.875rem', md: '1rem' },
              fontWeight: 'medium',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ ml: 1 }} />
                در حال ذخیره...
              </>
            ) : 'ذخیره اطلاعات'}
          </Button>
        </Box>
      </form>

      {/* ImageCropper برای تصویر پروفایل */}
      <ImageCropper
        open={showImageCropper}
        onClose={() => setShowImageCropper(false)}
        imageFile={selectedImageFile}
        onCropComplete={handleImageCropComplete}
        aspectRatio={1}
        title="ویرایش تصویر پروفایل"
      />
    </Paper>
  );
}
