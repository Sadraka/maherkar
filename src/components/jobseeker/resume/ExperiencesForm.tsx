'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/axios';
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
  OutlinedInput,
  MenuProps,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import WorkIcon from '@mui/icons-material/Work';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import JalaliDatePicker from '@/components/common/JalaliDatePicker';

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
};

// تابع تبدیل تاریخ میلادی به شمسی
const gregorianToJalali = (gy: number, gm: number, gd: number): [number, number, number] => {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = 0;
  
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  
  jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  
  let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  
  return [jy, jm, jd];
};

// تابع فرمت کردن تاریخ
const formatDate = (dateString: string) => {
  if (!dateString) return 'نامشخص';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'نامشخص';
    
    const [year, month, day] = gregorianToJalali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    
    return `${convertToPersianNumbers(year)}/${convertToPersianNumbers(month.toString().padStart(2, '0'))}/${convertToPersianNumbers(day.toString().padStart(2, '0'))}`;
  } catch (error) {
    return 'نامشخص';
  }
};

/**
 * تایپ استان برای TypeScript
 */
type Province = {
  id: number;
  name: string;
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
 * تایپ تجربه کاری
 */
interface Experience {
  id?: number;
  employment_type: string;
  title: string;
  company: string;
  location?: City;
  location_id?: number | null;
  start_date: string;
  end_date?: string | null;
  description?: string;
  is_current?: boolean;
}

/**
 * ورودی‌های فرم تجربه کاری
 */
interface ExperienceFormInputs {
  employment_type: string;
  title: string;
  company: string;
  province_id: number;
  location_id: number;
  start_date: string;
  end_date: string | null;
  description: string;
  is_current: boolean;
}

/**
 * کامپوننت فرم تجربیات کاری کارجو
 */
export default function ExperiencesForm() {
  const router = useRouter();
  const theme = useTheme();
  const jobseekerColors = JOB_SEEKER_THEME;
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors: formErrors },
    watch,
    setValue,
    reset
  } = useForm<ExperienceFormInputs>({
    defaultValues: {
      employment_type: '',
      title: '',
      company: '',
      province_id: 0,
      location_id: 0,
      start_date: '',
      end_date: null,
      description: '',
      is_current: false
    }
  });

  // نظارت بر تغییرات "شغل فعلی"، "استان" و "تاریخ شروع"
  const isCurrent = watch('is_current');
  const selectedProvinceId = watch('province_id');
  const startDate = watch('start_date');

  // تبدیل constants به آرایه گزینه‌ها برای Select ها
  const employmentTypeOptions = [
    { value: 'full_time', label: 'تمام وقت' },
    { value: 'part_time', label: 'پاره وقت' },
    { value: 'contractual', label: 'قراردادی' }
  ];

  // لود داده‌های مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [experiencesResponse, provincesResponse, citiesResponse, resumesResponse] = await Promise.all([
          apiGet('/resumes/experiences/'),
          apiGet('/locations/provinces/'),
          apiGet('/locations/cities/'),
          apiGet('/resumes/resumes/')
        ]);
        
        setExperiences(experiencesResponse.data as Experience[]);
        setProvinces(provincesResponse.data as Province[]);
        setCities(citiesResponse.data as City[]);
        const resumes = Array.isArray(resumesResponse.data) ? resumesResponse.data : [];
        if (resumes.length > 0) {
          setResumeId(resumes[0].id as number);
        } else {
          setResumeId(null);
        }
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setErrors(['خطا در دریافت اطلاعات مورد نیاز. لطفاً دوباره تلاش کنید.']);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit: SubmitHandler<ExperienceFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    try {
      // بررسی تعداد تجربیات
      if (!editingId && experiences.length >= 10) {
        setLoading(false);
        setErrors(['حداکثر تعداد تجربیات کاری (۱۰ مورد) ثبت شده است.']);
        return;
      }

      // اعتبارسنجی تاریخ ها: تاریخ پایان قبل از شروع نباشد
      if (!data.is_current && data.end_date && data.start_date) {
        const start = new Date(data.start_date as string).getTime();
        const end = new Date(data.end_date as string).getTime();
        if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
          setLoading(false);
          setErrors(['تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد']);
          return;
        }
      }

      const experienceData = {
        employment_type: data.employment_type,
        title: data.title,
        company: data.company,
        location_id: data.location_id || null,
        start_date: data.start_date,
        end_date: data.is_current ? null : (data.end_date || null),
        description: data.description || '',
        is_current: data.is_current
      };

      if (editingId) {
        // ویرایش تجربه موجود
        if (!resumeId) {
          setLoading(false);
          setErrors(['ابتدا رزومه خود را ایجاد کنید (شناسه رزومه یافت نشد).']);
          return;
        }
        const response = await apiPut(`/resumes/experiences/${editingId}/`, { ...experienceData, resume_id: resumeId });
        setExperiences(prev => prev.map(exp => 
          exp.id === editingId ? response.data as Experience : exp
        ));
        setEditingId(null);
        setShowAddForm(false);
      } else {
        // اضافه کردن تجربه جدید
        if (!resumeId) {
          setLoading(false);
          setErrors(['ابتدا رزومه خود را ایجاد کنید (شناسه رزومه یافت نشد).']);
          return;
        }
        const response = await apiPost('/resumes/experiences/', { ...experienceData, resume_id: resumeId });
        setExperiences(prev => [...prev, response.data as Experience]);
        setShowAddForm(false);
      }

      setSuccess(true);
      reset();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('خطا در ثبت تجربه:', err);
      
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
    } finally {
      setLoading(false);
    }
  };

    // شروع ویرایش تجربه
  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id || null);
    setShowAddForm(true);
            reset({
          employment_type: experience.employment_type,
          title: experience.title,
          company: experience.company,
          province_id: experience.location?.province?.id || 0,
          location_id: experience.location?.id || 0,
          start_date: experience.start_date,
          end_date: experience.end_date || null,
          description: experience.description || '',
          is_current: experience.is_current || false
        });
  };

  // حذف تجربه
  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این تجربه کاری اطمینان دارید؟')) return;

    try {
      await apiDelete(`/resumes/experiences/${id}/`);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('خطا در حذف تجربه:', err);
      setErrors(['خطا در حذف تجربه. لطفاً دوباره تلاش کنید.']);
    }
  };

  // لغو ویرایش
  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    reset();
    setErrors([]);
    // پاک کردن شهر انتخاب شده وقتی استان تغییر می‌کند
    setValue('location_id', 0);
    // پاک کردن تاریخ پایان
    setValue('end_date', null);
  };

  // حذف یک خطا از لیست خطاها
  const removeError = (index: number) => {
    setErrors(errors.filter((_, i) => i !== index));
  };

  // پاک کردن شهر وقتی استان تغییر می‌کند
  useEffect(() => {
    if (selectedProvinceId) {
      setValue('location_id', 0);
    }
  }, [selectedProvinceId, setValue]);

  // پاک کردن تاریخ پایان وقتی تاریخ شروع تغییر می‌کند
  useEffect(() => {
    if (startDate) {
      setValue('end_date', null);
    }
  }, [startDate, setValue]);

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
    <Box dir="rtl">
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: { xs: 2, md: 3 },
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}
      >
        <Box sx={{ 
          mb: { xs: 2, md: 3 }, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WorkIcon sx={{ 
                fontSize: { xs: 32, md: 42 }, 
                color: jobseekerColors.primary,
                transform: 'translateY(-2px)'
              }} />
              <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                color: jobseekerColors.primary,
                lineHeight: { xs: 1.3, sm: 1.4 }
              }}>
                تجربیات کاری
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm || experiences.length >= 10}
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
              افزودن تجربه
            </Button>
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
              ثبت تجربیات کاری شما به بهتر دیده شدن رزومه کمک می‌کند.
              {experiences.length >= 10 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: '#d32f2f' }}>
                   شما حداکثر تعداد تجربیات کاری (۱۰ مورد) را ثبت کرده‌اید. برای افزودن تجربه جدید، ابتدا یکی از تجربیات موجود را حذف کنید.
                </Typography>
              )}
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
            تجربه کاری با موفقیت به‌روزرسانی شد.
          </Alert>
        )}

        {/* فرم افزودن/ویرایش تجربه */}
        {showAddForm && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: jobseekerColors.primary,
              fontWeight: 'bold'
            }}>
              {editingId ? 'ویرایش تجربه کاری' : 'افزودن تجربه کاری جدید'}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* عنوان شغل */}
              <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WorkIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    عنوان شغل *
                  </Typography>
                </Box>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'عنوان شغل الزامی است' }}
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

              {/* نام شرکت و نوع استخدام */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
                {/* نام شرکت */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      color: jobseekerColors.primary,
                      fontWeight: 600
                    }}>
                      نام شرکت *
                    </Typography>
                  </Box>
                  <Controller
                    name="company"
                    control={control}
                    rules={{ required: 'نام شرکت الزامی است' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="نام شرکت یا سازمان"
                        error={Boolean(formErrors.company)}
                        helperText={formErrors.company?.message}
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

                {/* نوع استخدام */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WorkIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      color: jobseekerColors.primary,
                      fontWeight: 600
                    }}>
                      نوع استخدام *
                    </Typography>
                  </Box>
                  <Controller
                    name="employment_type"
                    control={control}
                    rules={{ required: 'نوع استخدام الزامی است' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(formErrors.employment_type)}>
                        <Select
                          {...field}
                          displayEmpty
                          input={<OutlinedInput sx={selectStyles} />}
                          renderValue={() => {
                            const selectedOption = employmentTypeOptions.find(opt => opt.value === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {selectedOption ? selectedOption.label : 'انتخاب نوع استخدام'}
                              </Box>
                            );
                          }}
                          MenuProps={menuPropsRTL}
                          startAdornment={
                            <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                              <WorkIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                            </InputAdornment>
                          }
                          IconComponent={(props: any) => (
                            <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                          )}
                        >
                          <MenuItem value="" disabled>انتخاب نوع استخدام</MenuItem>
                          {employmentTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.employment_type && (
                          <FormHelperText>{formErrors.employment_type.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>

              {/* استان و شهر */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
                {/* استان */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOnIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
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
                      color: jobseekerColors.primary,
                      fontWeight: 600
                    }}>
                      شهر
                    </Typography>
                  </Box>
                  <Controller
                    name="location_id"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(formErrors.location_id)}>
                        <Select
                          {...field}
                          displayEmpty
                          disabled={!selectedProvinceId}
                          input={<OutlinedInput sx={selectStyles} />}
                          renderValue={() => {
                            const selectedCity = cities.filter(c => !selectedProvinceId || c.province?.id === selectedProvinceId).find(c => c.id === field.value);
                            return (
                              <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {selectedCity ? selectedCity.name : 'انتخاب شهر'}
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
                          <MenuItem value={0} disabled>انتخاب شهر</MenuItem>
                          {cities.filter(c => !selectedProvinceId || c.province?.id === selectedProvinceId).map((city) => (
                            <MenuItem key={city.id} value={city.id}>
                              {city.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.location_id && (
                          <FormHelperText>{formErrors.location_id.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>



              {/* تاریخ شروع و پایان */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
                {/* تاریخ شروع */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      color: jobseekerColors.primary,
                      fontWeight: 600
                    }}>
                      تاریخ شروع *
                    </Typography>
                  </Box>
                  <Controller
                    name="start_date"
                    control={control}
                    rules={{ required: 'تاریخ شروع الزامی است' }}
                    render={({ field }) => (
                      <Box sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '6px',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: jobseekerColors.primary
                          }
                        }
                      }}>
                                               <JalaliDatePicker
                         value={field.value}
                         onChange={field.onChange}
                         fullWidth
                         error={Boolean(formErrors.start_date)}
                         helperText={formErrors.start_date?.message}
                         maxDate={watch('end_date') || undefined}
                       />
                      </Box>
                    )}
                  />
                </Box>

                {/* تاریخ پایان */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium" sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      color: jobseekerColors.primary,
                      fontWeight: 600
                    }}>
                      تاریخ پایان
                    </Typography>
                  </Box>
                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '6px',
                          opacity: isCurrent ? 0.5 : 1,
                          pointerEvents: isCurrent ? 'none' : 'auto',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: jobseekerColors.primary
                          }
                        }
                      }}>
                                               <JalaliDatePicker
                         value={isCurrent ? '' : (field.value || '')}
                         onChange={isCurrent ? () => {} : field.onChange}
                         fullWidth
                         error={Boolean(formErrors.end_date)}
                         helperText={formErrors.end_date?.message}
                         placeholder={isCurrent ? 'تاریخ پایان (شغل فعلی)' : 'انتخاب تاریخ'}
                         minDate={startDate || undefined}
                         disabled={isCurrent || !startDate}
                       />
                      </Box>
                    )}
                  />
                  
                  {/* چک باکس شغل فعلی */}
                  <Box sx={{ mt: 1 }}>
                    <Controller
                      name="is_current"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            style={{ 
                              accentColor: jobseekerColors.primary,
                              transform: 'scale(1.2)'
                            }}
                          />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            این شغل فعلی من است
                          </Typography>
                        </Box>
                      )}
                    />
                  </Box>
                </Box>
              </Box>

              {/* توضیحات */}
              <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    شرح وظایف
                  </Typography>
                </Box>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="شرح وظایف، مسئولیت‌ها و دستاوردهای شما در این شغل..."
                      error={Boolean(formErrors.description)}
                      helperText={formErrors.description?.message}
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

              {/* دکمه‌های عمل */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  sx={{
                    borderColor: jobseekerColors.primary,
                    color: jobseekerColors.primary,
                    '&:hover': {
                      borderColor: jobseekerColors.dark,
                      color: jobseekerColors.dark
                    }
                  }}
                >
                  لغو
                </Button>
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
          </Box>
        )}

        {/* لیست تجربیات */}
        {experiences.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              color: jobseekerColors.primary,
              fontWeight: 'bold'
            }}>
              تجربیات کاری شما
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mb: 3
            }}>
              {experiences.map((experience) => (
                <Paper 
                  key={experience.id} 
                  elevation={0} 
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: 'none'
                  }}
                >
                  {/* Header Section */}
                  <Box sx={{ 
                    background: '#ffffff',
                    p: { xs: 1.5, sm: 2 }
                  }}>
                    {/* Desktop Layout - Action buttons on the right */}
                    <Box sx={{ 
                      display: { xs: 'none', sm: 'flex' }, 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 1 
                    }}>
                      <Box sx={{ flex: 1 }}>
                        {/* خط اول: عنوان و شرکت */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'row',
                          alignItems: 'center', 
                          gap: 3, 
                          mb: 1 
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <WorkIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
                            <Typography variant="h5" sx={{ 
                              fontWeight: 700, 
                              color: jobseekerColors.primary,
                              fontSize: '1.1rem'
                            }}>
                              {experience.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <BusinessIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600, 
                              color: 'text.primary',
                              fontSize: '0.95rem'
                            }}>
                              {experience.company}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* خط دوم: chips و تاریخ */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 1.5, 
                          flexWrap: 'wrap' 
                        }}>
                          {/* Chips Section */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 0.75,
                            flexDirection: 'row'
                          }}>
                            <Chip 
                              label={employmentTypeOptions.find(opt => opt.value === experience.employment_type)?.label || experience.employment_type}
                              size="small"
                              sx={{ 
                                bgcolor: alpha(jobseekerColors.primary, 0.15),
                                color: jobseekerColors.primary,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '22px',
                                '& .MuiChip-label': {
                                  px: 1.25
                                }
                              }}
                            />
                            {experience.location && (
                              <Chip 
                                label={experience.location.name}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: alpha(jobseekerColors.primary, 0.3),
                                  color: jobseekerColors.primary,
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  height: '22px',
                                  '& .MuiChip-label': {
                                    px: 1.25
                                  }
                                }}
                              />
                            )}
                            {experience.is_current && (
                              <Chip 
                                label="شغل فعلی"
                                size="small"
                                color="success"
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: '22px',
                                  '& .MuiChip-label': {
                                    px: 1.25
                                  }
                                }}
                              />
                            )}
                          </Box>

                          {/* Date Section */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                          }}>
                            <CalendarTodayIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(experience.start_date)} 
                              {experience.end_date ? ` تا ${formatDate(experience.end_date)}` : ' تاکنون'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Description Section */}
                        {experience.description && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600,
                              color: jobseekerColors.primary,
                              mb: 0.25,
                              fontSize: '0.7rem'
                            }}>
                              توضیحات:
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              whiteSpace: 'pre-line',
                              lineHeight: 1.3,
                              color: 'text.secondary',
                              fontSize: '0.7rem'
                            }}>
                              {experience.description}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Desktop Action Buttons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, ml: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(experience)}
                          variant="outlined"
                          sx={{ 
                            borderColor: jobseekerColors.primary,
                            color: jobseekerColors.primary,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            px: 1.25,
                            py: 0.25,
                            minWidth: '65px',
                            height: '26px',
                            '&:hover': {
                              borderColor: jobseekerColors.dark,
                              backgroundColor: alpha(jobseekerColors.primary, 0.05)
                            }
                          }}
                        >
                          ویرایش
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(experience.id!)}
                          variant="outlined"
                          color="error"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            px: 1.25,
                            py: 0.25,
                            minWidth: '65px',
                            height: '26px',
                            '&:hover': {
                              backgroundColor: alpha('#f44336', 0.05)
                            }
                          }}
                        >
                          حذف
                        </Button>
                      </Box>
                    </Box>

                    {/* Mobile Layout - Action buttons below content */}
                    <Box sx={{ 
                      display: { xs: 'block', sm: 'none' }
                    }}>
                      {/* خط اول: عنوان و شرکت */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'flex-start', 
                        gap: 1, 
                        mb: 1 
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <WorkIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
                          <Typography variant="h5" sx={{ 
                            fontWeight: 700, 
                            color: jobseekerColors.primary,
                            fontSize: '0.95rem'
                          }}>
                            {experience.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <BusinessIcon sx={{ fontSize: 16, color: jobseekerColors.primary }} />
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            fontSize: '0.85rem'
                          }}>
                            {experience.company}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* خط دوم: chips و تاریخ */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 1, 
                        flexWrap: 'wrap' 
                      }}>
                        {/* Chips Section */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 0.75,
                          flexDirection: 'column'
                        }}>
                          <Chip 
                            label={employmentTypeOptions.find(opt => opt.value === experience.employment_type)?.label || experience.employment_type}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(jobseekerColors.primary, 0.15),
                              color: jobseekerColors.primary,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: '22px',
                              '& .MuiChip-label': {
                                px: 1.25
                              }
                            }}
                          />
                          {experience.location && (
                            <Chip 
                              label={experience.location.name}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: alpha(jobseekerColors.primary, 0.3),
                                color: jobseekerColors.primary,
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: '22px',
                                '& .MuiChip-label': {
                                  px: 1.25
                                }
                              }}
                            />
                          )}
                          {experience.is_current && (
                            <Chip 
                              label="شغل فعلی"
                              size="small"
                              color="success"
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '22px',
                                '& .MuiChip-label': {
                                  px: 1.25
                                }
                              }}
                            />
                          )}
                        </Box>

                        {/* Date Section */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.75,
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}>
                          <CalendarTodayIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(experience.start_date)} 
                            {experience.end_date ? ` تا ${formatDate(experience.end_date)}` : ' تاکنون'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Description Section */}
                      {experience.description && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: jobseekerColors.primary,
                            mb: 0.25,
                            fontSize: '0.7rem'
                          }}>
                            توضیحات:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.3,
                            color: 'text.secondary',
                            fontSize: '0.7rem'
                          }}>
                            {experience.description}
                          </Typography>
                        </Box>
                      )}

                      {/* Mobile Action Buttons - Below content */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        gap: 1, 
                        mt: 2,
                        justifyContent: 'flex-end'
                      }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(experience)}
                          variant="outlined"
                          sx={{ 
                            borderColor: jobseekerColors.primary,
                            color: jobseekerColors.primary,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            px: 1.25,
                            py: 0.25,
                            minWidth: '65px',
                            height: '26px',
                            '&:hover': {
                              borderColor: jobseekerColors.dark,
                              backgroundColor: alpha(jobseekerColors.primary, 0.05)
                            }
                          }}
                        >
                          ویرایش
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(experience.id!)}
                          variant="outlined"
                          color="error"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            px: 1.25,
                            py: 0.25,
                            minWidth: '65px',
                            height: '26px',
                            '&:hover': {
                              backgroundColor: alpha('#f44336', 0.05)
                            }
                          }}
                        >
                          حذف
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
