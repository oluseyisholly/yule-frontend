import {
  BabyIcon,
  BriefcaseBusinessIcon,
  CakeSliceIcon,
  FrameIcon,
  GiftIcon,
  HeartHandshakeIcon,
  TicketIcon,
  type LucideIcon,
} from "lucide-react";

export const eventTypeKeys = [
  "birthdays",
  "kids_birthdays",
  "milestone_birthdays",
  "surprise_birthdays",
  "valentines",
  "couples_gift_exchange",
  "friendship_valentines",
  "love_notes_and_gifts",
  "work_anniversaries",
  "employee_recognition",
  "promotion_celebration",
  "retirement_celebration",
  "farewell_gifts",
  "team_appreciation",
  "teachers_day",
  "teacher_appreciation",
  "school_staff_appreciation",
  "end_of_school_year_gifts",
  "girls_day",
  "women_appreciation",
  "ladies_hangout",
  "mother_and_daughter_day",
  "weddings",
  "wedding_gifts",
  "wedding_anniversary",
  "bridal_shower",
  "engagement_gifts",
  "housewarming_for_couple",
  "religious_holidays",
  "christmas_gifts",
  "secret_santa",
  "eid_gifts",
  "easter_gifts",
  "ramadan_gifts",
  "thanksgiving_gifts",
  "direct_gifting",
  "group_gifting",
  "wishlist",
  "wishlist_exchange",
  "draw_names",
  "random_gift_exchange",
  "auto_gifting",
  "baby_shower",
  "naming_ceremony",
  "housewarming",
  "graduation",
  "congratulations",
  "get_well_soon",
  "thank_you_gifts",
  "apology_gifts",
  "just_because",
  "hangout",
  "dinner_party",
  "friends_reunion",
  "family_reunion",
  "community_event",
] as const;

const birthdayEventKeys = new Set([
  "birthdays",
  "kids_birthdays",
  "milestone_birthdays",
  "surprise_birthdays",
]);

const valentineEventKeys = new Set([
  "valentines",
  "couples_gift_exchange",
  "friendship_valentines",
  "love_notes_and_gifts",
]);

const workEventKeys = new Set([
  "work_anniversaries",
  "employee_recognition",
  "promotion_celebration",
  "retirement_celebration",
  "farewell_gifts",
  "team_appreciation",
]);

const teacherEventKeys = new Set([
  "teachers_day",
  "teacher_appreciation",
  "school_staff_appreciation",
  "end_of_school_year_gifts",
]);

const girlsDayEventKeys = new Set([
  "girls_day",
  "women_appreciation",
  "ladies_hangout",
  "mother_and_daughter_day",
]);

const weddingEventKeys = new Set([
  "weddings",
  "wedding_gifts",
  "wedding_anniversary",
  "bridal_shower",
  "engagement_gifts",
  "housewarming_for_couple",
]);

const religiousHolidayEventKeys = new Set([
  "religious_holidays",
  "christmas_gifts",
  "secret_santa",
  "eid_gifts",
  "easter_gifts",
  "ramadan_gifts",
  "thanksgiving_gifts",
]);

const generalGiftEventKeys = new Set([
  "direct_gifting",
  "group_gifting",
  "wishlist",
  "wishlist_exchange",
  "draw_names",
  "random_gift_exchange",
  "auto_gifting",
  "baby_shower",
  "naming_ceremony",
  "housewarming",
  "graduation",
  "congratulations",
  "get_well_soon",
  "thank_you_gifts",
  "apology_gifts",
  "just_because",
  "hangout",
  "dinner_party",
  "friends_reunion",
  "family_reunion",
  "community_event",
]);

function resolveEventTypeIcon(key: string | null): LucideIcon {
  if (!key) {
    return GiftIcon;
  }

  if (birthdayEventKeys.has(key)) {
    return CakeSliceIcon;
  }

  if (valentineEventKeys.has(key)) {
    return TicketIcon;
  }

  if (workEventKeys.has(key)) {
    return BriefcaseBusinessIcon;
  }

  if (teacherEventKeys.has(key)) {
    return FrameIcon;
  }

  if (girlsDayEventKeys.has(key)) {
    return BabyIcon;
  }

  if (weddingEventKeys.has(key)) {
    return HeartHandshakeIcon;
  }

  if (religiousHolidayEventKeys.has(key) || generalGiftEventKeys.has(key)) {
    return GiftIcon;
  }

  return GiftIcon;
}

export function getEventTypeIcon(key: string | null) {
  const Icon = resolveEventTypeIcon(key);
  return <Icon className="size-6" />;
}
