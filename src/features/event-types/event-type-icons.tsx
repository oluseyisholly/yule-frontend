import Image, { type StaticImageData } from "next/image";
import apologyGiftsIcon from "@/components/icons/event-types/apology_gifts.svg";
import babyShowerIcon from "@/components/icons/event-types/baby_shower.svg";
import birthdaysIcon from "@/components/icons/event-types/birthdays.svg";
import bridalShowerIcon from "@/components/icons/event-types/bridal_shower.svg";
import christmasGiftsIcon from "@/components/icons/event-types/christmas_gifts.svg";
import communityEventIcon from "@/components/icons/event-types/community_event.svg";
import congratulationsIcon from "@/components/icons/event-types/congratulations.svg";
import couplesGiftExchangeIcon from "@/components/icons/event-types/couples_gift_exchange.svg";
import defaultEventIcon from "@/components/icons/event-types/default_event.svg";
import dinnerPartyIcon from "@/components/icons/event-types/dinner_party.svg";
import directGiftingIcon from "@/components/icons/event-types/direct_gifting.svg";
import drawNamesIcon from "@/components/icons/event-types/draw_names.svg";
import easterGiftsIcon from "@/components/icons/event-types/easter_gifts.svg";
import eidGiftsIcon from "@/components/icons/event-types/eid_gifts.svg";
import employeeRecognitionIcon from "@/components/icons/event-types/employee_recognition.svg";
import endOfSchoolYearGiftsIcon from "@/components/icons/event-types/end_of_school_year_gifts.svg";
import engagementGiftsIcon from "@/components/icons/event-types/engagement_gifts.svg";
import familyReunionIcon from "@/components/icons/event-types/family_reunion.svg";
import farewellGiftsIcon from "@/components/icons/event-types/farewell_gifts.svg";
import friendsReunionIcon from "@/components/icons/event-types/friends_reunion.svg";
import friendshipValentinesIcon from "@/components/icons/event-types/friendship_valentines.svg";
import getWellSoonIcon from "@/components/icons/event-types/get_well_soon.svg";
import girlsDayIcon from "@/components/icons/event-types/girls_day.svg";
import graduationIcon from "@/components/icons/event-types/graduation.svg";
import groupGiftingIcon from "@/components/icons/event-types/group_gifting.svg";
import hangoutIcon from "@/components/icons/event-types/hangout.svg";
import housewarmingForCoupleIcon from "@/components/icons/event-types/housewarming_for_couple.svg";
import housewarmingIcon from "@/components/icons/event-types/housewarming.svg";
import justBecauseIcon from "@/components/icons/event-types/just_because.svg";
import kidsBirthdaysIcon from "@/components/icons/event-types/kids_birthdays.svg";
import ladiesHangoutIcon from "@/components/icons/event-types/ladies_hangout.svg";
import loveNotesAndGiftsIcon from "@/components/icons/event-types/love_notes_and_gifts.svg";
import milestoneBirthdaysIcon from "@/components/icons/event-types/milestone_birthdays.svg";
import motherAndDaughterDayIcon from "@/components/icons/event-types/mother_and_daughter_day.svg";
import namingCeremonyIcon from "@/components/icons/event-types/naming_ceremony.svg";
import promotionCelebrationIcon from "@/components/icons/event-types/promotion_celebration.svg";
import ramadanGiftsIcon from "@/components/icons/event-types/ramadan_gifts.svg";
import randomGiftExchangeIcon from "@/components/icons/event-types/random_gift_exchange.svg";
import religiousHolidaysIcon from "@/components/icons/event-types/religious_holidays.svg";
import retirementCelebrationIcon from "@/components/icons/event-types/retirement_celebration.svg";
import schoolStaffAppreciationIcon from "@/components/icons/event-types/school_staff_appreciation.svg";
import secretSantaIcon from "@/components/icons/event-types/secret_santa.svg";
import surpriseBirthdaysIcon from "@/components/icons/event-types/surprise_birthdays.svg";
import teacherAppreciationIcon from "@/components/icons/event-types/teacher_appreciation.svg";
import teachersDayIcon from "@/components/icons/event-types/teachers_day.svg";
import teamAppreciationIcon from "@/components/icons/event-types/team_appreciation.svg";
import thankYouGiftsIcon from "@/components/icons/event-types/thank_you_gifts.svg";
import thanksgivingGiftsIcon from "@/components/icons/event-types/thanksgiving_gifts.svg";
import valentinesIcon from "@/components/icons/event-types/valentines.svg";
import weddingAnniversaryIcon from "@/components/icons/event-types/wedding_anniversary.svg";
import weddingGiftsIcon from "@/components/icons/event-types/wedding_gifts.svg";
import weddingsIcon from "@/components/icons/event-types/weddings.svg";
import wishlistExchangeIcon from "@/components/icons/event-types/wishlist_exchange.svg";
import wishlistIcon from "@/components/icons/event-types/wishlist.svg";
import womenAppreciationIcon from "@/components/icons/event-types/women_appreciation.svg";
import workAnniversariesIcon from "@/components/icons/event-types/work_anniversaries.svg";

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

