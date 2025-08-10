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
  Stepper,
  Step,
  StepLabel,
  OutlinedInput,
  SelectChangeEvent,
  MenuProps,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import WorkIcon from '@mui/icons-material/Work';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import AddWorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { EMPLOYER_THEME } from '@/constants/colors';
import { 
  SubscriptionPlan, 
  NewJobOrderRequest, 
  NewJobOrderResponse, 
  PaymentRequestResponse,
  GENDER_CHOICES,
  SOLDIER_STATUS_CHOICES,
  DEGREE_CHOICES,
  SALARY_CHOICES,
  JOB_TYPE_CHOICES
} from '@/types';
import SubscriptionPlanSelector from './SubscriptionPlanSelector';

// Helper: convert English digits to Persian digits
const toPersianDigits = (value: number | string): string =>
  value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

/**
 * تایپ شرکت برای TypeScript
 */
type Company = {
  id: string;
  name: string;
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
    category?: {
      id: number;
      name: string;
    };
  };
};

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
 * ورودی‌های فرم ثبت آگهی
 */
interface JobFormInputs {
  company_id: string;
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
  experience_years: string;
}

/**
 * مراحل فرم ثبت آگهی
 */
enum FormStep {
  JOB_DETAILS = 0,
  SUBSCRIPTION = 1,
  PAYMENT = 2
}

/**
 * Props برای کامپوننت CreateJobForm
 */
