import React from 'react';
import { Box } from '@mui/material';
import CompanyCard from './CompanyCard';

interface CompaniesGridProps {
  companies: any[];
}

/**
 * کامپوننت نمایش شبکه‌ای شرکت‌ها
 */
const CompaniesGrid = ({ companies }: CompaniesGridProps) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {companies.map((company, index) => (
        <Box key={company.id || index} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
          <CompanyCard company={company} index={index} />
        </Box>
      ))}
    </Box>
  );
};

export default CompaniesGrid; 