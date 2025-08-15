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

  // تابع بررسی نوع اشتراک
  const isSpecialSubscription = (resumeAd: any): boolean => {
    if (resumeAd.advertisement?.subscription?.plan?.name) {
      const planName = resumeAd.advertisement.subscription.plan.name.toLowerCase();
      if (planName.includes('نردبان') || planName.includes('ویژه') || planName.includes('vip') || planName.includes('ladder')) {
        return true;
      }
      if (planName.includes('پایه') || planName.includes('base') || planName.includes('basic')) {
        return false;
      }
    }
    
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

    // فیلتر نوع اشتراک
    if (subscriptionFilter !== 'all') {
      if (subscriptionFilter === 'special') {
        filtered = filtered.filter(resumeAd => isSpecialSubscription(resumeAd));
      } else if (subscriptionFilter === 'basic') {
        filtered = filtered.filter(resumeAd => !isSpecialSubscription(resumeAd));
      }
    }

    // مرتب‌سازی بر اساس تاریخ ایجاد (جدیدترین اول)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [resumeAds, searchQuery, statusFilter, subscriptionFilter]);

  // اعمال تغییرات
  React.useEffect(() => {
    onFilteredResumeAdsChange(filteredResumeAds);
    onSearchStateChange?.(searchQuery, filteredResumeAds.length > 0);
    onSearchQueryChange?.(searchQuery);
    onFiltersChange?.(statusFilter, subscriptionFilter);
  }, [filteredResumeAds, searchQuery, statusFilter, subscriptionFilter, onFilteredResumeAdsChange, onSearchStateChange, onSearchQueryChange, onFiltersChange]);

  // تابع پاک کردن جستجو
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // تابع پاک کردن همه فیلترها
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSubscriptionFilter('all');
  };

  // بررسی وجود فیلتر فعال
  const hasActiveFilters = searchQuery.trim() || statusFilter !== 'all' || subscriptionFilter !== 'all';

  // تبدیل اعداد به فارسی
  const toPersianNumbers = (num: number): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* نمایش تعداد نتایج */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
        >
          {filteredResumeAds.length > 0 
            ? `${toPersianNumbers(filteredResumeAds.length)} آگهی رزومه یافت شد`
            : 'هیچ آگهی رزومه‌ای یافت نشد'
          }
        </Typography>

        {/* دکمه نمایش/مخفی کردن فیلترها در موبایل */}
        {(isMobile || isTablet) && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              borderColor: JOB_SEEKER_THEME.primary,
              color: JOB_SEEKER_THEME.primary,
              '&:hover': {
                borderColor: JOB_SEEKER_THEME.dark,
                backgroundColor: `${JOB_SEEKER_THEME.primary}10`
              }
            }}
          >
            فیلترها
          </Button>
        )}
      </Box>

      {/* فیلدهای جستجو و فیلتر */}
      <Collapse in={!isMobile && !isTablet ? true : showFilters} timeout="auto">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'flex-end' },
          mb: 2
        }}>
          {/* جستجو */}
          <Box sx={{ flex: { xs: 1, md: 2 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="جستجو در عنوان، نام، مکان یا صنعت..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment: searchQuery && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ p: 0.5 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
                sx: {
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${JOB_SEEKER_THEME.primary}40`,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${JOB_SEEKER_THEME.primary}60`,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: JOB_SEEKER_THEME.primary,
                  }
                }
              }}
            />
          </Box>

          {/* فیلتر وضعیت */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 140 } }}>
            <InputLabel sx={{ 
              color: 'text.secondary',
              '&.Mui-focused': {
                color: JOB_SEEKER_THEME.primary,
              }
            }}>
              وضعیت
            </InputLabel>
            <Select
              value={statusFilter}
              label="وضعیت"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: `${JOB_SEEKER_THEME.primary}40`,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: `${JOB_SEEKER_THEME.primary}60`,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: JOB_SEEKER_THEME.primary,
                }
              }}
            >
              <MenuItem value="all">همه وضعیت‌ها</MenuItem>
              <MenuItem value="P">در انتظار بررسی</MenuItem>
              <MenuItem value="A">تایید شده</MenuItem>
              <MenuItem value="R">رد شده</MenuItem>
            </Select>
          </FormControl>

          {/* فیلتر نوع اشتراک */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 140 } }}>
            <InputLabel sx={{ 
              color: 'text.secondary',
              '&.Mui-focused': {
                color: JOB_SEEKER_THEME.primary,
              }
            }}>
              نوع اشتراک
            </InputLabel>
            <Select
              value={subscriptionFilter}
              label="نوع اشتراک"
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: `${JOB_SEEKER_THEME.primary}40`,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: `${JOB_SEEKER_THEME.primary}60`,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: JOB_SEEKER_THEME.primary,
                }
              }}
            >
              <MenuItem value="all">همه اشتراک‌ها</MenuItem>
              <MenuItem value="basic">پایه</MenuItem>
              <MenuItem value="special">ویژه</MenuItem>
            </Select>
          </FormControl>

          {/* دکمه پاک کردن همه فیلترها */}
          {hasActiveFilters && (
            <Tooltip title="پاک کردن همه فیلترها">
              <IconButton
                onClick={handleClearAllFilters}
                sx={{
                  backgroundColor: 'white',
                  border: `1px solid ${JOB_SEEKER_THEME.primary}40`,
                  color: JOB_SEEKER_THEME.primary,
                  '&:hover': {
                    backgroundColor: `${JOB_SEEKER_THEME.primary}10`,
                    borderColor: `${JOB_SEEKER_THEME.primary}60`,
                  },
                  width: 40,
                  height: 40
                }}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Collapse>

      {/* نمایش فیلترهای فعال */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {searchQuery.trim() && (
            <Chip
              label={`جستجو: "${searchQuery}"`}
              onDelete={() => setSearchQuery('')}
              size="small"
              sx={{
                backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                color: JOB_SEEKER_THEME.primary,
                '& .MuiChip-deleteIcon': {
                  color: JOB_SEEKER_THEME.primary
                }
              }}
            />
          )}
          {statusFilter !== 'all' && (
            <Chip
              label={`وضعیت: ${statusFilter === 'P' ? 'در انتظار بررسی' : statusFilter === 'A' ? 'تایید شده' : 'رد شده'}`}
              onDelete={() => setStatusFilter('all')}
              size="small"
              sx={{
                backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                color: JOB_SEEKER_THEME.primary,
                '& .MuiChip-deleteIcon': {
                  color: JOB_SEEKER_THEME.primary
                }
              }}
            />
          )}
          {subscriptionFilter !== 'all' && (
            <Chip
              label={`اشتراک: ${subscriptionFilter === 'basic' ? 'پایه' : 'ویژه'}`}
              onDelete={() => setSubscriptionFilter('all')}
              size="small"
              sx={{
                backgroundColor: `${JOB_SEEKER_THEME.primary}15`,
                color: JOB_SEEKER_THEME.primary,
                '& .MuiChip-deleteIcon': {
                  color: JOB_SEEKER_THEME.primary
                }
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default ResumeAdsSearchAndSort;