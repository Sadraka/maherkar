'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import StarIcon from '@mui/icons-material/Star';

import { JOB_SEEKER_THEME } from '@/constants/colors';

interface Skill {
  id?: number;
  skill?: number | {
    id: number;
    name: string;
    icon?: string;
    industry: { id: number; name: string };
  };
  level: string;
}

interface SkillsPreviewCardProps {
  skills: Skill[];
  availableSkills?: any[];
}

// تابع تبدیل سطح مهارت به برچسب
const getLevelLabel = (level: string): string => {
  const levelMap: { [key: string]: string } = {
    'beginner': 'مبتدی',
    'intermediate': 'متوسط',
    'advanced': 'پیشرفته',
    'expert': 'خبره'
  };
  return levelMap[level] || level;
};

// تابع تبدیل سطح مهارت به رنگ
const getLevelColor = (level: string): string => {
  const colorMap: { [key: string]: string } = {
    'beginner': '#ff9800',
    'intermediate': '#2196f3',
    'advanced': '#4caf50',
    'expert': '#9c27b0'
  };
  return colorMap[level] || '#757575';
};

export default function SkillsPreviewCard({ skills, availableSkills = [] }: SkillsPreviewCardProps) {
  const jobseekerColors = JOB_SEEKER_THEME;

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
      gap: 2
    }}>
      {skills.filter(skill => !!skill.skill).map((skill, index) => (
        <Box key={skill.id || index} sx={{ 
          border: `1px solid ${alpha(jobseekerColors.primary, 0.2)}`,
          borderRadius: 1,
          backgroundColor: 'transparent',
          p: 1
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                color: jobseekerColors.primary, 
                fontWeight: 700,
                mb: 0.5,
                fontSize: '0.95rem'
              }}>
                {typeof skill.skill === 'object'
                  ? (skill.skill?.name || 'مهارت نامشخص')
                  : (availableSkills.find(s => s.id === skill.skill)?.name || 'مهارت نامشخص')}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip 
                  label={getLevelLabel(skill.level)}
                  size="small"
                  sx={{ 
                    backgroundColor: getLevelColor(skill.level),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <StarIcon 
                      key={i}
                      fontSize="small"
                      sx={{
                        color: i < getStarCount(skill.level) ? getLevelColor(skill.level) : alpha(jobseekerColors.primary, 0.2),
                        fontSize: '14px'
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              {typeof skill.skill === 'object' && skill.skill?.industry && (
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.7rem'
                }}>
                  {skill.skill.industry.name}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// تابع تبدیل سطح مهارت به تعداد ستاره
const getStarCount = (level: string): number => {
  const starMap: { [key: string]: number } = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4
  };
  return starMap[level] || 0;
};
