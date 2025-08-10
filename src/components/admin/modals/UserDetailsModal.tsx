'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  Button
} from '@mui/material';
import {
  Close,
  Person,
  Business,
  AdminPanelSettings,
  Support,
  Group,
  Visibility,
  Edit,
  Payment
} from '@mui/icons-material';
import { ADMIN_THEME, JOB_SEEKER_THEME, EMPLOYER_THEME, SUPPORT_THEME } from '@/constants/colors';
import { apiGet } from '@/lib/axios';

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
    return gregorianDate || 'نامشخص';
  }
};

// تابع تبدیل اعداد به فارسی
const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

interface User {
  id: string;
  full_name: string;
  phone: string;
  user_type: string;
  status: string;
  joined_date: string;
  is_active: boolean;
  last_updated: string;
  last_login?: string;
  is_staff?: boolean;
  groups?: string[];
  profile_picture?: string;
}

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  loading?: boolean;
  onEdit?: (user: User) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onClose,
  user,
  loading = false,
  onEdit
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ------------------------------
  // استیت و منطق دریافت پروفایل تکمیلی
  // ------------------------------
  const [profile, setProfile] = React.useState<any | null>(null);
  const [profileLoading, setProfileLoading] = React.useState<boolean>(false);
  // نام شهر استخراج‌شده برای نمایش خوانا به‌جای شناسه
  const [cityName, setCityName] = React.useState<string | null>(null);

  // واکشی اطلاعات پروفایل هنگام باز شدن دیالوگ
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!open || !user) return;

             // فقط برای کارجو یا کارفرما فعلاً پروفایل تکمیلی داریم
       if (user.user_type !== 'EM' && user.user_type !== 'JS') {
         setProfile(null);
         return;
       }

       try {
         setProfileLoading(true);
        let endpoint = '';
        if (user.user_type === 'EM') {
          endpoint = '/profiles/employers/';
        } else if (user.user_type === 'JS') {
          endpoint = '/profiles/job-seekers/';
        }

        if (!endpoint) return;

        const response = await apiGet(endpoint);
        const data = response.data as any[];
        // پیدا کردن پروفایل مرتبط
        const found = data.find((p: any) => {
          const uid = typeof p.user === 'object' ? p.user?.id : p.user;
          return uid?.toString() === user.id.toString();
        });
                 setProfile(found || null);
       } catch (e) {
         console.error('خطا در دریافت پروفایل تکمیلی:', e);
         setProfile(null);
       } finally {
         setProfileLoading(false);
       }
    };

    fetchProfile();
  }, [open, user]);

  // واکشی نام شهر در صورت وجود شناسه عددی
  React.useEffect(() => {
    const fetchCityName = async () => {
      if (profile && profile.location) {
        if (typeof profile.location === 'object') {
          setCityName(profile.location.name);
        } else {
          try {
            const res = await apiGet(`/locations/cities/${profile.location}/`);
            if (res.data && (res.data as any).name) {
              setCityName((res.data as any).name);
            } else {
              setCityName(null);
            }
          } catch (e) {
            console.error('خطا در دریافت نام شهر:', e);
            setCityName(null);
          }
        }
      } else {
        setCityName(null);
      }
    };

    fetchCityName();
  }, [profile]);

  const getUserTypeLabel = (type: string) => {
    const types = {
      'JS': 'کارجو',
      'EM': 'کارفرما',
      'AD': 'مدیریت',
      'SU': 'پشتیبان'
    };
    return types[type as keyof typeof types] || 'نامشخص';
  };

  const getUserTypeIcon = (type: string) => {
    const icons = {
      'JS': <Person />,
      'EM': <Business />,
      'AD': <AdminPanelSettings />,
      'SU': <Support />
    };
    return icons[type as keyof typeof icons] || <Person />;
  };

  const getUserTypeColor = (type: string) => {
    const colors = {
      'JS': JOB_SEEKER_THEME.primary,
      'EM': EMPLOYER_THEME.primary,
      'AD': ADMIN_THEME.primary,
      'SU': SUPPORT_THEME.primary
    };
    return colors[type as keyof typeof colors] || ADMIN_THEME.primary;
  };

  const getUserStatus = (user: User): { isActive: boolean; label: string } => {
    if (user.status) {
      const statuses = {
        'ACT': { isActive: true, label: 'فعال' },
        'SUS': { isActive: false, label: 'تعلیق شده' },
        'DEL': { isActive: false, label: 'حذف شده' }
      };
      return statuses[user.status as keyof typeof statuses] || { isActive: user.is_active, label: user.is_active ? 'فعال' : 'غیرفعال' };
    }
    return { isActive: user.is_active, label: user.is_active ? 'فعال' : 'غیرفعال' };
  };

  const getAvatarText = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return 'ا';
  };

  if (loading) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: ADMIN_THEME.bgLight,
          borderBottom: `1px solid ${ADMIN_THEME.bgLight}`
        }}>
          <Skeleton variant="text" width={200} height={32} />
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </Box>
            
            {/* Content Skeleton */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {[1, 2, 3, 4].map((item) => (
                <Card key={item}>
                  <CardContent>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) return null;

  const userStatus = getUserStatus(user);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
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
        جزئیات کاربر
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          
          {/* Header Section */}
          <Card sx={{ 
            mb: 3, 
            bgcolor: 'white',
            border: `1px solid ${ADMIN_THEME.bgLight}`,
            borderRadius: 2
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                {/* Avatar */}
                <Avatar
                  src={user.profile_picture}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: getUserTypeColor(user.user_type),
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    border: `2px solid ${ADMIN_THEME.bgLight}`
                  }}
                >
                  {getAvatarText()}
                </Avatar>

                {/* User Info */}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: ADMIN_THEME.dark, mb: 1 }}>
                    {user.full_name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: ADMIN_THEME.dark, opacity: 0.8 }}>
                      شناسه:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: ADMIN_THEME.primary }}>
                      {convertToPersianNumbers(parseInt(user.id))}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="body2" dir="ltr" sx={{ fontFamily: 'monospace' }}>
                      {user.phone}
                    </Typography>
                  </Box>

                  {/* Status and Type Chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={getUserTypeIcon(user.user_type)}
                      label={getUserTypeLabel(user.user_type)}
                      size="small"
                      sx={{
                        bgcolor: ADMIN_THEME.bgLight,
                        color: getUserTypeColor(user.user_type),
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: getUserTypeColor(user.user_type) }
                      }}
                    />
                    <Chip
                      label={userStatus.label}
                      color={userStatus.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    {user.is_staff && (
                      <Chip
                        icon={<Group />}
                        label="کارکنان"
                        size="small"
                        sx={{
                          bgcolor: ADMIN_THEME.bgLight,
                          color: ADMIN_THEME.primary,
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: ADMIN_THEME.primary }
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            
            {/* Personal Information */}
            <Card sx={{ height: '100%', border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: ADMIN_THEME.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person />
                  اطلاعات شخصی
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      نام کامل
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {user.full_name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      شماره تماس
                    </Typography>
                    <Typography variant="body1" fontWeight="500" dir="ltr" sx={{ fontFamily: 'monospace' }}>
                      {user.phone}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card sx={{ height: '100%', border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: ADMIN_THEME.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettings />
                  اطلاعات حساب
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      نوع کاربر
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getUserTypeIcon(user.user_type)}
                      <Typography variant="body1" fontWeight="500">
                        {getUserTypeLabel(user.user_type)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      وضعیت حساب
                    </Typography>
                    <Chip
                      label={userStatus.label}
                      color={userStatus.isActive ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  {user.groups && user.groups.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        گروه‌های کاربری
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.groups.map((group, index) => (
                          <Chip
                            key={index}
                            label={group}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card sx={{ height: '100%', border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: ADMIN_THEME.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group />
                  تاریخ‌ها
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      تاریخ عضویت
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {convertToJalali(user.joined_date)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      آخرین به‌روزرسانی
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {convertToJalali(user.last_updated)}
                    </Typography>
                  </Box>

                  {user.last_login && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        آخرین ورود
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {convertToJalali(user.last_login)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card sx={{ height: '100%', border: `1px solid ${ADMIN_THEME.bgLight}`, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: ADMIN_THEME.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility />
                  اطلاعات تکمیلی
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      وضعیت فعال بودن
                    </Typography>
                    <Chip
                      label={user.is_active ? 'فعال' : 'غیرفعال'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Profile Extra Information (Bio, Location, Industry) */}
            { (profileLoading || profile) && (
              <Card sx={{ 
                height: '100%', 
                background: `linear-gradient(135deg, ${ADMIN_THEME.bgVeryLight} 0%, ${ADMIN_THEME.bgLight} 100%)`,
                border: `2px solid ${ADMIN_THEME.primary}20`,
                borderRadius: 3,
                boxShadow: `0 4px 20px ${ADMIN_THEME.primary}10`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${ADMIN_THEME.primary}, ${ADMIN_THEME.light})`,
                }
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    mb: 3,
                    pb: 2,
                    borderBottom: `2px solid ${ADMIN_THEME.primary}20`,
                    position: 'relative'
                  }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${ADMIN_THEME.primary}, ${ADMIN_THEME.light})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${ADMIN_THEME.primary}30`
                    }}>
                      <Visibility sx={{ color: 'white', fontSize: '1.2rem' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ 
                      color: ADMIN_THEME.primary,
                      background: `linear-gradient(135deg, ${ADMIN_THEME.primary}, ${ADMIN_THEME.light})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '1.1rem'
                    }}>
                      جزئیات پروفایل
                    </Typography>
                  </Box>
 
                  {profileLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[1,2,3,4].map(i => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton variant="circular" width={8} height={8} />
                          <Skeleton variant="text" width="30%" height={20} />
                          <Skeleton variant="text" width="60%" height={20} />
                        </Box>
                      ))}
                    </Box>
                  ) : profile ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {profile.bio && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.6)',
                          border: `1px solid ${ADMIN_THEME.primary}15`
                        }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: ADMIN_THEME.primary,
                            mt: 0.5,
                            flexShrink: 0
                          }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ 
                              mb: 0.5, 
                              fontWeight: 600,
                              color: ADMIN_THEME.primary 
                            }}>
                              بیوگرافی
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              lineHeight: 1.6,
                              color: ADMIN_THEME.dark 
                            }}>
                              {profile.bio}
                            </Typography>
                          </Box>
                        </Box>
                      )}
 
                      {profile.location && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.6)',
                          border: `1px solid ${ADMIN_THEME.primary}15`
                        }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: ADMIN_THEME.primary,
                            flexShrink: 0
                          }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ 
                              mb: 0.5, 
                              fontWeight: 600,
                              color: ADMIN_THEME.primary 
                            }}>
                              شهر محل کار
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500,
                              color: ADMIN_THEME.dark 
                            }}>
                              {cityName || 'نامشخص'}
                            </Typography>
                          </Box>
                        </Box>
                      )}
 
                      {profile.personal_info && (
                        <>
                          {profile.personal_info.gender && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(255,255,255,0.6)',
                              border: `1px solid ${ADMIN_THEME.primary}15`
                            }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: ADMIN_THEME.primary,
                                flexShrink: 0
                              }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                                  mb: 0.5, 
                                  fontWeight: 600,
                                  color: ADMIN_THEME.primary 
                                }}>
                                  جنسیت
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 500,
                                  color: ADMIN_THEME.dark 
                                }}>
                                  {profile.personal_info.gender === 'M' ? 'آقا' : profile.personal_info.gender === 'W' ? 'خانوم' : profile.personal_info.gender}
                                </Typography>
                              </Box>
                            </Box>
                          )}
 
                          {profile.personal_info.age !== undefined && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(255,255,255,0.6)',
                              border: `1px solid ${ADMIN_THEME.primary}15`
                            }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: ADMIN_THEME.primary,
                                flexShrink: 0
                              }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                                  mb: 0.5, 
                                  fontWeight: 600,
                                  color: ADMIN_THEME.primary 
                                }}>
                                  سن
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 500,
                                  color: ADMIN_THEME.dark 
                                }}>
                                  {convertToPersianNumbers(profile.personal_info.age)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
 
                          {profile.personal_info.kids_count !== undefined && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(255,255,255,0.6)',
                              border: `1px solid ${ADMIN_THEME.primary}15`
                            }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: ADMIN_THEME.primary,
                                flexShrink: 0
                              }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                                  mb: 0.5, 
                                  fontWeight: 600,
                                  color: ADMIN_THEME.primary 
                                }}>
                                  تعداد فرزندان
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 500,
                                  color: ADMIN_THEME.dark 
                                }}>
                                  {convertToPersianNumbers(profile.personal_info.kids_count)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: ADMIN_THEME.dark,
                      opacity: 0.7
                    }}>
                      <Typography variant="body2">
                        اطلاعات تکمیلی برای این کاربر ثبت نشده است.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
          
          {/* لینک به صفحه پرداخت‌ها */}
          <Box sx={{ 
            mt: 3,
            p: 2,
            border: `2px dashed ${ADMIN_THEME.primary}40`,
            borderRadius: 3,
            bgcolor: `${ADMIN_THEME.primary}05`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: ADMIN_THEME.primary,
              bgcolor: `${ADMIN_THEME.primary}10`,
              transform: 'translateY(-1px)'
            }
          }}
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (user.phone) {
                window.location.hash = `#payments?search=${user.phone}`;
              } else if (user.full_name) {
                window.location.hash = `#payments?search=${encodeURIComponent(user.full_name)}`;
              } else if (user.id) {
                window.location.hash = `#payments?search=${user.id}`;
              } else {
                window.location.hash = '#payments';
              }
            }
          }}
          >
            <Avatar sx={{ 
              bgcolor: `${ADMIN_THEME.primary}15`, 
              color: ADMIN_THEME.primary,
              width: 36,
              height: 36
            }}>
              <Payment sx={{ fontSize: '1.2rem' }} />
            </Avatar>
                         <Typography variant="body2" fontWeight={600} sx={{ color: ADMIN_THEME.primary, textAlign: 'center' }}>
               مشاهده پرداخت‌های این کاربر
             </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        bgcolor: ADMIN_THEME.bgLight,
        borderTop: `1px solid ${ADMIN_THEME.bgLight}`,
        p: 2
      }}>
        <Button onClick={onClose} variant="outlined" sx={{
          borderColor: ADMIN_THEME.primary,
          color: ADMIN_THEME.primary,
          '&:hover': {
            borderColor: ADMIN_THEME.dark,
            bgcolor: ADMIN_THEME.bgLight
          }
        }}>
          انصراف
        </Button>
        {onEdit && (
          <Button onClick={() => {
            onClose();
            onEdit(user);
          }} variant="contained" sx={{
            bgcolor: '#7c3aed !important',
            background: '#7c3aed !important',
            '&:hover': { 
              bgcolor: '#6d28d9 !important',
              background: '#6d28d9 !important'
            }
          }}>
            ویرایش
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsModal; 