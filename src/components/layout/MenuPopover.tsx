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
  alpha,
  GlobalStyles,
  Container
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
  faLightbulb,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import {
  EMPLOYER_BLUE,
  JOB_SEEKER_GREEN
} from '@/constants/colors';

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

  // تعریف رنگ‌های اصلی برای هر منو - استفاده از ثابت‌های رنگ تعریف شده در constants/colors.ts
  const employerColor = EMPLOYER_BLUE; // '#0a3b79' - سرمه‌ای برای کارفرما
  const candidateColor = JOB_SEEKER_GREEN; // '#00703c' - سبز کارجو
  const helpColor = '#000000'; // مشکی برای راهنما

  // منوی کارفرما
  const employerMenuItems = [
    { 
      title: 'مشاهده تمام کارجویان', 
      icon: <FontAwesomeIcon icon={faUsers} size="lg" />, 
      href: '#',
      description: 'جستجو و انتخاب متخصصان مناسب',
    },
    { 
      title: 'مشاهده دسته‌بندی‌ها', 
      icon: <FontAwesomeIcon icon={faProjectDiagram} size="lg" />, 
      href: '#',
      description: 'جستجو بر اساس مهارت‌ها و تخصص‌ها',
    },
    { 
      title: 'ثبت سریع پروژه', 
      icon: <FontAwesomeIcon icon={faPlus} size="lg" />, 
      href: '#',
      description: 'همکاری با هزاران متخصص در کمترین زمان',
    }
  ];

  // منوی کارجو
  const candidateMenuItems = [
    { 
      title: 'جستجوی فرصت‌های شغلی', 
      icon: <FontAwesomeIcon icon={faBriefcase} size="lg" />, 
      href: '#',
      description: 'مشاهده آخرین پروژه‌ها و فرصت‌ها',
    },
    { 
      title: 'ارسال رزومه', 
      icon: <FontAwesomeIcon icon={faFileAlt} size="lg" />, 
      href: '#',
      description: 'معرفی تخصص خود به کارفرمایان',
    },
    { 
      title: 'تکمیل پروفایل', 
      icon: <FontAwesomeIcon icon={faUserPlus} size="lg" />, 
      href: '#',
      description: 'افزایش شانس استخدام و همکاری',
    }
  ];

  // منوی راهنما
  const helpMenuItems = [
    { 
      title: 'راهنمای کارفرمایان', 
      icon: <FontAwesomeIcon icon={faBuilding} size="lg" />, 
      href: '#',
      description: 'نحوه ثبت پروژه و استخدام متخصصان',
    },
    { 
      title: 'راهنمای کارجویان', 
      icon: <FontAwesomeIcon icon={faUserTie} size="lg" />, 
      href: '#',
      description: 'نحوه ثبت رزومه و یافتن پروژه مناسب',
    },
    { 
      title: 'سوالات متداول', 
      icon: <FontAwesomeIcon icon={faQuestion} size="lg" />, 
      href: '#',
      description: 'پاسخ به پرسش‌های رایج',
    },
    { 
      title: 'نکات و ترفندها', 
      icon: <FontAwesomeIcon icon={faLightbulb} size="lg" />, 
      href: '#',
      description: 'راهنمای موفقیت در ماهرکار',
    }
  ];

  return (
    <>
      {/* استایل گلوبال برای غیرفعال‌سازی انیمیشن‌ها */}
      <GlobalStyles
        styles={{
          '.MuiPopover-root': {
            animation: 'none !important',
            transition: 'none !important',
          },
          '.MuiPopover-paper': {
            animation: 'none !important',
            transition: 'none !important',
          },
          '.MuiBackdrop-root': {
            animation: 'none !important',
            transition: 'none !important',
          },
        }}
      />
      
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
        TransitionProps={{ timeout: { enter: 0, exit: 0 }, style: { transition: 'none !important' } }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('employer'),
            onMouseLeave: () => handlePopoverMouseLeave('employer'),
            sx: {
              mt: 0,
              boxShadow: '0px 5px 10px rgba(0,0,0,0.1)',
              borderRadius: 0,
              minWidth: '100%',
              width: '100vw',
              maxWidth: '100vw',
              left: '0 !important', 
              right: '0 !important',
              overflow: 'visible',
              pointerEvents: 'auto',
              border: 'none',
              borderTop: '0px solid transparent',
              marginTop: '0px',
              position: 'fixed',
              zIndex: 1000,
              '&:before': {
                display: 'none',
              },
            }
          }
        }}
      >
        <Paper 
          id="employer-menu-content" 
          sx={{ 
            p: 0, 
            overflow: 'hidden',
            borderRadius: 0,
            width: '100%',
            bgcolor: '#FFFFFF',
            boxShadow: '0px 5px 10px rgba(0,0,0,0.1)',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          elevation={0}
        >
          <Container maxWidth="lg">
            <Box sx={{ p: {xs: 3, md: 4.5} }}>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                  gap: 3.5
                }}
              >
                {employerMenuItems.map((item, index) => (
                  <Box 
                    key={index.toString()} 
                    component="a"
                    href={item.href}
                    onMouseEnter={() => setActiveEmployerIndex(index)}
                    onMouseLeave={() => setActiveEmployerIndex(-1)}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: 3,
                      borderRadius: 1.5,
                      bgcolor: activeEmployerIndex === index ? alpha(employerColor, 0.05) : 'transparent',
                      color: 'text.primary',
                      textDecoration: 'none',
                      border: '1px solid',
                      borderColor: activeEmployerIndex === index ? alpha(employerColor, 0.15) : 'transparent',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: alpha(employerColor, 0.05),
                        borderColor: alpha(employerColor, 0.15),
                        boxShadow: 'none',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1.5,
                        bgcolor: activeEmployerIndex === index ? employerColor : alpha(employerColor, 0.1),
                        color: activeEmployerIndex === index ? 'white' : employerColor,
                        width: 52,
                        height: 52,
                        mr: 2.5,
                        flexShrink: 0
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={600} fontSize="1.15rem" color="text.primary">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem" mt={0.5}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Container>
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
        TransitionProps={{ timeout: { enter: 0, exit: 0 }, style: { transition: 'none !important' } }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('candidate'),
            onMouseLeave: () => handlePopoverMouseLeave('candidate'),
            sx: {
              mt: 0,
              boxShadow: '0px 5px 10px rgba(0,0,0,0.1)',
              borderRadius: 0,
              minWidth: '100%',
              width: '100vw',
              maxWidth: '100vw',
              left: '0 !important', 
              right: '0 !important',
              overflow: 'visible',
              pointerEvents: 'auto',
              border: 'none',
              borderTop: '0px solid transparent',
              marginTop: '0px',
              position: 'fixed',
              zIndex: 1000,
              '&:before': {
                display: 'none',
              },
            }
          }
        }}
      >
        <Paper 
          id="candidate-menu-content" 
          sx={{ 
            p: 0, 
            overflow: 'hidden',
            borderRadius: 0,
            width: '100%',
            bgcolor: '#FFFFFF',
            boxShadow: '0px 5px 10px rgba(0,0,0,0.1)',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          elevation={0}
        >
          <Container maxWidth="lg">
            <Box sx={{ p: {xs: 3, md: 4.5} }}>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                  gap: 3.5
                }}
              >
                {candidateMenuItems.map((item, index) => (
                  <Box 
                    key={index.toString()} 
                    component="a"
                    href={item.href}
                    onMouseEnter={() => setActiveCandidateIndex(index)}
                    onMouseLeave={() => setActiveCandidateIndex(-1)}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: 3,
                      borderRadius: 1.5,
                      bgcolor: activeCandidateIndex === index ? alpha(candidateColor, 0.05) : 'transparent',
                      color: 'text.primary',
                      textDecoration: 'none',
                      border: '1px solid',
                      borderColor: activeCandidateIndex === index ? alpha(candidateColor, 0.15) : 'transparent',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: alpha(candidateColor, 0.05),
                        borderColor: alpha(candidateColor, 0.15),
                        boxShadow: 'none',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1.5,
                        bgcolor: activeCandidateIndex === index ? candidateColor : alpha(candidateColor, 0.1),
                        color: activeCandidateIndex === index ? 'white' : candidateColor,
                        width: 52,
                        height: 52,
                        mr: 2.5,
                        flexShrink: 0
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={600} fontSize="1.15rem" color="text.primary">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem" mt={0.5}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Container>
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
        TransitionProps={{ timeout: { enter: 0, exit: 0 }, style: { transition: 'none !important' } }}
        slotProps={{
          paper: {
            onMouseEnter: () => handlePopoverMouseEnter('help'),
            onMouseLeave: () => handlePopoverMouseLeave('help'),
            sx: {
              mt: 0,
              boxShadow: '0px 5px 10px rgba(0,0,0,0.1)',
              borderRadius: 0,
              minWidth: '100%',
              width: '100vw',
              maxWidth: '100vw',
              left: '0 !important', 
              right: '0 !important',
              overflow: 'visible',
              pointerEvents: 'auto',
              border: 'none',
              borderTop: '0px solid transparent',
              marginTop: '0px',
              position: 'fixed',
              zIndex: 1000,
              '&:before': {
                display: 'none',
              },
            }
          }
        }}
      >
        <Paper 
          id="help-menu-content" 
          sx={{ 
            p: 0, 
            overflow: 'hidden',
            borderRadius: 0,
            width: '100%',
            bgcolor: '#FFFFFF',
            boxShadow: '0px 5px 10px rgba(0,0,0,0.1)',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          elevation={0}
        >
          <Container maxWidth="lg">
            <Box sx={{ p: {xs: 3, md: 4.5} }}>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
                  gap: 3.5
                }}
              >
                {helpMenuItems.map((item, index) => (
                  <Box 
                    key={index.toString()} 
                    component="a"
                    href={item.href}
                    onMouseEnter={() => setActiveHelpIndex(index)}
                    onMouseLeave={() => setActiveHelpIndex(-1)}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: 3,
                      borderRadius: 1.5,
                      bgcolor: activeHelpIndex === index ? alpha(helpColor, 0.05) : 'transparent',
                      color: 'text.primary',
                      textDecoration: 'none',
                      border: '1px solid',
                      borderColor: activeHelpIndex === index ? alpha(helpColor, 0.15) : 'transparent',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: alpha(helpColor, 0.05),
                        borderColor: alpha(helpColor, 0.15),
                        boxShadow: 'none',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1.5,
                        bgcolor: activeHelpIndex === index ? helpColor : alpha(helpColor, 0.1),
                        color: activeHelpIndex === index ? 'white' : helpColor,
                        width: 52,
                        height: 52,
                        mr: 2.5,
                        flexShrink: 0
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={600} fontSize="1.15rem" color="text.primary">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem" mt={0.5}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Container>
        </Paper>
      </Popover>
    </>
  );
} 