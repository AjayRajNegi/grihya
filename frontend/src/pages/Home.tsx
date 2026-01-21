import Hero from "@/components/home/Hero";
import ValueSection from "@/components/home/ValueSection";
import FeatureSection from "@/components/home/FeatureSection";
import AdvantagesSection from "@/components/home/AdvantagesSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import CTASection from "@/components/home/CTASection";
import BlogSection from "@/components/blog/Blog";
import { Categories } from "@/components/home/Categories";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Categories
        ImageUrl="/images/home/Advantages3.avif"
        className="md:flex-row-reverse"
        url="/about"
      />
      <BlogSection />
      {/* <ValueSection /> */}
      <FeatureSection />
      <AdvantagesSection />
      <WhyChooseUsSection />
      <CTASection />
    </div>
  );
};

export default Home;
