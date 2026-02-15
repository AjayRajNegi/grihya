import CarouselWithMultipleSlides from "../customized/carousel/carousel-02";

export function Options() {
  return (
    <section className="max-w-8xl relative mx-auto bg-[#FAFCFE] px-4 pt-[30px] md:px-0">
      <div className="mx-auto w-full overflow-hidden text-black md:w-[90%] lg:px-8">
        {/* Heading */}
        <h2 className="mb-2 text-center text-base font-[500] leading-6 md:text-xl">
          Get started with exploring real estate options
        </h2>
        <CarouselWithMultipleSlides />
      </div>
    </section>
  );
}
