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
  Divider,
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import BuildIcon from '@mui/icons-material/Build';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StarIcon from '@mui/icons-material/Star';
import { JOB_SEEKER_THEME } from '@/constants/colors';

/**
 * تایپ مهارت برای TypeScript
 */
type Skill = {
  id?: number;
  name: string;
  level: string;
  description?: string;
};

/**
 * ورودی‌های فرم مهارت‌ها
 */
interface SkillFormInputs {
  name: string;
  level: string;
  description?: string;
}

/**
 * کامپوننت فرم مهارت‌های کارجو
 */
export default function SkillsForm() {
  const router = useRouter();
  const theme = useTheme();
  const jobseekerColors = JOB_SEEKER_THEME;
  const [skills, setSkills] = useState<Skill[]>([]);
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
    setValue,
    reset
  } = useForm<SkillFormInputs>({
    defaultValues: {
      name: '',
      level: '',
      description: ''
    }
  });

  // مقادیر ثابت برای سطح مهارت
  const skillLevelOptions = [
    { value: 'مبتدی', label: 'مبتدی', color: '#ff9800' },
    { value: 'متوسط', label: 'متوسط', color: '#2196f3' },
    { value: 'پیشرفته', label: 'پیشرفته', color: '#4caf50' },
    { value: 'خبره', label: 'خبره', color: '#9c27b0' }
  ];

  // لود مهارت‌ها
  useEffect(() => {
    const fetchSkills = async () => {
      setDataLoading(true);
      try {
        const response = await apiGet('/resumes/skills/');
        setSkills(response.data as Skill[]);
      } catch (err) {
        console.error('خطا در دریافت مهارت‌ها:', err);
        setErrors(['خطا در دریافت مهارت‌ها. لطفاً دوباره تلاش کنید.']);
      } finally {
        setDataLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // تابع ذخیره مهارت
  const onSubmit: SubmitHandler<SkillFormInputs> = async (data) => {
    setLoading(true);
    setErrors([]);

    try {
      let response;
      if (editingId) {
        response = await apiPut(`/resumes/skills/${editingId}/`, data);
        setSkills(prev => prev.map(skill => 
          skill.id === editingId ? response.data : skill
        ));
      } else {
        response = await apiPost('/resumes/skills/', data);
        setSkills(prev => [...prev, response.data]);
      }

      setSuccess(true);
      resetForm();
      
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
    } catch (err: any) {
      console.error('خطا در ثبت مهارت:', err);
      
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

  // تابع حذف مهارت
  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این مهارت اطمینان دارید؟')) return;
    
    try {
      await apiDelete(`/resumes/skills/${id}/`);
      setSkills(prev => prev.filter(skill => skill.id !== id));
      setSuccess(true);
    } catch (err) {
      console.error('خطا در حذف مهارت:', err);
      setErrors(['خطا در حذف مهارت. لطفاً دوباره تلاش کنید.']);
    }
  };

  // تابع شروع ویرایش
  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id || null);
    setShowAddForm(true);
    reset({
      name: skill.name,
      level: skill.level,
      description: skill.description || ''
    });
  };

  // تابع ریست فرم
  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    reset({
      name: '',
      level: '',
      description: ''
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

  // تابع دریافت رنگ بر اساس سطح مهارت
  const getLevelColor = (level: string) => {
    const option = skillLevelOptions.find(opt => opt.value === level);
    return option ? option.color : jobseekerColors.primary;
  };

  // تابع دریافت تعداد ستاره بر اساس سطح
  const getStarsCount = (level: string) => {
    switch(level) {
      case 'مبتدی': return 1;
      case 'متوسط': return 2;
      case 'پیشرفته': return 3;
      case 'خبره': return 4;
      default: return 0;
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
          <BuildIcon sx={{ 
            fontSize: { xs: 32, md: 42 }, 
            color: jobseekerColors.primary,
            transform: 'translateY(-2px)'
          }} />
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            color: jobseekerColors.primary,
            lineHeight: { xs: 1.3, sm: 1.4 }
          }}>
            مهارت‌ها
          </Typography>
        </Box>

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
            مهارت‌های خود را با سطح تسلط مشخص کنید تا کارفرمایان بتوانند قابلیت‌های شما را بهتر ارزیابی کنند.
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
          مهارت‌ها با موفقیت به‌روزرسانی شد.
        </Alert>
      )}

      {/* لیست مهارت‌های موجود */}
      {skills.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            color: jobseekerColors.primary,
            fontWeight: 'bold'
          }}>
            مهارت‌های شما
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2
          }}>
            {skills.map((skill, index) => (
              <Card key={skill.id || index} sx={{ 
                border: `1px solid ${alpha(jobseekerColors.primary, 0.2)}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        color: jobseekerColors.primary, 
                        fontWeight: 'bold',
                        mb: 1,
                        fontSize: '1rem'
                      }}>
                        {skill.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip 
                          label={skill.level}
                          size="small"
                          sx={{ 
                            backgroundColor: getLevelColor(skill.level),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {Array.from({ length: 4 }, (_, i) => (
                            <StarIcon 
                              key={i}
                              fontSize="small"
                              sx={{ 
                                color: i < getStarsCount(skill.level) ? getLevelColor(skill.level) : '#e0e0e0',
                                fontSize: '16px'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      {skill.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          fontSize: '0.875rem',
                          lineHeight: 1.4
                        }}>
                          {skill.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleEdit(skill)}
                        sx={{ color: jobseekerColors.primary }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleDelete(skill.id!)}
                        sx={{ color: jobseekerColors.red }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* دکمه افزودن مهارت جدید */}
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
            افزودن مهارت جدید
          </Button>
        </Box>
      )}

      {/* فرم افزودن/ویرایش مهارت */}
      {showAddForm && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" sx={{ 
            mb: 3, 
            color: jobseekerColors.primary,
            fontWeight: 'bold'
          }}>
            {editingId ? 'ویرایش مهارت' : 'افزودن مهارت جدید'}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* نام مهارت و سطح */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
              {/* نام مهارت */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BuildIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    نام مهارت *
                  </Typography>
                </Box>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'نام مهارت الزامی است' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="مثال: React.js، فتوشاپ، زبان انگلیسی"
                      error={Boolean(formErrors.name)}
                      helperText={formErrors.name?.message}
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

              {/* سطح مهارت */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.1, sm: 1.3 },
                    color: jobseekerColors.primary,
                    fontWeight: 600
                  }}>
                    سطح تسلط *
                  </Typography>
                </Box>
                <Controller
                  name="level"
                  control={control}
                  rules={{ required: 'سطح تسلط الزامی است' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(formErrors.level)}>
                      <Select
                        {...field}
                        displayEmpty
                        input={<OutlinedInput sx={selectStyles} />}
                        renderValue={() => {
                          const selectedLevel = skillLevelOptions.find(l => l.value === field.value);
                          return (
                            <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                              {selectedLevel ? selectedLevel.label : 'انتخاب سطح تسلط'}
                            </Box>
                          );
                        }}
                        MenuProps={menuPropsRTL}
                        IconComponent={(props: any) => (
                          <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                        )}
                      >
                        <MenuItem value="" disabled>انتخاب سطح تسلط</MenuItem>
                        {skillLevelOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={option.label}
                                size="small"
                                sx={{ 
                                  backgroundColor: option.color,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {Array.from({ length: 4 }, (_, i) => (
                                  <StarIcon 
                                    key={i}
                                    fontSize="small"
                                    sx={{ 
                                      color: i < getStarsCount(option.value) ? option.color : '#e0e0e0',
                                      fontSize: '14px'
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.level && (
                        <FormHelperText>{formErrors.level.message}</FormHelperText>
                      )}
                    </FormControl>
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
                    placeholder="توضیحات اضافی درباره این مهارت، تجربیات، پروژه‌ها و..."
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
