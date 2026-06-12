"use client";

import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import DrawNamesStats from "@/screens/draw-names/DrawNamesStats";
import DrawNamesActivity from "@/screens/draw-names/DrawNamesActivity";
import DrawNameStartModal from "@/screens/draw-names/DrawNameStartModal";
import { isParticipantDrawNameFlowStep } from "@/screens/draw-names/modal-steps";
import { useDrawNameModalRouteState } from "@/screens/draw-names/useDrawNameModalRouteState";
import { useDrawNameEventQuery } from "@/features/draw-name-events/hooks/useDrawNameEventQuery";
import {
  canManageDrawNameEvent,
} from "@/features/draw-name-events/access";
import { useMyParticipantQuery } from "@/features/participants/hooks/useMyParticipantQuery";
import Button from "@/components/Button";
import Image from "next/image";
import AddBtn from "@/assets/icons/addBtn.svg";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildDrawNameFlowSelectionKey,
  useDrawNameFlowStore,
} from "@/stores/draw-name-flow-store";

export default function DrawNamesScreen() {
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const resetFlowSelection = useDrawNameFlowStore(
    (state) => state.resetFlowSelection,
  );
  const {
    isOpen,
    currentStep,
    eventId,
    drawNameEventId,
    openModal,
    closeModal,
    setCurrentStep,
    replaceCurrentStep,
  } =
    useDrawNameModalRouteState();
  const hasShownCreatorAccessErrorRef = useRef<string | null>(null);
  const { data: guardedDrawNameEventResponse, isLoading: isGuardedDrawNameEventLoading } =
    useDrawNameEventQuery(drawNameEventId, {
      enabled: isOpen && Boolean(drawNameEventId),
    });
  const {
    data: myParticipantResponse,
    isLoading: isMyParticipantLoading,
  } = useMyParticipantQuery(eventId, {
    enabled: isOpen && Boolean(drawNameEventId) && Boolean(eventId),
  });
  const canManageExistingDrawFlow = useMemo(() => {
    if (!drawNameEventId) {
      return true;
    }

    return canManageDrawNameEvent(guardedDrawNameEventResponse?.data, {
      currentUserId: authUser?.id?.trim() || null,
      currentContactId: currentContactId?.trim() || null,
    });
  }, [
    authUser?.id,
    currentContactId,
    drawNameEventId,
    guardedDrawNameEventResponse?.data,
  ]);
  const canAccessParticipantDraw = useMemo(() => {
    if (!drawNameEventId || canManageExistingDrawFlow) {
      return false;
    }

    const guardedDrawNameEvent = guardedDrawNameEventResponse?.data;

    if (!guardedDrawNameEvent) {
      return false;
    }

    const normalizedStatus =
      guardedDrawNameEvent.event.status?.trim().toLowerCase() || "";

    const canParticipantAccessThisDraw =
      normalizedStatus === "ongoing" ||
      normalizedStatus === "completed" ||
      guardedDrawNameEvent.isDrawCompleted === true;

    if (!canParticipantAccessThisDraw) {
      return false;
    }

    return Boolean(myParticipantResponse?.data?.id);
  }, [
    canManageExistingDrawFlow,
    drawNameEventId,
    guardedDrawNameEventResponse?.data,
    myParticipantResponse?.data?.id,
  ]);
  const isParticipantStep = isParticipantDrawNameFlowStep(currentStep);
  const canAccessParticipantDrawFlow =
    canAccessParticipantDraw && isParticipantStep;
  const canAccessExistingDrawFlow =
    !drawNameEventId ||
    canManageExistingDrawFlow ||
    canAccessParticipantDraw;
  const flowActor =
    drawNameEventId && !canManageExistingDrawFlow ? "participant" : "creator";

  const handleStartDrawName = () => {
    resetFlowSelection(buildDrawNameFlowSelectionKey("creator", null, null));
    openModal("event");
  };

  useEffect(() => {
    if (isOpen && currentStep !== "event" && !drawNameEventId) {
      closeModal();
    }
  }, [closeModal, currentStep, drawNameEventId, isOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      !drawNameEventId ||
      !eventId ||
      !canAccessParticipantDraw ||
      canManageExistingDrawFlow ||
      isParticipantStep
    ) {
      return;
    }

    replaceCurrentStep("wishlist-gifts", eventId, drawNameEventId);
  }, [
    canAccessParticipantDraw,
    canManageExistingDrawFlow,
    drawNameEventId,
    eventId,
    isOpen,
    isParticipantStep,
    replaceCurrentStep,
  ]);

  useEffect(() => {
    if (
      !isOpen ||
      !drawNameEventId ||
      isGuardedDrawNameEventLoading ||
      isMyParticipantLoading ||
      !guardedDrawNameEventResponse?.data ||
      canAccessExistingDrawFlow
    ) {
      return;
    }

    if (hasShownCreatorAccessErrorRef.current !== drawNameEventId) {
      hasShownCreatorAccessErrorRef.current = drawNameEventId;
      toast.error("You cannot access this draw flow right now.");
    }

    closeModal();
  }, [
    canAccessExistingDrawFlow,
    closeModal,
    drawNameEventId,
    guardedDrawNameEventResponse?.data,
    isGuardedDrawNameEventLoading,
    isMyParticipantLoading,
    isOpen,
  ]);

  useEffect(() => {
    if (!drawNameEventId) {
      hasShownCreatorAccessErrorRef.current = null;
    }
  }, [drawNameEventId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Draw Names"
        description="Organize secret gift exchanges"
        actionLabel="Draw Name"
        onAction={handleStartDrawName}
        actions={
          <Button
            onClick={handleStartDrawName}
            className="h-[44px] pl-2 pr-5 text-sm font-medium   "
          >
            <span className="inline-flex items-center gap-2.5">
              <Image
                src={AddBtn}
                alt=""
                aria-hidden
                className="w-6 h-6 brightness-0 invert"
              />
              <span>Draw Name</span>
            </span>
          </Button>
        }
      />

      <DrawNamesStats />

      <DrawNamesActivity />

      <DrawNameStartModal
        open={isOpen && (!drawNameEventId || canAccessExistingDrawFlow)}
        currentStep={currentStep}
        eventId={eventId}
        drawNameEventId={drawNameEventId}
        flowActor={flowActor}
        onStepChange={setCurrentStep}
        onReplaceStep={replaceCurrentStep}
        onClose={closeModal}
      />
    </div>
  );
}
