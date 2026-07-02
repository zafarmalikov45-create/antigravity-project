import SkeletonLoader from '@/components/ui/SkeletonLoader';
import NodeNetwork from '@/components/canvas/NodeNetwork';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ProcessSection from '@/components/sections/ProcessSection';
import StatsSection from '@/components/sections/StatsSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <SkeletonLoader />
      <NodeNetwork />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <ServicesSection />
        <ProcessSection />
        <StatsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
