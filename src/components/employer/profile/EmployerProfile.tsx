"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Paper,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { EMPLOYER_BLUE, EMPLOYER_THEME } from '../../../constants/colors';
import { apiGet, apiPost, apiPut } from '../../../lib/axios';

interface EmployerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  companySize: string;
  industry: string;
  website: string;
  address: string;
  description: string;
  logo: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employer-profile-tabpanel-${index}`}
      aria-labelledby={`employer-profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `employer-profile-tab-${index}`,
    'aria-controls': `employer-profile-tabpanel-${index}`,
  };
}

interface ProfileFormData {
  companyName: string;
  industry: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  logo?: File | null;
}

export default function EmployerProfile() {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [employerData, setEmployerData] = useState<EmployerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    address: '',
    description: '',
    logo: ''
  });
  const [formData, setFormData] = useState<ProfileFormData>({
    companyName: '',
    industry: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    logo: null,
  });
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setDataLoading(true);
      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await apiGet<ProfileFormData>(`${baseApiUrl}/companies/profile/`);
        setFormData(response.data);
        if (response.data.logo) {
          setLogoPreview(`${baseApiUrl}${response.data.logo}`);
        }
      } catch (error) {
        console.error('خطا در دریافت اطلاعات پروفایل:', error);
        // در صورت خطا، داده‌های نمونه نمایش داده می‌شود
        setFormData({
          companyName: 'شرکت نمونه',
          industry: 'فناوری اطلاعات',
          description: 'توضیحات شرکت',
          website: 'www.example.com',
          email: 'contact@example.com',
          phone: '۰۲۱-۱۲۳۴۵۶۷۸',
          address: 'تهران، خیابان ولیعصر',
          logo: null,
        });
      } finally {
        // تاخیر کوتاه برای جلوگیری از چشمک زدن رابط کاربری
        setTimeout(() => {
          setDataLoading(false);
          // کمی تاخیر بیشتر برای نمایش کامل صفحه
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }, 500);
      }
    };
    
    fetchProfile();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
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
      
      await apiPut(`${baseApiUrl}/companies/profile/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('اطلاعات پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('خطا در به‌روزرسانی پروفایل:', error);
      setError('خطا در به‌روزرسانی پروفایل. لطفاً دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      companyName: employerData.companyName,
      industry: employerData.industry,
      description: employerData.description,
      website: employerData.website,
      email: employerData.email,
      phone: employerData.phone,
      address: employerData.address,
      logo: null,
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight="bold" mb={4}>
          پروفایل کارفرما
        </Typography>

        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ py: 6, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton variant="circular" width={120} height={120} animation="wave" />
            <Skeleton variant="text" width={200} height={40} sx={{ mt: 2 }} animation="wave" />
            <Skeleton variant="text" width={150} height={24} sx={{ mt: 1 }} animation="wave" />
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={50} sx={{ mb: 2, borderRadius: 1 }} animation="wave" />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="rectangular" width="48%" height={60} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width="48%" height={60} sx={{ borderRadius: 1 }} animation="wave" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="rectangular" width="48%" height={60} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width="48%" height={60} sx={{ borderRadius: 1 }} animation="wave" />
            </Box>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1, mb: 2 }} animation="wave" />
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} animation="wave" />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        پروفایل کارفرما
      </Typography>

      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ 
          py: 6, 
          px: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'center', md: 'flex-start' },
          position: 'relative'
        }}>
          <Box position="relative" mb={{ xs: 3, md: 0 }} mr={{ md: 4 }}>
            <Avatar
              src={logoPreview || '/path/to/placeholder.jpg'}
              alt={formData.companyName}
              sx={{
                width: { xs: 120, md: 150 },
                height: { xs: 120, md: 150 },
                border: '4px solid #fff',
                boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)',
              }}
            />
            {editMode && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: EMPLOYER_BLUE,
                  color: 'white',
                  '&:hover': {
                    bgcolor: EMPLOYER_THEME.dark,
                  },
                }}
                size="small"
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Box flex={1} textAlign={{ xs: 'center', md: 'right' }}>
            <Typography variant="h4" fontWeight="bold">
              {employerData.companyName}
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              {employerData.industry}
            </Typography>
            <Typography variant="body2" mt={0.5}>
              {employerData.website}
            </Typography>
            <Typography variant="body2" mt={0.5}>
              {employerData.address}
            </Typography>
            <Box 
              mt={2}
              display="flex"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <Chip 
                label={`تعداد کارکنان: ${employerData.companySize}`} 
                size="small"
                sx={{ bgcolor: EMPLOYER_THEME.bgVeryLight, color: EMPLOYER_BLUE }}
              />
            </Box>
          </Box>

          {!editMode && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              sx={{ 
                position: { xs: 'relative', md: 'absolute' },
                top: { md: 16 },
                left: { md: 16 },
                mt: { xs: 3, md: 0 },
                color: EMPLOYER_BLUE,
                borderColor: EMPLOYER_BLUE,
                '&:hover': {
                  borderColor: EMPLOYER_THEME.dark,
                  bgcolor: 'rgba(65, 135, 255, 0.05)'
                }
              }}
            >
              ویرایش پروفایل
            </Button>
          )}
        </Box>

        <Divider />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="employer profile tabs"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 'medium',
                mx: 1
              },
              '& .Mui-selected': {
                color: EMPLOYER_BLUE,
                fontWeight: 'bold'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: EMPLOYER_BLUE
              }
            }}
          >
            <Tab label="اطلاعات شرکت" {...a11yProps(0)} />
            <Tab label="اطلاعات تماس" {...a11yProps(1)} />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {editMode ? (
            <form onSubmit={handleSubmit}>
              {/* تب اطلاعات شرکت */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="نام شرکت"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="صنعت/زمینه فعالیت"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      required
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
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="وب‌سایت"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="مثال: https://example.com"
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* تب اطلاعات تماس */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="ایمیل"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="تلفن تماس"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="آدرس"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  startIcon={<CloseIcon />}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                  sx={{ 
                    bgcolor: EMPLOYER_BLUE,
                    '&:hover': { bgcolor: EMPLOYER_THEME.dark }
                  }}
                >
                  {saving ? <CircularProgress size={24} color="inherit" /> : 'ذخیره تغییرات'}
                </Button>
              </Box>
            </form>
          ) : (
            <>
              {/* نمایش اطلاعات بدون ویرایش */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
                      درباره شرکت
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {employerData.description}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box mt={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        صنعت/زمینه فعالیت
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {employerData.industry}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box mt={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        وب‌سایت
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {employerData.website}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        ایمیل
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {employerData.email}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box mt={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        تلفن تماس
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {employerData.phone}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box mt={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        آدرس
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {employerData.address}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>
            </>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
} 