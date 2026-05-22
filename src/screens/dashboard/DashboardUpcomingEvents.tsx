import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import event1 from "@/assets/icons/featureImg1.svg";
import event2 from "@/assets/icons/featureImg2.svg";
import event3 from "@/assets/icons/featureImg3.svg";
import event4 from "@/assets/icons/featureImg4.svg";
import event5 from "@/assets/icons/featureImg5.svg";

type UpcomingEvent = {
  id: number;
  title: string;
  date: string;
  image: StaticImageData;
  href: string;
};

const events: UpcomingEvent[] = [
  {
    id: 1,
    title: "Christmas Gift Exchange",
    date: "Dec 12, 2025",
    image: event1,
    href: "/dashboard/schedule",
  },
  {
    id: 2,
    title: "Bayo's Birthday",
    date: "Dec 12, 2025",
    image: event2,
    href: "/dashboard/schedule",
  },
  {
    id: 3,
    title: "Eko Hotel Hangout",
    date: "Dec 12, 2025",
    image: event3,
    href: "/dashboard/hangouts",
  },
  {
    id: 4,
    title: "Eko Hotel Hangout",
    date: "Dec 12, 2025",
    image: event4,
    href: "/dashboard/hangouts",
  },
  {
    id: 5,
    title: "Eko Hotel Hangout",
    date: "Dec 12, 2025",
    image: event5,
    href: "/dashboard/hangouts",
  },
];

export default function DashboardUpcomingEvents() {
  return (
    <aside className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-6">
      <h2 className="text-[15px] font-semibold text-[#1e1e1e]">
        Upcoming Events
      </h2>

      <ul className="mt-5 space-y-3">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={event.href}
              className="group flex items-center gap-3 rounded-[12px] p-2 transition-colors hover:bg-[#FAF8FF]"
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-[#EFE6FD]">
                <Image
                  src={event.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-[#1e1e1e]">
                  {event.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-[#9A97A5]">
                  {event.date}
                </span>
              </span>

              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#3300C9] transition-colors group-hover:bg-[#EFE6FD]"
              >
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
