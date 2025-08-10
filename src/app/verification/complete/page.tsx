'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import EmployerVerificationForm from '@/components/employer/verification/EmployerVerificationForm';

/**
 * صفحه تکمیل اطلاعات تایید هویت کارفرما
 */
export default function VerificationCompletePage() {
  console.log('VerificationCompletePage rendering...');
  
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h1>تست صفحه تکمیل اطلاعات</h1>
      <p>این متن باید نمایش داده شود</p>
      <EmployerVerificationForm />
    </div>
  );
}
