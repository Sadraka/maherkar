'use client';

import React from 'react';
import { Container, Box } from '@mui/material';
import JobCreationWizard from '@/components/employer/jobs/JobCreationWizard';

/**
 * صفحه ثبت آگهی شغلی جدید با مکانیسم جدید
 */
export default function CreateJobPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }} dir="rtl">
      <JobCreationWizard />
    </Container>
  );
} 