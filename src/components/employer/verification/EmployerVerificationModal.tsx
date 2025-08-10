'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPut, apiGet } from '@/lib/axios';
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
  Divider,
  Modal,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { StepIconProps } from '@mui/material/StepIcon';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { EMPLOYER_THEME } from '@/constants/colors';
import ImageCropper from '@/components/common/ImageCropper';
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
  'آپلود مدارک'
];

// تبدیل اعداد انگلیسی به فارسی
const toPersianNumbers = (str: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/[0-9]/g, match => persianDigits[parseInt(match)]);
};

// تبدیل اعداد فارسی به انگلیسی برای ذخیره‌سازی/اعتبارسنجی
const toEnglishNumbers = (str: string): string => {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  return str.replace(/[۰-۹]/g, d => map[d] || d);
};

// Placeholder مینیمال: فقط یک دایره dashed به عنوان عکس داخل کادر dashed
const IdCardPlaceholder: React.FC<{ primaryColor: string; align?: 'left' | 'right'; withAvatar?: boolean; linesCount?: number }> = ({ primaryColor, align = 'right', withAvatar = true, linesCount = 3 }) => {
  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      gap: 2
    }}>
      {/* اگر عکس سمت راست باشد، خطوط را اول نمایش بده */}
      <Box sx={{ width: withAvatar ? '55%' : '70%', display: 'flex', flexDirection: 'column', gap: 1, order: align === 'right' ? 0 : 1, alignItems: 'center' }}>
        {(() => {
          return Array.from({ length: linesCount }).map((_, idx) => (
            <Box key={idx}
                 sx={{ height: 10, width: '85%', borderRadius: 10,
                      border: '1px dashed', borderColor: alpha(primaryColor, 0.55) }} />
          ));
        })()}
      </Box>

      {/* دایره پروفایل با آیکون داخل آن */}
      {withAvatar && (
        <Box sx={{
          order: align === 'right' ? 1 : 0,
          width: 84,
          height: 84,
          position: 'relative'
        }}>
          {/* دایره بیرونی dashed */}
          <Box sx={{
            position: 'absolute', inset: 0,
            borderRadius: '50%', border: '2px dashed',
            borderColor: alpha(primaryColor, 0.6)
          }} />
          {/* آیکون آدمک داخل دایره */}
          <PersonOutlineIcon
            sx={{
              position: 'absolute',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              fontSize: 40,
              color: alpha(primaryColor, 0.6)
            }}
          />
        </Box>
      )}
    </Box>
  );
};

// Styled Components مشابه RegisterForm
const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: theme.spacing(2),
  paddingTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(2),
  },
  // زیر هدر ثابت قرار بگیرد
  zIndex: 1100,
  pointerEvents: 'none', // خود Modal container کلیک را عبور دهد
  '& > *': { pointerEvents: 'auto' }, // محتوای داخل Modal قابل تعامل بماند
  '& .MuiBackdrop-root': {
    backgroundColor: 'transparent',
  }
}));

const ModalContent = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  height: 'auto',
  maxHeight: 'calc(100dvh - 128px)',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  position: 'relative',
  outline: 'none',
  [theme.breakpoints.up('md')]: {
    maxWidth: '720px', // عرض بیشتر در دسکتاپ
    maxHeight: 'calc(100dvh - 144px)',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '95vw',
    maxHeight: 'calc(100dvh - 112px)',
  },
}));

interface EmployerVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * کامپوننت Modal تایید هویت کارفرما
 * UI مشابه فرم ثبت‌نام
 */