interface CreateJobFormProps {
  initialData?: any | null;
  isEditMode?: boolean;
  onSubmit?: (data: any) => Promise<{ 
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
 * کامپوننت فرم ثبت آگهی شغلی جدید
 */
export default function CreateJobForm({
  initialData = null,
  isEditMode = false,
  onSubmit: customSubmit,
  pageTitle = "ثبت آگهی شغلی جدید",
  pageIcon = <AddWorkIcon />,
  submitButtonText = "ثبت آگهی و پرداخت",
  successMessage = "در حال هدایت به درگاه پرداخت..."
}: CreateJobFormProps) {
  const router = useRouter();
  const theme = useTheme();
  const employerColors = EMPLOYER_THEME;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryCategories, setIndustryCategories] = useState<IndustryCategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // حالت انتخاب اشتراک
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.JOB_DETAILS);
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
  } = useForm<JobFormInputs>({
    defaultValues: {
      company_id: '',
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
      soldier_status: '',
      experience_years: ''
    }
  });

  // نظارت بر تغییرات شرکت برای تنظیم شهر و گروه کاری
  const selectedCompanyId = watch('company_id');
  
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

  // تنظیم شهر و گروه کاری بر اساس شرکت انتخاب شده
  useEffect(() => {
    if (selectedCompanyId && companies.length > 0) {
      const company = companies.find(c => c.id === selectedCompanyId);
      if (company) {
        setSelectedCompany(company);
        // تنظیم استان و شهر از اطلاعات شرکت
        if (company.location) {
          if (company.location.province) {
            setValue('province_id', company.location.province.id);
          }
          setValue('city_id', company.location.id);
        }
        // تنظیم دسته‌بندی صنعت و صنعت از اطلاعات شرکت
        if (company.industry) {
          if (company.industry.category) {
            setValue('industry_category_id', company.industry.category.id);
          }
          setValue('industry_id', company.industry.id);
        } else {
          // اگر شرکت گروه کاری نداشته باشد، مقادیر را صفر کن
          setValue('industry_category_id', 0);
          setValue('industry_id', 0);
        }
      }
    } else {
      setSelectedCompany(null);
    }
  }, [selectedCompanyId, companies, setValue]);

  // فیلتر کردن شهرها بر اساس استان انتخاب شده
  const filteredCities = React.useMemo(() => {
    if (!selectedProvinceId || selectedProvinceId === 0) return [];
    return cities.filter(city => city.province?.id === selectedProvinceId);
  }, [cities, selectedProvinceId]);

  // فیلتر کردن صنایع بر اساس دسته‌بندی انتخاب شده
  const filteredIndustries = React.useMemo(() => {
    if (!selectedIndustryCategoryId || selectedIndustryCategoryId === 0) return [];
    return industries.filter(industry => industry.category?.id === selectedIndustryCategoryId);
  }, [industries, selectedIndustryCategoryId]);

  // ریست کردن شهر هنگام تغییر استان
  useEffect(() => {
    if (selectedProvinceId && selectedProvinceId !== 0) {
      // اگر شهر انتخاب شده متعلق به استان جدید نباشد، آن را ریست کن
      const currentCityId = watch('city_id');
      const isCurrentCityInProvince = filteredCities.some(city => city.id === currentCityId);
      if (!isCurrentCityInProvince) {
        setValue('city_id', 0);
      }
    }
  }, [selectedProvinceId, filteredCities, setValue, watch]);

  // ریست کردن صنعت هنگام تغییر دسته‌بندی
  useEffect(() => {
    if (selectedIndustryCategoryId && selectedIndustryCategoryId !== 0) {
      // اگر صنعت انتخاب شده متعلق به دسته‌بندی جدید نباشد، آن را ریست کن
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

  // لود داده‌های مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [companiesResponse, industriesResponse, industryCategoriesResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/companies/?status=A'), // فقط شرکت‌های تایید شده
          apiGet('/industries/industries/'),
          apiGet('/industries/industry-categories/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/')
        ]);
        setCompanies(companiesResponse.data as Company[]);
        setIndustries(industriesResponse.data as Industry[]);
        setIndustryCategories(industryCategoriesResponse.data as IndustryCategory[]);
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
  }, []);

  // اگر داده اولیه وجود داشته باشد، فرم را پر کن
  useEffect(() => {
    if (initialData && isEditMode) {
      // تنظیم داده‌های فرم
      reset({
        company_id: initialData.company?.id || '',
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
        soldier_status: initialData.soldier_status || '',
        experience_years: initialData.experience_years || ''
      });

      // باز کردن آکاردئون اطلاعات اختیاری اگر داده‌های اختیاری وجود داشته باشد
      if (
        initialData.description || 
        initialData.industry || 
        initialData.job_type || 
        initialData.salary || 
        initialData.gender || 
        initialData.degree || 
        initialData.soldier_status || 
        initialData.experience_years
      ) {
        // فیلدهای اختیاری پر شده، دیگر نیازی به accordion نیست
      }
    }
  }, [initialData, isEditMode, reset]);

    const onSubmit: SubmitHandler<JobFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    // بررسی انتخاب طرح اشتراک
    if (!selectedPlan) {
      setErrors(['لطفاً طرح اشتراک را انتخاب کنید']);
      setCurrentStep(FormStep.SUBSCRIPTION);
      setLoading(false);
      return;
    }

    // بررسی فیلدهای اجباری
    if (!data.company_id) {
      setErrors(['لطفاً شرکت را انتخاب کنید']);
      setLoading(false);
      return;
    }

    if (!data.title || !data.title.trim()) {
      setErrors(['لطفاً عنوان شغل را وارد کنید']);
      setLoading(false);
      return;
    }

    if (!data.province_id || data.province_id === 0) {
      setErrors(['لطفاً استان محل فعالیت را انتخاب کنید']);
      setLoading(false);
      return;
    }

    if (!data.city_id || data.city_id === 0) {
      setErrors(['لطفاً شهر محل فعالیت را انتخاب کنید']);
      setLoading(false);
      return;
    }

    if (!data.industry_category_id || data.industry_category_id === 0) {
      setErrors(['لطفاً گروه کاری را انتخاب کنید']);
      setLoading(false);
      return;
    }

    if (!data.industry_id || data.industry_id === 0) {
      setErrors(['لطفاً زیرگروه کاری را انتخاب کنید']);
      setLoading(false);
      return;
    }

    try {
      // آماده‌سازی داده‌های سفارش جدید
      const orderData: NewJobOrderRequest = {
        plan_id: selectedPlan.id,
        duration: selectedDuration.toString(),
        job_title: data.title,
        job_description: data.description || '',
        company_id: data.company_id,
        industry_id: data.industry_id.toString(),
        gender: data.gender || '',
        soldier_status: isFemale ? 'NS' : (data.soldier_status || ''),
        degree: data.degree || '',
        salary: data.salary || '',
        job_type: data.job_type || ''
      };

      console.log('داده‌های سفارش ارسالی:', orderData);

      // اگر تابع onSubmit سفارشی ارسال شده، از آن استفاده کنیم
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
              router.push(result.redirectUrl);
            }, 2000);
          }
        }
      } else {
        // استفاده از endpoint جدید برای ایجاد سفارش آگهی
        const orderResponse = await apiPost('/orders/subscriptions/new-job/', orderData);
        const orderResult = orderResponse.data as NewJobOrderResponse;

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
      console.error('خطا در ثبت آگهی:', err);
      
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
  const stepLabels = ['اطلاعات آگهی', 'انتخاب اشتراک', 'پرداخت'];

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

  // تابع validation برای فیلدهای ضروری
  const validateRequiredFields = (): boolean => {
    const data = watch();
    const newErrors: string[] = [];

    if (!data.company_id) {
      newErrors.push('لطفاً شرکت را انتخاب کنید');
    }

    if (!data.title || !data.title.trim()) {
      newErrors.push('لطفاً عنوان شغل را وارد کنید');
    }

    if (!data.province_id || data.province_id === 0) {
      newErrors.push('لطفاً استان محل فعالیت را انتخاب کنید');
    }

    if (!data.city_id || data.city_id === 0) {
      newErrors.push('لطفاً شهر محل فعالیت را انتخاب کنید');
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
    if (currentStep === FormStep.JOB_DETAILS) {
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
      setCurrentStep(FormStep.JOB_DETAILS);
      // اسکرول به بالای صفحه
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

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
                  color: EMPLOYER_THEME.primary,
                  transform: 'translateY(-2px)'
                } 
              } as any)
            }
            <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              color: EMPLOYER_THEME.primary,
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
              color: alpha(EMPLOYER_THEME.primary, 0.7),
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
              color: EMPLOYER_THEME.primary,
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
              backgroundColor: alpha(EMPLOYER_THEME.primary, 0.1),
              borderRadius: 1.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: `linear-gradient(90deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
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
              برای نهایی کردن ثبت آگهی، طرح اشتراک و مدت زمان مورد نظر خود را انتخاب کنید.
            </Box>
          </Alert>
        )}


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
            <AlertTitle>{isEditMode ? 'خطا در ویرایش آگهی' : 'خطا در ثبت آگهی'}</AlertTitle>
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
          {successMessage}
        </Alert>
      )}

      {/* محتوای مراحل مختلف */}
      {currentStep === FormStep.JOB_DETAILS && (
        <Box>
          {/* فیلدهای اجباری */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                color: EMPLOYER_THEME.primary,
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                fontWeight: 700,
                lineHeight: { xs: 1.2, sm: 1.3 },
                textShadow: '0 1px 2px rgba(66, 133, 244, 0.1)',
                mb: { xs: 1.5, sm: 2, md: 3 }
              }}
            >
              اطلاعات ضروری آگهی
            </Typography>

            {/* اگر هیچ شرکت تایید شده‌ای نباشد */}
            {companies.length === 0 && !dataLoading && (
              <Alert 
                severity="warning" 
                icon={<InfoIcon />}
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                  هیچ شرکت تایید شده‌ای برای ثبت آگهی وجود ندارد
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  برای ثبت آگهی شغلی، ابتدا باید شرکت خود را ثبت کرده و منتظر تایید مدیر سیستم باشید.
                </Typography>
              </Alert>
            )}

            {/* اطلاعات عمومی */}
            {companies.length > 0 && (
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    width: '100%'
                  },
                  '& .MuiAlert-icon': {
                    display: { xs: 'none', sm: 'flex' }
                  }
                }}
              >
                <Box>
                  شهر و گروه کاری به صورت خودکار از اطلاعات شرکت انتخاب می‌شوند.
                </Box>
              </Alert>
            )}

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1.5, sm: 3 },
            opacity: companies.length === 0 ? 0.5 : 1,
            pointerEvents: companies.length === 0 ? 'none' : 'auto'
          }}>
            {/* ردیف اول: شرکت و عنوان شغل */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
              {/* انتخاب شرکت */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    mb: { xs: 0.5, sm: 1 },
                    color: EMPLOYER_THEME.primary,
                    fontWeight: 600
                  }}>
                    شرکت <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                </Box>
                              <Controller
                name="company_id"
                control={control}
                rules={{ required: 'انتخاب شرکت الزامی است' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(formErrors.company_id)}>
                    <Select
                      {...field}
                      displayEmpty
                      input={<OutlinedInput sx={selectStyles} />}
                      renderValue={() => {
                        const selectedCompany = companies.find(c => c.id === field.value);
                        return (
                          <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            {selectedCompany ? selectedCompany.name : 'انتخاب شرکت'}
                          </Box>
                        );
                      }}
                      MenuProps={menuPropsRTL}
                      startAdornment={
                        <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                          <BusinessIcon fontSize="small" sx={{ color: employerColors.primary }} />
                        </InputAdornment>
                      }
                      IconComponent={(props: any) => (
                        <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                      )}
                    >
                      <MenuItem value="" disabled>
                        {companies.length === 0 ? 'هیچ شرکت تایید شده‌ای وجود ندارد' : 'انتخاب شرکت'}
                      </MenuItem>
                      {companies.length === 0 ? (
                        <MenuItem disabled value="">
                          <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                            <Typography variant="body2">
                              برای ثبت آگهی، ابتدا باید شرکت خود را ثبت و تایید کنید
                            </Typography>
                          </Box>
                        </MenuItem>
                      ) : (
                        companies.map((company) => (
                          <MenuItem key={company.id} value={company.id}>
                            {company.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {formErrors.company_id && (
                      <FormHelperText>{formErrors.company_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              </Box>

              {/* عنوان شغل */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WorkIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    mb: { xs: 0.5, sm: 1 },
                    color: EMPLOYER_THEME.primary,
                    fontWeight: 600
                  }}>
                    عنوان شغل <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                </Box>
                <Controller
                  name="title"
                  control={control}
                  rules={{ 
                    required: 'عنوان شغل الزامی است', 
                    minLength: { value: 3, message: 'عنوان شغل باید حداقل 3 حرف باشد' } 
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="مثال: برنامه‌نویس React"
                      error={Boolean(formErrors.title)}
                      helperText={formErrors.title?.message}
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
            </Box>

            {/* ردیف دوم: استان و شهر */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
              {/* استان */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    mb: { xs: 0.5, sm: 1 },
                    color: EMPLOYER_THEME.primary,
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
                            <LocationOnIcon fontSize="small" sx={{ color: employerColors.primary }} />
                          </InputAdornment>
                        }
                        IconComponent={(props: any) => (
                          <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                        )}
                        disabled={Boolean(selectedCompany && selectedCompany.location?.province)}
                      >
                        <MenuItem value={0} disabled>
                          انتخاب استان
                        </MenuItem>
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
                  <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    mb: { xs: 0.5, sm: 1 },
                    color: EMPLOYER_THEME.primary,
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
                            <LocationOnIcon fontSize="small" sx={{ color: employerColors.primary }} />
                          </InputAdornment>
                        }
                        IconComponent={(props: any) => (
                          <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                        )}
                        disabled={!selectedProvinceId || selectedProvinceId === 0 || Boolean(selectedCompany && selectedCompany.location)}
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

            {/* ردیف سوم: گروه کاری و زیرگروه کاری */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
              {/* گروه کاری */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    mb: { xs: 0.5, sm: 1 },
                    color: EMPLOYER_THEME.primary,
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
                            <CategoryIcon fontSize="small" sx={{ color: employerColors.primary }} />
                          </InputAdornment>
                        }
                        IconComponent={(props: any) => (
                          <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                        )}
                        disabled={Boolean(selectedCompany && selectedCompany.industry?.category)}
                      >
                        <MenuItem value={0} disabled>
                          انتخاب گروه کاری
                        </MenuItem>
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
                  <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    mb: { xs: 0.5, sm: 1 },
                    color: EMPLOYER_THEME.primary,
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
                            <CategoryIcon fontSize="small" sx={{ color: employerColors.primary }} />
                          </InputAdornment>
                        }
                        IconComponent={(props: any) => (
                          <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                        )}
                        disabled={!selectedIndustryCategoryId || selectedIndustryCategoryId === 0 || Boolean(selectedCompany && selectedCompany.industry)}
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
                

          </Box>
        </Box>

        {/* جزئیات بیشتر */}
        <Box sx={{ mb: 4 }}>
          {/* عنوان بخش */}
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              color: EMPLOYER_THEME.primary,
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
              fontWeight: 700,
              lineHeight: { xs: 1.2, sm: 1.3 },
              textShadow: '0 1px 2px rgba(66, 133, 244, 0.1)',
              mb: 3
            }}
          >
            جزئیات بیشتر
          </Typography>
          
          <Typography variant="body2" sx={{ 
            mb: { xs: 2, sm: 3 }, 
            color: 'text.secondary',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            lineHeight: { xs: 1.3, sm: 1.4 }
          }}>
            تکمیل این بخش‌ها باعث بهتر دیده شدن آگهی شما می‌شود.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 3 } }}>
              {/* ردیف اول: نوع قرارداد و حقوق */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                {/* نوع قرارداد */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ 
                    mb: { xs: 0.5, sm: 1 }, 
                    display: 'block', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: EMPLOYER_THEME.primary
                  }}>
                    نوع قرارداد
                  </FormLabel>
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
                            const selectedOption = jobTypeOptions.find(opt => opt.value === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {selectedOption ? selectedOption.label : 'انتخاب نوع قرارداد'}
                              </Box>
                            );
                          }}
                          MenuProps={menuPropsRTL}
                          startAdornment={
                            <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                              <WorkIcon fontSize="small" sx={{ color: employerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                          )}
                        >
                          <MenuItem value="">انتخاب نوع قرارداد</MenuItem>
                          {jobTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value} sx={{ direction: 'rtl', textAlign: 'right' }}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                {/* حقوق */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ 
                    mb: { xs: 0.5, sm: 1 }, 
                    display: 'block', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: EMPLOYER_THEME.primary
                  }}>
                    حقوق
                  </FormLabel>
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
                            const selectedOption = salaryOptions.find(opt => opt.value === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%', direction: 'ltr', textAlign: 'left' }}>
                                {selectedOption ? selectedOption.label : 'انتخاب محدوده حقوق'}
                              </Box>
                            );
                          }}
                          MenuProps={menuPropsRTL}
                          startAdornment={
                            <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                              <AttachMoneyIcon fontSize="small" sx={{ color: employerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                          )}
                        >
                          <MenuItem value="">انتخاب محدوده حقوق</MenuItem>
                          {salaryOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value} sx={{ direction: 'ltr', textAlign: 'left' }}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>

              {/* ردیف دوم: سابقه کار و جنسیت */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                {/* سابقه کار */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ 
                    mb: { xs: 0.5, sm: 1 }, 
                    display: 'block', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: EMPLOYER_THEME.primary
                  }}>
                    سابقه کار (سال)
                  </FormLabel>
                  <Controller
                    name="experience_years"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="مثال: ۲-۵ سال"
                        variant="outlined"
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9-]*'
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          // تبدیل اعداد انگلیسی به فارسی
                          const persianValue = value.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
                          field.onChange(persianValue);
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '6px',
                            minHeight: { xs: '40px', sm: '56px' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: EMPLOYER_THEME.primary
                            }
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.8rem', sm: '1rem' },
                            padding: { xs: '8px 14px', sm: '16.5px 14px' },
                            height: { xs: '24px', sm: '24px' }
                          }
                        }}
                      />
                    )}
                  />
                </Box>

                {/* جنسیت */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ 
                    mb: { xs: 0.5, sm: 1 }, 
                    display: 'block', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: EMPLOYER_THEME.primary
                  }}>
                    جنسیت
                  </FormLabel>
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
                              <PeopleIcon fontSize="small" sx={{ color: employerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                          )}
                        >
                          <MenuItem value="">انتخاب جنسیت</MenuItem>
                          {genderOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value} sx={{ direction: 'rtl', textAlign: 'right' }}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>

              {/* ردیف سوم: تحصیلات و وضعیت نظام وظیفه */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                {/* تحصیلات */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ 
                    mb: { xs: 0.5, sm: 1 }, 
                    display: 'block', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: EMPLOYER_THEME.primary
                  }}>
                    سطح تحصیلات
                  </FormLabel>
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
                            const selectedOption = degreeOptions.find(opt => opt.value === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {selectedOption ? selectedOption.label : 'انتخاب تحصیلات'}
                              </Box>
                            );
                          }}
                          MenuProps={menuPropsRTL}
                          startAdornment={
                            <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                              <SchoolIcon fontSize="small" sx={{ color: employerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                          )}
                        >
                          <MenuItem value="">انتخاب تحصیلات</MenuItem>
                          {degreeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value} sx={{ direction: 'rtl', textAlign: 'right' }}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                {/* وضعیت نظام وظیفه */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ 
                    mb: { xs: 0.5, sm: 1 }, 
                    display: 'block', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: EMPLOYER_THEME.primary
                  }}>
                    وضعیت نظام وظیفه
                  </FormLabel>
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
                            const selectedOption = soldierStatusOptions.find(opt => opt.value === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {selectedOption ? selectedOption.label : (isFemale ? 'مهم نیست' : 'وضعیت نظام وظیفه')}
                              </Box>
                            );
                          }}
                          MenuProps={menuPropsRTL}
                          startAdornment={
                            <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                              <PeopleIcon fontSize="small" sx={{ color: employerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: employerColors.primary }} />
                          )}
                        >
                          <MenuItem value="">
                            {isFemale ? 'مهم نیست' : 'وضعیت نظام وظیفه'}
                          </MenuItem>
                          {soldierStatusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value} sx={{ direction: 'rtl', textAlign: 'right' }}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>

              {/* ردیف چهارم: توضیحات تکمیلی */}
              <Box>
                <FormLabel sx={{ 
                  mb: { xs: 0.5, sm: 1 }, 
                  display: 'block', 
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  color: EMPLOYER_THEME.primary
                }}>
                  توضیحات تکمیلی
                </FormLabel>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="شرح وظایف، مهارت‌های مورد نیاز، مزایا و..."
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
                        }
                      }}
                    />
                  )}
                />
              </Box>

            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleNextStep}
              disabled={loading}
              sx={{
                backgroundColor: EMPLOYER_THEME.primary,
                color: 'white',
                borderRadius: 2,
                px: { xs: 4, sm: 6 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 200 },
                boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                '&:hover': {
                  backgroundColor: EMPLOYER_THEME.dark,
                  boxShadow: '0 6px 16px rgba(66, 133, 244, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                },
                transition: 'all 0.3s ease'
              }}
            >
              ادامه - انتخاب اشتراک
            </Button>
          </Box>
        </Box>
      )}

      {currentStep === FormStep.SUBSCRIPTION && (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <SubscriptionPlanSelector
            selectedPlan={selectedPlan}
            selectedDuration={selectedDuration}
            onPlanChange={setSelectedPlan}
            onDurationChange={setSelectedDuration}
            disabled={loading}
          />
          
          {/* دکمه‌های عمل */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleBackStep}
              disabled={loading}
              sx={{
                borderColor: EMPLOYER_THEME.primary,
                color: EMPLOYER_THEME.primary,
                borderRadius: 2,
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 150 },
                '&:hover': {
                  borderColor: EMPLOYER_THEME.dark,
                  color: EMPLOYER_THEME.dark,
                  backgroundColor: 'rgba(66, 133, 244, 0.05)'
                }
              }}
            >
              بازگشت
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !selectedPlan || companies.length === 0}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
              sx={{
                backgroundColor: EMPLOYER_THEME.primary,
                color: 'white',
                borderRadius: 2,
                px: { xs: 4, sm: 6 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 200 },
                boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                '&:hover': {
                  backgroundColor: EMPLOYER_THEME.dark,
                  boxShadow: '0 6px 16px rgba(66, 133, 244, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'در حال ثبت و هدایت به پرداخت...' : submitButtonText}
            </Button>
          </Box>
        </form>
      )}
    </Paper>
  );
} 