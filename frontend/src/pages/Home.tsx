import Hero from "@/components/home/Hero";
import FeatureSection from "@/components/home/FeatureSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import CTASection from "@/components/home/CTASection";
import BlogSection from "@/components/blog/Blog";
import { Categories } from "@/components/home/Categories";
import { Options } from "@/components/home/Options";
import { Testimonials } from "./Testimonials";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FAFCFE]">
      <Hero />
      {/* Real Estate Options */}
      <Options />

      {/* House */}
      <Categories
        ImageUrl="/images/home/Advantages3.avif"
        className="md:flex-row-reverse"
        url="/properties?type=house&page=1"
      />
      <BlogSection
        title="Top Articles on buying a"
        highlight="House"
        description="Editors' top picked blogs on House Related Properties"
      />
      <FeaturedProperties
        //type="land"
        type="flat"
        url="/properties?type=house&page=1"
        desc="Ready to buy a House quick and easy?"
      />
      <FeatureSection />

      {/* Land */}
      <Categories
        ImageUrl="/images/home/Advantages2.png"
        className="md:flex-row"
        url="/properties?type=land&page=1"
      />
      <BlogSection
        title="Top Articles on buying an Open Land"
        highlight="Open Land"
        description="Editors' top picked blogs on Open Land Properties"
      />
      <FeaturedProperties
        type="land"
        url="/properties?type=land&page=1"
        desc="Ready to buy a Landquick and easy?"
      />

      <WhyChooseUsSection />
      {/* Commercial Property */}
      <Categories
        ImageUrl="/images/home/Advantages1.png"
        className="md:flex-row-reverse"
        url="/properties?type=commercial&page=1"
      />
      <BlogSection
        title="Top Articles on buying an Open Land"
        highlight="Open Land"
        description="Editors' top picked blogs on Open Land Properties"
      />
      <FeaturedProperties
        type="commercial"
        url="/properties?type=commercial&page=1"
        desc="Ready to buy a Commercial Placequick and easy?"
      />

      <Testimonials />
      <CTASection />
    </div>
  );
};

export default Home;
