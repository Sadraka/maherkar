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
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { JOB_SEEKER_THEME } from '@/constants/colors';

/**
 * تایپ تحصیلات برای TypeScript
 */
type Education = {
  id?: number;
  degree: string;
  field_of_study: string;
  institution: string;
  start_year: number;
  end_year?: number;
  grade?: string;
  description?: string;
  is_current: boolean;
};

/**
 * ورودی‌های فرم تحصیلات
 */
interface EducationFormInputs {
  degree: string;
  field_of_study: string;
  institution: string;
  start_year: number;
  end_year?: number;
  grade?: string;
  description?: string;
  is_current: boolean;
}

/**
 * کامپوننت فرم تحصیلات کارجو
 */
export default function EducationForm() {
  const router = useRouter();
  const theme = useTheme();
  const jobseekerColors = JOB_SEEKER_THEME;
  const [educations, setEducations] = useState<Education[]>([]);
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
  } = useForm<EducationFormInputs>({
    defaultValues: {
      degree: '',
      field_of_study: '',
      institution: '',
      start_year: new Date().getFullYear(),
      end_year: undefined,
      grade: '',
      description: '',
      is_current: false
    }
  });

  // نظارت بر تغییرات وضعیت تحصیل فعلی
  const isCurrent = watch('is_current');
  
  // مقادیر ثابت برای درجات تحصیلی
  const degreeOptions = [
    { value: 'دیپلم', label: 'دیپلم' },
    { value: 'کاردانی', label: 'کاردانی' },
    { value: 'کارشناسی', label: 'کارشناسی' },
    { value: 'کارشناسی ارشد', label: 'کارشناسی ارشد' },
    { value: 'دکتری', label: 'دکتری' }
  ];

  // لود تحصیلات
  useEffect(() => {
    const fetchEducations = async () => {
      setDataLoading(true);
      try {
        const response = await apiGet('/resumes/educations/');
        setEducations(response.data as Education[]);
      } catch (err) {
        console.error('خطا در دریافت تحصیلات:', err);
        setErrors(['خطا در دریافت تحصیلات. لطفاً دوباره تلاش کنید.']);
      } finally {
        setDataLoading(false);
      }
    };

    fetchEducations();
  }, []);

  // تابع ذخیره تحصیلات
  const onSubmit: SubmitHandler<EducationFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    try {
      const educationData = {
        ...data,
        end_year: data.is_current ? null : data.end_year
      };

      let response: any;
      if (editingId) {
        response = await apiPut(`/resumes/educations/${editingId}/`, educationData);
        setEducations(prev => prev.map(edu => 
          edu.id === editingId ? response.data as Education : edu
        ));
      } else {
        response = await apiPost('/resumes/educations/', educationData);
        setEducations(prev => [...prev, response.data as Education]);
      }

      setSuccess(true);
      resetForm();
      
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
    } catch (err: any) {
      console.error('خطا در ثبت تحصیلات:', err);
      
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

  // تابع حذف تحصیلات
  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این تحصیلات اطمینان دارید؟')) return;
    
    try {
      await apiDelete(`/resumes/educations/${id}/`);
      setEducations(prev => prev.filter(edu => edu.id !== id));
      setSuccess(true);
    } catch (err) {
      console.error('خطا در حذف تحصیلات:', err);
      setErrors(['خطا در حذف تحصیلات. لطفاً دوباره تلاش کنید.']);
    }
  };

  // تابع شروع ویرایش
  const handleEdit = (education: Education) => {
    setEditingId(education.id || null);
    setShowAddForm(true);
    reset({
      degree: education.degree,
      field_of_study: education.field_of_study,
      institution: education.institution,
      start_year: education.start_year,
      end_year: education.end_year,
      grade: education.grade || '',
      description: education.description || '',
      is_current: education.is_current
    });
  };

  // تابع ریست فرم
  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    reset({
      degree: '',
      field_of_study: '',
      institution: '',
      start_year: new Date().getFullYear(),
      end_year: undefined,
      grade: '',
      description: '',
      is_current: false
    });
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
          <SchoolIcon sx={{ 
            fontSize: { xs: 32, md: 42 }, 
            color: jobseekerColors.primary,
            transform: 'translateY(-2px)'
          }} />
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            color: jobseekerColors.primary,
            lineHeight: { xs: 1.3, sm: 1.4 }
          }}>
            تحصیلات
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
            اطلاعات تحصیلی خود را وارد کنید تا کارفرمایان بتوانند سطح تحصیلات شما را بررسی کنند.
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
          تحصیلات با موفقیت به‌روزرسانی شد.
        </Alert>
      )}

      {/* لیست تحصیلات موجود */}
      {educations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            color: jobseekerColors.primary,
            fontWeight: 'bold'
          }}>
            تحصیلات شما
          </Typography>
          
          {educations.map((education, index) => (
            <Card key={education.id || index} sx={{ 
              mb: 2, 
              border: `1px solid ${alpha(jobseekerColors.primary, 0.2)}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ 
                      color: jobseekerColors.primary, 
                      fontWeight: 'bold',
                      mb: 1
                    }}>
                      {education.degree} - {education.field_of_study}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {education.institution}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {education.start_year} - {education.is_current ? 'در حال تحصیل' : education.end_year}
                    </Typography>
                    {education.grade && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        معدل: {education.grade}
                      </Typography>
                    )}
                    {education.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {education.description}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleEdit(education)}
                      sx={{ color: jobseekerColors.primary }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(education.id!)}
                      sx={{ color: jobseekerColors.red }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* دکمه افزودن تحصیلات جدید */}
      {!showAddForm && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            sx={{
              borderColor: jobseekerColors.primary,
              color: jobseekerColors.primary,
              '&:hover': {
                borderColor: jobseekerColors.dark,
                backgroundColor: alpha(jobseekerColors.primary, 0.05)
              }
            }}
          >
            افزودن تحصیلات جدید
          </Button>
        </Box>
      )}

      {/* فرم افزودن/ویرایش تحصیلات */}
      {showAddForm && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" sx={{ 
            mb: 3, 
            color: jobseekerColors.primary,
            fontWeight: 'bold'
          }}>
            {editingId ? 'ویرایش تحصیلات' : 'افزودن تحصیلات جدید'}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* مدرک تحصیلی و رشته تحصیلی */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
              {/* مدرک تحصیلی */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    مدرک تحصیلی *
                  </Typography>
                </Box>
                <Controller
                  name="degree"
                  control={control}
                  rules={{ required: 'مدرک تحصیلی الزامی است' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(formErrors.degree)}>
                      <Select
                        {...field}
                        displayEmpty
                        input={<OutlinedInput sx={selectStyles} />}
                        renderValue={() => {
                          const selectedDegree = degreeOptions.find(d => d.value === field.value);
                          return (
                            <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                              {selectedDegree ? selectedDegree.label : 'انتخاب مدرک تحصیلی'}
                            </Box>
                          );
                        }}
                        MenuProps={menuPropsRTL}
                        IconComponent={(props: any) => (
                          <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                        )}
                      >
                        <MenuItem value="" disabled>انتخاب مدرک تحصیلی</MenuItem>
                        {degreeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.degree && (
                        <FormHelperText>{formErrors.degree.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>

              {/* رشته تحصیلی */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    رشته تحصیلی *
                  </Typography>
                </Box>
                <Controller
                  name="field_of_study"
                  control={control}
                  rules={{ required: 'رشته تحصیلی الزامی است' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="مثال: مهندسی کامپیوتر"
                      error={Boolean(formErrors.field_of_study)}
                      helperText={formErrors.field_of_study?.message}
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

            {/* نام موسسه */}
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  color: jobseekerColors.primary,
                  fontWeight: 600
                }}>
                  نام دانشگاه/موسسه *
                </Typography>
              </Box>
              <Controller
                name="institution"
                control={control}
                rules={{ required: 'نام دانشگاه/موسسه الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="مثال: دانشگاه تهران"
                    error={Boolean(formErrors.institution)}
                    helperText={formErrors.institution?.message}
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

            {/* سال شروع و پایان */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
              {/* سال شروع */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    سال شروع *
                  </Typography>
                </Box>
                <Controller
                  name="start_year"
                  control={control}
                  rules={{ 
                    required: 'سال شروع الزامی است',
                    min: { value: 1300, message: 'سال شروع باید بیشتر از ۱۳۰۰ باشد' },
                    max: { value: new Date().getFullYear(), message: 'سال شروع نمی‌تواند در آینده باشد' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      placeholder="مثال: ۱۴۰۰"
                      error={Boolean(formErrors.start_year)}
                      helperText={formErrors.start_year?.message}
                      variant="outlined"
                      inputProps={{ min: 1300, max: new Date().getFullYear() }}
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
                    />
                  )}
                />
              </Box>

              {/* سال پایان */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    سال پایان {!isCurrent && '*'}
                  </Typography>
                </Box>
                <Controller
                  name="end_year"
                  control={control}
                  rules={{ 
                    required: !isCurrent ? 'سال پایان الزامی است' : false,
                    min: { value: watch('start_year'), message: 'سال پایان باید بیشتر از سال شروع باشد' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      placeholder="مثال: ۱۴۰۴"
                      disabled={isCurrent}
                      error={Boolean(formErrors.end_year)}
                      helperText={formErrors.end_year?.message}
                      variant="outlined"
                      inputProps={{ min: watch('start_year'), max: new Date().getFullYear() + 10 }}
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
                    />
                  )}
                />
              </Box>
            </Box>

            {/* معدل و توضیحات */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
              {/* معدل */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    معدل (اختیاری)
                  </Typography>
                </Box>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="مثال: ۱۸.۵ از ۲۰"
                      error={Boolean(formErrors.grade)}
                      helperText={formErrors.grade?.message}
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

            {/* توضیحات */}
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InfoIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  color: jobseekerColors.primary,
                  fontWeight: 600
                }}>
                  توضیحات (اختیاری)
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
                    rows={3}
                    placeholder="توضیحات اضافی درباره تحصیلات، پروژه‌ها، افتخارات و..."
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

            {/* دکمه‌های عملیات */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: { xs: 'center', sm: 'flex-end' },
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                type="button"
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={resetForm}
                sx={{
                  borderColor: theme.palette.grey[400],
                  color: theme.palette.grey[600],
                  '&:hover': {
                    borderColor: theme.palette.grey[600],
                    backgroundColor: alpha(theme.palette.grey[400], 0.05)
                  },
                  order: { xs: 2, sm: 1 }
                }}
              >
                انصراف
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ 
                  bgcolor: jobseekerColors.primary,
                  px: { xs: 4, md: 6 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  '&:hover': { bgcolor: jobseekerColors.dark },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 'medium',
                  order: { xs: 1, sm: 2 }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ ml: 1 }} />
                    در حال ذخیره...
                  </>
                ) : (editingId ? 'به‌روزرسانی' : 'ذخیره')}
              </Button>
            </Box>
          </form>
        </Box>
      )}
    </Paper>
  );
}
