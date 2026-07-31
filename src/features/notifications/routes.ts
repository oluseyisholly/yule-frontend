import type {
  NotificationMetadata,
  NotificationRecord,
  NotificationType,
} from "@/features/notifications/types";

type NotificationRouteBuilder = (
  metadata: NotificationMetadata,
) => string;

function getMetadataId(
  metadata: NotificationMetadata,
  ...keys: Array<keyof NotificationMetadata>
) {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function hasFulfillmentItems(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (value && typeof value === "object") {
    const count = (value as { count?: unknown }).count;
    return typeof count === "number" && count > 0;
  }

  return false;
}

export const notificationRouteBuilders: Record<
  NotificationType,
  NotificationRouteBuilder
> = {
  draw_name_completed: (metadata) => {
    const id = getMetadataId(metadata, "drawNameEventId", "eventId");
    return id
      ? `/dashboard/draw-names/${encodeURIComponent(id)}`
      : "/dashboard/draw-names";
  },
  wishlist_item_claimed_owner: (metadata) => {
    const wishlistId = getMetadataId(
      metadata,
      "wishlistEventId",
      "eventId",
    );
    const giftId = getMetadataId(metadata, "giftId");

    if (wishlistId && giftId) {
      return `/dashboard/wish-list/${encodeURIComponent(wishlistId)}/gift/${encodeURIComponent(giftId)}`;
    }

    return wishlistId
      ? `/dashboard/wish-list/${encodeURIComponent(wishlistId)}`
      : "/dashboard/wish-list";
  },
  wishlist_item_claimed_claimer: (metadata) => {
    const giftId = getMetadataId(metadata, "giftId");

    if (giftId) {
      return `/dashboard/gifts/item/${encodeURIComponent(giftId)}?tab=received`;
    }

    const eventId = getMetadataId(metadata, "wishlistEventId", "eventId");
    const params = new URLSearchParams({ tab: "received" });

    if (eventId) {
      params.set("eventId", eventId);
    }

    return `/dashboard/gifts?${params.toString()}`;
  },
  gift_fulfilled: (metadata) => {
    const giftId = getMetadataId(metadata, "giftId");

    if (giftId) {
      return `/dashboard/gifts/item/${encodeURIComponent(giftId)}?tab=received`;
    }

    const giftingEventId = getMetadataId(metadata, "giftingEventId");

    if (giftingEventId) {
      return `/dashboard/gifts/${encodeURIComponent(giftingEventId)}`;
    }

    const eventId = getMetadataId(metadata, "eventId");
    return eventId
      ? `/dashboard/gifts?tab=received&eventId=${encodeURIComponent(eventId)}`
      : "/dashboard/gifts?tab=received";
  },
  hangout_completed: (metadata) => {
    const id = getMetadataId(metadata, "eventId", "hangoutEventId");
    return id
      ? `/dashboard/hangouts/${encodeURIComponent(id)}`
      : "/dashboard/hangouts";
  },
  scheduled_message_reminder: (metadata) => {
    const id = getMetadataId(metadata, "scheduledEventMessageId");
    return id
      ? `/dashboard/schedule/${encodeURIComponent(id)}`
      : "/dashboard/schedule";
  },
  pending_fulfillment_reminder: (metadata) => {
    if (hasFulfillmentItems(metadata.unfulfilledGifts)) {
      return "/dashboard/gifts?tab=received";
    }

    if (hasFulfillmentItems(metadata.unfulfilledHangouts)) {
      return "/dashboard/hangouts?tab=sponsored";
    }

    return "/dashboard/gifts?tab=received";
  },
};

export function getNotificationRoute(notification: NotificationRecord) {
  const routeBuilder = notificationRouteBuilders[notification.type];

  if (!routeBuilder) {
    return "/dashboard";
  }

  return routeBuilder(notification.metadata ?? {});
}
