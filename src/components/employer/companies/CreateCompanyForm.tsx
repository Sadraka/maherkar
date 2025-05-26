'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/axios';
import Image from 'next/image';
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
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { EMPLOYER_THEME } from '@/constants/colors';

type Industry = {
  id: number;
  name: string;
};

type City = {
  id: number;
  name: string;
};

interface CompanyFormInputs {
  name: string;
  location: number;
  description: string;
  website: string;
  email: string;
  phone_number: string;
  address: string;
  postal_code: string;
  founded_date: string;
  industry: number;
  number_of_employees: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  logo: FileList;
  banner: FileList;
  intro_video: FileList;
}

/**
 * کامپوننت فرم ثبت شرکت جدید
 */
export default function CreateCompanyForm() {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [expandedOptional, setExpandedOptional] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors },
    watch,
    setValue
  } = useForm<CompanyFormInputs>({
    defaultValues: {
      name: '',
      location: 0,
      industry: 0,
      description: '',
      website: '',
      email: '',
      phone_number: '',
      address: '',
      postal_code: '',
      founded_date: '',
      number_of_employees: '',
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  });

  // نظارت بر تغییرات فایل‌ها برای نمایش پیش‌نمایش
  const logoFiles = watch('logo');
  const bannerFiles = watch('banner');

  useEffect(() => {
    if (logoFiles && logoFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(logoFiles[0]);
    }
  }, [logoFiles]);

  useEffect(() => {
    if (bannerFiles && bannerFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(bannerFiles[0]);
    }
  }, [bannerFiles]);

  // لود داده‌های مورد نیاز (صنایع و شهرها)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesResponse, citiesResponse] = await Promise.all([
          apiGet('/industry/'),
          apiGet('/locations/cities/')
        ]);
        setIndustries(industriesResponse.data as Industry[]);
        setCities(citiesResponse.data as City[]);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setError('خطا در دریافت اطلاعات مورد نیاز. لطفاً دوباره تلاش کنید.');
      }
    };

    fetchData();
  }, []);

  const onSubmit: SubmitHandler<CompanyFormInputs> = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // اضافه کردن فیلدهای متنی به FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && 
            key !== 'logo' && 
            key !== 'banner' && 
            key !== 'intro_video' &&
            value !== undefined && 
            value !== '') {
          formDataToSend.append(key, String(value));
        }
      });

      // اضافه کردن فایل‌ها به FormData
      if (data.logo && data.logo.length > 0) {
        formDataToSend.append('logo', data.logo[0]);
      }
      
      if (data.banner && data.banner.length > 0) {
        formDataToSend.append('banner', data.banner[0]);
      }
      
      if (data.intro_video && data.intro_video.length > 0) {
        formDataToSend.append('intro_video', data.intro_video[0]);
      }

      const response = await apiPost('/companies/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      // هدایت کاربر به صفحه لیست شرکت‌ها پس از ثبت موفق
      setTimeout(() => {
        router.push('/employer/companies');
      }, 2000);
    } catch (err: any) {
      console.error('خطا در ثبت شرکت:', err);
      setError(err.response?.data?.Message || 'خطا در ثبت شرکت. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 3, md: 5 }, 
        borderRadius: 3,
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 1, textAlign: 'right' }}>
            ثبت شرکت جدید
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
            لطفاً اطلاعات ضروری شرکت خود را وارد کنید
          </Typography>
        </Box>
        <BusinessIcon sx={{ fontSize: 42, color: EMPLOYER_THEME.primary, ml: 2 }} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'right' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          severity="success" 
          sx={{ mb: 3, textAlign: 'right' }}
        >
          شرکت با موفقیت ثبت شد. در حال انتقال به صفحه شرکت‌ها...
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* فیلدهای اجباری - براساس مدل بک‌اند */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3, 
              pb: 1, 
              borderBottom: '1px solid #f0f0f0',
              color: EMPLOYER_THEME.primary,
              textAlign: 'right'
            }}
          >
            اطلاعات ضروری شرکت
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            {/* نام شرکت - اجباری */}
            <Box sx={{ px: 1.5, mb: 3, width: { xs: '100%', md: '50%' } }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  نام شرکت <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
                <Controller
                  name="name"
                  control={control}
                  rules={{ 
                    required: 'نام شرکت الزامی است', 
                    minLength: { value: 2, message: 'نام شرکت باید حداقل 2 حرف باشد' } 
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="نام شرکت را وارد کنید"
                      error={Boolean(errors.name)}
                      helperText={errors.name?.message}
                      variant="outlined"
                      inputProps={{ dir: 'rtl' }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        textAlign: 'right'
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* شهر - اجباری */}
            <Box sx={{ px: 1.5, mb: 3, width: { xs: '100%', md: '50%' } }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  شهر <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
                <Controller
                  name="location"
                  control={control}
                  rules={{ 
                    validate: value => value !== 0 || 'انتخاب شهر الزامی است' 
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      error={Boolean(errors.location)}
                      helperText={errors.location?.message}
                      variant="outlined"
                      inputProps={{ dir: 'rtl' }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        textAlign: 'right'
                      }}
                    >
                      <MenuItem value={0}>انتخاب شهر</MenuItem>
                      {cities.map(city => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>
            </Box>

            {/* صنعت */}
            <Box sx={{ px: 1.5, mb: 3, width: { xs: '100%', md: '50%' } }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  صنعت <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
                <Controller
                  name="industry"
                  control={control}
                  rules={{ 
                    validate: value => value !== 0 || 'انتخاب صنعت الزامی است' 
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      error={Boolean(errors.industry)}
                      helperText={errors.industry?.message}
                      variant="outlined"
                      inputProps={{ dir: 'rtl' }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        textAlign: 'right'
                      }}
                    >
                      <MenuItem value={0}>انتخاب صنعت</MenuItem>
                      {industries.map(industry => (
                        <MenuItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>
            </Box>

            {/* لوگوی شرکت - مهم */}
            <Box sx={{ px: 1.5, mb: 3, width: { xs: '100%', md: '50%' } }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  لوگوی شرکت <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: errors.logo ? 'error.main' : 'divider',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('logo-input')?.click()}
                >
                  <input
                    type="file"
                    id="logo-input"
                    style={{ display: 'none' }}
                    {...register('logo', { required: 'لوگوی شرکت الزامی است' })}
                    accept="image/*"
                  />
                  
                  {logoPreview ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 120 }}>
                      <Image
                        src={logoPreview}
                        alt="پیش‌نمایش لوگو"
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography>برای آپلود لوگو کلیک کنید</Typography>
                    </>
                  )}
                </Box>
                {errors.logo && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                    {errors.logo.message}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* فیلدهای اختیاری - براساس مدل بک‌اند */}
        <Accordion 
          expanded={expandedOptional}
          onChange={() => setExpandedOptional(!expandedOptional)}
          sx={{ 
            mb: 4, 
            border: '1px solid #f0f0f0',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: 'background.paper',
              borderBottom: expandedOptional ? '1px solid #f0f0f0' : 'none'
            }}
          >
            <Typography 
              variant="h6" 
              component="h2" 
              fontWeight="bold" 
              sx={{ color: EMPLOYER_THEME.primary }}
            >
              اطلاعات تکمیلی (اختیاری)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mt: 1 }}>
              {/* اطلاعات تماس */}
              <Box sx={{ px: 1.5, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary', textAlign: 'right' }}
                >
                  اطلاعات تماس
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* ایمیل */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        ایمیل شرکت
                      </Typography>
                      <Controller
                        name="email"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'ایمیل نامعتبر است'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="example@domain.com"
                            error={Boolean(errors.email)}
                            helperText={errors.email?.message}
                            variant="outlined"
                            inputProps={{ dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* شماره تماس */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        شماره تماس
                      </Typography>
                      <Controller
                        name="phone_number"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^(\+98|0)?[0-9]{10,11}$/,
                            message: 'شماره تماس نامعتبر است'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="02112345678"
                            error={Boolean(errors.phone_number)}
                            helperText={errors.phone_number?.message}
                            variant="outlined"
                            inputProps={{ dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* وب سایت */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        وب‌سایت
                      </Typography>
                      <Controller
                        name="website"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}$/,
                            message: 'آدرس وب‌سایت نامعتبر است'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="https://example.com"
                            error={Boolean(errors.website)}
                            helperText={errors.website?.message}
                            variant="outlined"
                            inputProps={{ dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* کد پستی */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        کد پستی
                      </Typography>
                      <Controller
                        name="postal_code"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'کد پستی باید 10 رقم باشد'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="کد پستی 10 رقمی"
                            error={Boolean(errors.postal_code)}
                            helperText={errors.postal_code?.message}
                            variant="outlined"
                            inputProps={{ dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* اطلاعات شرکت */}
              <Box sx={{ px: 1.5, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary', textAlign: 'right' }}
                >
                  اطلاعات شرکت
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* تعداد کارمندان */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        تعداد کارمندان
                      </Typography>
                      <Controller
                        name="number_of_employees"
                        control={control}
                        rules={{ 
                          pattern: {
                            value: /^[0-9]*$/,
                            message: 'لطفا فقط عدد وارد کنید'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="مثال: 12"
                            error={Boolean(errors.number_of_employees)}
                            helperText={errors.number_of_employees?.message}
                            variant="outlined"
                            type="number"
                            inputProps={{ min: 1, dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* تاریخ تاسیس */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        تاریخ تاسیس
                      </Typography>
                      <Controller
                        name="founded_date"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="date"
                            error={Boolean(errors.founded_date)}
                            helperText={errors.founded_date?.message}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* آدرس */}
                  <Box sx={{ px: 1, mb: 2, width: '100%' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        آدرس
                      </Typography>
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="آدرس دقیق شرکت"
                            error={Boolean(errors.address)}
                            helperText={errors.address?.message}
                            variant="outlined"
                            multiline
                            rows={3}
                            inputProps={{ dir: 'rtl' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* توضیحات */}
                  <Box sx={{ px: 1, mb: 2, width: '100%' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        توضیحات شرکت
                      </Typography>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="توضیحاتی درباره شرکت، فعالیت‌ها و خدمات آن"
                            error={Boolean(errors.description)}
                            helperText={errors.description?.message}
                            variant="outlined"
                            multiline
                            rows={5}
                            inputProps={{ dir: 'rtl' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* شبکه‌های اجتماعی */}
              <Box sx={{ px: 1.5, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary', textAlign: 'right' }}
                >
                  شبکه‌های اجتماعی
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* لینکدین */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        لینکدین
                      </Typography>
                      <Controller
                        name="linkedin"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="آدرس لینکدین"
                            error={Boolean(errors.linkedin)}
                            helperText={errors.linkedin?.message}
                            variant="outlined"
                            inputProps={{ dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* توییتر */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        توییتر
                      </Typography>
                      <Controller
                        name="twitter"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="آدرس توییتر"
                            error={Boolean(errors.twitter)}
                            helperText={errors.twitter?.message}
                            variant="outlined"
                            inputProps={{ dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* اینستاگرام */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        اینستاگرام
                      </Typography>
                      <Controller
                        name="instagram"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="آدرس اینستاگرام"
                            error={Boolean(errors.instagram)}
                            helperText={errors.instagram?.message}
                            variant="outlined"
                            inputProps={{ dir: 'ltr' }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              textAlign: 'right'
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* تصاویر و رسانه */}
              <Box sx={{ px: 1.5, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary', textAlign: 'right' }}
                >
                  تصاویر و رسانه
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* بنر */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        بنر شرکت
                      </Typography>
                      <Box
                        sx={{
                          border: '1px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'background.paper',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('banner-input')?.click()}
                      >
                        <input
                          type="file"
                          id="banner-input"
                          style={{ display: 'none' }}
                          {...register('banner')}
                          accept="image/*"
                        />
                        
                        {bannerPreview ? (
                          <Box sx={{ position: 'relative', width: '100%', height: 120 }}>
                            <Image
                              src={bannerPreview}
                              alt="پیش‌نمایش بنر"
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </Box>
                        ) : (
                          <>
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography>برای آپلود بنر کلیک کنید</Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* ویدیوی معرفی */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        ویدیوی معرفی
                      </Typography>
                      <Box
                        sx={{
                          border: '1px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'background.paper',
                          height: 120,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('video-input')?.click()}
                      >
                        <input
                          type="file"
                          id="video-input"
                          style={{ display: 'none' }}
                          {...register('intro_video')}
                          accept="video/*"
                        />
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography>برای آپلود ویدیوی معرفی کلیک کنید</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ textAlign: 'left', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: EMPLOYER_THEME.primary,
              px: 6,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { bgcolor: EMPLOYER_THEME.dark },
              fontSize: '1rem',
              fontWeight: 'medium'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                در حال ثبت...
              </>
            ) : 'ثبت شرکت'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
} 