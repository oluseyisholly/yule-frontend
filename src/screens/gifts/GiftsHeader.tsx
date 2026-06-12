import { Input } from "@/components/ui/input";
import FilterDropdown from "@/screens/gifts/FilterDropdown";
import filterIcon from "@/assets/icons/filter.svg";
import Image from "next/image";
import SearchIcon from "@/assets/icons/search.svg";

const dropdowns: { label: string; options: string[] }[] = [
  {
    label: "Category",
    options: [
      "All Categories",
      "Electronics",
      "Fashion",
      "Beauty & Care",
      "Home & Living",
      "Toys & Games",
      "Books",
    ],
  },
  {
    label: "Price",
    options: [
      "Any Price",
      "Under ₦5,000",
      "₦5,000 – ₦20,000",
      "₦20,000 – ₦50,000",
      "Above ₦50,000",
    ],
  },
  {
    label: "Sex",
    options: ["All", "Male", "Female", "Unisex"],
  },
  {
    label: "Gift",
    options: [
      "All Gifts",
      "Birthday",
      "Anniversary",
      "Wedding",
      "Graduation",
      "Just Because",
    ],
  },
];

export default function GiftsHeader() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Title */}
      <div>
        <h1 className="font-body font-semibold text-[32px]  text-charcoal leading-tight mb-2">
          Gifts speak louder than words.
        </h1>
        <p className="text-charcoal text-[13px] sm:text-[14px] max-w-xl">
          While you&apos;re typing that heartfelt message, let us help you find the perfect surprise to brighten their day.
        </p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center">
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-[#E4E9ED] border border-gray-200 text-[#716F6F] text-[12px] font-medium px-3.5 py-2 rounded-lg hover:bg-gray-200/70 transition-colors cursor-pointer"
          >
            <Image src={filterIcon} alt="filterIcon" aria-hidden className="w-4 h-4" />  
            Filter
          </button>

          {dropdowns.map(({ label, options }) => (
            <FilterDropdown key={label} label={label} options={options} />
          ))}
        </div>

        <div className="relative flex-1 gap-2">
          <Image src={SearchIcon} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <Input
            type="search"
            placeholder="Search for Gift"
            className="w-full h-10 pl-9 bg-[#FFFFFF] border-[#9F9F9F] placeholder:text-[#716F6F] text-[12px] font-medium rounded-[5px]"
          />
        </div>
      </div>
    </div>
  );
}





