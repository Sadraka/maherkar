'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Search,
  PersonAdd,
  FilterList,
  Refresh,
  Group,
  Person,
  Business,
  AdminPanelSettings,
  Support,
  Sort,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Cancel,
  Delete,
  Receipt
} from '@mui/icons-material';
import { apiGet, apiPut, apiDelete } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
import TableSkeleton from '../components/TableSkeleton';
import ActionButtons from '../components/ActionButtons';

import { useJobStatsStore } from '@/store/jobStatsStore';
import JobAdminDetails from './JobAdminDetails';

interface Job {
  id: string;
  title?: string;
  status?: string;
  degree?: string;
  created_at?: string;
  company_detail?: { name?: string };
  location_detail?: { name?: string; province?: string };
  employer_detail?: { full_name?: string };
  industry_detail?: { name?: string };
  subscription_orders?: Array<{ id: string; payment_status: string }>;
  // فیلدهای قدیمی برای سازگاری:
  advertisement?: {
    title?: string;
    status?: string;
    location?: { name?: string };
    degree?: string;
    created_at?: string;
  };
  company?: { name?: string };
}

const JobsManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { refreshJobStats } = useJobStatsStore();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');


  // ref برای نگهداری مقادیر جاری state
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/ads/job/`;

      // اضافه کردن پارامترهای جستجو و فیلتر
      const params = new URLSearchParams();
      
      // تعداد آگهی‌ها در هر صفحه
      params.append('page_size', pageSize.toString());
      
      // شماره صفحه - اگر جستجو انجام شده، به صفحه اول برو
      const currentPage = debouncedSearchQuery.trim() || statusFilter ? 1 : page;
      params.append('page', currentPage.toString());
      
      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim());
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      // اضافه کردن پارامترهای مرتب‌سازی
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);

      // اضافه کردن پارامترها به URL
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiGet(url);
      
      // Handle different response structures
      const data = response.data as any;
      if (data?.results) {
        // اگر backend pagination را پشتیبانی می‌کند
        setJobs(data.results);
        const newTotalPages = Math.ceil(data.count / pageSize);
        setTotalPages(newTotalPages);
        
        // بررسی و تصحیح صفحه جاری
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      } else if (Array.isArray(data)) {
        // اگر backend pagination را پشتیبانی نمی‌کند، خودمان pagination می‌کنیم
        const currentPage = debouncedSearchQuery.trim() || statusFilter ? 1 : page;
        const newTotalPages = Math.ceil(data.length / pageSize);
        
        // بررسی و تصحیح صفحه جاری
        const validPage = currentPage > newTotalPages && newTotalPages > 0 ? newTotalPages : currentPage;
        
        const startIndex = (validPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedJobs = data.slice(startIndex, endIndex);
        
        setJobs(paginatedJobs);
        setTotalPages(newTotalPages);
        
        // اگر صفحه تغییر کرده، آن را به‌روزرسانی کن
        if (validPage !== currentPage) {
          setPage(validPage);
        }
      } else {
        setJobs([]);
        setTotalPages(1);
        setPage(1);
      }
    } catch (error: any) {
      console.error('خطا در دریافت آگهی‌ها:', error);
      toast.error('خطا در دریافت اطلاعات آگهی‌ها');
      setJobs([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [page, pageSize, debouncedSearchQuery, statusFilter, sortBy, sortOrder]);

  // useCallback برای handleHashChange
  const handleHashChange = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    
    if (hash.includes('#jobs?search=')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const searchParam = urlParams.get('search');
      
      if (searchParam && searchParam !== searchQueryRef.current) {
        setSearchQuery(searchParam);
        setSearchInput(searchParam);
        setIsSearching(true);
        setPage(1);
      }
    } else if (hash === '#jobs') {
      // اگر بدون پارامتر جستجو به jobs آمده، جستجو را پاک کن
      if (searchQueryRef.current) {
        setSearchQuery('');
        setSearchInput('');
        setPage(1);
      }
    }
  }, []);

  // useEffect برای بررسی پارامترهای URL
  useEffect(() => {
    // اجرای اولیه
    handleHashChange();

    // گوش دادن به تغییرات hash
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
      
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [handleHashChange]);

  // Debounced search effect
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApproveJob = useCallback(async (jobId: string) => {
    try {
      await apiPut(`/ads/job/${jobId}/`, { status: 'A' });
      toast.success('آگهی تایید شد');
      
      // به‌روزرسانی selectedJob فوری
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => prev ? { ...prev, status: 'A' } : null);
      }
      
      await fetchJobs(); // منتظر اتمام fetchJobs
      refreshJobStats(); // آپدیت آمار
    } catch (error: any) {
      console.error('خطا در تایید آگهی:', error);
      toast.error('خطا در تایید آگهی');
    }
  }, [fetchJobs, refreshJobStats]);

  const handleRejectJob = useCallback(async (jobId: string) => {
    try {
      await apiPut(`/ads/job/${jobId}/`, { status: 'R' });
      toast.success('آگهی رد شد');
      
      // به‌روزرسانی selectedJob فوری
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => prev ? { ...prev, status: 'R' } : null);
      }
      
      await fetchJobs(); // منتظر اتمام fetchJobs
      refreshJobStats(); // آپدیت آمار
    } catch (error: any) {
      console.error('خطا در رد آگهی:', error);
      toast.error('خطا در رد آگهی');
    }
  }, [fetchJobs, refreshJobStats]);

  const handleDeleteJob = useCallback(async (jobId: string) => {
    setJobToDelete(jobId);
    setDeleteWarningOpen(true);
  }, []);

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      setLoading(true);
      const response = await apiDelete(`/ads/job/${jobToDelete}/`);
      
      if (response.status === 204) {
        // حذف موفق - بستن dialog جزئیات اگر باز باشد
        if (selectedJob?.id === jobToDelete) {
          setViewDialog(false);
          setSelectedJob(null);
        }
        
        // به‌روزرسانی لیست
        await fetchJobs();
        
        // نمایش پیام موفقیت
      toast.success('آگهی با موفقیت حذف شد');
      }
    } catch (error: any) {
      console.error('خطا در حذف آگهی:', error);
      toast.error('خطا در حذف آگهی');
    } finally {
      setLoading(false);
      setDeleteWarningOpen(false);
      setJobToDelete(null);
    }
  };

  const openViewDialog = (job: Job) => {
    setSelectedJob(job);
    setViewDialog(true);
  };



  const getStatusLabel = (status: string) => {
    const statuses = {
      'P': 'در انتظار بررسی',
      'A': 'تایید شده',
      'R': 'رد شده',
      'Approved': 'تایید شده',
      'Rejected': 'رد شده',
      'ACTIVE': 'فعال'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'P': 'warning',
      'A': 'success',
      'R': 'error',
      'Approved': 'success',
      'Rejected': 'error',
      'ACTIVE': 'success'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setIsSearching(true);
    setPage(1);
  }, [searchInput]);

  const handleSortChange = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  const getSortFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      'created_at': 'تاریخ ثبت',
      'title': 'عنوان آگهی',
      'status': 'وضعیت',
      'company': 'شرکت',
      'location': 'شهر (استان)',
      'employer': 'کارفرما'
    };
    return labels[field] || field;
  };

  // تابع کوتاه‌سازی متن
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const tableHeaders = [
    'عنوان آگهی',
    'کارفرما',
    'شرکت', 
    'شهر (استان)',
    'وضعیت',
    'تاریخ ثبت',
    'عملیات'
  ];

  return (
    <Box>


      {/* نمایش موبایل */}
      {isMobile ? (
        <Paper
          elevation={0}
          sx={{
            background: 'white',
            borderRadius: '12px',
            p: 2,
            mb: 3,
            border: `1px solid ${ADMIN_THEME.bgLight}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Search sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی آگهی‌ها
        </Typography>
      </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="جستجو در عنوان، شرکت، کارفرما، گروه کاری، شماره سفارش..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(searchInput);
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.primary,
                    }
                  }
                }
              }}
            />
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setSearchQuery(searchInput)}
              startIcon={<Search />}
              sx={{
                borderColor: ADMIN_THEME.primary,
                color: ADMIN_THEME.primary,
                '&:hover': {
                  borderColor: ADMIN_THEME.dark,
                  bgcolor: ADMIN_THEME.bgLight
                }
              }}
            >
              جستجو
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FilterList sx={{ color: ADMIN_THEME.primary, fontSize: '1.1rem' }} />
              <FormControl fullWidth size="small">
                <InputLabel>وضعیت آگهی</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت آگهی"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value="">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="P">در انتظار بررسی</MenuItem>
                  <MenuItem value="A">تایید شده</MenuItem>
                  <MenuItem value="R">رد شده</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Sort sx={{ color: ADMIN_THEME.primary, fontSize: '1.1rem' }} />
              <FormControl fullWidth size="small">
                <InputLabel>مرتب‌سازی بر اساس</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="مرتب‌سازی بر اساس"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value="created_at">تاریخ ثبت</MenuItem>
                  <MenuItem value="title">عنوان آگهی</MenuItem>
                  <MenuItem value="status">وضعیت</MenuItem>
                  <MenuItem value="company">شرکت</MenuItem>
                  <MenuItem value="location">شهر (استان)</MenuItem>
                  <MenuItem value="employer">کارفرما</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setStatusFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchJobs();
                }}
                sx={{
                  bgcolor: ADMIN_THEME.bgLight,
                  color: ADMIN_THEME.primary,
                  '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight }
                }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      ) : (
        /* نمایش دسکتاپ */
      <Paper
        elevation={0}
        sx={{
          background: 'white',
          borderRadius: '12px',
          p: 2.5,
          mb: 3,
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Search sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle1" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی آگهی‌ها
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, mb: 1, mt: -1 }}>
              می‌توانید با هر کلیدواژه‌ای در عنوان، توضیحات، شرکت، کارفرما، گروه کاری، شماره سفارش و ... جستجو کنید.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
                placeholder="جستجو در عنوان، شرکت، کارفرما، گروه کاری، شماره سفارش..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchInput);
                  }
                }}
                sx={{
                  flexGrow: 1,
                  minWidth: 250,
                  maxWidth: 400,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: ADMIN_THEME.primary,
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: ADMIN_THEME.primary,
                      }
                    }
                  }
                }}
              />
              
              <Button
                variant="outlined"
                onClick={() => setSearchQuery(searchInput)}
                startIcon={<Search />}
                sx={{
                  borderColor: ADMIN_THEME.primary,
                  color: ADMIN_THEME.primary,
                  minWidth: 100,
                  '&:hover': {
                    borderColor: ADMIN_THEME.dark,
                    bgcolor: ADMIN_THEME.bgLight
                  }
                }}
              >
                جستجو
              </Button>
              
          <FormControl size="small" sx={{ minWidth: 150, maxWidth: 200 }}>
                <InputLabel>وضعیت آگهی</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت آگهی"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    },
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: ADMIN_THEME.primary,
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: ADMIN_THEME.primary,
                      }
                    }
                  }}
            >
                  <MenuItem value="">همه وضعیت‌ها</MenuItem>
              <MenuItem value="P">در انتظار بررسی</MenuItem>
                  <MenuItem value="A">تایید شده</MenuItem>
                  <MenuItem value="R">رد شده</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150, maxWidth: 200 }}>
                <InputLabel>مرتب‌سازی بر اساس</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="مرتب‌سازی بر اساس"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    },
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: ADMIN_THEME.primary,
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: ADMIN_THEME.primary,
                      }
                    }
                  }}
                >
                  <MenuItem value="created_at">تاریخ ثبت</MenuItem>
                  <MenuItem value="title">عنوان آگهی</MenuItem>
                  <MenuItem value="status">وضعیت</MenuItem>
                  <MenuItem value="company">شرکت</MenuItem>
                  <MenuItem value="location">شهر (استان)</MenuItem>
                  <MenuItem value="employer">کارفرما</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setStatusFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchJobs();
                }}
                sx={{
                  bgcolor: ADMIN_THEME.bgLight,
                  color: ADMIN_THEME.primary,
                  '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight }
                }}
              >
                <Refresh />
              </IconButton>
            </Box>
        </Box>
      </Paper>
      )}

      {loading && jobs.length === 0 ? (
        /* نمایش اسکلتون در حالت لودینگ اولیه */
        isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((item) => (
              <JobCardSkeleton key={item} />
            ))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: `1px solid ${ADMIN_THEME.bgLight}`,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead sx={{ 
                  bgcolor: ADMIN_THEME.bgLight,
                  '& .MuiTableCell-head': {
                    fontWeight: 'bold',
                    color: ADMIN_THEME.primary,
                    fontSize: '0.9rem',
                    borderBottom: `2px solid ${ADMIN_THEME.primary}`,
                    textAlign: 'center',
                    py: 2
                  }
                }}>
                  <TableRow>
                    <TableCell sx={{ textAlign: 'left' }}>عنوان آگهی</TableCell>
                    <TableCell>کارفرما</TableCell>
                    <TableCell>شرکت</TableCell>
                    <TableCell>شهر (استان)</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>تاریخ ثبت</TableCell>
                    <TableCell>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableSkeleton headers={tableHeaders} rows={8} />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      ) : jobs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '12px', background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`, border: `2px solid ${ADMIN_THEME.bgLight}` }}>
          <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
            هیچ آگهی شغلی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
            آگهی‌ای با این مشخصات در سیستم وجود ندارد
          </Typography>
        </Paper>
      ) : (
        <>
          {/* نمایش موبایل - کارت‌ها */}
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(isSearching || loading) ? (
                // اسکلتون لودینگ هنگام جستجو
                [1, 2, 3].map((item) => (
                  <JobCardSkeleton key={item} />
                ))
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={openViewDialog}
                    onApprove={(job.status === 'R' || job.status === 'P') ? () => handleApproveJob(job.id) : undefined}
                    onReject={(job.status === 'A' || job.status === 'P') ? () => handleRejectJob(job.id) : undefined}
                    onDelete={() => handleDeleteJob(job.id)}
                  />
                ))
              ) : (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`,
                    border: `2px solid ${ADMIN_THEME.bgLight}`
                  }}
                >
                  <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
                    هیچ آگهی شغلی یافت نشد
                  </Typography>
                  <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                    آگهی‌ای با این مشخصات در سیستم وجود ندارد
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : (
            /* نمایش دسکتاپ - جدول */
          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: `1px solid ${ADMIN_THEME.bgLight}`,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead sx={{
                  bgcolor: ADMIN_THEME.bgLight,
                  '& .MuiTableCell-head': {
                    fontWeight: 'bold',
                    color: ADMIN_THEME.primary,
                    fontSize: '0.9rem',
                    borderBottom: `2px solid ${ADMIN_THEME.primary}`,
                    textAlign: 'center',
                    py: 2
                  }
                }}>
                  <TableRow>
                    <TableCell sx={{ textAlign: 'left' }}>عنوان آگهی</TableCell>
                    <TableCell>کارفرما</TableCell>
                    <TableCell>شرکت</TableCell>
                    <TableCell>شهر (استان)</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>تاریخ ثبت</TableCell>
                      <TableCell sx={{ textAlign: 'center', minWidth: 120, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.primary }}>
                            عملیات
                          </Typography>
                        </Box>
                      </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ 
                  '& .MuiTableCell-body': { 
                    py: 2, 
                    borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
                    textAlign: 'center'
                  },
                  '& .MuiTableCell-body:first-of-type': {
                    textAlign: 'left !important'
                  }
                }}>
                  {(isSearching || loading) ? (
                    <TableSkeleton headers={tableHeaders} rows={8} />
                  ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id} hover sx={{ '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight } }}>
                      <TableCell sx={{ textAlign: 'left !important' }}>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.3, maxWidth: 300, textAlign: 'left !important', direction: 'ltr' }}>
                            {job?.title || 'بدون عنوان'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <span title={job?.employer_detail?.full_name || ''}>
                          {truncateText(job?.employer_detail?.full_name || 'بدون کارفرما', 20)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span title={job?.company_detail?.name || ''}>
                          {truncateText(job?.company_detail?.name || 'بدون شرکت', 13)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}>
                            {job?.location_detail?.name || 'بدون شهر'}
                          </Typography>
                          {job?.location_detail?.province && (
                            <Typography variant="caption" sx={{ color: ADMIN_THEME.primary, opacity: 0.8, display: 'block', mt: 0.5 }}>
                              {typeof job.location_detail.province === 'object' && job.location_detail.province && 'name' in (job.location_detail.province as any)
                                ? (job.location_detail.province as any).name
                                : job.location_detail.province}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(job?.status || '') || 'نامشخص'}
                          color={getStatusColor(job?.status || '') as any}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        {job?.created_at ? new Date(job.created_at).toLocaleDateString('fa-IR') : 'بدون تاریخ'}
                      </TableCell>
                        <TableCell sx={{ textAlign: 'center', minWidth: 120, py: 2 }}>
                          <ActionButtons
                            onView={() => openViewDialog(job)}
                            onApprove={(job.status === 'R' || job.status === 'P') ? () => handleApproveJob(job.id) : undefined}
                            onReject={(job.status === 'A' || job.status === 'P') ? () => handleRejectJob(job.id) : undefined}
                            onDelete={() => handleDeleteJob(job.id)}
                            status={job.status}
                          size="small"
                          />
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          )}
        </>
      )}

          {/* پیجینیشن هوشمند */}
          {jobs.length > 0 && totalPages > 0 && (
            <CustomPagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              theme={ADMIN_THEME}
              showPageSizeSelector={true}
            />
      )}

      {/* View Dialog */}
      {viewDialog && selectedJob && (
        <>
          {/* Backdrop */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.6)',
              zIndex: 9999998,
            }}
            onClick={() => setViewDialog(false)}
          />
          {/* Modal Content */}
          <Box
            sx={{
              position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
              zIndex: 9999999,
              bgcolor: '#fff',
              borderRadius: 4,
              boxShadow: 6,
          minWidth: { xs: '90vw', sm: 500, md: 600 },
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
              p: { xs: 1, sm: 3 },
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translate(-50%, -50%) scale(0.8)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translate(-50%, -50%) scale(1)',
                },
              },
            }}
          >
            <JobAdminDetails
              job={selectedJob}
              onApprove={(selectedJob.status === 'R' || selectedJob.status === 'P') ? () => handleApproveJob(selectedJob.id) : undefined}
              onReject={(selectedJob.status === 'A' || selectedJob.status === 'P') ? () => handleRejectJob(selectedJob.id) : undefined}
              onDelete={() => handleDeleteJob(selectedJob.id)}
              onClose={() => setViewDialog(false)}
            />
          </Box>
        </>
      )}



             {/* Delete Confirmation Dialog */}
       <Dialog
         open={deleteWarningOpen}
         onClose={() => setDeleteWarningOpen(false)}
         maxWidth="sm"
         fullWidth
         sx={{
           '& .MuiDialog-paper': {
             borderRadius: 3,
             boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
             zIndex: 99999999,
             border: '1px solid #FEE2E2'
           },
           '& .MuiBackdrop-root': {
             backgroundColor: 'rgba(0,0,0,0.8)',
             zIndex: 99999998
           },
           zIndex: 99999997
         }}
       >
         <DialogTitle sx={{
           display: 'flex',
           alignItems: 'center',
           gap: 2,
           color: '#EF4444',
           fontWeight: 700,
           borderBottom: '1px solid #FEE2E2',
           pb: 2,
           bgcolor: '#FEF2F2',
           borderRadius: '12px 12px 0 0'
         }}>
           <Delete sx={{ 
             fontSize: 32, 
             color: '#EF4444',
             bgcolor: '#FEE2E2',
             borderRadius: '50%',
             p: 0.5
           }} />
           حذف آگهی شغلی
         </DialogTitle>
         
         <DialogContent sx={{ 
           pt: 3, 
           pb: 2,
           bgcolor: '#fff'
         }}>
           <Typography variant="body1" sx={{ 
             color: '#374151', 
             lineHeight: 1.8,
             fontSize: '1rem',
             fontWeight: 500
           }}>
             آیا از حذف این آگهی اطمینان دارید؟
           </Typography>
           <Typography variant="body2" sx={{ 
             color: '#6B7280', 
             lineHeight: 1.6,
             mt: 1,
             fontSize: '0.9rem'
           }}>
             این عمل برگشت‌پذیر نیست و تمام اطلاعات مربوط به آگهی حذف خواهد شد.
           </Typography>
         </DialogContent>
         
         <DialogActions sx={{
           gap: 2,
           px: 3,
           pb: 3,
           pt: 2,
           bgcolor: '#FEF2F2',
           borderRadius: '0 0 12px 12px',
           borderTop: '1px solid #FEE2E2'
         }}>
           <Button
             onClick={() => setDeleteWarningOpen(false)}
             variant="outlined"
             size="large"
             sx={{
               borderColor: '#D1D5DB',
               color: '#6B7280',
               fontWeight: 600,
               px: 3,
               py: 1,
               borderRadius: 2,
               '&:hover': {
                 borderColor: '#9CA3AF',
                 bgcolor: '#F9FAFB',
                 transform: 'translateY(-1px)',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
               },
               transition: 'all 0.2s ease'
             }}
           >
             انصراف
           </Button>
           <Button
             onClick={confirmDeleteJob}
             variant="contained"
             size="large"
             sx={{
               bgcolor: '#EF4444',
               color: 'white',
               fontWeight: 600,
               px: 3,
               py: 1,
               borderRadius: 2,
               '&:hover': {
                 bgcolor: '#DC2626',
                 transform: 'translateY(-1px)',
                 boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
               },
               transition: 'all 0.2s ease'
             }}
           >
             حذف آگهی
           </Button>
         </DialogActions>
       </Dialog>
    </Box>
  );
};

export default JobsManagement;