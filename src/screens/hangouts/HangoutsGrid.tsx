import Image from "next/image";
import Button from "@/components/Button";
import pic1 from "@/assets/icons/featureImg1.svg";
import pic2 from "@/assets/icons/featureImg2.svg";
import pic3 from "@/assets/icons/featureImg3.svg";
import pic4 from "@/assets/icons/featureImg4.svg";
import pic5 from "@/assets/icons/featureImg5.svg";
import pic6 from "@/assets/icons/featureImg6.svg";

const placeholders = [pic1, pic2, pic3, pic4, pic5, pic6];

type Hangout = {
  id: number;
  title: string;
  price: string;
  location: string;
};

const baseHangouts: Omit<Hangout, "id">[] = [
  { title: "Lekki beach", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { title: "Eko Hotel", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { title: "Hilton Apartment", price: "450,000", location: "Lekki phase 2, Lagos" },
  { title: "Kila Apartment", price: "450,000", location: "Abule Egba, Lagos" },
  { title: "Lakwe beach", price: "450,000", location: "Amuwo Odofin, Lagos" },
];

const hangouts: Hangout[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  ...baseHangouts[i % baseHangouts.length],
}));

export default function HangoutsGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {hangouts.map((hangout, i) => (
        <HangoutCard
          key={hangout.id}
          hangout={hangout}
          image={placeholders[i % placeholders.length]}
        />
      ))}
    </div>
  );
}

function HangoutCard({
  hangout,
  image,
}: {
  hangout: Hangout;
  image: typeof pic1;
}) {
  return (
    <div className="flex flex-col gap-2.5 bg-white rounded-[10px] border border-gray-100 p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[8px] bg-gray-100">
        <Image
          src={image}
          alt={hangout.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-dark text-[13px] font-semibold truncate">
            {hangout.title}
          </h3>
          <VerifiedIcon />
        </div>

        <span className="inline-flex w-fit items-center text-[10px] font-medium px-2 py-0.5 rounded-[6px] border bg-[#FF660014] text-[#FF6600] border-[#FF6600]">
          ₦{hangout.price} (Average per night)
        </span>

        <div className="flex items-center gap-1 text-muted text-[10px]">
          <LocationIcon />
          <span className="truncate">{hangout.location}</span>
        </div>

        <Button
          label="Check it out"
          variant="filled"
          className="mt-1 w-full rounded-lg py-2 text-[12px] h-auto"
        />
      </div>
    </div>
  );
}

function VerifiedIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" fill="#22C55E" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
