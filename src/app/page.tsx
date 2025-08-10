/**
 * صفحه اصلی سایت ماهرکار
 * پلتفرم کاریابی ساده و کارآمد که امکان انتشار آگهی‌های شغلی و ارتباط کارفرمایان و کارجویان را فراهم می‌کند
 */

import Hero from '@/components/home/Hero';
import JobListings from '@/components/home/JobListings';
import Experts from '@/components/home/Experts';
import DailyHiring from '@/components/home/DailyHiring';
import FAQ from '@/components/home/FAQ';
import AboutUs from '@/components/home/AboutUs';
import Footer from '@/components/layout/Footer';
import CombinedInfo from '@/components/home/CombinedInfo';
import { getInitialData } from '@/lib/initialData';

export default async function Home() {
  // دریافت داده‌های اولیه در server-side
  const initialData = await getInitialData();

  return (
    <main>
      {/* بخش جستجوی صفحه اصلی */}
      <Hero initialData={initialData} />

      {/* بخش نمایش آگهی‌های شغلی */}
      <JobListings />

      {/* بخش نمایش متخصصین */}
      <Experts />

      {/* بخش ترکیبی استخدام روزانه و درباره ما */}
      <CombinedInfo />

      {/* سوالات متداول - غیرفعال شده */}
      {/* <FAQ /> */}

      {/* درباره ما - غیرفعال شده */}
      {/* <AboutUs /> */}

      {/* فوتر سایت */}
      <Footer />
    </main>
  );
}
