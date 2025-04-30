'use client';

import React, { useState } from 'react';
import {
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Typography,
    Tooltip,
    Divider,
    IconButton
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkIcon from '@mui/icons-material/Work';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

type MenuItem = {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
} | {
    divider: true;
};

export default function UserMenu() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
    };

    const handleNavigate = (path: string) => {
        router.push(path);
        handleClose();
    };

    // گزینه‌های منو برای کاربر احراز هویت شده
    const authenticatedMenuItems: MenuItem[] = [
        {
            icon: <AccountCircleIcon fontSize="small" />,
            text: 'پروفایل من',
            onClick: () => handleNavigate('/profile')
        },
        {
            icon: <WorkIcon fontSize="small" />,
            text: user?.user_type === 'JS' ? 'پیشنهادهای کاری' : 'آگهی‌های من',
            onClick: () => handleNavigate(user?.user_type === 'JS' ? '/jobs' : '/my-jobs')
        },
        {
            icon: <SettingsIcon fontSize="small" />,
            text: 'تنظیمات',
            onClick: () => handleNavigate('/settings')
        },
        {
            divider: true
        },
        {
            icon: <LogoutIcon fontSize="small" />,
            text: 'خروج',
            onClick: handleLogout
        }
    ];

    // گزینه‌های منو برای کاربر احراز هویت نشده
    const unauthenticatedMenuItems: MenuItem[] = [
        {
            icon: <LoginIcon fontSize="small" />,
            text: 'ورود',
            onClick: () => handleNavigate('/login')
        },
        {
            icon: <PersonAddIcon fontSize="small" />,
            text: 'ثبت‌نام',
            onClick: () => handleNavigate('/register')
        }
    ];

    return (
        <Box>
            <Tooltip title={isAuthenticated ? 'حساب کاربری' : 'ورود / ثبت‌نام'}>
                <IconButton
                    onClick={handleClick}
                    size="medium"
                    aria-controls={open ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
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
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            '& .icon': {
                                color: theme => theme.palette.primary.dark
                            }
                        }
                    }}
                >
                    {isAuthenticated && user ? (
                        <Avatar
                            sx={{
                                width: { xs: 32, md: 38 },
                                height: { xs: 32, md: 38 },
                                backgroundColor: (theme) => theme.palette.primary.main,
                            }}
                        >
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : <PersonIcon />}
                        </Avatar>
                    ) : (
                        <FontAwesomeIcon
                            icon={faUser}
                            className="icon"
                            style={{
                                fontSize: '1.3rem',
                                width: '22px',
                                height: '22px',
                                color: 'inherit',
                                transition: 'all 0.25s ease'
                            }}
                        />
                    )}
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                id="user-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 2,
                    sx: {
                        width: 220,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                        mt: 1.5,
                        borderRadius: 2,
                        '& .MuiMenuItem-root': {
                            fontSize: '0.9rem',
                            py: 1,
                            px: 2,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {isAuthenticated && user && (
                    <Box sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">{user.full_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                    </Box>
                )}

                {(isAuthenticated ? authenticatedMenuItems : unauthenticatedMenuItems).map((item, index) => (
                    'divider' in item ? (
                        <Divider key={`divider-${index}`} />
                    ) : (
                        <MenuItem key={index} onClick={item.onClick}>
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            {item.text}
                        </MenuItem>
                    )
                ))}
            </Menu>
        </Box>
    );
} 