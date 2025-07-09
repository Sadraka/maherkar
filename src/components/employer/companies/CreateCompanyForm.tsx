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
  CircularProgress,
  ListSubheader
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { EMPLOYER_THEME } from '@/constants/colors';

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
  icon?: string;
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
 * ورودی‌های فرم ثبت شرکت
 */
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
  const [provinces, setProvinces] = useState<Province[]>([]);
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
        const [industriesResponse, citiesResponse, provincesResponse] = await Promise.all([
          apiGet('/industries/industries/'),
          apiGet('/locations/cities/'),
          apiGet('/locations/provinces/')
        ]);
        setIndustries(industriesResponse.data as Industry[]);
        setCities(citiesResponse.data as City[]);
        setProvinces(provincesResponse.data as Province[]);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setError('خطا در دریافت اطلاعات مورد نیاز. لطفاً دوباره تلاش کنید.');
      }
    };

    fetchData();
   
  }, []);

  // گروه‌بندی شهرها بر اساس استان
  const groupedCities = React.useMemo(() => {
    // اگر شهرها یا استان‌ها دریافت نشده باشند، آرایه خالی برگردان
    if (!cities.length || !provinces.length) return [];

    // ایجاد یک آرایه از استان‌ها با شهرهای مربوط به هر کدام
    return provinces.map(province => ({
      province,
      cities: cities.filter(city => city.province?.id === province.id)
    })).filter(group => group.cities.length > 0); // فقط استان‌هایی که شهر دارند
  }, [cities, provinces]);

  const onSubmit: SubmitHandler<CompanyFormInputs> = async (data) => {
    setLoading(true);
    setError(null);

    // بررسی فیلدهای اجباری
    if (!data.name || !data.name.trim()) {
      setError('لطفاً نام شرکت را وارد کنید');
      setLoading(false);
      return;
    }

    if (!data.location || data.location === 0) {
      setError('لطفاً شهر محل فعالیت شرکت را انتخاب کنید');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // اضافه کردن فقط فیلدهای مورد نیاز به FormData (و نه همه فیلدها)
      // نام شرکت - اجباری
      formDataToSend.append('name', data.name);
      
      // شهر - اجباری (با همان نام location که سرور انتظار دارد)
      if (data.location && data.location !== 0) {
        formDataToSend.append('location', String(data.location));
      }
      
      // صنعت - اختیاری (فقط در صورتی که مقدار معتبر داشته باشد)
      if (data.industry && data.industry !== 0) {
        formDataToSend.append('industry', String(data.industry));
      }
      
      // اضافه کردن سایر فیلدهای متنی اختیاری
      const optionalTextFields = ['description', 'website', 'email', 'phone_number', 'address', 
                                 'postal_code', 'founded_date', 'number_of_employees',
                                 'linkedin', 'twitter', 'instagram'];
                                 
      optionalTextFields.forEach(field => {
        if (data[field as keyof CompanyFormInputs] && String(data[field as keyof CompanyFormInputs]).trim() !== '') {
          formDataToSend.append(field, String(data[field as keyof CompanyFormInputs]));
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

      // چاپ داده‌های ارسالی برای اشکال‌زدایی
      console.log('داده‌های ارسالی به سرور:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
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
      
      // نمایش دقیق‌تر خطاهای سرور
      if (err.response?.data) {
        console.log('جزئیات خطای سرور:', err.response.data);
        
        // بررسی ساختار خطا و استخراج پیام مناسب
        if (typeof err.response.data === 'object') {
          // استخراج پیام‌های خطا از فیلدهای مختلف
          const errorMessages = [];
          
          for (const [field, message] of Object.entries(err.response.data)) {
            if (Array.isArray(message)) {
              errorMessages.push(`${field}: ${message.join(', ')}`);
            } else if (typeof message === 'string') {
              errorMessages.push(`${field}: ${message}`);
            } else if (typeof message === 'object' && message !== null) {
              errorMessages.push(`${field}: ${JSON.stringify(message)}`);
            }
          }
          
          if (errorMessages.length > 0) {
            setError(`خطا در ثبت شرکت: ${errorMessages.join(' | ')}`);
          } else if (err.response.data.Message) {
            setError(err.response.data.Message);
          } else {
            setError('خطا در ثبت شرکت. لطفاً فیلدها را بررسی کنید.');
          }
        } else if (typeof err.response.data === 'string') {
          setError(`خطا در ثبت شرکت: ${err.response.data}`);
        } else {
          setError('خطا در ثبت شرکت. لطفاً دوباره تلاش کنید.');
        }
      } else {
        setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
      }
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
      dir="rtl"
    >
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            ثبت شرکت جدید
          </Typography>
          <Typography variant="body2" color="text.secondary">
            تنها فیلدهای نام شرکت و شهر اجباری هستند. سایر اطلاعات اختیاری می‌باشند، اما پر کردن آنها به تکمیل پروفایل شرکتی شما کمک می‌کند.
          </Typography>
        </Box>
        <BusinessIcon sx={{ fontSize: 42, color: EMPLOYER_THEME.primary, mr: 2 }} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          severity="success" 
          sx={{ mb: 3 }}
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
              color: EMPLOYER_THEME.primary
            }}
          >
            اطلاعات ضروری شرکت (اجباری)
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            این اطلاعات برای ثبت شرکت الزامی هستند و باید تکمیل شوند.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            {/* نام شرکت - اجباری */}
            <Box sx={{ px: 1.5, mb: 3, width: { xs: '100%', md: '50%' } }}>
              <Box>
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
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* شهر - اجباری */}
            <Box sx={{ px: 1.5, mb: 3, width: { xs: '100%', md: '50%' } }}>
              <Box>
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
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                      SelectProps={{
                        MenuProps: {
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right'
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'right'
                          },
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value={0}>انتخاب شهر</MenuItem>
                      {groupedCities.map((group) => [
                        <ListSubheader key={`province-${group.province.id}`} sx={{ 
                          backgroundColor: '#f5f5f5', 
                          fontWeight: 'bold',
                          color: EMPLOYER_THEME.primary 
                        }}>
                          {group.province.name}
                        </ListSubheader>,
                        ...group.cities.map(city => (
                          <MenuItem key={city.id} value={city.id} sx={{ pr: 4 }}>
                            {city.name}
                          </MenuItem>
                        ))
                      ])}
                    </TextField>
                  )}
                />
              </Box>
            </Box>

            {/* لوگوی شرکت - اختیاری */}
            <Box sx={{ px: 1.5, mb: 3, width: { xs: '100%', md: '100%' } }}>
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  لوگوی شرکت
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
                    {...register('logo')}
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
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              تکمیل این اطلاعات اختیاری است، اما به کارجویان کمک می‌کند تا شناخت بهتری از شرکت شما داشته باشند.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mt: 1 }}>
              {/* اطلاعات تماس */}
              <Box sx={{ px: 1.5, mb: 3, width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  اطلاعات تماس
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* ایمیل */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* شماره تماس */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* وب سایت */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* کد پستی */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
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
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  اطلاعات شرکت
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* صنعت - اختیاری */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        صنعت
                      </Typography>
                      <Controller
                        name="industry"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            error={Boolean(errors.industry)}
                            helperText={errors.industry?.message}
                            variant="outlined"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                            SelectProps={{
                              MenuProps: {
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: 'right'
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right'
                                }
                              }
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

                  {/* تعداد کارمندان */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
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
                            inputProps={{ min: 1 }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* تاریخ تاسیس */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
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
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* آدرس */}
                  <Box sx={{ px: 1, mb: 2, width: '100%' }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* توضیحات */}
                  <Box sx={{ px: 1, mb: 2, width: '100%' }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 }
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
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  شبکه‌های اجتماعی
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* لینکدین */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* توییتر */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* اینستاگرام */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '33.33%' } }}>
                    <Box>
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' }
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
                  sx={{ mb: 2, color: 'text.primary' }}
                >
                  تصاویر و رسانه
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 2 }}>
                  {/* بنر */}
                  <Box sx={{ px: 1, mb: 2, width: { xs: '100%', md: '50%' } }}>
                    <Box>
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
                    <Box>
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

        <Box sx={{ textAlign: 'right', mt: 4 }}>
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
                <CircularProgress size={20} color="inherit" sx={{ ml: 1 }} />
                در حال ثبت...
              </>
            ) : 'ثبت شرکت'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
} 