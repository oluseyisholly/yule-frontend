import type { ComponentType, SVGProps } from "react";
import {
  DashboardIcon,
  DrawNamesIcon,
  GiftsIcon,
  HangoutsIcon,
  HistoryIcon,
  ProfileIcon,
  ScheduleIcon,
  WishListIcon,
} from "@/components/dashboard/icons";

export type DashboardTab =
  | "dashboard"
  | "draw-names"
  | "wish-list"
  | "gifts"
  | "hangouts"
  | "schedule"
  | "history"
  | "profile";

export type DashboardNavItem = {
  label: string;
  tab: DashboardTab;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const defaultDashboardTab: DashboardTab = "dashboard";

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Dashboard",
    tab: "dashboard",
    href: "/dashboard",
    Icon: DashboardIcon,
  },
  {
    label: "Draw Names",
    tab: "draw-names",
    href: "/dashboard/draw-names",
    Icon: DrawNamesIcon,
  },
  {
    label: "Create Wish List",
    tab: "wish-list",
    href: "/dashboard/wish-list",
    Icon: WishListIcon,
  },

  
  {
    label: "Gifts",
    tab: "gifts",
    href: "/dashboard/gifts",
    Icon: GiftsIcon,
  },
  {
    label: "Hangouts",
    tab: "hangouts",
    href: "/dashboard/hangouts",
    Icon: HangoutsIcon,
  },
  {
    label: "Schedule Event & Message",
    tab: "schedule",
    href: "/dashboard/schedule",
    Icon: ScheduleIcon,
  },
  {
    label: "My History",
    tab: "history",
    href: "/dashboard/history",
    Icon: HistoryIcon,
  },
  {
    label: "My Profile",
    tab: "profile",
    href: "/dashboard/profile",
    Icon: ProfileIcon,
  },
];

export function getDashboardNavItem(tab?: string | null) {
  return (
    dashboardNavItems.find((item) => item.tab === tab) ?? dashboardNavItems[0]
  );
}

export function isDashboardNavItemActive(
  href: string,
  pathname?: string | null,
) {
  if (!pathname) {
    return href === "/dashboard";
  }

  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getDashboardNavItemByPathname(pathname?: string | null) {
  return (
    dashboardNavItems.find((item) =>
      isDashboardNavItemActive(item.href, pathname),
    ) ?? dashboardNavItems[0]
  );
}
