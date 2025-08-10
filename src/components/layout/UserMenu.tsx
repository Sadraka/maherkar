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
    ListItemText,
    Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faUsers,
    faBuilding,
    faUserTie,
    faSignInAlt,
    faUserPlus,
    faRightToBracket,
    faUserCircle,
    faBell,
    faHeadset,
    faBars,
    faTachometerAlt,
    faListAlt,
    faClipboardList,
    faCreditCard,
    faChartBar,
    faProjectDiagram,
    faTags,
    faBriefcase,
    faFileAlt,
    faIndustry,
    faSubscript,
    faCog,
    faPlus,
    faSignOutAlt,
    faBullhorn,
    faPhone,
    faTimes,
    faXmark,
    faChevronDown,
    faChevronUp,
    faEye,
    faEdit,
    faGraduationCap,
    faTools,
    faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore, useAuthActions } from '@/store/authStore';
import { useJobStatsStore } from '@/store/jobStatsStore';
import { EMPLOYER_THEME, JOB_SEEKER_THEME, ADMIN_THEME } from '@/constants/colors';

// اضافه کردن انیمیشن pulse
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.4;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
`;

// تزریق استایل انیمیشن
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumbers = (text: string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return text.replace(/[0-9]/g, (match) => persianNumbers[parseInt(match)]);
};

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

// آیتم‌های منوی کارفرما
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
        title: 'شرکت‌های من',
        path: '/employer/companies',
        icon: faBuilding,
    },
    {
        title: 'پروفایل',
        path: '/employer/profile',
        icon: faUser,
    }
];

// آیتم‌های منوی کارجو
const jobSeekerMenuItems = [
    {
        title: 'داشبورد',
        path: '/jobseeker/dashboard',
        icon: faTachometerAlt,
    },
    {
        title: 'پروفایل',
        path: '/jobseeker/profile',
        icon: faUser,
        hasSubmenu: true,
        submenu: [
            { title: 'اطلاعات شخصی', path: '/jobseeker/resume', icon: faUser },
            { title: 'تجربیات کاری', path: '/jobseeker/resume/experiences', icon: faBriefcase },
            { title: 'تحصیلات', path: '/jobseeker/resume/educations', icon: faGraduationCap },
            { title: 'مهارت‌ها', path: '/jobseeker/resume/skills', icon: faTools },
        ]
    },
    {
        title: 'آگهی‌های رزومه',
        path: '/jobseeker/resume-ads',
        icon: faBullhorn,
    },
    {
        title: 'درخواست‌های ارسالی',
        path: '/jobseeker/applications',
        icon: faClipboardList,
    },
    {
        title: 'آگهی‌های شغلی',
        path: '/jobseeker/job-ads',
        icon: faBriefcase,
    }
];

// آیتم‌های منوی ادمین
const adminMenuItems = [
    {
        title: 'داشبورد',
        path: '/admin',
        icon: faTachometerAlt,
    },
    {
        title: 'کاربران',
        path: '/admin#users',
        icon: faUsers,
        group: 'user-management'
    },
    {
        title: 'شرکت‌ها',
        path: '/admin#companies',
        icon: faBuilding,
        group: 'user-management'
    },
    {
        title: 'آگهی‌ها',
        path: '/admin#jobs',
        icon: faBriefcase,
        group: 'user-management'
    },
    {
        title: 'پرداخت‌ها',
        path: '/admin#payments',
        icon: faCreditCard,
        group: 'user-management'
    },
    {
        title: 'اشتراک‌ها',
        path: '/admin#subscriptions',
        icon: null,
        group: 'user-management'
    },
    {
        title: 'تایید کارفرمایان',
        path: '/admin#employer-verification',
        icon: faUserCheck,
        group: 'user-management'
    },
    {
        title: 'گروه‌های کاری',
        path: '/admin#industries',
        icon: faIndustry,
    },
    {
        title: 'درخواست‌ها',
        path: '/admin#applications',
        icon: faFileAlt,
    },
    {
        title: 'طرح‌های اشتراک',
        path: '/admin#subscription-plans',
        icon: faTags,
    }
];

export default function UserMenu({ user: propUser, isLoggedIn: propIsLoggedIn }: UserMenuProps) {
    const theme = useTheme();
    const muiTheme = useMuiTheme();
    const { jobStats, jobStatsLoading } = useJobStatsStore();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const router = useRouter();
    const pathname = usePathname(); // اضافه کردن pathname برای تشخیص منوی فعال
    // استفاده جداگانه از selector‌ها برای کاهش رندرهای غیرضروری
    const authUser = useAuthStore(state => state.user);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { logout: authLogout, refreshUserData } = useAuthActions();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuLoading, setMenuLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(true);
    const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});
    // آکاردئون مدیریت کاربران برای منوی ادمین در موبایل
    const [openAdminManagement, setOpenAdminManagement] = useState(true);
    const open = Boolean(anchorEl);
    const menuOpenedRef = useRef(false);
    const prevOpenStateRef = useRef(open);
    const hasInitialLoadedRef = useRef(false);
    // اضافه کردن state برای نگهداری ارتفاع دقیق هدر
    const [headerHeight, setHeaderHeight] = useState(60);
    const [promoBarClosed, setPromoBarClosed] = useState(false);

    // گوش دادن به رویداد بسته شدن پرومو بار
    useEffect(() => {
        const handlePromoBarClosed = () => {
            setPromoBarClosed(true);
        };

        window.addEventListener('promoBarClosed', handlePromoBarClosed);
        return () => {
            window.removeEventListener('promoBarClosed', handlePromoBarClosed);
        };
    }, []);

    // مدیریت loading state برای آواتار
    useEffect(() => {
        if (authUser && authUser.full_name) {
            // اگر اطلاعات کاربر موجود است، loading را متوقف کن
            setAvatarLoading(false);
        } else if (propUser && propUser.name) {
            // اگر اطلاعات از props موجود است، loading را متوقف کن
            setAvatarLoading(false);
        } else {
            // در غیر این صورت، loading را فعال کن
            setAvatarLoading(true);
        }
    }, [authUser, propUser]);

    // محاسبه دقیق ارتفاع هدر (شامل PromoBar)
    useEffect(() => {
        // تابع محاسبه ارتفاع دقیق هدر و PromoBar
        const calculateHeaderHeight = () => {
            // سعی در یافتن هدر با انتخابگرهای مختلف
            const header = document.querySelector('header') ||
                document.querySelector('.MuiAppBar-root') ||
                document.querySelector('[role="banner"]');
            
            const promoBar = document.querySelector('[data-testid="promo-bar"]');

            // چاپ اطلاعات برای دیباگ
            //('Header element found:', header);

            let totalHeight = 60; // ارتفاع پیش‌فرض
            
            if (header) {
                const headerRect = header.getBoundingClientRect();
                totalHeight = headerRect.height;
                //('Header height calculated:', totalHeight);
            }
            
            // اگر پرومو بار بسته نشده و وجود دارد، ارتفاع آن را اضافه کن
            if (promoBar && !promoBarClosed) {
                const promoRect = promoBar.getBoundingClientRect();
                totalHeight += promoRect.height;
                //('PromoBar height added:', promoRect.height);
            }
            
            setHeaderHeight(totalHeight);
            //('Total header height:', totalHeight);
        };

        // محاسبه اولیه ارتفاع
        calculateHeaderHeight();

        // هنگام اسکرول یا تغییر سایز پنجره، ارتفاع دوباره محاسبه شود
        const handleResize = () => calculateHeaderHeight();
        const handleScroll = () => calculateHeaderHeight();

        if (typeof window !== 'undefined') {
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
        }
    }, [open, promoBarClosed]);

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
        avatar: authUser?.profile_picture || propUser?.avatar || '',
        role: authUser?.user_type || propUser?.role || '',
    };

    // بررسی نوع کاربر
    const isEmployer = currentUser.role === 'EM' || currentUser.role === 'employer';
    const isJobSeeker = currentUser.role === 'JS' || currentUser.role === 'jobseeker' || authUser?.user_type === 'JS';
    const isAdmin = currentUser.role === 'AD' || currentUser.role === 'SU' ||
        (authUser as any)?.is_staff === true || (authUser as any)?.is_admin === true ||
        (authUser as any)?.is_superuser === true;



    // تعیین تم رنگی بر اساس نوع کاربر
    const getUserTheme = () => {
        if (isAdmin) return ADMIN_THEME;
        if (isEmployer) return EMPLOYER_THEME;
        return JOB_SEEKER_THEME;
    };

    const userTheme = getUserTheme();

    // تبدیل نوع کاربر به فارسی
    const getUserRoleText = () => {
        if (isAdmin) return 'مدیریت';
        if (isEmployer) return 'کارفرما';
        return 'کارجو';
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
    const UserDefaultAvatar = ({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) => {
        const iconSize = size === 'small' ? '0.9rem' : size === 'large' ? '2rem' : '1.2rem';
        return (
            <FontAwesomeIcon
                icon={faUser}
                style={{
                    fontSize: iconSize,
                    color: '#fff',
                }}
            />
        );
    };

    // بررسی اینکه آیا در صفحه‌ای هستیم که آیتم منو با آن تطبیق دارد
    const isActiveMenuItem = (path: string) => {
        if (path === pathname) return true;
        
        // برای صفحه آگهی‌ها - فقط اگر در صفحه لیست آگهی‌ها باشیم
        if (path === '/employer/jobs') {
            // اگر در صفحه ایجاد آگهی باشیم، آگهی‌های من فعال نشود
            if (pathname === '/employer/jobs/create') return false;
            // فقط برای صفحات جزئیات و ویرایش آگهی فعال شود
            if (pathname?.startsWith('/employer/jobs/') && !pathname.includes('/create')) return true;
        }
        
        if (path === '/employer/applications' && pathname?.startsWith('/employer/applications/')) return true;
        
        // اضافه کردن حالت هش برای پنل ادمین
        if (path.includes('#') && pathname === '/admin') {
            const pathHash = path.split('#')[1];
            const currentHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
            return pathHash === currentHash;
        }
        
        return false;
    };

    // بررسی اینکه آیا یک زیرمنو باید باز باشد
    const shouldSubmenuBeOpen = (item: any) => {
        if (!item.hasSubmenu || !item.submenu) return false;
        return item.submenu.some((subItem: any) => isActiveMenuItem(subItem.path));
    };

    // تغییر وضعیت زیرمنو
    const toggleSubmenu = (itemTitle: string) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [itemTitle]: !prev[itemTitle]
        }));
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
                    {avatarLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Skeleton 
                                variant="circular" 
                                width={40} 
                                height={40} 
                                animation="wave"
                                sx={{
                                    bgcolor: 'rgba(0,0,0,0.1)',
                                    '&::after': {
                                        background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
                                    }
                                }}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Skeleton 
                                    variant="text" 
                                    width={60} 
                                    height={16} 
                                    animation="wave"
                                    sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
                                />
                                <Skeleton 
                                    variant="rounded" 
                                    width={40} 
                                    height={16} 
                                    animation="wave"
                                    sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <>
                            <Avatar
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                sx={{
                                    width: { xs: 36, md: 40 },
                                    height: { xs: 36, md: 40 },
                                    bgcolor: userTheme.primary,
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                                    boxShadow: `0 2px 6px ${userTheme.primary}40`,
                                    border: `2px solid ${userTheme.light}80`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    mr: 0,
                                    transition: 'all 0.3s ease',
                                    order: -1,
                                    '&:hover': {
                                        boxShadow: `0 3px 8px ${userTheme.primary}60`,
                                        border: `2px solid ${userTheme.light}`,
                                    }
                                }}
                            >
                                <UserDefaultAvatar size="small" />
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
                                        fontWeight: 400,
                                        color: userTheme.dark,
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
                                    background: `linear-gradient(90deg, ${userTheme.primary}, ${userTheme.light})`,
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
                                        {getUserRoleText()}
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </Tooltip>

            {/* منوی کاربر یکپارچه برای همه حالت‌ها */}
            <Drawer
                disableScrollLock
                anchor="right"
                open={open}
                onClose={handleClose}
                variant="temporary"
                elevation={16}
                PaperProps={{
                    sx: {
                        width: { xs: 280, sm: 320, md: 350 },
                        height: { xs: '100vh', md: `calc(100vh - ${headerHeight - 8}px)` }, // استفاده از 100vh در موبایل
                        top: { xs: 0, md: `${headerHeight - 8}px` }, // شروع از بالای صفحه در موبایل
                        zIndex: 1200,
                        boxShadow: '-4px 0px 15px rgba(0,0,0,0.1)',
                        borderLeft: 'none',
                        borderRadius: 0,
                        padding: 0,
                        margin: 0,
                        position: 'fixed',
                        display: 'flex',
                        flexDirection: 'column' // اضافه کردن flexbox
                    }
                }}
                sx={{
                    '& .MuiBackdrop-root': {
                        top: { xs: 0, md: `${headerHeight - 8}px` }, // align backdrop too
                        backgroundColor: 'rgba(0,0,0,0.3)'
                    }
                }}
            >
                {/* هدر منو - اطلاعات کاربر */}
                <Box sx={{
                    p: { xs: 1.5, md: 1.5 },
                    pt: { xs: 2, md: 1.5 }, // کاهش padding top
                    borderBottom: 'none',
                    background: isAdmin 
                        ? `linear-gradient(135deg, ${userTheme.primary}15, ${userTheme.primary}08)`
                        : isEmployer
                        ? `linear-gradient(135deg, #1976d215, #1976d208)`
                        : `linear-gradient(135deg, #2e7d3215, #2e7d3208)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isAdmin 
                            ? `radial-gradient(circle at 30% 20%, ${userTheme.primary}10 0%, transparent 50%),
                               radial-gradient(circle at 70% 80%, ${userTheme.primary}08 0%, transparent 50%)`
                            : isEmployer
                            ? `radial-gradient(circle at 30% 20%, #1976d210 0%, transparent 50%),
                               radial-gradient(circle at 70% 80%, #1976d208 0%, transparent 50%)`
                            : `radial-gradient(circle at 30% 20%, #2e7d3210 0%, transparent 50%),
                               radial-gradient(circle at 70% 80%, #2e7d3208 0%, transparent 50%)`,
                        pointerEvents: 'none'
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '1px',
                        background: isAdmin 
                            ? `linear-gradient(90deg, transparent, ${userTheme.primary}20, transparent)`
                            : isEmployer
                            ? `linear-gradient(90deg, transparent, #1976d220, transparent)`
                            : `linear-gradient(90deg, transparent, #2e7d3220, transparent)`,
                        pointerEvents: 'none'
                    }
                }}>
                    {/* دکمه بستن منو در گوشه بالا سمت چپ */}
                    <IconButton
                        onClick={handleClose}
                        aria-label="بستن منو"
                        sx={{
                            position: 'absolute',
                            top: { xs: 8, md: 12 },
                            left: { xs: 8, md: 12 },
                            bgcolor: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            width: { xs: 32, md: 36 },
                            height: { xs: 32, md: 36 },
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,1)',
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faTimes}
                            style={{ 
                                fontSize: '0.8rem', 
                                color: isAdmin 
                                    ? userTheme.primary 
                                    : isEmployer 
                                    ? '#1976d2' 
                                    : '#2e7d32' 
                            }}
                        />
                    </IconButton>

                    {menuLoading ? (
                        <>
                            <Skeleton variant="circular" width={60} height={60} animation="wave" />
                            <Skeleton variant="text" width={150} height={24} animation="wave" sx={{ mt: 1 }} />
                            <Skeleton variant="text" width={120} height={20} animation="wave" sx={{ mt: 0.5 }} />
                            <Skeleton variant="rounded" width={100} height={24} animation="wave" sx={{ mt: 1 }} />
                        </>
                    ) : (
                        <>
                            {/* آواتار کاربر با افکت‌های مدرن */}
                            <Box sx={{
                                position: 'relative',
                                mb: { xs: 0.5, md: 1 },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -6,
                                    left: -6,
                                    right: -6,
                                    bottom: -6,
                                    background: isAdmin 
                                        ? `linear-gradient(45deg, ${userTheme.primary}30, ${userTheme.primary}10)`
                                        : isEmployer
                                        ? `linear-gradient(45deg, #1976d230, #1976d210)`
                                        : `linear-gradient(45deg, #2e7d3230, #2e7d3210)`,
                                    borderRadius: '50%',
                                    zIndex: -1,
                                    animation: 'pulse 2s infinite'
                                }
                            }}>
                                <Avatar
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    sx={{
                                        width: { xs: 48, md: 52 },
                                        height: { xs: 48, md: 52 },
                                        bgcolor: isAdmin 
                                            ? userTheme.primary 
                                            : isEmployer 
                                            ? '#1976d2' 
                                            : '#2e7d32',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: { xs: '1.2rem', md: '1.4rem' },
                                        boxShadow: isAdmin 
                                            ? `0 6px 24px ${userTheme.primary}40`
                                            : isEmployer
                                            ? '0 6px 24px #1976d240'
                                            : '0 6px 24px #2e7d3240',
                                        border: `3px solid rgba(255,255,255,0.9)`,
                                        backdropFilter: 'blur(10px)',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    <UserDefaultAvatar size="large" />
                                </Avatar>
                            </Box>

                            {/* نام کاربر */}
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    color: isAdmin 
                                        ? userTheme.primary 
                                        : isEmployer 
                                        ? '#1976d2' 
                                        : '#2e7d32',
                                    mb: { xs: 0.25, md: 0.5 },
                                    textAlign: 'center',
                                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                            >
                                {currentUser.name || 'کاربر'}
                            </Typography>

                            {/* شماره تلفن با آیکون */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: { xs: 0.5, md: 1 },
                                p: { xs: 0.75, md: 1 },
                                bgcolor: 'rgba(255,255,255,0.7)',
                                borderRadius: 3,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                minWidth: { xs: 160, md: 180 },
                                justifyContent: 'center'
                            }}>
                                <FontAwesomeIcon
                                    icon={faPhone}
                                    style={{
                                        fontSize: '0.8rem',
                                        color: isAdmin 
                                            ? userTheme.primary 
                                            : isEmployer 
                                            ? '#1976d2' 
                                            : '#2e7d32',
                                        opacity: 0.8
                                    }}
                                    className="fa-phone-icon"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{
                                    direction: 'rtl',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                }}>
                                    {currentUser.phone ? convertToPersianNumbers(currentUser.phone) : 'شماره تلفن نامشخص'}
                                </Typography>
                            </Box>

                            {/* برچسب نقش کاربر */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isAdmin 
                                    ? `linear-gradient(90deg, ${userTheme.primary}, ${userTheme.light})`
                                    : isEmployer
                                    ? 'linear-gradient(90deg, #1976d2, #42a5f5)'
                                    : 'linear-gradient(90deg, #2e7d32, #4caf50)',
                                borderRadius: '4px',
                                px: { xs: 1.5, md: 2 },
                                py: { xs: 0.6, md: 0.8 },
                                minWidth: { xs: '60px', md: '70px' },
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.7rem',
                                        lineHeight: 1.2,
                                        color: '#fff',
                                        fontWeight: 400
                                    }}
                                >
                                    {getUserRoleText()}
                                </Typography>
                            </Box>
                        </>
                    )}
                </Box>

                {/* CSS برای responsive icon */}
                <style jsx>{`
                    .fa-phone-icon {
                        font-size: 0.8rem;
                    }
                    @media (min-width: 768px) {
                        .fa-phone-icon {
                            font-size: 0.9rem;
                        }
                    }
                `}</style>

                {/* آیتم‌های منو برای ادمین */}
                {isAdmin && !menuLoading && (
                    <Box sx={{ 
                        py: 1.5, 
                        px: 1, 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden' // برای کنترل اسکرول
                    }}>
                        {/* دسترسی سریع - فقط در حالت دسکتاپ */}
                        {!isMobile && (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 1, fontWeight: 400, fontSize: '0.75rem' }}>
                                    دسترسی سریع مدیریت
                                </Typography>

                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, px: 1.5, mb: 2.5 }}>
                                    {adminMenuItems.slice(0, 4).map((item, index) => {
                                        const colorConfigs = [
                                            { bg: '#e3f2fd', text: '#1976d2' }, // primary
                                            { bg: '#f3e5f5', text: '#7b1fa2' }, // secondary
                                            { bg: '#e8f5e8', text: '#2e7d32' }, // success
                                            { bg: '#fff3e0', text: '#f57c00' }, // warning
                                        ];
                                        const colorConfig = colorConfigs[index % 4];
                                        
                                        return (
                                        <MenuItem
                                            key={index}
                                            component={Link}
                                            href={item.path}
                                            onClick={(e) => {
                                                console.log('Clicked on quick access:', item.path);
                                                handleClose();
                                                if (item.path.includes('#')) {
                                                    const hash = item.path.split('#')[1];
                                                    if (typeof window !== 'undefined') {
                                                        window.location.hash = hash;
                                                    }
                                                } else if (item.path === '/admin') {
                                                    // برای پنل مدیریت، هش را پاک کرده و رویداد ارسال کنیم
                                                    if (typeof window !== 'undefined') {
                                                        window.location.hash = '';
                                                        window.dispatchEvent(new HashChangeEvent('hashchange'));
                                                    }
                                                }
                                            }}
                                            sx={{
                                                    borderRadius: 2,
                                                    p: 2,
                                                width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    bgcolor: 'background.paper',
                                                    border: `1px solid ${colorConfig.bg}`,
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                        borderColor: colorConfig.text,
                                                    },
                                                }}
                                            >
                                                <Box sx={{ flex: 1, textAlign: 'left' }}>
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        sx={{ 
                                                            fontSize: '0.85rem',
                                                            color: 'text.primary',
                                                            fontWeight: 400
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: colorConfig.bg,
                                                        color: colorConfig.text,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                            }}
                                        >
                                            {item.icon ? (
                                                <FontAwesomeIcon
                                                    icon={item.icon}
                                                            style={{ fontSize: '1.2rem' }}
                                                />
                                            ) : item.title === 'اشتراک‌ها' ? (
                                                <Box
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                                fontWeight: 'normal'
                                                    }}
                                                >
                                                    نردبان
                                                </Box>
                                            ) : null}
                                                </Box>
                                        </MenuItem>
                                        );
                                    })}
                                </Box>
                            </>
                        )}

                        {/* منوی کامل - فقط در حالت موبایل (با آکاردئون مشابه دسکتاپ) */}
                        {isMobile && (
                            <Box sx={{ 
                                flexGrow: 1,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                '&::-webkit-scrollbar': { width: 4 },
                                '&::-webkit-scrollbar-track': { background: 'transparent' },
                                '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: 2 },
                            }}>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 0.5, fontWeight: 500 }}>
                                    منوی کامل مدیریت
                                </Typography>

                                {(() => {
                                    const dashboardItem = adminMenuItems.find(i => i.path === '/admin');
                                    const managementItems = adminMenuItems.filter(i => i.group === 'user-management');
                                    const otherItems = adminMenuItems.filter(i => i.group !== 'user-management' && i.path !== '/admin');

                                    return (
                                        <List sx={{ py: 0 }}>
                                            {/* داشبورد */}
                                            {dashboardItem && (
                                                <ListItem disablePadding>
                                                    <ListItemButton
                                                        component={Link}
                                                        href={dashboardItem.path}
                                                        onClick={() => {
                                                            handleClose();
                                                            if (typeof window !== 'undefined') {
                                                                window.location.hash = '';
                                                                window.dispatchEvent(new HashChangeEvent('hashchange'));
                                                            }
                                                        }}
                                                        selected={isActiveMenuItem(dashboardItem.path)}
                                                        sx={{ mx: 1, mb: 0.5, borderRadius: 2 }}
                                                    >
                                                        <ListItemIcon sx={{ minWidth: 40, color: isActiveMenuItem(dashboardItem.path) ? ADMIN_THEME.primary : 'text.secondary' }}>
                                                            <FontAwesomeIcon icon={dashboardItem.icon as any} style={{ fontSize: '1.1rem' }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary={dashboardItem.title} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActiveMenuItem(dashboardItem.path) ? 'bold' : 'normal' }} />
                                                    </ListItemButton>
                                                </ListItem>
                                            )}

                                            {/* هدر آکاردئون مدیریت کاربران */}
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => setOpenAdminManagement(p => !p)} sx={{ mx: 1, mb: 0.5, borderRadius: 2 }}>
                                                    <ListItemIcon sx={{ minWidth: 40, color: ADMIN_THEME.primary }}>
                                                        <FontAwesomeIcon icon={faUsers} style={{ fontSize: '1.1rem' }} />
                                                    </ListItemIcon>
                                                    <ListItemText primary="مدیریت کاربران" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold', color: ADMIN_THEME.primary }} />
                                                    <FontAwesomeIcon icon={openAdminManagement ? faChevronUp : faChevronDown} style={{ fontSize: '0.9rem', color: ADMIN_THEME.primary }} />
                                                </ListItemButton>
                                            </ListItem>

                                            {/* آیتم‌های داخل آکاردئون */}
                                            <Collapse in={openAdminManagement} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {managementItems.map((item, idx) => (
                                                        <ListItem key={idx} disablePadding>
                                                            <ListItemButton
                                                                component={Link}
                                                                href={item.path}
                                                                onClick={() => {
                                                                    handleClose();
                                                                    if (item.path.includes('#') && typeof window !== 'undefined') {
                                                                        window.location.hash = item.path.split('#')[1];
                                                                    }
                                                                }}
                                                                selected={isActiveMenuItem(item.path)}
                                                                sx={{ mx: 2.5, mb: 0.5, borderRadius: 2 }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 36, color: isActiveMenuItem(item.path) ? ADMIN_THEME.primary : 'text.secondary' }}>
                                                                    {item.icon ? (
                                                                        <FontAwesomeIcon icon={item.icon as any} style={{ fontSize: '1rem' }} />
                                                                    ) : (
                                                                        <Box sx={{ width: 32, height: 20, borderRadius: 0.5, bgcolor: isActiveMenuItem(item.path) ? ADMIN_THEME.primary : 'text.secondary', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                                                            نردبان
                                                                        </Box>
                                                                    )}
                                                                </ListItemIcon>
                                                                {/* شمارنده در آگهی‌ها */}
                                                                {item.path === '/admin#jobs' && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 18, px: 0.8, mr: 2, borderRadius: 5, fontWeight: 'bold', fontSize: '0.7rem', ...(jobStats?.pendingJobs && jobStats.pendingJobs > 0 ? { bgcolor: '#ffe0b2', border: '1.2px solid #ff9800', color: '#ff6d00' } : { bgcolor: 'transparent', border: '1px solid #e0e0e0', color: '#757575' }) }}>
                                                                        {jobStatsLoading ? <Skeleton variant="rectangular" width={16} height={12} sx={{ borderRadius: 1 }} /> : (jobStats?.pendingJobs && jobStats.pendingJobs > 0 ? (jobStats.pendingJobs > 99 ? '+99' : jobStats.pendingJobs.toLocaleString('fa-IR')) : '۰')}
                                                                    </Box>
                                                                )}
                                                                <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActiveMenuItem(item.path) ? 'bold' : 'normal' }} />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Collapse>

                                            {/* سایر آیتم‌ها */}
                                            {otherItems.map((item, idx) => (
                                                <ListItem key={idx} disablePadding>
                                                    <ListItemButton
                                                        component={Link}
                                                        href={item.path}
                                                        onClick={() => {
                                                            handleClose();
                                                            if (item.path.includes('#') && typeof window !== 'undefined') {
                                                                window.location.hash = item.path.split('#')[1];
                                                            }
                                                        }}
                                                        selected={isActiveMenuItem(item.path)}
                                                        sx={{ mx: 1, mb: 0.5, borderRadius: 2 }}
                                                    >
                                                        <ListItemIcon sx={{ minWidth: 40, color: isActiveMenuItem(item.path) ? ADMIN_THEME.primary : 'text.secondary' }}>
                                                            <FontAwesomeIcon icon={item.icon as any} style={{ fontSize: '1.1rem' }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActiveMenuItem(item.path) ? 'bold' : 'normal' }} />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}

                                            {/* خروج از حساب داخل همین بخش */}
                                            <Divider sx={{ my: 1.5 }} />
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => { authLogout(); handleClose(); }}
                                                    sx={{ mx: 1, mb: 1, borderRadius: 2, color: 'error.main', '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' } }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                                        <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: '1.1rem' }} />
                                                    </ListItemIcon>
                                                    <ListItemText primary="خروج از حساب" />
                                                </ListItemButton>
                                            </ListItem>
                                        </List>
                                    );
                                })()}
                            </Box>
                        )}

                        {/* دکمه خروج از حساب کاربری - در هر دو حالت موبایل و دسکتاپ (پنهان در ادمین موبایل، چون بالاتر اضافه شده) */}
                        {!(isAdmin && isMobile) && (
                        <Box sx={{ 
                            px: 1, 
                            pt: 2, 
                            pb: { xs: 2, md: 1 }, // اضافه کردن padding bottom در موبایل
                            flexShrink: 0,
                            mt: 'auto', // برای قرار دادن در پایین
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '80%',
                                height: '1px',
                                background: isAdmin 
                                    ? `linear-gradient(90deg, transparent, ${userTheme.primary}20, transparent)`
                                    : isEmployer
                                    ? 'linear-gradient(90deg, transparent, #1976d220, transparent)'
                                    : 'linear-gradient(90deg, transparent, #2e7d3220, transparent)'
                            }
                        }}>
                            <ListItemButton
                                onClick={() => {
                                    console.log('Logout clicked');
                                    authLogout();
                                    handleClose();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    color: 'error.main',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'error.light',
                                        color: 'error.contrastText',
                                        transform: 'scale(1.02)',
                                        transition: 'all 0.2s ease',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <FontAwesomeIcon
                                        icon={faSignOutAlt}
                                        style={{
                                            fontSize: '1.1rem',
                                            color: 'inherit'
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary="خروج از حساب"
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500
                                    }}
                                />
                            </ListItemButton>
                        </Box>
                        )}
                    </Box>
                )}

                {/* آیتم‌های منو برای کارفرما */}
                {isEmployer && !isAdmin && !menuLoading && (
                    <Box sx={{ py: 1.5, px: 1, flexGrow: 1 }}>
                        {/* دسترسی سریع - در حالت دسکتاپ */}
                        {!isMobile && (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 1, fontWeight: 400, fontSize: '0.75rem' }}>
                                    دسترسی سریع
                                </Typography>

                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, px: 1.5, mb: 2.5 }}>
                                    <MenuItem
                                        component={Link}
                                        href="/employer/dashboard"
                                        onClick={handleClose}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            borderRadius: 3,
                                            boxShadow: '0 4px 15px rgba(66,133,244,0.05)',
                                            height: 80,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${EMPLOYER_THEME.primary}`,
                                            transition: 'all 0.25s ease',
                                            bgcolor: 'background.paper',
                                            '&:hover': {
                                                boxShadow: '0 6px 18px rgba(66,133,244,0.12)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontSize: '1rem',
                                                color: EMPLOYER_THEME.primary,
                                                fontWeight: 700
                                            }}
                                        >
                                            داشبورد
                                        </Typography>
                                    </MenuItem>

                                    <MenuItem
                                        component={Link}
                                        href="/employer/jobs/create"
                                        onClick={handleClose}
                                        sx={{
                                            p: 0,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            height: 80,
                                            transition: 'all 0.25s ease',
                                            boxShadow: '0 4px 18px rgba(66,133,244,0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `linear-gradient(135deg, ${EMPLOYER_THEME.primary} 0%, ${EMPLOYER_THEME.light} 100%)`,
                                            '&:hover': {
                                                boxShadow: '0 6px 24px rgba(66,133,244,0.35)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography 
                                            fontWeight="normal" 
                                            sx={{ 
                                                fontSize: '0.9rem',
                                                color: '#ffffff', 
                                                textAlign: 'center', 
                                                lineHeight: 1.8,
                                                fontWeight: 800
                                            }}
                                        >
                                            ثبت آگهی استخدامی
                                        </Typography>
                                    </MenuItem>
                                </Box>
                            </>
                        )}

                        {/* گزینه‌های سایدبار پنل کارفرما - فقط در حالت موبایل */}
                        {isMobile && (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 1, fontWeight: 400, fontSize: '0.75rem' }}>
                                    پنل کارفرما
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1.5, mb: 2 }}>
                                    {employerMenuItems.map((item, index) => {
                                        const active = isActiveMenuItem(item.path);
                                        return (
                                            <MenuItem
                                                key={index}
                                                component={Link}
                                                href={item.path}
                                                onClick={handleClose}
                                                sx={{
                                                    borderRadius: 1,
                                                    py: 1,
                                                    px: 2,
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    bgcolor: active ? 'rgba(0,168,107,0.08)' : 'transparent',
                                                    transition: 'all 0.15s ease',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(0,168,107,0.06)',
                                                    }
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={item.icon}
                                                    style={{
                                                        fontSize: '1.1rem',
                                                        width: '20px',
                                                        textAlign: 'center',
                                                        color: active ? EMPLOYER_THEME.primary : theme.palette.text.secondary,
                                                        transition: 'color 0.2s ease'
                                                    }}
                                                />
                                                <Typography 
                                                    variant="body2" 
                                                    fontWeight={active ? 'bold' : 500} 
                                                    sx={{ 
                                                        fontSize: '0.9rem', 
                                                        color: active ? EMPLOYER_THEME.primary : 'text.secondary' 
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>
                                            </MenuItem>
                                        );
                                    })}
                                </Box>
                            </>
                                        )}



                {/* منوی کامل - فقط در حالت دسکتاپ */}
                        {!isMobile && (
                            <>
                                <Box sx={{
                                    position: 'relative',
                                    my: 2,
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: '50%',
                                        top: 0,
                                        transform: 'translateX(-50%)',
                                        width: '60%',
                                        height: '1px',
                                        background: `linear-gradient(90deg, transparent, ${EMPLOYER_THEME.primary}30, transparent)`
                                    }
                                }} />
                                
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 1, fontWeight: 500, fontSize: '0.75rem' }}>
                                    مدیریت
                                </Typography>

                                <List sx={{ px: 1, width: '100%', pb: 1.5 }}>
                                    <ListItem sx={{ p: 0.25 }}>
                                        <ListItemButton 
                                            component={Link}
                                            href="/employer/jobs"
                                            onClick={handleClose}
                                            selected={isActiveMenuItem('/employer/jobs')}
                                            sx={{
                                                borderRadius: 1,
                                                py: 0.75,
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
                                                minWidth: 56,
                                                color: isActiveMenuItem('/employer/jobs') ? EMPLOYER_THEME.primary : 'text.secondary',
                                            }}>
                                                <FontAwesomeIcon 
                                                    icon={faListAlt} 
                                                    style={{ fontSize: '1.1rem' }} 
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="آگهی‌های من"
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActiveMenuItem('/employer/jobs') ? 'bold' : 'normal'
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem sx={{ p: 0.25 }}>
                                        <ListItemButton 
                                            component={Link}
                                            href="/employer/applications"
                                            onClick={handleClose}
                                            selected={isActiveMenuItem('/employer/applications')}
                                            sx={{
                                                borderRadius: 1,
                                                py: 0.75,
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
                                                minWidth: 56,
                                                color: isActiveMenuItem('/employer/applications') ? EMPLOYER_THEME.primary : 'text.secondary',
                                            }}>
                                                <FontAwesomeIcon 
                                                    icon={faClipboardList} 
                                                    style={{ fontSize: '1.1rem' }} 
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="درخواست‌های کاریابی"
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActiveMenuItem('/employer/applications') ? 'bold' : 'normal'
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem sx={{ p: 0.25 }}>
                                        <ListItemButton 
                                            component={Link}
                                            href="/employer/profile"
                                            onClick={handleClose}
                                            selected={isActiveMenuItem('/employer/profile')}
                                            sx={{
                                                borderRadius: 1,
                                                py: 0.75,
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
                                                minWidth: 56,
                                                color: isActiveMenuItem('/employer/profile') ? EMPLOYER_THEME.primary : 'text.secondary',
                                            }}>
                                                <FontAwesomeIcon 
                                                    icon={faUser} 
                                                    style={{ fontSize: '1.1rem' }} 
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="پروفایل"
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActiveMenuItem('/employer/profile') ? 'bold' : 'normal'
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </>
                        )}

                        {/* دکمه خروج از حساب کاربری - در هر دو حالت موبایل و دسکتاپ */}
                        <Box sx={{ 
                            px: 1, 
                            pt: 2, 
                            pb: { xs: 2, md: 1 }, // اضافه کردن padding bottom در موبایل
                            borderTop: '1px solid', 
                            borderColor: 'divider', 
                            flexShrink: 0 
                        }}>
                            <ListItemButton
                                onClick={() => {
                                    console.log('Logout clicked'); // برای دیباگ
                                    authLogout();
                                    handleClose();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    color: 'error.main',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'error.light',
                                        color: 'error.contrastText',
                                        transform: 'scale(1.02)',
                                        transition: 'all 0.2s ease',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <FontAwesomeIcon
                                        icon={faSignOutAlt}
                                        style={{
                                            fontSize: '1.1rem',
                                            color: 'inherit'
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary="خروج از حساب"
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500
                                    }}
                                />
                            </ListItemButton>
                        </Box>
                    </Box>
                )}

                {/* آیتم‌های منو برای کارجو */}
                {isJobSeeker && !isAdmin && !menuLoading && (
                    <Box sx={{ py: 1.5, px: 1, flexGrow: 1 }}>
                        {/* دسترسی سریع - در حالت دسکتاپ */}
                        {!isMobile && (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 1, fontWeight: 400, fontSize: '0.75rem' }}>
                                    دسترسی سریع
                                </Typography>

                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, px: 1.5, mb: 2.5 }}>
                                    <MenuItem
                                        component={Link}
                                        href="/jobseeker/dashboard"
                                        onClick={handleClose}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            borderRadius: 3,
                                            boxShadow: '0 4px 15px rgba(10,155,84,0.05)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${JOB_SEEKER_THEME.primary}`,
                                            transition: 'all 0.25s ease',
                                            bgcolor: 'background.paper',
                                            '&:hover': {
                                                boxShadow: '0 6px 18px rgba(10,155,84,0.12)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTachometerAlt}
                                            style={{
                                                fontSize: '1.5rem', 
                                                color: JOB_SEEKER_THEME.primary,
                                                marginBottom: '8px' 
                                            }}
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontSize: '0.85rem',
                                                color: 'text.primary',
                                                fontWeight: 400
                                            }}
                                        >
                                            داشبورد
                                        </Typography>
                                    </MenuItem>

                                    <MenuItem
                                        component={Link}
                                        href="/jobseeker/resume-ads/create"
                                        onClick={handleClose}
                                        sx={{
                                            p: 0,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            height: '100%',
                                            transition: 'all 0.25s ease',
                                            boxShadow: '0 4px 18px rgba(10,155,84,0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `linear-gradient(135deg, ${JOB_SEEKER_THEME.primary} 0%, ${JOB_SEEKER_THEME.light} 100%)`,
                                            '&:hover': {
                                                boxShadow: '0 6px 24px rgba(10,155,84,0.35)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography 
                                            fontWeight="normal" 
                                            sx={{ 
                                                fontSize: '0.9rem',
                                                color: '#ffffff', 
                                                textAlign: 'center', 
                                                lineHeight: 1.8,
                                                fontWeight: 800
                                            }}
                                        >
                                            ایجاد آگهی رزومه
                                        </Typography>
                                    </MenuItem>
                                </Box>
                            </>
                        )}

                        {/* گزینه‌های سایدبار پنل کارجو - فقط در حالت موبایل */}
                        {isMobile && (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 1, fontWeight: 400, fontSize: '0.75rem' }}>
                                    پنل کارجو
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1.5, mb: 2 }}>
                                    {jobSeekerMenuItems.map((item, index) => {
                                        const active = isActiveMenuItem(item.path);
                                        return (
                                            <Box key={index}>
                                                {/* آیتم اصلی منو */}
                                                <MenuItem
                                                    component={item.hasSubmenu ? 'div' : Link}
                                                    href={!item.hasSubmenu ? item.path : undefined}
                                                    onClick={item.hasSubmenu ? () => toggleSubmenu(item.title) : handleClose}
                                                    sx={{
                                                        borderRadius: 1,
                                                        py: 1,
                                                        px: 2,
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        bgcolor: active ? 'rgba(10, 155, 84, 0.08)' : 'transparent',
                                                        transition: 'all 0.15s ease',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(10, 155, 84, 0.06)',
                                                        }
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={item.icon}
                                                        style={{
                                                            fontSize: '1.1rem',
                                                            width: '20px',
                                                            textAlign: 'center',
                                                            color: active ? '#0a9b54' : theme.palette.text.secondary,
                                                            transition: 'color 0.2s ease'
                                                        }}
                                                    />
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight={active ? 'bold' : 500} 
                                                        sx={{ 
                                                            fontSize: '0.9rem', 
                                                            color: active ? '#0a9b54' : 'text.secondary',
                                                            flexGrow: 1
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Typography>
                                                    {item.hasSubmenu && (
                                                        <FontAwesomeIcon 
                                                            icon={openSubmenus[item.title] || shouldSubmenuBeOpen(item) ? faChevronUp : faChevronDown} 
                                                            style={{ fontSize: '0.8rem', color: '#0a9b54' }} 
                                                        />
                                                    )}
                                                </MenuItem>

                                                {/* زیرمنو */}
                                                {item.hasSubmenu && item.submenu && (
                                                    <Collapse in={openSubmenus[item.title] || shouldSubmenuBeOpen(item)} timeout="auto" unmountOnExit>
                                                        <Box sx={{ pl: 2 }}>
                                                            {item.submenu.map((subItem: any, subIndex: number) => {
                                                                const subActive = isActiveMenuItem(subItem.path);
                                                                return (
                                                                    <MenuItem
                                                                        key={subIndex}
                                                                        component={Link}
                                                                        href={subItem.path}
                                                                        onClick={handleClose}
                                                                        sx={{
                                                                            borderRadius: 1,
                                                                            py: 0.8,
                                                            px: 2,
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            bgcolor: subActive ? 'rgba(10, 155, 84, 0.06)' : 'transparent',
                                                            transition: 'all 0.15s ease',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(10, 155, 84, 0.04)',
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={subItem.icon}
                                                            style={{
                                                                fontSize: '1rem',
                                                                width: '18px',
                                                                textAlign: 'center',
                                                                color: subActive ? '#0a9b54' : theme.palette.text.secondary,
                                                                transition: 'color 0.2s ease'
                                                            }}
                                                        />
                                                        <Typography 
                                                            variant="body2" 
                                                            fontWeight={subActive ? 'bold' : 400} 
                                                            sx={{ 
                                                                fontSize: '0.85rem', 
                                                                color: subActive ? '#0a9b54' : 'text.secondary' 
                                                            }}
                                                        >
                                                            {subItem.title}
                                                        </Typography>
                                                    </MenuItem>
                                                );
                                            })}
                                        </Box>
                                    </Collapse>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </>
                                )}

                        {/* دکمه خروج برای کارجو - فقط در حالت موبایل */}
                        {isMobile && (
                            <Box sx={{ 
                                px: 1, 
                                pt: 2, 
                                pb: 2,
                                borderTop: '1px solid', 
                                borderColor: 'divider', 
                                flexShrink: 0 
                            }}>
                                <ListItemButton
                                    onClick={() => {
                                        console.log('Logout clicked');
                                        authLogout();
                                        handleClose();
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        color: 'error.main',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'error.light',
                                            color: 'error.contrastText',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                        <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: '1rem' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="خروج از حساب"
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: 'medium',
                                        }}
                                    />
                                </ListItemButton>
                            </Box>
                        )}

                        {/* منوی کامل کارجو - فقط در حالت دسکتاپ */}
                        {!isMobile && (
                            <>
                                <Box sx={{
                                    position: 'relative',
                                    my: 2,
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: '50%',
                                        top: 0,
                                        transform: 'translateX(-50%)',
                                        width: '60%',
                                        height: '1px',
                                        background: `linear-gradient(90deg, transparent, #0a9b5430, transparent)`
                                    }
                                }} />
                                
                                <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 0.5, fontWeight: 500 }}>
                                    مدیریت
                                </Typography>

                                <MenuItem component={Link} href="/jobseeker/resume" onClick={handleClose} sx={{
                                    py: 1.2,
                                    mx: 0.5,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#0a9b5410',
                                        transform: 'translateX(-2px)',
                                        '& .MuiListItemIcon-root': {
                                            color: '#0a9b54',
                                            transform: 'scale(1.1)',
                                        }
                                    }
                                }}>
                                    <ListItemIcon sx={{
                                        transition: 'all 0.2s ease',
                                        minWidth: '50px'
                                    }}>
                                        <FontAwesomeIcon icon={faFileAlt} style={{
                                            fontSize: '1rem',
                                            color: '#0a9b54'
                                        }} />
                                    </ListItemIcon>
                                    رزومه من
                                </MenuItem>

                                <MenuItem component={Link} href="/jobseeker/applications" onClick={handleClose} sx={{
                                    py: 1.2,
                                    mx: 0.5,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#0a9b5410',
                                        transform: 'translateX(-2px)',
                                        '& .MuiListItemIcon-root': {
                                            color: '#0a9b54',
                                            transform: 'scale(1.1)',
                                        }
                                    }
                                }}>
                                    <ListItemIcon sx={{
                                        transition: 'all 0.2s ease',
                                        minWidth: '50px'
                                    }}>
                                        <FontAwesomeIcon icon={faClipboardList} style={{
                                            fontSize: '1rem',
                                            color: '#0a9b54'
                                        }} />
                                    </ListItemIcon>
                                    درخواست‌های ارسالی
                                </MenuItem>

                                <MenuItem component={Link} href="/jobseeker/resume-ads" onClick={handleClose} sx={{
                                    py: 1.2,
                                    mx: 0.5,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#0a9b5410',
                                        transform: 'translateX(-2px)',
                                        '& .MuiListItemIcon-root': {
                                            color: '#0a9b54',
                                            transform: 'scale(1.1)',
                                        }
                                    }
                                }}>
                                    <ListItemIcon sx={{
                                        transition: 'all 0.2s ease',
                                        minWidth: '50px'
                                    }}>
                                        <FontAwesomeIcon icon={faBullhorn} style={{
                                            fontSize: '1rem',
                                            color: '#0a9b54'
                                        }} />
                                    </ListItemIcon>
                                    آگهی‌های رزومه
                                </MenuItem>

                                <Box sx={{
                                    position: 'relative',
                                    my: 1,
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: '50%',
                                        top: 0,
                                        transform: 'translateX(-50%)',
                                        width: '40%',
                                        height: '1px',
                                        background: `linear-gradient(90deg, transparent, #0a9b5420, transparent)`
                                    }
                                }} />

                                <MenuItem component={Link} href="/jobseeker/profile" onClick={handleClose} sx={{
                                    py: 1.2,
                                    mx: 0.5,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#0a9b5410',
                                        transform: 'translateX(-2px)',
                                        '& .MuiListItemIcon-root': {
                                            color: '#0a9b54',
                                            transform: 'scale(1.1)',
                                        }
                                    }
                                }}>
                                    <ListItemIcon sx={{
                                        transition: 'all 0.2s ease',
                                        minWidth: '50px'
                                    }}>
                                        <FontAwesomeIcon icon={faUser} style={{
                                            fontSize: '1rem',
                                            color: '#0a9b54'
                                        }} />
                                    </ListItemIcon>
                                    پروفایل
                                </MenuItem>

                                <Box sx={{
                                    position: 'relative',
                                    my: 1,
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: '50%',
                                        top: 0,
                                        transform: 'translateX(-50%)',
                                        width: '40%',
                                        height: '1px',
                                        background: `linear-gradient(90deg, transparent, #0a9b5420, transparent)`
                                    }
                                }} />

                                <MenuItem onClick={() => {
                                    console.log('Logout clicked');
                                    authLogout();
                                    handleClose();
                                }} sx={{
                                    py: 1.2,
                                    mx: 0.5,
                                    borderRadius: '8px',
                                    color: 'error.main',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'error.light',
                                        color: 'error.contrastText',
                                        transform: 'scale(1.02)',
                                        transition: 'all 0.2s ease',
                                    },
                                }}>
                                    <ListItemIcon sx={{
                                        transition: 'all 0.2s ease',
                                        minWidth: '50px',
                                        color: 'inherit'
                                    }}>
                                        <FontAwesomeIcon
                                            icon={faSignOutAlt}
                                            style={{
                                                fontSize: '1rem',
                                                color: 'inherit'
                                            }}
                                        />
                                    </ListItemIcon>
                                    خروج از حساب
                                </MenuItem>
                            </>
                        )}
                    </Box>
                )}

                {/* منوی غیر کارفرما و غیر ادمین */}
                {!isEmployer && !isJobSeeker && !isAdmin && !menuLoading && (
                    <Box sx={{ 
                        py: 1,
                        pb: { xs: 2, md: 1 } // اضافه کردن padding bottom در موبایل
                    }}>
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