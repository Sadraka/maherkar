'use client'

import { useState, MouseEvent, useEffect, useRef } from 'react';
import {
    Box,
    Avatar,
    MenuItem,
    ListItemIcon,
    Divider,
    IconButton,
    Tooltip,
    Typography,
    Skeleton,
    useMediaQuery,
    useTheme as useMuiTheme,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter, usePathname } from 'next/navigation';
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
    faClipboardList,
    faPlus,
    faCog
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore, useAuthActions } from '@/store/authStore';
import { EMPLOYER_THEME, JOB_SEEKER_THEME } from '@/constants/colors';

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

// آیتم‌های منوی کارفرما - مشابه با EmployerSidebar
const employerMenuItems = [
    { 
        title: 'پنل کارفرما', 
        path: '/employer/dashboard', 
        icon: faTachometerAlt,
    },
    { 
        title: 'ثبت آگهی جدید', 
        path: '/employer/jobs/create', 
        icon: faPlus,
    },
    { 
        title: 'آگهی‌های من', 
        path: '/employer/jobs', 
        icon: faListAlt,
    },
    { 
        title: 'درخواست‌های کاریابی', 
        path: '/employer/applications', 
        icon: faClipboardList,
    },
    { 
        title: 'پروفایل شرکت', 
        path: '/employer/company', 
        icon: faBuilding,
    },
    { 
        title: 'تنظیمات', 
        path: '/employer/settings', 
        icon: faCog,
    }
];

