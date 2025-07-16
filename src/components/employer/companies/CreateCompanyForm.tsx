'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import MarkunreadMailboxIcon from '@mui/icons-material/MarkunreadMailbox';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import GroupsIcon from '@mui/icons-material/Groups';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { EMPLOYER_THEME } from '@/constants/colors';
import JalaliDatePicker from '@/components/common/JalaliDatePicker';

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
 * تعریف ساختار داده شرکت
 */
export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  location?: {
    id: number;
    name: string;
  };
  logo?: string;
  banner?: string;
  intro_video?: string;
  postal_code?: string;
  founded_date?: string;
  industry?: number;
  number_of_employees?: number;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Props برای کامپوننت CreateCompanyForm
 */
interface CreateCompanyFormProps {
  initialData?: Company | null;
  isEditMode?: boolean;
  onSubmit?: (data: any, formData: FormData) => Promise<{ 
    success: boolean; 
    message: string; 
    redirectUrl: string;
  }>;
  pageTitle?: string;
  pageIcon?: React.ReactElement;
  submitButtonText?: string;
  successMessage?: string;
}

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
  // کنترل کننده خطای بارگذاری تصویر
  const [error, setError] = useState<boolean>(false);

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
          overflow: 'hidden',
          bgcolor: error ? 'rgba(0,0,0,0.05)' : 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {error ? (
          <Typography variant="body2" color="error" align="center">
            خطا در بارگذاری تصویر<br />
            فرمت یا آدرس تصویر نامعتبر است
          </Typography>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            style={{ objectFit }}
            onError={() => setError(true)}
          />
        )}
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
  // کنترل کننده خطای بارگذاری ویدیو
  const [error, setError] = useState<boolean>(false);

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
          overflow: 'hidden',
          bgcolor: error ? 'rgba(0,0,0,0.05)' : 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {error ? (
          <Typography variant="body2" color="error" align="center">
            خطا در بارگذاری ویدیو<br />
            فرمت یا آدرس ویدیو نامعتبر است
          </Typography>
        ) : (
          <video
            src={src}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            controls
            onError={() => setError(true)}
          />
        )}
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
export default function CreateCompanyForm({
  initialData = null,
  isEditMode = false,
  onSubmit: customSubmit,
  pageTitle = "ثبت شرکت جدید",
  pageIcon = <DomainAddIcon />,
  submitButtonText = "ثبت شرکت",
  successMessage = "شرکت با موفقیت ثبت شد. در حال انتقال به صفحه شرکت‌ها..."
}: CreateCompanyFormProps) {
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
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors: formErrors },
    watch,
    setValue,
    reset
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
    // اگر ورودی خالی باشد، معتبر در نظر گرفته می‌شود (چون اختیاری است)
    if (!url || url.trim() === '') return true;
    
    // حذف فاصله‌های اضافی
    let trimmedUrl = url.trim();
    
    // افزودن http:// به ابتدای URL اگر پروتکل نداشته باشد
    const urlWithProtocol = trimmedUrl.match(/^https?:\/\//) ? trimmedUrl : `https://${trimmedUrl}`;
    
    try {
      new URL(urlWithProtocol);
      return true;
    } catch (e) {
      // تلاش برای بررسی فرمت‌های ساده مانند example.com
      const simpleUrlRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (simpleUrlRegex.test(trimmedUrl)) {
        return true;
      }
      
      // تلاش برای بررسی آدرس‌های شبکه‌های اجتماعی
      const socialMediaRegex = /^(www\.)?(twitter|x|linkedin|instagram|facebook|telegram)\.(com|org)\/[a-zA-Z0-9._-]+\/?$/;
      if (socialMediaRegex.test(trimmedUrl)) {
        return true;
      }
      
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

  // تابع کمکی برای تبدیل مسیر نسبی به URL کامل
  const getFullUrl = (path: string | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  // اگر داده اولیه وجود داشته باشد، فرم را پر کن
  useEffect(() => {
    if (initialData && isEditMode) {
      // تنظیم داده‌های فرم
      reset({
        name: initialData.name || '',
        city_id: initialData.location?.id || 0,
        industry: initialData.industry || 0,
        description: initialData.description || '',
        website: initialData.website || '',
        email: initialData.email || '',
        phone_number: initialData.phone_number || '',
        address: initialData.address || '',
        postal_code: initialData.postal_code || '',
        founded_date: initialData.founded_date || '',
        number_of_employees: initialData.number_of_employees ? String(initialData.number_of_employees) : '',
        linkedin: initialData.linkedin || '',
        twitter: initialData.twitter || '',
        instagram: initialData.instagram || '',
      });

      // باز کردن آکاردئون اطلاعات اختیاری اگر داده‌های اختیاری وجود داشته باشد
      if (
        initialData.description || 
        initialData.website || 
        initialData.email || 
        initialData.phone_number || 
        initialData.address || 
        initialData.postal_code || 
        initialData.founded_date || 
        initialData.industry || 
        initialData.number_of_employees || 
        initialData.linkedin || 
        initialData.twitter || 
        initialData.instagram
      ) {
        setExpandedOptional(true);
      }

      // نمایش تصاویر و ویدیو اگر وجود داشته باشند
      if (initialData.logo) {
        setLogoPreview(getFullUrl(initialData.logo));
      }
      if (initialData.banner) {
        setBannerPreview(getFullUrl(initialData.banner));
      }
      if (initialData.intro_video) {
        setVideoPreview(getFullUrl(initialData.intro_video));
      }
    }
  }, [initialData, isEditMode, reset]);

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

  // اسکرول به اولین فیلد خطا بعد از ارسال فرم
  useEffect(() => {
    // اسکرول به اولین فیلد خطا بعد از ارسال فرم
    if (Object.keys(formErrors).length > 0 || errors.length > 0) {
      // اول به بالای فرم اسکرول کنیم تا خطاها را نمایش دهیم
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // تمرکز بر روی پیام خطا
          const errorAlert = document.querySelector('.MuiAlert-standardError');
          if (errorAlert) {
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // اگر فیلد خطا در بخش اختیاری است، آکاردئون را باز کنیم
          if (Object.keys(formErrors).length > 0) {
            const firstErrorField = Object.keys(formErrors)[0];
            if (!['name', 'city_id'].includes(firstErrorField) && !expandedOptional) {
              setExpandedOptional(true);
            }
          }
        }
      }, 100);
    }
  }, [formErrors, errors, expandedOptional]);

  // تابع جدید برای اسکرول به فیلد خطا
  const scrollToErrorField = (fieldName: string) => {
    console.log(`تلاش برای اسکرول به فیلد: ${fieldName}`);
    
    // نگاشت نام فیلدها به عناوین فارسی
    const fieldMappings: Record<string, string> = {
      'postal_code': 'کد پستی',
      'email': 'ایمیل شرکت',
      'phone_number': 'شماره تماس',
      'website': 'وب‌سایت',
      'linkedin': 'لینکدین',
      'twitter': 'توییتر',
      'instagram': 'اینستاگرام',
      'description': 'توضیحات شرکت',
      'address': 'آدرس',
      'industry': 'صنعت',
      'number_of_employees': 'تعداد کارمندان',
      'founded_date': 'تاریخ تاسیس'
    };
    
    // برای فیلدهای خاص که دسترسی مستقیم به المنت آنها داریم
    if (fieldName === 'name' && nameInputRef.current) {
      const inputElement = nameInputRef.current.parentElement?.parentElement;
      if (inputElement) {
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInputRef.current.focus();
      }
      return;
    }
    
    // برای فیلد شهر که ساختار پیچیده‌تری دارد
    else if (fieldName === 'city_id' && cityInputRef.current) {
      const autocompleteElement = cityInputRef.current.closest('.MuiFormControl-root');
      if (autocompleteElement) {
        autocompleteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cityInputRef.current.focus();
      }
      return;
    }
    
    // برای فیلدهای بخش اختیاری
    if (!['name', 'city_id', 'logo'].includes(fieldName)) {
      // اطمینان از باز بودن آکاردئون
      if (!expandedOptional) {
        // باز کردن آکاردئون
        setExpandedOptional(true);
        
        // صبر برای باز شدن آکاردئون و سپس جستجوی مجدد
        setTimeout(() => {
          findAndScrollToField(fieldName, fieldMappings);
        }, 800); // تاخیر بیشتر برای اطمینان از باز شدن کامل آکاردئون
        
        return;
      }
    }
    
    // اگر آکاردئون باز است یا فیلد در بخش اصلی است
    findAndScrollToField(fieldName, fieldMappings);
  };
  
  // تابع کمکی برای یافتن و اسکرول به فیلد
  const findAndScrollToField = (fieldName: string, fieldMappings: Record<string, string>) => {
    // روش 1: جستجو بر اساس عنوان فیلد
    if (fieldMappings[fieldName]) {
      const fieldTitle = fieldMappings[fieldName];
      const allTypographies = Array.from(document.querySelectorAll('.MuiTypography-root'));
      
      for (const typography of allTypographies) {
        if (typography.textContent?.includes(fieldTitle)) {
          const container = typography.closest('.MuiBox-root');
          if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
              const input = container.querySelector('input, select, textarea');
              if (input) {
                (input as HTMLElement).focus();
                console.log(`فیلد ${fieldName} با عنوان "${fieldTitle}" پیدا شد و اسکرول انجام شد`);
              }
            }, 100);
            
            return;
          }
        }
      }
    }
    
    // روش 2: جستجو بر اساس نام فیلد
    const input = document.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
    if (input) {
      const container = input.closest('.MuiBox-root') || input.closest('.MuiFormControl-root');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (input as HTMLElement).focus();
        console.log(`فیلد ${fieldName} با نام مستقیم پیدا شد و اسکرول انجام شد`);
        return;
      }
    }
    
    // روش 3: جستجو بر اساس id فیلد
    const inputById = document.getElementById(fieldName) || document.querySelector(`[id*="${fieldName}"]`);
    if (inputById) {
      const container = inputById.closest('.MuiBox-root') || inputById.closest('.MuiFormControl-root') || inputById;
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (inputById.tagName === 'INPUT' || inputById.tagName === 'SELECT' || inputById.tagName === 'TEXTAREA') {
          (inputById as HTMLElement).focus();
        }
        console.log(`فیلد ${fieldName} با id پیدا شد و اسکرول انجام شد`);
        return;
      }
    }
    
    // روش 4: جستجو در همه کنترل‌های فرم با محتوای لیبل
    const allFormControls = Array.from(document.querySelectorAll('.MuiFormControl-root'));
    for (const control of allFormControls) {
      const label = control.querySelector('label');
      if (label && fieldMappings[fieldName] && label.textContent?.includes(fieldMappings[fieldName])) {
        control.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = control.querySelector('input, select, textarea');
        if (input) {
          (input as HTMLElement).focus();
        }
        console.log(`فیلد ${fieldName} با لیبل پیدا شد و اسکرول انجام شد`);
        return;
      }
    }
    
    // اگر هیچ یک از روش‌ها موفق نبود، به بخش اختیاری اسکرول کنیم
    console.log(`فیلد ${fieldName} پیدا نشد، اسکرول به بخش اختیاری`);
    const optionalSection = document.querySelector('.MuiAccordionDetails-root');
    if (optionalSection) {
      optionalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const onSubmit: SubmitHandler<CompanyFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    // بررسی فیلدهای اجباری
    if (!data.name || !data.name.trim()) {
      setErrors(['لطفاً نام شرکت را وارد کنید']);
      // اسکرول به بالای فرم
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      setLoading(false);
      return;
    }

    if (!data.city_id || data.city_id === 0) {
      setErrors(['لطفاً شهر محل فعالیت شرکت را انتخاب کنید']);
      // اسکرول به بالای فرم
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      setLoading(false);
      return;
    }

    // اعتبارسنجی فایل‌ها
    if (data.logo && data.logo.length > 0) {
      const validation = validateFile(data.logo[0], 'image', 2); // حداکثر 2 مگابایت
      if (!validation.valid) {
        setErrors([`خطا در لوگو: ${validation.error}`]);
        // اسکرول به بالای فرم
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        setLoading(false);
        return;
      }
    }

    if (data.banner && data.banner.length > 0) {
      const validation = validateFile(data.banner[0], 'image', 5); // حداکثر 5 مگابایت
      if (!validation.valid) {
        setErrors([`خطا در بنر: ${validation.error}`]);
        // اسکرول به بالای فرم
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        setLoading(false);
        return;
      }
    }

    if (data.intro_video && data.intro_video.length > 0) {
      const validation = validateFile(data.intro_video[0], 'video', 50); // حداکثر 50 مگابایت
      if (!validation.valid) {
        setErrors([`خطا در ویدیو: ${validation.error}`]);
        // اسکرول به بالای فرم
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        setLoading(false);
        return;
      }
    }

    // اعتبارسنجی فیلدهای اختیاری در صورت پر شدن
    const validationErrors: string[] = [];
    
    if (data.email && !isValidEmail(data.email)) {
      validationErrors.push('فرمت ایمیل وارد شده صحیح نیست');
      // اگر بخش اختیاری بسته است، آن را باز کنید
      if (!expandedOptional) setExpandedOptional(true);
    }

    if (data.website && !isValidUrl(data.website)) {
      validationErrors.push('آدرس وبسایت وارد شده معتبر نیست');
      // اگر بخش اختیاری بسته است، آن را باز کنید
      if (!expandedOptional) setExpandedOptional(true);
    }

    if (data.phone_number && !isValidPhoneNumber(data.phone_number)) {
      validationErrors.push('فرمت شماره تلفن وارد شده صحیح نیست');
      // اگر بخش اختیاری بسته است، آن را باز کنید
      if (!expandedOptional) setExpandedOptional(true);
    }

    if (data.postal_code && !/^[0-9]{10}$/.test(data.postal_code)) {
      validationErrors.push('کد پستی باید 10 رقم باشد');
      // اگر بخش اختیاری بسته است، آن را باز کنید
      if (!expandedOptional) setExpandedOptional(true);
    }

    // بررسی فرمت آدرس‌های شبکه‌های اجتماعی
    const socialMediaFields = ['linkedin', 'twitter', 'instagram'];
    const socialMediaLabels = {
      'linkedin': 'لینکدین',
      'twitter': 'توییتر',
      'instagram': 'اینستاگرام'
    };
    
    for (const field of socialMediaFields) {
      const value = data[field as keyof CompanyFormInputs] as string;
      if (value && value.trim() !== '' && !isValidUrl(value)) {
        validationErrors.push(`آدرس ${socialMediaLabels[field as keyof typeof socialMediaLabels]} وارد شده معتبر نیست`);
        // اگر بخش اختیاری بسته است، آن را باز کنید
        if (!expandedOptional) setExpandedOptional(true);
      }
    }
    
    // اگر خطایی وجود دارد، آنها را نمایش دهید و به کاربر اطلاع دهید
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      
      // اسکرول به بالای فرم برای نمایش خطاها
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // تمرکز بر روی پیام خطا
          const errorAlert = document.querySelector('.MuiAlert-standardError');
          if (errorAlert) {
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // اگر فیلد خطا در بخش اختیاری است، آکاردئون را باز کنیم
          if (!expandedOptional) {
            setExpandedOptional(true);
          }
        }
      }, 100);
      
      setLoading(false);
      return;
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
      const optionalTextFields = ['description', 'email', 'phone_number', 'address', 
                                 'postal_code', 'founded_date', 'number_of_employees'];
                                 
      optionalTextFields.forEach(field => {
        if (data[field as keyof CompanyFormInputs] && String(data[field as keyof CompanyFormInputs]).trim() !== '') {
          formDataToSend.append(field, String(data[field as keyof CompanyFormInputs]));
        }
      });
      
      // اضافه کردن آدرس‌های وب با اطمینان از داشتن پروتکل https://
      const urlFields = ['website', 'linkedin', 'twitter', 'instagram'];
      
      urlFields.forEach(field => {
        const value = data[field as keyof CompanyFormInputs] as string;
        if (value && value.trim() !== '') {
          // حذف فاصله‌های اضافی
          let trimmedUrl = value.trim();
          
          // افزودن https:// به ابتدای URL اگر پروتکل نداشته باشد
          const urlWithProtocol = trimmedUrl.match(/^https?:\/\//) ? trimmedUrl : `https://${trimmedUrl}`;
          
          formDataToSend.append(field, urlWithProtocol);
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

      // اگر در حالت ویرایش هستیم و تابع onSubmit سفارشی ارسال شده، از آن استفاده کنیم
      if (isEditMode && customSubmit) {
        const result = await customSubmit(data, formDataToSend);
        if (result && result.success) {
          setSuccess(true);
          
          // اسکرول به بالای فرم بعد از ثبت موفقیت‌آمیز
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // تمرکز بر روی پیام موفقیت
              const successAlert = document.querySelector('.MuiAlert-standardSuccess');
              if (successAlert) {
                successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }, 100);
          
          // هدایت کاربر به صفحه مشخص شده پس از ثبت موفق
          if (result.redirectUrl) {
            setTimeout(() => {
              router.push(result.redirectUrl);
            }, 2000);
          }
        }
      } 
      // در غیر این صورت، از روش معمولی ثبت استفاده کنیم
      else {
        await apiPost('/companies/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setSuccess(true);
        
        // اسکرول به بالای فرم بعد از ثبت موفقیت‌آمیز
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // تمرکز بر روی پیام موفقیت
            const successAlert = document.querySelector('.MuiAlert-standardSuccess');
            if (successAlert) {
              successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
        
        // هدایت کاربر به صفحه لیست شرکت‌ها پس از ثبت موفق
        setTimeout(() => {
          router.push('/employer/companies');
        }, 2000);
      }
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
            'twitter': {
              'invalid': 'آدرس توییتر معتبر نیست. لطفاً یک آدرس معتبر وارد کنید.',
              'default': 'مشکلی در ثبت آدرس توییتر وجود دارد.'
            },
            'linkedin': {
              'invalid': 'آدرس لینکدین معتبر نیست. لطفاً یک آدرس معتبر وارد کنید.',
              'default': 'مشکلی در ثبت آدرس لینکدین وجود دارد.'
            },
            'instagram': {
              'invalid': 'آدرس اینستاگرام معتبر نیست. لطفاً یک آدرس معتبر وارد کنید.',
              'default': 'مشکلی در ثبت آدرس اینستاگرام وجود دارد.'
            },
            'default': {'message': 'خطا در ثبت اطلاعات شرکت. لطفا دوباره تلاش کنید.'}
          };
          
          // بررسی خطاها و نمایش پیام‌های مناسب
          for (const [field, errors] of Object.entries(err.response.data)) {
            if (Array.isArray(errors)) {
              const errorMsg = errors[0]?.toLowerCase() || '';
              
              // اگر خطا مربوط به فیلدهای اختیاری است، بخش اختیاری را باز کنید
              if (!['name', 'city_id', 'logo', 'non_field_errors'].includes(field) && !expandedOptional) {
                setExpandedOptional(true);
              }
              
              // ترجمه خطاهای انگلیسی به فارسی
              if (field === 'name' && (errorMsg.includes('unique') || errorMsg.includes('already exists'))) {
                newErrors.push(errorMessages.name.unique);
              } else if (field === 'city_id' && errorMsg.includes('does not exist')) {
                newErrors.push(errorMessages.city_id.does_not_exist);
              } else if (field === 'city_id' && (errorMsg.includes('required') || errorMsg.includes('null'))) {
                newErrors.push(errorMessages.city_id.required);
              } else if (field === 'twitter' && errorMsg.includes('enter a valid url')) {
                newErrors.push(errorMessages.twitter.invalid);
              } else if (field === 'linkedin' && errorMsg.includes('enter a valid url')) {
                newErrors.push(errorMessages.linkedin.invalid);
              } else if (field === 'instagram' && errorMsg.includes('enter a valid url')) {
                newErrors.push(errorMessages.instagram.invalid);
              } else if (field === 'website' && errorMsg.includes('enter a valid url')) {
                newErrors.push(errorMessages.website.invalid);
              } else if (field === 'email' && errorMsg.includes('enter a valid email')) {
                newErrors.push(errorMessages.email.invalid);
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
                errors.forEach((msg: string) => {
                  // ترجمه خطاهای انگلیسی رایج
                  if (typeof msg === 'string') {
                    if (msg.toLowerCase().includes('enter a valid url')) {
                      newErrors.push(`آدرس ${field} وارد شده معتبر نیست`);
                    } else if (msg.toLowerCase().includes('enter a valid email')) {
                      newErrors.push(`ایمیل وارد شده معتبر نیست`);
                    } else {
                      newErrors.push(`${fieldName}${msg}`);
                    }
                  } else {
                    newErrors.push(`${fieldName}${msg}`);
                  }
                });
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
      
      // اسکرول به بالای فرم در صورت خطاهای سرور
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // تمرکز بر روی اولین خطا
          const errorAlert = document.querySelector('.MuiAlert-standardError');
          if (errorAlert) {
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // اگر خطاهای مربوط به فیلدهای اختیاری وجود دارد، آکاردئون را باز کنیم
          const optionalFieldErrors = Object.keys(err.response?.data || {}).filter(
            field => !['name', 'city_id', 'logo', 'non_field_errors'].includes(field)
          );
          
          if (optionalFieldErrors.length > 0 && !expandedOptional) {
            setExpandedOptional(true);
          }
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
        {pageTitle && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {React.isValidElement(pageIcon) && 
              React.cloneElement(pageIcon, { 
                sx: { 
                  fontSize: { xs: 32, md: 42 }, 
                  color: EMPLOYER_THEME.primary,
                  transform: 'translateY(-2px)'
                } 
              } as any)
            }
            <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: EMPLOYER_THEME.primary
            }}>
              {pageTitle}
            </Typography>
          </Box>
        )}
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
            <AlertTitle>{isEditMode ? 'خطا در ویرایش شرکت' : 'خطا در ثبت شرکت'}</AlertTitle>
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
          {successMessage}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
            <Box sx={{ flex: 1, width: '100%' }}>
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
                      inputRef={nameInputRef}
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
                            inputRef={(element) => {
                              ref(element);
                              cityInputRef.current = element;
                            }}
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
            <Box sx={{ 
              width: { xs: '100%', sm: '250px', md: 250 }, 
              maxWidth: { xs: '100%', sm: '250px' }, 
              mx: { xs: 'auto', md: 0 },
              mt: { xs: 2, md: 0 }
            }}>
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
                  maxWidth: { xs: '100%', sm: '250px', md: '250px' },
                  mx: { xs: 'auto', md: 0 },
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          ایمیل شرکت
                        </Typography>
                      </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PhoneIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          شماره تماس
                        </Typography>
                      </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LanguageIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          وب‌سایت
                        </Typography>
                      </Box>
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
                            placeholder=" example.com یا www.example.com"
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MarkunreadMailboxIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          کد پستی
                        </Typography>
                      </Box>
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
                            inputProps={{
                              maxLength: 10,
                              pattern: '[0-9]*',
                              inputMode: 'numeric'
                            }}
                            onChange={(e) => {
                              // فقط اعداد را قبول کن
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              // محدود کردن به 10 کاراکتر
                              field.onChange(value.slice(0, 10));
                            }}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          صنعت
                        </Typography>
                      </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GroupsIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          تعداد کارمندان
                        </Typography>
                      </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarTodayIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          تاریخ تاسیس
                        </Typography>
                      </Box>
                      <Controller
                        name="founded_date"
                        control={control}
                        render={({ field }) => (
                          <JalaliDatePicker
                            value={field.value}
                            onChange={field.onChange}
                            fullWidth
                            error={Boolean(formErrors.founded_date)}
                            helperText={formErrors.founded_date?.message}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* آدرس */}
                  <Box sx={{ px: { xs: 0, md: 1 }, mb: 2, width: '100%' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <HomeIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          آدرس
                        </Typography>
                      </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DescriptionIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          توضیحات شرکت
                        </Typography>
                      </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LinkedInIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          لینکدین
                        </Typography>
                      </Box>
                      <Controller
                        name="linkedin"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="linkedin.com/company"
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TwitterIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          توییتر
                        </Typography>
                      </Box>
                      <Controller
                        name="twitter"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="x.com/company"
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <InstagramIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="medium">
                          اینستاگرام
                        </Typography>
                      </Box>
                      <Controller
                        name="instagram"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="instagram.com/company"
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
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  gap: { xs: 2, md: 3 }
                }}>
                  {/* بنر */}
                  <Box sx={{ 
                    flex: 1,
                    width: { xs: '100%', sm: 'auto' }
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
                    width: { xs: '100%', sm: 'auto' }
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
                {isEditMode ? 'در حال ذخیره...' : 'در حال ثبت...'}
              </>
            ) : submitButtonText}
          </Button>
        </Box>
      </form>
    </Paper>
  );
} 