import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#ffffff] max-w-8xl mx-auto relative pt-[20px] md:pt-[40px] px-4 md:px-0">
      {/* MASKED SECTION */}
      <section
        className="relative min-h-[70vh] md:min-h-[85vh] w-[95%] md:w-[90%] text-white flex mx-auto items-center invertedRadius overflow-hidden"
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
          <div className="px-6 sm:px-10 md:px-16 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
              OWN A PROPERTY IN <br />
              <span className="font-extrabold">THE ANDAMANS</span>
            </h1>

            <p className="mt-4 md:mt-5 max-w-xl text-sm sm:text-base text-white/90">
              Get Verified Properties | Transparent Process | Local Expertise |
              All at Grihya
            </p>

            <button
              onClick={() => navigate("/properties")}
              className="mt-6 md:mt-8 inline-flex items-center gap-2 hover:gap-6 bg-white text-[#0a1e3c] px-2 pl-4 py-2 rounded-full font-thin transition-all duration-300"
            >
              Explore Properties
              <span className="inline-block text-lg bg-black text-white rounded-full px-[10px] py-[2px]">
                ↗
              </span>
            </button>

            {/* Stats */}
            <div className="mt-10 md:mt-14 flex flex-wrap gap-6 md:gap-10">
              {[
                ["1,200+", "Independent Houses"],
                ["2,500+", "Happy Clients"],
                ["1,000+", "PG Accommodations"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-extralight">
                    {value}
                  </p>
                  <p className="text-xs sm:text-sm text-white/80">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <div className="absolute bottom-0 sm:bottom-3 right-[8%] sm:right-[3%] md:right-[6%] text-[#0a1e3c] flex flex-col sm:flex-row items-center gap-1 sm:gap-4 ">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={`https://i.pravatar.cc/40?img=${i}`}
              className="w-11 h-11 sm:w-16 sm:h-16 rounded-full border-2 border-white"
            />
          ))}
        </div>
        <div className="leading-tight">
          <p className="text-sm text-right sm:text-lg font-medium">
            9.2k+ Reviews
          </p>
          <p className="text-yellow-500 text-base">
            ★★★★★
            <span className="text-[#0a1e3c] text-sm sm:text-lg font-medium ml-1">
              5 / 5
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
