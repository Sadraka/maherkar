import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Person,
  Business,
  AdminPanelSettings,
  Support
} from '@mui/icons-material';
import { ADMIN_THEME, JOB_SEEKER_THEME, EMPLOYER_THEME, SUPPORT_THEME } from '@/constants/colors';
import { convertToJalali } from '../utils';

interface UserCardProps {
  user: {
    id: string;
    full_name: string;
    phone: string;
    user_type: string;
    status: string;
    joined_date: string;
    is_active: boolean;
    last_updated: string;
    profile_picture?: string;
    username?: string;
  };
  onView: (user: any) => void;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
  currentUserId: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, onView, onEdit, onDelete, currentUserId }) => {
  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'JS': return <Person fontSize="small" />;
      case 'EM': return <Business fontSize="small" />;
      case 'AD': return <AdminPanelSettings fontSize="small" />;
      case 'SU': return <Support fontSize="small" />;
      default: return <Person fontSize="small" />;
    }
  };

  const getUserTypeLabel = (type: string) => {
    const types = {
      'JS': 'کارجو',
      'EM': 'کارفرما',
      'AD': 'مدیریت',
      'SU': 'پشتیبان'
    };
    return types[type as keyof typeof types] || type;
  };

  const getUserTypeTheme = (type: string) => {
    switch (type) {
      case 'JS':
        return JOB_SEEKER_THEME;
      case 'EM':
        return EMPLOYER_THEME;
      case 'AD':
        return ADMIN_THEME;
      case 'SU':
        return SUPPORT_THEME;
      default:
        return ADMIN_THEME;
    }
  };

  const getUserStatus = (user: any) => {
    if (user.status) {
      return {
        isActive: user.status === 'ACT',
        label: user.status === 'ACT' ? 'فعال' :
          user.status === 'SUS' ? 'تعلیق' :
            user.status === 'DEL' ? 'حذف شده' : 'نامشخص'
      };
    }
    return {
      isActive: user.is_active,
      label: user.is_active ? 'فعال' : 'غیرفعال'
    };
  };

  const userStatus = getUserStatus(user);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${ADMIN_THEME.bgLight}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: ADMIN_THEME.primary,
          transform: 'translateY(-1px)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Avatar
            src={user.profile_picture || undefined}
            sx={{
              width: 48,
              height: 48,
              bgcolor: getUserTypeTheme(user.user_type).primary,
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 600,
              mr: 2
            }}
          >
            {!user.profile_picture && (user.full_name ? user.full_name[0].toUpperCase() : 'U')}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: ADMIN_THEME.dark,
                mb: 0.5,
                fontSize: '1rem'
              }}
            >
              {user.full_name || 'بدون نام'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                direction: 'ltr',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {user.phone}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(90deg, ${getUserTypeTheme(user.user_type).primary}, ${getUserTypeTheme(user.user_type).light})`,
              borderRadius: '4px',
              px: 1,
              py: 0.2,
              minWidth: 80,
              textAlign: 'center',
              position: 'relative',
            }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  lineHeight: 1.2,
                  color: '#fff',
                  fontWeight: 600
                }}
              >
                {getUserTypeLabel(user.user_type)}
              </Typography>
              {user.user_type === 'AD' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    fontSize: '0.8rem',
                    color: '#FFD700',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                  }}
                >
                  ⭐
                </Box>
              )}
            </Box>
            <Chip
              label={userStatus.label}
              size="small"
              variant="outlined"
              color={userStatus.isActive ? 'success' : 'error'}
              sx={{
                fontSize: '0.7rem',
                height: 20,
                borderWidth: 1
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        {/* Info Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          mb: 2.5
        }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.5
              }}
            >
              تاریخ عضویت
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark
              }}
            >
              {convertToJalali(user.joined_date)}
            </Typography>
          </Box>
          
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                display: 'block',
                mb: 0.5
              }}
            >
              آخرین به‌روزرسانی
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: ADMIN_THEME.dark
              }}
            >
              {convertToJalali(user.last_updated)}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Tooltip title="مشاهده جزئیات">
            <IconButton
              size="small"
              onClick={() => onView(user)}
              sx={{
                color: ADMIN_THEME.primary,
                bgcolor: `${ADMIN_THEME.primary}10`,
                '&:hover': {
                  bgcolor: `${ADMIN_THEME.primary}20`
                }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="ویرایش کاربر">
            <IconButton
              size="small"
              onClick={() => onEdit(user)}
              sx={{
                color: ADMIN_THEME.primary,
                bgcolor: `${ADMIN_THEME.primary}10`,
                '&:hover': {
                  bgcolor: `${ADMIN_THEME.primary}20`
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="حذف کاربر">
            <IconButton
              size="small"
              onClick={() => onDelete(user)}
              sx={{
                color: '#EF4444',
                bgcolor: '#FEE2E2',
                '&:hover': {
                  bgcolor: '#FECACA'
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard; 