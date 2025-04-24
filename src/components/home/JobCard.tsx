'use client'

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  Chip, 
  Divider, 
  useTheme,
  Avatar
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';
import { EMPLOYER_THEME } from '@/constants/colors';
import { CSSProperties } from 'react';

// تعریف تایپ جاب
export type JobType = {
  id: number;
  title: string;
  location: string;
  isRemote: boolean;
  salary: string;
  skills: string[];
  isUrgent: boolean;
  isPromoted?: boolean; // آگهی نردبان شده یا پرومت شده
  timePosted: string;
  company: string;
  jobType: string;
};

interface JobCardProps {
  job: JobType;
}

// تعریف ثابت‌ها برای حل مشکل نمایش آیکون‌های SVG
const ICON_SIZE = '0.9rem';
const SVG_ICON_STYLE = {
  width: ICON_SIZE,
  height: ICON_SIZE,
  fontSize: ICON_SIZE,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden' // جلوگیری از نمایش بیرون زدگی آیکون
};

// استایل ثابت برای آیکون‌های Font Awesome
const FA_ICON_STYLE: CSSProperties = {
  width: '0.85rem',
  height: '0.85rem',
  fontSize: '0.85rem',
  display: 'inline-block',
  verticalAlign: 'middle',
  overflow: 'hidden'
};

// کامپوننت آیکون کنترل شده - بدون استفاده از Box
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: ICON_SIZE,
      height: ICON_SIZE,
      overflow: 'hidden',
      marginRight: '4px'
    }}
  >
    {children}
  </span>
);

export default function JobCard({ job }: JobCardProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();
  
  // استفاده از رنگ‌های کارفرما
  const employerColors = EMPLOYER_THEME;
  
  return (
    <Card 
      sx={{ 
        height: '100%', // ارتفاع کامل برای یکسان بودن ارتفاع تمام کارت‌ها
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${employerColors.bgLight}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* نمایش برچسب‌های ویژه و فوری */}
      {job.isPromoted && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(211, 47, 47, 0.95)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            px: 1.2,
            py: 0.4,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.3,
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)'
          }}
        >
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '0.75rem', 
            height: '0.75rem', 
            overflow: 'hidden' 
          }}>
            <StarIcon sx={{ fontSize: '0.75rem', width: '0.75rem', height: '0.75rem' }} />
          </span>
          ویژه
        </Box>
      )}
      
      {job.isUrgent && !job.isPromoted && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 145, 0, 0.9)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            px: 1.5,
            py: 0.5,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            zIndex: 2,
            boxShadow: '0 3px 10px rgba(255, 145, 0, 0.4)'
          }}
        >
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '0.85rem', 
            height: '0.85rem', 
            overflow: 'hidden' 
          }}>
            <LocalFireDepartmentIcon sx={{ fontSize: '0.85rem', width: '0.85rem', height: '0.85rem' }} />
          </span>
          فوری
        </Box>
      )}
      
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex',
        flexDirection: 'column',
        p: 2, 
        pt: job.isPromoted || job.isUrgent ? 3 : 2, // فاصله بیشتر از بالا برای کارت‌های دارای برچسب
        pb: 2,
        '&:last-child': { pb: 2 }
      }}>
        <Typography 
          variant="h6" 
          component="h3"
          sx={{ 
            mb: 0.5, 
            fontWeight: 'bold', 
            fontSize: '1rem',
            color: theme.palette.text.primary
          }}
        >
          {job.title}
        </Typography>
        <Typography 
          variant="body2"
          component="div"
          sx={{ 
            mb: 1.5,
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.85rem'
          }}
        >
          <IconWrapper>
            <FontAwesomeIcon 
              icon={faBuilding} 
              style={{ 
                color: employerColors.primary,
                ...FA_ICON_STYLE
              }} 
            />
          </IconWrapper>
          {job.company}
        </Typography>
        
        <Box sx={{ 
          mb: 1.5,
          p: 1.2, 
          bgcolor: employerColors.bgVeryLight, 
          borderRadius: 1.5
        }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
            <Box 
              component="div"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.8rem'
              }}
            >
              <IconWrapper>
                <LocationOnOutlinedIcon 
                  fontSize="small" 
                  sx={{ 
                    ...SVG_ICON_STYLE,
                    color: employerColors.primary 
                  }} 
                />
              </IconWrapper>
              {job.location}
              {job.isRemote && <Chip 
                label="دورکاری" 
                size="small" 
                sx={{ 
                  ml: 0.5, 
                  fontSize: '0.65rem',
                  height: 18,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  color: employerColors.primary,
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }} 
              />}
            </Box>
            
            <Box 
              component="div"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.8rem'
              }}
            >
              <IconWrapper>
                <AccessTimeOutlinedIcon 
                  fontSize="small" 
                  sx={{ 
                    ...SVG_ICON_STYLE,
                    color: employerColors.primary 
                  }} 
                />
              </IconWrapper>
              {job.timePosted}
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1} sx={{ mb: 0 }}>
            <Box 
              component="div"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.8rem'
              }}
            >
              <IconWrapper>
                <WorkOutlineIcon 
                  fontSize="small" 
                  sx={{ 
                    ...SVG_ICON_STYLE,
                    color: employerColors.primary 
                  }} 
                />
              </IconWrapper>
              {job.jobType}
            </Box>
            
            <Box 
              component="div"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.8rem'
              }}
            >
              <IconWrapper>
                <MonetizationOnOutlinedIcon 
                  fontSize="small" 
                  sx={{ 
                    ...SVG_ICON_STYLE,
                    color: employerColors.primary 
                  }} 
                />
              </IconWrapper>
              {job.salary}
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
            مهارت‌ها:
          </Typography>
          <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.3}>
            {job.skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  borderRadius: 0.8,
                  color: employerColors.primary,
                  py: 0.1,
                  px: 0.1,
                  m: 0.15,
                  height: '20px',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
        
        <Button 
          fullWidth 
          variant="contained" 
          disableElevation
          color="primary"
          sx={{ 
            mt: 'auto',
            py: 1.2,
            fontWeight: 'bold',
            borderRadius: 1.5,
            fontSize: '0.9rem',
            background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
            boxShadow: `0 4px 8px ${employerColors.bgLight}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)`,
              boxShadow: `0 4px 12px ${employerColors.bgLight}`,
            }
          }}
        >
          درخواست همکاری
        </Button>
      </CardContent>
    </Card>
  );
} 