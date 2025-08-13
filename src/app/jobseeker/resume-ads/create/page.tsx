'use client';

import React from 'react';
import { Container, Box } from '@mui/material';
import CreateResumeAdForm from '@/components/jobseeker/resume-ads/CreateResumeAdForm';

/**
 * صفحه ثبت آگهی رزومه جدید
 */
export default function CreateResumeAdPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }} dir="rtl">
      <CreateResumeAdForm />
    </Container>
  );
}