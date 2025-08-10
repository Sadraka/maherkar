'use client';

import React from 'react';
import EmployerVerificationForm from '@/components/employer/verification/EmployerVerificationForm';

export default function VerificationCompletePage() {
  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      left: '0',
      right: '0',
      minHeight: 'calc(100vh - 70px)',
      backgroundColor: '#f8fafd',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <EmployerVerificationForm />
    </div>
  );
}