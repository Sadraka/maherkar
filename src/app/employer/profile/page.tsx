"use client";

import React from 'react';
import EmployerLayout from '@/components/employer/layout/EmployerLayout';
import EmployerProfile from '@/components/employer/profile/EmployerProfile';
import EmployerAuthRequired from '@/components/auth/EmployerAuthRequired';

export default function EmployerProfilePage() {
  return (
    <EmployerAuthRequired>
      <EmployerLayout>
        <EmployerProfile />
      </EmployerLayout>
    </EmployerAuthRequired>
  );
} 