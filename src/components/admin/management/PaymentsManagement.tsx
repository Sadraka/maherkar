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
  Receipt,
  Payment
} from '@mui/icons-material';
import { apiGet, apiPut, apiDelete } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import TableSkeleton from '../components/TableSkeleton';
import PaymentAdminDetails from './PaymentAdminDetails';

interface PaymentRecord {
  id: string;
  owner: {
    id?: string;
    full_name: string;
    phone: string;
  };
  total_price: number;
  payment_status: string;
  ad_type: string;
  durations: number;
  created_at: string;
  updated_at: string;
  title: string;
  plan?: {
    id?: string;
    name: string;
  };
  advertisement?: {
    id?: string;
    title: string;
    company?: {
      id?: string;
      name?: string;
    };
  };
}

const PaymentsManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
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
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // ref برای نگهداری مقادیر جاری state
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // useCallback برای handleHashChange
  const handleHashChangePayments = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (hash.includes('#payments?search=')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const searchParam = urlParams.get('search');
      if (searchParam && searchParam !== searchQueryRef.current) {
        setSearchQuery(searchParam);
        setSearchInput(searchParam);
        setIsSearching(true);
        setPage(1);
      }
    } else if (hash === '#payments') {
      // اگر بدون پارامتر جستجو به payments آمده، جستجو را پاک کن
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
    handleHashChangePayments();

    // گوش دادن به تغییرات hash
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChangePayments);
      
      return () => window.removeEventListener('hashchange', handleHashChangePayments);
    }
  }, [handleHashChangePayments]);

  useEffect(() => {
    fetchPayments();
  }, [page, pageSize, searchQuery, statusFilter, sortBy, sortOrder]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // ساخت URL با query parameters
      const params = new URLSearchParams();
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (statusFilter) {
        params.append('payment_status', statusFilter);
      }
      
      if (sortBy) {
        params.append('sort_by', sortBy);
        params.append('sort_order', sortOrder);
      }
      
      const url = `/orders/subscriptions/?${params.toString()}`;
      const response = await apiGet(url);
      
      // Handle different response structures
      const data = response.data as any;
      let allPayments = [];
      
      if (data?.results) {
        // اگر backend pagination را پشتیبانی می‌کند
        allPayments = data.results;
      } else if (Array.isArray(data)) {
        // اگر backend pagination را پشتیبانی نمی‌کند
        allPayments = data;
      } else {
        allPayments = [];
      }

      // Backend فیلترینگ و مرتب‌سازی را انجام می‌دهد
      // فقط pagination در frontend انجام می‌شود
      const itemsPerPage = pageSize;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPayments = allPayments.slice(startIndex, endIndex);
      
      setPayments(paginatedPayments);
      setTotalPages(Math.ceil(allPayments.length / itemsPerPage));
    } catch (error: any) {
      console.error('خطا در دریافت پرداخت‌ها:', error);
      toast.error('خطا در دریافت اطلاعات پرداخت‌ها');
      setPayments([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      'pending': 'در انتظار پرداخت',
      'paid': 'پرداخت موفق',
      'failed': 'پرداخت ناموفق',
      'canceled': 'لغو شده',
      'cancelled': 'لغو شده'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'warning',
      'paid': 'success',
      'failed': 'error',
      'canceled': 'error',
      'cancelled': 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const getAdTypeLabel = (type: string) => {
    const types = {
      'J': 'شغل',
      'R': 'رزومه'
    };
    return types[type as keyof typeof types] || type;
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
      'created_at': 'تاریخ ثبت',
      'total_price': 'مبلغ',
      'owner': 'کاربر',
      'payment_status': 'وضعیت پرداخت',
      'title': 'عنوان آگهی'
    };
    return labels[field] || field;
  };

  // تابع کوتاه‌سازی متن
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const openViewDialog = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setViewDialog(true);
  };

  const tableHeaders = [
    'کاربر',
    'مبلغ',
    'نوع آگهی',
    'طرح',
    'وضعیت',
    'تاریخ',
    'آگهی',
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
              <Payment sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی پرداخت‌ها
        </Typography>
      </Box>

          <TextField
              fullWidth
              size="small"
              placeholder="جستجو در نام کاربر، شماره سفارش، عنوان آگهی..."
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
                <InputLabel>وضعیت پرداخت</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت پرداخت"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
            >
                  <MenuItem value="">همه وضعیت‌ها</MenuItem>
              <MenuItem value="pending">در انتظار پرداخت</MenuItem>
                  <MenuItem value="paid">پرداخت موفق</MenuItem>
              <MenuItem value="failed">پرداخت ناموفق</MenuItem>
                  <MenuItem value="canceled">لغو شده</MenuItem>
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
                  <MenuItem value="total_price">مبلغ</MenuItem>
                  <MenuItem value="owner">کاربر</MenuItem>
                  <MenuItem value="payment_status">وضعیت پرداخت</MenuItem>
                  <MenuItem value="title">عنوان آگهی</MenuItem>
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
                  fetchPayments();
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
              <Payment sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle1" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی پرداخت‌ها
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, mb: 1, mt: -1 }}>
              می‌توانید با هر کلیدواژه‌ای در نام کاربر، شماره سفارش، عنوان آگهی، طرح و ... جستجو کنید.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="جستجو در نام کاربر، شماره سفارش، عنوان آگهی..."
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
                <InputLabel>وضعیت پرداخت</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت پرداخت"
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
                  <MenuItem value="pending">در انتظار پرداخت</MenuItem>
                  <MenuItem value="paid">پرداخت موفق</MenuItem>
                  <MenuItem value="failed">پرداخت ناموفق</MenuItem>
                  <MenuItem value="canceled">لغو شده</MenuItem>
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
                  <MenuItem value="total_price">مبلغ</MenuItem>
                  <MenuItem value="owner">کاربر</MenuItem>
                  <MenuItem value="payment_status">وضعیت پرداخت</MenuItem>
                  <MenuItem value="title">عنوان آگهی</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setStatusFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchPayments();
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

      {loading && payments.length === 0 ? (
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
                    <TableCell>کاربر</TableCell>
                    <TableCell>مبلغ</TableCell>
                    <TableCell>نوع آگهی</TableCell>
                    <TableCell>طرح</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>تاریخ</TableCell>
                    <TableCell>آگهی</TableCell>
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
      ) : payments.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '12px', background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`, border: `2px solid ${ADMIN_THEME.bgLight}` }}>
          <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
          هیچ پرداختی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
            پرداختی با این مشخصات در سیستم وجود ندارد
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
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <Paper
                    key={payment.id}
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
                        {payment.owner?.full_name || 'نامشخص'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ADMIN_THEME.primary }}>
                        {payment.owner?.phone}
                      </Typography>
                      <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, fontWeight: 500 }}>
                        {formatAmount(payment.total_price)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: ADMIN_THEME.dark }}>
                        {payment.title || 'آگهی ایجاد نشده'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={getStatusLabel(payment.payment_status)}
                          color={getStatusColor(payment.payment_status) as any}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip 
                          label={getAdTypeLabel(payment.ad_type)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                                             <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, opacity: 0.7 }}>
                         {new Date(payment.created_at).toLocaleDateString('fa-IR')}
                       </Typography>
                       <Button
                         variant="outlined"
                         size="small"
                         fullWidth
                         onClick={() => openViewDialog(payment)}
                         sx={{
                           mt: 1,
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
                         مشاهده جزئیات
                       </Button>
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
                    هیچ پرداختی یافت نشد
                  </Typography>
                  <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                    پرداختی با این مشخصات در سیستم وجود ندارد
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
                  <TableCell>کاربر</TableCell>
                  <TableCell>مبلغ</TableCell>
                      <TableCell>نوع آگهی</TableCell>
                      <TableCell>طرح</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>تاریخ</TableCell>
                      <TableCell>آگهی</TableCell>
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
                {payments.map((payment) => (
                      <TableRow key={payment.id} hover sx={{ '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight } }}>
                    <TableCell>
                      <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                              {payment.owner?.full_name || 'نامشخص'}
                        </Typography>
                            <Typography variant="caption" sx={{ color: ADMIN_THEME.primary, display: 'block', mt: 0.5 }}>
                              {payment.owner?.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                            {formatAmount(payment.total_price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                            label={getAdTypeLabel(payment.ad_type)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <span title={payment.plan?.name || ''}>
                            {truncateText(payment.plan?.name || 'نامشخص', 20)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(payment.payment_status)}
                            color={getStatusColor(payment.payment_status) as any}
                        size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>
                          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.3, maxWidth: 180 }}>
                            {payment.title || 'آگهی ایجاد نشده'}
                      </Typography>
                    </TableCell>
                        <TableCell sx={{ textAlign: 'center', minWidth: 120, py: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openViewDialog(payment)}
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
                            مشاهده
                          </Button>
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
      {payments.length > 0 && totalPages > 0 && (
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
      {viewDialog && selectedPayment && (
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
            <PaymentAdminDetails
              payment={selectedPayment}
              onClose={() => setViewDialog(false)}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default PaymentsManagement;