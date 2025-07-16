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
  FormHelperText,
  FormLabel,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

/**
 * تایپ شرکت برای TypeScript
 */
type Company = {
  id: string;
  name: string;
};

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
  city_id: number;
  industry: number;
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [expandedOptional, setExpandedOptional] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
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
      city_id: 0,
      industry: 0,
      job_type: '',
      salary: '',
      gender: '',
      degree: '',
      soldier_status: '',
      experience_years: ''
    }
  });

  // تبدیل constants به آرایه گزینه‌ها برای Select ها
  const jobTypeOptions = Object.entries(JOB_TYPE_CHOICES).map(([value, label]) => ({ value, label }));
  const genderOptions = [
    { value: '', label: 'فرقی ندارد' },
    ...Object.entries(GENDER_CHOICES).map(([value, label]) => ({ value, label }))
  ];
  const degreeOptions = [
    { value: '', label: 'فرقی ندارد' },
    ...Object.entries(DEGREE_CHOICES).map(([value, label]) => ({ value, label }))
  ];
  const soldierStatusOptions = [
    { value: '', label: 'فرقی ندارد' },
    ...Object.entries(SOLDIER_STATUS_CHOICES).map(([value, label]) => ({ value, label }))
  ];
  const salaryOptions = [
    { value: '', label: 'انتخاب محدوده حقوق' },
    ...Object.entries(SALARY_CHOICES).map(([value, label]) => ({ value, label }))
  ];

  // لود داده‌های مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesResponse, industriesResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/companies/'),
          apiGet('/industries/industries/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/')
        ]);
        setCompanies(companiesResponse.data as Company[]);
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

  // اگر داده اولیه وجود داشته باشد، فرم را پر کن
  useEffect(() => {
    if (initialData && isEditMode) {
      // تنظیم داده‌های فرم
      reset({
        company_id: initialData.company?.id || '',
        title: initialData.title || '',
        description: initialData.description || '',
        city_id: initialData.location?.id || 0,
        industry: initialData.industry?.id || 0,
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
        setExpandedOptional(true);
      }
    }
  }, [initialData, isEditMode, reset]);

  // گروه‌بندی شهرها بر اساس استان
  const groupedCities = React.useMemo(() => {
    if (!cities.length || !provinces.length) return [];

    return provinces.map(province => ({
      province,
      cities: cities.filter(city => city.province?.id === province.id)
    })).filter(group => group.cities.length > 0);
  }, [cities, provinces]);

  // تبدیل شهر به آبجکت برای Autocomplete
  const selectedCity = React.useMemo(() => {
    const cityId = watch('city_id');
    return cities.find(city => city.id === cityId) || null;
  }, [watch('city_id'), cities]);

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

    if (!data.city_id || data.city_id === 0) {
      setErrors(['لطفاً شهر محل فعالیت را انتخاب کنید']);
      setLoading(false);
      return;
    }

    if (!data.industry || data.industry === 0) {
      setErrors(['لطفاً صنعت مربوطه را انتخاب کنید']);
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
        industry_id: data.industry.toString(),
        gender: data.gender || '',
        soldier_status: data.soldier_status || '',
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
          
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);

          // هدایت به درگاه پرداخت
          setTimeout(() => {
            window.location.href = paymentData.url!;
          }, 2000);
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

  // عناوین مراحل
  const stepLabels = ['اطلاعات آگهی', 'انتخاب اشتراک', 'پرداخت'];

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

    if (!data.city_id || data.city_id === 0) {
      newErrors.push('لطفاً شهر محل فعالیت را انتخاب کنید');
    }

    if (!data.industry || data.industry === 0) {
      newErrors.push('لطفاً صنعت مربوطه را انتخاب کنید');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
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
      }
    }
  };

  // تابع برگشت به مرحله قبل
  const handleBackStep = () => {
    if (currentStep === FormStep.SUBSCRIPTION) {
      setCurrentStep(FormStep.JOB_DETAILS);
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

        {/* نوار پیشرفت */}
        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
          {stepLabels.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: currentStep === index ? 'bold' : 'medium'
                  },
                  '& .MuiStepIcon-root': {
                    color: currentStep >= index ? EMPLOYER_THEME.primary : 'grey.300',
                    '&.Mui-active': {
                      color: EMPLOYER_THEME.primary
                    },
                    '&.Mui-completed': {
                      color: EMPLOYER_THEME.primary
                    }
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {currentStep === FormStep.SUBSCRIPTION && (
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
              برای نهایی کردن ثبت آگهی، طرح اشتراک و مدت زمان مورد نظر خود را انتخاب کنید.
            </Box>
          </Alert>
        )}

        {currentStep === FormStep.JOB_DETAILS && (
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
              تنها انتخاب شرکت، عنوان شغل و شهر اجباری هستند. تکمیل سایر اطلاعات به بهتر دیده شدن آگهی کمک می‌کند.
            </Box>
          </Alert>
        )}
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
            <AlertTitle>{isEditMode ? 'خطا در ویرایش آگهی' : 'خطا در ثبت آگهی'}</AlertTitle>
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

      {/* محتوای مراحل مختلف */}
      {currentStep === FormStep.JOB_DETAILS && (
        <Box ref={formRef}>
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
              اطلاعات ضروری آگهی (اجباری)
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              این بخش‌ها برای ثبت آگهی الزامی هستند و باید تکمیل شوند.
            </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3
          }}>
            {/* انتخاب شرکت */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BusinessIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium">
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
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: EMPLOYER_THEME.primary
                          }
                        }
                      }}
                    >
                      <MenuItem value="" disabled>
                        انتخاب شرکت
                      </MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.company_id && (
                      <FormHelperText>{formErrors.company_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            {/* عنوان شغل */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WorkIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium">
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

            {/* شهر */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOnIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium">
                  شهر محل کار <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
              </Box>
              <Controller
                name="city_id"
                control={control}
                rules={{ 
                  validate: value => value !== 0 || 'انتخاب شهر الزامی است' 
                }}
                render={({ field: { onChange, value } }) => (
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

            {/* صنعت */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium">
                  صنعت <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
              </Box>
              <Controller
                name="industry"
                control={control}
                rules={{ 
                  validate: value => value !== 0 || 'انتخاب صنعت الزامی است' 
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(formErrors.industry)}>
                    <Select
                      {...field}
                      displayEmpty
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: EMPLOYER_THEME.primary
                          }
                        }
                      }}
                    >
                      <MenuItem value={0} disabled>
                        انتخاب صنعت
                      </MenuItem>
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
        </Box>

        {/* فیلدهای اختیاری */}
        <Accordion 
          expanded={expandedOptional} 
          onChange={(_, expanded) => setExpandedOptional(expanded)}
          elevation={0}
          sx={{
            border: '1px solid #f0f0f0',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
            mb: 4
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              '& .MuiAccordionSummary-content': { 
                alignItems: 'center', 
                gap: 1.5 
              },
              borderRadius: expandedOptional ? '12px 12px 0 0' : '12px',
              bgcolor: expandedOptional ? '#f8fafd' : 'transparent'
            }}
          >
            <CategoryIcon sx={{ color: EMPLOYER_THEME.primary, fontSize: 24 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: EMPLOYER_THEME.primary }}>
              جزئیات بیشتر (اختیاری)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              تکمیل این بخش‌ها باعث بهتر دیده شدن آگهی شما می‌شود.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* توضیحات */}
              <Box>
                <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
                  توضیحات شغل
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

              {/* ردیف اول: نوع قرارداد */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* نوع قرارداد */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
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
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: EMPLOYER_THEME.primary
                              }
                            }
                          }}
                        >
                          <MenuItem value="">انتخاب نوع قرارداد</MenuItem>
                          {jobTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>

              {/* ردیف دوم: حقوق و سابقه کار */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* حقوق */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
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
                          sx={{ 
                            borderRadius: 2,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: EMPLOYER_THEME.primary
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>انتخاب محدوده حقوق</em>
                          </MenuItem>
                          {salaryOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                {/* سابقه کار */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
                    سابقه کار (سال)
                  </FormLabel>
                  <Controller
                    name="experience_years"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="مثال: 2-5 سال"
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
              </Box>

              {/* ردیف سوم: جنسیت و تحصیلات */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* جنسیت */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
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
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: EMPLOYER_THEME.primary
                              }
                            }
                          }}
                        >
                          <MenuItem value="">انتخاب جنسیت</MenuItem>
                          {genderOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                {/* تحصیلات */}
                <Box sx={{ flex: 1 }}>
                  <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
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
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: EMPLOYER_THEME.primary
                              }
                            }
                          }}
                        >
                          <MenuItem value="">انتخاب تحصیلات</MenuItem>
                          {degreeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>

              {/* وضعیت نظام وظیفه */}
              <Box>
                <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
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
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: EMPLOYER_THEME.primary
                            }
                          }
                        }}
                      >
                        <MenuItem value="">انتخاب وضعیت نظام وظیفه</MenuItem>
                        {soldierStatusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

          {/* دکمه‌های عمل */}
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
                px: 6,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                minWidth: 200,
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
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                minWidth: 150,
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
              disabled={loading || !selectedPlan}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
              sx={{
                backgroundColor: EMPLOYER_THEME.primary,
                color: 'white',
                borderRadius: 2,
                px: 6,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                minWidth: 200,
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