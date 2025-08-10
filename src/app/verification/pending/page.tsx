'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import EmployerVerificationPending from '@/components/employer/verification/EmployerVerificationPending';

/**
 * صفحه انتظار تایید ادمین
 */
export default function VerificationPendingPage() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h1>صفحه انتظار تایید</h1>
      <EmployerVerificationPending />
    </div>
  );
}
