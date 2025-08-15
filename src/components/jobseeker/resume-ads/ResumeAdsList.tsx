'use client'

import React, { useEffect, useState } from 'react';
import { Container, Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { apiGet } from '@/lib/axios';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import CustomPagination from '@/components/common/CustomPagination';
import { 
  ResumeAdCard, 
  EmptyResumeAdsState, 
  ResumeAdsHeader,
  ResumeAdsSearchAndSort
} from '@/components/jobseeker/resume-ads';

/**
 * کامپوننت لیست آگهی‌های رزومه کارجو
 */
export default function ResumeAdsList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeAdsData, setResumeAdsData] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const pageSize = 12;

  // دریافت آگهی‌های رزومه
  const fetchResumeAds = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/ads/resume/my-resumes/');
      const data = response.data?.results || response.data || [];
      setResumeAdsData(data);
      setError(null);
    } catch (err: any) {
      console.error('خطا در دریافت آگهی‌های رزومه:', err);
      setError(err.response?.data?.error || 'خطا در بارگذاری آگهی‌های رزومه');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeAds();
  }, []);

  // فیلترینگ و جستجو
  useEffect(() => {
    let filtered = [...resumeAdsData];

    // جستجو در عنوان
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title?.toLowerCase().includes(query) ||
        ad.industry?.name?.toLowerCase().includes(query) ||
        ad.location?.name?.toLowerCase().includes(query)
      );
    }

    // فیلتر وضعیت
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ad => ad.status === statusFilter);
    }

    // مرتب‌سازی
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAds(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1); // ریست صفحه هنگام تغییر فیلتر
  }, [resumeAdsData, searchQuery, statusFilter, sortBy, sortOrder]);

  // گرفتن آگهی‌های صفحه جاری
  const getCurrentPageAds = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAds.slice(startIndex, endIndex);
  };

  const handleRefresh = () => {
    fetchResumeAds();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px',
          textAlign: 'center'
        }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: JOB_SEEKER_THEME.primary,
              mb: 2
            }} 
          />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 500, mx: 'auto' }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={handleRefresh}
            sx={{ backgroundColor: JOB_SEEKER_THEME.primary }}
          >
            تلاش مجدد
          </Button>
        </Box>
      );
    }

    if (!resumeAdsData.length) {
      // در حالت خالی: فقط کارت خالی را نشان بده و دکمه ایجاد را از هدر حذف کن
      return (
        <>
          <ResumeAdsHeader showCreateButton={false} />
          <EmptyResumeAdsState />
        </>
      );
    }

    const currentAds = getCurrentPageAds();

    return (
      <>
        <ResumeAdsSearchAndSort
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          totalCount={filteredAds.length}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: { xs: 2, sm: 3, md: 4 },
            mb: 4
          }}
        >
          {currentAds.map((ad) => (
            <ResumeAdCard 
              key={ad.id} 
              resumeAd={ad} 
              onUpdate={handleRefresh}
            />
          ))}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              color={JOB_SEEKER_THEME.primary}
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }} dir="rtl">
      {renderContent()}
    </Container>
  );
}
