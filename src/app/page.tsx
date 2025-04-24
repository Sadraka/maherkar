/**
 * صفحه اصلی سایت ماهرکار
 * پلتفرم کاریابی ساده و کارآمد که امکان انتشار آگهی‌های شغلی و ارتباط کارفرمایان و کارجویان را فراهم می‌کند
 */

import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import JobListings from '@/components/home/JobListings';
import Experts from '@/components/home/Experts';
import DailyHiring from '@/components/home/DailyHiring';
import FAQ from '@/components/home/FAQ';
import AboutUs from '@/components/home/AboutUs';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main>
      {/* هدر سایت */}
      <Header />
      
      {/* بخش جستجوی صفحه اصلی */}
      <Hero />
      
      {/* بخش نمایش آگهی‌های شغلی */}
      <JobListings />
      
      {/* بخش نمایش متخصصین */}
      <Experts />
      
      {/* بخش استخدام روزانه */}
      <DailyHiring />
      
      {/* سوالات متداول */}
      <FAQ />
      
      {/* درباره ما */}
      <AboutUs />
      
      {/* فوتر سایت */}
      <Footer />
    </main>
  );
}
