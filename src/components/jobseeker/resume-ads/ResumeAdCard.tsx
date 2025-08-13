'use client'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessIcon from '@mui/icons-material/Business';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import { useRouter } from 'next/navigation';
import { apiDelete } from '@/lib/axios';
import { useState } from 'react';

// تعریف تایپ آگهی رزومه
export type ResumeAdType = {
  id: string;
  title: string;
  status: 'P' | 'A' | 'R';
  location?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  industry?: {
    id: number;
    name: string;
  };
  salary?: string;
  job_type?: string;
  degree?: string;
  gender?: string;
  soldier_status?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

interface ResumeAdCardProps {
  resumeAd: ResumeAdType;
  onUpdate: () => void;
}

// تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
const convertToFarsiNumber = (num: string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

// تابع کمکی برای تبدیل وضعیت‌ها به متن فارسی
const getStatusText = (status?: string): string => {
  switch (status) {
    case 'P': return 'در انتظار بررسی';
    case 'A': return 'تایید شده';
    case 'R': return 'رد شده';
    default: return 'نامشخص';
  }
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'P': return '#FF9800';
    case 'A': return '#4CAF50';
    case 'R': return '#F44336';
    default: return '#9E9E9E';
  }
};

const getSalaryText = (salary?: string): string => {
  if (!salary) return 'توافقی';
  
  switch (salary) {
    case '5 to 10': return convertToFarsiNumber('5') + ' تا ' + convertToFarsiNumber('10') + ' میلیون تومان';
    case '10 to 15': return convertToFarsiNumber('10') + ' تا ' + convertToFarsiNumber('15') + ' میلیون تومان';
    case '15 to 20': return convertToFarsiNumber('15') + ' تا ' + convertToFarsiNumber('20') + ' میلیون تومان';
    case '20 to 30': return convertToFarsiNumber('20') + ' تا ' + convertToFarsiNumber('30') + ' میلیون تومان';
    case '30 to 50': return convertToFarsiNumber('30') + ' تا ' + convertToFarsiNumber('50') + ' میلیون تومان';
    case 'More than 50': return 'بیش از ' + convertToFarsiNumber('50') + ' میلیون تومان';
    case 'Negotiable':
    default: return 'توافقی';
  }
};

const getJobTypeText = (jobType?: string): string => {
  if (!jobType) return 'تمام وقت';
  
  switch (jobType) {
    case 'FT': return 'تمام وقت';
    case 'PT': return 'پاره وقت';
    case 'RE': return 'دورکاری';
    case 'IN': return 'کارآموزی';
    default: return jobType;
  }
};

// محاسبه زمان انتشار
const getTimePosted = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'کمتر از ۱ ساعت پیش';
  if (diffInHours < 24) return `${convertToFarsiNumber(diffInHours.toString())} ساعت پیش`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${convertToFarsiNumber(diffInDays.toString())} روز پیش`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${convertToFarsiNumber(diffInWeeks.toString())} هفته پیش`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${convertToFarsiNumber(diffInMonths.toString())} ماه پیش`;
};

// تابع کمکی برای تعیین اندازه فونت بر اساس طول عنوان
const getTitleFontSize = (title: string, isMobile: boolean, isTablet: boolean) => {
  const titleLength = title.length;
  
  if (isMobile) {
    if (titleLength <= 15) return '0.9rem';
    if (titleLength <= 25) return '0.85rem';
    return '0.8rem';
  }
  
  if (isTablet) {
    if (titleLength <= 20) return '0.95rem';
    if (titleLength <= 30) return '0.9rem';
    return '0.85rem';
  }
  
  // Desktop
  if (titleLength <= 25) return '1rem';
  if (titleLength <= 35) return '0.95rem';
  return '0.9rem';
};

export default function ResumeAdCard({ resumeAd, onUpdate }: ResumeAdCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    router.push(`/jobseeker/resume-ads/${resumeAd.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    router.push(`/jobseeker/resume-ads/${resumeAd.id}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await apiDelete(`/ads/resume/${resumeAd.id}/`);
      onUpdate();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('خطا در حذف آگهی رزومه:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          minHeight: { xs: '260px', sm: '280px', md: '300px' },
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          border: `1px solid #E0E0E0`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.25s ease-in-out',
          p: 0,
          width: '100%',
          mx: 'auto',
          direction: 'ltr',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          }
        }}
      >
        <CardContent sx={{ p: 0, pb: "0px !important", height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* هدر کارت با نمایش عنوان و برچسب وضعیت */}
          <Box
            sx={{
              p: 1,
              pb: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
              height: { xs: 36, sm: 40, md: 45 },
              px: { xs: 0.8, sm: 1, md: 1.2 },
            }}
          >
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 700,
                fontSize: getTitleFontSize(resumeAd.title, isMobile, isTablet),
                color: JOB_SEEKER_THEME.primary,
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textAlign: 'left',
                wordBreak: 'break-word',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flex: 1,
                mr: 1,
              }}
            >
              {resumeAd.title}
            </Typography>

            {/* منوی عملیات */}
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: JOB_SEEKER_THEME.primary + '10'
                }
              }}
            >
              <MoreVertIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>

          {/* بدنه کارت - اطلاعات شغلی */}
          <Box sx={{ px: { xs: 0.8, sm: 1, md: 1.2 }, py: { xs: 0.6, sm: 0.8, md: 1 }, flex: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Box sx={{ display: 'grid', gap: { xs: 0.8, sm: 1, md: 1.2 } }}>
              
              {/* محل کار و وضعیت بررسی */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}08`,
                      color: JOB_SEEKER_THEME.primary,
                      width: { xs: 24, sm: 28, md: 32 },
                      height: { xs: 24, sm: 28, md: 32 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 0.5,
                      mr: { xs: 0.8, sm: 1 },
                    }}
                  >
                    <LocationOnOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      textAlign: 'left',
                      flex: 1
                    }}
                  >
                    {resumeAd.location?.name || 'موقعیت نامشخص'}
                  </Typography>
                </Box>
                
                {/* نمایش برچسب وضعیت بررسی */}
                <Chip
                  label={getStatusText(resumeAd.status)}
                  size="small"
                  sx={{
                    backgroundColor: `${getStatusColor(resumeAd.status)}15`,
                    color: getStatusColor(resumeAd.status),
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    border: `1px solid ${getStatusColor(resumeAd.status)}30`,
                    ml: 1
                  }}
                />
              </Box>

              {/* زمان انتشار */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: `${JOB_SEEKER_THEME.primary}08`,
                    color: JOB_SEEKER_THEME.primary,
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 0.5,
                    mr: { xs: 0.8, sm: 1 },
                  }}
                >
                  <AccessTimeOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    textAlign: 'left'
                  }}
                >
                  {getTimePosted(resumeAd.created_at)}
                </Typography>
              </Box>

              {/* صنعت */}
              {resumeAd.industry && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: `${JOB_SEEKER_THEME.primary}08`,
                      color: JOB_SEEKER_THEME.primary,
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 0.5,
                      mr: { xs: 0.8, sm: 1 },
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      textAlign: 'left'
                    }}
                  >
                    {resumeAd.industry.name}
                  </Typography>
                </Box>
              )}

              {/* نوع کار */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: `${JOB_SEEKER_THEME.primary}08`,
                    color: JOB_SEEKER_THEME.primary,
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 0.5,
                    mr: { xs: 0.8, sm: 1 },
                  }}
                >
                  <WorkOutlineIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    textAlign: 'left'
                  }}
                >
                  {getJobTypeText(resumeAd.job_type)}
                </Typography>
              </Box>

              {/* حقوق */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: `${JOB_SEEKER_THEME.primary}08`,
                    color: JOB_SEEKER_THEME.primary,
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 0.5,
                    mr: { xs: 0.8, sm: 1 },
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: JOB_SEEKER_THEME.primary,
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    textAlign: 'right'
                  }}
                >
                  {getSalaryText(resumeAd.salary)}
                </Typography>
              </Box>
            </Box>

            {/* دکمه مشاهده جزئیات */}
            <Box sx={{ mt: { xs: 1.5, sm: 2 } }}>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                onClick={handleView}
                sx={{
                  py: { xs: 0.8, sm: 1 },
                  fontWeight: 'bold',
                  borderRadius: 1.5,
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  backgroundColor: JOB_SEEKER_THEME.primary,
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: JOB_SEEKER_THEME.dark,
                    boxShadow: `0 4px 8px ${JOB_SEEKER_THEME.primary}40`,
                  }
                }}
              >
                مشاهده جزئیات
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* منوی عملیات */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 160,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={handleView}>
          <VisibilityOutlinedIcon sx={{ mr: 1, fontSize: '1rem' }} />
          مشاهده جزئیات
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditOutlinedIcon sx={{ mr: 1, fontSize: '1rem' }} />
          ویرایش
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteOutlineIcon sx={{ mr: 1, fontSize: '1rem' }} />
          حذف
        </MenuItem>
      </Menu>

      {/* دیالوگ تایید حذف */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          حذف آگهی رزومه
        </DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف این آگهی رزومه اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            انصراف
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'در حال حذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}