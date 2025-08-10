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
import { EMPLOYER_THEME } from '@/constants/colors';

export interface JobData {
  id: string;
  title: string;
  status: 'P' | 'A' | 'R';
  created_at: string;
  city?: string;
  salary?: string;
  job_type?: string;
  industry?: {
    name: string;
  };
  location?: {
    name: string;
  };
  location_detail?: {
    name: string;
  };
  subscription_detail?: {
    subscription_status: 'default' | 'special';
    plan?: {
      name: string;
    };
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

interface JobsSearchAndSortProps {
  jobs: JobData[];
  onFilteredJobsChange: (filteredJobs: JobData[]) => void;
  onSearchStateChange?: (searchQuery: string, hasResults: boolean) => void;
  onSearchQueryChange?: (searchQuery: string) => void;
  onFiltersChange?: (statusFilter: string, subscriptionFilter: string) => void;
}

const JobsSearchAndSort: React.FC<JobsSearchAndSortProps> = ({
  jobs,
  onFilteredJobsChange,
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
  const isSpecialSubscription = (job: any): boolean => {
    // بررسی بر اساس نام طرح در subscription_detail
    if (job.subscription_detail?.plan?.name) {
      const planName = job.subscription_detail.plan.name.toLowerCase();
      // فقط طرح‌های نردبان، ویژه، vip، یا ladder را به عنوان special در نظر بگیر
      if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
        return true;
      }
      // طرح‌های پایه را special در نظر نگیر
      if (planName.includes('پایه') || planName.includes('base') || planName.includes('basic')) {
        return false;
      }
    }
    
    // بررسی بر اساس subscription_status در subscription_detail
    if (job.subscription_detail?.subscription_status) {
      if (job.subscription_detail.subscription_status === 'special') {
        return true;
      }
    }
    
    // اگر subscription_detail نبود، از advertisement.subscription بررسی کن
    if (job.advertisement?.subscription?.subscription_status) {
      if (job.advertisement.subscription.subscription_status === 'special') {
        return true;
      }
    }
    
    // بررسی بر اساس نام طرح در advertisement
    if (job.advertisement?.subscription?.plan?.name) {
      const planName = job.advertisement.subscription.plan.name.toLowerCase();
      if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
        return true;
      }
    }
    
    return false;
  };

  // فیلتر کردن و مرتب‌سازی آگهی‌ها
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // فیلتر بر اساس جستجو
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => {
        const title = job.title?.toLowerCase() || '';
        const city = job.city?.toLowerCase() || '';
        const industry = job.industry?.name?.toLowerCase() || '';
        const jobType = job.job_type?.toLowerCase() || '';
        const location = job.location?.name?.toLowerCase() || '';
        const locationDetail = job.location_detail?.name?.toLowerCase() || '';
        
        return title.includes(query) || 
               city.includes(query) || 
               industry.includes(query) || 
               jobType.includes(query) ||
               location.includes(query) ||
               locationDetail.includes(query);
      });
    }

    // فیلتر بر اساس وضعیت
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // فیلتر بر اساس نوع اشتراک
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(job => {
        const isSpecial = isSpecialSubscription(job);
        return subscriptionFilter === 'ladder' ? isSpecial : !isSpecial;
      });
    }

    // مرتب‌سازی بر اساس تاریخ ایجاد (جدیدترین اول)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [jobs, searchQuery, statusFilter, subscriptionFilter]);

  // ارسال نتایج فیلتر شده به کامپوننت والد
  React.useEffect(() => {
    onFilteredJobsChange(filteredJobs);
  }, [filteredJobs, onFilteredJobsChange]);

  // ارسال وضعیت جستجو به کامپوننت والد
  React.useEffect(() => {
    if (onSearchStateChange) {
      onSearchStateChange(searchQuery, filteredJobs.length > 0);
    }
  }, [searchQuery, filteredJobs.length, onSearchStateChange]);

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
            borderColor: EMPLOYER_THEME.primary,
            color: EMPLOYER_THEME.primary,
            '&:hover': {
              borderColor: EMPLOYER_THEME.primary,
              backgroundColor: 'rgba(25, 118, 210, 0.08)'
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
                placeholder="جستجو در عنوان، شهر، صنعت، نوع کار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{
                        color: EMPLOYER_THEME.primary,
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
                          color: EMPLOYER_THEME.primary,
                          backgroundColor: 'rgba(66, 133, 244, 0.08)'
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
                      borderColor: EMPLOYER_THEME.primary,
                      borderWidth: 1
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: EMPLOYER_THEME.primary,
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
                      borderColor: EMPLOYER_THEME.primary,
                      borderWidth: 1
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: EMPLOYER_THEME.primary,
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: EMPLOYER_THEME.primary
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
                      borderColor: EMPLOYER_THEME.primary,
                      borderWidth: 1
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: EMPLOYER_THEME.primary,
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: EMPLOYER_THEME.primary
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
                  <MenuItem value="ladder">نردبان</MenuItem>
                  <MenuItem value="basic">پایه</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      </Collapse>

      {/* نمایش فیلترهای فعال */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, 
        flexWrap: 'wrap',
        mb: 2
      }}>
        {searchQuery && (
          <Chip
            label={`جستجو: "${searchQuery}"`}
            size="small"
            onDelete={handleClearSearch}
            sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              color: '#4CAF50',
              fontWeight: 600,
              borderRadius: 2,
              px: 1.5,
              border: '1px solid rgba(76, 175, 80, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.15)'
              },
              '& .MuiChip-deleteIcon': {
                color: '#4CAF50',
                '&:hover': {
                  color: '#2E7D32'
                }
              }
            }}
          />
        )}
        
        {statusFilter !== 'all' && (
          <Chip
            label={`وضعیت: ${getStatusText(statusFilter)}`}
            size="small"
            onDelete={() => setStatusFilter('all')}
            sx={{
              backgroundColor: statusFilter === 'P' ? 'rgba(255, 193, 7, 0.1)' : statusFilter === 'A' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              color: statusFilter === 'P' ? '#FF9800' : statusFilter === 'A' ? '#4CAF50' : '#F44336',
              fontWeight: 600,
              borderRadius: 2,
              px: 1.5,
              border: `1px solid ${statusFilter === 'P' ? 'rgba(255, 193, 7, 0.3)' : statusFilter === 'A' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
              '&:hover': {
                backgroundColor: statusFilter === 'P' ? 'rgba(255, 193, 7, 0.15)' : statusFilter === 'A' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)'
              },
              '& .MuiChip-deleteIcon': {
                color: statusFilter === 'P' ? '#FF9800' : statusFilter === 'A' ? '#4CAF50' : '#F44336',
                '&:hover': {
                  color: statusFilter === 'P' ? '#F57C00' : statusFilter === 'A' ? '#2E7D32' : '#D32F2F'
                }
              }
            }}
          />
        )}

        {subscriptionFilter !== 'all' && (
          <Chip
            label={`اشتراک: ${subscriptionFilter === 'ladder' ? 'نردبان' : 'پایه'}`}
            size="small"
            onDelete={() => setSubscriptionFilter('all')}
            sx={{
              backgroundColor: subscriptionFilter === 'ladder' ? '#e53935' : 'rgba(25, 118, 210, 0.1)',
              color: subscriptionFilter === 'ladder' ? '#fff' : '#1976d2',
              fontWeight: 600,
              borderRadius: 2,
              px: 1.5,
              border: `1px solid ${subscriptionFilter === 'ladder' ? '#e53935' : 'rgba(25, 118, 210, 0.3)'}`,
              '&:hover': {
                backgroundColor: subscriptionFilter === 'ladder' ? '#c62828' : 'rgba(25, 118, 210, 0.15)'
              },
              '& .MuiChip-deleteIcon': {
                color: subscriptionFilter === 'ladder' ? '#fff' : '#1976d2',
                '&:hover': {
                  color: subscriptionFilter === 'ladder' ? 'rgba(255, 255, 255, 0.8)' : '#1565C0'
                }
              }
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default JobsSearchAndSort; 