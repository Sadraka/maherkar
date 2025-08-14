'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/axios';
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
  SelectChangeEvent,
  MenuProps,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import CampaignIcon from '@mui/icons-material/Campaign';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InfoIcon from '@mui/icons-material/Info';
import JobSeekerSubscriptionPlanSelector from './JobSeekerSubscriptionPlanSelector';

import { JOB_SEEKER_THEME } from '@/constants/colors';
import { 
  GENDER_CHOICES,
  SOLDIER_STATUS_CHOICES,
  DEGREE_CHOICES,
  SALARY_CHOICES,
  JOB_TYPE_CHOICES
} from '@/types';

/**
 * تایپ استان برای TypeScript
 */
type Province = {
  id: number;
  name: string;
};

/**
 * تایپ دسته‌بندی صنعت برای TypeScript
 */
type IndustryCategory = {
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
 * تایپ حداقلی رزومه برای نمایش اطلاعات اتوماتیک
 */
type MinimalResume = {
  id: string;
  headline?: string | null;
  industry?: { id: number; name: string } | null;
  location?: { id: number; name: string; province?: { id: number; name: string } } | null;
  gender?: keyof typeof GENDER_CHOICES | null;
  degree?: keyof typeof DEGREE_CHOICES | null;
  expected_salary?: keyof typeof SALARY_CHOICES | null;
  preferred_job_type?: keyof typeof JOB_TYPE_CHOICES | null;
  experience_years?: number | null;
  educations?: any[];
  experiences?: any[];
  skills?: any[];
  bio?: string | null;
  website?: string | null;
  linkedin_profile?: string | null;
  availability?: string | null;
};

/**
 * تایپ طرح اشتراک
 */
type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  active: boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * تایپ درخواست سفارش جدید آگهی رزومه
 */
interface NewResumeOrderRequest {
  plan_id: string;
  duration: string;
  resume_title: string;
  resume_description: string;
  city_id: string;
  industry_id: string;
  job_type?: string;
  salary?: string;
  gender?: string;
  degree?: string;
  soldier_status?: string;
}

/**
 * تایپ پاسخ ایجاد سفارش جدید
 */
interface NewResumeOrderResponse {
  message: string;
  order_id: string;
  total_price: number;
  payment_url: string;
}

/**
 * تایپ پاسخ درخواست پرداخت
 */
interface PaymentRequestResponse {
  status: boolean;
  url?: string;
  message?: string;
}

/**
 * ورودی‌های فرم ثبت آگهی رزومه
 */
interface ResumeAdFormInputs {
  title: string;
  description: string;
  province_id: number;
  city_id: number;
  industry_category_id: number;
  industry_id: number;
  job_type: string;
  salary: string;
  gender: string;
  degree: string;
  soldier_status: string;
}

/**
 * مراحل فرم ثبت آگهی رزومه
 */
enum FormStep {
  RESUME_DETAILS = 0,
  SUBSCRIPTION = 1,
  PAYMENT = 2
}

/**
 * Props برای کامپوننت CreateResumeAdForm
 */
interface CreateResumeAdFormProps {
  initialData?: any | null;
  isEditMode?: boolean;
  onSubmit?: (data: any) => Promise<{ 
    success: boolean; 
    message: string; 
    redirectUrl?: string;
  }>;
  pageTitle?: string;
  pageIcon?: React.ReactElement;
  submitButtonText?: string;
  successMessage?: string;
}

/**
 * تابع تبدیل اعداد انگلیسی به فارسی
 */
const toPersianDigits = (str: string): string => {
  return str.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
};

/**
 * کامپوننت فرم ثبت آگهی رزومه جدید
 */
export default function CreateResumeAdForm({
  initialData = null,
  isEditMode = false,
  onSubmit: customSubmit,
  pageTitle = "ثبت آگهی رزومه جدید",
  pageIcon = <CampaignIcon />,
  submitButtonText = "ثبت آگهی رزومه",
  successMessage = "آگهی رزومه با موفقیت ثبت شد!"
}: CreateResumeAdFormProps) {
  const router = useRouter();
  const theme = useTheme();
  const jobSeekerColors = JOB_SEEKER_THEME;
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryCategories, setIndustryCategories] = useState<IndustryCategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [resumeInfo, setResumeInfo] = useState<MinimalResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // حالت انتخاب اشتراک
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.RESUME_DETAILS);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors: formErrors },
    watch,
    setValue,
    reset
  } = useForm<ResumeAdFormInputs>({
    defaultValues: {
      title: '',
      description: '',
      province_id: 0,
      city_id: 0,
      industry_category_id: 0,
      industry_id: 0,
      job_type: '',
      salary: '',
      gender: '',
      degree: '',
      soldier_status: ''
    }
  });

  // نظارت بر تغییرات استان برای فیلتر کردن شهرها
  const selectedProvinceId = watch('province_id');
  
  // نظارت بر تغییرات دسته‌بندی صنعت برای فیلتر کردن صنایع
  const selectedIndustryCategoryId = watch('industry_category_id');
  
  // نظارت بر تغییرات جنسیت برای غیرفعال کردن نظام وظیفه
  const selectedGender = watch('gender');
  const isFemale = selectedGender === 'F';

  // اگر جنسیت زن باشد، نظام وظیفه را غیرفعال کن و مقدار را تنظیم کن
  useEffect(() => {
    if (isFemale) {
      setValue('soldier_status', 'NS'); // مهم نیست
    }
  }, [isFemale, setValue]);

  // فیلتر کردن شهرها بر اساس استان انتخاب شده
  const filteredCities = React.useMemo(() => {
    if (!selectedProvinceId || selectedProvinceId === 0) return [];
    return cities.filter(city => city.province?.id === selectedProvinceId);
  }, [cities, selectedProvinceId]);

  // فیلتر کردن صنایع بر اساس گروه کاری انتخاب شده
  const filteredIndustries = React.useMemo(() => {
    if (!selectedIndustryCategoryId || selectedIndustryCategoryId === 0) return [];
    return industries.filter(industry => industry.category?.id === selectedIndustryCategoryId);
  }, [industries, selectedIndustryCategoryId]);

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

  // ریست کردن صنعت هنگام تغییر گروه کاری
  useEffect(() => {
    if (selectedIndustryCategoryId && selectedIndustryCategoryId !== 0) {
      const currentIndustryId = watch('industry_id');
      const isCurrentIndustryInCategory = filteredIndustries.some(industry => industry.id === currentIndustryId);
      if (!isCurrentIndustryInCategory) {
        setValue('industry_id', 0);
      }
    }
  }, [selectedIndustryCategoryId, filteredIndustries, setValue, watch]);

  // تبدیل constants به آرایه گزینه‌ها برای Select ها
  const jobTypeOptions = Object.entries(JOB_TYPE_CHOICES).map(([value, label]) => ({ value, label }));
  const genderOptions = [
    ...Object.entries(GENDER_CHOICES).map(([value, label]) => ({ value, label }))
  ];
  const degreeOptions = [
    ...Object.entries(DEGREE_CHOICES).map(([value, label]) => ({ value, label }))
  ];
  const soldierStatusOptions = [
    ...Object.entries(SOLDIER_STATUS_CHOICES).map(([value, label]) => ({ value, label }))
  ];
  const salaryOptions = [
    ...Object.entries(SALARY_CHOICES).map(([value, label]) => ({ value, label }))
  ];

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
            backgroundColor: jobSeekerColors.bgVeryLight,
          },
          '&.Mui-selected': {
            backgroundColor: jobSeekerColors.bgLight,
            color: jobSeekerColors.primary,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: jobSeekerColors.bgLight,
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
        boxShadow: `0 0 0 2px ${jobSeekerColors.primary}20`
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
      color: jobSeekerColors.primary
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

  // لود داده‌های مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [resumeResponse, educationsResponse, experiencesResponse, skillsResponse, industriesResponse, industryCategoriesResponse, citiesResponse, provincesResponse, plansResponse] = await Promise.all([
          apiGet('/resumes/resumes/'),
          apiGet('/resumes/educations/'),
          apiGet('/resumes/experiences/'),
          apiGet('/resumes/skills/'),
          apiGet('/industries/industries/'),
          apiGet('/industries/industry-categories/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/'),
          apiGet('/subscriptions/plans/')
        ]);
        
        // بررسی وجود رزومه
        const resumeData = resumeResponse.data;
        const has = Array.isArray(resumeData) && resumeData.length > 0;
        setHasResume(has);
        if (has) {
          const r = resumeData[0];
          const educations = (educationsResponse.data as any[]) || [];
          const experiences = (experiencesResponse.data as any[]) || [];
          const skills = (skillsResponse.data as any[]) || [];
          
          setResumeInfo({
            id: r?.id ?? '',
            headline: r?.headline ?? r?.title ?? '',
            bio: r?.bio ?? null,
            website: r?.website ?? null,
            linkedin_profile: r?.linkedin_profile ?? null,
            industry: r?.industry ?? null,
            location: r?.location ?? null,
            gender: r?.gender ?? null,
            degree: r?.degree ?? null,
            expected_salary: r?.expected_salary ?? null,
            preferred_job_type: r?.preferred_job_type ?? null,
            experience_years: r?.years_of_experience ?? null,
            educations: educations,
            experiences: experiences,
            skills: skills,
            availability: r?.availability ?? null
          });
        }
        
        setIndustries(industriesResponse.data as Industry[]);
        setIndustryCategories(industryCategoriesResponse.data as IndustryCategory[]);
        setCities(citiesResponse.data as City[]);
        setProvinces(provincesResponse.data as Province[]);
        setSubscriptionPlans(plansResponse.data as SubscriptionPlan[]);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setErrors(['خطا در دریافت اطلاعات مورد نیاز. لطفاً دوباره تلاش کنید.']);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // اگر داده اولیه وجود داشته باشد، فرم را پر کن
  useEffect(() => {
    if (initialData && isEditMode) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        province_id: initialData.location?.province?.id || 0,
        city_id: initialData.location?.id || 0,
        industry_category_id: initialData.industry?.category?.id || 0,
        industry_id: initialData.industry?.id || 0,
        job_type: initialData.job_type || '',
        salary: initialData.salary || '',
        gender: initialData.gender || '',
        degree: initialData.degree || '',
        soldier_status: initialData.soldier_status || ''
      });
    }
  }, [initialData, isEditMode, reset]);

  const onSubmit: SubmitHandler<ResumeAdFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    // بررسی وجود رزومه
    if (!hasResume) {
      setErrors(['برای ثبت آگهی رزومه، ابتدا باید رزومه خود را تکمیل کنید.']);
      setLoading(false);
      return;
    }

    // بررسی انتخاب طرح اشتراک
    if (!selectedPlan) {
      setErrors(['لطفاً طرح اشتراک را انتخاب کنید']);
      setCurrentStep(FormStep.SUBSCRIPTION);
      setLoading(false);
      return;
    }

    try {
      // آماده‌سازی داده‌های سفارش جدید
      const orderData: NewResumeOrderRequest = {
        plan_id: selectedPlan.id,
        duration: selectedDuration.toString(),
        resume_title: data.title,
        resume_description: data.description || '',
        city_id: data.city_id.toString(),
        industry_id: data.industry_id.toString(),
        job_type: data.job_type || '',
        salary: data.salary || '',
        gender: data.gender || '',
        degree: data.degree || '',
        soldier_status: isFemale ? 'NS' : (data.soldier_status || '')
      };

      console.log('داده‌های سفارش ارسالی:', orderData);

      if (customSubmit) {
        const result = await customSubmit(orderData);
        if (result && result.success) {
          setSuccess(true);
          
          // اسکرول به بالای صفحه
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
          
          if (result.redirectUrl) {
            setTimeout(() => {
              router.push(result.redirectUrl!);
            }, 2000);
          }
        }
      } else {
        // استفاده از endpoint جدید برای ایجاد سفارش آگهی رزومه
        const orderResponse = await apiPost('/orders/subscriptions/new-resume/', orderData);
        const orderResult = orderResponse.data as NewResumeOrderResponse;

        console.log('پاسخ ایجاد سفارش:', orderResult);

        if (!orderResult.order_id) {
          throw new Error('سفارش ایجاد نشد');
        }

        // درخواست لینک پرداخت
        const paymentResponse = await apiGet(`/payments/zarinpal-pay/${orderResult.order_id}/`);
        const paymentData = paymentResponse.data as PaymentRequestResponse;

        console.log('پاسخ درخواست پرداخت:', paymentData);

        if (paymentData.status && paymentData.url) {
        setSuccess(true);
          
          // اسکرول به بالای صفحه
        setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
          
          // هدایت فوری به درگاه پرداخت
          window.location.href = paymentData.url!;
        } else {
          throw new Error(paymentData.message || 'خطا در دریافت لینک پرداخت');
        }
      }
    } catch (err: any) {
      console.error('خطا در ثبت آگهی رزومه:', err);
      
      const newErrors: string[] = [];
      
      if (err.response?.data) {
        console.log('جزئیات خطای سرور:', err.response.data);
        
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
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // عناوین مراحل
  const stepLabels = ['اطلاعات آگهی رزومه', 'انتخاب اشتراک', 'پرداخت'];

  // تابع validation برای فیلدهای ضروری
  const validateRequiredFields = (): boolean => {
    const data = watch();
    const newErrors: string[] = [];

    if (!data.title || !data.title.trim()) {
      newErrors.push('لطفاً عنوان آگهی رزومه را وارد کنید');
    }

    if (!data.province_id || data.province_id === 0) {
      newErrors.push('لطفاً استان را انتخاب کنید');
    }

    if (!data.city_id || data.city_id === 0) {
      newErrors.push('لطفاً شهر را انتخاب کنید');
    }

    if (!data.industry_category_id || data.industry_category_id === 0) {
      newErrors.push('لطفاً گروه کاری را انتخاب کنید');
    }

    if (!data.industry_id || data.industry_id === 0) {
      newErrors.push('لطفاً زیرگروه کاری را انتخاب کنید');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      // اسکرول به بالای صفحه در صورت بروز خطا
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return false;
    }

    setErrors([]);
    return true;
  };

  // تابع رفتن به مرحله بعد
  const handleNextStep = () => {
    if (currentStep === FormStep.RESUME_DETAILS) {
      if (validateRequiredFields()) {
        setCurrentStep(FormStep.SUBSCRIPTION);
        // اسکرول به بالای صفحه
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  // تابع برگشت به مرحله قبل
  const handleBackStep = () => {
    if (currentStep === FormStep.SUBSCRIPTION) {
      setCurrentStep(FormStep.RESUME_DETAILS);
      // اسکرول به بالای صفحه
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  if (dataLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <CircularProgress 
          size={60} 
          sx={{ 
            color: JOB_SEEKER_THEME.primary,
            mb: 2
          }} 
        />
      </Box>
    );
  }

  return (
    <Paper 
      ref={containerRef}
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
                  color: JOB_SEEKER_THEME.primary,
                  transform: 'translateY(-2px)'
                } 
              } as any)
            }
            <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              color: JOB_SEEKER_THEME.primary,
              lineHeight: { xs: 1.3, sm: 1.4 }
            }}>
              {pageTitle}
            </Typography>
          </Box>
        )}

        {/* نوار پیشرفت مینیمال */}
        <Box sx={{ mb: 3 }}>
          {/* نمایش مرحله فعلی */}
          <Typography
            key={`step-number-${currentStep}`}
            variant="caption"
            sx={{
              color: alpha(JOB_SEEKER_THEME.primary, 0.7),
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mb: 0.5,
              display: 'block',
              animation: 'fadeChange 0.6s ease-in-out',
              '@keyframes fadeChange': {
                '0%': { opacity: 1 },
                '30%': { opacity: 0, transform: 'translateY(-5px)' },
                '70%': { opacity: 0, transform: 'translateY(5px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            مرحله {(currentStep + 1).toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])} از {stepLabels.length.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])}
          </Typography>

          {/* عنوان مرحله */}
          <Typography 
            key={`step-title-${currentStep}`}
            variant="subtitle1" 
            sx={{ 
              color: JOB_SEEKER_THEME.primary,
              fontWeight: 700,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              lineHeight: { xs: 1.2, sm: 1.3 },
              mb: { xs: 1.5, sm: 2 },
              animation: 'fadeChange 0.6s ease-in-out 0.1s both',
            }}
          >
            {stepLabels[currentStep]}
          </Typography>

          {/* Progress Bar */}
          <Box
            sx={{
              width: '100%',
              height: 3,
              backgroundColor: alpha(JOB_SEEKER_THEME.primary, 0.1),
              borderRadius: 1.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: `linear-gradient(90deg, ${JOB_SEEKER_THEME.primary}, ${JOB_SEEKER_THEME.light})`,
                borderRadius: 1.5,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                width: `${((currentStep + 1) / stepLabels.length) * 100}%`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                  animation: 'shimmer 2s ease-in-out infinite 1s'
                }
              }}
            />
          </Box>

          {/* انیمیشن‌های CSS */}
          <style jsx>{`
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 100%; }
            }
          `}</style>
        </Box>
        
        {currentStep === FormStep.SUBSCRIPTION && (
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ 
              '& .MuiAlert-message': {
                width: '100%'
              },
              '& .MuiAlert-icon': {
                display: { xs: 'none', sm: 'flex' }
              }
            }}
          >
            <Box>
              برای نهایی کردن ثبت آگهی رزومه، طرح اشتراک و مدت زمان مورد نظر خود را انتخاب کنید.
            </Box>
          </Alert>
        )}

        {/* بررسی وجود رزومه */}
        {!hasResume && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
          >
            <AlertTitle>رزومه تکمیل نشده</AlertTitle>
            برای ثبت آگهی رزومه، ابتدا باید رزومه خود را تکمیل کنید.
            <Button 
              size="small" 
              sx={{ mt: 1, mr: 2 }}
              onClick={() => router.push('/jobseeker/resume')}
            >
              تکمیل رزومه
            </Button>
          </Alert>
        )}
      </Box>

      {/* نمایش خطاها */}
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
            <AlertTitle>{isEditMode ? 'خطا در ویرایش آگهی رزومه' : 'خطا در ثبت آگهی رزومه'}</AlertTitle>
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

      {/* نمایش موفقیت */}
      {success && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          severity="success" 
          sx={{ mb: 3 }}
        >
          {successMessage}
        </Alert>
      )}

      {/* محتوای مراحل مختلف */}
      {currentStep === FormStep.RESUME_DETAILS && (
        <Box>
          {/* فیلدهای اجباری */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                color: JOB_SEEKER_THEME.primary,
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                fontWeight: 700,
                lineHeight: { xs: 1.2, sm: 1.3 },
                textShadow: '0 1px 2px rgba(76, 175, 80, 0.1)',
                mb: { xs: 1.5, sm: 2, md: 3 }
              }}
            >
              اطلاعات ضروری آگهی رزومه
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 1.5, sm: 3 },
              opacity: !hasResume ? 0.5 : 1,
              pointerEvents: !hasResume ? 'none' : 'auto'
            }}>

              {/* توضیحات آگهی رزومه */}
              {resumeInfo && (
                <Alert 
                  severity="success" 
                  icon={false}
                  sx={{ 
                    mb: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                      padding: '12px 16px'
                    }
                  }}
                >
                  <Box >
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      اطلاعات شخصی شما شامل مهارت‌ها، تجربیات و تحصیلات به‌طور خودکار در آگهی شما نمایش داده خواهد شد.
                      برای ویرایش اطلاعات شخصی، به بخش رزومه مراجعه کنید.
                    </Typography>
                  </Box>
                </Alert>
              )}
              
              {/* عنوان آگهی */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    mb: { xs: 0.5, sm: 1 },
                    color: JOB_SEEKER_THEME.primary,
                    fontWeight: 600
                  }}>
                    عنوان آگهی رزومه <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                </Box>
                <Controller
                  name="title"
                  control={control}
                  rules={{ 
                    required: 'عنوان آگهی رزومه الزامی است', 
                    minLength: { value: 3, message: 'عنوان باید حداقل 3 حرف باشد' } 
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="مثال: برنامه‌نویس React با ۳ سال تجربه"
                      error={Boolean(formErrors.title)}
                      helperText={formErrors.title?.message}
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '6px',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: JOB_SEEKER_THEME.primary
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

              {/* استان و شهر */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                {/* استان */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.1, sm: 1.3 },
                      mb: { xs: 0.5, sm: 1 },
                      color: JOB_SEEKER_THEME.primary,
                      fontWeight: 600
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
                              <LocationOnIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />
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
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.1, sm: 1.3 },
                      mb: { xs: 0.5, sm: 1 },
                      color: JOB_SEEKER_THEME.primary,
                      fontWeight: 600
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
                              <LocationOnIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />
                          )}
                          disabled={!selectedProvinceId || selectedProvinceId === 0}
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

              {/* گروه و زیرگروه کاری */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                {/* گروه کاری */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.1, sm: 1.3 },
                      mb: { xs: 0.5, sm: 1 },
                      color: JOB_SEEKER_THEME.primary,
                      fontWeight: 600
                    }}>
                      گروه کاری <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                  </Box>
                  <Controller
                    name="industry_category_id"
                    control={control}
                    rules={{ required: 'انتخاب گروه کاری الزامی است' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(formErrors.industry_category_id)}>
                        <Select
                          {...field}
                          displayEmpty
                          input={<OutlinedInput sx={selectStyles} />}
                          renderValue={() => {
                            const selectedCategory = industryCategories.find(c => c.id === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {selectedCategory ? selectedCategory.name : 'انتخاب گروه کاری'}
                              </Box>
                            );
                          }}
                          MenuProps={menuPropsRTL}
                          startAdornment={
                            <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                              <CategoryIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />
                          )}
                        >
                          <MenuItem value={0} disabled>انتخاب گروه کاری</MenuItem>
                          {industryCategories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.industry_category_id && (
                          <FormHelperText>{formErrors.industry_category_id.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>

                {/* زیرگروه کاری */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.1, sm: 1.3 },
                      mb: { xs: 0.5, sm: 1 },
                      color: JOB_SEEKER_THEME.primary,
                      fontWeight: 600
                    }}>
                      زیرگروه کاری <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                  </Box>
                  <Controller
                    name="industry_id"
                    control={control}
                    rules={{ required: 'انتخاب زیرگروه کاری الزامی است' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(formErrors.industry_id)}>
                        <Select
                          {...field}
                          displayEmpty
                          input={<OutlinedInput sx={selectStyles} />}
                          renderValue={() => {
                            const selectedIndustry = filteredIndustries.find(i => i.id === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {selectedIndustry ? selectedIndustry.name : (selectedIndustryCategoryId ? 'انتخاب زیرگروه کاری' : 'ابتدا گروه کاری را انتخاب کنید')}
                              </Box>
                            );
                          }}
                          MenuProps={menuPropsRTL}
                          startAdornment={
                            <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                              <CategoryIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />
                          )}
                          disabled={!selectedIndustryCategoryId || selectedIndustryCategoryId === 0}
                        >
                          <MenuItem value={0} disabled>
                            {selectedIndustryCategoryId ? 'انتخاب زیرگروه کاری' : 'ابتدا گروه کاری را انتخاب کنید'}
                          </MenuItem>
                          {filteredIndustries.map((industry) => (
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
              </Box>

              {/* فیلدهای اختیاری */}
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 3 } }}>
                {/* ردیف اول: جنسیت و نظام وظیفه */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                  {/* جنسیت */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.1, sm: 1.3 }, mb: { xs: 0.5, sm: 1 }, color: JOB_SEEKER_THEME.primary, fontWeight: 600 }}>
                        جنسیت (اختیاری)
                      </Typography>
                    </Box>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Select
                            {...field}
                            displayEmpty
                            input={<OutlinedInput sx={selectStyles} />}
                            renderValue={() => {
                              const selected = genderOptions.find(o => o.value === field.value);
                              return <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{selected ? selected.label : 'انتخاب جنسیت'}</Box>;
                            }}
                            MenuProps={menuPropsRTL}
                            startAdornment={<InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}><PeopleIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} /></InputAdornment>}
                            IconComponent={(props: any) => <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />}
                          >
                            <MenuItem value="">انتخاب جنسیت</MenuItem>
                            {genderOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>

                  {/* وضعیت نظام وظیفه */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.1, sm: 1.3 }, mb: { xs: 0.5, sm: 1 }, color: JOB_SEEKER_THEME.primary, fontWeight: 600 }}>
                        وضعیت نظام وظیفه (اختیاری)
                      </Typography>
                    </Box>
                    <Controller
                      name="soldier_status"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Select
                            {...field}
                            displayEmpty
                            disabled={isFemale}
                            input={<OutlinedInput sx={selectStyles} />}
                            renderValue={() => {
                              const selected = soldierStatusOptions.find(o => o.value === field.value);
                              return <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{selected ? selected.label : 'انتخاب وضعیت'}</Box>;
                            }}
                            MenuProps={menuPropsRTL}
                            startAdornment={<InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}><WorkIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} /></InputAdornment>}
                            IconComponent={(props: any) => <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />}
                          >
                            <MenuItem value="">انتخاب وضعیت</MenuItem>
                            {soldierStatusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>

                {/* ردیف دوم: مدرک، نوع کار، حقوق */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                  {/* مدرک */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.1, sm: 1.3 }, mb: { xs: 0.5, sm: 1 }, color: JOB_SEEKER_THEME.primary, fontWeight: 600 }}>
                        حداقل مدرک تحصیلی (اختیاری)
                      </Typography>
                    </Box>
                    <Controller
                      name="degree"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Select
                            {...field}
                            displayEmpty
                            input={<OutlinedInput sx={selectStyles} />}
                            renderValue={() => {
                              const selected = degreeOptions.find(o => o.value === field.value);
                              return <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{selected ? selected.label : 'انتخاب مدرک'}</Box>;
                            }}
                            MenuProps={menuPropsRTL}
                            startAdornment={<InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}><SchoolIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} /></InputAdornment>}
                            IconComponent={(props: any) => <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />}
                          >
                            <MenuItem value="">انتخاب مدرک</MenuItem>
                            {degreeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>

                  {/* نوع کار */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.1, sm: 1.3 }, mb: { xs: 0.5, sm: 1 }, color: JOB_SEEKER_THEME.primary, fontWeight: 600 }}>
                        نوع کار (اختیاری)
                      </Typography>
                    </Box>
                    <Controller
                      name="job_type"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Select
                            {...field}
                            displayEmpty
                            input={<OutlinedInput sx={selectStyles} />}
                            renderValue={() => {
                              const selected = jobTypeOptions.find(o => o.value === field.value);
                              return <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{selected ? selected.label : 'انتخاب نوع کار'}</Box>;
                            }}
                            MenuProps={menuPropsRTL}
                            startAdornment={<InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}><WorkIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} /></InputAdornment>}
                            IconComponent={(props: any) => <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />}
                          >
                            <MenuItem value="">انتخاب نوع کار</MenuItem>
                            {jobTypeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>

                  {/* محدوده حقوق */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.1, sm: 1.3 }, mb: { xs: 0.5, sm: 1 }, color: JOB_SEEKER_THEME.primary, fontWeight: 600 }}>
                        محدوده حقوق (اختیاری)
                      </Typography>
                    </Box>
                    <Controller
                      name="salary"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Select
                            {...field}
                            displayEmpty
                            input={<OutlinedInput sx={selectStyles} />}
                            renderValue={() => {
                              const selected = salaryOptions.find(o => o.value === field.value);
                              return <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{selected ? selected.label : 'انتخاب حقوق'}</Box>;
                            }}
                            MenuProps={menuPropsRTL}
                            startAdornment={<InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}><AttachMoneyIcon fontSize="small" sx={{ color: jobSeekerColors.primary }} /></InputAdornment>}
                            IconComponent={(props: any) => <KeyboardArrowDownIcon {...props} sx={{ color: jobSeekerColors.primary }} />}
                          >
                            <MenuItem value="">انتخاب حقوق</MenuItem>
                            {salaryOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, mt: 4 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleNextStep}
                  disabled={loading}
                  sx={{ 
                    px: { xs: 4, sm: 6 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: 600,
                    minWidth: { xs: '100%', sm: 200 },
                    borderRadius: 2
                  }}
                >
                  ادامه - انتخاب اشتراک
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {currentStep === FormStep.SUBSCRIPTION && (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <JobSeekerSubscriptionPlanSelector
            selectedPlan={selectedPlan}
            selectedDuration={selectedDuration}
            onPlanChange={setSelectedPlan}
            onDurationChange={setSelectedDuration}
            disabled={loading}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleBackStep}
              disabled={loading}
              sx={{
                borderColor: jobSeekerColors.primary,
                color: jobSeekerColors.primary,
                borderRadius: 2,
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 150 },
                '&:hover': {
                  borderColor: jobSeekerColors.dark,
                  color: jobSeekerColors.dark,
                  backgroundColor: `${jobSeekerColors.primary}0D`
                }
              }}
            >
              بازگشت
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={loading || !hasResume || !selectedPlan}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
              sx={{
                px: { xs: 4, sm: 6 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 200 },
                borderRadius: 2
              }}
            >
              {loading ? 'در حال ثبت و هدایت به پرداخت...' : 'ثبت آگهی و پرداخت'}
            </Button>
          </Box>
        </form>
      )}
    </Paper>
  );
}
