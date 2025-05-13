"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  TablePagination,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { EMPLOYER_BLUE, EMPLOYER_THEME } from '../../../constants/colors';
import { apiGet, apiPost, apiDelete, apiPut } from '../../../lib/axios';

interface Job {
  id: number;
  advertisement: {
    title: string;
    slug: string;
    status: string;
    created_at: string;
    location: {
      name: string;
    };
    industry: {
      name: string;
    };
  };
  job_type: string;
  description_position: string;
  company: {
    name: string;
    logo: string;
  };
}

interface JobFormData {
  title: string;
  industry_slug: string;
  location_slug: string;
  job_type: string;
  description_position: string;
  company_slug: string; 
  degree: string;
  gender: string;
  soldier_status: string;
  salary: string;
}

export default function EmployerJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    industry_slug: '',
    location_slug: '',
    job_type: 'full-time',
    description_position: '',
    company_slug: '',
    degree: '',
    gender: '',
    soldier_status: '',
    salary: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [companies, setCompanies] = useState<{id: number, name: string, slug: string}[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // استفاده از آدرس API از .env
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await apiGet<Job[]>(`${baseApiUrl}/job/`);
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('خطا در دریافت آگهی‌ها:', error);
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await apiGet<{id: number, name: string, slug: string}[]>(`${baseApiUrl}/companies/`);
      setCompanies(response.data);
    } catch (error) {
      console.error('خطا در دریافت لیست شرکت‌ها:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (mode: 'add' | 'edit', job?: Job) => {
    setDialogMode(mode);
    if (mode === 'edit' && job) {
      setCurrentJob(job);
      setFormData({
        title: job.advertisement.title,
        industry_slug: job.advertisement.industry.name,
        location_slug: job.advertisement.location.name,
        job_type: job.job_type as 'full-time' | 'part-time' | 'remote' | 'contract',
        description_position: '',
        company_slug: job.company.name,
        degree: '',
        gender: '',
        soldier_status: '',
        salary: ''
      });
    } else {
      setCurrentJob(null);
      setFormData({
        title: '',
        industry_slug: '',
        location_slug: '',
        job_type: 'full-time',
        description_position: '',
        company_slug: '',
        degree: '',
        gender: '',
        soldier_status: '',
        salary: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteConfirm = (jobId: number) => {
    setJobToDelete(jobId);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setJobToDelete(null);
  };

  const handleDeleteJob = async () => {
    if (jobToDelete) {
      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // یافتن آگهی مورد نظر
        const jobToDeleteObj = jobs.find(job => job.id === jobToDelete);
        if (jobToDeleteObj) {
          // ایجاد slug برای آدرس API
          const slug = jobToDeleteObj.advertisement.title.toLowerCase().replace(/ /g, '-');
          // ارسال درخواست حذف به آدرس /job/{id}/{slug}/
          await apiDelete(`${baseApiUrl}/job/${jobToDelete}/${slug}/`);
          
          // حذف از لیست محلی
          setJobs(jobs.filter(job => job.id !== jobToDelete));
        }
        handleCloseDeleteConfirm();
      } catch (error) {
        console.error('خطا در حذف آگهی:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      if (dialogMode === 'add') {
        // ساختار داده برای ارسال به API
        const jobData = {
          advertisement: {
            title: formData.title,
            industry_slug: formData.industry_slug,
            location_slug: formData.location_slug,
            degree: formData.degree, 
            gender: formData.gender,
            soldier_status: formData.soldier_status,
            salary: formData.salary,
            description: formData.description_position
          },
          company_slug: formData.company_slug,
          job_type: formData.job_type,
          description_position: formData.description_position
        };
        
        // ارسال داده‌ها به آدرس /job/ برای ایجاد آگهی جدید با ساختار صحیح
        const response = await apiPost<Job>(`${baseApiUrl}/job/`, jobData);
        // اضافه کردن آگهی جدید به لیست محلی
        setJobs([...jobs, response.data]);
        
        handleCloseDialog();
        // نمایش پیام موفقیت
        setSnackbarState({
          open: true,
          message: 'آگهی جدید با موفقیت ایجاد شد',
          severity: 'success'
        });
      } else if (dialogMode === 'edit' && currentJob) {
        // ساختار داده برای به‌روزرسانی
        const jobData = {
          advertisement: {
            title: formData.title,
            industry_slug: formData.industry_slug,
            location_slug: formData.location_slug,
            degree: formData.degree,
            gender: formData.gender,
            soldier_status: formData.soldier_status,
            salary: formData.salary,
            description: formData.description_position
          },
          job_type: formData.job_type,
          description_position: formData.description_position
        };
        
        // ارسال داده‌ها به آدرس /job/{id}/ برای به‌روزرسانی آگهی
        const response = await apiPut<Job>(`${baseApiUrl}/job/${currentJob.id}/`, jobData);
        
        // به‌روزرسانی آگهی در لیست محلی
        const updatedJobs = jobs.map(job => {
          if (job.id === currentJob.id) {
            return response.data;
          }
          return job;
        });
        
        setJobs(updatedJobs);
        handleCloseDialog();
        // نمایش پیام موفقیت
        setSnackbarState({
          open: true,
          message: 'آگهی با موفقیت به‌روزرسانی شد',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('خطا در ارسال اطلاعات:', error);
      // نمایش پیام خطا
      setSnackbarState({
        open: true,
        message: 'خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.',
        severity: 'error'
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-Time': 
      case 'full-time': return '#4caf50';
      case 'Part-Time': 
      case 'part-time': return '#ff9800';
      case 'Remote': 
      case 'remote': return '#2196f3';
      case 'Internship': 
      case 'internship': 
      case 'contract': return '#9c27b0';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': 
      case 'active': return '#4caf50';
      case 'Rejected': 
      case 'inactive': return '#f44336';
      case 'Pending': 
      case 'draft': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Approved': return 'تایید شده';
      case 'Rejected': return 'رد شده';
      case 'Pending': return 'در انتظار';
      case 'active': return 'فعال';
      case 'inactive': return 'غیرفعال';
      case 'draft': return 'پیش‌نویس';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Full-Time': 
      case 'full-time': return 'تمام وقت';
      case 'Part-Time': 
      case 'part-time': return 'پاره وقت';
      case 'Remote': 
      case 'remote': return 'دورکاری';
      case 'Internship': 
      case 'internship': return 'کارآموزی';
      case 'contract': return 'قراردادی';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: EMPLOYER_BLUE }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="bold">
          مدیریت آگهی‌های شغلی
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
          افزودن آگهی جدید
        </Button>
      </Box>

      <Card sx={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(65, 135, 255, 0.05)' }}>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>عنوان آگهی</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>دسته‌بندی</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>محل</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>نوع همکاری</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>تاریخ ایجاد</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {job.advertisement.title}
                    </Box>
                  </TableCell>
                  <TableCell>{job.advertisement.industry.name}</TableCell>
                  <TableCell>{job.advertisement.location.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeText(job.job_type)}
                      size="small"
                      sx={{
                        backgroundColor: getTypeColor(job.job_type),
                        color: '#fff'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(job.advertisement.status)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(job.advertisement.status),
                        color: '#fff'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('fa-IR').format(new Date(job.advertisement.created_at))}
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Tooltip title="مشاهده">
                        <IconButton size="small" onClick={() => handleOpenDialog('edit', job)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(job.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={jobs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="تعداد در صفحه:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count !== -1 ? count : `بیش از ${to}`}`}
        />
      </Card>

      {/* دیالوگ افزودن/ویرایش آگهی */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>
          {dialogMode === 'add' ? 'افزودن آگهی جدید' : 'ویرایش آگهی'}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="عنوان آگهی"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="دسته‌بندی"
                  name="industry_slug"
                  value={formData.industry_slug}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="محل کار"
                  name="location_slug"
                  value={formData.location_slug}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>شرکت</InputLabel>
                  <Select
                    name="company_slug"
                    value={formData.company_slug}
                    label="شرکت"
                    onChange={handleInputChange}
                  >
                    {companies.length === 0 ? (
                      <MenuItem value="" disabled>هیچ شرکتی یافت نشد</MenuItem>
                    ) : (
                      companies.map((company) => (
                        <MenuItem key={company.id} value={company.slug}>
                          {company.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>نوع همکاری</InputLabel>
                  <Select
                    name="job_type"
                    value={formData.job_type}
                    label="نوع همکاری"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="full-time">تمام وقت</MenuItem>
                    <MenuItem value="part-time">پاره وقت</MenuItem>
                    <MenuItem value="remote">دورکاری</MenuItem>
                    <MenuItem value="contract">قراردادی</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="شرح شغل"
                  name="description_position"
                  value={formData.description_position}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>حداقل مدرک تحصیلی</InputLabel>
                  <Select
                    name="degree"
                    value={formData.degree}
                    label="حداقل مدرک تحصیلی"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Below Diploma">زیر دیپلم</MenuItem>
                    <MenuItem value="Diploma">دیپلم</MenuItem>
                    <MenuItem value="Associate">فوق دیپلم</MenuItem>
                    <MenuItem value="Bachelor">لیسانس</MenuItem>
                    <MenuItem value="Master">فوق لیسانس</MenuItem>
                    <MenuItem value="Doctorate">دکترا</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>جنسیت</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    label="جنسیت"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Male">مرد</MenuItem>
                    <MenuItem value="Female">زن</MenuItem>
                    <MenuItem value="Not Specified">مهم نیست</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>وضعیت سربازی</InputLabel>
                  <Select
                    name="soldier_status"
                    value={formData.soldier_status}
                    label="وضعیت سربازی"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Completed">پایان خدمت</MenuItem>
                    <MenuItem value="Permanent Exemption">معافیت دائم</MenuItem>
                    <MenuItem value="Educational Exemption">معافیت تحصیلی</MenuItem>
                    <MenuItem value="Not Specified">مهم نیست</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>محدوده حقوق</InputLabel>
                  <Select
                    name="salary"
                    value={formData.salary}
                    label="محدوده حقوق"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="5 to 10">5 تا 10 میلیون تومان</MenuItem>
                    <MenuItem value="10 to 15">10 تا 15 میلیون تومان</MenuItem>
                    <MenuItem value="15 to 20">15 تا 20 میلیون تومان</MenuItem>
                    <MenuItem value="20 to 30">20 تا 30 میلیون تومان</MenuItem>
                    <MenuItem value="30 to 50">30 تا 50 میلیون تومان</MenuItem>
                    <MenuItem value="More than 50">بیش از 50 میلیون تومان</MenuItem>
                    <MenuItem value="Negotiable">توافقی</MenuItem>
                  </Select>
                </FormControl>
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
            {dialogMode === 'add' ? 'افزودن آگهی' : 'ذخیره تغییرات'}
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
            آیا از حذف این آگهی شغلی اطمینان دارید؟ این عمل غیرقابل بازگشت است.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>
            انصراف
          </Button>
          <Button 
            onClick={handleDeleteJob} 
            color="error"
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 