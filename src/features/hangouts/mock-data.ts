import type { StaticImageData } from "next/image";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import featureImg5 from "@/assets/icons/featureImg5.svg";
import featureImg6 from "@/assets/icons/featureImg6.svg";

export type HangoutStatus = "Past" | "Upcoming";

export type HangoutParticipant = {
  id: string;
  initials: string;
  bg: string;
  color: string;
  name: string;
};

export type HangoutRow = {
  id: string;
  venueName: string;
  location: string;
  eventName: string;
  checkInDate: string;
  amount: string;
  dateCreated: string;
  status: HangoutStatus;
  image: StaticImageData;
  gallery: StaticImageData[];
  participants: HangoutParticipant[];
  description: string;
  guests: string;
  vendorName: string;
  vendorVerified: boolean;
};

const participantPalette = [
  { color: "#3300C9", bg: "#EFE6FD" },
  { color: "#C28A00", bg: "#FCEEC8" },
  { color: "#1FAB54", bg: "#D9F4E2" },
  { color: "#E04F4F", bg: "#FDE0DE" },
  { color: "#0067C9", bg: "#DDF0FF" },
  { color: "#5A4CB8", bg: "#E8E6F8" },
] as const;

function buildParticipant(
  id: string,
  initials: string,
  name: string,
  paletteIndex: number,
): HangoutParticipant {
  const palette = participantPalette[paletteIndex % participantPalette.length];

  return {
    id,
    initials,
    name,
    bg: palette.bg,
    color: palette.color,
  };
}

