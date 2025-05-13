"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EMPLOYER_BLUE, EMPLOYER_THEME } from '../../../constants/colors';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../lib/axios';

interface Company {
  id: number;
  name: string;
  slug: string;
  industry: {
    name: string;
  };
  logo: string;
  description: string;
  created_at: string;
}

interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  email: string;
  phone_number: string;
  industry_slug: string;
  location_slug: string;
  logo?: File | null;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function EmployerCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    website: '',
    email: '',
    phone_number: '',
    industry_slug: '',
    location_slug: '',
    logo: null,
  });
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await apiGet<Company[]>(`${baseApiUrl}/companies/`);
      setCompanies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('خطا در دریافت شرکت‌ها:', error);
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (mode: 'add' | 'edit', company?: Company) => {
    setDialogMode(mode);
    if (mode === 'edit' && company) {
      setCurrentCompany(company);
      setFormData({
        name: company.name,
        description: company.description,
        website: '', // در صورت دریافت از API پر می‌شود
        email: '', // در صورت دریافت از API پر می‌شود
        phone_number: '', // در صورت دریافت از API پر می‌شود
        industry_slug: company.industry?.name || '',
        location_slug: '', // در صورت دریافت از API پر می‌شود
        logo: null,
      });
      if (company.logo) {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        setLogoPreview(`${baseApiUrl}${company.logo}`);
      } else {
        setLogoPreview('');
      }
    } else {
      setCurrentCompany(null);
      setFormData({
        name: '',
        description: '',
        website: '',
        email: '',
        phone_number: '',
        industry_slug: '',
        location_slug: '',
        logo: null,
      });
      setLogoPreview('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteConfirm = (companyId: number) => {
    setCompanyToDelete(companyId);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setCompanyToDelete(null);
  };

  const handleDeleteCompany = async () => {
    if (companyToDelete) {
      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const companyToDeleteObj = companies.find(company => company.id === companyToDelete);
        
        if (companyToDeleteObj) {
          await apiDelete(`${baseApiUrl}/companies/${companyToDeleteObj.slug}/`);
          setCompanies(companies.filter(company => company.id !== companyToDelete));
          
          setSnackbarState({
            open: true,
            message: 'شرکت با موفقیت حذف شد',
            severity: 'success'
          });
        }
        handleCloseDeleteConfirm();
      } catch (error) {
        console.error('خطا در حذف شرکت:', error);
        setSnackbarState({
          open: true,
          message: 'خطا در حذف شرکت. لطفاً دوباره تلاش کنید.',
          severity: 'error'
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        logo: file,
      });
      
      // نمایش پیش‌نمایش لوگو
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // ایجاد FormData برای ارسال فایل
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'logo' && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (key !== 'logo') {
          formDataToSend.append(key, value as string);
        }
      });
      
      if (dialogMode === 'add') {
        const response = await apiPost<Company>(`${baseApiUrl}/companies/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setCompanies([...companies, response.data]);
        handleCloseDialog();
        
        setSnackbarState({
          open: true,
          message: 'شرکت جدید با موفقیت ایجاد شد',
          severity: 'success'
        });
      } else if (dialogMode === 'edit' && currentCompany) {
        const response = await apiPut<Company>(
          `${baseApiUrl}/companies/${currentCompany.slug}/`, 
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        const updatedCompanies = companies.map(company => {
          if (company.id === currentCompany.id) {
            return response.data;
          }
          return company;
        });
        
        setCompanies(updatedCompanies);
        handleCloseDialog();
        
        setSnackbarState({
          open: true,
          message: 'شرکت با موفقیت به‌روزرسانی شد',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('خطا در ارسال اطلاعات:', error);
      setSnackbarState({
        open: true,
        message: 'خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState({ ...snackbarState, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="bold">
          مدیریت شرکت‌ها
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
          sx={{ 
            bgcolor: EMPLOYER_BLUE,
            '&:hover': { bgcolor: EMPLOYER_THEME.dark }
          }}
        >
          افزودن شرکت جدید
        </Button>
      </Box>

      <Card sx={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(65, 135, 255, 0.05)' }}>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>لوگو</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>نام شرکت</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>صنعت</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>تاریخ ثبت</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">هیچ شرکتی یافت نشد.</TableCell>
                </TableRow>
              ) : (
                companies
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <Avatar 
                          src={company.logo ? `${process.env.NEXT_PUBLIC_API_URL}${company.logo}` : undefined} 
                          alt={company.name}
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.industry?.name || 'نامشخص'}</TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat('fa-IR').format(new Date(company.created_at))}
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Tooltip title="ویرایش">
                            <IconButton size="small" onClick={() => handleOpenDialog('edit', company)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenDeleteConfirm(company.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={companies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="تعداد در صفحه:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count !== -1 ? count : `بیش از ${to}`}`}
        />
      </Card>

      {/* دیالوگ افزودن/ویرایش شرکت */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>
          {dialogMode === 'add' ? 'افزودن شرکت جدید' : 'ویرایش شرکت'}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="نام شرکت"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="صنعت"
                  name="industry_slug"
                  value={formData.industry_slug}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="وب‌سایت"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="ایمیل"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="شماره تماس"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="موقعیت"
                  name="location_slug"
                  value={formData.location_slug}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="توضیحات شرکت"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="درباره شرکت و فعالیت‌های آن توضیح دهید..."
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box mt={2} mb={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    لوگوی شرکت:
                  </Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{ 
                        color: EMPLOYER_BLUE,
                        borderColor: EMPLOYER_BLUE,
                        '&:hover': { borderColor: EMPLOYER_THEME.dark }
                      }}
                    >
                      انتخاب تصویر
                    </Button>
                  </label>
                </Box>
                {logoPreview && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <Avatar
                      src={logoPreview}
                      alt="پیش‌نمایش لوگو"
                      sx={{ width: 100, height: 100 }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ color: 'text.secondary' }}
          >
            انصراف
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ 
              bgcolor: EMPLOYER_BLUE,
              '&:hover': { bgcolor: EMPLOYER_THEME.dark }
            }}
          >
            {dialogMode === 'add' ? 'افزودن شرکت' : 'ذخیره تغییرات'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* دیالوگ تایید حذف */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>تایید حذف</DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف این شرکت اطمینان دارید؟ این عمل غیرقابل بازگشت است.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>
            انصراف
          </Button>
          <Button 
            onClick={handleDeleteCompany} 
            color="error"
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* اسنک‌بار برای نمایش پیام‌ها */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarState.severity}
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 