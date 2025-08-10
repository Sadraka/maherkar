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
  Skeleton,
  Divider
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
  ArrowDownward,
  CheckCircle,
  Cancel,
  Pending,
  Image as ImageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  CreditCard as CreditCardIcon,
  VerifiedUser as VerifiedUserIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { apiGet, apiPost } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_THEME, EMPLOYER_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import TableSkeleton from '../components/TableSkeleton';
import WarningModal from '../components/WarningModal';
import EmployerVerificationCard from '../components/EmployerVerificationCard';
import EmployerVerificationCardSkeleton from '../components/EmployerVerificationCardSkeleton';

// تابع تبدیل تاریخ میلادی به شمسی
const convertToJalali = (gregorianDate: string): string => {
  try {
    const date = new Date(gregorianDate);
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
const convertToPersianNumbers = (num: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

interface EmployerProfile {
  id: string;
  user: {
    id: string;
    full_name: string;
    phone: string;
    user_type: string;
    joined_date: string;
    last_login?: string;
  };
  profile_picture?: string | null;
  personal_info: {
    gender: string;
    age: number;
  };
  location?: {
    id: string;
    name: string;
    province: {
      id: string;
      name: string;
    };
  };
  national_id?: string;
  national_card_front?: string;
  national_card_back?: string;
  verification_status: 'P' | 'A' | 'R';
  verification_date?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  bio?: string;
  verification_status_display: string;
  is_verified: boolean;
  has_complete_documents: boolean;
}

const EmployerVerificationManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [employers, setEmployers] = useState<EmployerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerProfile | null>(null);
  const [warningModal, setWarningModal] = useState(false);
  const [warningAction, setWarningAction] = useState<'approve' | 'reject'>('approve');
  const [warningEmployer, setWarningEmployer] = useState<EmployerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [editForm, setEditForm] = useState({
    verification_status: '',
    admin_notes: ''
  });
  const [imageDialog, setImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  // ساخت URL کامل برای تصاویر (برای مسیرهای نسبی برگشتی از بک‌اند)
  const buildImageUrl = useCallback((path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  }, []);

  // ref برای نگهداری مقادیر جاری state
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // useCallback برای handleHashChange
  const handleHashChangeEmployers = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (hash.includes('#employer-verification?search=')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const searchParam = urlParams.get('search');
      if (searchParam && searchParam !== searchQueryRef.current) {
        setSearchQuery(searchParam);
        setSearchInput(searchParam);
        setIsSearching(true);
        setPage(1);
      }
    } else if (hash === '#employer-verification') {
      if (searchQueryRef.current) {
        setSearchQuery('');
        setSearchInput('');
        setPage(1);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChangeEmployers);
      handleHashChangeEmployers();
      
      return () => {
        window.removeEventListener('hashchange', handleHashChangeEmployers);
      };
    }
  }, [handleHashChangeEmployers]);

  // دریافت لیست کارفرمایان
  const fetchEmployers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (filterStatus) {
        params.append('verification_status', filterStatus);
      }

      const response = await apiGet<{
        results: EmployerProfile[];
        count: number;
        total_pages: number;
      }>(`/profiles/employers/?${params.toString()}`);

      setEmployers(response.data.results || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('خطا در دریافت کارفرمایان:', error);
      toast.error('خطا در دریافت لیست کارفرمایان');
      setEmployers([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [page, pageSize, sortBy, sortOrder, searchQuery, filterStatus]);

  // تایید کارفرما مستقیم
  const handleApproveEmployer = async (employer: EmployerProfile, notes?: string) => {
    try {
      await apiPost(`/profiles/employers/${employer.id}/approve/`, {
        admin_notes: notes || 'تایید شد'
      });

      toast.success(`کارفرما ${employer.user.full_name} تایید شد`);
      setViewDialog(false);
      fetchEmployers();
    } catch (error: any) {
      console.error('خطا در تایید کارفرما:', error);
      toast.error('خطا در تایید کارفرما');
    }
  };

  // رد کارفرما مستقیم
  const handleRejectEmployer = async (employer: EmployerProfile, notes?: string) => {
    try {
      await apiPost(`/profiles/employers/${employer.id}/reject/`, {
        admin_notes: notes || 'رد شد'
      });

      toast.success(`کارفرما ${employer.user.full_name} رد شد`);
      setViewDialog(false);
      fetchEmployers();
    } catch (error: any) {
      console.error('خطا در رد کارفرما:', error);
      toast.error('خطا در رد کارفرما');
    }
  };

  // ویرایش کارفرما (تایید/رد)
  const handleEditEmployer = async () => {
    if (!selectedEmployer) return;

    // بررسی اجباری بودن متن ادمین برای رد
    if (editForm.verification_status === 'R' && !editForm.admin_notes.trim()) {
      toast.error('لطفاً دلیل رد را مشخص کنید');
      return;
    }

    try {
      const endpoint = editForm.verification_status === 'A' ? 'approve' : 'reject';
      await apiPost(`/profiles/employers/${selectedEmployer.id}/${endpoint}/`, {
        admin_notes: editForm.admin_notes || (editForm.verification_status === 'A' ? 'تایید شد' : 'رد شد')
      });

      toast.success(`کارفرما ${selectedEmployer.user.full_name} ${editForm.verification_status === 'A' ? 'تایید' : 'رد'} شد`);
      setEditDialog(false);
      setSelectedEmployer(null);
      setViewDialog(false);
      fetchEmployers();
    } catch (error: any) {
      console.error('خطا در ویرایش کارفرما:', error);
      toast.error('خطا در ویرایش اطلاعات کارفرما');
    }
  };

  // جستجو با تاخیر
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setPage(1);
        setIsSearching(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchQuery]);

  // دریافت داده‌ها
  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  const openEditDialog = (employer: EmployerProfile) => {
    setSelectedEmployer(employer);
    setEditForm({
      verification_status: employer.verification_status,
      admin_notes: employer.admin_notes || ''
    });
    setEditDialog(true);
  };

  const openViewDialog = (employer: EmployerProfile) => {
    setSelectedEmployer(employer);
    setViewDialog(true);
    setShowRejectForm(false);
    setRejectNotes('');
  };

  const openWarningModal = (employer: EmployerProfile, action: 'approve' | 'reject') => {
    setWarningEmployer(employer);
    setWarningAction(action);
    setWarningModal(true);
  };

  const handleWarningConfirm = () => {
    if (!warningEmployer) return;
    
    if (warningAction === 'approve') {
      setEditForm({ verification_status: 'A', admin_notes: '' });
      setSelectedEmployer(warningEmployer);
      setEditDialog(true);
    } else if (warningAction === 'reject') {
      setEditForm({ verification_status: 'R', admin_notes: '' });
      setSelectedEmployer(warningEmployer);
      setEditDialog(true);
    }
    
    setWarningModal(false);
    setWarningEmployer(null);
  };

  const handleApproveWithWarning = (employer: EmployerProfile) => {
    openWarningModal(employer, 'approve');
  };

  const handleRejectWithWarning = (employer: EmployerProfile) => {
    openWarningModal(employer, 'reject');
  };

  const handleEditWithWarning = (employer: EmployerProfile) => {
    openEditDialog(employer);
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

  // تابع برای تغییر مرتب‌سازی
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // دریافت رنگ چیپ بر اساس وضعیت
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'P':
        return (
          <Chip
            label="در انتظار بررسی"
            color="warning"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
          />
        );
      case 'A':
        return (
          <Chip
            label="تایید شده"
            color="success"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
          />
        );
      case 'R':
        return (
          <Chip
            label="رد شده"
            color="error"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
          />
        );
      default:
        return (
          <Chip
            label="نامشخص"
            color="default"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
          />
        );
    }
  };

  const tableHeaders = [
    'کارفرما',
    'شماره تماس',
    'وضعیت تایید',
    'مدارک',
    'تاریخ درخواست',
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
              <VerifiedUserIcon sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی کارفرمایان
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
                <InputLabel>وضعیت تایید</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="وضعیت تایید"
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
                  <MenuItem value="created_at">تاریخ درخواست</MenuItem>
                  <MenuItem value="verification_status">وضعیت تایید</MenuItem>
                  <MenuItem value="user__full_name">نام کامل</MenuItem>
                  <MenuItem value="user__phone">شماره تماس</MenuItem>
                  <MenuItem value="verification_date">تاریخ تایید</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setFilterStatus('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchEmployers();
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

        {/* کارت‌های کارفرمایان بهبود یافته */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(isSearching || loading) ? (
            [1, 2, 3].map((item) => (
              <EmployerVerificationCardSkeleton key={item} />
            ))
          ) : employers.length > 0 ? (
            employers.map((employer) => (
              <EmployerVerificationCard
                key={employer.id}
                employer={employer}
                onView={openViewDialog}
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
              <VerifiedUserIcon sx={{ fontSize: '4rem', color: ADMIN_THEME.primary, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
                هیچ کارفرمایی یافت نشد
              </Typography>
              <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                کارفرمایی با این مشخصات در سیستم وجود ندارد
              </Typography>
            </Paper>
          )}
        </Box>

        {/* پیجینیشن هوشمند */}
        {employers.length > 0 && totalPages > 0 && (
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
        <WarningModal
          open={warningModal}
          onClose={() => setWarningModal(false)}
          onConfirm={handleWarningConfirm}
          user={warningEmployer ? {
            id: warningEmployer.id,
            full_name: warningEmployer.user.full_name,
            user_type: 'EM',
            profile_picture: undefined
          } : null}
          action={warningAction === 'approve' ? 'edit' : 'delete'}
          currentUserId={user?.full_name || ''}
        />

        {/* دیالوگ مشاهده ساده - موبایل */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 2,
              bgcolor: 'white',
              border: `1px solid ${ADMIN_THEME.primary}`,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'white',
            color: EMPLOYER_THEME.primary,
            textAlign: 'center',
            borderBottom: `1px solid ${EMPLOYER_THEME.primary}`,
            py: 2,
            fontWeight: 'bold'
          }}>
            جزئیات کارفرما
          </DialogTitle>
          
          <DialogContent sx={{ p: 2 }}>
            {selectedEmployer && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* هدر فشرده */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                  <Avatar
                    src={selectedEmployer.profile_picture ? buildImageUrl(selectedEmployer.profile_picture) : undefined}
                    alt={selectedEmployer.user.full_name || 'Employer'}
                    sx={{ width: 56, height: 56, bgcolor: EMPLOYER_THEME.primary, color: 'white', fontWeight: 'bold' }}
                  >
                    {!selectedEmployer.profile_picture && (selectedEmployer.user.full_name?.charAt(0) || 'ک')}
                  </Avatar>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_THEME.primary }}>
                      {selectedEmployer.user.full_name || 'بدون نام'}
                    </Typography>
                    <Typography variant="caption" dir="ltr" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                      {convertToPersianNumbers(selectedEmployer.user.phone)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {getStatusChip(selectedEmployer.verification_status)}
                </Box>

                {/* اطلاعات کلیدی فشرده */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ flex: 1, p: 1, border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">تاریخ عضویت</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {convertToJalali(selectedEmployer.user.joined_date)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1, border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">کد ملی</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {selectedEmployer.national_id ? convertToPersianNumbers(selectedEmployer.national_id) : 'ندارد'}
                    </Typography>
                  </Box>
                </Box>

                {/* مدارک کارت ملی فشرده */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ADMIN_THEME.primary, textAlign: 'center' }}>
                  مدارک کارت ملی
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* روی کارت */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, textAlign: 'center' }}>روی کارت</Typography>
                    <Box sx={{
                      border: '2px dashed',
                      borderColor: ADMIN_THEME.bgLight,
                      borderRadius: 1.5,
                      position: 'relative',
                      aspectRatio: '1.6',
                      cursor: selectedEmployer.national_card_front ? 'pointer' : 'default',
                      bgcolor: 'background.paper'
                    }}
                      onClick={() => {
                        if (selectedEmployer.national_card_front) {
                          setSelectedImage(buildImageUrl(selectedEmployer.national_card_front));
                          setImageDialog(true);
                        }
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', bgcolor: 'background.paper', px: 1, py: 0.2, borderRadius: 999, fontSize: '0.75rem', color: 'text.secondary', border: '1px dashed', borderColor: ADMIN_THEME.bgLight }}>
                        روی کارت ملی
                      </Box>
                      <Box sx={{ position: 'absolute', inset: 8, borderRadius: 2, overflow: 'hidden' }}>
                        {selectedEmployer.national_card_front ? (
                          <Box component="img" src={buildImageUrl(selectedEmployer.national_card_front)} alt="روی کارت ملی" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#fff' }} />
                        ) : (
                          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon sx={{ color: 'grey.400' }} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  {/* پشت کارت */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, textAlign: 'center' }}>پشت کارت</Typography>
                    <Box sx={{
                      border: '2px dashed',
                      borderColor: ADMIN_THEME.bgLight,
                      borderRadius: 1.5,
                      position: 'relative',
                      aspectRatio: '1.6',
                      cursor: selectedEmployer.national_card_back ? 'pointer' : 'default',
                      bgcolor: 'background.paper'
                    }}
                      onClick={() => {
                        if (selectedEmployer.national_card_back) {
                          setSelectedImage(buildImageUrl(selectedEmployer.national_card_back));
                          setImageDialog(true);
                        }
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', bgcolor: 'background.paper', px: 1, py: 0.2, borderRadius: 999, fontSize: '0.75rem', color: 'text.secondary', border: '1px dashed', borderColor: ADMIN_THEME.bgLight }}>
                        پشت کارت ملی
                      </Box>
                      <Box sx={{ position: 'absolute', inset: 8, borderRadius: 2, overflow: 'hidden' }}>
                        {selectedEmployer.national_card_back ? (
                          <Box component="img" src={buildImageUrl(selectedEmployer.national_card_back)} alt="پشت کارت ملی" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#fff' }} />
                        ) : (
                          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon sx={{ color: 'grey.400' }} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* دلیل رد - در صورت رد شدن */}
                {selectedEmployer.verification_status === 'R' && selectedEmployer.admin_notes && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: '#ffebee',
                    border: '1px solid #f44336',
                    mt: 1
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#d32f2f', 
                      fontWeight: 'bold',
                      display: 'block',
                      mb: 0.5
                    }}>
                      دلیل رد:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#d32f2f',
                      fontWeight: 500
                    }}>
                      {selectedEmployer.admin_notes}
                    </Typography>
                  </Box>
                )}

                {/* محل */}
                {selectedEmployer.location && (
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
                    {selectedEmployer.location.name}، {selectedEmployer.location.province.name}
                  </Typography>
                )}

                {/* توضیحات ادمین برای تایید شده */}
                {selectedEmployer.verification_status === 'A' && selectedEmployer.admin_notes && (
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    border: `1px solid ${ADMIN_THEME.bgLight}`, 
                    bgcolor: ADMIN_THEME.bgVeryLight,
                    mt: 1
                  }}>
                    <Typography variant="caption" color="text.secondary">توضیحات ادمین</Typography>
                    <Typography variant="body2">{selectedEmployer.admin_notes}</Typography>
                  </Box>
                )}

                {/* فرم رد */}
                {showRejectForm && (
                  <Box sx={{ mt: 2, p: 2, border: `1px solid #f44336`, borderRadius: 1, bgcolor: 'white' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: '#d32f2f' }}>
                      دلیل رد کارفرما:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      placeholder="لطفاً دلیل رد را مشخص کنید..."
                      required
                      error={!rejectNotes.trim()}
                      helperText={!rejectNotes.trim() ? "این فیلد اجباری است" : ""}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
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
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectNotes('');
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: ADMIN_THEME.primary,
                          color: ADMIN_THEME.primary,
                          '&:hover': {
                            borderColor: ADMIN_THEME.dark,
                            bgcolor: ADMIN_THEME.bgLight
                          }
                        }}
                      >
                        انصراف
                      </Button>
                      <Button
                        onClick={() => {
                          if (rejectNotes.trim() && selectedEmployer) {
                            handleRejectEmployer(selectedEmployer, rejectNotes);
                            setShowRejectForm(false);
                            setRejectNotes('');
                          }
                        }}
                        variant="contained"
                        size="small"
                        disabled={!rejectNotes.trim()}
                        sx={{
                          bgcolor: `${ADMIN_THEME.primary} !important`,
                          color: 'white !important',
                          background: `${ADMIN_THEME.primary} !important`,
                          backgroundImage: 'none !important',
                          '&:hover': {
                            bgcolor: `${ADMIN_THEME.dark} !important`,
                            background: `${ADMIN_THEME.dark} !important`,
                            backgroundImage: 'none !important'
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'grey.300 !important',
                            color: 'grey.500 !important'
                          }
                        }}
                      >
                        رد
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 2, 
            bgcolor: 'white',
            borderTop: `1px solid ${EMPLOYER_THEME.primary}`,
            gap: 1,
            justifyContent: 'center'
          }}>
            <Button 
              onClick={() => {
                if (selectedEmployer?.has_complete_documents) {
                  handleApproveEmployer(selectedEmployer, 'تایید شد');
                } else {
                  toast.error('مدارک احراز هویت کارفرما کامل نیست');
                }
              }}
              variant="contained"
              color="success"
              disabled={selectedEmployer?.verification_status === 'A'}
              sx={{ px: 3, py: 1, fontWeight: 'bold' }}
            >
              تایید
            </Button>
            <Button 
              onClick={() => {
                setShowRejectForm(true);
                setRejectNotes('');
                // پس از باز شدن فرم رد، اسکرول به پایین برای نمایش فرم
                setTimeout(() => {
                  const el = document.getElementById('reject-form');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 50);
              }}
              variant="contained"
              color="error"
              disabled={selectedEmployer?.verification_status === 'R'}
              sx={{ px: 3, py: 1, fontWeight: 'bold' }}
            >
              رد
            </Button>
            {!showRejectForm && (
              <Box sx={{ textAlign: 'center', mt: 1, display: { xs: 'none', sm: 'block' } }}>
                {selectedEmployer?.verification_status === 'A' && (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    ✅ تایید شده
                  </Typography>
                )}
                {selectedEmployer?.verification_status === 'R' && (
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
                    ❌ رد شده
                  </Typography>
                )}
              </Box>
            )}
            <Button 
              onClick={() => {
                setViewDialog(false);
                setShowRejectForm(false);
                setRejectNotes('');
              }} 
              variant="outlined"
              sx={{ 
                px: 3,
                py: 1,
                borderColor: ADMIN_THEME.primary,
                color: ADMIN_THEME.primary
              }}
            >
              بستن
            </Button>
          </DialogActions>
        </Dialog>

        {/* مودال مشاهده تصویر - موبایل */}
        <Dialog
          open={imageDialog}
          onClose={() => setImageDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: ADMIN_THEME.bgLight,
            color: ADMIN_THEME.primary
          }}>
            🖼️ مشاهده تصویر کارت ملی
            <IconButton onClick={() => setImageDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedImage && (
              <Box
                component="img"
                src={selectedImage}
                alt="کارت ملی"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            )}
          </DialogContent>
        </Dialog>

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
            <VerifiedUserIcon sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
              جستجو، فیلتر و مرتب‌سازی کارفرمایان
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
              <InputLabel>وضعیت تایید</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="وضعیت تایید"
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
                <MenuItem value="">همه وضعیت‌ها</MenuItem>
                <MenuItem value="P">در انتظار بررسی</MenuItem>
                <MenuItem value="A">تایید شده</MenuItem>
                <MenuItem value="R">رد شده</MenuItem>
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
                <MenuItem value="created_at">تاریخ درخواست</MenuItem>
                <MenuItem value="verification_status">وضعیت تایید</MenuItem>
                <MenuItem value="user__full_name">نام کامل</MenuItem>
                <MenuItem value="user__phone">شماره تماس</MenuItem>
                <MenuItem value="verification_date">تاریخ تایید</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton
              onClick={() => {
                setSearchQuery('');
                setSearchInput('');
                setFilterStatus('');
                setSortBy('created_at');
                setSortOrder('desc');
                fetchEmployers();
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

      {/* جدول کارفرمایان بهبود یافته */}
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
                <TableCell sx={{ width: '22%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('user__full_name')}>
                    کارفرما
                    {getSortIcon('user__full_name')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '18%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('user__phone')}>
                    شماره تماس
                    {getSortIcon('user__phone')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '18%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('verification_status')}>
                    وضعیت تایید
                    {getSortIcon('verification_status')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '12%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('documents')}>
                    مدارک
                    {getSortIcon('documents')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '20%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleSortChange('created_at')}>
                    تاریخ درخواست
                    {getSortIcon('created_at')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '10%', textAlign: 'center' }}>عملیات</TableCell>
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
              ) : employers.length > 0 ? (
                employers.map((employer) => (
                  <TableRow
                    key={employer.id}
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
                          src={employer.profile_picture ? buildImageUrl(employer.profile_picture) : undefined}
                          alt={employer.user.full_name || 'Employer'}
                          sx={{
                            width: 45,
                            height: 45,
                            bgcolor: EMPLOYER_THEME.primary,
                            border: `2px solid ${ADMIN_THEME.bgLight}`,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            color: 'white'
                          }}
                        >
                          {!employer.profile_picture && (employer.user.full_name ? employer.user.full_name[0].toUpperCase() : 'ک')}
                        </Avatar>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                            {employer.user.full_name || 'بدون نام'}
                          </Typography>
                                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          ID: {convertToPersianNumbers(employer.id)}
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
                        {convertToPersianNumbers(employer.user.phone)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {getStatusChip(employer.verification_status)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Chip
                          label={employer.has_complete_documents ? 'کامل' : 'ناقص'}
                          color={employer.has_complete_documents ? 'success' : 'error'}
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
                        {convertToJalali(employer.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton 
                          onClick={() => openViewDialog(employer)} 
                          size="small" 
                          title="مشاهده جزئیات"
                          sx={{
                            color: ADMIN_THEME.primary,
                            '&:hover': { bgcolor: ADMIN_THEME.bgLight }
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
                        هیچ کارفرمایی یافت نشد
                      </Typography>
                      <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                        کارفرمایی با این مشخصات در سیستم وجود ندارد
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
          ویرایش وضعیت کارفرما
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>وضعیت تایید</InputLabel>
              <Select
                value={editForm.verification_status}
                onChange={(e) => setEditForm({ ...editForm, verification_status: e.target.value })}
                label="وضعیت تایید"
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
                <MenuItem value="P">در انتظار بررسی</MenuItem>
                <MenuItem value="A">تایید شده</MenuItem>
                <MenuItem value="R">رد شده</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={editForm.verification_status === 'R' ? "دلیل رد (اجباری)" : "توضیحات ادمین"}
              value={editForm.admin_notes}
              onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required={editForm.verification_status === 'R'}
              error={editForm.verification_status === 'R' && !editForm.admin_notes.trim()}
              helperText={editForm.verification_status === 'R' && !editForm.admin_notes.trim() ? "لطفاً دلیل رد را مشخص کنید" : ""}
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
          <Button 
            onClick={handleEditEmployer} 
            variant="contained" 
            disabled={editForm.verification_status === 'R' && !editForm.admin_notes.trim()}
            sx={{
              bgcolor: ADMIN_THEME.primary,
              '&:hover': { 
                bgcolor: ADMIN_THEME.dark
              },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            ذخیره تغییرات
          </Button>
        </DialogActions>
      </Dialog>

      {/* پیجینیشن هوشمند */}
      {employers.length > 0 && totalPages > 0 && (
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

      {/* دیالوگ مشاهده ساده */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            bgcolor: 'white',
            border: `1px solid ${ADMIN_THEME.primary}`,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'white',
          color: ADMIN_THEME.primary,
          textAlign: 'center',
          borderBottom: `1px solid ${ADMIN_THEME.primary}`,
          py: 2,
          fontWeight: 'bold'
        }}>
          جزئیات کارفرما
        </DialogTitle>
        
        <DialogContent sx={{ p: 2 }}>
          {selectedEmployer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* هدر فشرده */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                  <Avatar
                    src={selectedEmployer.profile_picture ? buildImageUrl(selectedEmployer.profile_picture) : undefined}
                    alt={selectedEmployer.user.full_name || 'Employer'}
                    sx={{ width: 56, height: 56, bgcolor: EMPLOYER_THEME.primary, color: 'white', fontWeight: 'bold' }}
                  >
                    {!selectedEmployer.profile_picture && (selectedEmployer.user.full_name?.charAt(0) || 'ک')}
                  </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_THEME.primary }}>
                    {selectedEmployer.user.full_name || 'بدون نام'}
                  </Typography>
                  <Typography variant="caption" dir="ltr" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    {convertToPersianNumbers(selectedEmployer.user.phone)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {getStatusChip(selectedEmployer.verification_status)}
              </Box>

              {/* اطلاعات کلیدی فشرده */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1, p: 1, border: `1px solid ${EMPLOYER_THEME.primary}22`, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">تاریخ عضویت</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {convertToJalali(selectedEmployer.user.joined_date)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1, border: `1px solid ${EMPLOYER_THEME.primary}22`, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">کد ملی</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {selectedEmployer.national_id ? convertToPersianNumbers(selectedEmployer.national_id) : 'ندارد'}
                  </Typography>
                </Box>
              </Box>

              {/* مدارک کارت ملی با UI احراز هویت */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ADMIN_THEME.primary, textAlign: 'center' }}>
                مدارک کارت ملی
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, p: { xs: 1, sm: 1.5 } }}>
                {/* روی کارت */}
                <Box sx={{
                  border: '2px dashed',
                  borderColor: ADMIN_THEME.primary,
                  borderRadius: 1.5,
                  position: 'relative',
                  aspectRatio: '1.6',
                  cursor: selectedEmployer.national_card_front ? 'pointer' : 'default',
                  bgcolor: 'background.paper'
                }}
                  onClick={() => {
                    if (selectedEmployer.national_card_front) {
                      setSelectedImage(buildImageUrl(selectedEmployer.national_card_front));
                      setImageDialog(true);
                    }
                  }}
                >
                  <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', bgcolor: 'background.paper', px: 1, py: 0.2, borderRadius: 999, fontSize: '0.75rem', color: 'text.secondary', border: '1px dashed', borderColor: ADMIN_THEME.primary }}>
                    روی کارت ملی
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 8, borderRadius: 2, overflow: 'hidden' }}>
                    {selectedEmployer.national_card_front ? (
                      <Box component="img" src={buildImageUrl(selectedEmployer.national_card_front)} alt="روی کارت ملی" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#fff', border: `1px solid ${ADMIN_THEME.primary}22` }} />
                    ) : (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon sx={{ color: 'grey.400' }} />
                      </Box>
                    )}
                  </Box>
                </Box>
                {/* پشت کارت */}
                <Box sx={{
                  border: '2px dashed',
                  borderColor: ADMIN_THEME.primary,
                  borderRadius: 1.5,
                  position: 'relative',
                  aspectRatio: '1.6',
                  cursor: selectedEmployer.national_card_back ? 'pointer' : 'default',
                  bgcolor: 'background.paper'
                }}
                  onClick={() => {
                    if (selectedEmployer.national_card_back) {
                      setSelectedImage(buildImageUrl(selectedEmployer.national_card_back));
                      setImageDialog(true);
                    }
                  }}
                >
                  <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', bgcolor: 'background.paper', px: 1, py: 0.2, borderRadius: 999, fontSize: '0.75rem', color: 'text.secondary', border: '1px dashed', borderColor: ADMIN_THEME.primary }}>
                    پشت کارت ملی
                  </Box>
                  <Box sx={{ position: 'absolute', inset: 8, borderRadius: 2, overflow: 'hidden' }}>
                    {selectedEmployer.national_card_back ? (
                      <Box component="img" src={buildImageUrl(selectedEmployer.national_card_back)} alt="پشت کارت ملی" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#fff', border: `1px solid ${ADMIN_THEME.primary}22` }} />
                    ) : (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon sx={{ color: 'grey.400' }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* دلیل رد - در صورت رد شدن */}
              {selectedEmployer.verification_status === 'R' && selectedEmployer.admin_notes && (
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 1, 
                  bgcolor: '#ffebee',
                  border: '1px solid #f44336',
                  mt: 1
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#d32f2f', 
                    fontWeight: 'bold',
                    display: 'block',
                    mb: 0.5
                  }}>
                    دلیل رد:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#d32f2f',
                    fontWeight: 500
                  }}>
                    {selectedEmployer.admin_notes}
                  </Typography>
                </Box>
              )}

              {/* محل */}
              {selectedEmployer.location && (
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
                  {selectedEmployer.location.name}، {selectedEmployer.location.province.name}
                </Typography>
              )}

              {/* توضیحات ادمین برای تایید شده */}
              {selectedEmployer.verification_status === 'A' && selectedEmployer.admin_notes && (
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 1, 
                  border: `1px solid ${ADMIN_THEME.bgLight}`, 
                  bgcolor: ADMIN_THEME.bgVeryLight,
                  mt: 1
                }}>
                  <Typography variant="caption" color="text.secondary">توضیحات ادمین</Typography>
                  <Typography variant="body2">{selectedEmployer.admin_notes}</Typography>
                </Box>
              )}

              {/* فرم رد */}
              {showRejectForm && (
                <Box id="reject-form" sx={{ mt: 2, p: 2, border: `1px solid #f44336`, borderRadius: 1, bgcolor: 'white' }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: '#d32f2f' }}>
                    دلیل رد کارفرما:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="لطفاً دلیل رد را مشخص کنید..."
                    required
                    error={!rejectNotes.trim()}
                    helperText={!rejectNotes.trim() ? "این فیلد اجباری است" : ""}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
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
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectNotes('');
                      }}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: ADMIN_THEME.primary,
                        color: ADMIN_THEME.primary,
                        '&:hover': {
                          borderColor: ADMIN_THEME.dark,
                          bgcolor: ADMIN_THEME.bgLight
                        }
                      }}
                    >
                      انصراف
                    </Button>
                    <Button
                      onClick={() => {
                        if (rejectNotes.trim() && selectedEmployer) {
                          handleRejectEmployer(selectedEmployer, rejectNotes);
                          setShowRejectForm(false);
                          setRejectNotes('');
                        }
                      }}
                      variant="contained"
                      size="small"
                      disabled={!rejectNotes.trim()}
                      sx={{
                        bgcolor: `${ADMIN_THEME.primary} !important`,
                        color: 'white !important',
                        background: `${ADMIN_THEME.primary} !important`,
                        backgroundImage: 'none !important',
                        '&:hover': {
                          bgcolor: `${ADMIN_THEME.dark} !important`,
                          background: `${ADMIN_THEME.dark} !important`,
                          backgroundImage: 'none !important'
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'grey.300 !important',
                          color: 'grey.500 !important'
                        }
                      }}
                    >
                      رد
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          bgcolor: 'white',
          borderTop: `1px solid ${ADMIN_THEME.primary}`,
          gap: 1,
          justifyContent: 'center'
        }}>
          {/* دکمه‌های تایید و رد برای همه وضعیت‌ها */}
          <Button 
            onClick={() => {
              if (selectedEmployer?.has_complete_documents) {
                handleApproveEmployer(selectedEmployer, 'تایید شد');
              } else {
                toast.error('مدارک احراز هویت کارفرما کامل نیست');
              }
            }}
            variant="contained"
            color="success"
            disabled={selectedEmployer?.verification_status === 'A'}
            sx={{ px: 3, py: 1, fontWeight: 'bold' }}
          >
            تایید
          </Button>
          <Button 
            onClick={() => {
              setShowRejectForm(true);
              setRejectNotes('');
            }}
            variant="contained"
            color="error"
            disabled={selectedEmployer?.verification_status === 'R'}
            sx={{ px: 3, py: 1, fontWeight: 'bold' }}
          >
            رد
          </Button>
          


          {/* حذف نمایش متن وضعیت در پایین طبق درخواست */}
          
          <Button 
            onClick={() => {
              setViewDialog(false);
              setShowRejectForm(false);
              setRejectNotes('');
            }} 
            variant="outlined"
            sx={{ 
              px: 3,
              py: 1,
              borderColor: ADMIN_THEME.primary,
              color: ADMIN_THEME.primary
            }}
          >
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Modal */}
      <WarningModal
        open={warningModal}
        onClose={() => setWarningModal(false)}
        onConfirm={handleWarningConfirm}
        user={warningEmployer ? {
          id: warningEmployer.id,
          full_name: warningEmployer.user.full_name,
          user_type: 'EM',
          profile_picture: undefined
        } : null}
        action={warningAction === 'approve' ? 'edit' : 'delete'}
        currentUserId={user?.full_name || ''}
      />

      {/* مودال مشاهده تصویر ساده */}
      <Dialog
        open={imageDialog}
        onClose={() => setImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: ADMIN_THEME.bgLight,
          color: ADMIN_THEME.primary
        }}>
          🖼️ مشاهده تصویر
          <IconButton onClick={() => setImageDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="تصویر"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployerVerificationManagement;