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
  useMediaQuery,
  Avatar,
  Stack
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
import HistoryIcon from '@mui/icons-material/History';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { useRouter } from 'next/navigation';
import { apiDelete } from '@/lib/axios';
import { useState } from 'react';

// تعریف تایپ آگهی رزومه
export type ResumeAdType = {
  id: string;
  title: string;
  status: 'P' | 'A' | 'R';
  // اطلاعات شخصی کاربر
  user?: {
    full_name: string;
    profile_picture?: string;
  };
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
  // مهارت‌ها
  skills?: string[];
  // سابقه کاری (سال)
  experience_years?: number;
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

// تابع تبدیل اعداد انگلیسی به فارسی (مثل ExpertCard)
const convertToPersianNumber = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (match) => persianDigits[parseInt(match)]);
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
    case '5 to 10': return convertToPersianNumber(5) + ' تا ' + convertToPersianNumber(10) + ' میلیون تومان';
    case '10 to 15': return convertToPersianNumber(10) + ' تا ' + convertToPersianNumber(15) + ' میلیون تومان';
    case '15 to 20': return convertToPersianNumber(15) + ' تا ' + convertToPersianNumber(20) + ' میلیون تومان';
    case '20 to 30': return convertToPersianNumber(20) + ' تا ' + convertToPersianNumber(30) + ' میلیون تومان';
    case '30 to 50': return convertToPersianNumber(30) + ' تا ' + convertToPersianNumber(50) + ' میلیون تومان';
    case 'More than 50': return 'بیش از ' + convertToPersianNumber(50) + ' میلیون تومان';
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
  if (diffInHours < 24) return `${convertToPersianNumber(diffInHours)} ساعت پیش`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${convertToPersianNumber(diffInDays)} روز پیش`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${convertToPersianNumber(diffInWeeks)} هفته پیش`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${convertToPersianNumber(diffInMonths)} ماه پیش`;
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
  const jobSeekerColors = useJobSeekerTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // نمایش فقط 3 مهارت اول
  const topSkills = resumeAd.skills?.slice(0, 3) || [];

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
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 1.5, sm: 2 },
          border: `1px solid ${jobSeekerColors.bgLight}`,
          boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          width: { xs: '100%', sm: '100%', md: '100%' },
          mx: 'auto',
          height: '100%', // مثل ExpertCard
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
          }
        }}
      >
        <CardContent sx={{
          p: { xs: 1.5, sm: 2 },
          pb: { xs: "6px !important", sm: "8px !important" },
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          {/* هدر کارت - آواتار و نام */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 1, sm: 1.5 },
            minHeight: { xs: 40, sm: 45, md: 50 },
            py: { xs: 0.5, sm: 0.8 },
            pb: 0
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Box sx={{ position: 'relative', mr: { xs: 1, sm: 1.5 } }}>
                <Avatar
                  src={resumeAd.user?.profile_picture}
                  alt={resumeAd.user?.full_name || 'کاربر'}
                  sx={{
                    width: { xs: 45, sm: 55 },
                    height: { xs: 45, sm: 55 },
                    border: 'none',
                  }}
                >
                  {resumeAd.user?.full_name?.charAt(0) || 'ک'}
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  mb: { xs: 0.3, sm: 0.4 },
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {resumeAd.user?.full_name || 'کاربر ماهرکار'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  lineHeight: 1.3,
                  mt: { xs: 0.1, sm: 0.2 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {resumeAd.title}
                </Typography>
              </Box>
            </Box>

            {/* منوی عملیات */}
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                color: 'text.secondary',
                ml: 1,
                '&:hover': {
                  backgroundColor: jobSeekerColors.primary + '10'
                }
              }}
            >
              <MoreVertIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>

          {/* خط سرتاسری زیر هدر */}
          <Box sx={{
            position: 'relative',
            mt: { xs: 0.2, sm: 0.4 },
            mb: { xs: 0.8, sm: 1 },
            mx: { xs: -1.5, sm: -2 },
            height: 1
          }}>
            <Box sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '1px',
              bgcolor: jobSeekerColors.bgLight
            }} />
          </Box>

          {/* اطلاعات اصلی */}
          <Box sx={{
            mb: { xs: 0.8, sm: 1 },
            p: 0,
            pb: { xs: 0.8, sm: 1 },
            bgcolor: theme.palette.background.paper,
            border: 'none',
            borderRadius: 1.5,
            fontSize: { xs: '0.75rem', sm: '0.8rem' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.5 } }}>
              <Box sx={{
                width: { xs: 22, sm: 24 },
                height: { xs: 22, sm: 24 },
                borderRadius: '50%',
                backgroundColor: `rgba(0, 112, 60, 0.1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0
              }}>
                <LocationOnOutlinedIcon fontSize="small" sx={{
                  color: jobSeekerColors.primary,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                mr: 0,
                ml: { xs: 1.2, sm: 1.5 }
              }}>
                {resumeAd.location?.name || 'موقعیت نامشخص'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.4, sm: 0.5 } }}>
              <Box sx={{
                width: { xs: 22, sm: 24 },
                height: { xs: 22, sm: 24 },
                borderRadius: '50%',
                backgroundColor: `rgba(0, 112, 60, 0.1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0
              }}>
                <WorkOutlineIcon fontSize="small" sx={{
                  color: jobSeekerColors.primary,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                mr: 0,
                ml: { xs: 1.2, sm: 1.5 }
              }}>
                {getJobTypeText(resumeAd.job_type)}
              </Typography>
            </Box>

            {resumeAd.experience_years && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: { xs: 22, sm: 24 },
                  height: { xs: 22, sm: 24 },
                  borderRadius: '50%',
                  backgroundColor: `rgba(0, 112, 60, 0.1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 0
                }}>
                  <HistoryIcon fontSize="small" sx={{
                    color: jobSeekerColors.primary,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  mr: 0,
                  ml: { xs: 1.2, sm: 1.5 }
                }}>
                  {convertToPersianNumber(resumeAd.experience_years)} سال سابقه
                </Typography>
              </Box>
            )}
          </Box>

          {/* مهارت‌ها */}
          {topSkills.length > 0 && (
            <Box sx={{ mb: { xs: 0.8, sm: 1.2 } }}>
              <Typography variant="body2" sx={{
                mb: { xs: 0.2, sm: 0.3 },
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.8rem', sm: '0.85rem' }
              }}>
                مهارت‌های کلیدی:
              </Typography>
              <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.2}>
                {topSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: `rgba(0, 112, 60, 0.08)`,
                      border: 'none',
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      borderRadius: 1,
                      color: jobSeekerColors.primary,
                      py: 0,
                      px: 0,
                      m: 0.1,
                      height: { xs: '16px', sm: '18px' },
                      '& .MuiChip-label': {
                        px: { xs: 0.6, sm: 0.8 }
                      }
                    }}
                  />
                ))}
                {resumeAd.skills && resumeAd.skills.length > 3 && (
                  <Typography variant="body2" sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    color: theme.palette.text.secondary,
                    mt: 0.2
                  }}>
                    +{convertToPersianNumber(resumeAd.skills.length - 3)} مهارت دیگر
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {/* اطلاعات تکمیلی */}
          <Box sx={{
            p: { xs: 0.8, sm: 1 },
            bgcolor: `rgba(0, 112, 60, 0.04)`,
            borderRadius: 1.5,
            border: 'none',
            mb: { xs: 0.8, sm: 1 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="body2" sx={{
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              color: jobSeekerColors.primary,
              fontWeight: 500
            }}>
              <Box component="span" sx={{ fontWeight: 600 }}>حقوق درخواستی:</Box> {getSalaryText(resumeAd.salary)}
            </Typography>
            
            {/* برچسب وضعیت */}
            <Chip
              label={getStatusText(resumeAd.status)}
              size="small"
              sx={{
                backgroundColor: `${getStatusColor(resumeAd.status)}15`,
                color: getStatusColor(resumeAd.status),
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
                border: `1px solid ${getStatusColor(resumeAd.status)}30`,
              }}
            />
          </Box>

          {/* فضای خالی بین محتوا و دکمه */}
          <Box sx={{ flexGrow: 1 }} />

          {/* دکمه مشاهده جزئیات */}
          <Box sx={{ pt: { xs: 0.3, sm: 0.5 }, pb: { xs: 1, sm: 1.2, md: 1.5 } }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleView}
              sx={{
                py: { xs: 0.6, sm: 0.8, md: 1 },
                fontWeight: 'bold',
                borderRadius: 1.5,
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
                boxShadow: `0 3px 6px rgba(0, 112, 60, 0.2)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                  boxShadow: `0 3px 8px rgba(0, 112, 60, 0.3)`,
                }
              }}
            >
              مشاهده جزئیات
            </Button>
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