'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Skeleton, Divider, IconButton, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Category as CategoryIcon, Business as BusinessIcon, Delete, Edit, Refresh } from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import WarningModal from '../components/WarningModal';
import IndustryCardSkeleton from '../components/IndustryCardSkeleton';

interface IndustryCategory {
  id: number;
  name: string;
  icon?: string;
}

interface Industry {
  id: number;
  name: string;
  icon?: string;
  category: IndustryCategory;
}

const IndustriesManagement: React.FC = () => {
  // State
  const [categories, setCategories] = useState<IndustryCategory[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // Forms
  const [newCategory, setNewCategory] = useState('');
  const [newIndustry, setNewIndustry] = useState({ name: '', category_id: '' });
  // Simple edit state (optional)
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  // stateهای جستجو و فیلتر
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // WarningModal state
  const [warningModal, setWarningModal] = useState(false);
  const [warningIndustry, setWarningIndustry] = useState<Industry | null>(null);
  const [warningCategoryModal, setWarningCategoryModal] = useState(false);
  const [warningCategory, setWarningCategory] = useState<IndustryCategory | null>(null);

  // Edit Dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [editIndustry, setEditIndustry] = useState<Industry | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category_id: '' });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiGet('/industries/industry-categories/');
      const data: any = res.data;
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch {
      setCategories([]);
    }
  }, []);

  // اصلاح fetchIndustries برای پشتیبانی از جستجو و فیلتر
  const fetchIndustries = useCallback(async () => {
      setLoading(true);
      setError(null);
    try {
      const res = await apiGet('/industries/industries/');
      const data: any = res.data;
      let filtered = Array.isArray(data) ? data : [];
      // فیلتر بر اساس دسته‌بندی
      if (filterCategory) {
        filtered = filtered.filter((item: any) => String(item.category?.id) === String(filterCategory));
      }
      // جستجو بر اساس نام گروه کاری یا دسته‌بندی
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.name.toLowerCase().includes(q) ||
          (item.category?.name && item.category.name.toLowerCase().includes(q))
        );
      }
      const newTotalPages = Math.ceil(filtered.length / pageSize);
      const validPage = page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      const startIndex = (validPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setIndustries(filtered.slice(startIndex, endIndex));
      setTotalPages(newTotalPages);
      if (validPage !== page) setPage(validPage);
    } catch {
      setIndustries([]);
      setTotalPages(1);
      setError('خطا در دریافت گروه‌های کاری');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, filterCategory]);

  useEffect(() => {
    fetchCategories();
    // بررسی hash برای جستجو یا فیلتر
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('#industries?search=')) {
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const searchParam = urlParams.get('search');
        if (searchParam) {
          setSearchInput(searchParam);
          setSearchQuery(searchParam);
          setFilterCategory('');
          setPage(1);
        }
      } else if (hash.includes('#industries?filterCategory=')) {
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const filterParam = urlParams.get('filterCategory');
        if (filterParam) {
          setFilterCategory(filterParam);
          setSearchInput('');
          setSearchQuery('');
          setPage(1);
        }
      } else if (hash === '#industries') {
        setSearchInput('');
        setSearchQuery('');
        setFilterCategory('');
        setPage(1);
      }
    }
  }, [fetchCategories]);
  useEffect(() => { fetchIndustries(); }, [fetchIndustries]);

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await apiPost('/industries/industry-categories/', { name: newCategory });
      toast.success('گروه کاری اضافه شد');
      setNewCategory('');
    fetchCategories();
    } catch {
      toast.error('خطا در افزودن گروه کاری');
    }
  };
  // Edit category
  const handleEditCategory = async (id: number) => {
    if (!editCategoryName.trim()) return;
    try {
      await apiPut(`/industries/industry-categories/${id}/`, { name: editCategoryName });
      toast.success('گروه کاری با موفقیت ویرایش شد');
      setEditCategoryId(null);
      setEditCategoryName('');
      fetchCategories();
    } catch {
      toast.error('خطا در ویرایش گروه کاری');
    }
  };
  // Delete category
  const handleDeleteCategory = async (id: number) => {
    try {
      await apiDelete(`/industries/industry-categories/${id}/`);
      toast.success('گروه کاری با موفقیت حذف شد');
      fetchCategories();
    } catch {
      toast.error('خطا در حذف گروه کاری');
    }
  };
  // Add industry
  const handleAddIndustry = async () => {
    if (!newIndustry.name.trim() || !newIndustry.category_id) return;
    try {
      const formData = new FormData();
      formData.append('name', newIndustry.name);
      formData.append('category_id', newIndustry.category_id);
      await apiPost('/industries/industries/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('گروه کاری اضافه شد');
      setNewIndustry({ name: '', category_id: '' });
      fetchIndustries();
    } catch {
      toast.error('خطا در افزودن گروه کاری');
    }
  };

  // WarningModal functions
  const openWarningModal = (industry: Industry) => {
    setWarningIndustry(industry);
    setWarningModal(true);
  };
  const handleWarningConfirm = async () => {
    if (!warningIndustry) return;
    try {
      await apiDelete(`/industries/industries/${warningIndustry.id}/`);
      toast.success('گروه کاری با موفقیت حذف شد');
      fetchIndustries();
    } catch {
      toast.error('خطا در حذف گروه کاری');
    }
    setWarningModal(false);
    setWarningIndustry(null);
  };

  // WarningModal for categories
  const openWarningModalCategory = (category: IndustryCategory) => {
    setWarningCategory(category);
    setWarningCategoryModal(true);
  };
  const handleWarningConfirmCategory = async () => {
    if (!warningCategory) return;
    try {
      await apiDelete(`/industries/industry-categories/${warningCategory.id}/`);
      toast.success('دسته‌بندی با موفقیت حذف شد');
      fetchCategories();
    } catch {
      toast.error('خطا در حذف دسته‌بندی');
    }
    setWarningCategoryModal(false);
    setWarningCategory(null);
  };

  // Edit Dialog functions
  const openEditDialog = (industry: Industry) => {
    setEditIndustry(industry);
    setEditForm({ name: industry.name, category_id: industry.category?.id ? String(industry.category.id) : '' });
    setEditDialog(true);
  };
  const handleEditIndustry = async () => {
    if (!editIndustry) return;
    try {
      await apiPut(`/industries/industries/${editIndustry.id}/`, {
        name: editForm.name,
        category_id: Number(editForm.category_id)
      });
      toast.success('گروه کاری با موفقیت ویرایش شد');
      setEditDialog(false);
      setEditIndustry(null);
      fetchIndustries();
    } catch {
      toast.error('خطا در ویرایش گروه کاری');
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => { setPageSize(newSize); setPage(1); };

  // هندل جستجو
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };
  // هندل فیلتر دسته‌بندی
  const handleFilterCategory = (e: any) => {
    setFilterCategory(e.target.value);
    setPage(1);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* بخش مدیریت و افزودن دسته‌بندی */}
      <Paper sx={{ 
        background: 'white',
        borderRadius: '12px',
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 },
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${ADMIN_THEME.bgLight}`
      }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: ADMIN_THEME.dark, mb: 2, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
          مدیریت گروه‌های کاری
        </Typography>
        {categories.length === 0 ? (
          <Box>
            <Typography sx={{ mb: 2, fontSize: { xs: '0.95rem', sm: '1rem' }, color: ADMIN_THEME.dark }}>ابتدا یک گروه کاری ایجاد کنید:</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField label="نام گروه کاری" value={newCategory} onChange={e => setNewCategory(e.target.value)} fullWidth={true} size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ADMIN_THEME.dark }
                  }
                }}
              />
              <Button variant="outlined" onClick={handleAddCategory} startIcon={<Add />} fullWidth={true} sx={{ minWidth: 120, mt: { xs: 1, sm: 0 }, borderColor: ADMIN_THEME.dark, color: ADMIN_THEME.dark, bgcolor: 'white', '&:hover': { bgcolor: ADMIN_THEME.bgLight, borderColor: ADMIN_THEME.dark } }}>افزودن گروه کاری</Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {/* فرم افزودن دسته‌بندی */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
              <TextField label="نام دسته‌بندی جدید" value={newCategory} onChange={e => setNewCategory(e.target.value)} fullWidth={true} size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ADMIN_THEME.dark }
                  }
                }}
              />
              <Button variant="outlined" onClick={handleAddCategory} startIcon={<Add />} fullWidth={true} sx={{ minWidth: 120, mt: { xs: 1, sm: 0 }, borderColor: ADMIN_THEME.dark, color: ADMIN_THEME.dark, bgcolor: 'white', '&:hover': { bgcolor: ADMIN_THEME.bgLight, borderColor: ADMIN_THEME.dark } }}>افزودن دسته‌بندی</Button>
            </Box>
            {/* لیست دسته‌بندی‌ها */}
            <Box sx={{ mb: 1 }}>
              <Typography fontWeight={600} sx={{ mb: 1, fontSize: { xs: '0.95rem', sm: '1rem' }, color: ADMIN_THEME.dark }}>گروه‌های کاری موجود:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: { xs: 180, sm: 'none' }, overflowX: 'auto', pb: { xs: 1, sm: 0 } }}>
                {categories.map(cat => (
                  <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 2, px: 1.5, py: 0.7, bgcolor: 'white', gap: 0.5, minWidth: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    {editCategoryId === cat.id ? (
                      <>
                        <TextField size="small" value={editCategoryName} onChange={e => setEditCategoryName(e.target.value)} sx={{ mr: 1, minWidth: 60, '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ADMIN_THEME.dark }, fontSize: '0.85rem', height: 32 } }} fullWidth={true} inputProps={{ style: { fontSize: '0.85rem', padding: '4px 8px' } }} />
                        <Button size="small" onClick={() => handleEditCategory(cat.id)} variant="outlined" sx={{ borderColor: ADMIN_THEME.dark, color: ADMIN_THEME.dark, bgcolor: 'white', fontSize: '0.85rem', px: 1.2, py: 0.2, minWidth: 0, '&:hover': { bgcolor: ADMIN_THEME.bgLight, borderColor: ADMIN_THEME.dark } }}>ذخیره</Button>
                        <Button size="small" onClick={() => { setEditCategoryId(null); setEditCategoryName(''); }} sx={{ fontSize: '0.85rem', px: 1.2, py: 0.2, minWidth: 0 }}>انصراف</Button>
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontSize: '1rem', color: 'black' }}>{cat.name}</Typography>
                        <IconButton size="small" onClick={() => { setEditCategoryId(cat.id); setEditCategoryName(cat.name); }} sx={{ color: ADMIN_THEME.dark, fontSize: '0.85rem', p: 0.5 }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => openWarningModalCategory(cat)}><Delete fontSize="small" /></IconButton>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* فرم افزودن زیر گروه کاری جدید */}
      <Paper sx={{
        background: 'white',
        borderRadius: '12px',
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 },
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${ADMIN_THEME.bgLight}`
      }}>
        <Typography fontWeight={600} sx={{ mb: { xs: 2, sm: 1 }, fontSize: { xs: '1.1rem', sm: '1.1rem' }, color: ADMIN_THEME.dark }}>افزودن زیر گروه کاری جدید</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { sm: 'center' }
        }}>
          <TextField
            label="نام زیر گروه کاری"
            value={newIndustry.name}
            onChange={e => setNewIndustry({ ...newIndustry, name: e.target.value })}
            fullWidth={true}
            size="small"
            sx={{
              fontSize: { xs: '1rem', sm: '0.95rem' },
              mb: { xs: 1, sm: 0 },
              flex: { xs: 'unset', sm: 2 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: { xs: '1rem', sm: '0.95rem' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ADMIN_THEME.dark }
              }
            }}
          />
          <FormControl sx={{ minWidth: { xs: 120, sm: 140 }, flex: 1, mb: { xs: 1, sm: 0 } }} size="small">
            <InputLabel>گروه کاری</InputLabel>
            <Select
              value={newIndustry.category_id}
              label="گروه کاری"
              onChange={e => setNewIndustry({ ...newIndustry, category_id: e.target.value })}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: ADMIN_THEME.dark
                  }
                }
              }}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={handleAddIndustry}
            startIcon={<Add />}
            sx={{
              minWidth: { xs: 120, sm: 120, md: 140 },
              maxWidth: { xs: '100%', sm: 180 },
              mt: { xs: 1, sm: 0 },
              borderColor: ADMIN_THEME.dark,
              color: ADMIN_THEME.dark,
              bgcolor: 'white',
              '&:hover': { bgcolor: ADMIN_THEME.bgLight, borderColor: ADMIN_THEME.dark }
            }}
          >
            افزودن زیر گروه کاری
          </Button>
        </Box>
      </Paper>

      {/* جستجو و فیلتر */}
      <Paper sx={{ 
        background: 'white',
        borderRadius: '12px',
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 },
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${ADMIN_THEME.bgLight}`
      }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 2 }, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="جستجو در نام زیر گروه کاری یا گروه کاری..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyPress={e => { if (e.key === 'Enter') handleSearch(); }}
            fullWidth
            sx={{
              fontSize: { xs: '1rem', sm: '0.95rem' },
              mb: { xs: 1, sm: 0 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: { xs: '1rem', sm: '0.95rem' }
              }
            }}
          />
          <Button
            variant="outlined"
            onClick={handleSearch}
            fullWidth
            sx={{
              borderColor: ADMIN_THEME.dark,
              color: ADMIN_THEME.dark,
              minWidth: 100,
              fontSize: { xs: '1rem', sm: '0.95rem' },
              py: { xs: 1.2, sm: 0.7 },
              mb: { xs: 1, sm: 0 },
              '&:hover': { borderColor: ADMIN_THEME.bgLight, bgcolor: ADMIN_THEME.bgVeryLight }
            }}
          >
            جستجو
          </Button>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, maxWidth: { xs: '100%', sm: 200 }, mb: { xs: 1, sm: 0 } }}>
            <InputLabel>گروه کاری</InputLabel>
            <Select value={filterCategory} onChange={handleFilterCategory} label="گروه کاری" sx={{ borderRadius: 2, fontSize: { xs: '1rem', sm: '0.95rem' } }} fullWidth>
              <MenuItem value="">همه گروه‌های کاری</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={() => {
              setSearchInput('');
              setSearchQuery('');
              setFilterCategory('');
              setPage(1);
            }}
            sx={{
              bgcolor: ADMIN_THEME.bgLight,
              color: ADMIN_THEME.dark,
              '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight, color: ADMIN_THEME.dark },
              mb: { xs: 1, sm: 0 }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Paper>

      {/* جدول زیر گروه‌های کاری */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          mt: 3
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
                <TableCell>نام زیر گروه کاری</TableCell>
                <TableCell>گروه کاری</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{
              '& .MuiTableCell-body': {
                textAlign: 'center',
                py: 2,
                borderBottom: `1px solid ${ADMIN_THEME.bgLight}`
              }
            }}>
              {loading ? (
                isMobile ? (
                  // نمایش موبایل - کارت‌های اسکلتون
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[1, 2, 3].map((item) => (
                          <IndustryCardSkeleton key={item} />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  // نمایش دسکتاپ - جدول اسکلتون
                [1,2,3,4,5].map((item) => (
                  <TableRow key={item}>
                    <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
                )
              ) : industries.length > 0 ? (
                isMobile ? (
                  // نمایش موبایل - کارت‌های صنعت
                  industries.map((industry) => (
                    <TableRow key={industry.id}>
                      <TableCell colSpan={3}>
                        <Paper sx={{ 
                          p: 2, 
                          mb: 2,
                          borderRadius: 2,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          border: `1px solid ${ADMIN_THEME.bgLight}`,
                          '&:hover': { 
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            borderColor: ADMIN_THEME.primary 
                          }
                        }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {/* نام صنعت */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
                              pb: 1
                            }}>
                              <Typography sx={{ 
                                fontSize: '1.1rem', 
                                fontWeight: 700, 
                                color: ADMIN_THEME.primary 
                              }}>
                                {industry.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(industry)}
                                  sx={{ 
                                    color: ADMIN_THEME.primary,
                                    bgcolor: ADMIN_THEME.bgLight,
                                    '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => openWarningModal(industry)}
                                  sx={{ 
                                    color: 'error.main',
                                    bgcolor: ADMIN_THEME.bgLight,
                                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            
                            {/* اطلاعات صنعت */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              p: 1,
                              bgcolor: ADMIN_THEME.bgVeryLight,
                              borderRadius: 1
                            }}>
                              <Typography sx={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 600, 
                                color: ADMIN_THEME.dark,
                                minWidth: '80px'
                              }}>
                                گروه کاری:
                              </Typography>
                              <Chip
                                label={industry.category?.name || 'نامشخص'}
                                size="small"
                                sx={{
                                  bgcolor: ADMIN_THEME.primary,
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  height: '24px',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    bgcolor: ADMIN_THEME.dark,
                                    transform: 'scale(1.05)'
                                  }
                                }}
                                onClick={() => {
                                  setFilterCategory(industry.category.id.toString());
                                  setSearchInput('');
                                  setSearchQuery('');
                                  setPage(1);
                                }}
                              />
                            </Box>
                          </Box>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // نمایش دسکتاپ - جدول صنایع
                  industries.map((industry) => (
                    <TableRow key={industry.id} sx={{ '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight } }}>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: ADMIN_THEME.dark }}>
                          {industry.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={industry.category?.name || 'نامشخص'}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: industry.category?.name ? 'pointer' : 'default',
                            color: industry.category?.name ? ADMIN_THEME.primary : undefined,
                            borderColor: industry.category?.name ? ADMIN_THEME.primary : undefined,
                            '&:hover': industry.category?.name ? {
                              bgcolor: ADMIN_THEME.bgLight,
                              borderColor: ADMIN_THEME.primary,
                              color: ADMIN_THEME.primary,
                              textDecoration: 'underline'
                            } : {},
                          }}
                          onClick={industry.category?.name ? () => {
                            setFilterCategory(industry.category.id.toString());
                            setSearchInput('');
                            setSearchQuery('');
                            setPage(1);
                          } : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton onClick={() => openEditDialog(industry)} size="small" title="ویرایش گروه کاری" sx={{ color: ADMIN_THEME.primary, '&:hover': { bgcolor: ADMIN_THEME.bgLight } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => openWarningModal(industry)} size="small" color="error" title="حذف" sx={{ '&:hover': { bgcolor: 'error.light' } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Box sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ color: ADMIN_THEME.primary, mb: 1 }}>
                        هیچ زیر گروه کاری‌ای یافت نشد
                      </Typography>
                      <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                        زیر گروه کاری‌ای با این مشخصات در سیستم وجود ندارد
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* پیجینیشن */}
      {industries.length > 0 && totalPages > 0 && (
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

      {/* مودال‌ها */}
      <WarningModal
        open={warningModal}
        onClose={() => setWarningModal(false)}
        onConfirm={handleWarningConfirm}
        user={warningIndustry ? { id: String(warningIndustry.id), full_name: warningIndustry.name, user_type: 'IN', profile_picture: '' } : null}
        action="delete"
        currentUserId=""
      />
      <WarningModal
        open={warningCategoryModal}
        onClose={() => setWarningCategoryModal(false)}
        onConfirm={handleWarningConfirmCategory}
        user={warningCategory ? { id: String(warningCategory.id), full_name: warningCategory.name, user_type: 'CA', profile_picture: '' } : null}
        action="delete"
        currentUserId=""
      />

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth
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
          fontWeight: 'bold',
          color: ADMIN_THEME.primary,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          textAlign: 'right'
        }}>
          ویرایش زیر گروه کاری
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="نام زیر گروه کاری"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
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
              <InputLabel>گروه کاری</InputLabel>
              <Select
                value={editForm.category_id}
                onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}
                label="گروه کاری"
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
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
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
            fontSize: { xs: '0.9rem', sm: '1rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            '&:hover': {
              borderColor: ADMIN_THEME.dark,
              bgcolor: ADMIN_THEME.bgLight
            }
          }}>
            انصراف
          </Button>
          <Button onClick={handleEditIndustry} variant="contained" sx={{
            bgcolor: ADMIN_THEME.primary + ' !important',
            background: ADMIN_THEME.primary + ' !important',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            '&:hover': {
              bgcolor: ADMIN_THEME.dark + ' !important',
              background: ADMIN_THEME.dark + ' !important'
            }
          }}>
            ذخیره تغییرات
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndustriesManagement; 