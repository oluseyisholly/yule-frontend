"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  isGiftModalStep,
  type GiftModalStep,
} from "@/screens/gifts/modal-steps";
import {
  isGiftFlowMode,
  type GiftFlowMode,
} from "@/stores/gift-flow-store";

const BASE_GIFTS_PATH = "/dashboard/gifts";
const FLOW_PATH_PREFIX = `${BASE_GIFTS_PATH}/flow`;
const EVENT_ID_PARAM = "eventId";
const GIFTING_EVENT_ID_PARAM = "giftingEventId";
const MODE_PARAM = "mode";
const LEGACY_EVENT_TYPE_ID_PARAM = "eventTypeId";

type ModalNavigationMethod = "push" | "replace";

export function useGiftModalRouteState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedSearchString = useMemo(() => {
    const nextSearch = searchParams.toString();

    if (nextSearch) {
      return nextSearch;
    }

    if (typeof window !== "undefined") {
      return window.location.search.replace(/^\?/, "");
    }

    return "";
  }, [searchParams]);
  const resolvedSearchParams = useMemo(
    () => new URLSearchParams(resolvedSearchString),
    [resolvedSearchString],
  );

  const modalStep = useMemo<GiftModalStep | null>(() => {
    const normalizedPathname = pathname.replace(/\/+$/, "");

    if (!normalizedPathname.startsWith(`${FLOW_PATH_PREFIX}/`)) {
      return null;
    }

    const stepSegment =
      normalizedPathname
        .slice(`${FLOW_PATH_PREFIX}/`.length)
        .split("/")[0]
        ?.trim() ?? null;

    return isGiftModalStep(stepSegment) ? stepSegment : null;
  }, [pathname]);

  const eventId = useMemo(
    () => resolvedSearchParams.get(EVENT_ID_PARAM),
    [resolvedSearchParams],
  );
  const giftingEventId = useMemo(
    () => resolvedSearchParams.get(GIFTING_EVENT_ID_PARAM),
    [resolvedSearchParams],
  );
  const legacyEventTypeId = useMemo(
    () => resolvedSearchParams.get(LEGACY_EVENT_TYPE_ID_PARAM),
    [resolvedSearchParams],
  );
  const mode = useMemo<GiftFlowMode>(() => {
    const nextMode = resolvedSearchParams.get(MODE_PARAM);
    return isGiftFlowMode(nextMode) ? nextMode : "create";
  }, [resolvedSearchParams]);

  const navigateModalStep = useCallback(
    (
      step: GiftModalStep | null,
      nextMode?: GiftFlowMode,
      nextEventId?: string | null,
      nextGiftingEventId?: string | null,
      method: ModalNavigationMethod = "replace",
    ) => {
      const nextParams = new URLSearchParams();
      const resolvedMode = nextMode ?? mode;
      const resolvedEventId =
        nextEventId === undefined ? eventId : nextEventId?.trim() || null;
      const resolvedGiftingEventId =
        nextGiftingEventId === undefined
          ? giftingEventId
          : nextGiftingEventId?.trim() || null;

      if (step) {
        nextParams.set(MODE_PARAM, resolvedMode);
      }

      if (resolvedEventId) {
        nextParams.set(EVENT_ID_PARAM, resolvedEventId);
      }

      if (resolvedGiftingEventId) {
        nextParams.set(GIFTING_EVENT_ID_PARAM, resolvedGiftingEventId);
      }

      const nextQuery = nextParams.toString();
      const nextPath = step ? `${FLOW_PATH_PREFIX}/${step}` : BASE_GIFTS_PATH;
      const nextHref = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
      router[method](nextHref, { scroll: false });
    },
    [eventId, giftingEventId, mode, router],
  );

  const openModal = useCallback(
    (
      step?: GiftModalStep,
      nextMode: GiftFlowMode = "create",
      nextEventId?: string | null,
      nextGiftingEventId?: string | null,
    ) => {
      const nextStep = isGiftModalStep(step ?? null) ? step ?? "event" : "event";

      navigateModalStep(
        nextStep,
        nextMode,
        nextEventId ?? null,
        nextGiftingEventId ?? null,
        "push",
      );
    },
    [navigateModalStep],
  );

  const setCurrentStep = useCallback(
    (
      step: GiftModalStep,
      nextMode?: GiftFlowMode,
      nextEventId?: string | null,
      nextGiftingEventId?: string | null,
    ) => {
      navigateModalStep(
        step,
        nextMode,
        nextEventId,
        nextGiftingEventId,
        "push",
      );
    },
    [navigateModalStep],
  );

  const replaceCurrentStep = useCallback(
    (
      step: GiftModalStep,
      nextMode?: GiftFlowMode,
      nextEventId?: string | null,
      nextGiftingEventId?: string | null,
    ) => {
      navigateModalStep(
        step,
        nextMode,
        nextEventId,
        nextGiftingEventId,
        "replace",
      );
    },
    [navigateModalStep],
  );

  const closeModal = useCallback(() => {
    router.replace(BASE_GIFTS_PATH, { scroll: false });
  }, [router]);

  return {
    isOpen: modalStep !== null,
    currentStep: modalStep ?? "event",
    mode,
    eventId,
    giftingEventId,
    legacyEventTypeId,
    openModal,
    setCurrentStep,
    replaceCurrentStep,
    closeModal,
  };
}
