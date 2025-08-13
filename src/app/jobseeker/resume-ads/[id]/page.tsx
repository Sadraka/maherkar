'use client';

import { useParams } from 'next/navigation';
import ResumeAdDetail from '@/components/jobseeker/resume-ads/ResumeAdDetail';

export default function ResumeAdDetailPage() {
  const params = useParams();
  const adId = params.id as string;

  return <ResumeAdDetail adId={adId} />;
}
