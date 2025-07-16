'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import JobCard from './JobCard';
import EmptyJobsState from './EmptyJobsState';
import { JobAdvertisement } from '@/types';

interface JobsGridProps {
  jobs: JobAdvertisement[];
  loading?: boolean;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onView?: (jobId: string) => void;
}

const JobsGrid: React.FC<JobsGridProps> = ({
  jobs,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                height: 400,
                bgcolor: 'grey.100',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.4,
                  },
                  '100%': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Typography variant="body2" color="text.secondary">
                در حال بارگذاری...
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  if (!jobs || jobs.length === 0) {
    return <EmptyJobsState />;
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {jobs.map((job, index) => (
          <Box key={job.id} sx={{ display: 'flex', flexDirection: 'column' }}>
            <JobCard
              job={job}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default JobsGrid; 