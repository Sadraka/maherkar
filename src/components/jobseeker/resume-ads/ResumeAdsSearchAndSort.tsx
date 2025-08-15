'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Typography,
  Collapse,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { JOB_SEEKER_THEME } from '@/constants/colors';

export interface ResumeAdData {
  id: string;
  title: string;
  status: 'P' | 'A' | 'R';
  created_at: string;
  job_seeker_detail?: {
    full_name: string;
  };
  location_detail?: {
    name: string;
  };
  industry_detail?: {
    name: string;
  };
  advertisement?: {
    subscription?: {
      subscription_status: 'default' | 'special';
      plan?: {
        name: string;
      };
    };
  };
}

interface ResumeAdsSearchAndSortProps {
  resumeAds: ResumeAdData[];
  onFilteredResumeAdsChange: (filteredResumeAds: ResumeAdData[]) => void;
  onSearchStateChange?: (searchQuery: string, hasResults: boolean) => void;
  onSearchQueryChange?: (searchQuery: string) => void;
  onFiltersChange?: (statusFilter: string, subscriptionFilter: string) => void;
}

const ResumeAdsSearchAndSort: React.FC<ResumeAdsSearchAndSortProps> = ({
  resumeAds,
  onFilteredResumeAdsChange,
  onSearchStateChange,
  onSearchQueryChange,
  onFiltersChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // State برای جستجو و فیلتر
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // تابع بررسی نوع اشتراک - همان منطق کارت
  const isSpecialSubscription = (resumeAd: any): boolean => {
    // بررسی بر اساس نام طرح در advertisement.subscription
    if (resumeAd.advertisement?.subscription?.plan?.name) {
      const planName = resumeAd.advertisement.subscription.plan.name.toLowerCase();
      // فقط طرح‌های نردبان، ویژه، vip، یا ladder را به عنوان special در نظر بگیر
      if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
        return true;
      }
      // طرح‌های پایه را special در نظر نگیر
      if (planName.includes('پایه') || planName.includes('base') || planName.includes('basic')) {
        return false;
      }
    }
    
    // بررسی بر اساس subscription_status در advertisement.subscription
    if (resumeAd.advertisement?.subscription?.subscription_status) {
      return resumeAd.advertisement.subscription.subscription_status === 'special';
    }
    
    return false;
  };

  // فیلتر کردن و جستجو
  const filteredResumeAds = useMemo(() => {
    let filtered = [...resumeAds];

    // جستجو
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(resumeAd => {
        const title = resumeAd.title?.toLowerCase() || '';
        const jobSeekerName = resumeAd.job_seeker_detail?.full_name?.toLowerCase() || '';
        const location = resumeAd.location_detail?.name?.toLowerCase() || '';
        const industry = resumeAd.industry_detail?.name?.toLowerCase() || '';

        return title.includes(query) || 
               jobSeekerName.includes(query) ||
               location.includes(query) || 
               industry.includes(query);
      });
    }

    // فیلتر وضعیت
    if (statusFilter !== 'all') {
      filtered = filtered.filter(resumeAd => resumeAd.status === statusFilter);
    }

    // فیلتر بر اساس نوع اشتراک
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(resumeAd => {
        const isSpecial = isSpecialSubscription(resumeAd);
        if (subscriptionFilter === 'basic') {
          return !isSpecial;
        } else if (subscriptionFilter === 'special' || subscriptionFilter === 'ladder') {
          return isSpecial;
        }
        return true;
      });
    }

    // مرتب‌سازی بر اساس تاریخ ایجاد (جدیدترین اول)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [resumeAds, searchQuery, statusFilter, subscriptionFilter]);

  // ارسال نتایج فیلتر شده به کامپوننت والد
  React.useEffect(() => {
    onFilteredResumeAdsChange(filteredResumeAds);
  }, [filteredResumeAds, onFilteredResumeAdsChange]);

  // ارسال وضعیت جستجو به کامپوننت والد
  React.useEffect(() => {
    if (onSearchStateChange) {
      onSearchStateChange(searchQuery, filteredResumeAds.length > 0);
    }
  }, [searchQuery, filteredResumeAds.length, onSearchStateChange]);

  // ارسال تغییرات جستجو به کامپوننت والد
  React.useEffect(() => {
    if (onSearchQueryChange) {
      onSearchQueryChange(searchQuery);
    }
  }, [searchQuery, onSearchQueryChange]);

  // ارسال تغییرات فیلترها به کامپوننت والد
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(statusFilter, subscriptionFilter);
    }
  }, [statusFilter, subscriptionFilter, onFiltersChange]);

  // پاک کردن جستجو
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // تبدیل وضعیت به متن فارسی
  const getStatusText = (status: string) => {
    switch (status) {
      case 'P': return 'در انتظار بررسی';
      case 'A': return 'تایید شده';
      case 'R': return 'رد شده';
      default: return status;
    }
  };

  return (
    <Box
      sx={{
        mb: 4,
        backgroundColor: 'transparent',
        borderRadius: 0,
        border: 'none',
        boxShadow: 'none'
      }}
    >
      {/* دکمه نمایش/مخفی کردن جستجو و فیلترها */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowFilters(!showFilters)}
          startIcon={<FilterListIcon />}
          endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            borderRadius: 2,
            borderColor: JOB_SEEKER_THEME.primary,
            color: JOB_SEEKER_THEME.primary,
            '&:hover': {
              borderColor: JOB_SEEKER_THEME.dark,
              backgroundColor: `${JOB_SEEKER_THEME.primary}10`
            }
          }}
        >
          {showFilters ? 'مخفی کردن جستجو و فیلترها' : 'نمایش جستجو و فیلترها'}
        </Button>
      </Box>

      {/* جستجو و فیلترها */}
      <Collapse in={showFilters}>
        <Box sx={{ mb: 3 }}>
          {/* کنترل‌های جستجو و فیلتر */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr auto',
                md: '1fr auto auto'
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              alignItems: 'center',
              mb: 3
            }}
          >
            {/* فیلد جستجو */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="جستجو در عنوان، نام، مکان، صنعت..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{
                        color: JOB_SEEKER_THEME.primary,
                        mr: 1.5,
                        fontSize: { xs: '1.3rem', sm: '1.5rem' }
                      }}
                    />
                  ),
                  endAdornment: searchQuery && (
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ 
                        mr: -0.5,
                        color: 'text.secondary',
                        '&:hover': {
                          color: JOB_SEEKER_THEME.primary,
                          backgroundColor: `${JOB_SEEKER_THEME.primary}10`
                        }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                      borderWidth: 1
                    },
                    '&:hover fieldset': {
                      borderColor: JOB_SEEKER_THEME.primary,
                      borderWidth: 1
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: JOB_SEEKER_THEME.primary,
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Box>

            {/* فیلترهای وضعیت و نوع اشتراک */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' },
              gap: 2
            }}>
              {/* فیلتر وضعیت */}
              <FormControl
                size="medium"
                sx={{
                  minWidth: { xs: '100%', sm: 150, md: 170 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                      borderWidth: 1
                    },
                    '&:hover fieldset': {
                      borderColor: JOB_SEEKER_THEME.primary,
                      borderWidth: 1
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: JOB_SEEKER_THEME.primary,
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: JOB_SEEKER_THEME.primary
                    }
                  }
                }}
              >
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت"
                >
                  <MenuItem value="all">همه</MenuItem>
                  <MenuItem value="P">در انتظار بررسی</MenuItem>
                  <MenuItem value="A">تایید شده</MenuItem>
                  <MenuItem value="R">رد شده</MenuItem>
                </Select>
              </FormControl>

              {/* فیلتر نوع اشتراک */}
              <FormControl
                size="medium"
                sx={{
                  minWidth: { xs: '100%', sm: 150, md: 170 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                      borderWidth: 1
                    },
                    '&:hover fieldset': {
                      borderColor: JOB_SEEKER_THEME.primary,
                      borderWidth: 1
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: JOB_SEEKER_THEME.primary,
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: JOB_SEEKER_THEME.primary
                    }
                  }
                }}
              >
                <InputLabel>نوع اشتراک</InputLabel>
                <Select
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  label="نوع اشتراک"
                >
                  <MenuItem value="all">همه</MenuItem>
                  <MenuItem value="basic">پایه</MenuItem>
                  <MenuItem value="special">ویژه</MenuItem>
                  <MenuItem value="ladder">نردبان</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* نمایش فیلترهای فعال */}
          {(searchQuery.trim() || statusFilter !== 'all' || subscriptionFilter !== 'all') && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5, 
              mb: 2,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 2,
              border: '1px solid #f0f0f0'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.secondary',
                  mr: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                فیلترهای فعال:
              </Typography>
              
              {searchQuery.trim() && (
                <Chip
                  label={`جستجو: "${searchQuery}"`}
                  onDelete={() => setSearchQuery('')}
                  size="small"
                  sx={{
                    backgroundColor: JOB_SEEKER_THEME.primary,
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        color: 'white'
                      }
                    }
                  }}
                />
              )}
              
              {statusFilter !== 'all' && (
                <Chip
                  label={`وضعیت: ${getStatusText(statusFilter)}`}
                  onDelete={() => setStatusFilter('all')}
                  size="small"
                  sx={{
                    backgroundColor: JOB_SEEKER_THEME.primary,
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        color: 'white'
                      }
                    }
                  }}
                />
              )}
              
              {subscriptionFilter !== 'all' && (
                <Chip
                  label={`اشتراک: ${
                    subscriptionFilter === 'basic' ? 'پایه' : 
                    subscriptionFilter === 'special' ? 'ویژه' : 'نردبان'
                  }`}
                  onDelete={() => setSubscriptionFilter('all')}
                  size="small"
                  sx={{
                    backgroundColor: JOB_SEEKER_THEME.primary,
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        color: 'white'
                      }
                    }
                  }}
                />
              )}
            </Box>
          )}

          {/* نمایش تعداد نتایج */}
          {filteredResumeAds.length === 0 && 
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            border: '1px solid #f0f0f0'
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 500
              }}
            >
               هیچ آگهی رزومه‌ای یافت نشد
              
            </Typography>
          </Box>
          }
        </Box>
      </Collapse>
    </Box>
  );
};

// تبدیل اعداد به فارسی
const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

export default ResumeAdsSearchAndSort;