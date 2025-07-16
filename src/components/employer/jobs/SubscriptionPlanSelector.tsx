'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';
import { SubscriptionPlan } from '@/types';
import { apiGet } from '@/lib/axios';

interface DurationMultiplier {
  days: number;
  label: string;
  multiplier: number; // ضریب قیمت
  popular?: boolean;
}

interface SubscriptionPlanSelectorProps {
  selectedPlan: SubscriptionPlan | null;
  selectedDuration: number;
  onPlanChange: (plan: SubscriptionPlan | null) => void;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

/**
 * کامپوننت انتخاب طرح اشتراک - با انتخاب روز دلخواه و ضرایب
 */
export default function SubscriptionPlanSelector({
  selectedPlan,
  selectedDuration,
  onPlanChange,
  onDurationChange,
  disabled = false
}: SubscriptionPlanSelectorProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customDays, setCustomDays] = useState<string>('');
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const autoSelectRef = useRef(false);

  // مدت زمان‌های پیش‌فرض (بدون ضریب تخفیف)
  const durationOptions: DurationMultiplier[] = [
    { days: 3, label: '۳ روز', multiplier: 1.0 },
    { days: 7, label: '۷ روز', multiplier: 1.0 },
    { days: 10, label: '۱۰ روز', multiplier: 1.0 },
    { days: 15, label: '۱۵ روز', multiplier: 1.0, popular: true }, // محبوب
    { days: 20, label: '۲۰ روز', multiplier: 1.0 },
    { days: 30, label: '۳۰ روز', multiplier: 1.0 },
  ];

  // دریافت طرح‌های اشتراک از بک‌اند
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/subscriptions/plans/');
        const activePlans = (response.data as SubscriptionPlan[]).filter(plan => plan.active);
        setPlans(activePlans);
        
        // انتخاب خودکار فقط یک بار
        if (activePlans.length > 0 && !autoSelectRef.current) {
          autoSelectRef.current = true;
          setTimeout(() => {
            onPlanChange(activePlans[0]);
            if (selectedDuration === 0) {
              onDurationChange(15); // پیش‌فرض ۱۵ روز
            }
          }, 100);
        }
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setError('خطا در دریافت اطلاعات اشتراک‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // محاسبه ضریب بر اساس تعداد روز (بدون تخفیف)
  const getMultiplier = (days: number): number => {
    // همه روزها ضریب 1.0 دارند (بدون تخفیف)
    return 1.0;
  };

  // محاسبه قیمت نهایی (شامل مالیات 10%)
  const calculatePrice = (plan: SubscriptionPlan, duration: number) => {
    if (plan.is_free || duration <= 0) return 0;
    
    const basePrice = plan.price_per_day * duration;
    const multiplier = getMultiplier(duration);
    const priceWithDiscount = Math.round(basePrice * multiplier);
    
    // اضافه کردن مالیات 10% (مطابق با backend)
    const taxAmount = Math.floor(priceWithDiscount * 10 / 100);
    const finalPrice = priceWithDiscount + taxAmount;
    
    return finalPrice;
  };

  // محاسبه قیمت بدون مالیات (برای نمایش جزئیات)
  const calculateBasePrice = (plan: SubscriptionPlan, duration: number) => {
    if (plan.is_free || duration <= 0) return 0;
    
    const basePrice = plan.price_per_day * duration;
    const multiplier = getMultiplier(duration);
    
    return Math.round(basePrice * multiplier);
  };

  // محاسبه مالیات
  const calculateTax = (plan: SubscriptionPlan, duration: number) => {
    const basePrice = calculateBasePrice(plan, duration);
    return Math.floor(basePrice * 10 / 100);
  };



  // فرمت کردن قیمت با اعداد فارسی
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  // تشخیص نوع طرح
  const getPlanInfo = (plan: SubscriptionPlan) => {
    if (plan.is_free) {
      return { title: 'آگهی رایگان', badge: 'رایگان', color: '#4caf50' };
    }

    const name = plan.name.toLowerCase();
    if (name.includes('نردبان') || name.includes('ویژه') || name.includes('vip') || name.includes('ladder')) {
      return { title: 'آگهی نردبان', badge: 'نردبان', color: '#ff6b35' };
    }

    return { title: 'آگهی پایه', badge: 'پایه', color: '#2196f3' };
  };

  // تعیین مدت زمان فعال
  const activeDuration = useCustomDuration ? parseInt(customDays) || 0 : selectedDuration;

  // تغییر به روز دلخواه
  const handleCustomDaysChange = (value: string) => {
    setCustomDays(value);
    const days = parseInt(value);
    if (days > 0) {
      onDurationChange(days);
    }
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <CircularProgress size={40} sx={{ color: EMPLOYER_THEME.primary, mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          در حال بارگذاری...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (plans.length === 0) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        هیچ طرح اشتراک فعالی یافت نشد
      </Alert>
    );
  }

  return (
    <Box>
      {/* عنوان */}
      <Typography variant="h6" fontWeight="bold" sx={{ 
        mb: { xs: 0.5, sm: 1 },
        fontSize: { xs: '1rem', sm: '1.25rem' }
      }}>
        انتخاب نوع آگهی
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ 
        mb: { xs: 2, sm: 3 },
        fontSize: { xs: '0.75rem', sm: '0.875rem' }
      }}>
        نوع آگهی و مدت زمان نمایش را انتخاب کنید
      </Typography>

      {/* انتخاب مدت زمان */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ 
        mb: { xs: 1, sm: 2 },
        fontSize: { xs: '0.85rem', sm: '1rem' }
      }}>
        مدت زمان نمایش
      </Typography>
      
