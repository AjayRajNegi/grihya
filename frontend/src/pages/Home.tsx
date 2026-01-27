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
        className="md:flex-row-reverse"
        config={{
          header: "Ready to buy a Commercial Place quick and easy?",
          title: "Explore best Housing properties with Grihya",
          desc: "Trusted residential solutions for buying, selling, and renting homes.",
          image: {
            url: "/images/home/cat1.jpg",
            title: "Residential Homes",
            description:
              "Experience elegance and comfort with our exclusive luxury villas.",
          },
          cta: {
            text: "View Properties",
            url: "/properties?type=house&page=1",
          },
          features: [
            {
              id: 1,
              title: "Modern Villa",
              description:
                "Discover the luxury and comfort of modern villa living",
              image: "/images/home/Vision1.png",
              delay: 0.2,
            },
            {
              id: 2,
              title: "Expert Guidance",
              description:
                "Professional support from search to final possession",
              image: "/images/home/Vision4.png",
              delay: 0.35,
            },
          ],
        }}
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
        className="md:flex-row"
        config={{
          header: "Explore best Open Land properties with Grihya",
          title: "Explore best Open Land properties with Grihya",
          desc: "Secure land investments backed by due diligence and local expertise.",
          image: {
            url: "/images/home/cat2.jpg",
            title: "Residential Homes",
            description:
              "Experience elegance and comfort with our exclusive luxury villas.",
          },
          cta: {
            text: "View Properties",
            url: "/properties?type=land&page=1",
          },
          features: [
            {
              id: 1,
              title: "Verified Land & Property Listings",
              description:
                "All plots and properties are checked for clear titles, ownership, and legal compliance.",
              image: "/images/home/Vision1.png",
              delay: 0.2,
            },
            {
              id: 2,
              title: "Expert Advisory",
              description:
                "Guidance from site search to deal closure, including valuation and feasibility insights.",
              image: "/images/home/Vision4.png",
              delay: 0.35,
            },
            {
              id: 3,
              title: "Legal & Documentation Support",
              description:
                "Complete management of agreements, land registration, permits, and other legal formalities.",
              image: "/images/home/Vision5.png",
              delay: 0.5,
            },
            {
              id: 4,
              title: "Financing $ Loan Assistance",
              description:
                "Support for property loans, agricultural land finance, and other funding options.",
              image: "/images/home/Vision6.png",
              delay: 0.65,
            },
          ],
        }}
      />
      <BlogSection
        title="Top Articles on buying an Open Land"
        highlight="Open Land"
        description="Editors' top picked blogs on Open Land Properties"
      />
      <FeaturedProperties
        //type="land"
        type="flat"
        url="/properties?type=land&page=1"
        desc="Ready to buy a Landquick and easy?"
      />

      <WhyChooseUsSection />
      {/* Commercial Property */}
      <Categories
        className="md:flex-row-reverse"
        config={{
          header: "Ready to buy a Commercial Place quick and easy?",
          title: "Explore best Commercial properties with Grihya",
          desc: "Spaces designed to support business growth and long-term value.",
          image: {
            url: "/images/home/cat3.jpg",
            title: "Residential Homes",
            description:
              "Experience elegance and comfort with our exclusive luxury villas.",
          },
          cta: {
            text: "View Properties",
            url: "/properties?type=commercial&page=1",
          },
          features: [
            {
              id: 1,
              title: "Expert Advisory",
              description:
                "Professional guidance from property search to deal closure, tailored for commercial requirements.",
              image: "/images/home/Vision1.png",
              delay: 0.2,
            },
            {
              id: 2,
              title: "Legal & Compliance Support",
              description:
                "Complete handling of agreements, permits, and regulatory formalities.",
              image: "/images/home/Vision5.png",
              delay: 0.35,
            },
          ],
        }}
      />
      <BlogSection
        title="Top Articles on buying an Open Land"
        highlight="Open Land"
        description="Editors' top picked blogs on Open Land Properties"
      />
      <FeaturedProperties
        //type="commercial"
        type="flat"
        url="/properties?type=commercial&page=1"
        desc="Ready to buy a Commercial Placequick and easy?"
      />

      <Testimonials />
      <CTASection />
    </div>
  );
};

export default Home;
