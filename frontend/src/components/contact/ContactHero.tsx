import {
  MailOpenIcon,
  MapPinIcon,
  PhoneCallIcon,
  PhoneIcon,
  SmartphoneIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function ContactHero() {
  return (
    <section className="relative h-[550px] w-full rounded-3xl px-5 sm:mx-auto sm:h-[60vh] sm:max-w-6xl sm:px-0">
      {/* Background image */}
      <div
        className="absolute inset-4 rounded-3xl bg-cover bg-center sm:inset-0"
        style={{
          backgroundImage: "url('/images/property/Hero.png')",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-4 rounded-3xl bg-black/20 sm:inset-0" />

      {/* Content */}
      <div className="relative top-[30%] z-10 mx-auto flex max-w-7xl -translate-y-1/2 flex-col items-center justify-center px-4 text-center sm:top-[50%] sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
          We&apos;re Here For You
        </h1>

        <p className="max-w-2xl text-base leading-tight tracking-tight text-white/90 sm:text-lg">
          We&apos;d love to have a chat with you to see how we can help you and
          your plans.
        </p>

        <Popover>
          <PopoverTrigger>
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E3E7F1] px-4 py-3 text-sm font-semibold text-black">
              <PhoneCallIcon className="text-[#35B1C6]" size={18} />
              Book a call now
            </p>
          </PopoverTrigger>
          <PopoverContent className="max-w-[240px] overflow-hidden rounded-xl text-sm font-medium">
            <div className="bg-white p-3">
              <p>
                Hello There! Feel free to react out to us regarding any query.
              </p>
              <p className="mt-3 flex items-center justify-between rounded-[10px] bg-[#E4E9F2] p-2">
                Call our front desk
                <SmartphoneIcon className="text-[#35B1C6]" size={15} />
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {/* Floating search bar */}
      <div className="absolute -bottom-28 left-1/2 w-[90%] -translate-x-1/2 px-4 sm:px-6 md:bottom-0 md:w-full lg:px-8">
        <div className="md:8 mx-auto flex max-w-5xl flex-col justify-between gap-8 rounded-3xl bg-white p-5 shadow-xl md:flex-row md:gap-0 md:rounded-b-none md:pb-4 md:shadow-none lg:p-10">
          <div className="flex gap-2 sm:gap-4">
            <div className="h-fit rounded-2xl bg-[#F7F7F7] p-3 md:p-4">
              <MailOpenIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-medium md:text-base">email address:</p>
              <p className="overflow-hidden truncate text-base font-medium text-[#3BB8D1] md:text-xl">
                grihya.service@gmail.com
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <div className="h-fit rounded-2xl bg-[#F7F7F7] p-3 md:p-4">
              <PhoneIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-medium md:text-base">phone number:</p>
              <p className="text-base font-medium text-[#3BB8D1] md:text-xl">
                +91 8422950663
              </p>
            </div>
          </div>
          <div className="gap-4gap-2 flex sm:gap-4">
            <div className="h-fit rounded-2xl bg-[#F7F7F7] p-3 md:p-4">
              <MapPinIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-medium md:text-base">location:</p>
              <p className="text-wrap text-base font-medium text-[#3BB8D1] md:text-xl">
                andman and nicobar islands
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
