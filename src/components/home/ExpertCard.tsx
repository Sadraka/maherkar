'use client'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  Stack,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

// تابع تبدیل اعداد انگلیسی به فارسی
const convertToPersianNumber = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (match) => persianDigits[parseInt(match)]);
};

export type ExpertType = {
  id: number;
  name: string;
  jobTitle: string;
  avatar: string;
  location: string;
  rating: number;
  completedProjects: number;
  skills: string[];
  isVerified: boolean;
  hourlyRate?: string;
  experienceYears?: number;
};

interface ExpertCardProps {
  expert: ExpertType;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const theme = useTheme();
  const jobSeekerColors = useJobSeekerTheme();

  return (
    <Card 
      sx={{ 
        height: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${jobSeekerColors.bgLight}`,
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
      <CardContent sx={{ p: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1.5, position: 'relative' }}>
          <Box sx={{ position: 'relative', mb: 1 }}>
            <Avatar 
              src={expert.avatar} 
              alt={expert.name}
              sx={{ 
                width: 70, 
                height: 70, 
                border: 'none',
                boxShadow: 'none'
              }} 
            />
            
            {expert.isVerified && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  bottom: 0, 
                  right: 0, 
                  bgcolor: jobSeekerColors.primary,
                  color: 'white', 
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid white',
                  boxShadow: 'none',
                  zIndex: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: 'none',
                  }
                }}
              >
                <CheckIcon sx={{ fontSize: '0.8rem' }} />
              </Box>
            )}
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 0.3 }}>
              {expert.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.7, fontSize: '0.85rem' }}>
              {expert.jobTitle}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0 }}>
              <Rating 
                value={expert.rating} 
                precision={0.1} 
                readOnly 
                size="small" 
                sx={{ 
                  mr: 0.5,
                  color: jobSeekerColors.primary,
                  '& .MuiRating-icon': {
                    fontSize: '0.9rem'
                  }
                }} 
              />
              <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
                {convertToPersianNumber(expert.rating)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1, borderColor: jobSeekerColors.bgLight }} />
        
        <Box sx={{ mb: 1.5, p: 1.2, bgcolor: jobSeekerColors.bgVeryLight, borderRadius: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.7 }}>
            <LocationOnOutlinedIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '0.9rem', ml: 0.3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {expert.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkOutlineIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '0.9rem', ml: 0.3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {convertToPersianNumber(expert.completedProjects)} پروژه موفق
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
            مهارت‌ها:
          </Typography>
          <Stack direction="row" spacing={0} flexWrap="wrap" gap={0.2}>
            {expert.skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(0, 128, 0, 0.1)',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  borderRadius: 0.8,
                  color: jobSeekerColors.primary,
                  py: 0.1,
                  px: 0.1,
                  m: 0.1,
                  height: '18px',
                  '& .MuiChip-label': {
                    px: 0.8
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
        
        <Divider sx={{ my: 1, borderColor: jobSeekerColors.bgLight }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
          <Button 
            variant="contained" 
            color="success"
            size="small"
            sx={{ 
              py: 0.7,
              fontWeight: 'bold',
              borderRadius: 1.5,
              fontSize: '0.8rem',
              background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
              boxShadow: `0 4px 8px rgba(0, 112, 60, 0.2)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                boxShadow: `0 4px 12px rgba(0, 112, 60, 0.3)`,
              }
            }}
          >
            استخدام متخصص
          </Button>
          {expert.experienceYears && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 1, 
                py: 0.4, 
                borderRadius: 1.5,
                bgcolor: 'rgba(0, 128, 0, 0.08)',
                border: `1px solid ${jobSeekerColors.bgLight}`
              }}
            >
              <HistoryIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: jobSeekerColors.primary, 
                  mr: 0.3 
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: jobSeekerColors.primary,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {convertToPersianNumber(expert.experienceYears)} <Box component="span" sx={{ mr: 0.2 }} />سال سابقه
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
} 