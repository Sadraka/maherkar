"use client";

import React from 'react';
import EmployerAuthRequired from '@/components/auth/EmployerAuthRequired';
import EmployerCompanies from '@/components/employer/companies/EmployerCompanies';
import { Box, Container } from '@mui/material';

export default function CompaniesPage() {
  return (
    <EmployerAuthRequired>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box>
          <EmployerCompanies />
        </Box>
      </Container>
    </EmployerAuthRequired>
  );
} 