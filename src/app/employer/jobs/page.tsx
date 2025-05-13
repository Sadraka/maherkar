"use client";

import React from 'react';
import EmployerLayout from '@/components/employer/layout/EmployerLayout';
import EmployerJobs from '@/components/employer/jobs/EmployerJobs';
import EmployerAuthRequired from '@/components/auth/EmployerAuthRequired';

export default function EmployerJobsPage() {
  return (
    <EmployerAuthRequired>
      <EmployerLayout>
        <EmployerJobs />
      </EmployerLayout>
    </EmployerAuthRequired>
  );
} 