export default function UserMenu({ user: propUser, isLoggedIn: propIsLoggedIn }: UserMenuProps) {
    const theme = useTheme();
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const router = useRouter();
    const pathname = usePathname(); // اضافه کردن pathname برای تشخیص منوی فعال
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
    // اضافه کردن state برای نگهداری ارتفاع دقیق هدر
    const [headerHeight, setHeaderHeight] = useState(60);

    // محاسبه دقیق ارتفاع هدر (شامل PromoBar)
    useEffect(() => {
        // تابع محاسبه ارتفاع دقیق هدر و PromoBar
        const calculateHeaderHeight = () => {
            // سعی در یافتن هدر با انتخابگرهای مختلف
            const header = document.querySelector('header') || 
                           document.querySelector('.MuiAppBar-root') || 
                           document.querySelector('[role="banner"]');
            
            // چاپ اطلاعات برای دیباگ
            //('Header element found:', header);
            
            if (header) {
                const headerRect = header.getBoundingClientRect();
                // استفاده از bottom برای محاسبه کل ارتفاع هدر + PromoBar
                const totalHeight = headerRect.bottom;
                //('Header total height calculated:', totalHeight);
                setHeaderHeight(totalHeight);
            } else {
                console.warn('Header element not found, using default height:', 60);
                setHeaderHeight(60); // ارتفاع پیش‌فرض اگر هدر پیدا نشد
            }
            
            // بررسی وجود PromoBar به صورت جداگانه
            const promoBar = document.querySelector('[data-testid="promo-bar"]') || 
                            document.querySelector('.promo-bar');
            if (promoBar) {
                //('PromoBar found:', promoBar);
            } else {
                //('PromoBar not found separately');
            }
        };

        // محاسبه اولیه ارتفاع
        calculateHeaderHeight();

        // هنگام اسکرول یا تغییر سایز پنجره، ارتفاع دوباره محاسبه شود
        const handleResize = () => calculateHeaderHeight();
        const handleScroll = () => calculateHeaderHeight();

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // هنگام باز شدن منو نیز مجدداً ارتفاع محاسبه شود
        if (open) {
            setTimeout(calculateHeaderHeight, 50); // محاسبه با کمی تاخیر برای اطمینان
        }

        // پاکسازی event listeners هنگام unmount کردن کامپوننت
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [open]);

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
                    //('[UserMenu] فراخوانی throttled - درخواست قبلی اخیراً انجام شده است');
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

    // کوتاه کردن نام طولانی برای نمایش بهتر
    const getShortName = () => {
        if (!currentUser.name) return 'کاربر ماهرکار';
        
        // جدا کردن بخش اول نام (اسم) از فامیل
        const nameParts = currentUser.name.split(' ');
        
        // اگر فقط یک بخش داشت (فقط اسم)
        if (nameParts.length === 1) {
            // اگر طول اسم بیشتر از 12 کاراکتر بود، آن را کوتاه کن
            return nameParts[0].length > 12 
                ? nameParts[0].substring(0, 10) + '...' 
                : nameParts[0];
        }
        
        // اگر چند بخش داشت (اسم و فامیل)
        // فقط اسم را برگردان، مگر اینکه خیلی کوتاه باشد
        const firstName = nameParts[0];
        
        // اگر اسم کوتاه بود (کمتر از 4 کاراکتر)، اسم و فامیل را با هم نمایش بده
        if (firstName.length < 4 && nameParts.length > 1) {
            const fullNameShort = `${firstName} ${nameParts[1]}`;
            return fullNameShort.length > 15 
                ? fullNameShort.substring(0, 13) + '...' 
                : fullNameShort;
        }
        
        // در غیر این صورت فقط اسم را برگردان
        return firstName.length > 12 
            ? firstName.substring(0, 10) + '...' 
            : firstName;
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

    // کامپوننت آواتار پیش‌فرض به جای حرف اول نام
    const UserDefaultAvatar = () => (
        <FontAwesomeIcon
            icon={faUser}
            style={{
                fontSize: '1rem',
                color: '#fff',
            }}
        />
    );

    // بررسی اینکه آیا در صفحه‌ای هستیم که آیتم منو با آن تطبیق دارد
    const isActiveMenuItem = (path: string) => {
        if (path === pathname) return true;
        if (path === '/employer/jobs' && pathname?.startsWith('/employer/jobs/')) return true;
        if (path === '/employer/applications' && pathname?.startsWith('/employer/applications/')) return true;
        return false;
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
            <Tooltip title={isLoggedIn ? "پروفایل کاربری" : "ورود/ثبت‌نام"} arrow>
                <Box
                    onClick={handleClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                        }
                    }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                        <Avatar
                            src={currentUser.avatar}
                        alt={currentUser.name}
                            sx={{
                            width: { xs: 36, md: 40 },
                            height: { xs: 36, md: 40 },
                            bgcolor: isEmployer ? EMPLOYER_THEME.primary : JOB_SEEKER_THEME.primary,
                                color: '#fff',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            boxShadow: `0 2px 6px ${isEmployer ? EMPLOYER_THEME.primary : JOB_SEEKER_THEME.primary}40`,
                            border: `2px solid ${isEmployer ? EMPLOYER_THEME.light : JOB_SEEKER_THEME.light}80`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            flexShrink: 0,
                            mr: 0,
                            transition: 'all 0.3s ease',
                            order: -1,
                            '&:hover': {
                                boxShadow: `0 3px 8px ${isEmployer ? EMPLOYER_THEME.primary : JOB_SEEKER_THEME.primary}60`,
                                border: `2px solid ${isEmployer ? EMPLOYER_THEME.light : JOB_SEEKER_THEME.light}`,
                            }
                        }}
                    >
                        {currentUser.avatar ? getAvatarText() : <UserDefaultAvatar />}
                    </Avatar>

                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1.1,
                        minWidth: { xs: '70px', md: '80px' },
                        ml: -1,
                    }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600,
                                color: isEmployer ? EMPLOYER_THEME.dark : JOB_SEEKER_THEME.dark,
                                fontSize: { xs: '0.75rem', md: '0.85rem' },
                                maxWidth: { xs: '90px', md: '120px' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textAlign: 'center',
                            }}
                        >
                            {getShortName()}
                        </Typography>
                        
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isEmployer 
                                ? `linear-gradient(90deg, ${EMPLOYER_THEME.primary}, ${EMPLOYER_THEME.light})`
                                : `linear-gradient(90deg, ${JOB_SEEKER_THEME.primary}, ${JOB_SEEKER_THEME.light})`,
                            borderRadius: '4px',
                            px: 0.75,
                            py: 0.1,
                            mt: 0.2,
                            minWidth: '44px',
                            textAlign: 'center',
                        }}>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    fontSize: { xs: '0.6rem', md: '0.65rem' },
                                    lineHeight: 1.2,
                                    color: '#fff',
                                    fontWeight: 500
                                }}
                            >
                                {isEmployer ? 'کارفرما' : 'کارجو'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Tooltip>

            {/* منوی کاربر یکپارچه برای همه حالت‌ها */}
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                variant="temporary"
                elevation={16}
                PaperProps={{
                    sx: { 
                        width: { xs: 280, sm: 320, md: 350 },
                        height: '100vh',
                        top: `${headerHeight}px`,
                        zIndex: 9999,
                        boxShadow: '-4px 0px 15px rgba(0,0,0,0.1)',
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 0,
                        padding: 0,
                        margin: 0,
                        position: 'fixed'
                    }
                }}
                sx={{
                    '& .MuiBackdrop-root': {
                        top: `${headerHeight}px`,
                        backgroundColor: 'rgba(0,0,0,0.3)'
                    },
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* هدر منو - اطلاعات کاربر */}
                <Box sx={{ 
                    p: 2.5, 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: isEmployer 
                        ? `linear-gradient(135deg, ${EMPLOYER_THEME.bgVeryLight}, ${EMPLOYER_THEME.bgLight})` 
                        : `linear-gradient(135deg, ${JOB_SEEKER_THEME.bgLight}, ${JOB_SEEKER_THEME.bgLight})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '30%',
                        background: 'linear-gradient(to top, rgba(255,255,255,0.7), transparent)',
                        pointerEvents: 'none'
                    }
                }}>
                    {/* دکمه بستن منو در گوشه بالا سمت چپ */}
                    <IconButton 
                        onClick={handleClose}
                        aria-label="بستن منو" 
                        sx={{ 
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <FontAwesomeIcon 
                            icon={faSignOutAlt} 
                            style={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} 
                        />
                    </IconButton>
                {menuLoading ? (
                    <>
                            <Skeleton variant="circular" width={60} height={60} animation="wave" />
                            <Skeleton variant="text" width={150} height={30} animation="wave" sx={{ mt: 1 }} />
                            <Skeleton variant="text" width={120} height={25} animation="wave" sx={{ mt: 0.5 }} />
                            <Skeleton variant="rounded" width={80} height={22} animation="wave" sx={{ mt: 0.5 }} />
                    </>
                ) : (
                    <>
                            <Avatar
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    bgcolor: isEmployer ? EMPLOYER_THEME.primary : JOB_SEEKER_THEME.primary,
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem',
                                    boxShadow: `0 3px 10px ${isEmployer ? EMPLOYER_THEME.primary : JOB_SEEKER_THEME.primary}40`,
                                    border: `3px solid ${isEmployer ? EMPLOYER_THEME.light : JOB_SEEKER_THEME.light}80`,
                                    mb: 1
                                }}
                            >
                                {currentUser.avatar ? getAvatarText() : <UserDefaultAvatar />}
                            </Avatar>
                            
                        <Typography variant="subtitle1" fontWeight={700} sx={{ 
                                color: isEmployer ? EMPLOYER_THEME.dark : JOB_SEEKER_THEME.dark,
                                textAlign: 'center',
                                maxWidth: '220px',
                                mx: 'auto',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                        }}>
                            {currentUser.name || 'کاربر ماهرکار'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faPhone} style={{ 
                            fontSize: '0.75rem', 
                            color: theme.palette.text.secondary,
                            marginLeft: '5px' 
                        }} />
                        <Typography variant="body2" color="text.secondary" sx={{ 
                            direction: 'ltr',
                            fontSize: '0.85rem'
                        }}>
                            {currentUser.phone || 'شماره تلفن نامشخص'}
                        </Typography>
                    </Box>
                    
                    <Typography 
                        variant="caption" 
                        sx={{ 
                                mt: 1, 
                            display: 'inline-block', 
                            fontSize: '0.75rem',
                                backgroundColor: isEmployer ? `${EMPLOYER_THEME.primary}15` : `${JOB_SEEKER_THEME.primary}15`,
                                color: isEmployer ? EMPLOYER_THEME.primary : JOB_SEEKER_THEME.primary,
                                px: 1.5,
                            py: 0.3,
                                borderRadius: '50px',
                            fontWeight: 500
                        }}
                    >
                        {getUserRoleText(currentUser.role)}
                    </Typography>
                </>
            )}
        </Box>

                {/* آیتم‌های منو برای کارفرما */}
                {isEmployer && !menuLoading && (
                    <Box sx={{ py: 1.5, px: 1 }}>
                        {/* فقط در حالت دسکتاپ نمایش می‌دهیم */}
                        {!isMobile && (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 0.5, fontWeight: 500 }}>
                                    دسترسی سریع
                                </Typography>
                                
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, px: 1, mb: 2 }}>
                                    <MenuItem 
                                        component={Link} 
                                        href="/employer/dashboard" 
                                        onClick={handleClose}
                                        sx={{
                                            flexDirection: 'column',
                                            borderRadius: 2,
                                            py: 1.5,
                                            width: '100%',
                                            textAlign: 'center',
                                            bgcolor: `${EMPLOYER_THEME.bgVeryLight}`,
                                            '&:hover': {
                                                bgcolor: `${EMPLOYER_THEME.bgLight}`,
                                            }
                                        }}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faTachometerAlt} 
                                            style={{ 
                                                fontSize: '1.2rem',
                                                color: EMPLOYER_THEME.primary,
                                                marginBottom: '5px'
                                            }} 
                                        />
                                        <Typography variant="caption" fontWeight={500}>
                                            داشبورد
                                        </Typography>
                                    </MenuItem>
                                    
                                    <MenuItem 
                                        component={Link} 
                                        href="/employer/jobs/create" 
                                        onClick={handleClose}
                                        sx={{
                                            flexDirection: 'column',
                                            borderRadius: 2,
                                            py: 1.5,
                                            width: '100%',
                                            textAlign: 'center',
                                            bgcolor: `${EMPLOYER_THEME.bgVeryLight}`,
                                            '&:hover': {
                                                bgcolor: `${EMPLOYER_THEME.bgLight}`,
                                            }
                                        }}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faFileAlt} 
                                            style={{ 
                                                fontSize: '1.2rem',
                                                color: EMPLOYER_THEME.primary,
                                                marginBottom: '5px'
                                            }} 
                                        />
                                        <Typography variant="caption" fontWeight={500}>
                                            ثبت آگهی
                                        </Typography>
                                    </MenuItem>
                                </Box>
                                
                                <Divider sx={{ my: 1 }} />
                                
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 0.5, mt: 1, fontWeight: 500 }}>
                                    مدیریت
                                </Typography>

                                <MenuItem component={Link} href="/employer/jobs" onClick={handleClose} sx={{ 
                                    py: 1.2,
                                    mx: 0.5,
                                    borderRadius: '8px', 
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: `${EMPLOYER_THEME.primary}10`,
                                        '& .MuiListItemIcon-root': {
                                            color: EMPLOYER_THEME.primary,
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
                                            color: EMPLOYER_THEME.primary 
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
                                        backgroundColor: `${EMPLOYER_THEME.primary}10`,
                                        '& .MuiListItemIcon-root': {
                                            color: EMPLOYER_THEME.primary,
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
                                            color: EMPLOYER_THEME.primary 
                                        }} />
                                    </ListItemIcon>
                                    درخواست‌های استخدام
                                </MenuItem>
                                    
                                <Divider sx={{ my: 1 }} />
                                
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 0.5, mt: 1, fontWeight: 500 }}>
                                    تنظیمات
                                </Typography>
                                
                                <MenuItem component={Link} href="/employer/company" onClick={handleClose} sx={{ 
                                    py: 1.2,
                                    mx: 0.5,
                                    borderRadius: '8px', 
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: `${EMPLOYER_THEME.primary}10`,
                                        '& .MuiListItemIcon-root': {
                                            color: EMPLOYER_THEME.primary,
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
                                            color: EMPLOYER_THEME.primary 
                                        }} />
                                    </ListItemIcon>
                                    پروفایل شرکت
                                </MenuItem>
                            </>
                        )}
                        
                        {/* در موبایل، منوی کامل سایدبار کارفرما را نشان می‌دهیم */}
                        {isMobile && (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 0.5, fontWeight: 500 }}>
                                    منوی کارفرما
                                </Typography>
                                
                                <List sx={{ px: 0, width: '100%' }}>
                                    {employerMenuItems.map((item) => (
                                        <ListItem key={item.path} sx={{ p: 0 }}>
                                            <ListItemButton 
                                                component={Link}
                                                href={item.path}
                                                onClick={handleClose}
                                                selected={isActiveMenuItem(item.path)}
                                                sx={{
                                                    borderRadius: 1,
                                                    py: 1,
                                                    width: '100%',
                                                    '&.Mui-selected': {
                                                        bgcolor: 'rgba(0, 168, 107, 0.08)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 168, 107, 0.12)',
                                                        },
                                                        '& .MuiListItemIcon-root': {
                                                            color: EMPLOYER_THEME.primary,
                                                        },
                                                        '& .MuiListItemText-primary': {
                                                            color: EMPLOYER_THEME.primary,
                                                            fontWeight: 'bold'
                                                        }
                                                    },
                                                    '&:hover': {
                                                        bgcolor: 'rgba(0, 168, 107, 0.06)',
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ 
                                                    minWidth: 40,
                                                    color: isActiveMenuItem(item.path) ? EMPLOYER_THEME.primary : 'text.secondary',
                                                }}>
                                                    <FontAwesomeIcon 
                                                        icon={item.icon} 
                                                        style={{ fontSize: '1.1rem' }} 
                                                    />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={item.title}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: isActiveMenuItem(item.path) ? 'bold' : 'normal'
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                        
                        <Divider sx={{ my: 1 }} />
                        
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
                    </Box>
                )}
                
                {/* منوی غیر کارفرما */}
                {!isEmployer && !menuLoading && (
                    <Box sx={{ py: 1 }}>
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
                    </Box>
                )}
            </Drawer>
        </>
    );
} 