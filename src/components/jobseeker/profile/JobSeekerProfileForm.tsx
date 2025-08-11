'use client';

import React, { useEffect, useRef, useState } from 'react';
import { apiGet, apiPut } from '@/lib/axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Alert,
  AlertTitle,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import ImageCropper from '@/components/common/ImageCropper';
import { useAuthActions, useAuth } from '@/store/authStore';

interface JobSeekerProfileApi {
  id: number;
  profile_picture?: string | null;
  user?: {
    full_name?: string;
    phone?: string;
    email?: string;
  };
  personal_info?: {
    gender?: string;
    age?: number;
    kids_count?: number;
  };
  bio?: string;
  created_at?: string;
}

export default function JobSeekerProfileForm() {
  const colors = JOB_SEEKER_THEME;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<JobSeekerProfileApi | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [deleteImageRequested, setDeleteImageRequested] = useState(false);
  // state for editable personal info fields
  const [ageValue, setAgeValue] = useState<number | ''>('');
  const [initialAge, setInitialAge] = useState<number | ''>('');

  const personalInfoChanged = (() => {
    // اگر هر دو خالی باشند، تغییری نیست
    if (ageValue === '' && initialAge === '') return false;
    // اگر یکی خالی و دیگری نه، تغییر است
    if (ageValue === '' || initialAge === '') return true;
    // اگر هر دو عدد باشند، مقایسه کن
    if (typeof ageValue === 'number' && typeof initialAge === 'number') {
      return ageValue !== initialAge;
    }
    // در غیر این صورت تغییر است
    return true;
  })();

  const hasChanges = !!(pendingImageFile || deleteImageRequested || personalInfoChanged);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const { refreshUserData } = useAuthActions();

  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      try {
        // دریافت پروفایل کامل کارجو
        const profileRes = await apiGet('/profiles/me/');
        const profile = profileRes.data as JobSeekerProfileApi;
        setProfileData(profile);
        // hydrate editable personal info fields
        const loadedAge = profile.personal_info?.age;
        setAgeValue(loadedAge ?? '');
        setInitialAge(loadedAge ?? '');
        
        if (profile && profile.profile_picture) {
          const imageUrl = profile.profile_picture.startsWith('http')
            ? profile.profile_picture
            : `${process.env.NEXT_PUBLIC_API_URL}${profile.profile_picture}`;
          setProfilePicturePreview(imageUrl);
        }
      } catch (e) {
        setErrors(['خطا در دریافت اطلاعات پروفایل']);
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []); // Empty dependency array to run only once

  // Reset success state when component unmounts
  useEffect(() => {
    return () => {
      setSuccess(false);
    };
  }, []);

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setShowImageCropper(true);
    }
  };

  const handleImageCropComplete = async (croppedImage: File) => {
    // فقط پیش‌نمایش و نگه‌داشتن فایل برای ذخیره بعدی
    setErrors([]);
    setDeleteImageRequested(false);
    setPendingImageFile(croppedImage);
    const reader = new FileReader();
    reader.onload = (e) => setProfilePicturePreview(e.target?.result as string);
    reader.readAsDataURL(croppedImage);
    setShowImageCropper(false);
    setSelectedImageFile(null);
  };

  const handleDeleteProfilePicture = async () => {
    // فقط حذف در UI و علامت برای ذخیره بعدی
    setErrors([]);
    setPendingImageFile(null);
    setDeleteImageRequested(true);
    setProfilePicturePreview(null);
  };

  const handleSave = async () => {
    if (!profileData?.id) return;
    setSaving(true);
    setErrors([]);
    try {
      // build personal_info payload if changed
      const personalInfoPayload: any = {};
      if (personalInfoChanged) {
        if (ageValue !== '' && typeof ageValue === 'number') personalInfoPayload.age = ageValue;
      }

      if (pendingImageFile) {
        const formData = new FormData();
        formData.append('profile_picture', pendingImageFile);
        if (Object.keys(personalInfoPayload).length > 0) {
          formData.append('personal_info', JSON.stringify(personalInfoPayload));
        }
        await apiPut(`/profiles/job-seekers/update/${profileData.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (deleteImageRequested) {
        const jsonPayload: any = { profile_picture: null };
        if (Object.keys(personalInfoPayload).length > 0) {
          jsonPayload.personal_info = personalInfoPayload;
        }
        await apiPut(`/profiles/job-seekers/update/${profileData.id}/`, jsonPayload);
      } else {
        const jsonPayload: any = {};
        if (Object.keys(personalInfoPayload).length > 0) {
          jsonPayload.personal_info = personalInfoPayload;
        }
        await apiPut(`/profiles/job-seekers/update/${profileData.id}/`, jsonPayload);
      }
      setErrors([]);
      setSuccess(true);
      // Don't refresh user data to avoid page refresh
      // await refreshUserData();
      setPendingImageFile(null);
      setDeleteImageRequested(false);
      // sync initial values after save
      if (personalInfoChanged) {
        setInitialAge(ageValue);
      }
      // Reset success after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'خطا در ذخیره تغییرات';
      setSuccess(false);
      setErrors([msg]);
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // نمایش خطا تا زمانی که کاربر ببندد یا ذخیره موفق انجام شود
    } finally {
      setSaving(false);
    }
  };

  if (dataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  // تابع تبدیل اعداد انگلیسی به فارسی
  const toPersianDigits = (value: number | string): string => {
    if (!value) return '';
    return value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
  };

  // تابع نمایش جنسیت
  const getGenderDisplay = (gender: string) => {
    if (gender === 'M') return 'آقا';
    if (gender === 'W') return 'خانوم';
    return 'نامشخص';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, direction: 'rtl' }}>
      {/* Header و پیام‌ها */}
      <Box sx={{ mb: 4 }} ref={topRef}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          textAlign: 'left',
          direction: 'ltr'
        }}>
          <PersonIcon sx={{ 
            fontSize: 32, 
            color: colors.primary 
          }} />
          <Typography variant="h4" fontWeight="bold" sx={{ 
            color: colors.primary,
            textAlign: 'left',
            direction: 'ltr'
          }}>
            پروفایل کاربری
          </Typography>
        </Box>

        {errors.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, textAlign: 'left', direction: 'ltr' }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setErrors([])}
              >
                <Typography variant="body2">بستن</Typography>
              </IconButton>
            }
          >
            <AlertTitle sx={{ textAlign: 'left' }}>خطا</AlertTitle>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ textAlign: 'left' }}>
                {error}
              </Typography>
            ))}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
            sx={{ mb: 3, textAlign: 'left', direction: 'ltr' }}
          >
            <Typography sx={{ textAlign: 'left' }}>
              پروفایل شما با موفقیت به‌روزرسانی شد
            </Typography>
          </Alert>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, gap: 3, direction: 'rtl' }}>
        {/* ستون اول - تصویر پروفایل (راست در دسکتاپ) */}
        <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
          <Paper
            elevation={0}
            dir="ltr"
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: `0 4px 15px ${colors.primary}15`,
              border: `2px solid ${colors.primary}`,
              transition: 'all 0.25s ease',
              direction: 'ltr',
              textAlign: 'left',
              '& *': { direction: 'ltr' },
              height: 'fit-content'
            }}
          >
            <Typography variant="h6" fontWeight="bold" style={{ textAlign: 'left', direction: 'ltr' }} sx={{ 
              mb: 3, 
              color: colors.primary, 
              textAlign: 'left !important', 
              direction: 'ltr !important',
              '&.MuiTypography-root': {
                textAlign: 'left !important',
                direction: 'ltr !important'
              }
            }}>
              تصویر پروفایل
            </Typography>

            {/* تصویر پروفایل */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profilePicturePreview || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: colors.primary,
                    border: `3px solid ${colors.primary}33`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                
                {/* دکمه ویرایش روی تصویر */}
                <Tooltip title="تغییر تصویر" arrow>
                  <IconButton
                    onClick={handlePickImage}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: colors.primary,
                      color: 'white',
                      width: 36,
                      height: 36,
                      border: '3px solid white',
                      '&:hover': {
                        bgcolor: colors.dark,
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                
                {/* دکمه حذف اگر تصویر وجود داشته باشد */}
                {profilePicturePreview && (
                  <Tooltip title="حذف تصویر" arrow>
                    <IconButton
                      onClick={handleDeleteProfilePicture}
                      disabled={loading}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        bgcolor: 'error.main',
                        color: 'white',
                        width: 36,
                        height: 36,
                        border: '3px solid white',
                        '&:hover': {
                          bgcolor: 'error.dark',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      size="small"
                    >
                      <Typography variant="body2">حذف</Typography>
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageFileSelect}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                برای تغییر تصویر کلیک کنید
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* ستون دوم - اطلاعات شخصی (چپ در دسکتاپ) */}
        <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
          <Paper
            elevation={0}
            dir="ltr"
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: `0 4px 15px ${colors.primary}15`,
              border: `2px solid ${colors.primary}`,
              transition: 'all 0.25s ease',
              direction: 'ltr',
              textAlign: 'left',
              '& *': { direction: 'ltr' },
            }}
          >
            <Typography variant="h6" fontWeight="bold" style={{ textAlign: 'left', direction: 'ltr' }} sx={{ 
              mb: 3, 
              color: colors.primary, 
              textAlign: 'left !important', 
              direction: 'ltr !important',
              '&.MuiTypography-root': {
                textAlign: 'left !important',
                direction: 'ltr !important'
              }
            }}>
              اطلاعات شخصی
            </Typography>

            {/* نام و نام خانوادگی */}
            <TextField
              label="نام و نام خانوادگی"
              fullWidth
              value={user?.full_name || profileData?.user?.full_name || 'نامشخص'}
              sx={{ 
                mb: 2, 
                '& .MuiInputBase-input': { textAlign: 'left' }
              }}
              InputProps={{
                readOnly: true,
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            {/* شماره تلفن */}
            <TextField
              label="شماره تلفن"
              fullWidth
              value={toPersianDigits(profileData?.user?.phone || user?.phone || '') || 'در دسترس نیست'}
              sx={{ 
                mb: 2, 
                '& .MuiInputBase-input': { textAlign: 'left' }
              }}
              InputProps={{
                readOnly: true,
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            {/* تاریخ عضویت */}
            <TextField
              label="تاریخ عضویت"
              fullWidth
              value={profileData?.created_at ? toPersianDigits(new Date(profileData.created_at).toLocaleDateString('fa-IR')) : '-'}
              sx={{ 
                mb: 2, 
                '& .MuiInputBase-input': { textAlign: 'left' }
              }}
              InputProps={{
                readOnly: true,
                startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            {/* سن - نمایش با ارقام فارسی، پذیرش ورودی فارسی/انگلیسی */}
            <TextField
              label="سن"
              fullWidth
              type="text"
              value={ageValue === '' ? '' : toPersianDigits(ageValue)}
              onChange={(e) => {
                const persianToEnglish = (s: string) => s
                  .replace(/[۰-۹]/g, (d) => String('0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]))
                  .replace(/[٠-٩]/g, (d) => String('0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]));
                const raw = e.target.value;
                if (raw.trim() === '') { setAgeValue(''); return; }
                const normalized = persianToEnglish(raw).replace(/[^0-9]/g, '');
                if (normalized === '') { setAgeValue(''); return; }
                const n = Number(normalized);
                if (!Number.isNaN(n)) {
                  if (n < 1) { setAgeValue(1); return; }
                  if (n > 120) { setAgeValue(120); return; }
                  setAgeValue(n);
                }
              }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={{ 
                mb: 0,
                '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
              }}
            />
          </Paper>
        </Box>
      </Box>

      {/* دکمه‌های عملیات - مطابق با پروفایل کارفرما */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexDirection: 'row-reverse', direction: 'rtl' }}>
        <Button
          onClick={handleSave}
          variant="contained"
          color="success"
          disabled={saving || !profileData?.id || !hasChanges}
          sx={{
            background: colors.primary,
            color: 'white',
            '&:hover': { 
              background: colors.dark,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            },
            '&:disabled': {
              background: colors.primary,
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
          {saving ? '...' : 'ذخیره تغییرات'}
        </Button>
      </Box>

      <ImageCropper
        open={showImageCropper}
        onClose={() => setShowImageCropper(false)}
        imageFile={selectedImageFile}
        onCropComplete={handleImageCropComplete}
        aspectRatio={1}
        title="برش تصویر پروفایل"
      />

      {/* نمایش پیام‌ها توسط react-hot-toast (Toaster در layout سراسری) */}
    </Box>
  );
}


