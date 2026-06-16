export type DrawStatus = "Completed" | "Draft" | "Ongoing" | "In Progress";

export type ParticipantBadge = {
  id: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  bg: string;
  status?: "Drawn" | "Pending";
};

export type DrawActivity = {
  id: number;
  eventName: string;
  eventDate: string;
  drawDate: string;
  budget: string;
  createdBy: string;
  createdAt: string;
  location: string;
  status: DrawStatus;
  participants: ParticipantBadge[];
  pairedWith: ParticipantBadge | null;
  rules: string[];
};

const palette = {
  violet: { color: "#3300C9", bg: "#EFE6FD" },
  gold: { color: "#C28A00", bg: "#FCEEC8" },
  green: { color: "#1FAB54", bg: "#D9F4E2" },
  red: { color: "#E04F4F", bg: "#FDE0DE" },
  blue: { color: "#0067C9", bg: "#DDF0FF" },
};

export const drawActivities: DrawActivity[] = [
  {
    id: 1,
    eventName: "Birthday",
    eventDate: "22/3/2025",
    drawDate: "22/3/2025",
    budget: "₦230,000",
    createdBy: "James Oye",
    createdAt: "March 2025",
    location: "Lagos, Nigeria",
    status: "Completed",
    participants: [
      {
        id: 101,
        name: "Rita Bello",
        role: "HR Manager",
        initials: "RB",
        ...palette.gold,
        status: "Drawn",
      },
      {
        id: 102,
        name: "Bola Tinubu",
        role: "Graphics Designer",
        initials: "BT",
        ...palette.green,
        status: "Drawn",
      },
      {
        id: 103,
        name: "Eze Agwu",
        role: "Chief Technical Officer",
        initials: "EA",
        ...palette.violet,
        status: "Drawn",
      },
      {
        id: 104,
        name: "Yahaya Bello",
        role: "Managing Director",
        initials: "YB",
        ...palette.red,
        status: "Drawn",
      },
      {
        id: 105,
        name: "Toluwani Ayeni",
        role: "Web Designer",
        initials: "TA",
        ...palette.blue,
        status: "Drawn",
      },
    ],
    pairedWith: {
      id: 106,
      name: "Emmanuel Sadiq",
      role: "Product Designer",
      initials: "ES",
      ...palette.violet,
      status: "Drawn",
    },
    rules: [
      "Maximum Spend ₦230,000",
      "Event has been completed successfully",
    ],
  },
  {
    id: 2,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    drawDate: "25/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    createdAt: "March 2025",
    location: "Abuja, Nigeria",
    status: "Draft",
    participants: [
      {
        id: 201,
        name: "Moyin Ajao",
        role: "Operations Lead",
        initials: "MA",
        ...palette.violet,
        status: "Pending",
      },
      {
        id: 202,
        name: "Seyi Dada",
        role: "Backend Engineer",
        initials: "SD",
        ...palette.red,
        status: "Pending",
      },
      {
        id: 203,
        name: "Lara Ige",
        role: "Accountant",
        initials: "LI",
        ...palette.gold,
        status: "Pending",
      },
      {
        id: 204,
        name: "David Timi",
        role: "QA Analyst",
        initials: "DT",
        ...palette.green,
        status: "Pending",
      },
    ],
    pairedWith: null,
    rules: [
      "Maximum Spend ₦230,000",
      "Draw has not been executed yet",
    ],
  },
  {
    id: 3,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    drawDate: "24/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    createdAt: "March 2025",
    location: "Ibadan, Nigeria",
    status: "Draft",
    participants: [
      {
        id: 301,
        name: "Amaka Obi",
        role: "HR Associate",
        initials: "AO",
        ...palette.green,
        status: "Pending",
      },
      {
        id: 302,
        name: "Kunle Taiwo",
        role: "Finance Officer",
        initials: "KT",
        ...palette.violet,
        status: "Pending",
      },
      {
        id: 303,
        name: "Shola Eze",
        role: "DevOps Engineer",
        initials: "SE",
        ...palette.gold,
        status: "Pending",
      },
      {
        id: 304,
        name: "Mercy Duro",
        role: "Customer Success",
        initials: "MD",
        ...palette.red,
        status: "Pending",
      },
    ],
    pairedWith: null,
    rules: [
      "Maximum Spend ₦230,000",
      "Awaiting organizer review",
    ],
  },
  {
    id: 4,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    drawDate: "28/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    createdAt: "March 2025",
    location: "Port Harcourt, Nigeria",
    status: "Draft",
    participants: [
      {
        id: 401,
        name: "Boma Arthur",
        role: "Community Manager",
        initials: "BA",
        ...palette.blue,
        status: "Pending",
      },
      {
        id: 402,
        name: "Ife Akin",
        role: "Frontend Engineer",
        initials: "IA",
        ...palette.green,
        status: "Pending",
      },
      {
        id: 403,
        name: "Kemi Balogun",
        role: "Copywriter",
        initials: "KB",
        ...palette.violet,
        status: "Pending",
      },
      {
        id: 404,
        name: "Tade Yusuf",
        role: "Business Analyst",
        initials: "TY",
        ...palette.gold,
        status: "Pending",
      },
    ],
    pairedWith: null,
    rules: [
      "Maximum Spend ₦230,000",
      "Awaiting participant confirmation",
    ],
  },
  {
    id: 5,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    drawDate: "23/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    createdAt: "March 2025",
    location: "Lagos, Nigeria",
    status: "Completed",
    participants: [
      {
        id: 501,
        name: "Tolu Aina",
        role: "Project Manager",
        initials: "TA",
        ...palette.violet,
        status: "Drawn",
      },
      {
        id: 502,
        name: "Simi Durojaiye",
        role: "Brand Strategist",
        initials: "SD",
        ...palette.red,
        status: "Drawn",
      },
      {
        id: 503,
        name: "Obi Jude",
        role: "Mobile Engineer",
        initials: "OJ",
        ...palette.green,
        status: "Drawn",
      },
      {
        id: 504,
        name: "Bimbo Lawal",
        role: "Office Manager",
        initials: "BL",
        ...palette.gold,
        status: "Drawn",
      },
    ],
    pairedWith: {
      id: 505,
      name: "Mayowa Tunde",
      role: "UI Designer",
      initials: "MT",
      ...palette.blue,
      status: "Drawn",
    },
    rules: [
      "Maximum Spend ₦230,000",
      "Event has been completed successfully",
    ],
  },
];

export function getDrawActivityById(id: number) {
  return drawActivities.find((activity) => activity.id === id);
}
