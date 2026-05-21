import Image from "next/image";
import Button from "@/components/Button";
import pic1 from "@/assets/icons/featureImg1.svg";
import pic2 from "@/assets/icons/featureImg2.svg";
import pic3 from "@/assets/icons/featureImg3.svg";
import pic4 from "@/assets/icons/featureImg4.svg";
import pic5 from "@/assets/icons/featureImg5.svg";
import pic6 from "@/assets/icons/featureImg6.svg";

const placeholders = [pic1, pic2, pic3, pic4, pic5, pic6];

type Condition = "Fairly-Used" | "Brand-new";

type Gift = {
  id: number;
  title: string;
  condition: Condition;
  price: string;
  location: string;
};

const gifts: Gift[] = [
  { id: 1, title: "iPhone 13pro", condition: "Fairly-Used", price: "230,000", location: "Amuwo Odofin, Lagos" },
  { id: 2, title: "Nike bag", condition: "Brand-new", price: "50,000", location: "Amuwo Odofin, Lagos" },
  { id: 3, title: "iPhone 16Air", condition: "Fairly-Used", price: "950,000", location: "Amuwo Odofin, Lagos" },
  { id: 4, title: "Nike Shoes", condition: "Brand-new", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { id: 5, title: "Wooden Chair", condition: "Fairly-Used", price: "470,000", location: "Amuwo Odofin, Lagos" },
  { id: 6, title: "MacBook pro", condition: "Brand-new", price: "550,000", location: "Amuwo Odofin, Lagos" },
  { id: 7, title: "iPhone 14pro", condition: "Brand-new", price: "650,000", location: "Amuwo Odofin, Lagos" },
  { id: 8, title: "HP Laptop", condition: "Brand-new", price: "860,000", location: "Amuwo Odofin, Lagos" },
  { id: 9, title: "Nike Shoes", condition: "Brand-new", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { id: 10, title: "Dell Laptop", condition: "Brand-new", price: "550,000", location: "Amuwo Odofin, Lagos" },
  { id: 11, title: "LG TV", condition: "Fairly-Used", price: "400,000", location: "Amuwo Odofin, Lagos" },
  { id: 12, title: "Casino Wristwatch", condition: "Brand-new", price: "40,000", location: "Amuwo Odofin, Lagos" },
  { id: 13, title: "Cloth", condition: "Fairly-Used", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { id: 14, title: "Wristwatch", condition: "Brand-new", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { id: 15, title: "Casino Wristwatch", condition: "Brand-new", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { id: 16, title: "Nike bag", condition: "Brand-new", price: "150,000", location: "Amuwo Odofin, Lagos" },
  { id: 17, title: "Gold Ring", condition: "Brand-new", price: "1,450,000", location: "Amuwo Odofin, Lagos" },
  { id: 18, title: "White Gown", condition: "Fairly-Used", price: "80,000", location: "Amuwo Odofin, Lagos" },
  { id: 19, title: "Sliver Ring", condition: "Brand-new", price: "2,450,000", location: "Amuwo Odofin, Lagos" },
  { id: 20, title: "Nike bag", condition: "Brand-new", price: "200,000", location: "Amuwo Odofin, Lagos" },
  { id: 21, title: "Sliver Bead", condition: "Fairly-Used", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { id: 22, title: "Rose", condition: "Brand-new", price: "7,000", location: "Amuwo Odofin, Lagos" },
  { id: 23, title: "Cake", condition: "Brand-new", price: "57,000", location: "Amuwo Odofin, Lagos" },
  { id: 24, title: "Rose", condition: "Brand-new", price: "450,000", location: "Amuwo Odofin, Lagos" },
  { id: 25, title: "Cupcake", condition: "Brand-new", price: "2,000", location: "Amuwo Odofin, Lagos" },
];

export default function GiftsGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {gifts.map((gift, i) => (
        <GiftCard key={gift.id} gift={gift} image={placeholders[i % placeholders.length]} />
      ))}
    </div>
  );
}

function GiftCard({ gift, image }: { gift: Gift; image: typeof pic1 }) {
  return (
    <div className="flex flex-col gap-2.5 bg-white rounded-[10px] border border-gray-100 p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="relative w-full aspect-square overflow-hidden rounded-[8px] bg-gray-100">
        <Image src={image} alt={gift.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-dark text-[13px] font-semibold truncate">{gift.title}</h3>
          <VerifiedIcon />
        </div>

        <span className="inline-flex w-fit items-center text-[10px] font-medium px-2 py-0.5 rounded-[6px] border bg-[#FF660014] text-[#FF6600] border-[#FF6600]">
          {gift.condition}
        </span>

        <p className="text-muted text-[11px] leading-snug line-clamp-2">
          Designed with cushioning technologies like Nike Air and React foam for all-day comfort.
        </p>

        <div className="flex items-center gap-1 text-muted text-[10px]">
          <LocationIcon />
          <span className="truncate">{gift.location}</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-dark text-[13px] font-semibold whitespace-nowrap">₦{gift.price}</span>
          <Button
            label="Get Gift"
            variant="filled"
            className="rounded-lg px-3 py-1.5 text-[11px] h-auto"
          />
        </div>
      </div>
    </div>
  );
}

function VerifiedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="10" fill="#22C55E" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
      <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
