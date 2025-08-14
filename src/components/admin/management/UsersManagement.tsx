'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Skeleton
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
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
  ArrowDownward
} from '@mui/icons-material';
import { apiGet, apiPatch, apiDelete } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_THEME, JOB_SEEKER_THEME, EMPLOYER_THEME, SUPPORT_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import UserDetailsModal from '../modals/UserDetailsModal';
import UserCard from '../components/UserCard';
import UserCardSkeleton from '../components/UserCardSkeleton';
import TableSkeleton from '../components/TableSkeleton';
import WarningModal from '../components/WarningModal';

// تابع تبدیل تاریخ میلادی به شمسی
const convertToJalali = (gregorianDate: string): string => {
  try {
    const date = new Date(gregorianDate);
    // استفاده از API تاریخ شمسی برای تبدیل تاریخ
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('خطا در تبدیل تاریخ:', error);
    return gregorianDate || 'نامشخص';
  }
};

// تابع تبدیل اعداد به فارسی
const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

interface User {
  id: string;
  full_name: string;
  phone: string;
  user_type: string;
  status: string;
  joined_date: string;
  is_active: boolean;
  last_updated: string;
  last_login?: string;
  is_staff?: boolean;
  groups?: string[];
  profile_picture?: string;
  username?: string;
}

const UsersManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [warningModal, setWarningModal] = useState(false);
  const [warningAction, setWarningAction] = useState<'delete' | 'edit'>('delete');
  const [warningUser, setWarningUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchInput, setSearchInput] = useState(''); // برای input جداگانه
  const [isSearching, setIsSearching] = useState(false); // برای نمایش اسکلتون هنگام جستجو
  const [sortBy, setSortBy] = useState('joined_date'); // فیلد مرتب‌سازی
  const [sortOrder, setSortOrder] = useState('desc'); // ترتیب مرتب‌سازی (asc/desc)
  const [pageSize, setPageSize] = useState(10); // تعداد کاربران در هر صفحه
  const [editForm, setEditForm] = useState({
    full_name: '',
    user_type: '',
    status: 'ACT'
  });

  // ref برای نگهداری مقادیر جاری state
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // useCallback برای handleHashChange
  const handleHashChangeUsers = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (hash.includes('#users?search=')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const searchParam = urlParams.get('search');
      if (searchParam && searchParam !== searchQueryRef.current) {
        setSearchInput(searchParam);
        setIsSearching(true);
        setPage(1);
        // فراخوانی مستقیم جستجو با تاخیر کوتاه
        setTimeout(() => {
          setSearchQuery(searchParam);
        }, 100);
      }
    } else if (hash === '#users') {
      // اگر بدون پارامتر جستجو به users آمده، جستجو را پاک کن
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
    handleHashChangeUsers();

    // گوش دادن به تغییرات hash
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChangeUsers);
      
      return () => window.removeEventListener('hashchange', handleHashChangeUsers);
    }
  }, [handleHashChangeUsers]);

  // useEffect اولیه برای بارگذاری کاربران
  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, sortBy, sortOrder, searchQuery, filterType]);

  // useEffect برای مدیریت تغییرات جستجو و فیلتر
  useEffect(() => {
    if (searchQuery || filterType) {
      console.log('جستجو یا فیلتر تغییر کرد:', { searchQuery, filterType });
      setIsSearching(true);
      setPage(1);
    }
  }, [searchQuery, filterType]);

  // useEffect برای مدیریت تغییرات مرتب‌سازی
  useEffect(() => {
    if (sortBy || sortOrder) {
      console.log('مرتب‌سازی تغییر کرد:', { sortBy, sortOrder });
      setIsSearching(true);
      setPage(1);
    }
  }, [sortBy, sortOrder]);

  // useEffect برای مدیریت تغییر تعداد صفحات
  useEffect(() => {
    console.log('تعداد کاربران در هر صفحه تغییر کرد:', pageSize);
    setIsSearching(true);
    setPage(1);
  }, [pageSize]);

  // useEffect برای بررسی و تصحیح صفحه جاری
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      console.log('صفحه جاری از محدوده خارج شده، تصحیح می‌شود:', { page, totalPages });
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/users/`;

      // اضافه کردن پارامترهای جستجو و فیلتر
      const params = new URLSearchParams();
      
      // تعداد کاربران در هر صفحه
      params.append('page_size', pageSize.toString());
      
      // شماره صفحه - اگر جستجو انجام شده، به صفحه اول برو
      const currentPage = searchQuery.trim() || filterType ? 1 : page;
      params.append('page', currentPage.toString());
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (filterType) {
        params.append('user_type', filterType);
      }

      // اضافه کردن پارامترهای مرتب‌سازی
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);

      // اضافه کردن پارامترها به URL
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('درخواست API:', url); // برای دیباگ

      const response = await apiGet(url);

      // Handle different response structures
      const data = response.data as any;
      if (data?.results) {
        // اگر backend pagination را پشتیبانی می‌کند
        setUsers(data.results);
        const newTotalPages = Math.ceil(data.count / pageSize);
        setTotalPages(newTotalPages);
        
        // بررسی و تصحیح صفحه جاری
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      } else if (Array.isArray(data)) {
        // اگر backend pagination را پشتیبانی نمی‌کند، خودمان pagination می‌کنیم
        const currentPage = searchQuery.trim() || filterType ? 1 : page;
        const newTotalPages = Math.ceil(data.length / pageSize);
        
        // بررسی و تصحیح صفحه جاری
        const validPage = currentPage > newTotalPages && newTotalPages > 0 ? newTotalPages : currentPage;
        
        const startIndex = (validPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = data.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
        setTotalPages(newTotalPages);
        
        // اگر صفحه تغییر کرده، آن را به‌روزرسانی کن
        if (validPage !== currentPage) {
          setPage(validPage);
        }
      } else {
        setUsers([]);
        setTotalPages(1);
        setPage(1);
      }
      
      console.log('کاربران دریافت شده:', data); // برای دیباگ
    } catch (error: any) {
      console.error('خطا در دریافت کاربران:', error);
      toast.error('خطا در دریافت اطلاعات کاربران');
      setUsers([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [page, pageSize, sortBy, sortOrder, searchQuery, filterType, isSearching]);

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const userData = {
        ...editForm,
      };

      await apiPatch(`/users/${selectedUser.id}/`, userData);
      toast.success('اطلاعات کاربر با موفقیت به‌روزرسانی شد');
      fetchUsers();
      setEditDialog(false);
      setSelectedUser(null);
      
      // نمایش warning بعد از ویرایش موفق
      openWarningModal(selectedUser, 'edit');
    } catch (error: any) {
      console.error('خطا در ویرایش کاربر:', error);
      toast.error('خطا در ویرایش اطلاعات کاربر');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;

    try {
      await apiDelete(`/users/${userId}/`);
      toast.success('کاربر با موفقیت حذف شد');
      fetchUsers();
    } catch (error: any) {
      console.error('خطا در حذف کاربر:', error);
      toast.error('خطا در حذف کاربر');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      user_type: user.user_type,
      status: user.status || 'ACT'
    });
    setEditDialog(true);
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setViewDialog(true);
  };

  const openWarningModal = (user: User, action: 'delete' | 'edit') => {
    setWarningUser(user);
    setWarningAction(action);
    setWarningModal(true);
  };

  const handleWarningConfirm = () => {
    if (!warningUser) return;
    
    if (warningAction === 'delete') {
      handleDeleteUser(warningUser.id);
    } else if (warningAction === 'edit') {
      openEditDialog(warningUser);
    }
    
    setWarningModal(false);
    setWarningUser(null);
  };

  const handleDeleteWithWarning = (user: User) => {
    openWarningModal(user, 'delete');
  };

  const handleEditWithWarning = (user: User) => {
    openEditDialog(user);
  };

  const getUserTypeLabel = (type: string) => {
    const types = {
      'JS': 'کارجو',
      'EM': 'کارفرما',
      'AD': 'مدیریت',
      'SU': 'پشتیبان'
    };
    return types[type as keyof typeof types] || type;
  };

  const getUserTypeColor = (type: string) => {
    const colors = {
      'JS': 'success',
      'EM': 'primary',
      'AD': 'error',
      'SU': 'warning'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  // تابع جدید برای دریافت رنگ‌های تم بر اساس نوع کاربر
  const getUserTypeTheme = (type: string) => {
    switch (type) {
      case 'JS':
        return JOB_SEEKER_THEME;
      case 'EM':
        return EMPLOYER_THEME;
      case 'AD':
        return ADMIN_THEME;
      case 'SU':
        return SUPPORT_THEME;
      default:
        return ADMIN_THEME;
    }
  };

  // تابع برای دریافت نام فارسی فیلدهای مرتب‌سازی
  const getSortFieldLabel = (field: string) => {
    const labels = {
      'id': 'شناسه',
      'full_name': 'نام کامل',
      'phone': 'شماره تماس',
      'user_type': 'نوع کاربر',
      'status': 'وضعیت',
      'joined_date': 'تاریخ عضویت',
      'last_updated': 'آخرین به‌روزرسانی'
    };
    return labels[field as keyof typeof labels] || field;
  };

  // تابع برای تغییر مرتب‌سازی
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // اگر همان فیلد انتخاب شده، ترتیب را تغییر بده
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // اگر فیلد جدید انتخاب شده، آن را تنظیم کن و ترتیب را desc کن
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // تابع برای دریافت آیکون مرتب‌سازی
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <Sort sx={{ fontSize: '1rem', color: 'text.secondary' }} />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUpward sx={{ fontSize: '1rem', color: ADMIN_THEME.primary }} /> : 
      <ArrowDownward sx={{ fontSize: '1rem', color: ADMIN_THEME.primary }} />;
  };

  const getUserTypeIcon = (type: string) => {
    const icons = {
      'JS': <Person />,
      'EM': <Business />,
      'AD': <AdminPanelSettings />,
      'SU': <Support />
    };
    return icons[type as keyof typeof icons] || <Person />;
  };

  const getUserTypeEmoji = (type: string) => {
    const emojis = {
      'JS': '👤',
      'EM': '🏢',
      'AD': '👨‍💼',
      'SU': '🛠️'
    };
    return emojis[type as keyof typeof emojis] || '👤';
  };

  // تعیین وضعیت کاربر بر اساس فیلد status یا is_active
  const getUserStatus = (user: User): { isActive: boolean; label: string } => {
    // اگر status موجود باشد، از آن استفاده می‌کنیم
    if (user.status) {
      return {
        isActive: user.status === 'ACT',
        label: user.status === 'ACT' ? 'فعال' :
          user.status === 'SUS' ? 'تعلیق شده' :
            user.status === 'DEL' ? 'حذف شده' : 'نامشخص'
      };
    }

    // در غیر این صورت از is_active استفاده می‌کنیم
    return {
      isActive: user.is_active,
      label: user.is_active ? 'فعال' : 'غیرفعال'
    };
  };

  const tableHeaders = [
    'نام کامل',
    'شماره تماس',
    'نوع کاربر',
    'وضعیت',
    'تاریخ عضویت',
    'عملیات'
  ];



  // نمایش موبایل
  if (isMobile) {
    return (
      <Box>


        {/* جستجو و فیلتر بهبود یافته */}
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
                جستجو، فیلتر و مرتب‌سازی
              </Typography>
        </Box>

          <TextField
            fullWidth
            size="small"
              placeholder="جستجو در نام، شماره تماس..."
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
            <InputLabel>نوع کاربر</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="نوع کاربر"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value="">همه انواع</MenuItem>
                  <MenuItem value="JS">کارجو</MenuItem>
              <MenuItem value="EM">کارفرما</MenuItem>
              <MenuItem value="AD">مدیر</MenuItem>
              <MenuItem value="SU">پشتیبان</MenuItem>
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
                  <MenuItem value="joined_date">تاریخ عضویت</MenuItem>
                  <MenuItem value="full_name">نام کامل</MenuItem>
                  <MenuItem value="phone">شماره تماس</MenuItem>
                  <MenuItem value="user_type">نوع کاربر</MenuItem>
                  <MenuItem value="status">وضعیت</MenuItem>
                  <MenuItem value="id">شناسه</MenuItem>
                  <MenuItem value="last_updated">آخرین به‌روزرسانی</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setFilterType('');
                  setSortBy('joined_date');
                  setSortOrder('desc');
                  fetchUsers();
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

        {/* کارت‌های کاربران بهبود یافته */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(isSearching || loading) ? (
            // اسکلتون لودینگ هنگام جستجو
            [1, 2, 3].map((item) => (
              <UserCardSkeleton key={item} />
            ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onView={openViewDialog}
                onEdit={handleEditWithWarning}
                onDelete={handleDeleteWithWarning}
                currentUserId={user?.full_name || ''}
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
                هیچ کاربری یافت نشد
              </Typography>
              <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                کاربری با این مشخصات در سیستم وجود ندارد
              </Typography>
            </Paper>
          )}
        </Box>

        {/* پیجینیشن هوشمند */}
        {users.length > 0 && totalPages > 0 && (
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



        {/* دیالوگ‌های مشترک */}
        {/* دیالوگ مشاهده */}
        <UserDetailsModal
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          user={selectedUser}
          loading={false}
          onEdit={openEditDialog}
        />
        
        {/* دیالوگ ویرایش */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: 'white',
              border: `1px solid ${ADMIN_THEME.bgLight}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: ADMIN_THEME.bgLight,
            borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
            '& .MuiTypography-root': {
              fontWeight: 'bold',
              color: ADMIN_THEME.primary
            }
          }}>
            ویرایش کاربر
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="نام کامل"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                fullWidth
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
                      }
                    }
                  }
                }}
              />
              <FormControl fullWidth>
                <InputLabel>نوع کاربر</InputLabel>
                <Select
                  value={editForm.user_type}
                  onChange={(e) => setEditForm({ ...editForm, user_type: e.target.value })}
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
                  <MenuItem value="JS">کارجو</MenuItem>
                  <MenuItem value="EM">کارفرما</MenuItem>
                  <MenuItem value="AD">مدیریت</MenuItem>
                  <MenuItem value="SU">پشتیبان</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                  <MenuItem value="ACT">فعال</MenuItem>
                  <MenuItem value="SUS">تعلیق شده</MenuItem>
                  <MenuItem value="DEL">حذف شده</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            bgcolor: ADMIN_THEME.bgLight,
            borderTop: `1px solid ${ADMIN_THEME.bgLight}`,
            p: 2
          }}>
            <Button onClick={() => setEditDialog(false)} variant="outlined" sx={{
              borderColor: ADMIN_THEME.primary,
              color: ADMIN_THEME.primary,
              '&:hover': {
                borderColor: ADMIN_THEME.dark,
                bgcolor: ADMIN_THEME.bgLight
              }
            }}>
              انصراف
            </Button>
            <Button onClick={handleEditUser} variant="contained" sx={{
              bgcolor: ADMIN_THEME.primary,
              '&:hover': { 
                bgcolor: ADMIN_THEME.dark
              }
            }}>
              ذخیره تغییرات
            </Button>
          </DialogActions>
        </Dialog>

        {/* Warning Modal */}
        <WarningModal
          open={warningModal}
          onClose={() => setWarningModal(false)}
          onConfirm={handleWarningConfirm}
          user={warningUser}
          action={warningAction}
          currentUserId={user?.full_name || ''}
        />

      </Box>
    );
  }

  // نمایش دسکتاپ
  return (
    <Box>


      {/* جستجو و فیلتر بهبود یافته */}
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
              جستجو، فیلتر و مرتب‌سازی کاربران
            </Typography>
      </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="جستجو در نام، شماره تماس..."
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
          <InputLabel>نوع کاربر</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
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
                    },
                    '& .MuiSelect-icon': {
                      color: ADMIN_THEME.primary,
                    }
                  }}
                >
                  <MenuItem value="">همه انواع</MenuItem>
                  <MenuItem value="JS">کارجو</MenuItem>
            <MenuItem value="EM">کارفرما</MenuItem>
            <MenuItem value="AD">مدیر</MenuItem>
            <MenuItem value="SU">پشتیبان</MenuItem>
          </Select>
        </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 180, maxWidth: 220 }}>
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
                    },
                    '& .MuiSelect-icon': {
                      color: ADMIN_THEME.primary,
                    }
                  }}
                >
                  <MenuItem value="joined_date">تاریخ عضویت</MenuItem>
                  <MenuItem value="full_name">نام کامل</MenuItem>
                  <MenuItem value="phone">شماره تماس</MenuItem>
                  <MenuItem value="user_type">نوع کاربر</MenuItem>
                  <MenuItem value="status">وضعیت</MenuItem>
                  <MenuItem value="id">شناسه</MenuItem>
                  <MenuItem value="last_updated">آخرین به‌روزرسانی</MenuItem>
                </Select>
              </FormControl>
              
              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setFilterType('');
                  setSortBy('joined_date');
                  setSortOrder('desc');
                  fetchUsers();
                }}
                sx={{
                  bgcolor: ADMIN_THEME.bgLight,
                  color: ADMIN_THEME.primary,
                  '&:hover': { 
                    bgcolor: ADMIN_THEME.bgVeryLight,
                    color: ADMIN_THEME.dark
                  }
                }}
              >
                <Refresh />
              </IconButton>
      </Box>
        </Box>
      </Paper>

      {/* جدول کاربران بهبود یافته */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <TableContainer sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 'auto' }}>
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
                <TableCell sx={{ width: '18%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('full_name')}>
                    نام کامل
                    {getSortIcon('full_name')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '16%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('phone')}>
                    شماره تماس
                    {getSortIcon('phone')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '16%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('user_type')}>
                    نوع کاربر
                    {getSortIcon('user_type')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '13%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('status')}>
                    وضعیت
                    {getSortIcon('status')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '17%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('joined_date')}>
                    تاریخ عضویت
                    {getSortIcon('joined_date')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '12%', textAlign: 'center' }}>عملیات</TableCell>
            </TableRow>
          </TableHead>
            <TableBody sx={{
              '& .MuiTableCell-body': {
                textAlign: 'center',
                py: 2,
                borderBottom: `1px solid ${ADMIN_THEME.bgLight}`
              }
            }}>
              {(isSearching || loading) ? (
                <TableSkeleton headers={tableHeaders} rows={8} />
              ) : users.length > 0 ? (
              users.map((user) => {
                const userStatus = getUserStatus(user);
                return (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:hover': {
                          bgcolor: ADMIN_THEME.bgVeryLight,
                      }
                    }}
                  >
                    <TableCell>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          justifyContent: 'center',
                          width: '100%'
                        }}>
                        <Avatar
                          src={user.profile_picture || undefined}
                          sx={{
                            width: 45,
                            height: 45,
                            bgcolor: getUserTypeTheme(user.user_type).primary,
                            border: `2px solid ${ADMIN_THEME.bgLight}`,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            color: '#fff'
                          }}
                        >
                          {!user.profile_picture && (user.full_name ? user.full_name[0].toUpperCase() : 'U')}
                        </Avatar>
                          <Box sx={{ textAlign: 'center', flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                              {user.full_name || 'بدون نام'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              ID: {user.id}
                            </Typography>
                          </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" dir="ltr" sx={{ 
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          width: '100%'
                        }}>
                          {user.phone}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(90deg, ${getUserTypeTheme(user.user_type).primary}, ${getUserTypeTheme(user.user_type).light})`,
                            borderRadius: '4px',
                            px: 1,
                            py: 0.2,
                            minWidth: 80,
                            textAlign: 'center',
                            position: 'relative',
                          }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                color: '#fff',
                                fontWeight: 600
                              }}
                            >
                              {getUserTypeLabel(user.user_type)}
                            </Typography>
                            {user.user_type === 'AD' && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -3,
                                  right: -3,
                                  fontSize: '0.8rem',
                                  color: '#FFD700',
                                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                                }}
                              >
                                ⭐
                              </Box>
                            )}
                          </Box>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <Chip
                        label={userStatus.label}
                        color={userStatus.isActive ? 'success' : 'error'}
                        size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                      />
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          textAlign: 'center',
                          width: '100%',
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {convertToJalali(user.joined_date)}
                        </Typography>
                    </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton 
                            onClick={() => openViewDialog(user)} 
                            size="small" 
                            title="مشاهده جزئیات"
                            sx={{
                              color: ADMIN_THEME.primary,
                              '&:hover': { bgcolor: ADMIN_THEME.bgLight }
                            }}
                          >
                        <Visibility fontSize="small" />
                      </IconButton>
                          <IconButton 
                            onClick={() => handleEditWithWarning(user)} 
                            size="small" 
                            title="ویرایش"
                            sx={{
                              color: 'primary.main',
                              '&:hover': { bgcolor: 'primary.light' }
                            }}
                          >
                        <Edit fontSize="small" />
                      </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteWithWarning(user)} 
                            size="small" 
                            color="error" 
                            title="حذف"
                            sx={{
                              '&:hover': { bgcolor: 'error.light' }
                            }}
                          >
                        <Delete fontSize="small" />
                      </IconButton>
                        </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
                        هیچ کاربری یافت نشد
                    </Typography>
                      <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                        کاربری با این مشخصات در سیستم وجود ندارد
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>




      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'white',
            border: `1px solid ${ADMIN_THEME.bgLight}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: ADMIN_THEME.bgLight,
          borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            color: ADMIN_THEME.primary
          }
        }}>
          ویرایش کاربر
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="نام کامل"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              fullWidth
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
                    }
                  }
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>نوع کاربر</InputLabel>
              <Select
                value={editForm.user_type}
                onChange={(e) => setEditForm({ ...editForm, user_type: e.target.value })}
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
                  },
                  '& .MuiSelect-icon': {
                    color: ADMIN_THEME.primary,
                  }
                }}
              >
                  <MenuItem value="JS">کارجو</MenuItem>
                <MenuItem value="EM">کارفرما</MenuItem>
                <MenuItem value="AD">مدیریت</MenuItem>
                <MenuItem value="SU">پشتیبان</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>وضعیت</InputLabel>
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                  },
                  '& .MuiSelect-icon': {
                    color: ADMIN_THEME.primary,
                  }
                }}
              >
                <MenuItem value="ACT">فعال</MenuItem>
                <MenuItem value="SUS">تعلیق شده</MenuItem>
                <MenuItem value="DEL">حذف شده</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: ADMIN_THEME.bgLight,
          borderTop: `1px solid ${ADMIN_THEME.bgLight}`,
          p: 2
        }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined" sx={{
            borderColor: ADMIN_THEME.primary,
            color: ADMIN_THEME.primary,
            '&:hover': {
              borderColor: ADMIN_THEME.dark,
              bgcolor: ADMIN_THEME.bgLight
            }
          }}>
            انصراف
          </Button>
          <Button onClick={handleEditUser} variant="contained" sx={{
            bgcolor: ADMIN_THEME.primary,
            '&:hover': { 
              bgcolor: ADMIN_THEME.dark
            }
          }}>
            ذخیره تغییرات
          </Button>
        </DialogActions>
      </Dialog>

      {/* پیجینیشن هوشمند */}
      {users.length > 0 && totalPages > 0 && (
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

      {/* دیالوگ مشاهده */}
      <UserDetailsModal
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        user={selectedUser}
        loading={false}
        onEdit={openEditDialog}
      />

      {/* Warning Modal */}
      <WarningModal
        open={warningModal}
        onClose={() => setWarningModal(false)}
        onConfirm={handleWarningConfirm}
        user={warningUser}
        action={warningAction}
        currentUserId={user?.full_name || ''}
      />
      </Box>
  );
};

export default UsersManagement;