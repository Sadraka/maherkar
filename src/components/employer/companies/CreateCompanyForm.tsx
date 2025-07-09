'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/axios';
import Image from 'next/image';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  MenuItem, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Alert,
  AlertTitle,
  IconButton,
  CircularProgress,
  ListSubheader,
  Tooltip,
  Autocomplete,
  InputAdornment,
  Select,
  FormControl,
  FormHelperText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ImageIcon from '@mui/icons-material/Image';
import { EMPLOYER_THEME } from '@/constants/colors';

/**
 * تایپ استان برای TypeScript
 */
type Province = {
  id: number;
  name: string;
};

/**
 * تایپ صنعت برای TypeScript
 */
type Industry = {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
  };
  icon?: string;
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
 * ورودی‌های فرم ثبت شرکت
 */
interface CompanyFormInputs {
  name: string;
  city_id: number;
  description: string;
  website: string;
  email: string;
  phone_number: string;
  address: string;
  postal_code: string;
  founded_date: string;
  industry: number;
  number_of_employees: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  logo: FileList;
  banner: FileList;
  intro_video: FileList;
}

// کامپوننت پیش‌نمایش تصویر
interface ImagePreviewProps {
  src: string;
  alt: string;
  onDelete: () => void;
  objectFit?: 'contain' | 'cover';
  aspectRatio?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, onDelete, objectFit = 'contain', aspectRatio = '1/1' }) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: aspectRatio }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit }}
        />
        <Tooltip title="حذف" arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// کامپوننت پیش‌نمایش ویدیو
interface VideoPreviewProps {
  src: string;
  onDelete: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ src, onDelete }) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <video
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          controls
        />
        <Tooltip title="حذف" arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

/**
 * کامپوننت فرم ثبت شرکت جدید
 */
