'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, Breadcrumbs, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { apiGet } from '@/lib/axios';
import { EMPLOYER_THEME } from '@/constants/colors';
import { useParams } from 'next/navigation';

// آیکون‌ها
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';

// کامپوننت‌ها
import CompanyDetails from '@/components/employer/companies/CompanyDetails';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

/**
 * صفحه نمایش جزئیات شرکت
 */
export default function CompanyDetailsPage() {
  // استفاده از useParams به جای props
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/companies/${id}/`);
        setCompany(response.data);
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت اطلاعات شرکت:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری اطلاعات شرکت');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  // رندر محتوای اصلی صفحه
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (!company) {
      return <ErrorState message="اطلاعات شرکت یافت نشد" />;
    }

    return <CompanyDetails company={company} />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6, textAlign: 'right' }} dir="rtl">
     
      {/* هدر صفحه */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: { xs: 3, sm: 4 },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: EMPLOYER_THEME.light,
              color: EMPLOYER_THEME.primary,
              '&:hover': { borderColor: EMPLOYER_THEME.primary },
              ml: 2,
              borderRadius: 2
            }}
            component={Link}
            href="/employer/companies"
          >
            بازگشت
          </Button>
          <Typography variant="h5" component="h1" fontWeight="bold">
           
          </Typography>
        </Box>

        {!loading && company && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ 
            
              bgcolor: EMPLOYER_THEME.primary,
              '&:hover': { bgcolor: EMPLOYER_THEME.dark },
              borderRadius: 2
            }}
            component={Link}
            href={`/employer/companies/edit/${company.id}`}
          >
            ویرایش شرکت
          </Button>
        )}
      </Box>

      {/* محتوای اصلی */}
      {renderContent()}
    </Container>
  );
} 