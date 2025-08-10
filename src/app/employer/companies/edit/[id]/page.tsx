import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import EditCompanyForm from '@/components/employer/companies/EditCompanyForm';
import { EMPLOYER_THEME } from '@/constants/colors';

export const metadata: Metadata = {
  title: 'ویرایش شرکت',
  description: 'ویرایش اطلاعات شرکت در ماهرکار',
};

export default function EditCompanyPage() {
  return (
    <div dir="rtl" style={{ padding: '24px 0' }}>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 700,
                color: EMPLOYER_THEME.primary,
              }}
            >
              ویرایش شرکت
            </h1>
          </div>

          <Link
            href="/employer/companies"
            style={{
              color: EMPLOYER_THEME.primary,
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            ← بازگشت به لیست شرکت‌ها
          </Link>
        </div>

        <div style={{ marginTop: 12 }}>
          <EditCompanyForm />
        </div>
      </div>
    </div>
  );
}