type EventTypeKey = (typeof eventTypeKeys)[number];

const eventTypeIconByKey: Record<EventTypeKey, StaticImageData> = {
  birthdays: birthdaysIcon,
  kids_birthdays: kidsBirthdaysIcon,
  milestone_birthdays: milestoneBirthdaysIcon,
  surprise_birthdays: surpriseBirthdaysIcon,
  valentines: valentinesIcon,
  couples_gift_exchange: couplesGiftExchangeIcon,
  friendship_valentines: friendshipValentinesIcon,
  love_notes_and_gifts: loveNotesAndGiftsIcon,
  work_anniversaries: workAnniversariesIcon,
  employee_recognition: employeeRecognitionIcon,
  promotion_celebration: promotionCelebrationIcon,
  retirement_celebration: retirementCelebrationIcon,
  farewell_gifts: farewellGiftsIcon,
  team_appreciation: teamAppreciationIcon,
  teachers_day: teachersDayIcon,
  teacher_appreciation: teacherAppreciationIcon,
  school_staff_appreciation: schoolStaffAppreciationIcon,
  end_of_school_year_gifts: endOfSchoolYearGiftsIcon,
  girls_day: girlsDayIcon,
  women_appreciation: womenAppreciationIcon,
  ladies_hangout: ladiesHangoutIcon,
  mother_and_daughter_day: motherAndDaughterDayIcon,
  weddings: weddingsIcon,
  wedding_gifts: weddingGiftsIcon,
  wedding_anniversary: weddingAnniversaryIcon,
  bridal_shower: bridalShowerIcon,
  engagement_gifts: engagementGiftsIcon,
  housewarming_for_couple: housewarmingForCoupleIcon,
  religious_holidays: religiousHolidaysIcon,
  christmas_gifts: christmasGiftsIcon,
  secret_santa: secretSantaIcon,
  eid_gifts: eidGiftsIcon,
  easter_gifts: easterGiftsIcon,
  ramadan_gifts: ramadanGiftsIcon,
  thanksgiving_gifts: thanksgivingGiftsIcon,
  direct_gifting: directGiftingIcon,
  group_gifting: groupGiftingIcon,
  wishlist: wishlistIcon,
  wishlist_exchange: wishlistExchangeIcon,
  draw_names: drawNamesIcon,
  random_gift_exchange: randomGiftExchangeIcon,
  auto_gifting: defaultEventIcon,
  baby_shower: babyShowerIcon,
  naming_ceremony: namingCeremonyIcon,
  housewarming: housewarmingIcon,
  graduation: graduationIcon,
  congratulations: congratulationsIcon,
  get_well_soon: getWellSoonIcon,
  thank_you_gifts: thankYouGiftsIcon,
  apology_gifts: apologyGiftsIcon,
  just_because: justBecauseIcon,
  hangout: hangoutIcon,
  dinner_party: dinnerPartyIcon,
  friends_reunion: friendsReunionIcon,
  family_reunion: familyReunionIcon,
  community_event: communityEventIcon,
};

const placeholderEventTypeKeys = new Set<EventTypeKey>([
  "christmas_gifts",
  "community_event",
  "direct_gifting",
  "easter_gifts",
  "eid_gifts",
  "end_of_school_year_gifts",
  "farewell_gifts",
  "friends_reunion",
  "friendship_valentines",
  "get_well_soon",
  "girls_day",
  "group_gifting",
  "housewarming",
  "housewarming_for_couple",
  "just_because",
  "kids_birthdays",
  "ladies_hangout",
  "milestone_birthdays",
  "mother_and_daughter_day",
  "naming_ceremony",
  "promotion_celebration",
  "ramadan_gifts",
  "random_gift_exchange",
  "religious_holidays",
  "retirement_celebration",
  "school_staff_appreciation",
  "secret_santa",
  "surprise_birthdays",
  "teacher_appreciation",
  "teachers_day",
  "team_appreciation",
  "thank_you_gifts",
  "thanksgiving_gifts",
  "valentines",
  "wedding_anniversary",
  "wedding_gifts",
  "weddings",
  "wishlist",
  "wishlist_exchange",
  "women_appreciation",
  "work_anniversaries",
]);

function isEventTypeKey(key: string): key is EventTypeKey {
  return eventTypeKeys.includes(key as EventTypeKey);
}

export function getEventTypeIcon(key: string | null) {
  const icon =
    key && isEventTypeKey(key) && !placeholderEventTypeKeys.has(key)
      ? eventTypeIconByKey[key]
      : defaultEventIcon;

  return (
    <Image
      src={icon}
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
      className="size-6 object-contain"
    />
  );
}
