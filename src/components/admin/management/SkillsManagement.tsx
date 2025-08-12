'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Skeleton, Divider, IconButton, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import WarningModal from '../components/WarningModal';

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

interface Skill {
  id: number;
  name: string;
  icon?: string;
  industry: Industry;
}

const SkillsManagement: React.FC = () => {
  // State
  const [categories, setCategories] = useState<IndustryCategory[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Forms
  const [newSkill, setNewSkill] = useState({ name: '', category_id: '', industry_id: '' });
  
  // Edit state
  const [editSkillId, setEditSkillId] = useState<number | null>(null);
  const [editSkillName, setEditSkillName] = useState('');
  
  // Search and filter state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // WarningModal state
  const [warningModal, setWarningModal] = useState(false);
  const [warningSkill, setWarningSkill] = useState<Skill | null>(null);

  // Edit Dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [editForm, setEditForm] = useState({ name: '', industry_id: '' });

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

  // Fetch industries
  const fetchIndustries = useCallback(async () => {
    try {
      const res = await apiGet('/industries/industries/');
      const data: any = res.data;
      setIndustries(Array.isArray(data) ? data : data.results || []);
    } catch {
      setIndustries([]);
    }
  }, []);

  // Fetch skills
  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/industries/skills/');
      const data: any = res.data;
      let filtered = Array.isArray(data) ? data : [];
      
      // Filter by industry
      if (filterIndustry) {
        filtered = filtered.filter((item: any) => String(item.industry?.id) === String(filterIndustry));
      }
      
      // Filter by category
      if (filterCategory) {
        filtered = filtered.filter((item: any) => String(item.industry?.category?.id) === String(filterCategory));
      }
      
      // Search by skill name or industry name
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.name.toLowerCase().includes(q) ||
          (item.industry?.name && item.industry.name.toLowerCase().includes(q)) ||
          (item.industry?.category?.name && item.industry.category.name.toLowerCase().includes(q))
        );
      }
      
      const newTotalPages = Math.ceil(filtered.length / pageSize);
      const validPage = page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      const startIndex = (validPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      setSkills(filtered.slice(startIndex, endIndex));
      setTotalPages(newTotalPages);
      if (validPage !== page) setPage(validPage);
    } catch {
      setSkills([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, filterIndustry, filterCategory]);

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchIndustries();
  }, [fetchCategories, fetchIndustries]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Add new skill
  const handleAddSkill = async () => {
    if (!newSkill.name.trim() || !newSkill.category_id || !newSkill.industry_id) {
      toast.error('لطفاً نام مهارت، گروه کاری و زیر گروه کاری را وارد کنید');
      return;
    }

    try {
      await apiPost('/industries/skills/', {
        name: newSkill.name.trim(),
        industry_id: Number(newSkill.industry_id)
      });
      
      toast.success('مهارت با موفقیت اضافه شد');
      setNewSkill({ name: '', category_id: '', industry_id: '' });
      fetchSkills();
    } catch {
      toast.error('خطا در افزودن مهارت');
    }
  };

  // Delete skill
  const openWarningModal = (skill: Skill) => {
    setWarningSkill(skill);
    setWarningModal(true);
  };

  const handleWarningConfirm = async () => {
    if (!warningSkill) return;
    
    try {
      await apiDelete(`/industries/skills/${warningSkill.id}/`);
      toast.success('مهارت با موفقیت حذف شد');
      fetchSkills();
    } catch {
      toast.error('خطا در حذف مهارت');
    }
    setWarningModal(false);
    setWarningSkill(null);
  };

  // Edit skill inline
  const handleEditSkill = async (skillId: number) => {
    if (!editSkillName.trim()) {
      toast.error('لطفاً نام مهارت را وارد کنید');
      return;
    }

    try {
      await apiPut(`/industries/skills/${skillId}/`, {
        name: editSkillName.trim()
      });
      
      toast.success('مهارت با موفقیت ویرایش شد');
      setEditSkillId(null);
      setEditSkillName('');
      fetchSkills();
    } catch {
      toast.error('خطا در ویرایش مهارت');
    }
  };

  // Edit Dialog functions
  const openEditDialog = (skill: Skill) => {
    setEditSkill(skill);
    setEditForm({ 
      name: skill.name, 
      industry_id: skill.industry?.id ? String(skill.industry.id) : '' 
    });
    setEditDialog(true);
  };

  const handleEditSkillDialog = async () => {
    if (!editSkill) return;
    
    try {
      await apiPut(`/industries/skills/${editSkill.id}/`, {
        name: editForm.name,
        industry_id: Number(editForm.industry_id)
      });
      
      toast.success('مهارت با موفقیت ویرایش شد');
      setEditDialog(false);
      setEditSkill(null);
      fetchSkills();
    } catch {
      toast.error('خطا در ویرایش مهارت');
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => { 
    setPageSize(newSize); 
    setPage(1); 
  };

  // Search handlers
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleFilterIndustry = (e: any) => {
    setFilterIndustry(e.target.value);
    setPage(1);
  };

  const handleFilterCategory = (e: any) => {
    setFilterCategory(e.target.value);
    setPage(1);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* بخش افزودن مهارت جدید */}
      <Paper sx={{
        background: 'white',
        borderRadius: '12px',
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 },
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${ADMIN_THEME.bgLight}`
      }}>
        <Typography fontWeight={600} sx={{ mb: { xs: 2, sm: 1 }, fontSize: { xs: '1.1rem', sm: '1.1rem' }, color: ADMIN_THEME.dark }}>
          افزودن مهارت جدید
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { sm: 'center' }
        }}>
          <TextField
            label="نام مهارت"
            value={newSkill.name}
            onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
            fullWidth={true}
            size="small"
            sx={{
              fontSize: { xs: '1rem', sm: '0.95rem' },
              mb: { xs: 1, sm: 0 },
              flex: { xs: 'unset', sm: 1 },
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
              value={newSkill.category_id}
              label="گروه کاری"
              onChange={e => setNewSkill({ ...newSkill, category_id: e.target.value, industry_id: '' })}
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
              <MenuItem value="">انتخاب گروه کاری</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: { xs: 120, sm: 140 }, flex: 1, mb: { xs: 1, sm: 0 } }} size="small">
            <InputLabel>زیر گروه کاری</InputLabel>
            <Select
              value={newSkill.industry_id}
              label="زیر گروه کاری"
              disabled={!newSkill.category_id}
              onChange={e => setNewSkill({ ...newSkill, industry_id: e.target.value })}
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
              <MenuItem value="">انتخاب زیر گروه کاری</MenuItem>
              {industries
                .filter(industry => !newSkill.category_id || industry.category.id === Number(newSkill.category_id))
                .map(industry => (
                  <MenuItem key={industry.id} value={industry.id}>
                    {industry.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={handleAddSkill}
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
            افزودن مهارت
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
            placeholder="جستجو در نام مهارت، زیر گروه کاری یا گروه کاری..."
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
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, maxWidth: { xs: '100%', sm: 200 }, mb: { xs: 1, sm: 0 } }}>
            <InputLabel>زیر گروه کاری</InputLabel>
            <Select value={filterIndustry} onChange={handleFilterIndustry} label="زیر گروه کاری" sx={{ borderRadius: 2, fontSize: { xs: '1rem', sm: '0.95rem' } }} fullWidth>
              <MenuItem value="">همه زیر گروه‌های کاری</MenuItem>
              {industries.map(industry => (
                <MenuItem key={industry.id} value={industry.id}>
                  {industry.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={() => {
              setSearchInput('');
              setSearchQuery('');
              setFilterIndustry('');
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

      {/* جدول مهارت‌ها */}
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
                 <TableCell>نام مهارت</TableCell>
                 <TableCell>زیر گروه کاری</TableCell>
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
                     <TableCell colSpan={4}>
                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                         {[1, 2, 3].map((item) => (
                           <Box key={item} sx={{ p: 2, border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 2 }}>
                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                               <Skeleton variant="text" width="60%" height={20} />
                               <Skeleton variant="text" width="40%" height={16} />
                               <Skeleton variant="text" width="50%" height={16} />
                               <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                 <Skeleton variant="circular" width={32} height={32} />
                                 <Skeleton variant="circular" width={32} height={32} />
                               </Box>
                             </Box>
                           </Box>
                         ))}
                       </Box>
                     </TableCell>
                   </TableRow>
                 ) : (
                   // نمایش دسکتاپ - جدول اسکلتون
                   Array.from({ length: 5 }).map((_, index) => (
                     <TableRow key={index}>
                       <TableCell><Skeleton width="80%" height={20} /></TableCell>
                       <TableCell><Skeleton width="70%" height={20} /></TableCell>
                       <TableCell><Skeleton width="60%" height={20} /></TableCell>
                       <TableCell><Skeleton width="60%" height={20} /></TableCell>
                     </TableRow>
                   ))
                 )
               ) : skills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {searchQuery || filterIndustry || filterCategory ? 'نتیجه‌ای یافت نشد' : 'هنوز مهارتی اضافه نشده است'}
                    </Typography>
                  </TableCell>
                </TableRow>
                             ) : (
                                   isMobile ? (
                    // نمایش موبایل - کارت‌های مهارت
                    skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell colSpan={4}>
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
                              {/* نام مهارت */}
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
                                  {skill.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => openEditDialog(skill)}
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
                                    onClick={() => openWarningModal(skill)}
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
                              
                              {/* اطلاعات مهارت */}
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                                    زیر گروه کاری:
                                  </Typography>
                                  <Typography sx={{ 
                                    fontSize: '0.9rem', 
                                    color: ADMIN_THEME.dark 
                                  }}>
                                    {skill.industry?.name || 'نامشخص'}
                                  </Typography>
                                </Box>
                                
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
                                    label={skill.industry?.category?.name || 'نامشخص'}
                                    size="small"
                                    sx={{
                                      bgcolor: ADMIN_THEME.primary,
                                      color: 'white',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      height: '24px'
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </Paper>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                   // نمایش دسکتاپ - جدول مهارت‌ها
                   skills.map((skill) => (
                     <TableRow key={skill.id} sx={{ '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight } }}>
                       <TableCell>
                         {editSkillId === skill.id ? (
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <TextField
                               size="small"
                               value={editSkillName}
                               onChange={e => setEditSkillName(e.target.value)}
                               sx={{
                                 minWidth: 120,
                                 '& .MuiOutlinedInput-root': {
                                   borderRadius: 2,
                                   fontSize: '0.85rem',
                                   height: 32
                                 }
                               }}
                               inputProps={{ style: { fontSize: '0.85rem', padding: '4px 8px' } }}
                             />
                             <Button
                               size="small"
                               onClick={() => handleEditSkill(skill.id)}
                               variant="outlined"
                               sx={{
                                 borderColor: ADMIN_THEME.dark,
                                 color: ADMIN_THEME.dark,
                                 bgcolor: 'white',
                                 fontSize: '0.85rem',
                                 px: 1.2,
                                 py: 0.2,
                                 minWidth: 0,
                                 '&:hover': { bgcolor: ADMIN_THEME.bgLight, borderColor: ADMIN_THEME.dark }
                               }}
                             >
                               ذخیره
                             </Button>
                             <Button
                               size="small"
                               onClick={() => { setEditSkillId(null); setEditSkillName(''); }}
                               sx={{ fontSize: '0.85rem', px: 1.2, py: 0.2, minWidth: 0 }}
                             >
                               انصراف
                             </Button>
                           </Box>
                         ) : (
                           <Typography sx={{ fontSize: '0.95rem', fontWeight: 500, color: ADMIN_THEME.dark }}>
                             {skill.name}
                           </Typography>
                         )}
                       </TableCell>
                       <TableCell>
                         <Typography sx={{ fontSize: '0.9rem', color: ADMIN_THEME.dark }}>
                           {skill.industry?.name || 'نامشخص'}
                         </Typography>
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={skill.industry?.category?.name || 'نامشخص'}
                           size="small"
                           sx={{
                             bgcolor: ADMIN_THEME.bgLight,
                             color: ADMIN_THEME.dark,
                             fontSize: '0.8rem',
                             fontWeight: 500
                           }}
                         />
                       </TableCell>
                       <TableCell>
                         <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                           <IconButton
                             size="small"
                             onClick={() => openEditDialog(skill)}
                             sx={{ color: ADMIN_THEME.primary }}
                           >
                             <Edit fontSize="small" />
                           </IconButton>
                           <IconButton
                             size="small"
                             color="error"
                             onClick={() => openWarningModal(skill)}
                           >
                             <Delete fontSize="small" />
                           </IconButton>
                         </Box>
                       </TableCell>
                     </TableRow>
                   ))
                 )
               )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {!loading && skills.length > 0 && (
          <Box sx={{ p: 2, borderTop: `1px solid ${ADMIN_THEME.bgLight}` }}>
                    <CustomPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          theme={ADMIN_THEME}
          showPageSizeSelector={true}
        />
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
             <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
         <DialogTitle sx={{ 
           color: ADMIN_THEME.primary, 
           fontWeight: 'bold',
           borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
           pb: 2
         }}>
           ویرایش مهارت
         </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="نام مهارت"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>صنعت</InputLabel>
              <Select
                value={editForm.industry_id}
                label="صنعت"
                onChange={e => setEditForm({ ...editForm, industry_id: e.target.value })}
              >
                {industries.map(industry => (
                  <MenuItem key={industry.id} value={industry.id}>
                    {industry.name} - {industry.category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
                 <DialogActions sx={{ p: 2 }}>
           <Button 
             onClick={() => setEditDialog(false)}
             sx={{ 
               color: ADMIN_THEME.dark,
               borderColor: ADMIN_THEME.bgLight,
               '&:hover': { 
                 borderColor: ADMIN_THEME.dark,
                 bgcolor: ADMIN_THEME.bgVeryLight 
               }
             }}
             variant="outlined"
           >
             انصراف
           </Button>
           <Button 
             onClick={handleEditSkillDialog} 
             sx={{ 
               bgcolor: ADMIN_THEME.primary,
               color: 'white',
               '&:hover': { 
                 bgcolor: ADMIN_THEME.dark 
               },
               '&.MuiButton-contained': {
                 bgcolor: ADMIN_THEME.primary,
                 '&:hover': { 
                   bgcolor: ADMIN_THEME.dark 
                 }
               }
             }}
           >
             ذخیره تغییرات
           </Button>
         </DialogActions>
      </Dialog>

      {/* Warning Modal */}
      <WarningModal
        open={warningModal}
        onClose={() => setWarningModal(false)}
        onConfirm={handleWarningConfirm}
        user={{
          id: String(warningSkill?.id || ''),
          full_name: warningSkill?.name || '',
          user_type: 'SKILL'
        }}
        action="delete"
        currentUserId=""
      />
    </Box>
  );
};

export default SkillsManagement;
