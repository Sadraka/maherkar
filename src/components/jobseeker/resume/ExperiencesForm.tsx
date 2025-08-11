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
  location_id: number;
  start_date: string;
  end_date: string;
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
  const [cities, setCities] = useState<City[]>([]);
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
      location_id: 0,
      start_date: '',
      end_date: '',
      description: '',
      is_current: false
    }
  });

  // نظارت بر تغییرات "شغل فعلی"
  const isCurrent = watch('is_current');

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
        const [experiencesResponse, citiesResponse] = await Promise.all([
          apiGet('/resumes/experiences/'),
          apiGet('/locations/cities/')
        ]);
        
        setExperiences(experiencesResponse.data as Experience[]);
        setCities(citiesResponse.data as City[]);
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
      const experienceData = {
        employment_type: data.employment_type,
        title: data.title,
        company: data.company,
        location_id: data.location_id || null,
        start_date: data.start_date,
        end_date: data.is_current ? null : data.end_date,
        description: data.description || '',
        is_current: data.is_current
      };

      if (editingId) {
        // ویرایش تجربه موجود
        const response = await apiPut(`/resumes/experiences/${editingId}/`, experienceData);
        setExperiences(prev => prev.map(exp => 
          exp.id === editingId ? response.data as Experience : exp
        ));
        setEditingId(null);
      } else {
        // اضافه کردن تجربه جدید
        const response = await apiPost('/resumes/experiences/', experienceData);
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
      location_id: experience.location?.id || 0,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
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
    <Box dir="rtl">
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: { xs: 2, md: 3 },
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
          mb: 3
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
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
              sx={{
                bgcolor: jobseekerColors.primary,
                '&:hover': { bgcolor: jobseekerColors.dark },
                borderRadius: 2,
                px: 3
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
              <AlertTitle>خطا در ثبت تجربه</AlertTitle>
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
            عملیات با موفقیت انجام شد.
          </Alert>
        )}
      </Paper>

      {/* فرم افزودن/ویرایش */}
      {showAddForm && (
        <Paper 
          ref={formRef}
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: { xs: 2, md: 3 },
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            mb: 3
          }}
        >
          <Typography variant="h6" component="h2" sx={{ 
            mb: 3, 
            color: jobseekerColors.primary,
            fontWeight: 600
          }}>
            {editingId ? 'ویرایش تجربه کاری' : 'افزودن تجربه کاری جدید'}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* عنوان شغل و شرکت */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
              {/* عنوان شغل */}
              <Box sx={{ flex: 1 }}>
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
            </Box>

            {/* نوع استخدام و شهر */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
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
                            <LocationOnIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                          </InputAdornment>
                        }
                        IconComponent={(props: any) => (
                          <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                        )}
                      >
                        <MenuItem value={0} disabled>انتخاب شهر</MenuItem>
                        {cities.map((city) => (
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
                        value={isCurrent ? '' : field.value}
                        onChange={isCurrent ? () => {} : field.onChange}
                        fullWidth
                        error={Boolean(formErrors.end_date)}
                        helperText={formErrors.end_date?.message}
                        placeholder={isCurrent ? 'تاریخ پایان (شغل فعلی)' : 'انتخاب تاریخ'}
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
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  bgcolor: jobseekerColors.primary,
                  '&:hover': { bgcolor: jobseekerColors.dark }
                }}
              >
                {loading ? 'در حال ذخیره...' : 'ذخیره'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {/* لیست تجربیات */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {experiences.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #f0f0f0'
            }}
          >
            <WorkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              هنوز تجربه کاری ثبت نشده
            </Typography>
            <Typography variant="body2" color="text.secondary">
              برای شروع، روی دکمه "افزودن تجربه" کلیک کنید.
            </Typography>
          </Paper>
        ) : (
          experiences.map((experience) => (
            <Card key={experience.id} elevation={0} sx={{ border: '1px solid #f0f0f0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {experience.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                      {experience.company}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={employmentTypeOptions.find(opt => opt.value === experience.employment_type)?.label || experience.employment_type}
                        size="small" 
                        sx={{ bgcolor: alpha(jobseekerColors.primary, 0.1) }}
                      />
                      {experience.location && (
                        <Chip 
                          label={experience.location.name}
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {experience.is_current && (
                        <Chip 
                          label="شغل فعلی"
                          size="small" 
                          color="success"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {experience.start_date} {experience.end_date ? `تا ${experience.end_date}` : '- تاکنون'}
                </Typography>

                {experience.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {experience.description}
                    </Typography>
                  </>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(experience)}
                  sx={{ color: jobseekerColors.primary }}
                >
                  ویرایش
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(experience.id!)}
                  color="error"
                >
                  حذف
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}
