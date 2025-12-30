import Blog from "../components/blog/Blog";
import { Navbar } from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import ValueSection from "@/components/home/ValueSection";
import FeatureSection from "@/components/home/FeatureSection";
import AdvantagesSection from "@/components/home/AdvantagesSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ValueSection />
      <FeatureSection />
      <AdvantagesSection />
      <Blog />
    </div>
  );
};

export default Home;
