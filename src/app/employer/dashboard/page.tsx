"use client";

import React from 'react';
import EmployerLayout from '@/components/employer/layout/EmployerLayout';
import EmployerDashboard from '@/components/employer/dashboard/EmployerDashboard';
import EmployerAuthRequired from '@/components/auth/EmployerAuthRequired';

export default function EmployerDashboardPage() {
  return (
    <EmployerAuthRequired>
      <EmployerLayout>
        <EmployerDashboard />
      </EmployerLayout>
    </EmployerAuthRequired>
  );
} 