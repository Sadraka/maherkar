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

export default function JobCard({ job }: JobCardProps) {
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
      {/* نمایش برچسب‌های ویژه و فوری به صورت جذاب‌تر */}
      {job.isPromoted && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(211, 47, 47, 0.95)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            px: 1.5,
            py: 0.6,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)'
          }}
        >
          <StarIcon sx={{ fontSize: '0.85rem' }} />
          ویژه
        </Box>
      )}
      
      {job.isUrgent && !job.isPromoted && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(0, 112, 60, 0.95)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            px: 1.5,
            py: 0.6,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0, 112, 60, 0.3)'
          }}
        >
          <LocalFireDepartmentIcon sx={{ fontSize: '0.85rem' }} />
          فوری
        </Box>
      )}
      
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 3, 
        '&:last-child': { pb: 3 }
      }}>
        <Typography 
          variant="h6" 
          component="h3"
          sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            fontSize: '1.1rem',
            color: theme.palette.text.primary,
            mt: (job.isPromoted || job.isUrgent) ? 2 : 0,
          }}
        >
          {job.title}
        </Typography>
        <Typography 
          variant="body2"
          sx={{ 
            mb: 2,
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <FontAwesomeIcon 
            icon={faBuilding} 
            style={{ 
              color: jobSeekerColors.primary,
              marginLeft: '4px',
              fontSize: '0.9rem'
            }} 
          />
          {job.company}
        </Typography>
        
        <Box sx={{ 
          mb: 2,
          p: 1.5, 
          bgcolor: jobSeekerColors.bgVeryLight, 
          borderRadius: 1.5
        }}>
          <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              <LocationOnOutlinedIcon 
                fontSize="small" 
                sx={{ mr: 0.5, fontSize: '1rem', color: jobSeekerColors.primary }} 
              />
              {job.location}
              {job.isRemote && <Chip 
                label="دورکاری" 
                size="small" 
                sx={{ 
                  ml: 1, 
                  fontSize: '0.7rem',
                  height: 20,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  color: jobSeekerColors.primary,
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }} 
              />}
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              <AccessTimeOutlinedIcon 
                fontSize="small" 
                sx={{ mr: 0.5, fontSize: '1rem', color: jobSeekerColors.primary }} 
              />
              {job.timePosted}
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1} sx={{ mb: 0 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              <WorkOutlineIcon 
                fontSize="small" 
                sx={{ mr: 0.5, fontSize: '1rem', color: jobSeekerColors.primary }} 
              />
              {job.jobType}
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              <MonetizationOnOutlinedIcon 
                fontSize="small" 
                sx={{ mr: 0.5, fontSize: '1rem', color: jobSeekerColors.primary }} 
              />
              {job.salary}
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.secondary }}>
            مهارت‌ها:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {job.skills.map((skill, index) => (
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
        
        <Button 
          fullWidth 
          variant="contained" 
          disableElevation
          color="success"
          sx={{ 
            mt: 'auto',
            py: 1.2,
            fontWeight: 'bold',
            borderRadius: 1.5,
            fontSize: '0.9rem',
            boxShadow: '0 4px 8px rgba(0, 112, 60, 0.2)',
          }}
        >
          درخواست همکاری
        </Button>
      </CardContent>
    </Card>
  );
} 