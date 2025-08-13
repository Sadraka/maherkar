import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { JOB_SEEKER_THEME } from '@/constants/colors';

interface ResumeAdsSearchAndSortProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  totalCount: number;
}

const ResumeAdsSearchAndSort: React.FC<ResumeAdsSearchAndSortProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  totalCount
}) => {
  // تبدیل عدد به فارسی
  const toPersianDigits = (value: number): string =>
    value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3,
        borderRadius: 2,
        border: '1px solid #E0E0E0',
        backgroundColor: '#fafafa'
      }}
    >
      {/* نمایش تعداد نتایج */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: JOB_SEEKER_THEME.primary,
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}
        >
          {totalCount > 0 ? (
            <>
              {toPersianDigits(totalCount)} آگهی رزومه یافت شد
            </>
          ) : (
            'هیچ آگهی رزومه‌ای یافت نشد'
          )}
        </Typography>
      </Box>

      {/* فیلدهای جستجو و فیلتر */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 3 },
        alignItems: { xs: 'stretch', sm: 'flex-end' }
      }}>
        
        {/* جستجو */}
        <Box sx={{ flex: { xs: 1, sm: 2 } }}>
          <TextField
            fullWidth
            placeholder="جستجو در عنوان، صنعت یا موقعیت..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: JOB_SEEKER_THEME.primary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: JOB_SEEKER_THEME.primary
                }
              }
            }}
          />
        </Box>

        {/* فیلتر وضعیت */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 150 } }}>
          <FormControl fullWidth>
            <InputLabel 
              sx={{ 
                color: JOB_SEEKER_THEME.primary,
                '&.Mui-focused': {
                  color: JOB_SEEKER_THEME.primary
                }
              }}
            >
              <FilterListIcon sx={{ mr: 1, fontSize: '1rem' }} />
              وضعیت
            </InputLabel>
            <Select
              value={statusFilter}
              label="وضعیت"
              onChange={(e: SelectChangeEvent) => onStatusChange(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: 'white',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: JOB_SEEKER_THEME.primary
                }
              }}
            >
              <MenuItem value="all">همه</MenuItem>
              <MenuItem value="P">در انتظار بررسی</MenuItem>
              <MenuItem value="A">تایید شده</MenuItem>
              <MenuItem value="R">رد شده</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* مرتب‌سازی بر اساس */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}>
          <FormControl fullWidth>
            <InputLabel 
              sx={{ 
                color: JOB_SEEKER_THEME.primary,
                '&.Mui-focused': {
                  color: JOB_SEEKER_THEME.primary
                }
              }}
            >
              <SortIcon sx={{ mr: 1, fontSize: '1rem' }} />
              مرتب‌سازی
            </InputLabel>
            <Select
              value={sortBy}
              label="مرتب‌سازی"
              onChange={(e: SelectChangeEvent) => onSortByChange(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: 'white',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: JOB_SEEKER_THEME.primary
                }
              }}
            >
              <MenuItem value="created_at">تاریخ ایجاد</MenuItem>
              <MenuItem value="title">عنوان</MenuItem>
              <MenuItem value="status">وضعیت</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* ترتیب مرتب‌سازی */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 120 } }}>
          <FormControl fullWidth>
            <InputLabel 
              sx={{ 
                color: JOB_SEEKER_THEME.primary,
                '&.Mui-focused': {
                  color: JOB_SEEKER_THEME.primary
                }
              }}
            >
              ترتیب
            </InputLabel>
            <Select
              value={sortOrder}
              label="ترتیب"
              onChange={(e: SelectChangeEvent) => onSortOrderChange(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: 'white',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: JOB_SEEKER_THEME.primary
                }
              }}
            >
              <MenuItem value="desc">نزولی</MenuItem>
              <MenuItem value="asc">صعودی</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
};

export default ResumeAdsSearchAndSort;