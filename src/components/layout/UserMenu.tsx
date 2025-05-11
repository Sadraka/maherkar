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
    faUserCircle,
    faPhone
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/contexts/AuthContext';

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

export default function UserMenu({ user: propUser, isLoggedIn }: UserMenuProps) {
    const theme = useTheme();
    const router = useRouter();
    const { logout: authLogout, user: authUser } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // ترکیب اطلاعات کاربر از props و context
    const currentUser = {
        name: authUser?.full_name || propUser?.name || '',
        phone: authUser?.phone || '',
        avatar: propUser?.avatar || '',
        role: authUser?.user_type || propUser?.role || '',
    };

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
                        color="primary.main" 
                        sx={{ 
                            mt: 0.8, 
                            display: 'inline-block', 
                            fontSize: '0.75rem',
                            backgroundColor: `${theme.palette.primary.main}15`,
                            px: 1,
                            py: 0.3,
                            borderRadius: '10px',
                            fontWeight: 500
                        }}
                    >
                        {getUserRoleText(currentUser.role)}
                    </Typography>
                </Box>

                {/* آیتم‌های منو */}
                <Box sx={{ py: 1 }}>
                    <MenuItem component={Link} href="/profile" onClick={handleClose} sx={{ 
                        py: 1.2,
                        mx: 0.5,
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}10`,
                            '& .MuiListItemIcon-root': {
                                color: theme.palette.primary.main,
                                transform: 'scale(1.1)',
                            }
                        }
                    }}>
                        <ListItemIcon sx={{ 
                            transition: 'all 0.2s ease',
                            minWidth: '35px'
                        }}>
                            <FontAwesomeIcon icon={faUser} style={{ 
                                fontSize: '1rem', 
                                color: theme.palette.primary.main 
                            }} />
                        </ListItemIcon>
                        مشاهده پروفایل
                    </MenuItem>

                    {(currentUser.role === 'candidate' || currentUser.role === 'JS') && (
                        <MenuItem component={Link} href="/resume" onClick={handleClose} sx={{ 
                            py: 1.2,
                            mx: 0.5,
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: `${theme.palette.candidate.main}10`,
                                '& .MuiListItemIcon-root': {
                                    color: theme.palette.candidate.main,
                                    transform: 'scale(1.1)',
                                }
                            }
                        }}>
                            <ListItemIcon sx={{ 
                                transition: 'all 0.2s ease',
                                minWidth: '35px'
                            }}>
                                <FontAwesomeIcon icon={faFileAlt} style={{ 
                                    fontSize: '1rem', 
                                    color: theme.palette.candidate.main 
                                }} />
                            </ListItemIcon>
                            رزومه من
                        </MenuItem>
                    )}

                    {(currentUser.role === 'employer' || currentUser.role === 'EM') && (
                        <MenuItem component={Link} href="/dashboard/jobs" onClick={handleClose} sx={{ 
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
                                <FontAwesomeIcon icon={faBriefcase} style={{ 
                                    fontSize: '1rem', 
                                    color: theme.palette.employer.main 
                                }} />
                            </ListItemIcon>
                            آگهی‌های من
                        </MenuItem>
                    )}

                    <MenuItem component={Link} href="/settings" onClick={handleClose} sx={{ 
                        py: 1.2,
                        mx: 0.5,
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: `${theme.palette.grey[500]}10`,
                            '& .MuiListItemIcon-root': {
                                color: theme.palette.grey[800],
                                transform: 'scale(1.1)',
                            }
                        }
                    }}>
                        <ListItemIcon sx={{ 
                            transition: 'all 0.2s ease',
                            minWidth: '35px'
                        }}>
                            <FontAwesomeIcon icon={faCog} style={{ 
                                fontSize: '1rem', 
                                color: theme.palette.grey[700] 
                            }} />
                        </ListItemIcon>
                        تنظیمات
                    </MenuItem>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Box sx={{ py: 1 }}>
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
            </Menu>
        </>
    );
} 