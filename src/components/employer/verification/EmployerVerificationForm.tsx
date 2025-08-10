'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiPut } from '@/lib/axios';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper, 
  Alert,
  AlertTitle,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  InputAdornment,
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import { EMPLOYER_THEME } from '@/constants/colors';
import { useAuth } from '@/store/authStore';

// تعریف interface برای فرم
interface VerificationFormInputs {
  full_name: string;
  national_id: string;
  national_card_front?: FileList;
  national_card_back?: FileList;
}

const steps = [
  'اطلاعات شخصی',
  'آپلود مدارک',
  'تایید و ارسال'
];

/**
 * کامپوننت فرم تکمیل اطلاعات تایید هویت کارفرما
 */
export default function EmployerVerificationForm() {
  console.log('EmployerVerificationForm rendering...');
  
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
  
  console.log('User data:', user);
  

  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    trigger
  } = useForm<VerificationFormInputs>({
    mode: 'onChange',
    defaultValues: {
      full_name: user?.full_name || '',
      national_id: '',
    }
  });

  const watchedFields = watch();

  // تابع validation کد ملی
  const validateNationalId = (value: string): boolean | string => {
    if (!value) return 'کد ملی الزامی است';
    if (value.length !== 10) return 'کد ملی باید 10 رقم باشد';
    if (!/^\d+$/.test(value)) return 'کد ملی باید فقط شامل اعداد باشد';
    
    // الگوریتم اعتبارسنجی کد ملی
    const check = parseInt(value[9]);
    const sum = value.slice(0, 9)
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * (10 - index), 0);
    const remainder = sum % 11;
    
    if (remainder < 2 && check === remainder) return true;
    if (remainder >= 2 && check === 11 - remainder) return true;
    
    return 'کد ملی معتبر نیست';
  };

  // تابع مدیریت آپلود تصویر
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // بررسی نوع فایل
      if (!file.type.startsWith('image/')) {
        setError('لطفاً فقط فایل تصویری انتخاب کنید');
        return;
      }
      
      // بررسی حجم فایل (حداکثر 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        return;
      }

      // ایجاد پیش‌نمایش
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'front') {
          setFrontImagePreview(result);
          setValue('national_card_front', event.target.files as FileList);
        } else {
          setBackImagePreview(result);
          setValue('national_card_back', event.target.files as FileList);
        }
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // تابع ارسال فرم
  const onSubmit: SubmitHandler<VerificationFormInputs> = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('national_id', data.national_id);
      
      if (data.national_card_front?.[0]) {
        formData.append('national_card_front', data.national_card_front[0]);
      }
      if (data.national_card_back?.[0]) {
        formData.append('national_card_back', data.national_card_back[0]);
      }

      await apiPut('/profiles/employers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/verification/pending');
      }, 2000);

    } catch (err: any) {
      console.error('خطا در ارسال اطلاعات تایید:', err);
      setError(err.response?.data?.error || 'خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  // تابع بررسی مرحله فعلی
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(watchedFields.full_name && watchedFields.national_id && 
                 validateNationalId(watchedFields.national_id) === true);
      case 1:
        return !!(frontImagePreview && backImagePreview);
      case 2:
        return true;
      default:
        return false;
    }
  };

  // تابع رفتن به مرحله بعد
  const handleNext = async () => {
    if (activeStep === 0) {
      const isValid = await trigger(['full_name', 'national_id']);
      if (isValid && isStepValid(0)) {
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      if (isStepValid(1)) {
        setActiveStep(2);
      } else {
        setError('لطفاً هر دو تصویر کارت ملی را آپلود کنید');
      }
    }
  };

  // تابع برگشت به مرحله قبل
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
          اطلاعات با موفقیت ارسال شد
        </Typography>
        <Typography variant="body1" color="text.secondary">
          اطلاعات شما برای بررسی به ادمین ارسال شد. در کمترین زمان ممکن نتیجه را اطلاع خواهیم داد.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      px: { xs: 0.5, sm: 3, md: 4 },
      py: { xs: 0.5, sm: 3, md: 4 },
      '& > *': {
        mb: { xs: 1, sm: 3, md: 4 }
      }
    }}>
      {/* هدر صفحه */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 4 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary} 0%, ${EMPLOYER_THEME.light} 100%)`,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <SecurityIcon sx={{ fontSize: { xs: 28, sm: 48 }, mb: { xs: 0.5, sm: 2 } }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
          fontSize: { xs: '1.1rem', sm: '2.125rem' },
          mb: { xs: 0.5, sm: 2 }
        }}>
          تایید هویت کارفرما
        </Typography>
        <Typography variant="body1" sx={{ 
          opacity: 0.9, 
          fontSize: { xs: '0.75rem', sm: '1rem' },
          mb: { xs: 0, sm: 1 }
        }}>
          برای استفاده از خدمات ماهرکار، لطفاً اطلاعات هویتی خود را تکمیل کنید
        </Typography>
      </Paper>

      {/* Stepper */}
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 3 }, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* نمایش خطا */}
      {error && (
        <Alert severity="error" sx={{ mb: { xs: 1, sm: 3 } }}>
          <AlertTitle>خطا</AlertTitle>
          {error}
        </Alert>
      )}

      {/* فرم */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* مرحله 1: اطلاعات شخصی */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: { xs: 1, sm: 3 } }}>
                اطلاعات شخصی
              </Typography>
              
              <Box sx={{ display: 'grid', gap: { xs: 1, sm: 3 } }}>
                <Controller
                  name="full_name"
                  control={control}
                  rules={{ required: 'نام و نام خانوادگی الزامی است' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="نام و نام خانوادگی"
                      fullWidth
                      error={!!errors.full_name}
                      helperText={errors.full_name?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Controller
                  name="national_id"
                  control={control}
                  rules={{ 
                    required: 'کد ملی الزامی است',
                    validate: validateNationalId
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="کد ملی"
                      fullWidth
                      inputProps={{ maxLength: 10 }}
                      error={!!errors.national_id}
                      helperText={errors.national_id?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          )}

          {/* مرحله 2: آپلود مدارک */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 0.5 }}>
                آپلود تصاویر کارت ملی
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 3 } }}>
                لطفاً تصاویر واضح و خوانا از روی و پشت کارت ملی خود آپلود کنید
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1, sm: 3 } }}>
                {/* آپلود روی کارت ملی */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      روی کارت ملی
                    </Typography>
                    
                    {frontImagePreview ? (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <img
                          src={frontImagePreview}
                          alt="روی کارت ملی"
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          bgcolor: alpha(EMPLOYER_THEME.primary, 0.05)
                        }}
                      >
                        <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          تصویر روی کارت ملی
                        </Typography>
                      </Box>
                    )}

                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'front')}
                      style={{ display: 'none' }}
                    />
                    
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => frontInputRef.current?.click()}
                      fullWidth
                    >
                      {frontImagePreview ? 'تغییر تصویر' : 'انتخاب تصویر'}
                    </Button>
                  </CardContent>
                </Card>

                {/* آپلود پشت کارت ملی */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      پشت کارت ملی
                    </Typography>
                    
                    {backImagePreview ? (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <img
                          src={backImagePreview}
                          alt="پشت کارت ملی"
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          bgcolor: alpha(EMPLOYER_THEME.primary, 0.05)
                        }}
                      >
                        <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          تصویر پشت کارت ملی
                        </Typography>
                      </Box>
                    )}

                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'back')}
                      style={{ display: 'none' }}
                    />
                    
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => backInputRef.current?.click()}
                      fullWidth
                    >
                      {backImagePreview ? 'تغییر تصویر' : 'انتخاب تصویر'}
                    </Button>
                  </CardContent>
                </Card>
              </Box>

              <Alert severity="info" sx={{ mt: { xs: 1, sm: 3 } }}>
                <AlertTitle>راهنمایی</AlertTitle>
                • تصاویر باید واضح و خوانا باشند
                <br />
                • حجم هر تصویر نباید بیشتر از 5 مگابایت باشد
                <br />
                • فرمت‌های مجاز: JPG, PNG, JPEG
              </Alert>
            </Box>
          )}

          {/* مرحله 3: تایید و ارسال */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: { xs: 1, sm: 3 } }}>
                بررسی و تایید اطلاعات
              </Typography>

              <Card variant="outlined" sx={{ mb: { xs: 1, sm: 3 } }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    اطلاعات شخصی
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>نام و نام خانوادگی:</strong> {watchedFields.full_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>کد ملی:</strong> {watchedFields.national_id}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: { xs: 1, sm: 3 } }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    مدارک آپلود شده
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {frontImagePreview && (
                      <Box>
                        <Typography variant="body2" gutterBottom>روی کارت ملی:</Typography>
                        <img
                          src={frontImagePreview}
                          alt="روی کارت ملی"
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </Box>
                    )}
                    {backImagePreview && (
                      <Box>
                        <Typography variant="body2" gutterBottom>پشت کارت ملی:</Typography>
                        <img
                          src={backImagePreview}
                          alt="پشت کارت ملی"
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Alert severity="warning" sx={{ mb: { xs: 1, sm: 3 } }}>
                <AlertTitle>توجه</AlertTitle>
                با ارسال این اطلاعات، تایید می‌کنم که تمام اطلاعات ارائه شده صحیح و معتبر است.
                اطلاعات ارسالی توسط تیم ماهرکار بررسی و در کمترین زمان ممکن نتیجه اطلاع‌رسانی خواهد شد.
              </Alert>
            </Box>
          )}

          <Divider sx={{ my: { xs: 1, sm: 3 } }} />

          {/* دکمه‌های ناوبری */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              fullWidth={false}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 2, sm: 1 }
              }}
            >
              مرحله قبل
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !isStepValid(activeStep)}
                fullWidth={false}
                sx={{
                  bgcolor: EMPLOYER_THEME.primary,
                  '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                  width: { xs: '100%', sm: 'auto' },
                  order: { xs: 1, sm: 2 }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    در حال ارسال...
                  </>
                ) : (
                  'ارسال برای تایید'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={!isStepValid(activeStep)}
                fullWidth={false}
                sx={{
                  bgcolor: EMPLOYER_THEME.primary,
                  '&:hover': { bgcolor: EMPLOYER_THEME.dark },
                  width: { xs: '100%', sm: 'auto' },
                  order: { xs: 1, sm: 2 }
                }}
              >
                مرحله بعد
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
