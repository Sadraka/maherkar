'use client'

import { useState, MouseEvent } from 'react';
import {
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faSignOutAlt,
    faCog,
    faFileAlt,
    faBriefcase,
    faUserCircle
} from '@fortawesome/free-solid-svg-icons';

// تایپ‌های مورد نیاز
interface UserMenuProps {
    user?: {
        name?: string;
        email?: string;
        avatar?: string;
        role?: 'employer' | 'candidate' | 'admin';
    };
    isLoggedIn: boolean;
}

export default function UserMenu({ user, isLoggedIn }: UserMenuProps) {
    const theme = useTheme();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // مدیریت باز و بسته شدن منو
    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // مدیریت خروج از حساب کاربری
    const handleLogout = () => {
        // اینجا منطق لاگ‌اوت را پیاده‌سازی کنید
        // مثلاً: clearAuth(), removeToken() و غیره
        handleClose();
        router.push('/login');
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
                        transition: 'all 0.25s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            '& .icon': {
                                color: theme.palette.primary.dark
                            }
                        }
                    }}
                >
                    <FontAwesomeIcon
                        icon={faUser}
                        className="icon"
                        style={{
                            fontSize: '1.3rem',
                            width: '22px',
                            height: '22px',
                            color: theme.palette.primary.main,
                            transition: 'all 0.25s ease'
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
                        '&:hover': {
                            transform: 'scale(1.05)',
                            border: `2px solid ${theme.palette.primary.dark}`,
                        }
                    }}
                >
                    {user?.avatar ? (
                        <Avatar
                            src={user.avatar}
                            alt={user.name || 'کاربر'}
                            sx={{
                                width: { xs: 32, md: 38 },
                                height: { xs: 32, md: 38 },
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: { xs: 32, md: 38 },
                                height: { xs: 32, md: 38 },
                                bgcolor: theme.palette.primary.main,
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '1rem'
                            }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : (
                                <FontAwesomeIcon
                                    icon={faUserCircle}
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
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        minWidth: 220,
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
                            width: 10,
                            height: 10,
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
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {user?.name || 'کاربر ماهرکار'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {user?.email || 'user@example.com'}
                    </Typography>
                </Box>

                <Divider />

                {/* آیتم‌های منو */}
                <MenuItem component={Link} href="/profile" onClick={handleClose} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <FontAwesomeIcon icon={faUser} style={{ fontSize: '1rem', color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    مشاهده پروفایل
                </MenuItem>

                {user?.role === 'candidate' && (
                    <MenuItem component={Link} href="/resume" onClick={handleClose} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '1rem', color: theme.palette.candidate.main }} />
                        </ListItemIcon>
                        رزومه من
                    </MenuItem>
                )}

                {user?.role === 'employer' && (
                    <MenuItem component={Link} href="/dashboard/jobs" onClick={handleClose} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '1rem', color: theme.palette.employer.main }} />
                        </ListItemIcon>
                        آگهی‌های من
                    </MenuItem>
                )}

                <MenuItem component={Link} href="/settings" onClick={handleClose} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <FontAwesomeIcon icon={faCog} style={{ fontSize: '1rem', color: theme.palette.grey[700] }} />
                    </ListItemIcon>
                    تنظیمات
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
                    <ListItemIcon sx={{ color: theme.palette.error.main }}>
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: '1rem' }} />
                    </ListItemIcon>
                    خروج از حساب
                </MenuItem>
            </Menu>
        </>
    );
} 