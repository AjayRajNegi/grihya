import Blog from "../components/blog/Blog";
import { Navbar } from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import ValueSection from "@/components/home/ValueSection";
import FeatureSection from "@/components/home/FeatureSection";
import AdvantagesSection from "@/components/home/AdvantagesSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* <HeroSection /> */}
      <Hero />
      <ValueSection />
      <FeatureSection />
      <AdvantagesSection />
      <WhyChooseUsSection />
      <Blog />
    </div>
  );
};

export default Home;
