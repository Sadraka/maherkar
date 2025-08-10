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
  CircularProgress,
  Avatar,
  FormControl,
  FormLabel,
  Select,
  OutlinedInput,
  useTheme,
  type MenuProps,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { EMPLOYER_THEME } from '@/constants/colors';
import { useAuth } from '@/store/authStore';
import cookieService from '@/lib/cookieService';
import ImageCropper from '@/components/common/ImageCropper';
import { useAuthActions } from '@/store/authStore';
import { GroupedAutocomplete } from '@/components/common';

// تابع تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (value: number | string): string => {
  if (!value) return '';
  return value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
};

// تعریف interface برای فرم پروفایل
interface ProfileFormInputs {
  full_name: string;
  bio: string;
  gender: string;
  age: number | null;
  kids_count: number | null;
  location: number | undefined;
  profile_picture?: FileList;
  delete_profile_picture?: boolean;
}

// تعریف interface برای شهر
interface City {
  id: number;
  name: string;
  province?: {
    id: number;
    name: string;
  };
}

// تعریف interface برای صنعت
interface Industry {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
  };
}

// تعریف interface برای استان
interface Province {
  id: number;
  name: string;
}

// تعریف interface برای پروفایل کارفرما
interface EmployerProfile {
  id: number;
  user: {
    id: number;
    full_name: string;
    phone: string;
  };
  personal_info: {
    id: number;
    gender: string;
    age: number;
    kids_count: number;
  };
  bio: string;
  profile_picture?: string;
  location?: number | {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  created_at: string;
  updated_at: string;
}

// گزینه‌های جنسیت
const GENDER_CHOICES = [
  { value: 'M', label: 'آقا' },
  { value: 'W', label: 'خانوم' }
];

/**
 * کامپوننت فرم پروفایل کارفرما
 */
export default function EmployerProfileForm() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { refreshUserData } = useAuthActions();
  const employerColors = EMPLOYER_THEME;

