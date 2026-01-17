import Hero from "@/components/home/Hero";
import ValueSection from "@/components/home/ValueSection";
import FeatureSection from "@/components/home/FeatureSection";
import AdvantagesSection from "@/components/home/AdvantagesSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import CTASection from "@/components/home/CTASection";
import FAQSection from "@/components/home/FAQSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ValueSection />
      <FAQSection />
      <FeatureSection />
      <AdvantagesSection />
      <WhyChooseUsSection />
      <CTASection />
    </div>
  );
};

export default Home;
