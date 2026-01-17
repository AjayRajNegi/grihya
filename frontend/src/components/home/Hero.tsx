import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="max-w-8xl relative mx-auto bg-[#ffffff] px-4 pt-[20px] md:px-0 md:pt-[10px]">
      {/* MASKED SECTION */}
      <section
        className="invertedRadius relative mx-auto flex min-h-[70vh] w-[95%] items-center overflow-hidden text-white md:min-h-[85vh] md:w-[90%]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1e3c]/90 via-[#0a1e3c]/60 to-transparent" />

        <div className="relative z-10 w-full">
          <div className="max-w-4xl px-6 sm:px-10 md:px-16">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
              OWN A PROPERTY IN <br />
              <span className="font-extrabold">THE ANDAMANS</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-white/90 sm:text-base md:mt-5">
              Get Verified Properties | Transparent Process | Local Expertise |
              All at Grihya
            </p>

            <button
              onClick={() => navigate("/properties")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-2 py-2 pl-4 font-thin text-[#0a1e3c] transition-all duration-300 hover:gap-6 md:mt-8"
            >
              Explore Properties
              <span className="inline-block rounded-full bg-black px-[10px] py-[2px] text-lg text-white">
                ↗
              </span>
            </button>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-6 md:mt-14 md:gap-10">
              {[
                ["1,200+", "Independent Houses"],
                ["2,500+", "Happy Clients"],
                ["1,000+", "PG Accommodations"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-3xl font-extralight sm:text-4xl md:text-5xl">
                    {value}
                  </p>
                  <p className="text-xs text-white/80 sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <div className="absolute bottom-0 right-[8%] flex flex-col items-center gap-1 text-[#0a1e3c] sm:bottom-3 sm:right-[3%] sm:flex-row sm:gap-4 md:right-[6%]">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={`https://i.pravatar.cc/40?img=${i}`}
              className="h-11 w-11 rounded-full border-2 border-white sm:h-16 sm:w-16"
            />
          ))}
        </div>
        <div className="leading-tight">
          <p className="text-right text-sm font-medium sm:text-lg">
            9.2k+ Reviews
          </p>
          <p className="text-base text-yellow-500">
            ★★★★★
            <span className="ml-1 text-sm font-medium text-[#0a1e3c] sm:text-lg">
              5 / 5
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