export default function CreateCompanyForm() {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [expandedOptional, setExpandedOptional] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors: formErrors },
    watch,
    setValue
  } = useForm<CompanyFormInputs>({
    defaultValues: {
      name: '',
      city_id: 0,
      industry: 0,
      description: '',
      website: '',
      email: '',
      phone_number: '',
      address: '',
      postal_code: '',
      founded_date: '',
      number_of_employees: '',
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  });

  // نظارت بر تغییرات فایل‌ها برای نمایش پیش‌نمایش
  const logoFiles = watch('logo');
  const bannerFiles = watch('banner');

  // اعتبارسنجی URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch (e) {
      return false;
    }
  };

  // اعتبارسنجی ایمیل
  const isValidEmail = (email: string): boolean => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  // اعتبارسنجی شماره تلفن
  const isValidPhoneNumber = (phone: string): boolean => {
    return /^(\+98|0)?[0-9]{10,11}$/.test(phone);
  };

  // اعتبارسنجی فایل‌ها
  const validateFile = (file: File, type: 'image' | 'video', maxSizeMB: number): { valid: boolean; error?: string } => {
    // بررسی اندازه فایل (به مگابایت)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return { 
        valid: false, 
        error: `حجم فایل (${fileSizeMB.toFixed(2)} مگابایت) بیشتر از حد مجاز (${maxSizeMB} مگابایت) است.` 
      };
    }

    // بررسی نوع فایل
    if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'فایل انتخاب شده باید تصویر باشد.' };
      }
    } else if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        return { valid: false, error: 'فایل انتخاب شده باید ویدیو باشد.' };
      }
    }

    return { valid: true };
  };

  useEffect(() => {
    if (logoFiles && logoFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(logoFiles[0]);
    }
  }, [logoFiles]);

  useEffect(() => {
    if (bannerFiles && bannerFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(bannerFiles[0]);
    }
  }, [bannerFiles]);

  // اضافه کردن پیش‌نمایش ویدیو
  const videoFiles = watch('intro_video');
  useEffect(() => {
    if (videoFiles && videoFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(videoFiles[0]);
    }
  }, [videoFiles]);

  // لود داده‌های مورد نیاز (صنایع و شهرها)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/industries/industries/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/')
        ]);
        setIndustries(industriesResponse.data as Industry[]);
        setCities(citiesResponse.data as City[]);
        setProvinces(provincesResponse.data as Province[]);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setErrors(['خطا در دریافت اطلاعات مورد نیاز. لطفاً دوباره تلاش کنید.']);
      }
    };

    fetchData();
   
  }, []);

  // گروه‌بندی شهرها بر اساس استان
  const groupedCities = React.useMemo(() => {
    // اگر شهرها یا استان‌ها دریافت نشده باشند، آرایه خالی برگردان
    if (!cities.length || !provinces.length) return [];

    // ایجاد یک آرایه از استان‌ها با شهرهای مربوط به هر کدام
    return provinces.map(province => ({
      province,
      cities: cities.filter(city => city.province?.id === province.id)
    })).filter(group => group.cities.length > 0); // فقط استان‌هایی که شهر دارند
  }, [cities, provinces]);

  // تبدیل شهر به آبجکت برای Autocomplete
  const selectedCity = React.useMemo(() => {
    const cityId = watch('city_id');
    return cities.find(city => city.id === cityId) || null;
  }, [watch('city_id'), cities]);

  const onSubmit: SubmitHandler<CompanyFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    // بررسی فیلدهای اجباری
    if (!data.name || !data.name.trim()) {
      setErrors(['لطفاً نام شرکت را وارد کنید']);
      setLoading(false);
      return;
    }

    if (!data.city_id || data.city_id === 0) {
      setErrors(['لطفاً شهر محل فعالیت شرکت را انتخاب کنید']);
      setLoading(false);
      return;
    }

    // اعتبارسنجی فایل‌ها
    if (data.logo && data.logo.length > 0) {
      const validation = validateFile(data.logo[0], 'image', 2); // حداکثر 2 مگابایت
      if (!validation.valid) {
        setErrors([`خطا در لوگو: ${validation.error}`]);
        setLoading(false);
        return;
      }
    }

    if (data.banner && data.banner.length > 0) {
      const validation = validateFile(data.banner[0], 'image', 5); // حداکثر 5 مگابایت
      if (!validation.valid) {
        setErrors([`خطا در بنر: ${validation.error}`]);
        setLoading(false);
        return;
      }
    }

    if (data.intro_video && data.intro_video.length > 0) {
      const validation = validateFile(data.intro_video[0], 'video', 50); // حداکثر 50 مگابایت
      if (!validation.valid) {
        setErrors([`خطا در ویدیو: ${validation.error}`]);
        setLoading(false);
        return;
      }
    }

    // اعتبارسنجی فیلدهای اختیاری در صورت پر شدن
    if (data.email && !isValidEmail(data.email)) {
      setErrors(['فرمت ایمیل وارد شده صحیح نیست']);
      setLoading(false);
      return;
    }

    if (data.website && !isValidUrl(data.website)) {
      setErrors(['آدرس وبسایت وارد شده معتبر نیست']);
      setLoading(false);
      return;
    }

    if (data.phone_number && !isValidPhoneNumber(data.phone_number)) {
      setErrors(['فرمت شماره تلفن وارد شده صحیح نیست']);
      setLoading(false);
      return;
    }

    if (data.postal_code && !/^[0-9]{10}$/.test(data.postal_code)) {
      setErrors(['کد پستی باید 10 رقم باشد']);
      setLoading(false);
      return;
    }

    // بررسی فرمت آدرس‌های شبکه‌های اجتماعی
    const socialMediaFields = ['linkedin', 'twitter', 'instagram'];
    for (const field of socialMediaFields) {
      const value = data[field as keyof CompanyFormInputs] as string;
      if (value && value.trim() !== '' && !isValidUrl(value)) {
        setErrors([`آدرس ${field} وارد شده معتبر نیست`]);
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      
      // اضافه کردن فقط فیلدهای مورد نیاز به FormData (و نه همه فیلدها)
      // نام شرکت - اجباری
      formDataToSend.append('name', data.name);
      
      // شهر - اجباری (با نام city_id که سرور انتظار دارد)
      if (data.city_id && data.city_id !== 0) {
        formDataToSend.append('city_id', String(data.city_id));
      }
      
      // صنعت - اختیاری (فقط در صورتی که مقدار معتبر داشته باشد)
      if (data.industry && data.industry !== 0) {
        formDataToSend.append('industry', String(data.industry));
      }
      
      // اضافه کردن سایر فیلدهای متنی اختیاری
      const optionalTextFields = ['description', 'website', 'email', 'phone_number', 'address', 
                                 'postal_code', 'founded_date', 'number_of_employees',
                                 'linkedin', 'twitter', 'instagram'];
                                 
      optionalTextFields.forEach(field => {
        if (data[field as keyof CompanyFormInputs] && String(data[field as keyof CompanyFormInputs]).trim() !== '') {
          formDataToSend.append(field, String(data[field as keyof CompanyFormInputs]));
        }
      });
      
      // اضافه کردن فایل‌ها به FormData
      if (data.logo && data.logo.length > 0) {
        formDataToSend.append('logo', data.logo[0]);
      }
      
      if (data.banner && data.banner.length > 0) {
        formDataToSend.append('banner', data.banner[0]);
      }
      
      if (data.intro_video && data.intro_video.length > 0) {
        formDataToSend.append('intro_video', data.intro_video[0]);
      }

      // چاپ داده‌های ارسالی برای اشکال‌زدایی
      console.log('داده‌های ارسالی به سرور:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const response = await apiPost('/companies/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      // هدایت کاربر به صفحه لیست شرکت‌ها پس از ثبت موفق
      setTimeout(() => {
        router.push('/employer/companies');
      }, 2000);
    } catch (err: any) {
      console.error('خطا در ثبت شرکت:', err);
      
      const newErrors: string[] = [];
      
      // نمایش دقیق‌تر خطاهای سرور
      if (err.response?.data) {
        console.log('جزئیات خطای سرور:', err.response.data);
        
        // بررسی ساختار خطا و استخراج پیام مناسب
        if (typeof err.response.data === 'object') {
          const errorMessages: Record<string, Record<string, string>> = {
            'name': {
              'unique': 'این نام شرکت قبلاً ثبت شده است. لطفاً نام دیگری انتخاب کنید.',
              'required': 'نام شرکت الزامی است.',
              'blank': 'نام شرکت نمی‌تواند خالی باشد.',
              'default': 'مشکلی در ثبت نام شرکت وجود دارد.'
            },
            'city_id': {
              'required': 'انتخاب شهر الزامی است.',
              'invalid': 'شهر انتخابی معتبر نیست.',
              'does_not_exist': 'شهر انتخاب شده در سیستم وجود ندارد.',
              'default': 'مشکلی در انتخاب شهر وجود دارد.'
            },
            'logo': {
              'invalid': 'فرمت لوگو معتبر نیست. لطفاً از فرمت‌های JPG یا PNG استفاده کنید.',
              'too_large': 'حجم لوگو بیش از حد مجاز است (حداکثر 2 مگابایت).',
              'default': 'مشکلی در آپلود لوگو وجود دارد.'
            },
            'banner': {
              'invalid': 'فرمت بنر معتبر نیست. لطفاً از فرمت‌های JPG یا PNG استفاده کنید.',
              'too_large': 'حجم بنر بیش از حد مجاز است (حداکثر 5 مگابایت).',
              'default': 'مشکلی در آپلود بنر وجود دارد.'
            },
            'intro_video': {
              'invalid': 'فرمت ویدیو معتبر نیست.',
              'too_large': 'حجم ویدیو بیش از حد مجاز است (حداکثر 50 مگابایت).',
              'default': 'مشکلی در آپلود ویدیو وجود دارد.'
            },
            'email': {
              'invalid': 'فرمت ایمیل وارد شده صحیح نیست.',
              'default': 'ایمیل وارد شده معتبر نیست.'
            },
            'website': {
              'invalid': 'آدرس وبسایت معتبر نیست.',
              'default': 'مشکلی در ثبت وبسایت وجود دارد.'
            },
            'phone_number': {
              'invalid': 'شماره تلفن معتبر نیست.',
              'default': 'مشکلی در ثبت شماره تلفن وجود دارد.'
            },
            'default': {'message': 'خطا در ثبت اطلاعات شرکت. لطفا دوباره تلاش کنید.'}
          };
          
          // بررسی خطاها و نمایش پیام‌های مناسب
          for (const [field, errors] of Object.entries(err.response.data)) {
            if (Array.isArray(errors)) {
              const errorMsg = errors[0]?.toLowerCase() || '';
              
              if (field === 'name' && (errorMsg.includes('unique') || errorMsg.includes('already exists'))) {
                newErrors.push(errorMessages.name.unique);
              } else if (field === 'city_id' && errorMsg.includes('does not exist')) {
                newErrors.push(errorMessages.city_id.does_not_exist);
              } else if (field === 'city_id' && (errorMsg.includes('required') || errorMsg.includes('null'))) {
                newErrors.push(errorMessages.city_id.required);
              } else if (errorMessages[field as keyof typeof errorMessages]) {
                // بررسی نوع خطا برای هر فیلد
                const fieldErrors = errorMessages[field as keyof typeof errorMessages];
                let foundSpecificError = false;
                
                for (const [errorType, message] of Object.entries(fieldErrors)) {
                  if (errorType !== 'default' && errorMsg.includes(errorType)) {
                    newErrors.push(message);
                    foundSpecificError = true;
                    break;
                  }
                }
                
                // اگر خطای خاصی تشخیص داده نشد، پیام پیش‌فرض را نمایش بده
                if (!foundSpecificError && fieldErrors.default) {
                  newErrors.push(fieldErrors.default);
                }
              } else {
                // برای سایر خطاها، پیام خام را نمایش بده
                const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
                errors.forEach((msg: string) => newErrors.push(`${fieldName}${msg}`));
              }
            }
          }
        }
      } else if (err.message) {
        newErrors.push(`خطا: ${err.message}`);
      }
      
      if (newErrors.length === 0) {
        newErrors.push('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
      }
      
      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  // حذف یک خطا از لیست خطاها
  const removeError = (index: number) => {
    setErrors(errors.filter((_, i) => i !== index));
  };

  // تابع حذف لوگو
  const handleDeleteLogo = () => {
    setValue('logo', undefined as any);
    setLogoPreview(null);
  };

  // تابع حذف بنر
  const handleDeleteBanner = () => {
    setValue('banner', undefined as any);
    setBannerPreview(null);
  };

  // تابع حذف ویدیو
  const handleDeleteVideo = () => {
    setValue('intro_video', undefined as any);
    setVideoPreview(null);
  };

  return (
    <Paper 
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
          <DomainAddIcon sx={{ 
            fontSize: { xs: 32, md: 42 }, 
            color: EMPLOYER_THEME.primary,
            transform: 'translateY(-2px)'
          }} />
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            color: EMPLOYER_THEME.primary
          }}>
            ثبت شرکت جدید
          </Typography>
        </Box>
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ 
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box>
            تنها نام شرکت و شهر اجباری هستند. تکمیل سایر اطلاعات به معرفی بهتر شرکت کمک می‌کند.
          </Box>
        </Alert>
      </Box>

      {errors.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity="error" 
            sx={{ mb: errors.length > 1 ? 2 : 0 }}
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
            <AlertTitle>خطا در ثبت شرکت</AlertTitle>
            {errors.length === 1 ? errors[0] : 'لطفاً موارد زیر را بررسی کنید:'}
          </Alert>
          
          {errors.length > 1 && (
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
          )}
        </Box>
      )}

      {success && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          severity="success" 
          sx={{ mb: 3 }}
        >
          شرکت با موفقیت ثبت شد. در حال انتقال به صفحه شرکت‌ها...
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* فیلدهای اجباری */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3, 
              pb: 1, 
              borderBottom: '1px solid #f0f0f0',
              color: EMPLOYER_THEME.primary
            }}
          >
            اطلاعات ضروری شرکت (اجباری)
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            این بخش‌ها برای ثبت شرکت الزامی هستند و باید تکمیل شوند.
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3,
            alignItems: 'flex-start'
          }}>
            {/* بخش‌های سمت راست */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium">
                    نام شرکت <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                </Box>
                <Controller
                  name="name"
                  control={control}
                  rules={{ 
                    required: 'نام شرکت الزامی است', 
                    minLength: { value: 2, message: 'نام شرکت باید حداقل 2 حرف باشد' } 
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="نام شرکت را وارد کنید"
                      error={Boolean(formErrors.name)}
                      helperText={formErrors.name?.message}
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: EMPLOYER_THEME.primary
                          }
                        }
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium">
                    شهر <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                </Box>
                <Controller
                  name="city_id"
                  control={control}
                  rules={{ 
                    validate: value => value !== 0 || 'انتخاب شهر الزامی است' 
                  }}
                  render={({ field: { onChange, value, ref } }) => (
                    <FormControl fullWidth error={Boolean(formErrors.city_id)}>
                      <Autocomplete
                        value={cities.find(city => city.id === value) || null}
                        onChange={(_, newValue) => onChange(newValue ? newValue.id : 0)}
                        options={cities}
                        groupBy={(city) => city.province?.name || ''}
                        getOptionLabel={(city) => city.name}
                        filterOptions={(options, state) => {
                          const inputValue = state.inputValue.trim();
                          if (!inputValue) return options;
                          
                          const normalizedInput = inputValue
                            .replace(/ي/g, 'ی')
                            .replace(/ك/g, 'ک');
                            
                          return options.filter(city => {
                            const normalizedCityName = city.name
                              .replace(/ي/g, 'ی')
                              .replace(/ك/g, 'ک');
                              
                            const normalizedProvinceName = (city.province?.name || '')
                              .replace(/ي/g, 'ی')
                              .replace(/ك/g, 'ک');
                              
                            return normalizedCityName.includes(normalizedInput) || 
                                   normalizedProvinceName.includes(normalizedInput);
                          });
                        }}
                        noOptionsText="شهری یافت نشد"
                        loadingText="در حال جستجو..."
                        renderOption={(props, city) => (
                          <Box component="li" {...props} key={city.id} sx={{
                            py: 1,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                          }}>
                            {city.name}
                          </Box>
                        )}
                        renderGroup={(params) => (
                          <li key={params.key}>
                            <ListSubheader
                              sx={{ 
                                bgcolor: '#f5f5f5',
                                fontWeight: 'bold',
                                color: EMPLOYER_THEME.primary
                              }}
                            >
                              {params.group}
                            </ListSubheader>
                            {params.children}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            inputRef={ref}
                            placeholder="جستجو و انتخاب شهر"
                            error={Boolean(formErrors.city_id)}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: EMPLOYER_THEME.primary,
                                  borderWidth: 2
                                }
                              }
                            }}
                          />
                        )}
                      />
                      {formErrors.city_id && (
                        <FormHelperText>{formErrors.city_id.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Box>

            {/* لوگو - سمت چپ */}
            <Box sx={{ width: { xs: '100%', sm: '250px', md: 250 }, maxWidth: { xs: '250px', sm: '100%' }, mx: { xs: 'auto', md: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ImageIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium">
                  لوگوی شرکت
                </Typography>
              </Box>
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: formErrors.logo ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '1/1',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: EMPLOYER_THEME.primary,
                    bgcolor: 'rgba(0,0,0,0.01)'
                  }
                }}
                onClick={() => document.getElementById('logo-input')?.click()}
              >
                <input
                  type="file"
                  id="logo-input"
                  style={{ display: 'none' }}
                  {...register('logo')}
                  accept="image/*"
                />
                
                {logoPreview ? (
                  <ImagePreview
                    src={logoPreview}
                    alt="پیش‌نمایش لوگو"
                    onDelete={handleDeleteLogo}
                    objectFit="contain"
                    aspectRatio="1/1"
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: EMPLOYER_THEME.primary, mb: 1 }} />
                    <Typography>برای آپلود لوگو کلیک کنید</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      فرمت‌های مجاز: JPG، PNG - حداکثر حجم: ۲ مگابایت
                    </Typography>
                  </Box>
                )}
              </Box>
              {formErrors.logo && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  {formErrors.logo.message}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* فیلدهای اختیاری - براساس مدل بک‌اند */}
        <Accordion 
          expanded={expandedOptional}
          onChange={() => setExpandedOptional(!expandedOptional)}
          sx={{ 
            mb: 4, 
            border: '1px solid #f0f0f0',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: 'background.paper',
              borderBottom: expandedOptional ? '1px solid #f0f0f0' : 'none'
            }}
          >
            <Typography 
              variant="h6" 
              component="h2" 
              fontWeight="bold" 
              sx={{ color: EMPLOYER_THEME.primary }}
            >
              اطلاعات تکمیلی (اختیاری)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              تکمیل این اطلاعات اختیاری است، اما به کارجویان کمک می‌کند تا شناخت بهتری از شرکت شما داشته باشند.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: { xs: 0, md: -1 }, mt: 1 }}>
              {/* اطلاعات تماس */}
              <Box sx={{ px: { xs: 0, md: 1.5 }, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  اطلاعات تماس
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  این بخش‌ها برای تسهیل ارتباط با شرکت شما استفاده می‌شوند.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: { xs: 0, md: -1 }, mb: 2 }}>
                  {/* ایمیل */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        ایمیل شرکت
                      </Typography>
                      <Controller
                        name="email"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'ایمیل نامعتبر است'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نمونه: example@domain.com"
                            error={Boolean(formErrors.email)}
                            helperText={formErrors.email?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* شماره تماس */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        شماره تماس
                      </Typography>
                      <Controller
                        name="phone_number"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^(\+98|0)?[0-9]{10,11}$/,
                            message: 'شماره تماس نامعتبر است'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نمونه: ۰۲۱۱۲۳۴۵۶۷۸"
                            error={Boolean(formErrors.phone_number)}
                            helperText={formErrors.phone_number?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* وب سایت */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        وب‌سایت
                      </Typography>
                      <Controller
                        name="website"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}$/,
                            message: 'آدرس وب‌سایت نامعتبر است'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نمونه: www.example.com"
                            error={Boolean(formErrors.website)}
                            helperText={formErrors.website?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* کد پستی */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        کد پستی
                      </Typography>
                      <Controller
                        name="postal_code"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'کد پستی باید 10 رقم باشد'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="کد پستی 10 رقمی"
                            error={Boolean(formErrors.postal_code)}
                            helperText={formErrors.postal_code?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* اطلاعات شرکت */}
              <Box sx={{ px: { xs: 0, md: 1.5 }, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  اطلاعات شرکت
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  این بخش‌ها برای معرفی بهتر شرکت شما به کارجویان استفاده می‌شوند.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: { xs: 0, md: -1 }, mb: 2 }}>
                  {/* صنعت - اختیاری */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        صنعت
                      </Typography>
                      <Controller
                        name="industry"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            error={Boolean(formErrors.industry)}
                            helperText={formErrors.industry?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                            SelectProps={{
                              MenuProps: {
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: 'right'
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right'
                                }
                              }
                            }}
                          >
                            <MenuItem value={0}>انتخاب صنعت</MenuItem>
                            {industries.map(industry => (
                              <MenuItem key={industry.id} value={industry.id}>
                                {industry.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Box>
                  </Box>

                  {/* تعداد کارمندان */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        تعداد کارمندان
                      </Typography>
                      <Controller
                        name="number_of_employees"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^[0-9]*$/,
                            message: 'لطفا فقط عدد وارد کنید'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نمونه: 12"
                            error={Boolean(formErrors.number_of_employees)}
                            helperText={formErrors.number_of_employees?.message}
                            variant="outlined"
                            type="number"
                            inputProps={{ min: 1 }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* تاریخ تاسیس */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        تاریخ تاسیس
                      </Typography>
                      <Controller
                        name="founded_date"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="date"
                            error={Boolean(formErrors.founded_date)}
                            helperText={formErrors.founded_date?.message}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* آدرس */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: '100%' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        آدرس
                      </Typography>
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نشانی دقیق شرکت"
                            error={Boolean(formErrors.address)}
                            helperText={formErrors.address?.message}
                            variant="outlined"
                            multiline
                            rows={3}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* توضیحات */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: '100%' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        توضیحات شرکت
                      </Typography>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="توضیحاتی درباره شرکت، فعالیت‌ها و خدمات آن"
                            error={Boolean(formErrors.description)}
                            helperText={formErrors.description?.message}
                            variant="outlined"
                            multiline
                            rows={5}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* شبکه‌های اجتماعی */}
              <Box sx={{ px: { xs: 0, md: 1.5 }, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  شبکه‌های اجتماعی
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  این بخش‌ها برای نمایش حضور شرکت شما در شبکه‌های اجتماعی استفاده می‌شوند.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: { xs: 0, md: -1 }, mb: 2 }}>
                  {/* لینکدین */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        لینکدین
                      </Typography>
                      <Controller
                        name="linkedin"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نشانی لینکدین"
                            error={Boolean(formErrors.linkedin)}
                            helperText={formErrors.linkedin?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* توییتر */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        توییتر
                      </Typography>
                      <Controller
                        name="twitter"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نشانی توییتر"
                            error={Boolean(formErrors.twitter)}
                            helperText={formErrors.twitter?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* اینستاگرام */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        اینستاگرام
                      </Typography>
                      <Controller
                        name="instagram"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="نشانی اینستاگرام"
                            error={Boolean(formErrors.instagram)}
                            helperText={formErrors.instagram?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* تصاویر و رسانه */}
              <Box sx={{ px: { xs: 0, md: 1.5 }, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  تصاویر و رسانه
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  این بخش‌ها برای نمایش بهتر هویت بصری شرکت شما استفاده می‌شوند.
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  gap: { xs: 2, md: 3 }
                }}>
                  {/* بنر */}
                  <Box sx={{ 
                    flex: 1,
                    width: { xs: '100%', md: 'auto' }
                  }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      بنر شرکت
                    </Typography>
                    <Box
                      sx={{
                        border: '1px dashed',
                        borderColor: formErrors.banner ? 'error.main' : 'divider',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        aspectRatio: '16/9',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: EMPLOYER_THEME.primary,
                          bgcolor: 'rgba(0,0,0,0.01)'
                        }
                      }}
                      onClick={() => document.getElementById('banner-input')?.click()}
                    >
                      <input
                        type="file"
                        id="banner-input"
                        style={{ display: 'none' }}
                        {...register('banner')}
                        accept="image/*"
                      />
                      
                      {bannerPreview ? (
                        <ImagePreview
                          src={bannerPreview}
                          alt="پیش‌نمایش بنر"
                          onDelete={handleDeleteBanner}
                          objectFit="cover"
                          aspectRatio="16/9"
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: EMPLOYER_THEME.primary, mb: 1 }} />
                          <Typography>برای آپلود بنر کلیک کنید</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            فرمت‌های مجاز: JPG، PNG - حداکثر حجم: ۵ مگابایت
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    {formErrors.banner && (
                      <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                        {formErrors.banner.message}
                      </Typography>
                    )}
                  </Box>

                  {/* ویدیوی معرفی */}
                  <Box sx={{ 
                    flex: 1,
                    width: { xs: '100%', md: 'auto' }
                  }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      ویدیوی معرفی
                    </Typography>
                    <Box
                      sx={{
                        border: '1px dashed',
                        borderColor: formErrors.intro_video ? 'error.main' : 'divider',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        aspectRatio: '16/9',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: EMPLOYER_THEME.primary,
                          bgcolor: 'rgba(0,0,0,0.01)'
                        }
                      }}
                      onClick={() => document.getElementById('video-input')?.click()}
                    >
                      <input
                        type="file"
                        id="video-input"
                        style={{ display: 'none' }}
                        {...register('intro_video')}
                        accept="video/*"
                      />
                      {videoPreview ? (
                        <VideoPreview
                          src={videoPreview}
                          onDelete={handleDeleteVideo}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <CloudUploadIcon sx={{ fontSize: 40, color: EMPLOYER_THEME.primary, mb: 1 }} />
                          <Typography>برای آپلود ویدیوی معرفی کلیک کنید</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            فرمت‌های مجاز: MP4، WebM - حداکثر حجم: ۵۰ مگابایت
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    {formErrors.intro_video && (
                      <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                        {formErrors.intro_video.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ 
          textAlign: { xs: 'center', sm: 'right' }, 
          mt: { xs: 3, md: 4 }
        }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: EMPLOYER_THEME.primary,
              px: { xs: 4, md: 6 },
              py: { xs: 1, md: 1.5 },
              borderRadius: 2,
              '&:hover': { bgcolor: EMPLOYER_THEME.dark },
              fontSize: { xs: '0.875rem', md: '1rem' },
              fontWeight: 'medium',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ ml: 1 }} />
                در حال ثبت...
              </>
            ) : 'ثبت شرکت'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
} 