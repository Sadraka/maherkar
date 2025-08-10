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
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { 
        xs: '1fr', 
        sm: 'repeat(2, 1fr)', 
        md: 'repeat(3, 1fr)' 
      }, 
      gap: { xs: 2, sm: 3, md: 4 },
      '& > *': {
        height: 'auto'
      }
    }}>
      {companies.map((company, index) => (
        <CompanyCard key={company.id || index} company={company} index={index} />
      ))}
    </Box>
  );
};

export default CompaniesGrid; 