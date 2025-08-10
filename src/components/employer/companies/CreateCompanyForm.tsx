'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiDelete } from '@/lib/axios';
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
  Tooltip,
  InputAdornment,
  Select,
  FormControl,
  FormHelperText,
  OutlinedInput,
  SelectChangeEvent,
  MenuProps,
  useTheme
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VideocamIcon from '@mui/icons-material/Videocam';
import { EMPLOYER_THEME } from '@/constants/colors';
import JalaliDatePicker from '@/components/common/JalaliDatePicker';
import ImageCropper from '@/components/common/ImageCropper';
import { GroupedAutocomplete } from '@/components/common';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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
 * تایپ گروه کاری برای TypeScript (دسته‌بندی اصلی)
 */
type Industry = {
  id: number;
  name: string;
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
    province?: {
      id: number;
      name: string;
    };
  };
  logo?: string;
  banner?: string;
  intro_video?: string;
  postal_code?: string;
  founded_date?: string;
  industry?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
  };
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
  province_id: number;
  city_id: number;
  phone_number: string;
  address: string;
  website: string;
  email: string;
  postal_code: string;
  industry: number;
  founded_date: string;
  number_of_employees: string;
  description: string;
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
  const theme = useTheme();
  const employerColors = EMPLOYER_THEME;
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  // عکس‌های جدید انتخاب‌شده (قبل از ارسال به سرور)
  const [companyPhotos, setCompanyPhotos] = useState<{ file: File; preview: string; id: string }[]>([]);
  // عکس‌های موجود روی سرور (در حالت ویرایش)
  const [existingPhotos, setExistingPhotos] = useState<{ id: number; image: string }[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoCropper, setShowLogoCropper] = useState(false);
  const [showBannerCropper, setShowBannerCropper] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
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
      province_id: 0,
      city_id: 0,
      phone_number: '',
      address: '',
      website: '',
      email: '',
      postal_code: '',
      industry: 0,
      founded_date: '',
      number_of_employees: '',
      description: '',
      linkedin: '',
      twitter: '',
      instagram: ''
    },
    mode: 'onBlur'
  });

  // نظارت بر تغییرات فایل‌ها برای نمایش پیش‌نمایش
  const logoFiles = watch('logo');
  const bannerFiles = watch('banner');

  // تابع پردازش فایل لوگو
  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogoFile(file);
      setShowLogoCropper(true);
    }
  };

  // تابع پردازش فایل بنر
  const handleBannerFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedBannerFile(file);
      setShowBannerCropper(true);
    }
  };

  // تابع تکمیل کراپ لوگو
  const handleLogoCropComplete = (croppedImage: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedImage);
    const fileList = dataTransfer.files;
    
    setValue('logo', fileList);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedImage);
    
    setShowLogoCropper(false);
    setSelectedLogoFile(null);
  };

  // تابع تکمیل کراپ بنر
  const handleBannerCropComplete = (croppedImage: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedImage);
    const fileList = dataTransfer.files;
    
    setValue('banner', fileList);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedImage);
    
    setShowBannerCropper(false);
    setSelectedBannerFile(null);
  };

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

  // لود داده‌های مورد نیاز (گروه‌های کاری و شهرها)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/industries/industry-categories/'),
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
        province_id: initialData.location?.province?.id || 0,
        city_id: initialData.location?.id || 0,
        phone_number: initialData.phone_number || '',
        address: initialData.address || '',
        website: initialData.website || '',
        email: initialData.email || '',
        postal_code: initialData.postal_code || '',
        industry: initialData.industry?.id || 0,
        founded_date: initialData.founded_date || '',
        number_of_employees: initialData.number_of_employees ? String(initialData.number_of_employees) : '',
        description: initialData.description || '',
        linkedin: initialData.linkedin || '',
        twitter: initialData.twitter || '',
        instagram: initialData.instagram || '',
      });



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

      // دریافت عکس‌های موجود شرکت از سرور
      if (initialData.id) {
        apiGet(`/companies/${initialData.id}/photos/`)
          .then((res) => {
            const photos = Array.isArray(res.data) ? res.data : [];
            const mapped = photos.map((p: any) => ({
              id: p.id,
              image: getFullUrl(p.image) || p.image
            }));
            setExistingPhotos(mapped);
          })
          .catch(() => {
            // نادیده بگیر
          });
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
          

        }
      }, 100);
    }
  }, [formErrors, errors]);

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
      'industry': 'گروه کاری',
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
      // این بخش دیگر نیازی به باز کردن آکاردئون ندارد
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

    if (!data.province_id || data.province_id === 0) {
      setErrors(['لطفاً استان محل فعالیت شرکت را انتخاب کنید']);
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

    if (!data.phone_number || !data.phone_number.trim()) {
      setErrors(['لطفاً شماره تلفن شرکت را وارد کنید']);
      // اسکرول به بالای فرم
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      setLoading(false);
      return;
    }

    if (!data.address || !data.address.trim()) {
      setErrors(['لطفاً آدرس شرکت را وارد کنید']);
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

    // بخش عکس‌های شرکت حذف شد (عدم پشتیبانی در بک‌اند)

    // اعتبارسنجی فیلدهای اختیاری در صورت پر شدن
    const validationErrors: string[] = [];
    
    if (data.email && !isValidEmail(data.email)) {
      validationErrors.push('فرمت ایمیل وارد شده صحیح نیست');
    }

    if (data.website && !isValidUrl(data.website)) {
      validationErrors.push('آدرس وبسایت وارد شده معتبر نیست');
    }

    if (data.postal_code && !/^[0-9]{10}$/.test(data.postal_code)) {
      validationErrors.push('کد پستی باید 10 رقم باشد');
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
          

        }
      }, 100);
      
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // اضافه کردن فیلدهای اجباری
      formDataToSend.append('name', data.name);
      formDataToSend.append('city_id', String(data.city_id));
      formDataToSend.append('phone_number', data.phone_number);
      formDataToSend.append('address', data.address);
      
      // اضافه کردن فیلدهای اختیاری
      // توجه: website در بخش URL با افزودن پروتکل اضافه می‌شود؛ از این آرایه حذف شد تا دوباره ارسال نشود
      const optionalTextFields = ['email', 'postal_code', 'founded_date', 'number_of_employees', 'description'];
                                 
      optionalTextFields.forEach(field => {
        if (data[field as keyof CompanyFormInputs] && String(data[field as keyof CompanyFormInputs]).trim() !== '') {
          formDataToSend.append(field, String(data[field as keyof CompanyFormInputs]));
        }
      });
      
      // گروه کاری - اختیاری
      if (data.industry && data.industry !== 0) {
        formDataToSend.append('industry_id', String(data.industry));
      }
      
      // اضافه کردن عکس‌های شرکت (حداکثر ۵ تا)
      if (companyPhotos.length > 0) {
        companyPhotos.forEach((p) => {
          formDataToSend.append('company_photos', p.file);
        });
      }
      
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
              if (!['name', 'province_id', 'city_id', 'phone_number', 'address', 'logo'].includes(field)) {
                // این بخش دیگر نیازی به باز کردن آکاردئون ندارد
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
        boxShadow: `0 0 0 2px ${employerColors.primary}20`
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
      color: employerColors.primary
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

  // افزودن عکس جدید به لیست موقت
  const handleAddCompanyPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const totalCount = existingPhotos.length + companyPhotos.length;
      if (totalCount >= 5) {
        alert('حداکثر ۵ عکس می‌توانید داشته باشید');
        event.target.value = '';
        return;
      }
      const validation = validateFile(file, 'image', 5);
      if (!validation.valid) {
        alert(`خطا در عکس: ${validation.error}`);
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          file,
          preview: e.target?.result as string,
          id: Math.random().toString(36).slice(2)
        };
        setCompanyPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    }
    // پاک کردن input برای امکان انتخاب مجدد همان فایل
    event.target.value = '';
  };

  // حذف عکس جدید (موقت)
  const handleDeleteNewCompanyPhoto = (photoId: string) => {
    setCompanyPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // حذف عکس موجود روی سرور (فقط در حالت ویرایش)
  const handleDeleteExistingCompanyPhoto = async (photoId: number) => {
    if (!isEditMode || !initialData?.id) return;
    try {
      await apiDelete(`/companies/${initialData.id}/photos/${photoId}/`);
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (e) {
      alert('خطا در حذف عکس. لطفاً دوباره تلاش کنید.');
    }
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
          mb: { xs: 2, md: 4 }, 
          display: 'flex', 
          flexDirection: 'column',
          gap: { xs: 1, md: 2 }
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
            فیلدهای علامت‌دار (*) اجباری هستند. تکمیل سایر اطلاعات به معرفی بهتر شرکت کمک می‌کند.
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
        {/* نام شرکت و شماره تلفن */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* نام شرکت */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <BusinessIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
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
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: EMPLOYER_THEME.primary
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* شماره تلفن */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <PhoneIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                شماره تلفن <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
            </Box>
            <Controller
              name="phone_number"
              control={control}
              rules={{ 
                required: 'شماره تلفن الزامی است',
                pattern: {
                  value: /^(\+98|0)?[0-9]{10,11}$/,
                  message: 'شماره تماس نامعتبر است'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={convertToPersianNumbers(field.value)}
                  onChange={(e) => {
                    // تبدیل اعداد فارسی به انگلیسی برای ذخیره
                    const englishValue = e.target.value.replace(/[۰-۹]/g, (d) => {
                      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                      return persianNumbers.indexOf(d).toString();
                    });
                    field.onChange(englishValue);
                  }}
                  fullWidth
                  placeholder="نمونه: ۰۲۱۱۲۳۴۵۶۷۸"
                  error={Boolean(formErrors.phone_number)}
                  helperText={formErrors.phone_number?.message}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: EMPLOYER_THEME.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* استان و شهر */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* استان */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                استان <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
            </Box>
            <Controller
              name="province_id"
              control={control}
              rules={{ required: 'انتخاب استان الزامی است' }}
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
                        <LocationOnIcon fontSize="small" sx={{ color: employerColors.primary }} />
                      </InputAdornment>
                    }
                    IconComponent={(props: any) => (
                      <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
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
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                شهر <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
            </Box>
            <Controller
              name="city_id"
              control={control}
              rules={{ required: 'انتخاب شهر الزامی است' }}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(formErrors.city_id)}>
                  <Select
                    {...field}
                    displayEmpty
                    disabled={!watch('province_id') || watch('province_id') === 0}
                    input={<OutlinedInput sx={selectStyles} />}
                    renderValue={() => {
                      const selectedCity = cities.find(c => c.id === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          {selectedCity ? selectedCity.name : 'انتخاب شهر'}
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
                    <MenuItem value={0} disabled>انتخاب شهر</MenuItem>
                    {cities
                      .filter(city => city.province?.id === watch('province_id'))
                      .map((city) => (
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

        {/* وب‌سایت و ایمیل */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* وب‌سایت */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <LanguageIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
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
                  placeholder="example.com یا www.example.com"
                  error={Boolean(formErrors.website)}
                  helperText={formErrors.website?.message}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: EMPLOYER_THEME.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* ایمیل */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <EmailIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                ایمیل
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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: EMPLOYER_THEME.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* آدرس */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1,
            minHeight: { xs: '24px', sm: '28px' }
          }}>
            <HomeIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              mb: { xs: 0.5, sm: 1 }
            }}>
              آدرس <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
          </Box>
          <Controller
            name="address"
            control={control}
            rules={{ required: 'آدرس الزامی است' }}
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
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '6px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.8rem', sm: '1rem' },
                    padding: { xs: '8px 14px', sm: '16.5px 14px' }
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: { xs: '0.75rem', sm: '0.75rem' }
                  }
                }}
              />
            )}
          />
        </Box>

        {/* کد پستی و گروه کاری */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* کد پستی */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <MarkunreadMailboxIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
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
                  value={convertToPersianNumbers(field.value)}
                  fullWidth
                  placeholder="کد پستی ۱۰ رقمی"
                  error={Boolean(formErrors.postal_code)}
                  helperText={formErrors.postal_code?.message}
                  variant="outlined"
                  inputProps={{
                    maxLength: 10,
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                  onChange={(e) => {
                    // تبدیل اعداد فارسی به انگلیسی برای پردازش
                    let value = e.target.value.replace(/[۰-۹]/g, (d) => {
                      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                      return persianNumbers.indexOf(d).toString();
                    });
                    // فقط اعداد را قبول کن
                    value = value.replace(/[^0-9]/g, '');
                    // محدود کردن به 10 کاراکتر
                    field.onChange(value.slice(0, 10));
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: EMPLOYER_THEME.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* گروه کاری */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                گروه کاری
              </Typography>
            </Box>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(formErrors.industry)}>
                  <Select
                    {...field}
                    displayEmpty
                    input={<OutlinedInput sx={selectStyles} />}
                    renderValue={() => {
                      const selectedIndustry = industries.find(i => i.id === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          {selectedIndustry ? selectedIndustry.name : 'انتخاب گروه کاری'}
                        </Box>
                      );
                    }}
                    MenuProps={menuPropsRTL}
                    startAdornment={
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <CategoryIcon fontSize="small" sx={{ color: employerColors.primary }} />
                      </InputAdornment>
                    }
                    IconComponent={(props: any) => (
                      <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                    )}
                  >
                    <MenuItem value={0} disabled>انتخاب گروه کاری</MenuItem>
                    {industries.map((industry) => (
                        <MenuItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {formErrors.industry && (
                    <FormHelperText>{formErrors.industry.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* تاریخ تاسیس و تعداد کارمندان */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* تاریخ تاسیس */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <CalendarTodayIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                تاریخ تاسیس
              </Typography>
            </Box>
            <Controller
              name="founded_date"
              control={control}
              render={({ field }) => (
                <Box sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.8rem', sm: '1rem' },
                    padding: { xs: '8px 14px', sm: '16.5px 14px' }
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: { xs: '0.75rem', sm: '0.75rem' }
                  }
                }}>
                  <JalaliDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    fullWidth
                    error={Boolean(formErrors.founded_date)}
                    helperText={formErrors.founded_date?.message}
                  />
                </Box>
              )}
            />
          </Box>

          {/* تعداد کارمندان */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <GroupsIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
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
                  value={convertToPersianNumbers(field.value)}
                  onChange={(e) => {
                    // تبدیل اعداد فارسی به انگلیسی برای ذخیره
                    const englishValue = e.target.value.replace(/[۰-۹]/g, (d) => {
                      const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                      return persianNumbers.indexOf(d).toString();
                    });
                    field.onChange(englishValue);
                  }}
                  fullWidth
                  placeholder="نمونه: ۱۲"
                  error={Boolean(formErrors.number_of_employees)}
                  helperText={formErrors.number_of_employees?.message}
                  variant="outlined"
                  inputProps={{ min: 1 }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '6px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: EMPLOYER_THEME.primary
                      }
                    },
                    '& .MuiInputBase-input': { 
                      textAlign: 'left', 
                      direction: 'ltr',
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                      padding: { xs: '8px 14px', sm: '16.5px 14px' }
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* توضیحات شرکت */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1,
            minHeight: { xs: '24px', sm: '28px' }
          }}>
            <DescriptionIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              mb: { xs: 0.5, sm: 1 }
            }}>
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
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '6px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.8rem', sm: '1rem' },
                    padding: { xs: '8px 14px', sm: '16.5px 14px' }
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: { xs: '0.75rem', sm: '0.75rem' }
                  }
                }}
              />
            )}
          />
        </Box>

        {/* شبکه‌های اجتماعی */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: { xs: 2, md: 3 }, color: EMPLOYER_THEME.primary }}>
            شبکه‌های اجتماعی
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 } }}>
            {/* لینکدین */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1,
                minHeight: { xs: '24px', sm: '28px' }
              }}>
                <LinkedInIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  mb: { xs: 0.5, sm: 1 }
                }}>
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
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '6px',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: EMPLOYER_THEME.primary
                        }
                      },
                      '& .MuiInputBase-input': { 
                        textAlign: 'left', 
                        direction: 'ltr',
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                        padding: { xs: '8px 14px', sm: '16.5px 14px' }
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: { xs: '0.75rem', sm: '0.75rem' }
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* توییتر */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1,
                minHeight: { xs: '24px', sm: '28px' }
              }}>
                <TwitterIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  mb: { xs: 0.5, sm: 1 }
                }}>
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
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '6px',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: EMPLOYER_THEME.primary
                        }
                      },
                      '& .MuiInputBase-input': { 
                        textAlign: 'left', 
                        direction: 'ltr',
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                        padding: { xs: '8px 14px', sm: '16.5px 14px' }
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: { xs: '0.75rem', sm: '0.75rem' }
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* اینستاگرام */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1,
                minHeight: { xs: '24px', sm: '28px' }
              }}>
                <InstagramIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  mb: { xs: 0.5, sm: 1 }
                }}>
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
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '6px',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: EMPLOYER_THEME.primary
                        }
                      },
                      '& .MuiInputBase-input': { 
                        textAlign: 'left', 
                        direction: 'ltr',
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                        padding: { xs: '8px 14px', sm: '16.5px 14px' }
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: { xs: '0.75rem', sm: '0.75rem' }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* رسانه‌های شرکت */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: { xs: 2, md: 3 }, color: EMPLOYER_THEME.primary }}>
            رسانه‌های شرکت
          </Typography>
          
          {/* لوگو و بنر */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
            {/* لوگو */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1,
                minHeight: { xs: '24px', sm: '28px' }
              }}>
                <AccountCircleIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  mb: { xs: 0.5, sm: 1 }
                }}>
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
                  maxWidth: '250px',
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
                  onChange={handleLogoFileSelect}
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
                    <Typography variant="body2">برای آپلود لوگو کلیک کنید</Typography>
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

            {/* بنر */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1,
                minHeight: { xs: '24px', sm: '28px' }
              }}>
                <WallpaperIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  mb: { xs: 0.5, sm: 1 }
                }}>
                  بنر شرکت
                </Typography>
              </Box>
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
                  maxWidth: '400px',
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
                  onChange={handleBannerFileSelect}
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
                    <Typography variant="body2">برای آپلود بنر کلیک کنید</Typography>
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
          </Box>

          {/* عکس‌های شرکت */}
          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <PhotoLibraryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                عکس‌های شرکت
              </Typography>
            </Box>
            <Box
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                minHeight: '120px',
              }}
              onClick={() => document.getElementById('company-photos-input')?.click()}
            >
              <input
                type="file"
                id="company-photos-input"
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={handleAddCompanyPhoto}
              />
              <Box sx={{ textAlign: 'center' }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: EMPLOYER_THEME.primary, mb: 1 }} />
                <Typography variant="body2">برای آپلود عکس‌های شرکت کلیک کنید</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  فرمت‌های مجاز: JPG، PNG - حداکثر حجم: ۵ مگابایت - حداکثر ۵ عکس
                </Typography>
              </Box>
            </Box>

            {/* گالری عکس‌ها: ابتدا موجود روی سرور، سپس جدیدها */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
              {existingPhotos.map((p) => (
                <ImagePreview
                  key={`exist-${p.id}`}
                  src={p.image}
                  alt={`عکس شرکت ${p.id}`}
                  onDelete={() => handleDeleteExistingCompanyPhoto(p.id)}
                  objectFit="cover"
                  aspectRatio="1/1"
                />
              ))}
              {companyPhotos.map((p) => (
                <ImagePreview
                  key={`new-${p.id}`}
                  src={p.preview}
                  alt="پیش‌نمایش عکس شرکت"
                  onDelete={() => handleDeleteNewCompanyPhoto(p.id)}
                  objectFit="cover"
                  aspectRatio="1/1"
                />
              ))}
            </Box>
          </Box>

          {/* ویدیوی معرفی */}
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              minHeight: { xs: '24px', sm: '28px' }
            }}>
              <VideocamIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                mb: { xs: 0.5, sm: 1 }
              }}>
                ویدیوی معرفی
              </Typography>
            </Box>
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
                maxWidth: '400px',
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
                  <Typography variant="body2">برای آپلود ویدیوی معرفی کلیک کنید</Typography>
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

      {/* ImageCropper برای لوگو */}
      <ImageCropper
        open={showLogoCropper}
        onClose={() => setShowLogoCropper(false)}
        imageFile={selectedLogoFile}
        onCropComplete={handleLogoCropComplete}
        aspectRatio={1}
        title="ویرایش لوگوی شرکت"
      />

      {/* ImageCropper برای بنر */}
      <ImageCropper
        open={showBannerCropper}
        onClose={() => setShowBannerCropper(false)}
        imageFile={selectedBannerFile}
        onCropComplete={handleBannerCropComplete}
        aspectRatio={16/9}
        title="ویرایش بنر شرکت"
      />
    </Paper>
  );
} 

