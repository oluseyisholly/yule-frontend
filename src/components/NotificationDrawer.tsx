"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { BellIcon, CheckCheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationDrawerItem = {
  id: string;
  title: string;
  body: string;
  createdAt?: string | null;
  isRead?: boolean;
};

type NotificationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationDrawerItem[];
  count?: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onMarkAllRead?: () => void;
  isMarkingRead?: boolean;
};

function formatNotificationTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[18px] border border-[#F0ECF7] bg-white p-4"
        >
          <div className="mb-3 h-4 w-2/3 animate-pulse rounded-full bg-[#F0ECF7]" />
          <div className="h-3 w-full animate-pulse rounded-full bg-[#F6F2FB]" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-[#F6F2FB]" />
        </div>
      ))}
    </div>
  );
}

export default function NotificationDrawer({
  open,
  onOpenChange,
  notifications,
  count = notifications.length,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onMarkAllRead,
  isMarkingRead = false,
}: NotificationDrawerProps) {
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open || !hasMore || isLoadingMore || !onLoadMore) {
      return;
    }

    const node = loadMoreRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { root: null, rootMargin: "160px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[170] bg-[#101014]/45 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-[171] flex h-dvh w-full max-w-[420px] flex-col overflow-hidden border-l border-[#EDE8F7] bg-[#FBFAFF] shadow-[-24px_0_60px_rgba(25,18,54,0.16)] outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
            "duration-300 sm:max-w-[440px] lg:w-[25vw] lg:min-w-[380px] lg:max-w-[520px]",
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F0ECF7] bg-white px-5 py-5 sm:px-6">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-body text-[22px] font-semibold leading-tight text-[#2F2F33]">
                Notifications
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-[13px] leading-5 text-[#7D7888]">
                Keep track of invites, gifts, reminders, and celebration updates.
              </DialogPrimitive.Description>
            </div>

            <DialogPrimitive.Close className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F6F2FB] text-[#434343] transition-colors hover:bg-[#EEE7FA]">
              <XIcon className="size-4" />
              <span className="sr-only">Close notifications</span>
            </DialogPrimitive.Close>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#F0ECF7] bg-white px-5 py-4 sm:px-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F6F2FF] px-3 py-2 text-[13px] font-medium text-[#3300C9]">
              <BellIcon className="size-4" />
              {count > 0 ? `${count} new` : "No new notifications"}
            </div>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={!onMarkAllRead || isMarkingRead || count === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[#E7DFFF] bg-white px-3 py-2 text-[12px] font-medium text-[#6B6678] transition-colors hover:border-[#3300C9] hover:text-[#3300C9]"
            >
              <CheckCheckIcon className="size-4" />
              {isMarkingRead ? "Marking..." : "Mark all read"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {isLoading ? (
              <NotificationSkeleton />
            ) : notifications.length ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={cn(
                      "rounded-[18px] border bg-white p-4 shadow-[0_10px_28px_rgba(35,23,75,0.04)]",
                      notification.isRead
                        ? "border-[#F0ECF7]"
                        : "border-[#DED2FF]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-1 size-2.5 shrink-0 rounded-full",
                          notification.isRead ? "bg-[#D8D5DE]" : "bg-[#3300C9]",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[14px] font-semibold leading-5 text-[#2F2F33]">
                            {notification.title}
                          </h3>
                          {notification.createdAt ? (
                            <time className="shrink-0 text-[11px] text-[#9A97A5]">
                              {formatNotificationTime(notification.createdAt)}
                            </time>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[13px] leading-5 text-[#6F6A7B]">
                          {notification.body}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}

                <div ref={loadMoreRef} className="h-8">
                  {isLoadingMore ? (
                    <p className="text-center text-[12px] text-[#8B8796]">
                      Loading more notifications...
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#E6E0F7] bg-white px-6 text-center">
                <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-[#F6F2FF] text-[#3300C9]">
                  <BellIcon className="size-6" />
                </span>
                <h3 className="text-[18px] font-semibold text-[#2F2F33]">
                  No notifications yet
                </h3>
                <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#7D7888]">
                  Once your notification APIs are connected, updates will appear
                  here with infinite scroll.
                </p>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
