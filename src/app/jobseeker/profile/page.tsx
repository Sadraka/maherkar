'use client';

import React from 'react';
import { Container } from '@mui/material';
import JobSeekerProfileForm from '../../../components/jobseeker/profile/JobSeekerProfileForm';

export default function JobSeekerProfilePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <JobSeekerProfileForm />
    </Container>
  );
}


