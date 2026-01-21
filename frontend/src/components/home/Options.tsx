export function Options() {
  return (
    <section className="max-w-8xl relative mx-auto bg-[#ffffff] px-4 pt-[40px] md:px-0">
      {/* Real State Options */}
      <div className="mx-auto w-[95%] overflow-hidden text-black md:w-[90%]">
        {/* Heading */}
        <h2 className="text-center text-3xl font-normal md:text-4xl">
          Get started with exploring real estate options
        </h2>

        <section className="mt-5 grid gap-6 md:grid-cols-3 md:gap-10">
          {/* House */}
          <div className="rounded-2xl">
            <img
              src="/images/home/Option1.avif"
              className="h-[200px] w-full rounded-2xl object-cover transition-all duration-300 hover:shadow-2xl"
            />
            <h6 className="mt-2 text-2xl font-semibold text-[#2DB8D1]">
              House
            </h6>
            <p className="text-lg leading-5 text-black">
              Find your perfect house — comfort and convenience await
            </p>
          </div>
          <div className="rounded-2xl">
            <img
              src="/images/home/Option2.avif"
              className="h-[200px] w-full rounded-2xl object-cover transition-all duration-300 hover:shadow-2xl"
            />
            <h6 className="mt-2 text-2xl font-semibold text-[#2DB8D1]">
              Apartment
            </h6>
            <p className="text-lg leading-5 text-black">
              Browse our selection of stunning apartments.
            </p>
          </div>
          <div className="rounded-2xl">
            <img
              src="/images/home/Option3.avif"
              className="h-[200px] w-full rounded-2xl object-cover transition-all duration-300 hover:shadow-2xl"
            />
            <h6 className="mt-2 text-2xl font-semibold text-[#2DB8D1]">
              Business Space
            </h6>
            <p className="text-lg leading-5 text-black">
              Explore a variety of professional spaces tailored to elevate your
              business.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