      {/* گزینه‌های پیش‌فرض */}
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 0.3, sm: 1 }, 
        flexWrap: 'wrap', 
        mb: { xs: 1.5, sm: 2 },
        justifyContent: { xs: 'flex-start', sm: 'flex-start' }
      }}>
        {durationOptions.map((option) => {
          const isSelected = !useCustomDuration && selectedDuration === option.days;
          
          return (
            <Box key={option.days} sx={{ position: 'relative' }}>
              {option.popular && (
                <Box sx={{
                  position: 'absolute',
                  top: { xs: -6, sm: -8 },
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  bgcolor: '#ff4081',
                  color: 'white',
                  px: { xs: 0.7, sm: 1.5 },
                  py: { xs: 0.2, sm: 0.3 },
                  borderRadius: { xs: 6, sm: 10 },
                  fontSize: { xs: '0.55rem', sm: '0.7rem' },
                  fontWeight: 'bold'
                }}>
                  محبوب
                </Box>
              )}
              
              <Chip
                label={
                  <Typography variant="body2" fontWeight="bold" sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    py: 0
                  }}>
                    {option.label}
                  </Typography>
                }
                variant={isSelected ? 'filled' : 'outlined'}
                color={isSelected ? 'primary' : 'default'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUseCustomDuration(false);
                  setCustomDays('');
                  onDurationChange(option.days);
                }}
                sx={{ 
                  cursor: 'pointer',
                  height: { xs: 28, sm: 36 },
                  px: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  '& .MuiChip-label': {
                    px: { xs: 0.5, sm: 1 },
                    py: 0
                  },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  },
                  ...(option.popular && {
                    border: '2px solid #ff4081'
                  })
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* انتخاب روز دلخواه */}
      <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: { xs: 0.7, sm: 1 },
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}>
          یا تعداد روز دلخواه را وارد کنید:
        </Typography>
        <TextField
          size="small"
          type="number"
          placeholder="مثال: 25"
          value={customDays}
          onChange={(e) => {
            const value = e.target.value;
            setCustomDays(value);
            if (value && parseInt(value) > 0) {
              setUseCustomDuration(true);
              handleCustomDaysChange(value);
            } else {
              setUseCustomDuration(false);
            }
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end" sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>روز</InputAdornment>
          }}
          sx={{ 
            width: { xs: 120, sm: 150 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              height: { xs: 35, sm: 40 }
            },
            '& .MuiOutlinedInput-input': {
              py: { xs: 0.7, sm: 1 }
            }
          }}
          inputProps={{
            min: 1,
            max: 365
          }}
        />
      </Box>

      {/* کارت‌های طرح */}
      <RadioGroup
        value={selectedPlan?.id || ''}
        onChange={(e) => {
          e.preventDefault();
          const plan = plans.find(p => p.id === e.target.value);
          if (plan) onPlanChange(plan);
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const planInfo = getPlanInfo(plan);
            const price = calculatePrice(plan, activeDuration);
            const basePrice = calculateBasePrice(plan, activeDuration);
            const taxAmount = calculateTax(plan, activeDuration);
            
            return (
              <Card
                key={plan.id}
                elevation={0}
                sx={{
                  border: isSelected ? `2px solid ${EMPLOYER_THEME.primary}` : '1px solid #e0e0e0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { borderColor: EMPLOYER_THEME.primary }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlanChange(plan);
                }}
              >
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    {/* راست - اطلاعات */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, width: '100%' }}>
                      <FormControlLabel
                        value={plan.id}
                        control={<Radio size="small" sx={{ 
                          p: { xs: 0.5, sm: 1 },
                          '& .MuiSvgIcon-root': {
                            fontSize: { xs: 18, sm: 20 }
                          }
                        }} />}
                        label=""
                        sx={{ m: 0 }}
                      />
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: { xs: 0.7, sm: 1 }, 
                          mb: { xs: 0.3, sm: 0.5 }, 
                          flexWrap: 'wrap' 
                        }}>
                          <Typography variant="body1" fontWeight="600" sx={{
                            fontSize: { xs: '0.8rem', sm: '1rem' }
                          }}>
                            {plan.name}
                          </Typography>
                          <Box
                            sx={{
                              bgcolor: planInfo.color,
                              color: 'white',
                              px: { xs: 0.5, sm: 1 },
                              py: { xs: 0.1, sm: 0.2 },
                              borderRadius: 1,
                              fontSize: { xs: '0.55rem', sm: '0.7rem' },
                              fontWeight: 'bold'
                            }}
                          >
                            {planInfo.badge}
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.85rem' },
                          lineHeight: { xs: 1.2, sm: 1.4 }
                        }}>
                          {plan.description || `نمایش آگهی به مدت ${activeDuration} روز`}
                        </Typography>
                      </Box>

                      {/* چپ - قیمت (در موبایل کنار اطلاعات) */}
                      <Box sx={{ 
                        textAlign: 'left',
                        minWidth: { xs: 85, sm: 120 }
                      }}>
                        {plan.is_free ? (
                          <Typography variant="h6" sx={{ 
                            color: planInfo.color, 
                            fontWeight: 'bold',
                            fontSize: { xs: '0.9rem', sm: '1.25rem' }
                          }}>
                            رایگان
                          </Typography>
                        ) : (
                          <Box>
                            <Typography variant="h5" sx={{ 
                              color: planInfo.color, 
                              fontWeight: 'bold',
                              fontSize: { xs: '1.2rem', sm: '1.5rem' },
                              lineHeight: 1.1
                            }}>
                              {activeDuration > 0 ? formatPrice(basePrice) : '۰'} 
                              <Typography component="span" sx={{ fontSize: { xs: '0.7rem', sm: '0.9rem' } }}>
                                تومان
                              </Typography>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{
                              fontSize: { xs: '0.6rem', sm: '0.75rem' },
                              display: 'block'
                            }}>
                              {activeDuration} روز
                            </Typography>
                            
                            {/* نمایش مالیات */}
                            {activeDuration > 0 && !plan.is_free && (
                              <Typography variant="caption" color="text.secondary" sx={{
                                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                                display: 'block',
                                mt: { xs: 0.3, sm: 0.5 }
                              }}>
                                + ۱۰٪ مالیات بر ارزش افزوده
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </RadioGroup>

      {/* خلاصه */}
      {selectedPlan && activeDuration > 0 && (
        <Box sx={{ 
          mt: { xs: 2, sm: 3 }, 
          p: { xs: 1.5, sm: 2.5 }, 
          bgcolor: '#f8f9fa', 
          borderRadius: 2,
          border: '1px solid #e9ecef'
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ 
            mb: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: EMPLOYER_THEME.primary
          }}>
            خلاصه سفارش
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            mb: { xs: 1, sm: 1.5 }
          }}>
            {selectedPlan.name} - {formatPrice(activeDuration)} روز
            {useCustomDuration && ' (دلخواه)'}
          </Typography>

          {selectedPlan.is_free ? (
            <Typography variant="h6" fontWeight="bold" sx={{
              color: '#4caf50',
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}>
              رایگان
            </Typography>
          ) : (
            <Box>
              {/* قیمت پایه */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: { xs: 0.5, sm: 0.7 }
              }}>
                <Typography variant="body2" sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  قیمت پایه:
                </Typography>
                <Typography variant="body2" sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  {formatPrice(calculateBasePrice(selectedPlan, activeDuration))} تومان
                </Typography>
              </Box>

              {/* مالیات */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: { xs: 1, sm: 1.2 }
              }}>
                <Typography variant="body2" sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  مالیات بر ارزش افزوده (۱۰٪):
                </Typography>
                <Typography variant="body2" sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  {formatPrice(calculateTax(selectedPlan, activeDuration))} تومان
                </Typography>
              </Box>

              {/* خط جداکننده */}
              <Box sx={{ 
                borderTop: '1px solid #ddd',
                pt: { xs: 1, sm: 1.2 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="body1" fontWeight="bold" sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    مجموع:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                    color: EMPLOYER_THEME.primary
                  }}>
                    {formatPrice(calculatePrice(selectedPlan, activeDuration))} تومان
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

        </Box>
      )}
    </Box>
  );
} 