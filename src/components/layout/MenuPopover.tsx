'use client'

import { 
  Popover,
  Paper,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faProjectDiagram,
  faPlus,
  faBriefcase,
  faFileAlt,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

export default function MenuPopover() {
  const theme = useTheme();
  const { 
    employerAnchorEl,
    candidateAnchorEl,
    isEmployerHovered,
    isCandidateHovered,
    setIsEmployerHovered,
    setIsCandidateHovered,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,
  } = useHeaderContext();

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام کارجویان', 
      icon: <FontAwesomeIcon icon={faUsers} size="2x" color={theme.palette.primary.main} />, 
      href: '#',
      description: 'کارجویان فعال در ماهرکار را مشاهده کرده و براساس مهارت مورد نظر خود انتخاب کنید.'
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} size="2x" color={theme.palette.primary.main} />, 
      href: '#',
      description: 'مهارت مورد نظر را جستجو کرده، پروژه یا نمونه کار را در این دسته‌بندی مشاهده کنید.'
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <FontAwesomeIcon icon={faPlus} size="2x" color={theme.palette.primary.main} />, 
      href: '#',
      description: 'با ایجاد پروژه امکان همکاری با هزاران نیروی متخصص را خواهید داشت.'
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} size="2x" color={theme.palette.secondary.main} />, 
      href: '#',
      description: 'آخرین فرصت‌های شغلی مناسب با تخصص شما'
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} size="2x" color={theme.palette.secondary.main} />, 
      href: '#',
      description: 'رزومه خود را آماده کنید و به کارفرمایان معتبر ارسال کنید'
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} size="2x" color={theme.palette.secondary.main} />, 
      href: '#',
      description: 'پروفایل حرفه‌ای خود را تکمیل کنید تا شانس استخدام افزایش یابد'
    }
  ];

  return (
    <>
      {/* منوی کارفرما */}
      <Popover
        id="employer-menu"
        open={isEmployerHovered}
        anchorEl={employerAnchorEl}
        onClose={() => setIsEmployerHovered(false)}
        disableRestoreFocus
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('employer'),
            onMouseLeave: () => handlePopoverMouseLeave('employer'),
            sx: {
              mt: 0.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 250,
              overflow: 'visible',
              pointerEvents: 'auto',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                height: 10,
                backgroundColor: 'transparent',
                zIndex: 1,
              },
            }
          }
        }}
      >
        <Paper id="employer-menu-content" sx={{ p: 4, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {employerMenuItems.map((item, index) => (
              <Box 
                key={index.toString()} 
                sx={{ 
                  width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box
                  component="a"
                  href={item.href}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    p: 2.5,
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}05`,
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" align="center" fontWeight="bold" fontSize="1.1rem" mb={1.5}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem" align="center">
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Popover>

      {/* منوی کارجو */}
      <Popover
        id="candidate-menu"
        open={isCandidateHovered}
        anchorEl={candidateAnchorEl}
        onClose={() => setIsCandidateHovered(false)}
        disableRestoreFocus
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('candidate'),
            onMouseLeave: () => handlePopoverMouseLeave('candidate'),
            sx: {
              mt: 0.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 250,
              overflow: 'visible',
              pointerEvents: 'auto',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                height: 10,
                backgroundColor: 'transparent',
                zIndex: 1,
              },
            }
          }
        }}
      >
        <Paper id="candidate-menu-content" sx={{ p: 4, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {candidateMenuItems.map((item, index) => (
              <Box 
                key={index.toString()} 
                sx={{ 
                  width: { xs: '100%', md: 'calc(33.33% - 16px)' },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box
                  component="a"
                  href={item.href}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    p: 2.5,
                    borderRadius: 2,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: `${theme.palette.secondary.main}05`,
                      borderColor: theme.palette.secondary.main,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" align="center" fontWeight="bold" fontSize="1.1rem" mb={1.5}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem" align="center">
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Popover>
    </>
  );
} 