  // تنظیمات مشترک منوی کشویی (مطابق فرم ثبت آگهی)
  const menuPropsRTL: Partial<MenuProps> = {
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
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
          '&:hover': { backgroundColor: employerColors.bgVeryLight },
          '&.Mui-selected': {
            backgroundColor: employerColors.bgLight,
            color: employerColors.primary,
            fontWeight: 'bold',
            '&:hover': { backgroundColor: employerColors.bgLight }
          }
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

  // استایل مشترک Select ها (مطابق فرم ثبت آگهی)
  const selectStyles = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      width: '100%',
      borderRadius: '6px',
      backgroundColor: theme.palette.background.paper,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      direction: 'rtl',
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
        borderWidth: 0,
        boxShadow: `0 0 0 2px ${employerColors.primary}20`
      },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
      '.MuiOutlinedInput-notchedOutline': { borderColor: 'transparent', borderWidth: 0 }
    },
    '& .MuiInputBase-input': {
      textAlign: 'left',
      direction: 'ltr',
      paddingLeft: '36px',
      paddingRight: '36px',
      fontSize: { xs: '0.95rem', md: '0.9rem' }
    },
    '& .MuiSelect-icon': {
      right: 'auto',
      left: '7px',
      color: employerColors.primary
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      textAlign: 'left',
      paddingRight: '28px',
      paddingLeft: '28px',
      width: '100%'
    }
  };

  
  // State ها
  const [profileData, setProfileData] = useState<EmployerProfile | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // همیشه در حالت ویرایش
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  

  


  // Monitor state changes
  useEffect(() => {
    // State monitoring removed for production
  }, [success, errors]);
  

 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // تابع اسکرول به بخش پیام‌ها
  const scrollToMessages = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors: formErrors },
    watch,
    setValue,
    reset
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      full_name: '',
      bio: '',
      gender: 'M',
      age: 18,
      kids_count: 0,
      location: undefined,
      delete_profile_picture: false
    },
    mode: 'onChange'
  });

  // نظارت بر تغییرات فایل تصویر پروفایل
  const profilePictureFiles = watch('profile_picture');

  // نمایش پیش‌نمایش تصویر پروفایل
  useEffect(() => {
    if (profilePictureFiles && profilePictureFiles[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.onerror = (e) => {
        // Error reading file silently handled
      };
      reader.readAsDataURL(profilePictureFiles[0]);
    }
  }, [profilePictureFiles]);

  // نظارت بر تغییرات فرم
  const watchedValues = watch();
  
  // اسکرول به پیام‌ها وقتی پیام‌ها تغییر می‌کنند
  useEffect(() => {
    if (errors.length > 0 || success) {
      setTimeout(() => {
        scrollToMessages();
      }, 100);
    }
  }, [errors, success]);
  
  useEffect(() => {
    if (profileData) {
      const currentValues = {
        bio: watchedValues.bio || '',
        gender: watchedValues.gender || 'M',
        age: watchedValues.age || 18,
        kids_count: watchedValues.kids_count || 0,
        location: watchedValues.location,
        profile_picture: watchedValues.profile_picture,
        delete_profile_picture: watchedValues.delete_profile_picture
      };

      const originalValues = {
        bio: profileData.bio || '',
        gender: profileData.personal_info?.gender || 'M',
        age: profileData.personal_info?.age || 18,
        kids_count: profileData.personal_info?.kids_count || 0,
        location: typeof profileData.location === 'number' ? profileData.location : profileData.location?.id,
        profile_picture: undefined,
        delete_profile_picture: false
      };

      // بررسی تغییرات
      const hasFormChanges: boolean = 
        currentValues.bio !== originalValues.bio ||
        currentValues.gender !== originalValues.gender ||
        currentValues.age !== originalValues.age ||
        currentValues.kids_count !== originalValues.kids_count ||
        currentValues.location !== originalValues.location ||
        !!currentValues.profile_picture ||
        !!currentValues.delete_profile_picture;

      setHasChanges(hasFormChanges);
    }
  }, [watchedValues, profileData]);

  // بارگذاری داده‌های اولیه
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [profileResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/profiles/employers/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/')
        ]);

        setProfileData(profileResponse.data as EmployerProfile);
        setCities(citiesResponse.data as City[]);
        setProvinces(provincesResponse.data as Province[]);
        
        // پر کردن فرم با داده‌های موجود
        if (profileResponse.data) {
          const profile = profileResponse.data as EmployerProfile;
          const formData = {
            full_name: user?.full_name || '', // نام از store گرفته می‌شود
            bio: profile.bio || '',
            gender: profile.personal_info?.gender || 'M',
            age: profile.personal_info?.age || 18,
            kids_count: profile.personal_info?.kids_count || 0,
            location: typeof profile.location === 'number' ? profile.location : profile.location?.id || undefined,
          };
          
          reset(formData);
          
          // تنظیم پیش‌نمایش تصویر پروفایل
          if (profile.profile_picture) {
            setProfileImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${profile.profile_picture}`);
          }
        }
      } catch (err) {
        setErrors(['خطا در دریافت اطلاعات پروفایل. لطفاً دوباره تلاش کنید.']);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [reset, user?.full_name]);

  // تابع ارسال فرم
  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    setSaving(true);
    setErrors([]);
 
    try {
      // ساخت payload برای پروفایل کارفرما
      const profilePayload: any = {
        bio: data.bio || '',
        personal_info: {
          gender: data.gender,
          age: data.age,
          kids_count: data.kids_count
        }
      };

      // اضافه کردن location (اگر null باشد، حذف می‌شود)
      if (data.location !== undefined) {
        profilePayload.location = data.location;
      }

      // اگر تصویر پروفایل انتخاب شده یا باید حذف شود، همه چیز را با FormData ارسال کنیم
      if ((data.profile_picture && data.profile_picture[0]) || data.delete_profile_picture) {
        const imageFormData = new FormData();
        
        if (data.profile_picture && data.profile_picture[0]) {
          imageFormData.append('profile_picture', data.profile_picture[0]);
        } else if (data.delete_profile_picture) {
          // ارسال فیلد خالی برای حذف تصویر
          imageFormData.append('profile_picture', '');
        }
        
        // اضافه کردن سایر فیلدهای مورد نیاز
        imageFormData.append('bio', data.bio || '');
        imageFormData.append('personal_info', JSON.stringify({
          gender: data.gender,
          age: data.age,
          kids_count: data.kids_count
        }));
        
        if (data.location !== undefined) {
          imageFormData.append('location', data.location ? data.location.toString() : '');
        }
        
        // استفاده از axios مستقیماً برای ارسال فایل
        const axios = (await import('axios')).default;
        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profiles/employers/update/${profileData?.id}/`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${cookieService.getCookie('access_token')}`
          },
        });
      } else {
        // اگر تصویر انتخاب نشده، فقط اطلاعات پروفایل را ارسال کنیم
        await apiPut(`/profiles/employers/update/${profileData?.id}/`, profilePayload);
      }

      // نمایش پیام موفقیت
      setSuccess(true);
      setHasChanges(false);
      
      // اسکرول به پیام‌ها
      scrollToMessages();
      
      // پاک کردن پیام بعد از 5 ثانیه
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      

      
    } catch (err: any) {
      if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat();
        setErrors(errorMessages as string[]);
      } else {
        setErrors(['خطا در به‌روزرسانی پروفایل. لطفاً دوباره تلاش کنید.']);
      }
      
      // اسکرول به پیام‌ها
      scrollToMessages();
      

    } finally {
      setSaving(false);
    }
  };

  // تابع انتخاب تصویر پروفایل
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  // تابع پردازش تصویر انتخاب شده
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setShowImageCropper(true);
    }
  };

  // تابع تکمیل کراپ تصویر
  const handleCropComplete = (croppedImage: File) => {
    // ایجاد FileList جدید
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedImage);
    const fileList = dataTransfer.files;
    
    // تنظیم فایل در فرم
    setValue('profile_picture', fileList);
    
    // ایجاد پیش‌نمایش
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedImage);
    
    // بستن cropper
    setShowImageCropper(false);
    setSelectedImageFile(null);
  };

  // تابع حذف تصویر پروفایل
  const handleDeleteImage = () => {
    
    // پاک کردن UI
    setProfileImagePreview(null);
    setValue('profile_picture', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // تنظیم یک فلگ برای نشان دادن اینکه تصویر باید حذف شود
    setValue('delete_profile_picture', true);
  };



  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper 
      elevation={0}
      dir="rtl"
      sx={{ 
        p: 3, 
        direction: 'rtl', 
        textAlign: 'right',
        '& *': { direction: 'rtl' },
        borderRadius: 3,
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        overflow: 'hidden'
      }}
    >
      {/* هدر صفحه */}
      <Box sx={{ mb: 3, textAlign: 'left', direction: 'ltr' }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          style={{ textAlign: 'left', direction: 'ltr' }}
          sx={{ 
            mb: 1, 
            color: employerColors.primary, 
            textAlign: 'left !important',
            direction: 'ltr !important',
            '&.MuiTypography-root': {
              textAlign: 'left !important',
              direction: 'ltr !important'
            }
          }}
        >
          پروفایل کارفرما
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            textAlign: 'left !important',
            direction: 'ltr !important'
          }}
        >
          اطلاعات شخصی و حرفه‌ای خود را مدیریت کنید
        </Typography>
      </Box>

      {/* پیام‌های خطا و موفقیت */}
      <Box ref={messagesRef} id="messages-section" sx={{ position: 'relative', zIndex: 1000 }}>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ 
            mb: 3, 
            textAlign: 'left', 
            direction: 'ltr',
            position: 'relative',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <AlertTitle sx={{ textAlign: 'left' }}>خطا</AlertTitle>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ textAlign: 'left' }}>
                {error}
              </Typography>
            ))}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ 
            mb: 3, 
            textAlign: 'left', 
            direction: 'ltr',
            position: 'relative',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Typography sx={{ textAlign: 'left' }}>
              پروفایل شما با موفقیت به‌روزرسانی شد
            </Typography>
          </Alert>
        )}
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, gap: 3, direction: 'rtl' }}>
          {/* ستون اول - اطلاعات شخصی */}
          <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
            <Paper
              elevation={0}
              dir="ltr"
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(66,133,244,0.05)',
                border: `2px solid ${EMPLOYER_THEME.primary}`,
                transition: 'all 0.25s ease',
                direction: 'ltr',
                textAlign: 'left',
                '& *': { direction: 'ltr' },

              }}
            >
              <Typography variant="h6" fontWeight="bold" style={{ textAlign: 'left', direction: 'ltr' }} sx={{ 
                mb: 3, 
                color: employerColors.primary, 
                textAlign: 'left !important', 
                direction: 'ltr !important',
                '&.MuiTypography-root': {
                  textAlign: 'left !important',
                  direction: 'ltr !important'
                }
              }}>
                اطلاعات شخصی
              </Typography>

              {/* تصویر پروفایل */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profileImagePreview || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: employerColors.primary,
                      border: `3px solid ${alpha(employerColors.primary, 0.2)}`,
                      transition: 'all 0.2s ease'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                
                  {/* دکمه ویرایش روی تصویر */}
                  <Tooltip title="تغییر تصویر" arrow>
                    <IconButton
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: employerColors.primary,
                        color: 'white',
                        width: 36,
                        height: 36,
                        border: '3px solid white',
                        '&:hover': {
                          bgcolor: employerColors.dark,
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      size="small"
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  
                  {/* دکمه حذف اگر تصویر وجود داشته باشد */}
                  {profileImagePreview && (
                    <Tooltip title="حذف تصویر" arrow>
                      <IconButton
                        onClick={handleDeleteImage}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'error.main',
                          color: 'white',
                          width: 32,
                          height: 32,
                          border: '2px solid white',
                          '&:hover': {
                            bgcolor: 'error.dark',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        size="small"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageFileSelect}
                />
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  برای تغییر تصویر کلیک کنید
                </Typography>
              </Box>

              {/* نام و نام خانوادگی */}
              <TextField
                {...register('full_name')}
                label="نام و نام خانوادگی"
                fullWidth
                disabled
                value={user?.full_name || ''}
                sx={{ 
                  mb: 2, 
                  '& .MuiInputBase-input': { textAlign: 'left' },
                  '& .Mui-disabled': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'text.primary',
                    WebkitTextFillColor: 'text.primary',
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary'
                    }
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    '& fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {/* شماره تلفن */}
              <TextField
                label="شماره تلفن"
                fullWidth
                disabled
                value={toPersianDigits(profileData?.user?.phone || user?.phone || '') || 'در دسترس نیست'}
                sx={{ 
                  mb: 2, 
                  '& .MuiInputBase-input': { textAlign: 'left' },
                  '& .Mui-disabled': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'text.primary',
                    WebkitTextFillColor: 'text.primary',
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary'
                    }
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    '& fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {/* تاریخ عضویت */}
              <TextField
                label="تاریخ عضویت"
                fullWidth
                disabled
                value={profileData?.created_at ? toPersianDigits(new Date(profileData.created_at).toLocaleDateString('fa-IR')) : '-'}
                sx={{ 
                  mb: 2, 
                  '& .MuiInputBase-input': { textAlign: 'left' },
                  '& .Mui-disabled': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'text.primary',
                    WebkitTextFillColor: 'text.primary',
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary'
                    }
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    '& fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {/* جنسیت */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>جنسیت</FormLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      displayEmpty
                      input={<OutlinedInput sx={selectStyles} />}
                      MenuProps={menuPropsRTL}
                      IconComponent={(props: any) => (
                        <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                      )}
                      renderValue={() => {
                        const selected = GENDER_CHOICES.find(c => c.value === field.value);
                        return (
                          <Box component="div" sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                            {selected ? selected.label : 'انتخاب کنید'}
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value="" disabled>
                        انتخاب کنید
                      </MenuItem>
                      {GENDER_CHOICES.map((choice) => (
                        <MenuItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              {/* سن و تعداد فرزند در یک ردیف */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Controller
                  name="age"
                  control={control}
                  rules={{
                    required: 'سن الزامی است',
                    min: { value: 18, message: 'حداقل سن ۱۸ سال است' },
                    max: { value: 100, message: 'حداکثر سن ۱۰۰ سال است' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="سن"
                      type="text"
                      sx={{ flex: 1, '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' } }}
                      value={field.value ? toPersianDigits(field.value) : ''}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^۰-۹0-9]/g, '');
                        val = val.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
                        const num = parseInt(val, 10);
                        field.onChange(isNaN(num) ? 18 : num);
                      }}
                      error={!!formErrors.age}
                      helperText={formErrors.age?.message}
                    />
                  )}
                />

                <Controller
                  name="kids_count"
                  control={control}
                  rules={{
                    required: 'تعداد فرزند الزامی است',
                    min: { value: 0, message: 'تعداد فرزند نمی‌تواند منفی باشد' },
                    max: { value: 20, message: 'حداکثر ۲۰ فرزند' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="تعداد فرزند"
                      type="text"
                      sx={{ flex: 1, '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' } }}
                      value={field.value !== undefined && field.value !== null ? toPersianDigits(field.value) : ''}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^۰-۹0-9]/g, '');
                        val = val.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
                        const num = parseInt(val, 10);
                        field.onChange(isNaN(num) ? 0 : num);
                      }}
                      error={!!formErrors.kids_count}
                      helperText={formErrors.kids_count?.message}
                    />
                  )}
                />
              </Box>
            </Paper>
         </Box>

          {/* ستون دوم - اطلاعات حرفه‌ای */}
          <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
            <Paper
              elevation={0}
              dir="ltr"
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(66,133,244,0.05)',
                border: `2px solid ${EMPLOYER_THEME.primary}`,
                transition: 'all 0.25s ease',
                direction: 'ltr',
                textAlign: 'left',
                '& *': { direction: 'ltr' },

              }}
            >
                            <Typography variant="h6" fontWeight="bold" style={{ textAlign: 'left', direction: 'ltr' }} sx={{ 
                mb: 3, 
                color: employerColors.primary, 
                textAlign: 'left !important', 
                direction: 'ltr !important',
                '&.MuiTypography-root': {
                  textAlign: 'left !important',
                  direction: 'ltr !important'
                }
              }}>
                اطلاعات حرفه‌ای
              </Typography>

              {/* بیوگرافی */}
              <TextField
                {...register('bio')}
                label="بیوگرافی"
                multiline
                rows={4}
                fullWidth
                sx={{ mb: 2, '& .MuiInputBase-input': { textAlign: 'left' } }}
                placeholder="توضیح مختصر درباره خودتان یا شرکت..."
              />

              {/* مکان */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>شهر محل کار</FormLabel>
                <GroupedAutocomplete
                  name="location"
                  control={control}
                  options={cities}
                  label="شهر"
                  placeholder="جستجو و انتخاب شهر"
                  groupBy={(city) => city.province?.name || 'سایر'}
                  getOptionLabel={(city) => city.name}
                  theme={EMPLOYER_THEME}
                  icon={<SearchIcon />}
                  loading={loading}
                />
              </FormControl>


            </Paper>
          </Box>
         </Box>

        {/* دکمه‌های عملیات */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexDirection: 'row-reverse', direction: 'rtl' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || !hasChanges}
                sx={{
                  bgcolor: employerColors.primary,
                  color: 'white',
                  '&:hover': { 
                    bgcolor: employerColors.dark,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  },
                  '&:disabled': {
                    bgcolor: employerColors.primary,
                    color: 'white',
                    cursor: 'not-allowed',
                    opacity: 0.5
                  },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  minWidth: '140px', // ثابت کردن عرض دکمه
                  width: '140px', // عرض ثابت
                  height: '48px', // ارتفاع ثابت
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {saving ? '...' : 'ذخیره تغییرات'}
              </Button>
        </Box>
      </form>

      {/* کامپوننت کراپ تصویر */}
      <ImageCropper
        open={showImageCropper}
        onClose={() => {
          setShowImageCropper(false);
          setSelectedImageFile(null);
        }}
        imageFile={selectedImageFile}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        title="ویرایش تصویر پروفایل"
      />
    </Paper>
  );
} 