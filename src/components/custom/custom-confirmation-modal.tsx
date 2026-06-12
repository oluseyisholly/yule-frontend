import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle, type LucideIcon } from "lucide-react";

type ConfirmationAction = "approve" | "reject" | "delete" | "save";

type ConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action?: ConfirmationAction | string;
  isLoading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  employeeName?: string;
  courseName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
};

type ConfirmationConfig = {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  buttonColor: string;
  buttonText: string;
  defaultTitle: string;
  defaultDescription: string;
};

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  action,
  isLoading = false,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  employeeName,
  courseName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ConfirmationModalProps) => {
  const normalizedAction = action ?? "approve";
  const isApprove = normalizedAction.toLowerCase() === "approve";
  const isDelete = normalizedAction.toLowerCase() === "delete";
  const isSave = normalizedAction.toLowerCase() === "save";

  const config: Record<"approve" | "reject" | "delete" | "save", ConfirmationConfig> = {
    approve: {
      icon: CheckCircle2,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
      buttonText: "Approve",
      defaultTitle: "Approve Training Request",
      defaultDescription: `Are you sure you want to approve this training request${
        employeeName ? ` for ${employeeName}` : ""
      }${courseName ? ` - ${courseName}` : ""}?`,
    },
    reject: {
      icon: XCircle,
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
      buttonText: "Reject",
      defaultTitle: "Reject Training Request",
      defaultDescription: `Are you sure you want to reject this training request${
        employeeName ? ` for ${employeeName}` : ""
      }${courseName ? ` - ${courseName}` : ""}?`,
    },
    delete: {
      icon: XCircle,
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
      buttonText: "Delete",
      defaultTitle: "Delete Item",
      defaultDescription: "Are you sure you want to delete this item?",
    },
    save: {
      icon: CheckCircle2,
      iconBgColor: "bg-[#F3EDFF]",
      iconColor: "text-[#3300C9]",
      buttonColor: "bg-[#3300C9] hover:bg-[#2B00AB]",
      buttonText: "Save",
      defaultTitle: "Save Changes",
      defaultDescription: "Are you sure you want to save these changes?",
    },
  };

  const currentConfig = isDelete
    ? config.delete
    : isSave
      ? config.save
      : config[isApprove ? "approve" : "reject"];
  const IconComponent = currentConfig.icon;
  const modalTitle = title || currentConfig.defaultTitle;
  const modalDescription = description || currentConfig.defaultDescription;
  const confirmButtonText = confirmText || currentConfig.buttonText;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="flex max-w-[360px] flex-col rounded-[18px] px-5 py-6 md:px-6 md:py-7"
        onInteractOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!closeOnEscape) {
            event.preventDefault();
          }
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${currentConfig.iconBgColor}`}
          >
            <IconComponent className={`size-7 ${currentConfig.iconColor}`} />
          </div>

          <DialogHeader className="gap-3 text-center">
            <DialogTitle className="text-center text-lg font-semibold md:text-xl">
              {modalTitle}
            </DialogTitle>
            {modalDescription && (
              <DialogDescription className="text-center text-sm leading-6 md:text-[15px]">
                {modalDescription}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9"
          >
            {cancelText}
          </Button>
          <Button
            className={`h-9 text-white ${currentConfig.buttonColor}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" />
                {` ${confirmButtonText.toLowerCase()}`}
              </span>
            ) : (
              confirmButtonText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
