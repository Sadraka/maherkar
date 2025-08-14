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
  Alert,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Skeleton,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Business,
  FilterList,
  Refresh,
  Sort,
  ArrowUpward,
  ArrowDownward,
  LocationOn as LocationOnIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  CalendarToday as CalendarTodayIcon,
  PeopleAlt as PeopleAltIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Groups as GroupsIcon,
  Home as HomeIcon,
  MarkunreadMailbox as MarkunreadMailboxIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { apiGet, apiPut, apiDelete, apiPost } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import JalaliDatePicker from '@/components/common/JalaliDatePicker';
import CustomPagination from '@/components/common/CustomPagination';
import CompanyCard from '../components/CompanyCard';
import CompanyCardSkeleton from '../components/CompanyCardSkeleton';
import TableSkeleton from '../components/TableSkeleton';
import WarningModal from '../components/WarningModal';
import CreateCompanyForm, { Company as CompanyFormData } from '@/components/employer/companies/CreateCompanyForm';
import ActionButtons from '../components/ActionButtons';

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
const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

// تابع کوتاه کردن متن
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// تابع تبدیل URL نسبی به کامل
const getFullImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('http')) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
};

// تابع دریافت نام صنعت بر اساس ID یا object
const getIndustryName = (industry: any, industries: any[]): string => {
  // اگر industry یک object است و name دارد
  if (industry && typeof industry === 'object' && industry.name) {
    return industry.name;
  }
  
  // اگر industry یک number است (ID)
  if (typeof industry === 'number' && industries.length > 0) {
    const foundIndustry = industries.find(ind => ind.id === industry);
    return foundIndustry?.name || 'نامشخص';
  }
  
  // اگر industry یک string است (ID به صورت string)
  if (typeof industry === 'string' && industries.length > 0) {
    const foundIndustry = industries.find(ind => ind.id.toString() === industry);
    return foundIndustry?.name || 'نامشخص';
  }
  
  return 'نامشخص';
};

// تابع دریافت نام دسته‌بندیِ صنعت بر اساس ID یا object
const getIndustryCategoryName = (industry: any, industries: any[]): string => {
  // اگر industry یک object با category باشد
  if (industry && typeof industry === 'object') {
    if (industry.category && typeof industry.category === 'object' && industry.category.name) {
      return industry.category.name;
    }
  }
  // اگر industry یک ID است (number یا string)
  const industryId = typeof industry === 'number' || typeof industry === 'string' ? industry.toString() : '';
  if (industryId && industries.length > 0) {
    const found = industries.find(ind => ind.id.toString() === industryId);
    if (found && (found as any).category && (found as any).category.name) {
      return (found as any).category.name;
    }
  }
  return 'نامشخص';
};

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  industry?: number; // تغییر از object به number
  location?: {
    name: string;
    province?: {
    name: string;
    };
  };
  number_of_employees?: number;
  created_at: string;
  employer?: {
    full_name: string;
  };
  banner?: string; // Added for new dialog
  website?: string; // Added for new dialog
  email?: string; // Added for new dialog
  phone_number?: string; // Added for new dialog
  address?: string; // Added for new dialog
  postal_code?: string; // Added for new dialog
  founded_date?: string; // Added for new dialog
  intro_video?: string; // Added for new dialog
  linkedin?: string; // Added for new dialog
  twitter?: string; // Added for new dialog
  instagram?: string; // Added for new dialog
  status?: 'P' | 'A' | 'R';
}

const CompaniesManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    email: '',
    phone_number: '',
    address: '',
    postal_code: '',
    founded_date: '',
    number_of_employees: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    city_id: ''
  });

  // State برای فایل‌ها
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State برای Warning Modal
  const [warningModal, setWarningModal] = useState(false);
  const [warningCompany, setWarningCompany] = useState<Company | null>(null);
  const [warningAction, setWarningAction] = useState<'delete' | 'edit'>('delete');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [filterIndustry, setFilterIndustry] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);

  // ref برای نگهداری مقادیر جاری state
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // useCallback برای handleHashChange
  const handleHashChangeCompanies = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (hash.includes('#companies?search=')) {
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
    } else if (hash === '#companies') {
      // اگر بدون پارامتر جستجو به companies آمده، جستجو را پاک کن
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
    handleHashChangeCompanies();

    // گوش دادن به تغییرات hash
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChangeCompanies);
      
      return () => window.removeEventListener('hashchange', handleHashChangeCompanies);
    }
  }, [handleHashChangeCompanies]);

  // useEffect اولیه برای بارگذاری شرکت‌ها
  useEffect(() => {
    fetchCompanies();
    fetchCategories(); // دریافت دسته‌بندی‌ها برای فیلتر
    fetchIndustries(); // دریافت صنایع برای نمایش
  }, [page, pageSize, sortBy, sortOrder, searchQuery, statusFilter]);

  // useEffect برای مدیریت تغییرات جستجو و فیلتر
  useEffect(() => {
    if (searchQuery || statusFilter) {
      console.log('جستجو یا فیلتر تغییر کرد:', { searchQuery, statusFilter });
      setIsSearching(true);
      setPage(1);
    }
  }, [searchQuery, statusFilter]);

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
    console.log('تعداد شرکت‌ها در هر صفحه تغییر کرد:', pageSize);
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

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/companies/`;

      // اضافه کردن پارامترهای جستجو و فیلتر
      const params = new URLSearchParams();
      
      // تعداد شرکت‌ها در هر صفحه
      params.append('page_size', pageSize.toString());
      
      // شماره صفحه - اگر جستجو/فیلتر انجام شده، به صفحه اول برو
      const currentPage = searchQuery.trim() || statusFilter ? 1 : page;
      params.append('page', currentPage.toString());
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (statusFilter) {
        // نگاشت فیلتر به مقادیر بک‌اند
        const map: Record<string, string> = { pending: 'P', approved: 'A', rejected: 'R' };
        if (map[statusFilter]) params.append('status', map[statusFilter]);
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
        setCompanies(data.results);
        const newTotalPages = Math.ceil(data.count / pageSize);
        setTotalPages(newTotalPages);
        
        // بررسی و تصحیح صفحه جاری
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      } else if (Array.isArray(data)) {
        // اگر backend pagination را پشتیبانی نمی‌کند، خودمان pagination می‌کنیم
        const currentPage = searchQuery.trim() || statusFilter ? 1 : page;
        const newTotalPages = Math.ceil(data.length / pageSize);
        
        // بررسی و تصحیح صفحه جاری
        const validPage = currentPage > newTotalPages && newTotalPages > 0 ? newTotalPages : currentPage;
        
        const startIndex = (validPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCompanies = data.slice(startIndex, endIndex);
        
        setCompanies(paginatedCompanies);
        setTotalPages(newTotalPages);
        
        // اگر صفحه تغییر کرده، آن را به‌روزرسانی کن
        if (validPage !== currentPage) {
          setPage(validPage);
        }
      } else {
        setCompanies([]);
        setTotalPages(1);
        setPage(1);
      }
      
      console.log('شرکت‌ها دریافت شده:', data); // برای دیباگ
      
      // اضافه کردن log برای بررسی ساختار داده‌ها
      if (data?.results && data.results.length > 0) {
        console.log('نمونه داده شرکت:', data.results[0]);
        console.log('لوگوی شرکت:', data.results[0].logo);
      }
    } catch (error: any) {
      console.error('خطا در دریافت شرکت‌ها:', error);
      toast.error('خطا در دریافت اطلاعات شرکت‌ها');
      setCompanies([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [page, pageSize, sortBy, sortOrder, searchQuery, statusFilter, isSearching]);

  // تابع دریافت دسته‌بندی‌ها (برای فیلتر)
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiGet('/industries/industry-categories/');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('خطا در دریافت دسته‌بندی‌ها:', error);
      setCategories([]);
    }
  }, []);

  // تابع دریافت صنایع (برای نمایش نام دسته‌بندی در جدول)
  const fetchIndustries = useCallback(async () => {
    try {
      const response = await apiGet('/industries/industries/');
      setIndustries(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('خطا در دریافت صنایع:', error);
      setIndustries([]);
    }
  }, []);

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await apiDelete(`/companies/${companyId}/`);
      toast.success('شرکت با موفقیت حذف شد');
      fetchCompanies();
    } catch (error: any) {
      console.error('خطا در حذف شرکت:', error);
      toast.error('خطا در حذف شرکت');
    }
  };

  const openWarningModal = (company: Company, action: 'delete' | 'edit') => {
    setWarningCompany(company);
    setWarningAction(action);
    setWarningModal(true);
  };

  const handleWarningConfirm = () => {
    if (!warningCompany) return;
    
    if (warningAction === 'delete') {
      handleDeleteCompany(warningCompany.id);
    } else if (warningAction === 'edit') {
      openEditDialog(warningCompany);
    }
    
    setWarningModal(false);
    setWarningCompany(null);
  };

  const handleDeleteWithWarning = (company: Company) => {
    openWarningModal(company, 'delete');
  };

  const openViewDialog = (company: Company) => {
    setSelectedCompany(company);
    setViewDialog(true);
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setEditForm({
      name: company.name,
      description: company.description || '',
      industry: company.industry?.toString() || '',
      website: company.website || '',
      email: company.email || '',
      phone_number: company.phone_number || '',
      address: company.address || '',
      postal_code: company.postal_code || '',
      founded_date: company.founded_date || '',
      number_of_employees: company.number_of_employees?.toString() || '',
      linkedin: company.linkedin || '',
      twitter: company.twitter || '',
      instagram: company.instagram || '',
      city_id: ''
    });

    // تنظیم preview های فایل‌ها
    setLogoPreview(company.logo ? getFullImageUrl(company.logo) || null : null);
    setBannerPreview(company.banner ? getFullImageUrl(company.banner) || null : null);
    setVideoPreview(company.intro_video ? getFullImageUrl(company.intro_video) || null : null);
    
    // پاک کردن فایل‌های جدید
    setLogoFile(null);
    setBannerFile(null);
    setVideoFile(null);

    setEditDialog(true);
  };

    const handleEditCompany = async (data: any, formData: FormData): Promise<{ success: boolean; message: string; redirectUrl: string }> => {
    if (!selectedCompany) return { success: false, message: 'شرکت انتخاب نشده', redirectUrl: '' };

    try {
      const response = await apiPut(`/companies/${selectedCompany.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('شرکت با موفقیت ویرایش شد');
        setEditDialog(false);
    fetchCompanies();
        return { success: true, message: 'شرکت با موفقیت ویرایش شد', redirectUrl: '' };
      }
      return { success: false, message: 'خطا در ویرایش شرکت', redirectUrl: '' };
    } catch (error: any) {
      console.error('خطا در ویرایش شرکت:', error);
      if (error.response?.data) {
        const errorMessage = Object.values(error.response.data).flat().join(', ');
        toast.error(`خطا در ویرایش شرکت: ${errorMessage}`);
      } else {
        toast.error('خطا در ویرایش شرکت');
      }
      throw error;
    }
  };

  // تابع برای دریافت نام فارسی فیلدهای مرتب‌سازی
  const getSortFieldLabel = (field: string) => {
    const labels = {
      'id': 'شناسه',
      'name': 'نام شرکت',
      'industry': 'گروه کاری',
      'location': 'موقعیت',
      'number_of_employees': 'تعداد کارمندان',
      'created_at': 'تاریخ ایجاد',
      'updated_at': 'آخرین به‌روزرسانی'
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

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // فانکشن‌های مدیریت فایل‌ها
  const handleFileChange = (file: File | null, type: 'logo' | 'banner' | 'video') => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      switch (type) {
        case 'logo':
          setLogoFile(file);
          setLogoPreview(result);
          break;
        case 'banner':
          setBannerFile(file);
          setBannerPreview(result);
          break;
        case 'video':
          setVideoFile(file);
          setVideoPreview(result);
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (type: 'logo' | 'banner' | 'video') => {
    switch (type) {
      case 'logo':
        setLogoFile(null);
        setLogoPreview(null);
        break;
      case 'banner':
        setBannerFile(null);
        setBannerPreview(null);
        break;
      case 'video':
        setVideoFile(null);
        setVideoPreview(null);
        break;
    }
  };

  const tableHeaders = [
    'نام شرکت',
    'گروه کاری', 
    'موقعیت',
    'وضعیت',
    'تاریخ ثبت',
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
                جستجو، فیلتر و مرتب‌سازی شرکت‌ها
        </Typography>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="جستجو در نام شرکت..."
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
            
            {/* گروه کاری از فیلتر حذف شده است */}

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
                  <MenuItem value="pending">در انتظار تایید</MenuItem>
                  <MenuItem value="approved">تایید شده</MenuItem>
                  <MenuItem value="rejected">رد شده</MenuItem>
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
                  <MenuItem value="name">نام شرکت</MenuItem>
                  <MenuItem value="industry">گروه کاری</MenuItem>
                  <MenuItem value="location">موقعیت</MenuItem>
                  <MenuItem value="number_of_employees">تعداد کارمندان</MenuItem>
                  <MenuItem value="updated_at">آخرین به‌روزرسانی</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setFilterIndustry('');
                  setStatusFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchCompanies();
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

        {/* کارت‌های شرکت‌ها */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(isSearching || loading) ? (
            // اسکلتون لودینگ هنگام جستجو
            [1, 2, 3].map((item) => (
              <CompanyCardSkeleton key={item} />
            ))
          ) : companies.length > 0 ? (
            companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onView={openViewDialog}
                onEdit={openEditDialog}
                onDelete={handleDeleteWithWarning}
                onApprove={async (c) => {
                  try {
                    await apiPost(`/companies/${c.id}/approve/`, {});
                    toast.success('شرکت تایید شد');
                    fetchCompanies();
                  } catch (e) {
                    toast.error('خطا در تایید شرکت');
                  }
                }}
                onReject={async (c) => {
                  try {
                    await apiPost(`/companies/${c.id}/reject/`, {});
                    toast.success('شرکت رد شد');
                    fetchCompanies();
                  } catch (e) {
                    toast.error('خطا در رد شرکت');
                  }
                }}
                industries={industries}
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
                هیچ شرکتی یافت نشد
              </Typography>
              <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                شرکتی با این مشخصات در سیستم وجود ندارد
              </Typography>
            </Paper>
          )}
        </Box>

        {/* پیجینیشن هوشمند */}
        {companies.length > 0 && totalPages > 0 && (
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

        {/* مودال مشاهده جزئیات */}
        <Dialog 
          open={viewDialog} 
          onClose={() => setViewDialog(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 2 },
              bgcolor: 'white',
              border: `1px solid ${ADMIN_THEME.bgLight}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              maxHeight: { xs: '100vh', sm: '90vh' },
              height: { xs: '100vh', sm: 'auto' },
              overflow: 'hidden',
              m: { xs: 0, sm: 2 }
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: ADMIN_THEME.bgLight,
            borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
            p: { xs: 2, sm: 3 },
            '& .MuiTypography-root': {
              fontWeight: 'bold',
              color: ADMIN_THEME.primary,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }
          }}>
            جزئیات شرکت
          </DialogTitle>
          <DialogContent sx={{ p: 0, overflow: 'auto' }}>
            {selectedCompany && (
              <Box>
                {/* بنر شرکت - کاملاً ریسپانسیو */}
                <Box 
                  sx={{ 
                    height: { xs: 120, sm: 150, md: 200 }, 
                    width: '100%', 
                    bgcolor: '#f5f5f5',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {selectedCompany.banner ? (
                    <img 
                      src={getFullImageUrl(selectedCompany.banner) || ''} 
                      alt={`${selectedCompany.name} banner`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        console.error('خطا در بارگذاری بنر:', selectedCompany.banner);
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: '100%', 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: ADMIN_THEME.bgLight,
                        opacity: 0.7
                      }}
                    >
                      <Business sx={{ 
                        fontSize: { xs: 40, sm: 60, md: 80 }, 
                        color: ADMIN_THEME.primary, 
                        opacity: 0.4 
                      }} />
                    </Box>
                  )}
                </Box>

                {/* محتوای اصلی */}
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  {/* هدر با لوگو و نام شرکت - ریسپانسیو */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    alignItems: { xs: 'center', sm: 'flex-start' }, 
                    mb: { xs: 3, sm: 4 },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <Avatar 
                      src={getFullImageUrl(selectedCompany.logo)}
                      alt={selectedCompany.name}
                      sx={{ 
                        width: { xs: 70, sm: 80, md: 100 }, 
                        height: { xs: 70, sm: 80, md: 100 }, 
                        border: '4px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        mt: { xs: -4, sm: -6, md: -8 },
                        ml: { xs: 0, sm: 2 },
                        mb: { xs: 1, sm: 0 },
                        bgcolor: ADMIN_THEME.primary,
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                        fontWeight: 'bold'
                      }}
                      onError={(e) => {
                        console.error('خطا در بارگذاری لوگو:', selectedCompany.logo);
                      }}
                    >
                      {!selectedCompany.logo && (selectedCompany.name ? selectedCompany.name[0].toUpperCase() : 'C')}
                    </Avatar>
                    <Box sx={{ 
                      textAlign: { xs: 'center', sm: 'right' }, 
                      width: '100%',
                      flex: 1
                    }} dir="rtl">
                      <Typography 
                        variant="h5" 
                        component="h1" 
                        fontWeight="bold" 
                        sx={{ 
                          mb: 1,
                          fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
                          textAlign: { xs: 'center', sm: 'start' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}
                        title={selectedCompany.name} // نمایش نام کامل در tooltip
                      >
                        {selectedCompany.name.length > 25 ? `${selectedCompany.name.substring(0, 25)}...` : selectedCompany.name}
                      </Typography>
                      {selectedCompany.industry && (
                        <Chip 
                          label={getIndustryName(selectedCompany.industry, industries)} 
                          size="small" 
                          sx={{ 
                            bgcolor: ADMIN_THEME.bgLight, 
                            color: ADMIN_THEME.primary,
                            fontWeight: 'medium',
                            mb: 1,
                            fontSize: { xs: '0.75rem', sm: '0.8rem' }
                          }} 
                        />
                      )}
                      {selectedCompany.location && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: { xs: 'center', sm: 'flex-start' }, 
                          mt: 1,
                          gap: 0.5
                        }}>
                          <LocationOnIcon sx={{ 
                            fontSize: { xs: 16, sm: 18 }, 
                            color: 'text.secondary' 
                          }} />
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                          >
                            {selectedCompany.location.province?.name && `${selectedCompany.location.province.name}، `}
                            {selectedCompany.location.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* توضیحات شرکت */}
                  {selectedCompany.description && (
                    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2, 
                          color: ADMIN_THEME.primary,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        درباره شرکت
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          textAlign: 'justify', 
                          lineHeight: 1.8,
                          fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                      >
                        {selectedCompany.description}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: { xs: 3, sm: 4 } }} />

                  {/* اطلاعات تماس و جزئیات - ریسپانسیو */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                    gap: { xs: 3, sm: 4 }
                  }}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2, 
                          color: ADMIN_THEME.primary,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        اطلاعات تماس
                      </Typography>
                      
                      <Box>
                        {selectedCompany.website && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                              <LanguageIcon fontSize="small" />
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: ADMIN_THEME.primary,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                wordBreak: 'break-all'
                              }}
                            >
                              {selectedCompany.website}
                            </Typography>
                          </Box>
                        )}
                        
                        {selectedCompany.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                              <EmailIcon fontSize="small" />
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: ADMIN_THEME.primary,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                wordBreak: 'break-all'
                              }}
                            >
                              {selectedCompany.email}
                            </Typography>
                          </Box>
                        )}
                        
                        {selectedCompany.phone_number && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                              <PhoneIcon fontSize="small" />
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: ADMIN_THEME.primary,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' }
                              }}
                            >
                              {selectedCompany.phone_number}
                            </Typography>
                          </Box>
                        )}
                        
                        {selectedCompany.address && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ ml: 1, color: ADMIN_THEME.primary, mt: 0.5, flexShrink: 0 }}>
                              <LocationOnIcon fontSize="small" />
                            </Box>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                lineHeight: 1.6
                              }}
                            >
                              {selectedCompany.address}
                              {selectedCompany.postal_code && ` - کد پستی: ${selectedCompany.postal_code}`}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* شبکه‌های اجتماعی */}
                      {(selectedCompany.linkedin || selectedCompany.twitter || selectedCompany.instagram) && (
                        <Box sx={{ mt: 4 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              mb: 2, 
                              color: ADMIN_THEME.primary,
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            شبکه‌های اجتماعی
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            {selectedCompany.linkedin && (
                              <Avatar sx={{ 
                                bgcolor: '#0077b5',
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 }
                              }}>
                                <LinkedInIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                              </Avatar>
                            )}
                            {selectedCompany.twitter && (
                              <Avatar sx={{ 
                                bgcolor: '#1DA1F2',
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 }
                              }}>
                                <TwitterIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                              </Avatar>
                            )}
                            {selectedCompany.instagram && (
                              <Avatar sx={{ 
                                bgcolor: '#E4405F',
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 }
                              }}>
                                <InstagramIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                              </Avatar>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                    
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2, 
                          color: ADMIN_THEME.primary,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        اطلاعات شرکت
                      </Typography>
                      
                      <Box>
                        {selectedCompany.founded_date && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                              <CalendarTodayIcon fontSize="small" />
                            </Box>
                            <Typography 
                              variant="body2"
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                            >
                              <Box component="span" fontWeight="medium">تاریخ تأسیس:</Box> {convertToJalali(selectedCompany.founded_date)}
                            </Typography>
                          </Box>
                        )}
                        
                        {selectedCompany.number_of_employees && selectedCompany.number_of_employees > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                              <PeopleAltIcon fontSize="small" />
                            </Box>
                            <Typography 
                              variant="body2"
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                            >
                              <Box component="span" fontWeight="medium">تعداد کارکنان:</Box> {convertToPersianNumbers(selectedCompany.number_of_employees)} نفر
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                            <CalendarTodayIcon fontSize="small" />
                          </Box>
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                          >
                            <Box component="span" fontWeight="medium">تاریخ ثبت در سامانه:</Box> {convertToJalali(selectedCompany.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* ویدیوی معرفی شرکت - ریسپانسیو */}
                  {selectedCompany.intro_video && (
                    <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2, 
                          color: ADMIN_THEME.primary,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        ویدیوی معرفی
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          width: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: '#f5f5f5',
                          position: 'relative',
                          height: { xs: 200, sm: 250, md: 350 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <video
                          src={getFullImageUrl(selectedCompany.intro_video) || ''}
                          controls
                          preload="metadata"
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                          onError={(e) => {
                            console.error('خطا در بارگذاری ویدیو:', selectedCompany.intro_video);
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            bgcolor: ADMIN_THEME.bgLight,
            borderTop: `1px solid ${ADMIN_THEME.bgLight}`,
            p: { xs: 2, sm: 3 }
          }}>
            <Button 
              onClick={() => setViewDialog(false)} 
              variant="outlined"
              sx={{
                borderColor: ADMIN_THEME.primary,
                color: ADMIN_THEME.primary,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                '&:hover': {
                  borderColor: ADMIN_THEME.dark,
                  bgcolor: ADMIN_THEME.bgLight
                }
              }}
            >
              بستن
            </Button>
          </DialogActions>
        </Dialog>

        {/* دیالوگ ویرایش */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 2 },
              bgcolor: 'white',
              border: `1px solid ${ADMIN_THEME.bgLight}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              maxHeight: { xs: '100vh', sm: '90vh' },
              height: { xs: '100vh', sm: 'auto' },
              overflow: 'hidden',
              m: { xs: 0, sm: 2 }
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: ADMIN_THEME.bgLight,
            borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
            p: { xs: 2, sm: 3 },
            '& .MuiTypography-root': {
              fontWeight: 'bold',
              color: ADMIN_THEME.primary,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }
          }}>
            ویرایش شرکت
          </DialogTitle>
          <DialogContent sx={{ p: 0, overflow: 'auto' }}>
            {selectedCompany && (
              <CreateCompanyForm 
                initialData={selectedCompany as CompanyFormData}
                isEditMode={true}
                onSubmit={handleEditCompany}
                pageTitle=""
                pageIcon={<Edit />}
                submitButtonText="ذخیره تغییرات"
                successMessage="شرکت با موفقیت ویرایش شد"
              />
            )}
          </DialogContent>
        </Dialog>
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
              <Search sx={{ color: ADMIN_THEME.primary, fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ color: ADMIN_THEME.primary, fontWeight: 600 }}>
                جستجو، فیلتر و مرتب‌سازی شرکت‌ها
              </Typography>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="جستجو در نام شرکت، گروه کاری..."
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
                <InputLabel>گروه کاری</InputLabel>
                <Select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  label="گروه کاری"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ADMIN_THEME.bgLight,
                    }
                  }}
                >
                  <MenuItem value="">همه گروه کاری‌ها</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

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
                  <MenuItem value="pending">در انتظار تایید</MenuItem>
                  <MenuItem value="approved">تایید شده</MenuItem>
                  <MenuItem value="rejected">رد شده</MenuItem>
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
                  <MenuItem value="name">نام شرکت</MenuItem>
                  <MenuItem value="industry">گروه کاری</MenuItem>
                  <MenuItem value="location">موقعیت</MenuItem>
                  <MenuItem value="number_of_employees">تعداد کارمندان</MenuItem>
                  <MenuItem value="updated_at">آخرین به‌روزرسانی</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setFilterIndustry('');
                  setStatusFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  fetchCompanies();
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
              جستجو، فیلتر و مرتب‌سازی شرکت‌ها
        </Typography>
      </Box>
            <Typography variant="caption" sx={{ color: ADMIN_THEME.dark, mb: 1, mt: -1 }}>
              می‌توانید با هر کلیدواژه‌ای در نام شرکت، موقعیت و ... جستجو کنید.
            </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
              size="small"
              placeholder="جستجو در نام شرکت..."
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
                InputProps={{ endAdornment: <Search sx={{ color: ADMIN_THEME.primary }} /> }}
          />
            
            <Button
              variant="outlined"
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
            
            {/* فیلتر گروه کاری حذف شد */}
              
              <FormControl size="small" sx={{ minWidth: 180, maxWidth: 220 }}>
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
                    },
                    '& .MuiSelect-icon': {
                      color: ADMIN_THEME.primary,
                    }
                  }}
                >
                  <MenuItem value="">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="pending">در انتظار تایید</MenuItem>
                  <MenuItem value="approved">تایید شده</MenuItem>
                  <MenuItem value="rejected">رد شده</MenuItem>
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
                <MenuItem value="created_at">تاریخ ایجاد</MenuItem>
                <MenuItem value="name">نام شرکت</MenuItem>
                <MenuItem value="industry">گروه کاری</MenuItem>
                <MenuItem value="location">موقعیت</MenuItem>
                <MenuItem value="number_of_employees">تعداد کارمندان</MenuItem>
                <MenuItem value="updated_at">آخرین به‌روزرسانی</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton
              onClick={() => {
                setSearchQuery('');
                setSearchInput('');
                setFilterIndustry('');
                  setStatusFilter('');
                setSortBy('created_at');
                setSortOrder('desc');
                fetchCompanies();
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

      {loading && companies.length === 0 ? (
        /* نمایش اسکلتون در حالت لودینگ اولیه */
        isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((item) => (
              <CompanyCardSkeleton key={item} />
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
                    <TableCell sx={{ textAlign: 'left' }}>نام شرکت</TableCell>
                    <TableCell>گروه کاری</TableCell>
                    <TableCell>موقعیت</TableCell>
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
      ) : companies.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '12px', background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`, border: `2px solid ${ADMIN_THEME.bgLight}` }}>
          <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
            هیچ شرکتی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
            شرکتی با این مشخصات در سیستم وجود ندارد
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
                  <CompanyCardSkeleton key={item} />
                ))
              ) : companies.length > 0 ? (
                companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onView={openViewDialog}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteWithWarning}
                    onApprove={async (c) => {
                      try {
                        await apiPost(`/companies/${c.id}/approve/`, {});
                        toast.success('شرکت تایید شد');
                        fetchCompanies();
                      } catch (e) {
                        toast.error('خطا در تایید شرکت');
                      }
                    }}
                    onReject={async (c) => {
                      try {
                        await apiPost(`/companies/${c.id}/reject/`, {});
                        toast.success('شرکت رد شد');
                        fetchCompanies();
                      } catch (e) {
                        toast.error('خطا در رد شرکت');
                      }
                    }}
                    industries={industries}
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
          هیچ شرکتی یافت نشد
          </Typography>
          <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
            شرکتی با این مشخصات در سیستم وجود ندارد
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
                      <TableCell sx={{ textAlign: 'left' }}>نام شرکت</TableCell>
                      <TableCell>گروه کاری</TableCell>
                      <TableCell>موقعیت</TableCell>
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
                    companies.map((company) => (
                      <TableRow key={company.id} hover sx={{ '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight } }}>
                        <TableCell sx={{ textAlign: 'left !important' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                              src={getFullImageUrl(company.logo)}
                              sx={{
                                width: 45,
                                height: 45,
                                bgcolor: company.logo ? 'transparent' : ADMIN_THEME.primary,
                                border: `2px solid ${ADMIN_THEME.bgLight}`,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                flexShrink: 0,
                                '& img': {
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: '100%'
                                }
                              }}
                              onError={(e) => {
                                console.error('خطا در بارگذاری تصویر:', company.logo);
                                console.error('URL کامل:', getFullImageUrl(company.logo));
                                console.error('عنصر:', e.target);
                              }}
                            >
                              {!company.logo && (company.name ? company.name[0].toUpperCase() : 'C')}
                      </Avatar>
                            <Box sx={{ textAlign: 'left', flex: 1 }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: ADMIN_THEME.dark,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 300,
                                  display: 'block'
                                }}
                                title={company.name}
                              >
                                {truncateText(company.name, 30)}
                              </Typography>
                            </Box>
                          </Box>
                    </TableCell>
                    <TableCell>
                          <span title={getIndustryCategoryName(company.industry, industries)}>
                            {truncateText(getIndustryCategoryName(company.industry, industries), 20)}
                          </span>
                    </TableCell>
                    <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN_THEME.dark, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}>
                              {truncateText(company.location?.name || 'بدون شهر', 30)}
                            </Typography>
                            {company.location?.province?.name && (
                              <Typography variant="caption" sx={{ color: ADMIN_THEME.primary, opacity: 0.8, display: 'block', mt: 0.5 }}>
                                {truncateText(company.location.province.name, 20)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={company.status === 'A' ? 'تایید شده' : company.status === 'R' ? 'رد شده' : 'در انتظار تایید'}
                            color={company.status === 'A' ? 'success' : company.status === 'R' ? 'error' : 'warning'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                          />
                    </TableCell>
                    <TableCell>
                          {company.created_at ? convertToJalali(company.created_at) : 'بدون تاریخ'}
                    </TableCell>
                        <TableCell sx={{ textAlign: 'center', minWidth: 120, py: 2 }}>
                          <ActionButtons
                            onView={() => openViewDialog(company)}
                            onApprove={(company.status === 'R' || company.status === 'P') ? async () => {
                              try {
                                await apiPost(`/companies/${company.id}/approve/`, {});
                                toast.success('شرکت تایید شد');
                                fetchCompanies();
                              } catch (e) {
                                toast.error('خطا در تایید شرکت');
                              }
                            } : undefined}
                            onReject={(company.status === 'A' || company.status === 'P') ? async () => {
                              try {
                                await apiPost(`/companies/${company.id}/reject/`, {});
                                toast.success('شرکت رد شد');
                                fetchCompanies();
                              } catch (e) {
                                toast.error('خطا در رد شرکت');
                              }
                            } : undefined}
                            onDelete={() => handleDeleteWithWarning(company)}
                            status={company.status}
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
          {companies.length > 0 && totalPages > 0 && (
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

      {/* مودال مشاهده جزئیات */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            bgcolor: 'white',
            border: `1px solid ${ADMIN_THEME.bgLight}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            maxHeight: { xs: '100vh', sm: '90vh' },
            height: { xs: '100vh', sm: 'auto' },
            overflow: 'hidden',
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: ADMIN_THEME.bgLight,
          borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
          p: { xs: 2, sm: 3 },
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            color: ADMIN_THEME.primary,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }
        }}>
          جزئیات شرکت
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {selectedCompany && (
            <Box>
              {/* بنر شرکت - کاملاً ریسپانسیو */}
              <Box 
                sx={{ 
                  height: { xs: 120, sm: 150, md: 200 }, 
                  width: '100%', 
                  bgcolor: '#f5f5f5',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {selectedCompany.banner ? (
                  <img 
                    src={getFullImageUrl(selectedCompany.banner) || ''} 
                    alt={`${selectedCompany.name} banner`}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    onError={(e) => {
                      console.error('خطا در بارگذاری بنر:', selectedCompany.banner);
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: ADMIN_THEME.bgLight,
                      opacity: 0.7
                    }}
                  >
                    <Business sx={{ 
                      fontSize: { xs: 40, sm: 60, md: 80 }, 
                      color: ADMIN_THEME.primary, 
                      opacity: 0.4 
                    }} />
                  </Box>
                )}
              </Box>

              {/* محتوای اصلی */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* هدر با لوگو و نام شرکت - ریسپانسیو */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'center', sm: 'flex-start' }, 
                  mb: { xs: 3, sm: 4 },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Avatar 
                    src={getFullImageUrl(selectedCompany.logo)}
                    alt={selectedCompany.name}
                    sx={{ 
                      width: { xs: 70, sm: 80, md: 100 }, 
                      height: { xs: 70, sm: 80, md: 100 }, 
                      border: '4px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      mt: { xs: -4, sm: -6, md: -8 },
                      ml: { xs: 0, sm: 2 },
                      mb: { xs: 1, sm: 0 },
                      bgcolor: ADMIN_THEME.primary,
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                      fontWeight: 'bold'
                    }}
                    onError={(e) => {
                      console.error('خطا در بارگذاری لوگو:', selectedCompany.logo);
                    }}
                  >
                    {!selectedCompany.logo && (selectedCompany.name ? selectedCompany.name[0].toUpperCase() : 'C')}
                  </Avatar>
                  <Box sx={{ 
                    textAlign: { xs: 'center', sm: 'right' }, 
                    width: '100%',
                    flex: 1
                  }} dir="rtl">
                    <Typography 
                      variant="h5" 
                      component="h1" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 1,
                        fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
                        textAlign: { xs: 'center', sm: 'start' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                      title={selectedCompany.name} // نمایش نام کامل در tooltip
                    >
                      {truncateText(selectedCompany.name, 30)}
              </Typography>
                    {selectedCompany.industry && (
                      <Chip 
                        label={truncateText(getIndustryCategoryName(selectedCompany.industry, industries), 20)} 
                        size="small" 
                        sx={{ 
                          bgcolor: ADMIN_THEME.bgLight, 
                          color: ADMIN_THEME.primary,
                          fontWeight: 'medium',
                          mb: 1,
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }} 
                      />
                    )}
                    {selectedCompany.location && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: { xs: 'center', sm: 'flex-start' }, 
                        mt: 1,
                        gap: 0.5
                      }}>
                        <LocationOnIcon sx={{ 
                          fontSize: { xs: 16, sm: 18 }, 
                          color: 'text.secondary' 
                        }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                        >
                          {truncateText(selectedCompany.location.province?.name || '', 20)}
                          {selectedCompany.location.name}
              </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* توضیحات شرکت */}
                {selectedCompany.description && (
                  <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 2, 
                        color: ADMIN_THEME.primary,
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      درباره شرکت
              </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        textAlign: 'justify', 
                        lineHeight: 1.8,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {truncateText(selectedCompany.description, 100)}
              </Typography>
                  </Box>
                )}

                <Divider sx={{ my: { xs: 3, sm: 4 } }} />

                {/* اطلاعات تماس و جزئیات - ریسپانسیو */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                  gap: { xs: 3, sm: 4 }
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 2, 
                        color: ADMIN_THEME.primary,
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      اطلاعات تماس
              </Typography>
                    
                    <Box>
                      {selectedCompany.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                            <LanguageIcon fontSize="small" />
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: ADMIN_THEME.primary,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              wordBreak: 'break-all'
                            }}
                          >
                            {truncateText(selectedCompany.website, 30)}
              </Typography>
                        </Box>
                      )}
                      
                      {selectedCompany.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                            <EmailIcon fontSize="small" />
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: ADMIN_THEME.primary,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              wordBreak: 'break-all'
                            }}
                          >
                            {truncateText(selectedCompany.email, 30)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedCompany.phone_number && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                            <PhoneIcon fontSize="small" />
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: ADMIN_THEME.primary,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }}
                          >
                            {truncateText(selectedCompany.phone_number, 30)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedCompany.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ ml: 1, color: ADMIN_THEME.primary, mt: 0.5, flexShrink: 0 }}>
                            <LocationOnIcon fontSize="small" />
                          </Box>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              lineHeight: 1.6
                            }}
                          >
                            {truncateText(selectedCompany.address, 30)}
                            {selectedCompany.postal_code && ` - کد پستی: ${truncateText(selectedCompany.postal_code, 10)}`}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* شبکه‌های اجتماعی */}
                    {(selectedCompany.linkedin || selectedCompany.twitter || selectedCompany.instagram) && (
                      <Box sx={{ mt: 4 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 2, 
                            color: ADMIN_THEME.primary,
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                          }}
                        >
                          شبکه‌های اجتماعی
              </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {selectedCompany.linkedin && (
                            <Avatar sx={{ 
                              bgcolor: '#0077b5',
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 }
                            }}>
                              <LinkedInIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                            </Avatar>
                          )}
                          {selectedCompany.twitter && (
                            <Avatar sx={{ 
                              bgcolor: '#1DA1F2',
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 }
                            }}>
                              <TwitterIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                            </Avatar>
                          )}
                          {selectedCompany.instagram && (
                            <Avatar sx={{ 
                              bgcolor: '#E4405F',
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 }
                            }}>
                              <InstagramIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
                            </Avatar>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 2, 
                        color: ADMIN_THEME.primary,
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      اطلاعات شرکت
              </Typography>
                    
                    <Box>
                      {selectedCompany.founded_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                            <CalendarTodayIcon fontSize="small" />
                          </Box>
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                          >
                            <Box component="span" fontWeight="medium">تاریخ تأسیس:</Box> {truncateText(convertToJalali(selectedCompany.founded_date), 20)}
              </Typography>
                        </Box>
                      )}
                      
                      {selectedCompany.number_of_employees && selectedCompany.number_of_employees > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                            <PeopleAltIcon fontSize="small" />
                          </Box>
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                          >
                            <Box component="span" fontWeight="medium">تعداد کارکنان:</Box> {truncateText(convertToPersianNumbers(selectedCompany.number_of_employees), 10)} نفر
              </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ ml: 1, color: ADMIN_THEME.primary }}>
                          <CalendarTodayIcon fontSize="small" />
                        </Box>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                        >
                          <Box component="span" fontWeight="medium">تاریخ ثبت در سامانه:</Box> {truncateText(convertToJalali(selectedCompany.created_at), 20)}
              </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                {/* ویدیوی معرفی شرکت - ریسپانسیو */}
                {selectedCompany.intro_video && (
                  <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 2, 
                        color: ADMIN_THEME.primary,
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      ویدیوی معرفی
              </Typography>
                    
                    <Box 
                      sx={{ 
                        width: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5',
                        position: 'relative',
                        height: { xs: 200, sm: 250, md: 350 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <video
                        src={getFullImageUrl(selectedCompany.intro_video) || ''}
                        controls
                        preload="metadata"
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        onError={(e) => {
                          console.error('خطا در بارگذاری ویدیو:', selectedCompany.intro_video);
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: ADMIN_THEME.bgLight,
          borderTop: `1px solid ${ADMIN_THEME.bgLight}`,
          p: { xs: 2, sm: 3 }
        }}>
          <Button 
            onClick={() => setViewDialog(false)} 
            variant="outlined"
            sx={{
              borderColor: ADMIN_THEME.primary,
              color: ADMIN_THEME.primary,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              '&:hover': {
                borderColor: ADMIN_THEME.dark,
                bgcolor: ADMIN_THEME.bgLight
              }
            }}
          >
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      {/* دیالوگ ویرایش */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            bgcolor: 'white',
            border: `1px solid #e0e7ff`,
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)',
            maxHeight: { xs: '100vh', sm: '90vh' },
            height: { xs: '100vh', sm: 'auto' },
            overflow: 'hidden',
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f3f4f6',
          borderBottom: `1px solid #e0e7ff`,
          p: { xs: 2, sm: 3 },
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            color: '#7c3aed',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }
        }}>
          ویرایش شرکت
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {selectedCompany && (
            <CreateCompanyForm 
              initialData={selectedCompany as CompanyFormData}
              isEditMode={true}
              onSubmit={handleEditCompany}
              pageTitle=""
              pageIcon={<Edit />}
              submitButtonText="ذخیره تغییرات"
              successMessage="شرکت با موفقیت ویرایش شد"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Warning Modal */}
      <WarningModal
        open={warningModal}
        onClose={() => setWarningModal(false)}
        onConfirm={handleWarningConfirm}
        user={warningCompany ? {
          id: warningCompany.id,
          full_name: warningCompany.name,
          user_type: 'EM', // شرکت‌ها معمولاً متعلق به کارفرمایان هستند
          profile_picture: warningCompany.logo
        } : null}
        action={warningAction}
        currentUserId=""
      />
    </Box>
  );
};

export default CompaniesManagement;