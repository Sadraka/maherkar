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
  Search,
  Subscriptions,
  FilterList,
  Refresh,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  Person,
  Business,
  Diamond,
  AccessTime,
  Event,
  MonetizationOn,
  Payment
} from '@mui/icons-material';
import { apiGet } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import TableSkeleton from '../components/TableSkeleton';
import SubscriptionAdminDetails from './SubscriptionAdminDetails';

interface SubscriptionRecord {
  id: string;
  owner: {
    id?: string;
    full_name: string;
    phone: string;
    user_type?: string; // نوع کاربر: EM, JS
  };
  plan: {
    id?: string;
    name: string;
    price_per_day?: number;
    plan_type?: string; // نوع طرح: B, J, R
  };
  subscription_status: string;
  duration: number;
  durations?: number;
  synced_duration?: number;
  synced_plan?: any;
  synced_start_date?: string;
  synced_end_date?: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  total_price?: number;
  payment_status?: string;
  title?: string;
  advertisement?: {
    id?: string;
    title: string;
  };
  subscription?: string;
  ad_type?: string; // نوع آگهی: J, R
}

const SubscriptionsManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState(''); // فیلتر نوع کاربر
  const [adTypeFilter, setAdTypeFilter] = useState(''); // فیلتر نوع آگهی
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // ref برای نگهداری مقادیر جاری state
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // useCallback برای handleHashChange
  const handleHashChangeSubscriptions = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (hash.includes('#subscriptions?search=')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const searchParam = urlParams.get('search');
      if (searchParam && searchParam !== searchQueryRef.current) {
        setSearchQuery(searchParam);
        setSearchInput(searchParam);
        setPage(1);
      }
    } else if (hash === '#subscriptions') {
      // اگر بدون پارامتر جستجو به subscriptions آمده، جستجو را پاک کن
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
    handleHashChangeSubscriptions();

    // گوش دادن به تغییرات hash
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChangeSubscriptions);
      
      return () => window.removeEventListener('hashchange', handleHashChangeSubscriptions);
    }
  }, [handleHashChangeSubscriptions]);

  useEffect(() => {
    fetchSubscriptions();
  }, [page, pageSize, searchQuery, statusFilter, userTypeFilter, adTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    const fetchSubscriptionDates = async () => {
      const updated = await Promise.all(subscriptions.map(async (sub) => {
        if (sub.subscription) {
          try {
            const res = await apiGet(`/subscriptions/advertisement-subscription/${sub.subscription}/`);
            const data = res.data as any;
            return {
              ...sub,
              start_date: data.start_date,
              end_date: data.end_date,
            };
          } catch {
            return sub;
          }
        }
        return sub;
      }));
      setSubscriptions(updated);
    };
    if (subscriptions.some(sub => sub.subscription)) {
      fetchSubscriptionDates();
    }
    // eslint-disable-next-line
  }, [subscriptions.length]);

  const fetchSubscriptions = async () => {
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
      
      if (userTypeFilter) {
        params.append('user_type', userTypeFilter);
      }
      
      if (adTypeFilter) {
        params.append('ad_type', adTypeFilter);
      }
      
      if (sortBy) {
        params.append('sort_by', sortBy);
        params.append('sort_order', sortOrder);
      }
      
      // استفاده از endpoint مناسب برای اشتراک‌ها - از Orders استفاده می‌کنیم چون اطلاعات کاربر را دارد
      const url = `/orders/subscriptions/?${params.toString()}`;
      const response = await apiGet(url);
      
      // Handle different response structures
      const data = response.data as any;
      let allSubscriptions = [];
      
      if (data?.results) {
        // اگر backend pagination را پشتیبانی می‌کند
        allSubscriptions = data.results;
      } else if (Array.isArray(data)) {
        // اگر backend pagination را پشتیبانی نمی‌کند
        allSubscriptions = data;
      } else {
        allSubscriptions = [];
      }

      // تبدیل داده‌ها به فرمت مورد نظر frontend - از Orders
      const formattedSubscriptions = allSubscriptions.map((sub: any) => ({
        id: sub.id,
        owner: {
          id: sub.owner?.id,
          full_name: sub.owner?.full_name || 'نامشخص',
          phone: sub.owner?.phone || 'نامشخص',
          user_type: sub.owner?.user_type // نوع کاربر
        },
        plan: {
          id: sub.plan?.id,
          name: sub.plan?.name || 'نامشخص',
          price_per_day: sub.plan?.price_per_day,
          plan_type: sub.plan?.plan_type // نوع طرح
        },
        subscription_status: sub.payment_status || 'pending', // از payment_status استفاده می‌کنیم
        duration: sub.durations || 0, // از durations استفاده می‌کنیم
        start_date: sub.created_at, // از created_at استفاده می‌کنیم
        end_date: sub.updated_at, // از updated_at استفاده می‌کنیم
        created_at: sub.created_at,
        updated_at: sub.updated_at,
        total_price: sub.total_price,
        payment_status: sub.payment_status,
        title: sub.title,
        advertisement: sub.advertisement,
        subscription: sub.subscription, // id اشتراک
        ad_type: sub.ad_type // نوع آگهی
      }));

      // Frontend فیلترینگ (اگر backend آن را انجام نداد)
      let filteredSubscriptions = formattedSubscriptions;
      
      // فیلتر بر اساس نوع کاربر
      if (userTypeFilter) {
        filteredSubscriptions = filteredSubscriptions.filter(sub => 
          sub.owner?.user_type === userTypeFilter
        );
      }
      
      // فیلتر بر اساس نوع آگهی
      if (adTypeFilter) {
        filteredSubscriptions = filteredSubscriptions.filter(sub => 
          sub.ad_type === adTypeFilter
        );
      }

      // Pagination
      const itemsPerPage = pageSize;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filteredSubscriptions.slice(startIndex, endIndex);
      
      setSubscriptions(paginatedData);
      setTotalPages(Math.ceil(filteredSubscriptions.length / itemsPerPage));
      
    } catch (error: any) {
      console.error('خطا در دریافت اشتراک‌ها:', error);
      toast.error('خطا در دریافت اطلاعات اشتراک‌ها');
      setSubscriptions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const getStatusText = (subscription_status: string) => {
    const statusMap = {
      'default': 'پیش‌فرض',
      'special': 'ویژه',
      'active': 'فعال',
      'expired': 'منقضی شده',
      'cancelled': 'لغو شده',
      'pending': 'در انتظار',
      'paid': 'پرداخت شده',
      'canceled': 'لغو شده',
      'failed': 'ناموفق'
    };
    return statusMap[subscription_status as keyof typeof statusMap] || subscription_status;
  };

  const getStatusColor = (subscription_status: string) => {
    const colors = {
      'default': 'default',
      'special': 'secondary',
      'active': 'success',
      'expired': 'error',
      'cancelled': 'error',
      'pending': 'warning',
      'paid': 'success',
      'canceled': 'error',
      'failed': 'error'
    };
    return colors[subscription_status as keyof typeof colors] || 'default';
  };

  // تابع تبدیل نوع کاربر به متن فارسی
  const getUserTypeText = (userType: string) => {
    const typeMap = {
      'EM': 'کارفرما',
      'JS': 'کارجو',
      'AD': 'ادمین',
      'SU': 'پشتیبان'
    };
    return typeMap[userType as keyof typeof typeMap] || userType;
  };

  // تابع تبدیل نوع آگهی به متن فارسی
  const getAdTypeText = (adType: string) => {
    const typeMap = {
      'J': 'آگهی شغل',
      'R': 'آگهی رزومه'
    };
    return typeMap[adType as keyof typeof typeMap] || adType;
  };

  // تابع رنگ برای نوع کاربر
  const getUserTypeColor = (userType: string) => {
    const colors = {
      'EM': 'primary',
      'JS': 'secondary',
      'AD': 'error',
      'SU': 'warning'
    };
    return colors[userType as keyof typeof colors] || 'default';
  };

  // تابع رنگ برای نوع آگهی
  const getAdTypeColor = (adType: string) => {
    const colors = {
      'J': 'info',
      'R': 'success'
    };
    return colors[adType as keyof typeof colors] || 'default';
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'نامشخص';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  // تابع تبدیل اعداد به فارسی
  const convertToPersianNumbers = (num: number | string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/[0-9]/g, (d) => persianNumbers[parseInt(d)]);
  };

  // تابع تبدیل تاریخ میلادی به شمسی
  const gregorianToJalali = (gy: number, gm: number, gd: number): [number, number, number] => {
    const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = 0;
    
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
    
    jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    
    let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    
    return [jy, jm, jd];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'نامشخص';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'نامشخص';
      
      // تبدیل به تاریخ شمسی
      const [year, month, day] = gregorianToJalali(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );
      
      // فرمت کردن تاریخ به صورت عددی
      const formattedDate = `${convertToPersianNumbers(year.toString().padStart(4, '0'))}/${convertToPersianNumbers(month.toString().padStart(2, '0'))}/${convertToPersianNumbers(day.toString().padStart(2, '0'))}`;
      
      return formattedDate;
    } catch (error) {
      return 'نامشخص';
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchQuery(searchInput);
    setPage(1);
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

  const openViewDialog = (subscription: SubscriptionRecord) => {
    setSelectedSubscription(subscription);
    setViewDialog(true);
  };

  const tableHeaders = [
    'کاربر',
    'نوع کاربر',
    'نام پلن',
    'نوع آگهی',
    'مدت',
    'تاریخ شروع',
    'تاریخ پایان',
    'وضعیت',
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
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${ADMIN_THEME.bgLight}` }}>
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
                  <TableCell>نام پلن</TableCell>
                  <TableCell>مدت</TableCell>
                  <TableCell>تاریخ شروع</TableCell>
                  <TableCell>تاریخ پایان</TableCell>
                  <TableCell>وضعیت</TableCell>
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
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box>
                        <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width={100} height={16} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={120} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={100} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={100} height={20} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', minWidth: 120, py: 2 }}>
                      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Section */}
      {isMobile ? (
        /* نمایش موبایل */
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
            <TextField
              fullWidth
              placeholder="جستجو در اشتراک‌ها..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: ADMIN_THEME.bgLight,
                  },
                  '&:hover fieldset': {
                    borderColor: ADMIN_THEME.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: ADMIN_THEME.primary,
                  }
                }
              }}
            />
            
            <Button
              fullWidth
              variant="outlined"
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
              <Person sx={{ color: ADMIN_THEME.primary, fontSize: '1.1rem' }} />
              <FormControl fullWidth size="small">
                <InputLabel>نوع کاربر</InputLabel>
                <Select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  label="نوع کاربر"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value="">همه کاربران</MenuItem>
                  <MenuItem value="EM">کارفرما</MenuItem>
                  <MenuItem value="JS">کارجو</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Diamond sx={{ color: ADMIN_THEME.primary, fontSize: '1.1rem' }} />
              <FormControl fullWidth size="small">
                <InputLabel>نوع آگهی</InputLabel>
                <Select
                  value={adTypeFilter}
                  onChange={(e) => setAdTypeFilter(e.target.value)}
                  label="نوع آگهی"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value="">همه آگهی‌ها</MenuItem>
                  <MenuItem value="J">آگهی شغل</MenuItem>
                  <MenuItem value="R">آگهی رزومه</MenuItem>
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
                  setUserTypeFilter('');
                  setAdTypeFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchSubscriptions();
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
                جستجو، فیلتر و مرتب‌سازی اشتراک‌ها
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
                placeholder="جستجو بر اساس نام کاربر، نام پلن یا شماره تماس..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ flexGrow: 1, minWidth: 200 }}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }
            }}
          />
              
          <FormControl sx={{ minWidth: 150 }}>
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

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>نوع کاربر</InputLabel>
                <Select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  label="نوع کاربر"
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
                  <MenuItem value="">همه کاربران</MenuItem>
                  <MenuItem value="EM">کارفرما</MenuItem>
                  <MenuItem value="JS">کارجو</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>نوع آگهی</InputLabel>
                <Select
                  value={adTypeFilter}
                  onChange={(e) => setAdTypeFilter(e.target.value)}
                  label="نوع آگهی"
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
                  <MenuItem value="">همه آگهی‌ها</MenuItem>
                  <MenuItem value="J">آگهی شغل</MenuItem>
                  <MenuItem value="R">آگهی رزومه</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
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
                  setUserTypeFilter('');
                  setAdTypeFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchSubscriptions();
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

      {loading && subscriptions.length === 0 ? (
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
                    <TableCell>نوع کاربر</TableCell>
                    <TableCell>نام پلن</TableCell>
                    <TableCell>نوع آگهی</TableCell>
                    <TableCell>مدت</TableCell>
                    <TableCell>تاریخ شروع</TableCell>
                    <TableCell>تاریخ پایان</TableCell>
                    <TableCell>وضعیت</TableCell>
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
      ) : subscriptions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '12px', background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`, border: `2px solid ${ADMIN_THEME.bgLight}` }}>
          <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
          هیچ اشتراکی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
            اشتراکی با این مشخصات در سیستم وجود ندارد
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
              ) : subscriptions.length > 0 ? (
                subscriptions.map((subscription) => (
                  <Paper
                    key={subscription.id}
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
                        {subscription.owner?.full_name || 'نامشخص'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ADMIN_THEME.primary }}>
                        {subscription.owner?.phone}
                      </Typography>
                      {subscription.title && (
                        <Typography variant="caption" sx={{ color: ADMIN_THEME.primary, display: 'block' }}>
                          {subscription.title}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={getUserTypeText(subscription.owner?.user_type || '')}
                          color={getUserTypeColor(subscription.owner?.user_type || '') as any}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <Chip 
                          label={getAdTypeText(subscription.ad_type || '')}
                          color={getAdTypeColor(subscription.ad_type || '') as any}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <Chip 
                          label={getStatusText(subscription.subscription_status)}
                          color={getStatusColor(subscription.subscription_status) as any}
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <Chip 
                          label={`${convertToPersianNumbers(subscription.synced_duration || subscription.durations || subscription.duration)} روز`}
                          variant="outlined"
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => openViewDialog(subscription)}
                          sx={{
                            bgcolor: `${ADMIN_THEME.primary}15`,
                            color: ADMIN_THEME.primary,
                            '&:hover': {
                              bgcolor: `${ADMIN_THEME.primary}25`,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : null}
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
              <TableContainer sx={{ overflowX: 'auto' }}>
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
                      <TableCell>نوع کاربر</TableCell>
                      <TableCell>نام پلن</TableCell>
                      <TableCell>نوع آگهی</TableCell>
                      <TableCell>مدت</TableCell>
                      <TableCell>تاریخ شروع</TableCell>
                      <TableCell>تاریخ پایان</TableCell>
                      <TableCell>وضعیت</TableCell>
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
                {subscriptions.map((subscription) => (
                    <TableRow 
                      key={subscription.id} 
                      hover
                        sx={{ '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight } }}
                    >
                    <TableCell>
                      <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                            {subscription.owner?.full_name || 'نامشخص'}
                        </Typography>
                          <Typography variant="caption" sx={{ color: ADMIN_THEME.primary, display: 'block', mt: 0.5 }}>
                              {subscription.owner?.phone}
                            </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getUserTypeText(subscription.owner?.user_type || '')}
                          color={getUserTypeColor(subscription.owner?.user_type || '') as any}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <span title={subscription.plan?.name || ''}>
                          {truncateText(subscription.plan?.name || 'نامشخص', 20)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getAdTypeText(subscription.ad_type || '')}
                          color={getAdTypeColor(subscription.ad_type || '') as any}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                          {convertToPersianNumbers(subscription.synced_duration || subscription.durations || subscription.duration)} روز
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" sx={{ color: ADMIN_THEME.dark }}>
                            {formatDate(subscription.start_date)}
                          </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" sx={{ color: ADMIN_THEME.dark }}>
                            {formatDate(subscription.end_date)}
                          </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                          label={getStatusText(subscription.subscription_status)}
                          color={getStatusColor(subscription.subscription_status) as any}
                        size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                      />
                    </TableCell>
                      <TableCell sx={{ textAlign: 'center', minWidth: 80, py: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDialog(subscription);
                          }}
                          sx={{
                            bgcolor: `${ADMIN_THEME.primary}15`,
                            color: ADMIN_THEME.primary,
                            '&:hover': {
                              bgcolor: `${ADMIN_THEME.primary}25`,
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
            </Paper>
          )}

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={3}>
            <CustomPagination 
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={(newPage: number) => setPage(newPage)}
              onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
              theme={ADMIN_THEME}
              showPageSizeSelector={true}
            />
          </Box>
        </>
      )}

      {/* Subscription Details Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            width: '95%',
            maxWidth: '900px'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedSubscription && (
            <SubscriptionAdminDetails 
              subscription={selectedSubscription} 
              onClose={() => setViewDialog(false)}
              onUpdate={(updatedSubscription) => {
                // بروزرسانی لیست اشتراکات
                setSubscriptions(prev => 
                  prev.map(sub => 
                    sub.id === updatedSubscription.id ? updatedSubscription : sub
                  )
                );
                // بروزرسانی اشتراک انتخاب شده
                setSelectedSubscription(updatedSubscription);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubscriptionsManagement;