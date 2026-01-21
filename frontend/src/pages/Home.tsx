import Hero from "@/components/home/Hero";
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
      <BlogSection
        title="Top Articles on buying a"
        highlight="House"
        description="Editors' top picked blogs on House Related Properties"
      />
      <FeatureSection />
      <Categories
        ImageUrl="/images/home/Advantages2.png"
        className="md:flex-row"
        url="/about"
      />
      <BlogSection
        title="Top Articles on buying an Open Land"
        highlight="Open Land"
        description="Editors' top picked blogs on Open Land Properties"
      />
      <AdvantagesSection />
      <WhyChooseUsSection />
      <Categories
        ImageUrl="/images/home/Advantages1.png"
        className="md:flex-row-reverse"
        url="/about"
      />
      <BlogSection
        title="Top Articles on buying an Open Land"
        highlight="Open Land"
        description="Editors' top picked blogs on Open Land Properties"
      />
      <CTASection />
    </div>
  );
};

export default Home;
