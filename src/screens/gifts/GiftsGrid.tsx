import Image from "next/image";
import Button from "@/components/Button";
import pic1 from "@/assets/icons/featureImg1.svg";
import pic2 from "@/assets/icons/featureImg2.svg";
import pic3 from "@/assets/icons/featureImg3.svg";
import pic4 from "@/assets/icons/featureImg4.svg";
import pic5 from "@/assets/icons/featureImg5.svg";
import pic6 from "@/assets/icons/featureImg6.svg";
import verified from "@/assets/icons/verified.svg";
import locationIcon from "@/assets/icons/location.svg";

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
    <div className="grid grid-cols-[repeat(auto-fill,225px)] justify-center gap-3 ">
      {gifts.map((gift, i) => (
        <GiftCard key={gift.id} gift={gift} image={placeholders[i % placeholders.length]} />
      ))}
    </div>
  );
}

function GiftCard({ gift, image }: { gift: Gift; image: typeof pic1 }) {
  return (
    <div className="flex flex-col gap-2.5 bg-white rounded-[12px] border border-gray-100 px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="relative w-full aspect-square overflow-hidden rounded-[6px] bg-gray-100">
        <Image src={image} alt={gift.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[#4E4C4D] text-[16px] font-semibold font-nunito truncate">{gift.title}</h3>
         <Image src={verified} alt="Verified" className="w-4.5 h-4.4" />
        </div>

        <span className="inline-flex w-fit items-center text-[10px] font-medium px-2 py-0.5 rounded-[10px] border-[1px] bg-[#FF66001A] text-[#FF6600] border-[#FF6600]">
          {gift.condition}
        </span>

        <p className="text-neutral text-[9px] leading-snug line-clamp-2">
          Designed with cushioning technologies like Nike Air and React foam for all-day comfort.
        </p>

        <div className="flex items-center gap-1 text-[#97989A] text-[9px]">
          <Image src={locationIcon} alt="Location" className="w-[5.5px] h-[7.5px]" /> 
          <span className="truncate">{gift.location}</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-darker text-[12px] font-semibold whitespace-nowrap leading-[117%] tracking-[0.05em]">₦{gift.price}</span>
          <Button
            label="Get Gift"
            variant="filled"
            className="rounded-[16px] px-3 py-1.5 text-[10px] font-medium h-auto"
          />
        </div>
      </div>
    </div>
  );
}

