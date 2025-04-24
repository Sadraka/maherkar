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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

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
  hourlyRate: string;
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
        height: '100%', 
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
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={expert.avatar} 
            alt={expert.name}
            sx={{ 
              width: 90, 
              height: 90, 
              mb: 1.5,
              border: `3px solid ${jobSeekerColors.bgVeryLight}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }} 
          />
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                {expert.name}
              </Typography>
              {expert.isVerified && (
                <CheckCircleOutlineIcon 
                  sx={{ ml: 0.5, color: jobSeekerColors.primary, fontSize: '1rem' }} 
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {expert.jobTitle}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
              <Rating 
                value={expert.rating} 
                precision={0.1} 
                readOnly 
                size="small" 
                sx={{ 
                  mr: 0.5,
                  color: jobSeekerColors.primary
                }} 
              />
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {expert.rating}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1.5, borderColor: jobSeekerColors.bgLight }} />
        
        <Box sx={{ mb: 2, p: 1.5, bgcolor: jobSeekerColors.bgVeryLight, borderRadius: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnOutlinedIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '1rem', ml: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {expert.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkOutlineIcon fontSize="small" sx={{ color: jobSeekerColors.primary, fontSize: '1rem', ml: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {expert.completedProjects} پروژه موفق
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.secondary }}>
            مهارت‌ها:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {expert.skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill}
                size="small"
                sx={{ 
                  bgcolor: 'white',
                  border: `1px solid ${jobSeekerColors.bgLight}`,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  borderRadius: 1,
                  color: jobSeekerColors.dark,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              />
            ))}
          </Stack>
        </Box>
        
        <Divider sx={{ my: 1.5, borderColor: jobSeekerColors.bgLight }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="success"
            sx={{ 
              py: 1,
              fontWeight: 'bold',
              borderRadius: 1.5,
              fontSize: '0.85rem',
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
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: jobSeekerColors.primary }}>
            ساعتی {expert.hourlyRate}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 