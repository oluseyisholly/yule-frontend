"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  isHangoutModalStep,
  type HangoutModalStep,
} from "@/screens/hangouts/modal-steps";
import {
  isHangoutFlowMode,
  type HangoutFlowMode,
} from "@/stores/hangout-flow-store";

const BASE_HANGOUTS_PATH = "/dashboard/hangouts";
const FLOW_PATH_PREFIX = `${BASE_HANGOUTS_PATH}/flow`;
const EVENT_ID_PARAM = "eventId";
const MODE_PARAM = "mode";
const LEGACY_EVENT_TYPE_ID_PARAM = "eventTypeId";

type ModalNavigationMethod = "push" | "replace";

export function useHangoutModalRouteState() {
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

  const modalStep = useMemo<HangoutModalStep | null>(() => {
    const normalizedPathname = pathname.replace(/\/+$/, "");

    if (!normalizedPathname.startsWith(`${FLOW_PATH_PREFIX}/`)) {
      return null;
    }

    const stepSegment =
      normalizedPathname
        .slice(`${FLOW_PATH_PREFIX}/`.length)
        .split("/")[0]
        ?.trim() ?? null;

    return isHangoutModalStep(stepSegment) ? stepSegment : null;
  }, [pathname]);

  const eventId = useMemo(
    () => resolvedSearchParams.get(EVENT_ID_PARAM),
    [resolvedSearchParams],
  );
  const legacyEventTypeId = useMemo(
    () => resolvedSearchParams.get(LEGACY_EVENT_TYPE_ID_PARAM),
    [resolvedSearchParams],
  );
  const mode = useMemo<HangoutFlowMode>(() => {
    const nextMode = resolvedSearchParams.get(MODE_PARAM);
    return isHangoutFlowMode(nextMode) ? nextMode : "create";
  }, [resolvedSearchParams]);

  const navigateModalStep = useCallback(
    (
      step: HangoutModalStep | null,
      nextMode?: HangoutFlowMode,
      nextEventId?: string | null,
      method: ModalNavigationMethod = "replace",
    ) => {
      const nextParams = new URLSearchParams();
      const resolvedMode = nextMode ?? mode;
      const resolvedEventId =
        nextEventId === undefined ? eventId : nextEventId?.trim() || null;

      if (step) {
        nextParams.set(MODE_PARAM, resolvedMode);
      }

      if (resolvedEventId) {
        nextParams.set(EVENT_ID_PARAM, resolvedEventId);
      }

      const nextQuery = nextParams.toString();
      const nextPath = step ? `${FLOW_PATH_PREFIX}/${step}` : BASE_HANGOUTS_PATH;
      const nextHref = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
      router[method](nextHref, { scroll: false });
    },
    [eventId, mode, router],
  );

  const openModal = useCallback(
    (
      step?: HangoutModalStep,
      nextMode: HangoutFlowMode = "create",
      nextEventId?: string | null,
    ) => {
      const nextStep = isHangoutModalStep(step ?? null) ? step ?? "event" : "event";

      navigateModalStep(nextStep, nextMode, nextEventId ?? null, "push");
    },
    [navigateModalStep],
  );

  const setCurrentStep = useCallback(
    (
      step: HangoutModalStep,
      nextMode?: HangoutFlowMode,
      nextEventId?: string | null,
    ) => {
      navigateModalStep(step, nextMode, nextEventId, "push");
    },
    [navigateModalStep],
  );

  const replaceCurrentStep = useCallback(
    (
      step: HangoutModalStep,
      nextMode?: HangoutFlowMode,
      nextEventId?: string | null,
    ) => {
      navigateModalStep(step, nextMode, nextEventId, "replace");
    },
    [navigateModalStep],
  );

  const closeModal = useCallback(() => {
    router.replace(BASE_HANGOUTS_PATH, { scroll: false });
  }, [router]);

  return {
    isOpen: modalStep !== null,
    currentStep: modalStep ?? "event",
    mode,
    eventId,
    legacyEventTypeId,
    openModal,
    setCurrentStep,
    replaceCurrentStep,
    closeModal,
  };
}
