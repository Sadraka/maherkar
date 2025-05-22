'use client';

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Link as MuiLink,
  useTheme,
  Fade,
  useMediaQuery,
  alpha
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { EMPLOYER_THEME, JOB_SEEKER_THEME } from '@/constants/colors';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, ReactElement, Ref } from 'react';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

// انیمیشن Fade برای ورود مدال با سرعت بیشتر
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} timeout={250} />;
});

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  redirectUrl?: string;
  title?: string;
  message?: string;
  submessage?: string;
  themeType?: 'employer' | 'jobSeeker';
  customIcon?: ReactElement;
}

/**
 * کامپوننت مدال اعلان نیاز به احراز هویت
 * این کامپوننت زمانی نمایش داده می‌شود که کاربر قصد دسترسی به بخشی از سایت را دارد
 * که نیاز به احراز هویت داشته باشد ولی کاربر وارد حساب کاربری خود نشده باشد.
 */
export default function AuthRequiredModal({
  open,
  onClose,
  redirectUrl = '/',
  title = 'ورود به حساب کاربری',
  message = 'برای مشاهده این بخش، لطفاً وارد حساب کاربری خود شوید.',
  submessage = 'حساب کاربری ندارید؟ ثبت‌نام کنید.',
  themeType = 'employer',
  customIcon
}: AuthRequiredModalProps) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXSmall = useMediaQuery('(max-width:360px)');
  
  // انتخاب تم مناسب بر اساس نوع کاربر
  const currentTheme = themeType === 'jobSeeker' ? JOB_SEEKER_THEME : EMPLOYER_THEME;
  
  // ارسال کاربر به صفحه ورود با امکان بازگشت به صفحه فعلی پس از ورود
  const handleGoToLogin = () => {
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);
    router.push(`/login?redirect=${encodedRedirectUrl}`);
    onClose();
  };

  // ارسال کاربر به صفحه ثبت‌نام
  const handleGoToRegister = () => {
    router.push('/register');
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth="xs"
      sx={{
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(3px)',
          backgroundColor: alpha('#000', 0.4),
          transition: 'backdrop-filter 250ms, background-color 250ms'
        },
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        },
        '& .MuiPaper-root': {
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1) !important'
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 2.5, sm: 3.5 },
          boxShadow: `0 12px 28px ${alpha(currentTheme.primary, 0.15)}`,
          maxWidth: { xs: '92%', sm: '450px' },
          width: { xs: '92%', sm: '450px' },
          padding: { xs: 1.5, sm: 2 },
          backgroundColor: theme.palette.background.paper,
          overflow: 'visible',
          margin: { xs: '16px auto', sm: '0 auto' },
          position: 'relative',
          transition: 'all 250ms ease-out',
          transform: 'translateY(-10px)',
          '&::after': {
            content: 'none'
          },
          '&::before': {
            content: 'none'
          }
        }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: -32,
        left: 'calc(50% - 32px)',
        width: { xs: 64, sm: 68 },
        height: { xs: 64, sm: 68 },
        borderRadius: '50%',
        backgroundColor: '#fff',
        boxShadow: `0 8px 16px ${alpha(currentTheme.primary, 0.25)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        padding: 1.2,
        transition: 'all 300ms ease',
        border: `2px solid ${alpha(currentTheme.primary, 0.1)}`,
        '&:hover': {
          transform: 'scale(1.05) translateY(-2px)',
          boxShadow: `0 10px 20px ${alpha(currentTheme.primary, 0.3)}`
        }
      }}>
        <Box sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${currentTheme.light} 0%, ${currentTheme.primary} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -10,
            left: -10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            filter: 'blur(5px)'
          }
        }}>
          {customIcon || <LoginIcon sx={{ 
            fontSize: { xs: '1.8rem', sm: '2rem' }, 
            color: '#fff',
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
          }} />}
        </Box>
      </Box>
      
      <DialogTitle 
        sx={{ 
          textAlign: 'center', 
          fontSize: { xs: '1.1rem', sm: '1.3rem' },
          fontWeight: 800,
          color: currentTheme.primary,
          pb: 0.5,
          pt: { xs: 2.5, sm: 3 },
          mt: 2,
          position: 'relative',
          letterSpacing: '0.02em',
          textShadow: `0 1px 2px ${alpha(currentTheme.primary, 0.1)}`,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: 40, sm: 60 },
            height: 2,
            backgroundColor: alpha(currentTheme.primary, 0.2),
            borderRadius: 2
          }
        }}
      >
        {title}
        <IconButton
          aria-label="بستن"
          onClick={onClose}
          sx={{
            position: 'absolute',
            left: { xs: 4, sm: 8 },
            top: { xs: 4, sm: 8 },
            color: 'text.secondary',
            width: { xs: 30, sm: 32 },
            height: { xs: 30, sm: 32 },
            transition: 'all 200ms ease',
            '&:hover': {
              backgroundColor: alpha(currentTheme.primary, 0.08),
              color: currentTheme.primary,
              transform: 'rotate(90deg)'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        px: { xs: 2.5, sm: 3.5 }, 
        py: { xs: 1.5, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: 'auto', sm: '90px' },
        pb: { xs: 1.5, sm: 2 }
      }}>
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center', 
            mb: 1.5,
            lineHeight: 1.7,
            fontSize: { xs: '0.95rem', sm: '1rem' },
            px: { xs: 0.5, sm: 1 },
            fontWeight: 500,
            color: 'text.primary',
            '&::after': {
              content: 'none'
            }
          }}
        >
          {message}
        </Typography>
        
        {submessage && (
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary', 
              mt: 0.5,
              lineHeight: 1.6,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              fontWeight: 400,
              opacity: 0.85,
              letterSpacing: '0.01em'
            }}
          >
            {submessage}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        p: { xs: 2, sm: 3 },
        pt: { xs: 0.5, sm: 1 },
        pb: { xs: 2.5, sm: 3 },
        gap: { xs: 1.2, sm: 1.5 }
      }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleGoToLogin}
          startIcon={!isXSmall && <LoginIcon />}
          sx={{
            borderRadius: 2,
            py: { xs: 1.2, sm: 1.4 },
            fontWeight: 800,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            background: `linear-gradient(135deg, ${currentTheme.light} 0%, ${currentTheme.primary} 100%)`,
            boxShadow: `0 4px 10px ${alpha(currentTheme.primary, 0.3)}`,
            transition: 'all 200ms ease',
            letterSpacing: '0.02em',
            border: `1px solid ${alpha(currentTheme.primary, 0.1)}`,
            '&:hover': {
              boxShadow: `0 6px 15px ${alpha(currentTheme.primary, 0.4)}`,
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.dark} 100%)`,
              transform: 'translateY(-3px)'
            },
            '&:active': {
              transform: 'translateY(-1px)',
              boxShadow: `0 2px 8px ${alpha(currentTheme.primary, 0.3)}`
            }
          }}
        >
          ورود
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoToRegister}
          startIcon={!isXSmall && <PersonAddAltIcon />}
          sx={{
            borderRadius: 2,
            py: { xs: 1.1, sm: 1.3 },
            fontWeight: 700,
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            borderWidth: 2,
            borderColor: alpha(currentTheme.primary, 0.3),
            color: currentTheme.primary,
            transition: 'all 200ms ease',
            '&:hover': {
              borderColor: currentTheme.primary,
              backgroundColor: alpha(currentTheme.primary, 0.06),
              color: currentTheme.dark,
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(-1px)',
              backgroundColor: alpha(currentTheme.primary, 0.03)
            }
          }}
        >
          ثبت‌نام
        </Button>
      </DialogActions>
    </Dialog>
  );
} 