export default function EmployerVerificationModal({ 
  open, 
  onClose, 
  onSuccess 
}: EmployerVerificationModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'never_submitted' | 'pending' | 'approved' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  // وضعیت‌های کراپر
  const [showFrontCropper, setShowFrontCropper] = useState(false);
  const [showBackCropper, setShowBackCropper] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  // فاصله داینامیک از بالای صفحه برای موبایل (بر اساس ارتفاع هدر و پروموبار)
  const [topOffsetPx, setTopOffsetPx] = useState<number>(156);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    trigger,
    reset,
    register,
    getValues
  } = useForm<VerificationFormInputs>({
    mode: 'onChange',
    defaultValues: {
      full_name: user?.full_name || '',
      national_id: '',
    }
  });

  const watchedFields = watch();
  // دریافت وضعیت فعلی احراز هویت از سرور
  useEffect(() => {
    const fetchStatus = async () => {
      setStatusLoading(true);
      try {
        const me = await apiGet<any>('/profiles/me/');
        const profile = me.data;
        // اگر هیچ مدرکی ثبت نشده باشد
        const hasDocs = !!(profile?.national_id || profile?.national_card_front || profile?.national_card_back);
        const statusCode = profile?.verification_status as 'P' | 'A' | 'R' | undefined;
        if (!hasDocs) setServerStatus('never_submitted');
        else if (statusCode === 'P') setServerStatus('pending');
        else if (statusCode === 'A') setServerStatus('approved');
        else if (statusCode === 'R') setServerStatus('rejected');
        else setServerStatus(null);
        setAdminNotes(profile?.admin_notes ?? null);
      } catch (e) {
        setServerStatus(null);
      } finally {
        setStatusLoading(false);
      }
    };
    if (open) fetchStatus();
  }, [open]);


  // ثبت فیلدهای فایل در RHF تا در ارسال فرم لحاظ شوند
  useEffect(() => {
    register('national_card_front');
    register('national_card_back');
  }, [register]);

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    which: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // اعتبارسنجی نوع فایل
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('فقط فرمت‌های JPG, PNG یا WebP مجاز است');
      e.currentTarget.value = '';
      return;
    }

    // محدودیت حجم فایل (۵ مگابایت)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      e.currentTarget.value = '';
      return;
    }

    setError(null);
    setSelectedImageFile(file);
    if (which === 'front') setShowFrontCropper(true);
    else setShowBackCropper(true);
  };

  // هنگام باز بودن مودال، در دسکتاپ اسکرول صفحه را غیرفعال کن
  useEffect(() => {
    if (open && typeof window !== 'undefined' && !isMobile) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [open, isMobile]);

  // محاسبه داینامیک فاصله از بالا در موبایل بر اساس ارتفاع هدر و پروموبار
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const computeTopOffset = () => {
      try {
        const headerEl = document.querySelector('[data-testid="main-header"]') as HTMLElement | null;
        const promoEl = document.querySelector('[data-testid="promo-bar"]') as HTMLElement | null;
        // اگر هدر/پرومو بار پنهان شده باشند، فاصله کمتری لازم است
        const headerH = headerEl && headerEl.style.display !== 'none' ? headerEl.offsetHeight : 0;
        const promoH = promoEl && promoEl.style.display !== 'none' ? promoEl.offsetHeight : 0;
        const gap = 12; // فاصله دلخواه
        setTopOffsetPx(headerH + promoH + gap);
      } catch {
        setTopOffsetPx(144);
      }
    };

    computeTopOffset();
    window.addEventListener('resize', computeTopOffset);
    return () => window.removeEventListener('resize', computeTopOffset);
  }, [open, isMobile]);

  // در موبایل: پس از باز شدن مودال، پس‌زمینه کمی به پایین اسکرول شود تا کارت در فضای مناسب‌تری دیده شود
  useEffect(() => {
    if (open && isMobile && typeof window !== 'undefined') {
      const scrollOffset = 140; // مقدار اسکرول به پایین در موبایل
      // کمی تاخیر برای اطمینان از رندر شدن
      const id = setTimeout(() => {
        try {
          window.scrollBy({ top: scrollOffset, behavior: 'smooth' });
        } catch {
          // در برخی مرورگرها ممکن است smooth پشتیبانی نشود
          window.scrollBy(0, scrollOffset);
        }
      }, 50);
      return () => clearTimeout(id);
    }
  }, [open, isMobile]);

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
      // پیدا کردن شناسه پروفایل کارفرما برای ساخت مسیر صحیح PUT
      let profileId: number | null = (user as any)?.profile?.id ?? null;
      if (!profileId) {
        try {
          const me = await apiGet<any>('/profiles/me/');
          profileId = me.data?.id ?? null;
        } catch (e) {
          // نادیده بگیر؛ در صورت نبود id، درخواست ارسال نمی‌شود
        }
      }

      if (!profileId) throw new Error('شناسه پروفایل کارفرما یافت نشد');

      await apiPut(`/profiles/employers/update/${profileId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);

    } catch (err: any) {
      console.error('خطا در ارسال اطلاعات تایید:', err);
      setError(err.response?.data?.error || 'خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  // تابع بستن Modal
  const handleClose = () => {
    if (!loading) {
      reset();
      setActiveStep(0);
      setFrontImagePreview(null);
      setBackImagePreview(null);
      setError(null);
      setSuccess(false);
      onClose();
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
        return true; // دیگر استفاده نمی‌شود
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
        // به جای رفتن به مرحله 3، مستقیماً ارسال کن
        await onSubmit({
          full_name: watchedFields.full_name,
          national_id: watchedFields.national_id,
          national_card_front: (getValues('national_card_front') as any) || undefined,
          national_card_back: (getValues('national_card_back') as any) || undefined,
        } as any);
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

  const handleCropComplete = (file: File, which: 'front' | 'back') => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (which === 'front') {
        setFrontImagePreview(dataUrl);
        const dt = new DataTransfer();
        dt.items.add(file);
        setValue('national_card_front', dt.files, { shouldDirty: true });
      } else {
        setBackImagePreview(dataUrl);
        const dt = new DataTransfer();
        dt.items.add(file);
        setValue('national_card_back', dt.files, { shouldDirty: true });
      }
      setShowFrontCropper(false);
      setShowBackCropper(false);
      setSelectedImageFile(null);
    };
    reader.readAsDataURL(file);
  };

  // رندر فرم مرحله اول (اطلاعات شخصی)
  const renderPersonalInfoForm = () => {
    return (
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {/* پیام وضعیت: نمایش رد/درحال‌بررسی در مرحله ۱ */}
        {serverStatus === 'rejected' ? (
          <Alert icon={false} severity="info" sx={{
            mb: { xs: 1.5, sm: 2 }, py: 0.8, px: 1.25,
            bgcolor: alpha(EMPLOYER_THEME.primary, 0.06),
            border: `1px solid ${alpha(EMPLOYER_THEME.primary, 0.2)}`,
            color: EMPLOYER_THEME.primary,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.82rem', sm: '0.86rem' }, color: 'inherit' }}>
              مدارک شما رد شده است. لطفاً مجدداً مدارک صحیح را ارسال کنید.
            </Typography>
            {adminNotes && (
              <Typography variant="caption" sx={{ color: 'inherit' }}>
                دلیل رد: {adminNotes}
              </Typography>
            )}
          </Alert>
        ) : serverStatus === 'pending' ? (
          <Alert icon={false} severity="info" sx={{
            mb: { xs: 1.5, sm: 2 }, py: 0.8, px: 1.25,
            bgcolor: alpha(EMPLOYER_THEME.primary, 0.06),
            border: `1px solid ${alpha(EMPLOYER_THEME.primary, 0.2)}`,
            color: EMPLOYER_THEME.primary,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.82rem', sm: '0.86rem' }, color: 'inherit' }}>
              مدارک شما قبلاً ارسال شده و در حال بررسی است.
            </Typography>
          </Alert>
        ) : (
          <Alert icon={false} severity="info" sx={{
            mb: { xs: 1.5, sm: 2 }, py: 0.8, px: 1.25,
            bgcolor: alpha(EMPLOYER_THEME.primary, 0.06),
            border: `1px solid ${alpha(EMPLOYER_THEME.primary, 0.2)}`,
            color: EMPLOYER_THEME.primary,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.82rem', sm: '0.86rem' }, color: 'inherit' }}>
              برای استفاده از امکانات پنل کارفرما، احراز هویت لازم است؛ این کار برای افزایش اعتماد کارجوها انجام می‌شود و اطلاعات شما فقط جهت بررسی استفاده می‌شود.
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 1.5, sm: 2.5 } }}>
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
                      <PersonIcon sx={{ color: EMPLOYER_THEME.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: EMPLOYER_THEME.primary,
                  },
                  '& .MuiInputLabel-root': {
                    color: EMPLOYER_THEME.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: EMPLOYER_THEME.primary,
                    caretColor: EMPLOYER_THEME.primary,
                  },
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
                value={toPersianNumbers(field.value || '')}
                onChange={(e) => {
                  const raw = e.target.value;
                  const onlyDigits = toEnglishNumbers(raw).replace(/[^0-9]/g, '');
                  field.onChange(onlyDigits);
                }}
                inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
                error={!!errors.national_id}
                helperText={errors.national_id?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: EMPLOYER_THEME.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: EMPLOYER_THEME.primary,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: EMPLOYER_THEME.primary,
                  },
                  '& .MuiInputLabel-root': {
                    color: EMPLOYER_THEME.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: EMPLOYER_THEME.primary,
                    caretColor: EMPLOYER_THEME.primary,
                  },
                }}
              />
            )}
          />
        </Box>

        {/* دکمه ادامه */}
        <Button
          onClick={handleNext}
          variant="contained"
          fullWidth
          disabled={!isStepValid(0)}
          sx={{
            mt: { xs: 2, sm: 3 },
            py: { xs: 1.2, sm: 1.5 },
            backgroundColor: EMPLOYER_THEME.primary,
            background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
            color: '#fff',
            '&.Mui-disabled': {
              color: '#fff',
              background: `linear-gradient(135deg, ${alpha(EMPLOYER_THEME.primary, 0.6)}, ${alpha(EMPLOYER_THEME.light, 0.6)})`,
              opacity: 1,
              boxShadow: 'none',
            },
            '&:hover': {
              background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
            },
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
          }}
        >
          ادامه
        </Button>
      </Box>
    );
  };

  // رندر فرم مرحله دوم (آپلود مدارک)
  const renderDocumentsForm = () => {
    return (
      <Box>
        {/* نوار وضعیت در مرحله ۲ - فقط برای pending و approved */}
        {(serverStatus === 'pending' || serverStatus === 'approved') && (
          <Alert icon={false} severity="info" sx={{
            mb: 1.5, py: 1, px: 1.25,
            bgcolor: alpha(EMPLOYER_THEME.primary, 0.06),
            border: `1px solid ${alpha(EMPLOYER_THEME.primary, 0.2)}`,
            color: EMPLOYER_THEME.primary,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.86rem' }, color: 'inherit' }}>
              {serverStatus === 'pending' && 'مدارک شما قبلاً ارسال شده و در حال بررسی است.'}
              {serverStatus === 'approved' && 'مدارک شما تایید شده است. در صورت نیاز می‌توانید مدارک را به‌روزرسانی کنید.'}
            </Typography>
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1.5, md: 2 }, mb: { xs: 1, md: 1 }, alignItems: 'start' }}>
          {/* روی کارت ملی */}
          <Box
            role="button"
            tabIndex={0}
            onClick={() => frontInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter') frontInputRef.current?.click(); }}
            sx={{
              border: '2px dashed',
              borderColor: EMPLOYER_THEME.primary,
              borderRadius: 2,
              bgcolor: 'background.paper',
              cursor: 'pointer',
              position: 'relative',
              width: '100%',
              aspectRatio: { xs: '1.9', sm: '1.7', md: '1.6' },
              overflow: 'visible',
              '&:hover': { bgcolor: alpha(EMPLOYER_THEME.primary, 0.03) }
            }}
          >
          {/* لیبل خارج از کادر */}
            <Box sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              px: 1,
              py: 0.2,
              borderRadius: 999,
              fontSize: '0.75rem',
              color: 'text.secondary',
              border: '1px dashed',
              borderColor: EMPLOYER_THEME.primary
            }}>
              کارت ملی
            </Box>
          <Box sx={{ position: 'absolute', inset: { xs: 6, sm: 10, md: 12 }, borderRadius: 2, overflow: 'hidden', bgcolor: 'transparent' }}>
              <Box sx={{ position: 'absolute', inset: 0 }}>
                {frontImagePreview ? (
                  <>
                    <img src={frontImagePreview} alt="روی کارت ملی" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#fff' }} />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setFrontImagePreview(null); setValue('national_card_front', undefined as any); }}
                      sx={{ position: 'absolute', top: 6, left: 6, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, border: '1px solid', borderColor: 'divider' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IdCardPlaceholder primaryColor={EMPLOYER_THEME.primary} withAvatar linesCount={2} />
                    <Box sx={{ position: 'absolute', bottom: { xs: 6, sm: 8, md: 10 }, left: '50%', transform: 'translateX(-50%)' }}>
                      <Box sx={{
                        border: '1px dashed',
                        borderColor: EMPLOYER_THEME.primary,
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 0.4,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(2px)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', lineHeight: 1.6 }}>
                          برای ارسال عکس کلیک کنید
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            
            <input
              ref={frontInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileInputChange(e, 'front')}
              style={{ display: 'none' }}
            />
          </Box>

          {/* پشت کارت ملی */}
          <Box
            role="button"
            tabIndex={0}
            onClick={() => backInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter') backInputRef.current?.click(); }}
            sx={{
              border: '2px dashed',
              borderColor: EMPLOYER_THEME.primary,
              borderRadius: 2,
              bgcolor: 'background.paper',
              cursor: 'pointer',
              position: 'relative',
              width: '100%',
              aspectRatio: { xs: '1.9', sm: '1.7', md: '1.6' },
              overflow: 'visible',
              '&:hover': { bgcolor: alpha(EMPLOYER_THEME.primary, 0.03) }
            }}
          >
            <Box sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              px: 1,
              py: 0.2,
              borderRadius: 999,
              fontSize: '0.75rem',
              color: 'text.secondary',
              border: '1px dashed',
              borderColor: EMPLOYER_THEME.primary
            }}>
              پشت کارت ملی
            </Box>
            <Box sx={{ position: 'absolute', inset: { xs: 6, sm: 10, md: 12 }, borderRadius: 2, overflow: 'hidden', bgcolor: 'transparent' }}>
              <Box sx={{ position: 'absolute', inset: 0 }}>
                {backImagePreview ? (
                  <>
                    <img src={backImagePreview} alt="پشت کارت ملی" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#fff' }} />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setBackImagePreview(null); setValue('national_card_back', undefined as any); }}
                      sx={{ position: 'absolute', top: 6, left: 6, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, border: '1px solid', borderColor: 'divider' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IdCardPlaceholder primaryColor={EMPLOYER_THEME.primary} align="right" withAvatar={false} linesCount={3} />
                    <Box sx={{ position: 'absolute', bottom: { xs: 6, sm: 8, md: 10 }, left: '50%', transform: 'translateX(-50%)' }}>
                      <Box sx={{
                        border: '1px dashed',
                        borderColor: EMPLOYER_THEME.primary,
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 0.4,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(2px)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', lineHeight: 1.6 }}>
                          برای ارسال عکس کلیک کنید
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            
            <input
              ref={backInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileInputChange(e, 'back')}
              style={{ display: 'none' }}
            />
          </Box>
        </Box>

        {/* دکمه‌های ناوبری */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 0.5, sm: 0 } }}>
          <Button
            onClick={handleBack}
            variant="text"
            sx={{
              color: EMPLOYER_THEME.primary,
              fontSize: '0.95rem',
              fontWeight: 500,
              borderRadius: 2,
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: alpha(EMPLOYER_THEME.primary, 0.08),
                color: EMPLOYER_THEME.dark,
              },
              transition: 'all 0.2s ease',
            }}
          >
            ← بازگشت
          </Button>

          <Button
            onClick={async () => {
              if (serverStatus === 'pending') {
                setError('مدارک شما در حال بررسی است و امکان ارسال مجدد تا اعلام نتیجه وجود ندارد.');
                return;
              }
              if (isStepValid(1)) {
                await onSubmit({
                  full_name: watchedFields.full_name,
                  national_id: watchedFields.national_id,
                  national_card_front: (getValues('national_card_front') as any) || undefined,
                  national_card_back: (getValues('national_card_back') as any) || undefined,
                } as any);
              } else {
                setError('لطفاً هر دو تصویر کارت ملی را آپلود کنید');
              }
            }}
            variant="contained"
            disabled={!isStepValid(1) || loading || serverStatus === 'pending'}
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              px: { xs: 3, sm: 4 },
              backgroundColor: EMPLOYER_THEME.primary,
              background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
              '&.Mui-disabled': {
                color: '#fff',
                background: `linear-gradient(135deg, ${alpha(EMPLOYER_THEME.primary, 0.6)}, ${alpha(EMPLOYER_THEME.light, 0.6)})`,
                opacity: 1,
                boxShadow: 'none',
              },
              '&:hover': {
                background: `linear-gradient(135deg, ${EMPLOYER_THEME.dark}, ${EMPLOYER_THEME.primary})`,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(65, 135, 255, 0.3)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
              },
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(65, 135, 255, 0.2)',
            }}
          >
            {loading ? 'در حال ارسال...' : serverStatus === 'pending' ? 'در حال بررسی' : 'ارسال'}
          </Button>
        </Box>
      </Box>
    );
  };

  // مرحله ۳ حذف شد
  const renderConfirmationForm = () => null;

  if (success) {
    return (
      <StyledModal 
        open={open} 
        onClose={() => {}}
        disableEscapeKeyDown
        hideBackdrop
        sx={{ pt: 0, mt: { xs: `${topOffsetPx}px` } }}
      >
        <ModalContent sx={{ mt: { xs: `${topOffsetPx}px` }, maxHeight: { xs: `calc(100dvh - ${topOffsetPx}px)` } }}>
          <Paper 
            elevation={isMobile ? 0 : 3}
            sx={{ 
              p: { xs: 2, sm: 2.5 },
              borderRadius: { xs: 0, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
              boxShadow: isMobile ? 'none' : '0px 3px 15px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="success.main" fontWeight="bold">
                اطلاعات با موفقیت ارسال شد
              </Typography>
              <Typography variant="body2" color="text.secondary">
                اطلاعات شما برای بررسی به ادمین ارسال شد. در کمترین زمان ممکن نتیجه را اطلاع خواهیم داد.
              </Typography>
            </Box>
          </Paper>
        </ModalContent>
      </StyledModal>
    );
  }

  return (
    <StyledModal 
      open={open} 
      onClose={() => {}} // غیرفعال کردن بستن با کلیک روی backdrop
      disableEscapeKeyDown // غیرفعال کردن بستن با ESC
      hideBackdrop // اجازه تعامل با هدر و پروموبار
      sx={{ pt: 0, mt: { xs: `${topOffsetPx}px` } }}
    >
      <ModalContent sx={{ mt: { xs: `${topOffsetPx}px` }, maxHeight: { xs: `calc(100dvh - ${topOffsetPx}px)` } }}>

        {/* فرم ثبت‌نام مشابه RegisterForm */}
          <Paper 
          elevation={isMobile ? 0 : 3}
          sx={{ 
            p: { xs: 1.25, sm: 2.5 },
            pt: { xs: 1.25, sm: 2.5 },
            pb: { xs: 1.25, sm: 2.5 },
            borderRadius: { xs: 2, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: { xs: '100%', sm: '100%' },
            boxShadow: isMobile ? 'none' : '0px 3px 15px rgba(0, 0, 0, 0.1)',
            maxHeight: { xs: 'none', sm: '100%' },
            overflowY: { xs: 'visible', sm: 'auto' },
            overflowX: 'visible',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* هدر انیمیشنی با اطلاعات مرحله */}
          <Box
            sx={{ 
              mb: { xs: 1.5, sm: 3 }, 
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* عنوان اصلی */}
          <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
              fontWeight: 700, 
              mb: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1.51rem', sm: '1.80rem' },
                letterSpacing: '0.01em',
                background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center'
              }}
            >
            احراز هویت کارفرما
            </Typography>
            
            {/* کارت اطلاعات مرحله ثابت - فقط برای never_submitted و rejected نمایش داده شود */}
            {(serverStatus === 'never_submitted' || serverStatus === 'rejected') && (
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${alpha(EMPLOYER_THEME.primary, 0.08)}, ${alpha(EMPLOYER_THEME.light, 0.05)})`,
                  borderRadius: 2,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1.2, sm: 1.5 },
                  border: `1px solid ${alpha(EMPLOYER_THEME.primary, 0.12)}`,
                  backdropFilter: 'blur(10px)',
                  maxWidth: { xs: '300px', sm: '340px' },
                  mx: 'auto',
                  position: 'relative',
                  minHeight: '70px'
                }}
              >
                <Typography 
                  key={`step-number-${activeStep}`}
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
                  مرحله {toPersianNumbers(activeStep + 1)} از {toPersianNumbers(2)}
                </Typography>
                
                <Typography 
                  key={`step-title-${activeStep}`}
                  variant="subtitle1" 
                  sx={{ 
                    color: EMPLOYER_THEME.primary,
                    fontWeight: 800,
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                    lineHeight: 1.3,
                    animation: 'fadeChange 0.6s ease-in-out 0.1s both',
                  }}
                >
                  {activeStep === 0 && 'اطلاعات شخصی'}
                  {activeStep === 1 && 'آپلود مدارک'}
                </Typography>

                <Box
                  sx={{
                    width: '100%',
                    height: 3,
                    backgroundColor: alpha(EMPLOYER_THEME.primary, 0.1),
                    borderRadius: 1.5,
                    mt: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`,
                      borderRadius: 1.5,
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      width: `${((activeStep + 1) / 2) * 100}%`,
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
              </Box>
            )}

            {/* انیمیشن‌های CSS */}
            <style jsx>{`
              @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
              }
            `}</style>
          </Box>

          {/* نمایش خطا */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>خطا</AlertTitle>
              {error}
            </Alert>
          )}

          {/* فرم‌ها */}
          {statusLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <CircularProgress size={28} sx={{ color: EMPLOYER_THEME.primary }} />
            </Box>
          ) : serverStatus === 'pending' ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              مدارک شما قبلاً ارسال شده و در حال بررسی است.
            </Alert>
          ) : (
            <>
              {activeStep === 0 && renderPersonalInfoForm()}
              {activeStep === 1 && renderDocumentsForm()}
            </>
          )}
        </Paper>
        {/* کراپرها */}
        <ImageCropper
          open={showFrontCropper}
          onClose={() => setShowFrontCropper(false)}
          imageFile={selectedImageFile}
          onCropComplete={(file) => handleCropComplete(file, 'front')}
          aspectRatio={1.6}
          title="برش تصویر روی کارت"
        />
        <ImageCropper
          open={showBackCropper}
          onClose={() => setShowBackCropper(false)}
          imageFile={selectedImageFile}
          onCropComplete={(file) => handleCropComplete(file, 'back')}
          aspectRatio={1.6}
          title="برش تصویر پشت کارت"
        />
      </ModalContent>
    </StyledModal>
  );
}
