'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut } from '@/lib/axios';
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
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DownloadIcon from '@mui/icons-material/Download';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import AdditionalResumeFields from './AdditionalResumeFields';

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
  province_id: number;
  city_id: number;
  industry_id: number;
  gender: string;
  website: string;
  linkedin_profile: string;
  soldier_status: string;
  degree: string;
  years_of_experience_numeric: number | '';// سال سابقه به صورت عددی (اجازه خالی)
  experience: string; // سابقه کاری انتخابی
  expected_salary: string;
  preferred_job_type: string;
  availability: string;
  cv?: FileList; // فایل رزومه
}

/**
 * کامپوننت فرم اطلاعات شخصی کارجو
 */
export default function PersonalInfoForm() {
  const router = useRouter();
  const theme = useTheme();
  const jobseekerColors = JOB_SEEKER_THEME;
  const [industryCategories, setIndustryCategories] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  const [existingCvUrl, setExistingCvUrl] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string>('');
  const cvInputRef = useRef<HTMLInputElement>(null);

  const getFileNameFromUrl = (url: string): string => {
    try {
      const withoutQuery = url.split('?')[0];
      const name = withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1);
      return decodeURIComponent(name || 'resume.pdf');
    } catch {
      return 'resume.pdf';
    }
  };
  
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
      website: '',
      linkedin_profile: '',
      soldier_status: '',
      degree: '',
      years_of_experience_numeric: 0,
      experience: '',
      expected_salary: '',
      preferred_job_type: '',
      availability: ''
    }
  });

  // نظارت بر تغییرات استان برای فیلتر کردن شهرها و سابقه کاری برای فیلد سال سابقه کاری
  const selectedProvinceId = watch('province_id');
  const selectedGender = watch('gender');
  const selectedExperience = watch('experience');
  
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
  
  // نظارت بر تغییرات سابقه کاری برای مدیریت فیلد سال سابقه کاری به عدد
  useEffect(() => {
    if (selectedExperience !== 'Six or More') {
      setValue('years_of_experience_numeric', 0);
    }
  }, [selectedExperience, setValue]);

  // تبدیل constants به آرایه گزینه‌ها برای Select ها
  const genderOptions = [
    { value: 'Male', label: 'مرد' },
    { value: 'Female', label: 'زن' }
  ];

  const soldierStatusOptions = [
    { value: 'Completed', label: 'پایان خدمت' },
    { value: 'Permanent Exemption', label: 'معافیت دائم' },
    { value: 'Educational Exemption', label: 'معافیت تحصیلی' },
    { value: 'Not Completed', label: 'نااتمام' }
  ];

  const degreeOptions = [
    { value: 'Below Diploma', label: 'زیر دیپلم' },
    { value: 'Diploma', label: 'دیپلم' },
    { value: 'Associate', label: 'فوق دیپلم' },
    { value: 'Bachelor', label: 'لیسانس' },
    { value: 'Master', label: 'فوق لیسانس' },
    { value: 'Doctorate', label: 'دکترا' }
  ];

  // گزینه‌های سابقه کاری انتخابی (experience field)
  const experienceOptions = [
    { value: 'No EXPERIENCE', label: 'بدون سابقه کار' },
    { value: 'Less than Three', label: 'کمتر از ۳ سال' },
    { value: 'Three or More', label: '۳ تا ۶ سال' },
    { value: 'Six or More', label: 'بیشتر از ۶ سال' }
  ];

  const salaryOptions = [
    { value: '5 to 10', label: '۵ تا ۱۰ میلیون تومان' },
    { value: '10 to 15', label: '۱۰ تا ۱۵ میلیون تومان' },
    { value: '15 to 20', label: '۱۵ تا ۲۰ میلیون تومان' },
    { value: '20 to 30', label: '۲۰ تا ۳۰ میلیون تومان' },
    { value: '30 to 50', label: '۳۰ تا ۵۰ میلیون تومان' },
    { value: 'More than 50', label: 'بیش از ۵۰ میلیون تومان' },
    { value: 'Negotiable', label: 'توافقی' }
  ];

  const jobTypeOptions = [
    { value: 'Full-Time', label: 'تمام وقت' },
    { value: 'Part-Time', label: 'پاره وقت' },
    { value: 'Remote', label: 'دورکاری' },
    { value: 'Internship', label: 'کارآموزی' }
  ];

  const availabilityOptions = [
    { value: 'immediately', label: 'فوری' },
    { value: 'with_notice', label: 'با اطلاع' },
    { value: 'not_available', label: 'غیرقابل دسترسی' }
  ];

  // لود داده‌های مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [resumeResponse, industryCategoriesResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/resumes/resumes/'),
          apiGet('/industries/industry-categories/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/')
        ]);
        
        // دریافت رزومه کاربر (اولین رزومه لیست)
        const resumes = Array.isArray(resumeResponse.data) ? resumeResponse.data : [];
        const resume = resumes.length > 0 ? resumes[0] : null;

        if (resume) {
          setResumeId(resume.id);
          const allCities = citiesResponse.data as City[];
          const cityObj = allCities.find((c) => c.id === resume.location);
          reset({
            headline: resume.headline || '',
            bio: resume.bio || '',
            province_id: cityObj?.province?.id || 0,
            city_id: resume.location || 0,
            industry_id: resume.industry || 0,
            gender: resume.gender || '',
            website: resume.website || '',
            linkedin_profile: resume.linkedin_profile || '',
            soldier_status: resume.soldier_status || '',
            degree: resume.degree || '',
            years_of_experience_numeric: resume.years_of_experience || 0,
            experience: resume.experience || '',
            expected_salary: resume.expected_salary || '',
            preferred_job_type: resume.preferred_job_type || '',
            availability: resume.availability || ''
          });
          // اگر رزومه فایل دارد، لینک کامل برای دانلود و نمایش آماده کن
          if ((resume as any).cv) {
            const cv = (resume as any).cv as string;
            const fullUrl = cv.startsWith('http') ? cv : `${process.env.NEXT_PUBLIC_API_URL}${cv}`;
            setExistingCvUrl(fullUrl);
          } else {
            setExistingCvUrl(null);
          }
        } else {
          // در صورت نبود رزومه، فرم روی مقادیر پیش‌فرض باقی می‌ماند
          setResumeId(null);
        }
        
        setIndustryCategories(industryCategoriesResponse.data as Industry[]);
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

  const onSubmit: SubmitHandler<PersonalInfoFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    try {
      // ساخت payload مطابق مدل رزومه
      const payload: any = {
        headline: data.headline || '',
        bio: data.bio || '',
        gender: data.gender || null,
        website: data.website || '',
        linkedin_profile: data.linkedin_profile || '',
        industry: data.industry_id || null,
        location: data.city_id || null,
        soldier_status: (data.gender === 'Female') ? null : (data.soldier_status || null),
        degree: data.degree || null,
        years_of_experience: data.years_of_experience_numeric || null,
        experience: data.experience || null,
        expected_salary: data.expected_salary || null,
        preferred_job_type: data.preferred_job_type || null,
        availability: data.availability || null
      };

      // اگر فایل CV انتخاب شده، از FormData استفاده کنیم
      if (data.cv && data.cv[0]) {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
          if (payload[key] !== null) {
            formData.append(key, payload[key]);
          }
        });
        formData.append('cv', data.cv[0]);

        if (resumeId) {
          await apiPut(`/resumes/resumes/${resumeId}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          const response = await apiPost('/resumes/resumes/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setResumeId((response.data as any).id);
        }
      } else {
        // بدون فایل، JSON معمولی ارسال کنیم
        if (resumeId) {
          await apiPut(`/resumes/resumes/${resumeId}/`, payload);
        } else {
          const response = await apiPost('/resumes/resumes/', payload);
          setResumeId((response.data as any).id);
        }
      }

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
            تکمیل اطلاعات شخصی به بهتر دیده شدن رزومه شما در نظر کارفرمایان کمک می‌کند.
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
                عنوان شغلی (در یک جمله)
              </Typography>
            </Box>
            <Controller
              name="headline"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="مثال: برنامه‌نویس فرانت‌اند (React)"
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
              بیوگرافی
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
                placeholder="توضیح مختصری درباره خودتان، تجربیات و مهارت‌های شغلی..."
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
                                    گروه کاری
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
                      const selectedIndustry = industryCategories.find(i => i.id === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                        {selectedIndustry ? selectedIndustry.name : 'انتخاب گروه کاری'}
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
                    <MenuItem value={0} disabled>انتخاب گروه کاری</MenuItem>
                    {industryCategories.map((industry) => (
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

        {/* وب‌سایت شخصی و پروفایل لینکدین */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* وب‌سایت */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                  placeholder="www.example.com"
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <LanguageIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          </Box>

          {/* لینکدین */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <LinkedInIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* وضعیت سربازی و سال سابقه کاری (عدد) - کنار هم */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* وضعیت سربازی */}
          <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SecurityIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              color: jobseekerColors.primary,
              fontWeight: 600
            }}>
              وضعیت سربازی
            </Typography>
          </Box>
          <Controller
            name="soldier_status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(formErrors.soldier_status)}>
                <Select
                  {...field}
                  displayEmpty
                  input={<OutlinedInput sx={selectStyles} />}
                  renderValue={() => {
                    const selectedOption = soldierStatusOptions.find(opt => opt.value === field.value);
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {selectedOption ? selectedOption.label : 'انتخاب وضعیت سربازی'}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <SecurityIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                  )}
                  disabled={selectedGender === 'Female'}
                  >
                  <MenuItem value="" disabled>انتخاب وضعیت سربازی</MenuItem>
                  {soldierStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.soldier_status && (
                  <FormHelperText>{formErrors.soldier_status.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          </Box>

          {/* سال سابقه کاری (عددی) */}
          <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WorkIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              color: jobseekerColors.primary,
              fontWeight: 600
            }}>
              سال سابقه کاری (عدد)
            </Typography>
          </Box>
          <Controller
            name="years_of_experience_numeric"
            control={control}
            rules={{
              min: { value: 0, message: 'حداقل ۰' },
              max: { value: 99, message: 'حداکثر ۹۹' },
              required: selectedExperience === 'Six or More' ? 'لطفاً تعداد سال‌های سابقه کاری را وارد کنید' : false
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="text"
                placeholder="مثال: ۵"
                error={Boolean(formErrors.years_of_experience_numeric)}
                helperText={selectedExperience === 'Six or More' ? 
                  formErrors.years_of_experience_numeric?.message : 
                  'این فیلد فقط برای سابقه کاری بیشتر از 6 سال فعال است'}
                variant="outlined"
                disabled={selectedExperience !== 'Six or More'}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9۰-۹]*', maxLength: 2 }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '6px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: jobseekerColors.primary,
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: jobseekerColors.primary
                  }
                }}
                // حذف آیکن داخلی طبق درخواست
                value={field.value === '' ? '' : convertToPersianNumbers(Number(field.value))}
                onChange={(e) => {
                  const persianToEnglish = (s: string) => s.replace(/[۰-۹]/g, (d) => String('0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]));
                  const raw = e.target.value;
                  const normalized = persianToEnglish(raw).replace(/[^0-9]/g, '');
                  if (normalized === '') { field.onChange(''); return; }
                  let n = Number(normalized);
                  if (Number.isNaN(n)) { field.onChange(''); return; }
                  if (n < 0) n = 0;
                  if (n > 99) n = 99;
                  field.onChange(n);
                }}
              />
            )}
          />
          </Box>
        </Box>

        {/* فیلدهای اضافی رزومه */}
        <AdditionalResumeFields 
          control={control}
          formErrors={formErrors}
          selectStyles={selectStyles}
          menuPropsRTL={menuPropsRTL}
        />

        {/* فایل رزومه و وضعیت دسترسی - کنار هم */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
          {/* فایل رزومه */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                فایل رزومه (PDF)
              </Typography>
            </Box>
            <Controller
              name="cv"
              control={control}
              render={({ field: { onChange } }) => (
                <Box>
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        onChange(e.target.files as any);
                        const url = URL.createObjectURL(file);
                        setCvPreviewUrl(url);
                        setCvFileName(file.name);
                      } else {
                        onChange(undefined as any);
                        setCvPreviewUrl(null);
                        setCvFileName('');
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => cvInputRef.current?.click()}
                    sx={{
                      background: jobseekerColors.primary,
                      color: 'white',
                      '&:hover': { background: jobseekerColors.dark, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
                      borderRadius: 1.5,
                      px: 2.5,
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      fontWeight: 600,
                      width: '100%',
                      minWidth: '100%',
                      height: '56px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    انتخاب فایل PDF
                  </Button>
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                    فرمت مجاز: PDF، حداکثر ۵ مگابایت
                  </Typography>

                  {/* فقط لینک دانلود و دکمه حذف برای فایل موجود */}
                  {!cvPreviewUrl && existingCvUrl && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<DownloadIcon />}
                        href={existingCvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: jobseekerColors.primary, textDecoration: 'none', justifyContent: 'flex-start', px: 0 }}
                      >
                        {getFileNameFromUrl(existingCvUrl)}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={!resumeId}
                        onClick={async () => {
                          if (!resumeId) return;
                          try {
                            await apiPut(`/resumes/resumes/${resumeId}/`, { cv: null });
                            setExistingCvUrl(null);
                            if (cvInputRef.current) cvInputRef.current.value = '';
                            setCvFileName('');
                          } catch {}
                        }}
                        sx={{ ml: 1 }}
                      >
                        حذف رزومه
                      </Button>
                    </Box>
                  )}

                  {/* برای فایل انتخاب‌شده جدید فقط نام و دکمه حذف نمایش بده */}
                  {cvPreviewUrl && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cvFileName}
                      </Typography>
                      <Button size="small" color="error" onClick={() => {
                        setCvPreviewUrl(null);
                        if (cvInputRef.current) cvInputRef.current.value = '';
                        onChange(undefined as any);
                        setCvFileName('');
                      }}>
                        حذف فایل
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            />
          </Box>

          {/* وضعیت دسترسی */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTimeIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium" sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                lineHeight: { xs: 1.1, sm: 1.3 },
                color: jobseekerColors.primary,
                fontWeight: 600
              }}>
                زمان آمادگی برای شروع کار
              </Typography>
            </Box>
            <Controller
              name="availability"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(formErrors.availability)}>
                  <Select
                    {...field}
                    displayEmpty
                    input={<OutlinedInput sx={selectStyles} />}
                    renderValue={() => {
                      const selectedOption = availabilityOptions.find(opt => opt.value === field.value);
                      return (
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          {selectedOption ? selectedOption.label : 'انتخاب وضعیت دسترسی'}
                        </Box>
                      );
                    }}
                    MenuProps={menuPropsRTL}
                    startAdornment={
                      <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                        <AccessTimeIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                      </InputAdornment>
                    }
                    IconComponent={(props: any) => (
                      <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                    )}
                  >
                    <MenuItem value="" disabled>انتخاب وضعیت دسترسی</MenuItem>
                    {availabilityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.availability && (
                    <FormHelperText>{formErrors.availability.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </Box>

        {/* دکمه ذخیره - هماهنگ با استایل دکمه "ذخیره تغییرات" در JobSeekerProfileForm */}
        <Box sx={{ 
          mt: { xs: 3, md: 4 },
          display: 'flex',
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={loading}
            sx={{
              background: jobseekerColors.primary,
              color: 'white',
              '&:hover': { 
                background: jobseekerColors.dark,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              },
              '&:disabled': {
                background: jobseekerColors.primary,
                color: 'white',
                cursor: 'not-allowed',
                opacity: 0.5
              },
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '140px',
              width: '140px',
              height: '48px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading ? '...' : 'ذخیره تغییرات'}
          </Button>
        </Box>
      </form>

      {/* آپلود تصویر در صفحه پروفایل انجام می‌شود */}
    </Paper>
  );
}
