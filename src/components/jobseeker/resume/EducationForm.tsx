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
  Divider,
  Chip,
  Card,
  CardContent
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
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import StarIcon from '@mui/icons-material/Star';
import { JOB_SEEKER_THEME } from '@/constants/colors';

// تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return num?.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d, 10)]) ?? '';
};

// تبدیل اعداد فارسی به انگلیسی برای ذخیره‌سازی
const convertPersianToEnglishNumbers = (value: string): string => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)));
};

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
  const [resumeId, setResumeId] = useState<number | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  
  // تنظیمات منو برای Select
  const menuProps = {
    PaperProps: {
      sx: {
        '& .MuiMenuItem-root': {
          fontSize: '0.875rem',
          padding: '8px 16px'
        }
      }
    }
  };

  // تابع تبدیل مدرک تحصیلی به فارسی
  const getDegreeText = (degree: string): string => {
    const degreeMap: { [key: string]: string } = {
      'Diploma': 'دیپلم',
      'Associate': 'کاردانی',
      'Bachelor': 'کارشناسی',
      'Master': 'کارشناسی ارشد',
      'Doctorate': 'دکتری'
    };
    return degreeMap[degree] || degree;
  };

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
      start_year: undefined,
      end_year: undefined,
      grade: '',
      description: '',
      is_current: false
    }
  });

  // نظارت بر تغییرات وضعیت تحصیل فعلی
  const isCurrent = watch('is_current');
  
  // مقادیر ثابت برای درجات تحصیلی
  // مطابق مدل بک‌اند: Diploma, Associate, Bachelor, Master, Doctorate
  const degreeOptions = [
    { value: 'Diploma', label: 'دیپلم' },
    { value: 'Associate', label: 'کاردانی' },
    { value: 'Bachelor', label: 'کارشناسی' },
    { value: 'Master', label: 'کارشناسی ارشد' },
    { value: 'Doctorate', label: 'دکتری' }
  ];

  // تایپ داده‌های دریافتی از بک‌اند
  type ApiEducation = {
    id?: number;
    school: string;
    degree: string;
    field_of_study: string;
    grade?: string | null;
    start_date: string; // YYYY-MM-DD
    end_date?: string | null; // YYYY-MM-DD | null
    description?: string | null;
  };

  // تبدیل از API به مدل UI (سال‌های عددی + is_current)
  const mapApiToUi = (e: ApiEducation): Education => {
    const startYear = e.start_date ? parseInt(e.start_date.slice(0, 4), 10) : new Date().getFullYear();
    const endYear = e.end_date ? parseInt(e.end_date.slice(0, 4), 10) : undefined;
    return {
      id: e.id,
      degree: e.degree,
      field_of_study: e.field_of_study,
      institution: e.school,
      start_year: startYear,
      end_year: endYear,
      grade: e.grade ?? '',
      description: e.description ?? '',
      is_current: !e.end_date
    };
  };

  // تبدیل از مدل UI به Payload بک‌اند (تاریخ‌ها به YYYY-01-01)
  const mapUiToPayload = (data: EducationFormInputs) => ({
    school: data.institution,
    degree: data.degree,
    field_of_study: data.field_of_study,
    grade: data.grade || '',
    description: data.description || '',
    start_date: `${data.start_year}-01-01`,
    end_date: data.is_current ? null : (data.end_year ? `${data.end_year}-01-01` : null)
  });

  // لود تحصیلات
  useEffect(() => {
    const fetchEducations = async () => {
      setDataLoading(true);
      try {
        const [resumesRes, educationsRes] = await Promise.all([
          apiGet('/resumes/resumes/'),
          apiGet('/resumes/educations/')
        ]);

        const resumes = Array.isArray(resumesRes.data) ? resumesRes.data : [];
        const resume = resumes.length > 0 ? resumes[0] : null;
        setResumeId(resume ? resume.id : null);

        const apiList = (educationsRes.data as ApiEducation[]) || [];
        const mapped = apiList.map(mapApiToUi);
        setEducations(mapped);
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
      // بررسی تعداد تحصیلات
      if (!editingId && educations.length >= 5) {
        setLoading(false);
        setErrors(['حداکثر تعداد تحصیلات (۵ مورد) ثبت شده است.']);
        return;
      }

      const payload = mapUiToPayload(data);

      // ایجاد یا ویرایش
      if (editingId) {
        const response = await apiPut(`/resumes/educations/${editingId}/`, payload);
        const mapped = mapApiToUi(response.data as ApiEducation);
        setEducations(prev => prev.map(edu => (edu.id === editingId ? mapped : edu)));
      } else {
        if (!resumeId) {
          setErrors(['شناسه رزومه یافت نشد. لطفاً ابتدا اطلاعات شخصی را تکمیل کنید.']);
          setLoading(false);
          return;
        }
        const response = await apiPost('/resumes/educations/', { ...payload, resume_id: resumeId });
        const mapped = mapApiToUi(response.data as ApiEducation);
        setEducations(prev => [...prev, mapped]);
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
    
    // اسکرول به فرم
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // تابع ریست فرم
  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    reset({
      degree: '',
      field_of_study: '',
      institution: '',
      start_year: undefined,
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm || educations.length >= 5}
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
              افزودن تحصیلات
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
              اطلاعات تحصیلی خود را وارد کنید تا کارفرمایان بتوانند سطح تحصیلات شما را بررسی کنند.
                              {educations.length >= 5 && (
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: '#d32f2f' }}>
                        شما حداکثر تعداد تحصیلات (۵ مورد) را ثبت کرده‌اید. برای افزودن تحصیلات جدید، ابتدا یکی از تحصیلات موجود را حذف کنید.
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
          تحصیلات با موفقیت به‌روزرسانی شد.
        </Alert>
      )}

      {/* فرم افزودن/ویرایش تحصیلات */}
      {showAddForm && (
        <Box sx={{ mb: 4 }}>
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

            {/* نام موسسه و معدل */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
              {/* نام موسسه */}
              <Box sx={{ flex: 1 }}>
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
                      fullWidth
                      type="text"
                      placeholder="مثال: ۱۴۰۰"
                      value={field.value ? convertToPersianNumbers(field.value) : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const eng = convertPersianToEnglishNumbers(raw).replace(/[^0-9]/g, '');
                        const limited = eng.slice(0, 4);
                        const num = limited ? parseInt(limited, 10) : '';
                        field.onChange(num === '' ? '' : num);
                      }}
                      inputMode="numeric"
                      error={Boolean(formErrors.start_year)}
                      helperText={formErrors.start_year?.message}
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
                    سال پایان {!watch('is_current') && '*'}
                  </Typography>
                </Box>
                <Controller
                  name="end_year"
                  control={control}
                  rules={{ 
                    required: !watch('is_current') ? 'سال پایان الزامی است' : false,
                    min: { value: watch('start_year'), message: 'سال پایان باید بیشتر از سال شروع باشد' }
                  }}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="text"
                      placeholder="مثال: ۱۴۰۴"
                      disabled={watch('is_current')}
                      value={field.value ? convertToPersianNumbers(field.value) : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const eng = convertPersianToEnglishNumbers(raw).replace(/[^0-9]/g, '');
                        const limited = eng.slice(0, 4);
                        const num = limited ? parseInt(limited, 10) : '';
                        field.onChange(num === '' ? '' : num);
                      }}
                      inputMode="numeric"
                      error={Boolean(formErrors.end_year)}
                      helperText={formErrors.end_year?.message}
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
                    />
                  )}
                />
              </Box>
            </Box>

            {/* در حال تحصیل */}
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium" sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.1, sm: 1.3 },
                  color: jobseekerColors.primary,
                  fontWeight: 600
                }}>
                  در حال تحصیل
                </Typography>
              </Box>
              <Controller
                name="is_current"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        accentColor: jobseekerColors.primary
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                      این تحصیلات هنوز تمام نشده است
                    </Typography>
                  </Box>
                )}
              />
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
                  justifyContent: 'center',
                  order: { xs: 1, sm: 2 }
                }}
              >
                {loading ? '...' : 'ذخیره تغییرات'}
              </Button>
            </Box>
          </form>
        </Box>
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
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 3
          }}>
                        {educations.map((education, index) => (
            <Paper 
              key={education.id || index} 
              elevation={0} 
                                sx={{ 
                    border: `1px solid ${alpha(jobseekerColors.primary, 0.2)}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'transparent',
                    boxShadow: 'none'
                  }}
            >
              {/* Header Section */}
              <Box sx={{ 
                background: 'transparent',
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
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      mb: 0.25,
                      color: jobseekerColors.primary,
                      fontSize: '1.1rem'
                    }}>
                      {education.field_of_study}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 0.75,
                      color: 'text.primary',
                      fontSize: '0.95rem'
                    }}>
                      {education.institution}
                    </Typography>
                    
                    {/* Chips Section */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                      <Chip 
                        label={getDegreeText(education.degree)}
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
                      {education.is_current && (
                        <Chip 
                          label="در حال تحصیل"
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
                      {education.grade && (
                        <Chip 
                          label={`معدل: ${convertToPersianNumbers(education.grade || '')}`}
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
                    </Box>

                    {/* Date Section */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.75,
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      mb: education.description ? 0.75 : 0
                    }}>
                      <SchoolIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        سال شروع: {convertToPersianNumbers(education.start_year || '')} 
                        {education.is_current ? ' - در حال تحصیل' : ` - سال پایان: ${convertToPersianNumbers(education.end_year || '')}`}
                      </Typography>
                    </Box>

                    {/* Description Section */}
                    {education.description && (
                      <Box sx={{ mt: 0.75 }}>
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
                          {education.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Desktop Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, ml: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(education)}
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
                      onClick={() => handleDelete(education.id!)}
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
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    mb: 0.25,
                    color: jobseekerColors.primary,
                    fontSize: '0.95rem'
                  }}>
                    {education.field_of_study}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 0.75,
                    color: 'text.primary',
                    fontSize: '0.85rem'
                  }}>
                    {education.institution}
                  </Typography>
                  
                  {/* Chips Section */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                    <Chip 
                      label={getDegreeText(education.degree)}
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
                    {education.is_current && (
                      <Chip 
                        label="در حال تحصیل"
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
                    {education.grade && (
                      <Chip 
                        label={`معدل: ${convertToPersianNumbers(education.grade || '')}`}
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
                  </Box>

                  {/* Date Section */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.75,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    mb: education.description ? 0.75 : 0
                  }}>
                    <SchoolIcon sx={{ fontSize: 14, color: jobseekerColors.primary }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      سال شروع: {convertToPersianNumbers(education.start_year || '')} 
                      {education.is_current ? ' - در حال تحصیل' : ` - سال پایان: ${convertToPersianNumbers(education.end_year || '')}`}
                    </Typography>
                  </Box>

                  {/* Description Section */}
                  {education.description && (
                    <Box sx={{ mt: 0.75 }}>
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
                        {education.description}
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
                      onClick={() => handleEdit(education)}
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
                      onClick={() => handleDelete(education.id!)}
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

              {/* Description Section - removed from here */}
            </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}

