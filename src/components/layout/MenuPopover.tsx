'use client'

import { 
  Popover,
  Paper,
  Box,
  Typography,
  useTheme,
  Avatar,
  Divider,
  IconButton,
  alpha
} from '@mui/material';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faProjectDiagram,
  faPlus,
  faBriefcase,
  faFileAlt,
  faUserPlus,
  faBuilding,
  faUserTie,
  faQuestion,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

export default function MenuPopover() {
  const theme = useTheme();
  const { 
    employerAnchorEl,
    candidateAnchorEl,
    helpAnchorEl,
    isEmployerHovered,
    isCandidateHovered,
    isHelpHovered,
    setIsEmployerHovered,
    setIsCandidateHovered,
    setIsHelpHovered,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,
  } = useHeaderContext();

  const [activeEmployerIndex, setActiveEmployerIndex] = useState(-1);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(-1);
  const [activeHelpIndex, setActiveHelpIndex] = useState(-1);

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام کارجویان', 
      icon: <FontAwesomeIcon icon={faUsers} size="lg" />, 
      href: '#',
      description: 'کارجویان فعال در ماهرکار را مشاهده کرده و براساس مهارت مورد نظر خود انتخاب کنید.',
      color: '#3949AB',
      bgColor: '#3949AB15'
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها و مهارت‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} size="lg" />, 
      href: '#',
      description: 'مهارت مورد نظر را جستجو کرده، پروژه یا نمونه کار را در این دسته‌بندی مشاهده کنید.',
      color: '#1E88E5',
      bgColor: '#1E88E515'
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <FontAwesomeIcon icon={faPlus} size="lg" />, 
      href: '#',
      description: 'با ایجاد پروژه امکان همکاری با هزاران نیروی متخصص را خواهید داشت.',
      color: '#5E35B1',
      bgColor: '#5E35B115'
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} size="lg" />, 
      href: '#',
      description: 'آخرین فرصت‌های شغلی مناسب با تخصص شما',
      color: '#26A69A',
      bgColor: '#26A69A15'
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} size="lg" />, 
      href: '#',
      description: 'رزومه خود را آماده کنید و به کارفرمایان معتبر ارسال کنید',
      color: '#43A047',
      bgColor: '#43A04715'
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} size="lg" />, 
      href: '#',
      description: 'پروفایل حرفه‌ای خود را تکمیل کنید تا شانس استخدام افزایش یابد',
      color: '#7CB342',
      bgColor: '#7CB34215'
    }
  ];

  // منوی راهنما
  const helpMenuItems = [
    { 
      title: 'راهنمای کارفرمایان', 
      icon: <FontAwesomeIcon icon={faBuilding} size="lg" />, 
      href: '#',
      description: 'آموزش کامل نحوه ثبت پروژه و استخدام کارجو',
      color: '#E53935',
      bgColor: '#E5393515'
    },
    { 
      title: 'راهنمای کارجویان', 
      icon: <FontAwesomeIcon icon={faUserTie} size="lg" />, 
      href: '#',
      description: 'آموزش کامل نحوه ثبت رزومه و یافتن شغل مناسب',
      color: '#F4511E',
      bgColor: '#F4511E15'
    },
    { 
      title: 'سوالات متداول', 
      icon: <FontAwesomeIcon icon={faQuestion} size="lg" />, 
      href: '#',
      description: 'پاسخ به سوالات رایج کاربران',
      color: '#FB8C00',
      bgColor: '#FB8C0015'
    },
    { 
      title: 'نکات و ترفندها', 
      icon: <FontAwesomeIcon icon={faLightbulb} size="lg" />, 
      href: '#',
      description: 'نکات مفید برای موفقیت در ماهرکار',
      color: '#FFB300',
      bgColor: '#FFB30015'
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
              minWidth: 350,
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
        <Paper 
          id="employer-menu-content" 
          sx={{ 
            p: 3, 
            background: `linear-gradient(180deg, ${alpha(theme.palette.employer?.main || theme.palette.primary.main, 0.05)} 0%, rgba(255,255,255,0) 100%)`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.employer?.main || theme.palette.primary.main, 0.1), 
                  color: theme.palette.employer?.main || theme.palette.primary.main,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faBuilding} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color="employer.main">
                کارفرما هستم
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setIsEmployerHovered(false)}
              sx={{ 
                bgcolor: alpha(theme.palette.employer?.main || theme.palette.primary.main, 0.1),
                color: theme.palette.employer?.main || theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.employer?.main || theme.palette.primary.main, 0.2),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {employerMenuItems.map((item, index) => (
              <Box 
                key={index.toString()} 
                component="a"
                href={item.href}
                onMouseEnter={() => setActiveEmployerIndex(index)}
                onMouseLeave={() => setActiveEmployerIndex(-1)}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: activeEmployerIndex === index ? item.bgColor : 'transparent',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  transform: activeEmployerIndex === index ? 'scale(0.98)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: item.bgColor,
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: activeEmployerIndex === index ? item.color : alpha(item.color, 0.1),
                    color: activeEmployerIndex === index ? 'white' : item.color,
                    width: 42,
                    height: 42,
                    mr: 2,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.icon}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold" fontSize="1rem">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
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
              minWidth: 350,
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
        <Paper 
          id="candidate-menu-content" 
          sx={{ 
            p: 3, 
            background: `linear-gradient(180deg, ${alpha(theme.palette.candidate?.main || theme.palette.secondary.main, 0.05)} 0%, rgba(255,255,255,0) 100%)`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.candidate?.main || theme.palette.secondary.main, 0.1), 
                  color: theme.palette.candidate?.main || theme.palette.secondary.main,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faUserTie} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color="candidate.main">
                کارجو هستم
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setIsCandidateHovered(false)}
              sx={{ 
                bgcolor: alpha(theme.palette.candidate?.main || theme.palette.secondary.main, 0.1),
                color: theme.palette.candidate?.main || theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.candidate?.main || theme.palette.secondary.main, 0.2),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {candidateMenuItems.map((item, index) => (
              <Box 
                key={index.toString()} 
                component="a"
                href={item.href}
                onMouseEnter={() => setActiveCandidateIndex(index)}
                onMouseLeave={() => setActiveCandidateIndex(-1)}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: activeCandidateIndex === index ? item.bgColor : 'transparent',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  transform: activeCandidateIndex === index ? 'scale(0.98)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: item.bgColor,
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: activeCandidateIndex === index ? item.color : alpha(item.color, 0.1),
                    color: activeCandidateIndex === index ? 'white' : item.color,
                    width: 42,
                    height: 42,
                    mr: 2,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.icon}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold" fontSize="1rem">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Popover>

      {/* منوی راهنما */}
      <Popover
        id="help-menu"
        open={isHelpHovered}
        anchorEl={helpAnchorEl}
        onClose={() => setIsHelpHovered(false)}
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
            onMouseEnter: () => handlePopoverMouseEnter('help'),
            onMouseLeave: () => handlePopoverMouseLeave('help'),
            sx: {
              mt: 0.5,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 350,
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
        <Paper 
          id="help-menu-content" 
          sx={{ 
            p: 3, 
            background: `linear-gradient(180deg, ${alpha(theme.palette.info.main, 0.05)} 0%, rgba(255,255,255,0) 100%)`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                  color: theme.palette.info.main,
                  mr: 1.5
                }}
              >
                <FontAwesomeIcon icon={faQuestion} />
              </Avatar>
              <Typography variant="h6" fontWeight={800} color="info.main">
                راهنما
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setIsHelpHovered(false)}
              sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {helpMenuItems.map((item, index) => (
              <Box 
                key={index.toString()} 
                component="a"
                href={item.href}
                onMouseEnter={() => setActiveHelpIndex(index)}
                onMouseLeave={() => setActiveHelpIndex(-1)}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: activeHelpIndex === index ? item.bgColor : 'transparent',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  transform: activeHelpIndex === index ? 'scale(0.98)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: item.bgColor,
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: activeHelpIndex === index ? item.color : alpha(item.color, 0.1),
                    color: activeHelpIndex === index ? 'white' : item.color,
                    width: 42,
                    height: 42,
                    mr: 2,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.icon}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold" fontSize="1rem">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
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