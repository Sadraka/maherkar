import localFont from 'next/font/local';

export const iranSansFont = localFont({
  src: [
    {
      path: '../../public/fonts/IRANSansX-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IRANSansX-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'block', // تغییر از swap به block برای جلوگیری از FOIT
  variable: '--font-iransans',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
}); 