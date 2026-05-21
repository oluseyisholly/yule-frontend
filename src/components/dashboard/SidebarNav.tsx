"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  dashboardNavItems,
  getDashboardNavItemByPathname,
  isDashboardNavItemActive,
} from "@/components/dashboard/navigation";

type DashboardSidebarNavProps = {
  onItemClick?: () => void;
  className?: string;
};

export default function DashboardSidebarNav({
  onItemClick,
  className,
}: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const activeItem = getDashboardNavItemByPathname(pathname);

  return (
    <nav aria-label="Dashboard navigation" className={cn("space-y-[4px]", className)}>
      {dashboardNavItems.map(({ href, label, tab, Icon }) => {
        const isActive =
          tab === activeItem.tab && isDashboardNavItemActive(href, pathname);

        return (
          <Link
            key={tab}
            href={href}
            onClick={onItemClick}
            className={cn(
              "group flex items-center gap-[12px] rounded-[8px] px-[17px] py-[12px] transition-colors duration-200",
              isActive ? "bg-[#f1ebff]" : "hover:bg-[#f8f5ff]",
            )}
          >
            <span
              className={cn(
                "flex size-[31px] items-center justify-center rounded-[8px] border border-[#D3D3D3] bg-white transition-all duration-200",
                isActive
                  ? "shadow-[0_8px_24px_rgba(51,0,201,0.08)]"
                  : "group-hover:border-[#d5cff0]",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>

            <span
              className={cn(
                "text-[#434343] font-medium md:text-[14px]",
                isActive ? "text-[#434343]" : "group-hover:text-[#434343]",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
