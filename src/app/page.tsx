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
      <Header />
      <Hero />
      <JobListings />
      <Experts />
      <DailyHiring />
      <FAQ />
      <AboutUs />
      <Footer />
    </main>
  );
}
