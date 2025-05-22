'use client'

import { useState, MouseEvent, useEffect, useRef } from 'react';
import {
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    IconButton,
    Tooltip,
    Typography,
    Skeleton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faSignOutAlt,
    faTachometerAlt,
    faListAlt,
    faFileAlt,
    faPhone,
    faBuilding,
    faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore, useAuthActions } from '@/store/authStore';

// تایپ‌های مورد نیاز
interface UserMenuProps {
    user?: {
        name?: string;
        email?: string;
        avatar?: string;
        role?: string; // پشتیبانی از همه انواع نقش‌ها ('JS', 'EM', 'AD', 'SU', 'employer', 'candidate', 'admin')
    };
    isLoggedIn: boolean;
}

export default function UserMenu({ user: propUser, isLoggedIn: propIsLoggedIn }: UserMenuProps) {
    const theme = useTheme();
    const router = useRouter();
    // استفاده جداگانه از selector‌ها برای کاهش رندرهای غیرضروری
    const authUser = useAuthStore(state => state.user);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { logout: authLogout, refreshUserData } = useAuthActions();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuLoading, setMenuLoading] = useState(false);
    const open = Boolean(anchorEl);
    const menuOpenedRef = useRef(false);
    const prevOpenStateRef = useRef(open);
    const hasInitialLoadedRef = useRef(false);

    // لود اولیه اطلاعات کاربر در زمان مانت کامپوننت
    useEffect(() => {
        const preloadUserData = async () => {
            // فقط اگر کاربر لاگین کرده و هنوز دیتا پیش‌لود نشده، اطلاعات را بارگیری کنیم
            if (isAuthenticated && !hasInitialLoadedRef.current) {
                try {
                    // ثبت زمان آخرین درخواست
                    (window as any)._userMenuLastFetch = Date.now();
                    
                    // بارگیری اطلاعات از سرور
                    await refreshUserData();
                    
                    // یادداشت می‌کنیم که بارگیری اولیه انجام شده
                    hasInitialLoadedRef.current = true;
                } catch (error) {
                    console.error('[UserMenu] خطا در پیش‌بارگیری اطلاعات کاربر:', error);
                }
            }
        };
        
        preloadUserData();
    }, [isAuthenticated]); // وابستگی به وضعیت احراز هویت

    // بروزرسانی اطلاعات کاربر فقط زمانی که منو باز می‌شود (اگر از آخرین بارگیری زمان زیادی گذشته باشد)
    useEffect(() => {
        // فقط اگر وضعیت منو از بسته به باز تغییر کرده، اطلاعات را به‌روز کن
        if (open && !prevOpenStateRef.current && isAuthenticated) {
            // ثبت اینکه منو باز شده است، برای جلوگیری از بروزرسانی‌های مکرر
            menuOpenedRef.current = true;
            
            // اگر از قبل داده‌ها بارگیری شده‌اند، نیازی به نمایش اسکلتون نیست
            const now = Date.now();
            const lastFetch = (window as any)._userMenuLastFetch || 0;
            const shouldShowLoading = now - lastFetch > 30000; // اگر بیش از 30 ثانیه گذشته، حالت لودینگ نشان بده
            
            if (shouldShowLoading) {
                setMenuLoading(true);
            }
            
            // برای جلوگیری از حلقه بی‌نهایت، فقط یک بار داده‌ها را بروز می‌کنیم
            const fetchData = async () => {
                // برای محدود کردن فراخوانی‌های متوالی، فاصله زمانی را بررسی می‌کنیم
                const now = Date.now();
                const lastFetch = (window as any)._userMenuLastFetch || 0;
                
                // حداقل 15 ثانیه بین درخواست‌ها فاصله باشد (کاهش از 5 ثانیه به 15 ثانیه)
                if (now - lastFetch < 15000) {
                    console.log('[UserMenu] فراخوانی throttled - درخواست قبلی اخیراً انجام شده است');
                    setMenuLoading(false);
                    return;
                }
                
                try {
                    (window as any)._userMenuLastFetch = now;
                    await refreshUserData();
                } catch (error) {
                    console.error('[UserMenu] خطا در به‌روزرسانی اطلاعات کاربر:', error);
                } finally {
                    // تاخیر کوتاه برای جلوگیری از چشمک زدن رابط کاربری
                    // کاهش تاخیر از 500ms به 200ms
                    setTimeout(() => {
                        setMenuLoading(false);
                    }, 200);
                }
            };
            
            // فقط اگر کاربر احراز هویت شده، داده‌ها را به‌روز کن
            if (isAuthenticated) {
                fetchData();
            } else {
                setMenuLoading(false);
            }
        }
        
        // ذخیره وضعیت فعلی منو برای مقایسه در رندر بعدی
        prevOpenStateRef.current = open;
    }, [open, isAuthenticated]); // حذف refreshUserData از وابستگی‌ها

    // تعیین وضعیت ورود کاربر (اولویت با context است)
    const isLoggedIn = isAuthenticated || propIsLoggedIn;

    // ترکیب اطلاعات کاربر از props و context
    const currentUser = {
        name: authUser?.full_name || propUser?.name || '',
        phone: authUser?.phone || '',
        avatar: propUser?.avatar || '',
        role: authUser?.user_type || propUser?.role || '',
    };

    // بررسی اینکه کاربر کارفرما است یا خیر - اطمینان از بررسی هر دو حالت ممکن
    const isEmployer = currentUser.role === 'EM' || currentUser.role === 'employer';

    // تبدیل نوع کاربر به فارسی
    const getUserRoleText = (role: string) => {
        switch (role) {
            case 'JS': 
            case 'candidate': 
                return 'جوینده کار';
            case 'EM': 
            case 'employer': 
                return 'کارفرما';
            case 'AD': 
                return 'مدیر';
            case 'SU': 
                return 'پشتیبان';
            default:
                return 'کاربر';
        }
    };

    // حرف اول نام برای نمایش در آواتار
    const getAvatarText = () => {
        if (currentUser.name) {
            return currentUser.name.charAt(0).toUpperCase();
        }
        return '';
    };

    // مدیریت باز و بسته شدن منو
    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // مدیریت خروج از حساب کاربری
    const handleLogout = () => {
        // استفاده از تابع logout از AuthContext
        authLogout();
        handleClose();
    };

    // اگر کاربر لاگین نکرده باشد، آیکون ورود نمایش داده می‌شود
    if (!isLoggedIn) {
        return (
            <Tooltip title="ورود/ثبت‌نام" arrow>
                <Box
                    component={Link}
                    href="/login"
                    sx={{
                        width: { xs: '34px', md: '42px' },
                        height: { xs: '34px', md: '42px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}40, ${theme.palette.primary.main}40)`,
                        border: `2px solid ${theme.palette.primary.light}40`,
                        boxShadow: `0 2px 8px ${theme.palette.primary.main}25`,
                        '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: `0 5px 15px ${theme.palette.primary.main}40`,
                            border: `2px solid ${theme.palette.primary.light}70`,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}60, ${theme.palette.primary.main}60)`,
                            '& .icon': {
                                color: theme.palette.primary.dark,
                                transform: 'scale(1.1)',
                            },
                            '&::after': {
                                opacity: 1,
                                transform: 'scale(2)',
                            }
                        },
                        '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: `0 2px 5px ${theme.palette.primary.main}25`,
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${theme.palette.primary.light}40 0%, transparent 70%)`,
                            transform: 'translate(-50%, -50%) scale(0)',
                            opacity: 0,
                            transition: 'transform 0.5s ease, opacity 0.5s ease'
                        }
                    }}
                >
                    <FontAwesomeIcon
                        icon={faUser}
                        className="icon"
                        style={{
                            fontSize: '1.2rem',
                            width: '20px',
                            height: '20px',
                            color: theme.palette.primary.main,
                            transition: 'all 0.25s ease',
                            zIndex: 1
                        }}
                    />
                </Box>
            </Tooltip>
        );
    }

    // اگر کاربر لاگین کرده باشد، آواتار و منوی کاربر نمایش داده می‌شود
    return (
        <>
            <Tooltip title="تنظیمات حساب کاربری" arrow>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    sx={{
                        p: 0,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${theme.palette.primary.main}`,
                        boxShadow: `0 0 10px ${theme.palette.primary.main}30`,
                        '&:hover': {
                            transform: 'scale(1.05)',
                            border: `2px solid ${theme.palette.primary.dark}`,
                            boxShadow: `0 0 15px ${theme.palette.primary.main}50`,
                        },
                        '&:active': {
                            transform: 'scale(0.95)',
                        }
                    }}
                >
                    {currentUser.avatar ? (
                        <Avatar
                            src={currentUser.avatar}
                            alt={currentUser.name || 'کاربر'}
                            sx={{
                                width: { xs: 32, md: 38 },
                                height: { xs: 32, md: 38 },
                                animation: 'pulse 1.5s infinite ease-in-out',
                                '@keyframes pulse': {
                                    '0%': {
                                        boxShadow: '0 0 0 0 rgba(0, 123, 255, 0.1)',
                                    },
                                    '70%': {
                                        boxShadow: '0 0 0 10px rgba(0, 123, 255, 0)',
                                    },
                                    '100%': {
                                        boxShadow: '0 0 0 0 rgba(0, 123, 255, 0)',
                                    },
                                },
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: { xs: 32, md: 38 },
                                height: { xs: 32, md: 38 },
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {getAvatarText() || (
                                <FontAwesomeIcon
                                    icon={faUser}
                                    style={{
                                        fontSize: '1.2rem',
                                        width: '20px',
                                        height: '20px',
                                    }}
                                />
                            )}
                        </Avatar>
                    )}
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 3px 12px rgba(0,0,0,0.15))',
                        mt: 1.5,
                        borderRadius: '15px',
                        border: '1px solid',
                        borderColor: 'divider',
                        minWidth: 230,
                        animation: 'slideIn 0.2s ease-out forwards',
                        '@keyframes slideIn': {
                            '0%': {
                                opacity: 0,
                                transform: 'translateY(-10px) scale(0.95)',
                            },
                            '100%': {
                                opacity: 1,
                                transform: 'translateY(0) scale(1)',
                            },
                        },
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            mr: 1.5,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            left: 14,
                            width: 14,
                            height: 14,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                            borderTop: '1px solid',
                            borderLeft: '1px solid',
                            borderColor: 'divider',
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                {/* هدر منو - اطلاعات کاربر */}
                <Box sx={{ 
                    px: 2, 
                    py: 1.8,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: `linear-gradient(to right, ${theme.palette.primary.main}15, ${theme.palette.primary.light}05)`
                }}>
                    {menuLoading ? (
                        <>
                            <Skeleton variant="text" width={150} height={30} animation="wave" />
                            <Skeleton variant="text" width={120} height={25} animation="wave" sx={{ mt: 0.8 }} />
                            <Skeleton variant="rounded" width={80} height={22} animation="wave" sx={{ mt: 0.8 }} />
                        </>
                    ) : (
                        <>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ 
                                color: theme.palette.primary.dark,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5 
                            }}>
                                {currentUser.name || 'کاربر ماهرکار'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.8 }}>
                                <FontAwesomeIcon icon={faPhone} style={{ 
                                    fontSize: '0.75rem', 
                                    color: theme.palette.text.secondary,
                                    marginLeft: '5px' 
                                }} />
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                    direction: 'ltr',
                                    textAlign: 'right',
                                    fontSize: '0.85rem'
                                }}>
                                    {currentUser.phone || 'شماره تلفن نامشخص'}
                                </Typography>
                            </Box>
                            
                            <Typography 
                                variant="caption" 
                                color={isEmployer ? "employer.main" : "primary.main"} 
                                sx={{ 
                                    mt: 0.8, 
                                    display: 'inline-block', 
                                    fontSize: '0.75rem',
                                    backgroundColor: isEmployer ? `${theme.palette.employer.main}15` : `${theme.palette.primary.main}15`,
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: '10px',
                                    fontWeight: 500
                                }}
                            >
                                {getUserRoleText(currentUser.role)}
                            </Typography>
                        </>
                    )}
                </Box>

                {/* آیتم‌های منو */}
                <Box sx={{ py: 1 }}>
                    {menuLoading ? (
                        <>
                            <Box sx={{ px: 2, py: 0.8 }}>
                                <Skeleton variant="text" height={40} animation="wave" />
                            </Box>
                            <Box sx={{ px: 2, py: 0.8 }}>
                                <Skeleton variant="text" height={40} animation="wave" />
                            </Box>
                            <Box sx={{ px: 2, py: 0.8 }}>
                                <Skeleton variant="text" height={40} animation="wave" />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ px: 2, py: 0.8 }}>
                                <Skeleton variant="text" height={40} animation="wave" />
                            </Box>
                        </>
                    ) : (
                        <>
                            {/* بخش منوی کارفرما */}
                            {isEmployer && (
                                <>
                                    <MenuItem component={Link} href="/employer/dashboard" onClick={handleClose} sx={{ 
                                        py: 1.2,
                                        mx: 0.5,
                                        borderRadius: '8px', 
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: `${theme.palette.employer.main}10`,
                                            '& .MuiListItemIcon-root': {
                                                color: theme.palette.employer.main,
                                                transform: 'scale(1.1)',
                                            }
                                        }
                                    }}>
                                        <ListItemIcon sx={{ 
                                            transition: 'all 0.2s ease',
                                            minWidth: '35px'
                                        }}>
                                            <FontAwesomeIcon icon={faTachometerAlt} style={{ 
                                                fontSize: '1rem', 
                                                color: theme.palette.employer.main 
                                            }} />
                                        </ListItemIcon>
                                        داشبورد کارفرما
                                    </MenuItem>

                                    <MenuItem component={Link} href="/employer/jobs" onClick={handleClose} sx={{ 
                                        py: 1.2,
                                        mx: 0.5,
                                        borderRadius: '8px', 
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: `${theme.palette.employer.main}10`,
                                            '& .MuiListItemIcon-root': {
                                                color: theme.palette.employer.main,
                                                transform: 'scale(1.1)',
                                            }
                                        }
                                    }}>
                                        <ListItemIcon sx={{ 
                                            transition: 'all 0.2s ease',
                                            minWidth: '35px'
                                        }}>
                                            <FontAwesomeIcon icon={faListAlt} style={{ 
                                                fontSize: '1rem', 
                                                color: theme.palette.employer.main 
                                            }} />
                                        </ListItemIcon>
                                        مدیریت آگهی‌ها
                                    </MenuItem>
                                    
                                    <MenuItem component={Link} href="/employer/applications" onClick={handleClose} sx={{ 
                                        py: 1.2,
                                        mx: 0.5,
                                        borderRadius: '8px', 
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: `${theme.palette.employer.main}10`,
                                            '& .MuiListItemIcon-root': {
                                                color: theme.palette.employer.main,
                                                transform: 'scale(1.1)',
                                            }
                                        }
                                    }}>
                                        <ListItemIcon sx={{ 
                                            transition: 'all 0.2s ease',
                                            minWidth: '35px'
                                        }}>
                                            <FontAwesomeIcon icon={faClipboardList} style={{ 
                                                fontSize: '1rem', 
                                                color: theme.palette.employer.main 
                                            }} />
                                        </ListItemIcon>
                                        درخواست‌های استخدام
                                    </MenuItem>
                                    
                                    <MenuItem component={Link} href="/employer/profile" onClick={handleClose} sx={{ 
                                        py: 1.2,
                                        mx: 0.5,
                                        borderRadius: '8px', 
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: `${theme.palette.employer.main}10`,
                                            '& .MuiListItemIcon-root': {
                                                color: theme.palette.employer.main,
                                                transform: 'scale(1.1)',
                                            }
                                        }
                                    }}>
                                        <ListItemIcon sx={{ 
                                            transition: 'all 0.2s ease',
                                            minWidth: '35px'
                                        }}>
                                            <FontAwesomeIcon icon={faBuilding} style={{ 
                                                fontSize: '1rem', 
                                                color: theme.palette.employer.main 
                                            }} />
                                        </ListItemIcon>
                                        پروفایل شرکت
                                    </MenuItem>
                                    
                                    <Divider sx={{ my: 1 }} />
                                </>
                            )}

                            {/* دکمه خروج از حساب کاربری */}
                            <MenuItem onClick={handleLogout} sx={{ 
                                py: 1.2,
                                mx: 0.5,
                                borderRadius: '8px',
                                color: '#d32f2f',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                    '& .MuiListItemIcon-root': {
                                        transform: 'scale(1.1) rotate(10deg)',
                                    }
                                }
                            }}>
                                <ListItemIcon sx={{ 
                                    color: 'inherit',
                                    transition: 'all 0.2s ease',
                                    minWidth: '35px'
                                }}>
                                    <FontAwesomeIcon icon={faSignOutAlt} style={{ 
                                        fontSize: '1rem', 
                                        color: '#d32f2f' 
                                    }} />
                                </ListItemIcon>
                                خروج از حساب
                            </MenuItem>
                        </>
                    )}
                </Box>
            </Menu>
        </>
    );
} 