'use client'

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  Chip, 
  IconButton, 
  Divider, 
  useTheme 
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';

// تعریف تایپ جاب
export type JobType = {
  id: number;
  title: string;
  location: string;
  isRemote: boolean;
  salary: string;
  skills: string[];
  isFavorite: boolean;
  isUrgent: boolean;
  timePosted: string;
  company: string;
  jobType: string;
};

interface JobCardProps {
  job: JobType;
  onToggleFavorite: (id: number) => void;
}

export default function JobCard({ job, onToggleFavorite }: JobCardProps) {
  const theme = useTheme();

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        borderColor: 'transparent',
        boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
        }
      }}
    >
      <Box 
        sx={{ 
          height: '6px', 
          background: job.isUrgent 
            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` 
            : 'transparent' 
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                mb: 0.5, 
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                color: theme.palette.text.primary
              }}
            >
              {job.title}
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                mb: 1.5,
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <BusinessCenterIcon fontSize="small" sx={{ color: theme.palette.primary.main, opacity: 0.8, fontSize: '1rem' }} />
              {job.company}
            </Typography>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={() => onToggleFavorite(job.id)}
            sx={{ color: job.isFavorite ? theme.palette.primary.main : '#bdbdbd' }}
          >
            {job.isFavorite ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: theme.palette.text.secondary,
              fontSize: '0.875rem'
            }}
          >
            <LocationOnOutlinedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
            {job.location}
            {job.isRemote && <Chip 
              label="دورکاری" 
              size="small" 
              sx={{ 
                ml: 1, 
                fontSize: '0.7rem',
                height: 20,
                backgroundColor: `${theme.palette.secondary.main}15`,
                color: theme.palette.secondary.main,
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
            <AccessTimeOutlinedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
            {job.timePosted}
          </Box>
        </Stack>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: theme.palette.text.secondary,
              fontSize: '0.875rem'
            }}
          >
            <WorkOutlineIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
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
            <MonetizationOnOutlinedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
            {job.salary}
          </Box>
        </Stack>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {job.skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(0,0,0,0.04)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  borderRadius: 1
                }}
              />
            ))}
          </Stack>
        </Box>
        
        <Button 
          variant="outlined" 
          fullWidth
          sx={{ 
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}10`,
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          مشاهده آگهی
        </Button>
      </CardContent>
    </Card>
  );
} 