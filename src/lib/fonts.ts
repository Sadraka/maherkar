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
  display: 'swap',
  variable: '--font-iransans'
}); 