'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import EmployerVerificationRejected from '@/components/employer/verification/EmployerVerificationRejected';

/**
 * صفحه رد تایید کارفرما
 */
export default function VerificationRejectedPage() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h1>صفحه رد تایید</h1>
      <EmployerVerificationRejected />
    </div>
  );
}
