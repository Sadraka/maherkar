'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  FormControl,
  Select,
  OutlinedInput,
  MenuItem,
  FormHelperText,
  InputAdornment,
  type MenuProps
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import { getSalaryText } from '@/lib/jobUtils';

interface AdditionalResumeFieldsProps {
  control: any;
  formErrors: any;
  selectStyles: any;
  menuPropsRTL: Partial<MenuProps>;
}

const degreeOptions = [
  { value: 'Below Diploma', label: 'زیر دیپلم' },
  { value: 'Diploma', label: 'دیپلم' },
  { value: 'Associate', label: 'فوق دیپلم' },
  { value: 'Bachelor', label: 'لیسانس' },
  { value: 'Master', label: 'فوق لیسانس' },
  { value: 'Doctorate', label: 'دکترا' }
];

const experienceOptions = [
  { value: 'No EXPERIENCE', label: 'بدون سابقه کار' },
  { value: 'Less than Three', label: 'کمتر از 3 سال' },
  { value: 'Three or More', label: '3 تا 6 سال' },
  { value: 'Six or More', label: 'بیشتر از 6 سال' }
];

const salaryOptions = [
  { value: '5 to 10' },
  { value: '10 to 15' },
  { value: '15 to 20' },
  { value: '20 to 30' },
  { value: '30 to 50' },
  { value: 'More than 50' },
  { value: 'Negotiable' }
] as const;

const jobTypeOptions = [
  { value: 'Full-Time', label: 'تمام وقت' },
  { value: 'Part-Time', label: 'پاره وقت' },
  { value: 'Remote', label: 'دورکاری' },
  { value: 'Internship', label: 'کارآموزی' }
];

const availabilityOptions = [
  { value: 'immediately', label: 'فوری' },
  { value: 'with_notice', label: 'با اطلاع' },
  { value: 'not_available', label: 'غیرقابل دسترسی' }
];

export default function AdditionalResumeFields({ control, formErrors, selectStyles, menuPropsRTL }: AdditionalResumeFieldsProps) {
  const jobseekerColors = JOB_SEEKER_THEME;
  const toPersianDigits = (value: string): string => value.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

  return (
    <>
      {/* مدرک تحصیلی و سابقه کاری */}
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
              مدرک تحصیلی
            </Typography>
          </Box>
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(formErrors.degree)}>
                <Select
                  {...field}
                  displayEmpty
                  input={<OutlinedInput sx={selectStyles} />}
                  renderValue={() => {
                    const selectedOption = degreeOptions.find(opt => opt.value === field.value);
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {selectedOption ? toPersianDigits(selectedOption.label) : 'انتخاب مدرک تحصیلی'}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <SchoolIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                  )}
                >
                  <MenuItem value="" disabled>انتخاب مدرک تحصیلی</MenuItem>
                  {degreeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {toPersianDigits(option.label)}
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

        {/* سابقه کاری انتخابی */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WorkIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              color: jobseekerColors.primary,
              fontWeight: 600
            }}>
              سابقه کاری
            </Typography>
          </Box>
          <Controller
            name="experience"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(formErrors.experience)}>
                <Select
                  {...field}
                  displayEmpty
                  input={<OutlinedInput sx={selectStyles} />}
                  renderValue={() => {
                    const selectedOption = experienceOptions.find(opt => opt.value === field.value);
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {selectedOption ? toPersianDigits(selectedOption.label) : 'انتخاب سابقه کاری'}
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
                  <MenuItem value="" disabled>انتخاب سابقه کاری</MenuItem>
                  {experienceOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {toPersianDigits(option.label)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.experience && (
                  <FormHelperText>{formErrors.experience.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Box>
      </Box>

      {/* حقوق مورد انتظار و نوع شغل مطلوب */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 4 } }}>
        {/* حقوق مورد انتظار */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MonetizationOnIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              color: jobseekerColors.primary,
              fontWeight: 600
            }}>
              حقوق مورد انتظار
            </Typography>
          </Box>
          <Controller
            name="expected_salary"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(formErrors.expected_salary)}>
                <Select
                  {...field}
                  displayEmpty
                  input={<OutlinedInput sx={selectStyles} />}
                  renderValue={() => {
                    const selectedOption = salaryOptions.find(opt => opt.value === field.value);
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%', direction: 'ltr', textAlign: 'left' }}>
                        {selectedOption ? getSalaryText(selectedOption.value) : 'انتخاب حقوق مورد انتظار'}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <MonetizationOnIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                  )}
                >
                  <MenuItem value="" disabled>انتخاب حقوق مورد انتظار</MenuItem>
                  {salaryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value} sx={{ direction: 'ltr', textAlign: 'left' }}>
                      {getSalaryText(option.value)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.expected_salary && (
                  <FormHelperText>{formErrors.expected_salary.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Box>

        {/* نوع شغل مطلوب */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BusinessIcon sx={{ color: jobseekerColors.primary, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium" sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.1, sm: 1.3 },
              color: jobseekerColors.primary,
              fontWeight: 600
            }}>
              نوع شغل مطلوب
            </Typography>
          </Box>
          <Controller
            name="preferred_job_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(formErrors.preferred_job_type)}>
                <Select
                  {...field}
                  displayEmpty
                  input={<OutlinedInput sx={selectStyles} />}
                  renderValue={() => {
                    const selectedOption = jobTypeOptions.find(opt => opt.value === field.value);
                    return (
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {selectedOption ? selectedOption.label : 'انتخاب نوع شغل مطلوب'}
                      </Box>
                    );
                  }}
                  MenuProps={menuPropsRTL}
                  startAdornment={
                    <InputAdornment position="start" sx={{ position: 'absolute', right: '10px' }}>
                      <BusinessIcon fontSize="small" sx={{ color: jobseekerColors.primary }} />
                    </InputAdornment>
                  }
                  IconComponent={(props: any) => (
                    <KeyboardArrowDownIcon {...props} sx={{ color: jobseekerColors.primary }} />
                  )}
                >
                  <MenuItem value="" disabled>انتخاب نوع شغل مطلوب</MenuItem>
                  {jobTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.preferred_job_type && (
                  <FormHelperText>{formErrors.preferred_job_type.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Box>
      </Box>

      {/* وضعیت دسترسی منتقل شد به کنار فایل رزومه در PersonalInfoForm */}
    </>
  );
}
