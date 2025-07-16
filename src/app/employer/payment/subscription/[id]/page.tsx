'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { useParams, useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/axios';

import PaymentForm from '@/components/employer/payment/PaymentForm';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

/**
 * صفحه پرداخت اشتراک
 */
export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subscriptionId = params.id as string;
  const returnTo = searchParams.get('returnTo') || '/employer/jobs/create';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        setLoading(true);
        
        // اگر آیدی 'free' باشد، مستقیماً به صفحه بازگشت
        if (subscriptionId === 'free') {
          window.location.href = returnTo;
          return;
        }

        const response = await apiGet(`/subscriptions/advertisement-subscription/${subscriptionId}/`);
        setSubscriptionData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('خطا در دریافت اطلاعات اشتراک:', err);
        setError(err.response?.data?.Message || 'خطا در بارگذاری اطلاعات اشتراک');
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [subscriptionId, returnTo]);

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (subscriptionData) {
      return (
        <PaymentForm 
          subscription={subscriptionData}
          returnTo={returnTo}
        />
      );
    }

    return <ErrorState message="اطلاعات اشتراک یافت نشد" />;
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }} dir="rtl">
      {renderContent()}
    </Container>
  );
} 