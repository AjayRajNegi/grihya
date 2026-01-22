import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    review:
      "Buying my vacation home was surprisingly easy. Sophia really knew her stuff and made the whole process super smooth. I didn’t have to worry about a thing.",
    name: "Nathan Harper",
    title: "Software Developer",
  },
  {
    id: 2,
    review:
      "From the first call to closing day, everything was handled professionally. I felt informed and confident every step of the way.",
    name: "Emily Rodriguez",
    title: "Marketing Manager",
  },
  {
    id: 3,
    review:
      "I was nervous about buying my first home, but the guidance I received made it feel simple and stress-free. Highly recommended.",
    name: "Jason Liu",
    title: "Product Designer",
  },
  {
    id: 4,
    review:
      "What stood out the most was the attention to detail and constant communication. I always knew what was happening.",
    name: "Olivia Bennett",
    title: "UX Researcher",
  },
  {
    id: 5,
    review:
      "The entire experience exceeded my expectations. I found the perfect place faster than I ever imagined.",
    name: "Michael Thompson",
    title: "Financial Analyst",
  },
  {
    id: 6,
    review:
      "Professional, responsive, and genuinely caring. I felt like my needs were truly understood.",
    name: "Sarah Collins",
    title: "HR Consultant",
  },
];

export function Testimonials() {
  return (
    <section className="max-w-8xl relative mx-auto my-10 bg-[#FAFCFE] px-4 pt-[40px] md:my-20 md:px-0">
      <div className="mx-auto flex w-full flex-col text-black md:w-[90%] lg:flex-row">
        {/* Left container */}
        <section className="relative w-full lg:w-1/3">
          <div className="sticky top-32">
            <div className="justify-left mb-1 flex items-center gap-2 md:mb-2">
              <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
              <span className="text-base font-medium text-gray-700">
                Testimonials
              </span>
            </div>

            <h1 className="mx-auto max-w-4xl text-left text-xl font-[500] tracking-tighter text-gray-900 md:mb-2 md:text-2xl">
              Trusted by Many, Loved by All
            </h1>
            <p className="text-lg">
              Discover success through their words—read our testimonials.
            </p>
          </div>
        </section>
        <section className="mt-5 grid w-full grid-cols-1 gap-3 md:mt-0 md:grid-cols-2 md:gap-6 lg:w-2/3">
          {testimonials.map((item, id) => (
            <div
              key={id}
              className="flex h-fit flex-col rounded-3xl border-[0.5px] border-black/30 bg-white p-8"
            >
              <p className="flex gap-2">
                <Star fill="#2DB8D1" className="text-[#2DB8D1]" size={15} />
                <Star fill="#2DB8D1" className="text-[#2DB8D1]" size={15} />
                <Star fill="#2DB8D1" className="text-[#2DB8D1]" size={15} />
                <Star fill="#2DB8D1" className="text-[#2DB8D1]" size={15} />
                <Star fill="#2DB8D1" className="text-[#2DB8D1]" size={15} />
              </p>
              <p className="mt-3 text-base">{item.review}</p>
              <div className="mt-6 flex items-center gap-2">
                <img
                  src={`https://i.pravatar.cc/80?img=${id}`}
                  className="h-12 rounded-full"
                />
                <div>
                  <h6 className="font-semibold leading-3">{item.name}</h6>
                  <p className="font-thin">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}