export const hangoutRows: HangoutRow[] = [
  {
    id: "hangout-1",
    venueName: "Eko Hotel",
    location: "Lagos State",
    eventName: "Birthday Hangout",
    checkInDate: "22/3/2025",
    amount: "₦450,000",
    dateCreated: "22/3/2025",
    status: "Past",
    image: featureImg1,
    gallery: [
      featureImg1,
      featureImg2,
      featureImg3,
      featureImg4,
      featureImg5,
      featureImg6,
      featureImg2,
    ],
    guests: "2 guests",
    vendorName: "JJ Solutions",
    vendorVerified: true,
    description:
      "Lekki beach is a popular coastal destination located along the Lekki Peninsula in Lagos, Nigeria. Known for its clean sandy shores and vibrant atmosphere, it attracts both locals and tourists for relaxation, picnics, beach sports, and entertainment. The beach is lined with palm trees, beach huts, bars, and restaurants offering food, drinks, and live music. It is a great spot for swimming, sunbathing, and social gatherings, especially on weekends and holidays.",
    participants: [
      buildParticipant("p-1", "AO", "Ada Obi", 0),
      buildParticipant("p-2", "TM", "Tolu Michael", 1),
      buildParticipant("p-3", "SE", "Shade Eze", 2),
      buildParticipant("p-4", "OK", "Ola Kolade", 3),
    ],
  },
  {
    id: "hangout-2",
    venueName: "Lekki Beach",
    location: "Lagos State",
    eventName: "Birthday Hangout",
    checkInDate: "22/3/2025",
    amount: "₦450,000",
    dateCreated: "22/3/2025",
    status: "Upcoming",
    image: featureImg2,
    gallery: [featureImg2, featureImg3, featureImg1, featureImg6, featureImg5],
    guests: "2 guests",
    vendorName: "JJ Solutions",
    vendorVerified: true,
    description:
      "Lekki beach is a popular coastal destination located along the Lekki Peninsula in Lagos, Nigeria. Known for its clean sandy shores and vibrant atmosphere, it attracts both locals and tourists for relaxation, picnics, beach sports, and entertainment. The beach is lined with palm trees, beach huts, bars, and restaurants offering food, drinks, and live music.",
    participants: [
      buildParticipant("p-5", "AM", "Ayo Martins", 4),
      buildParticipant("p-6", "DE", "Demi Eze", 5),
      buildParticipant("p-7", "TR", "Tari Roberts", 0),
      buildParticipant("p-8", "BO", "Bola Ojo", 1),
    ],
  },
  {
    id: "hangout-3",
    venueName: "Epe Museum",
    location: "Ikeja",
    eventName: "Friends Hangout",
    checkInDate: "22/3/2025",
    amount: "₦450,000",
    dateCreated: "22/3/2025",
    status: "Upcoming",
    image: featureImg3,
    gallery: [featureImg3, featureImg4, featureImg2, featureImg5, featureImg1],
    guests: "2 guests",
    vendorName: "JJ Solutions",
    vendorVerified: true,
    description:
      "A memorable space for friends to reconnect, unwind, and enjoy a calm atmosphere close to the city. The venue combines quiet corners, open gathering spots, and easy access to food and entertainment options.",
    participants: [
      buildParticipant("p-9", "IO", "Ife Ogun", 2),
      buildParticipant("p-10", "YO", "Yemi Oke", 3),
      buildParticipant("p-11", "TA", "Tade Akin", 4),
      buildParticipant("p-12", "SA", "Seyi Ayo", 5),
    ],
  },
  {
    id: "hangout-4",
    venueName: "Ikoyi Art Gallery",
    location: "Osun State",
    eventName: "Hangout",
    checkInDate: "22/3/2025",
    amount: "₦450,000",
    dateCreated: "22/3/2025",
    status: "Past",
    image: featureImg4,
    gallery: [featureImg4, featureImg5, featureImg6, featureImg3, featureImg2],
    guests: "2 guests",
    vendorName: "JJ Solutions",
    vendorVerified: true,
    description:
      "This art-focused hangout setting creates room for quiet conversations, exhibitions, and relaxed group moments. It offers a blend of culture, calm interiors, and a polished outing experience.",
    participants: [
      buildParticipant("p-13", "MO", "Moyo Oni", 0),
      buildParticipant("p-14", "YE", "Yinka Eko", 1),
      buildParticipant("p-15", "KE", "Kemi Ade", 2),
      buildParticipant("p-16", "RO", "Ropo Lani", 3),
    ],
  },
  {
    id: "hangout-5",
    venueName: "Eko Hotel",
    location: "Lagos State",
    eventName: "Birthday Hangout",
    checkInDate: "22/3/2025",
    amount: "₦450,000",
    dateCreated: "22/3/2025",
    status: "Past",
    image: featureImg5,
    gallery: [featureImg5, featureImg4, featureImg2, featureImg1, featureImg6],
    guests: "2 guests",
    vendorName: "JJ Solutions",
    vendorVerified: true,
    description:
      "Perfect for an indoor celebration with friends, this venue balances premium ambience, comfort, and convenient access to the city.",
    participants: [
      buildParticipant("p-17", "BE", "Bela Efe", 4),
      buildParticipant("p-18", "SA", "Sade Alao", 5),
      buildParticipant("p-19", "ON", "Oyin Niyi", 0),
      buildParticipant("p-20", "AD", "Aduke Dayo", 1),
    ],
  },
  {
    id: "hangout-6",
    venueName: "Lekki Gardens",
    location: "Lagos State",
    eventName: "Couples Hangout",
    checkInDate: "29/3/2025",
    amount: "₦380,000",
    dateCreated: "23/3/2025",
    status: "Upcoming",
    image: featureImg6,
    gallery: [featureImg6, featureImg1, featureImg3, featureImg2, featureImg4],
    guests: "2 guests",
    vendorName: "JJ Solutions",
    vendorVerified: true,
    description:
      "A softer, more intimate outing option for couples with scenic views, balanced privacy, and a welcoming atmosphere for a premium day together.",
    participants: [
      buildParticipant("p-21", "TO", "Tope Ojo", 2),
      buildParticipant("p-22", "VI", "Vicky Ima", 3),
      buildParticipant("p-23", "LE", "Lekan Emi", 4),
      buildParticipant("p-24", "FA", "Favour Ani", 5),
    ],
  },
];

export function getHangoutById(id: string) {
  return hangoutRows.find((row) => row.id === id) ?? null;
}
