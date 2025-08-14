import React from 'react';

export default function EmployerPaymentCallbackLayout({ children }: { children: React.ReactNode }) {
  // این لایوت بدون نیاز به احراز هویت کارفرما است تا کارجو نیز بتواند صفحهٔ نتیجه پرداخت را ببیند.
  return <>{children}</>;
}
