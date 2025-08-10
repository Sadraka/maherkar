'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Refresh,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  Edit,
  Delete,
  MonetizationOn,
  Diamond,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import TableSkeleton from '../components/TableSkeleton';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  active: boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

const SubscriptionPlansManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_day: 0,
    active: true,
    is_free: false
  });

  // ref برای نگهداری مقادیر جاری state
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // useCallback برای handleHashChange
  const handleHashChangePlans = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (hash.includes('#subscription-plans?search=')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const searchParam = urlParams.get('search');
      if (searchParam && searchParam !== searchQueryRef.current) {
        setSearchQuery(searchParam);
        setSearchInput(searchParam);
        setIsSearching(true);
        setPage(1);
      }
    } else if (hash === '#subscription-plans') {
      if (searchQueryRef.current) {
        setSearchQuery('');
        setSearchInput('');
        setPage(1);
      }
    }
  }, []);

  // useEffect برای بررسی پارامترهای URL
  useEffect(() => {
    handleHashChangePlans();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChangePlans);
      return () => window.removeEventListener('hashchange', handleHashChangePlans);
    }
  }, [handleHashChangePlans]);

  useEffect(() => {
    fetchPlans();
  }, [page, pageSize, searchQuery, statusFilter, sortBy, sortOrder]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (statusFilter) {
        params.append('active', statusFilter);
      }
      
      if (sortBy) {
        params.append('sort_by', sortBy);
        params.append('sort_order', sortOrder);
      }
      
      const url = `/subscriptions/plans/?${params.toString()}`;
      const response = await apiGet(url);
      
      const data = response.data as any;
      
      let allPlans = [];
      
      if (data?.results) {
        allPlans = data.results;
      } else if (Array.isArray(data)) {
        allPlans = data;
      } else {
        allPlans = [];
      }

      const itemsPerPage = pageSize;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = allPlans.slice(startIndex, endIndex);
      
      setPlans(paginatedData);
      setTotalPages(Math.ceil(allPlans.length / itemsPerPage));
      
    } catch (error: any) {
      console.error('خطا در دریافت طرح‌های اشتراک:', error);
      toast.error('خطا در دریافت اطلاعات طرح‌های اشتراک');
      setPlans([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      'created_at': 'تاریخ ایجاد',
      'name': 'نام',
      'price_per_day': 'قیمت روزانه',
      'active': 'وضعیت'
    };
    return labels[field] || field;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'نامشخص';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR');
    } catch {
      return 'نامشخص';
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price_per_day: 0,
      active: true,
      is_free: false
    });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price_per_day: plan.price_per_day,
      active: plan.active,
      is_free: plan.is_free
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPlan) {
        await apiPut(`/subscriptions/plans/${editingPlan.id}/`, formData);
        toast.success('طرح اشتراک با موفقیت بروزرسانی شد');
      } else {
        await apiPost('/subscriptions/plans/', formData);
        toast.success('طرح اشتراک جدید با موفقیت ایجاد شد');
      }
      
      setDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      console.error('خطا در ذخیره طرح اشتراک:', error);
      toast.error('خطا در ذخیره طرح اشتراک');
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    
    try {
      await apiDelete(`/subscriptions/plans/${planToDelete.id}/`);
      toast.success('طرح اشتراک با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      console.error('خطا در حذف طرح اشتراک:', error);
      toast.error('خطا در حذف طرح اشتراک');
    }
  };

  const tableHeaders = [
    'نام طرح',
    'توضیحات',
    'قیمت روزانه',
    'وضعیت',
    'نوع',
    'تاریخ ایجاد',
    'عملیات'
  ];

  if (false) { // حذف بخش اسکلتون فعلی
    return (
      <Box>
        {/* Header با Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2, mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width="70%" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="30%" height={40} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        
        {/* نمایش موبایل - کارت‌های اسکلتون */}
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((item) => (
              <Paper
                key={item}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${ADMIN_THEME.bgLight}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          /* نمایش دسکتاپ - جدول اسکلتون */
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', maxWidth: '100%' }}>
            <TableContainer sx={{ maxWidth: '100%', overflow: 'hidden' }}>
              <Table sx={{ minWidth: 'auto' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 'auto', maxWidth: '150px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell sx={{ minWidth: 'auto', maxWidth: '120px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell sx={{ minWidth: 'auto', maxWidth: '120px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell sx={{ minWidth: 'auto', maxWidth: '100px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell sx={{ minWidth: 'auto', maxWidth: '100px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell sx={{ minWidth: 'auto', maxWidth: '80px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell sx={{ minWidth: 'auto', maxWidth: '100px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <TableRow key={item}>
                      <TableCell sx={{ minWidth: 'auto', maxWidth: '150px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                      <TableCell sx={{ minWidth: 'auto', maxWidth: '120px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                      <TableCell sx={{ minWidth: 'auto', maxWidth: '120px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                      <TableCell sx={{ minWidth: 'auto', maxWidth: '100px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                      <TableCell sx={{ minWidth: 'auto', maxWidth: '100px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                      <TableCell sx={{ minWidth: 'auto', maxWidth: '80px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                      <TableCell sx={{ minWidth: 'auto', maxWidth: '100px' }}><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    );
  }

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
              <Diamond sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی طرح‌های اشتراک
              </Typography>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="جستجو در نام طرح..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
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
              onClick={handleSearch}
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
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value="">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="true">فعال</MenuItem>
                  <MenuItem value="false">غیرفعال</MenuItem>
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
                  <MenuItem value="created_at">تاریخ ایجاد</MenuItem>
                  <MenuItem value="name">نام</MenuItem>
                  <MenuItem value="price_per_day">قیمت روزانه</MenuItem>
                  <MenuItem value="active">وضعیت</MenuItem>
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
                  fetchPlans();
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
              <Diamond sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle1" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی طرح‌های اشتراک
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, mb: 1, mt: -1 }}>
              می‌توانید با هر کلیدواژه‌ای در نام طرح، توضیحات و ... جستجو کنید.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="جستجو در نام طرح..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
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
                onClick={handleSearch}
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
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت"
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
                  <MenuItem value="true">فعال</MenuItem>
                  <MenuItem value="false">غیرفعال</MenuItem>
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
                  <MenuItem value="created_at">تاریخ ایجاد</MenuItem>
                  <MenuItem value="name">نام</MenuItem>
                  <MenuItem value="price_per_day">قیمت روزانه</MenuItem>
                  <MenuItem value="active">وضعیت</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setStatusFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchPlans();
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

      {/* Add Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          sx={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important',
            backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important',
            color: 'white !important',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%) !important',
              backgroundColor: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%) !important',
              boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          افزودن طرح جدید
        </Button>
      </Box>

      {/* Content */}
      {loading && plans.length === 0 ? (
        /* نمایش اسکلتون در حالت لودینگ اولیه */
        isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((item) => (
              <Paper
                key={item}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${ADMIN_THEME.bgLight}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              </Paper>
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
                    <TableCell>نام طرح</TableCell>
                    <TableCell>توضیحات</TableCell>
                    <TableCell>قیمت روزانه</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>نوع</TableCell>
                    <TableCell>تاریخ ایجاد</TableCell>
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
      ) : plans.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '12px', background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`, border: `2px solid ${ADMIN_THEME.bgLight}` }}>
          <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
            هیچ طرح اشتراکی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
            طرح اشتراکی با این مشخصات در سیستم وجود ندارد
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
                  <Paper
                    key={item}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${ADMIN_THEME.bgLight}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : plans.length > 0 ? (
                plans.map((plan) => (
                  <Paper
                    key={plan.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${ADMIN_THEME.bgLight}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ADMIN_THEME.primary }}>
                        {truncateText(plan.description, 100)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, fontWeight: 500 }}>
                        {plan.is_free ? 'رایگان' : formatPrice(plan.price_per_day)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={plan.active ? 'فعال' : 'غیرفعال'}
                          color={plan.active ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          label={plan.is_free ? 'رایگان' : 'پولی'}
                          color={plan.is_free ? 'info' : 'primary'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, opacity: 0.7 }}>
                        {formatDate(plan.created_at)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => openEditDialog(plan)}
                          sx={{
                            flex: 1,
                            borderColor: ADMIN_THEME.primary,
                            color: ADMIN_THEME.primary,
                            fontSize: '0.75rem',
                            py: 0.5,
                            '&:hover': {
                              bgcolor: `${ADMIN_THEME.primary}08`,
                              borderColor: ADMIN_THEME.primary
                            }
                          }}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => openDeleteDialog(plan)}
                          sx={{
                            flex: 1,
                            borderColor: '#f44336',
                            color: '#f44336',
                            fontSize: '0.75rem',
                            py: 0.5,
                            '&:hover': {
                              bgcolor: '#f4433608',
                              borderColor: '#f44336'
                            }
                          }}
                        >
                          حذف
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
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
                    هیچ طرح اشتراکی یافت نشد
                  </Typography>
                  <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                    طرح اشتراکی با این مشخصات در سیستم وجود ندارد
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
                      <TableCell>نام طرح</TableCell>
                      <TableCell>توضیحات</TableCell>
                      <TableCell>قیمت روزانه</TableCell>
                      <TableCell>وضعیت</TableCell>
                      <TableCell>نوع</TableCell>
                      <TableCell>تاریخ ایجاد</TableCell>
                      <TableCell sx={{ textAlign: 'center', minWidth: 120, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.primary }}>
                            عملیات
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ '& .MuiTableCell-body': { textAlign: 'center', py: 2, borderBottom: `1px solid ${ADMIN_THEME.bgLight}` } }}>
                    {plans.map((plan) => (
                      <TableRow 
                        key={plan.id} 
                        hover
                        sx={{ '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                            {plan.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <span title={plan.description}>
                            {truncateText(plan.description, 50)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                            {plan.is_free ? 'رایگان' : formatPrice(plan.price_per_day)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={plan.active ? 'فعال' : 'غیرفعال'}
                            color={plan.active ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={plan.is_free ? 'رایگان' : 'پولی'}
                            color={plan.is_free ? 'info' : 'primary'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark }}>
                            {formatDate(plan.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', minWidth: 120, py: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => openEditDialog(plan)}
                              sx={{
                                borderColor: ADMIN_THEME.primary,
                                color: ADMIN_THEME.primary,
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 2,
                                '&:hover': {
                                  bgcolor: `${ADMIN_THEME.primary}08`,
                                  borderColor: ADMIN_THEME.primary
                                }
                              }}
                            >
                              ویرایش
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => openDeleteDialog(plan)}
                              sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 2,
                                '&:hover': {
                                  bgcolor: '#f4433608',
                                  borderColor: '#f44336'
                                }
                              }}
                            >
                              حذف
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* پیجینیشن هوشمند */}
      {plans.length > 0 && totalPages > 0 && (
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

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid rgba(124, 58, 237, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          textAlign: 'center',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Diamond sx={{ fontSize: '1.5rem' }} />
            <Typography variant="h6" fontWeight="600">
              {editingPlan ? 'ویرایش طرح اشتراک' : 'ایجاد طرح اشتراک جدید'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: 'white',
              border: '1px solid rgba(124, 58, 237, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="subtitle2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600, mb: 1 }}>
                اطلاعات اصلی طرح
              </Typography>
              <TextField
                label="نام طرح"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                sx={{
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
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />
              <TextField
                label="توضیحات"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                sx={{ 
                  mt: 2,
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
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: 'white',
              border: '1px solid rgba(124, 58, 237, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="subtitle2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600, mb: 2 }}>
                تنظیمات قیمت و وضعیت
              </Typography>
              <TextField
                label="قیمت روزانه (تومان)"
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: parseInt(e.target.value) || 0 })}
                fullWidth
                disabled={formData.is_free}
                sx={{
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
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_free}
                      onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: ADMIN_THEME.primary,
                          '&:hover': {
                            backgroundColor: 'rgba(124, 58, 237, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: ADMIN_THEME.primary,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      طرح رایگان
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10b981',
                          '&:hover': {
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10b981',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      فعال
                    </Typography>
                  }
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          pt: 1,
          background: 'rgba(248, 250, 252, 0.8)',
          borderRadius: '0 0 12px 12px'
        }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: '#94a3b8',
              color: '#64748b',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: '#f1f5f9'
              }
            }}
          >
            انصراف
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: 'white',
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {editingPlan ? 'بروزرسانی' : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">
            حذف طرح اشتراک
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف طرح اشتراک "{planToDelete?.name}" اطمینان دارید؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            انصراف
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPlansManagement; 