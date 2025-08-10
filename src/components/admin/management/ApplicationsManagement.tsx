'use client';

import React, { useState, useEffect } from 'react';
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
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton
} from '@mui/material';
import {
  Visibility,
  Search,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { apiGet } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { ADMIN_THEME } from '@/constants/colors';
import TableSkeleton from '../components/TableSkeleton';
// Constants for application choices
const APPLICATION_STATUS_CHOICES = {
  'PE': 'در انتظار',
  'IR': 'در حال بررسی',
  'AC': 'پذیرفته شده',
  'RE': 'رد شده'
} as const;

interface JobApplication {
  id: string;
  job_seeker: {
    id: string;
    full_name: string;
    phone: string;
  };
  advertisement: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  cover_letter: string;
  status: 'PE' | 'IR' | 'AC' | 'RE';
  employer_notes?: string;
  viewed_by_employer: boolean;
  created_at: string;
  updated_at: string;
}

const ApplicationsManagement: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [page, searchQuery, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = `/ads/applications/?page=${page}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await apiGet(url);
      const data = response.data as any;
      
      if (data?.results) {
        setApplications(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } else if (Array.isArray(data)) {
        setApplications(data);
        setTotalPages(Math.ceil(data.length / 10));
      } else {
        setApplications([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('خطا در دریافت درخواست‌ها:', error);
      toast.error('خطا در دریافت درخواست‌ها');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    return APPLICATION_STATUS_CHOICES[status as keyof typeof APPLICATION_STATUS_CHOICES] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PE': 'warning',
      'IR': 'info',
      'AC': 'success',
      'RE': 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const openViewDialog = (application: JobApplication) => {
    setSelectedApplication(application);
    setViewDialog(true);
  };

  const handleSearch = () => {
    setPage(1);
    fetchApplications();
  };

  const tableHeaders = [
    'متقاضی',
    'عنوان شغل', 
    'شرکت',
    'وضعیت',
    'مشاهده شده',
    'تاریخ درخواست',
    'عملیات'
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          مدیریت درخواست‌های کاری
        </Typography>
        <Box display="flex" gap={1}>
          <Chip 
            label={`در انتظار: ${applications.filter(app => app.status === 'PE').length}`}
            color="warning"
            variant="outlined"
          />
          <Chip 
            label={`در بررسی: ${applications.filter(app => app.status === 'IR').length}`}
            color="info"
            variant="outlined"
          />
          <Chip 
            label={`پذیرفته: ${applications.filter(app => app.status === 'AC').length}`}
            color="success"
            variant="outlined"
          />
          <Chip 
            label={`رد شده: ${applications.filter(app => app.status === 'RE').length}`}
            color="error"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="جستجو بر اساس نام متقاضی یا عنوان شغل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>وضعیت</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="وضعیت"
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value="PE">در انتظار</MenuItem>
              <MenuItem value="IR">در حال بررسی</MenuItem>
              <MenuItem value="AC">پذیرفته شده</MenuItem>
              <MenuItem value="RE">رد شده</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch}>
            جستجو
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <TableSkeleton headers={tableHeaders} rows={8} />
      ) : applications.length === 0 ? (
        <Alert severity="info">
          هیچ درخواست کاری یافت نشد
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>متقاضی</TableCell>
                  <TableCell>عنوان شغل</TableCell>
                  <TableCell>شرکت</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>مشاهده شده</TableCell>
                  <TableCell>تاریخ درخواست</TableCell>
                  <TableCell>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {application.job_seeker.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {application.job_seeker.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {application.advertisement.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.advertisement.company.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={application.viewed_by_employer ? 'مشاهده شده' : 'مشاهده نشده'}
                        color={application.viewed_by_employer ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(application.created_at).toLocaleDateString('fa-IR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => openViewDialog(application)}
                        color="info"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination 
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* View Application Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            جزئیات درخواست کاری
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 2 }}>
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                <Chip 
                  label={getStatusLabel(selectedApplication.status)}
                  color={getStatusColor(selectedApplication.status) as any}
                />
                <Chip 
                  label={selectedApplication.viewed_by_employer ? 'مشاهده شده' : 'مشاهده نشده'}
                  color={selectedApplication.viewed_by_employer ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Typography variant="body1">
                  <strong>متقاضی:</strong> {selectedApplication.job_seeker.full_name}
                </Typography>
                <Typography variant="body1">
                  <strong>تلفن:</strong> {selectedApplication.job_seeker.phone}
                </Typography>
                <Typography variant="body1">
                  <strong>عنوان شغل:</strong> {selectedApplication.advertisement.title}
                </Typography>
                <Typography variant="body1">
                  <strong>شرکت:</strong> {selectedApplication.advertisement.company.name}
                </Typography>
                <Typography variant="body1">
                  <strong>تاریخ درخواست:</strong> {new Date(selectedApplication.created_at).toLocaleDateString('fa-IR')}
                </Typography>
                <Typography variant="body1">
                  <strong>آخرین به‌روزرسانی:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString('fa-IR')}
                </Typography>
              </Box>

              {selectedApplication.cover_letter && (
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    نامه انگیزه:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    bgcolor: 'grey.50', 
                    p: 2, 
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedApplication.cover_letter}
                  </Typography>
                </Box>
              )}

              {selectedApplication.employer_notes && (
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    یادداشت کارفرما:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    bgcolor: 'warning.light', 
                    p: 2, 
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedApplication.employer_notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationsManagement;