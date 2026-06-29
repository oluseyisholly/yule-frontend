"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BellIcon,
  BriefcaseBusinessIcon,
  CameraIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UserRoundPlusIcon,
  XIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";
import toast from "react-hot-toast";
import ProfilePhotoCropModal from "@/components/ProfilePhotoCropModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ThemeToggle from "@/components/ThemeToggle";
import { getDashboardNavItemByPathname } from "@/components/dashboard/navigation";
import { updateExternalProfile } from "@/features/auth/service";
import { cn } from "@/lib/utils";
import { clearStoredAuthSession, useAuthStore } from "@/stores/auth-store";
import { AUTH_APP_BASE_URL_MANAGE_ACCOUNT } from "@/lib/external-links";

function CompanyBranchIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.63875 0.807656L8.01375 2.15765C8.145 2.21015 8.25 2.36764 8.25 2.50639V3.7514C8.25 3.95765 8.08125 4.1264 7.875 4.1264H1.125C0.91875 4.1264 0.75 3.95765 0.75 3.7514V2.50639C0.75 2.36764 0.855002 2.21015 0.986252 2.15765L4.36125 0.807656C4.43625 0.777656 4.56375 0.777656 4.63875 0.807656Z"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 8.25H0.75V7.125C0.75 6.91875 0.91875 6.75 1.125 6.75H7.875C8.08125 6.75 8.25 6.91875 8.25 7.125V8.25Z"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.375 8.25H8.625"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 3.1875C4.81066 3.1875 5.0625 2.93566 5.0625 2.625C5.0625 2.31434 4.81066 2.0625 4.5 2.0625C4.18934 2.0625 3.9375 2.31434 3.9375 2.625C3.9375 2.93566 4.18934 3.1875 4.5 3.1875Z"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BranchBusinessNameIcon() {
  return <CompanyBranchIcon />;
}

function CompanyBranchSeparatorIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.6582 7.47125L3.2132 5.02625C2.92445 4.7375 2.92445 4.265 3.2132 3.97625L5.6582 1.53125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);

  if (parts.length === 0) return "Y";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function HeaderAvatar({
  name,
  photoUrl,
  sizeClassName,
  textClassName,
}: {
  name: string;
  photoUrl?: string | null;
  sizeClassName: string;
  textClassName: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#efe6fd] font-semibold text-[#3300C9]",
        sizeClassName,
        textClassName,
      )}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name || "Profile photo"}
          fill
          className="object-cover"
          sizes="96px"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

function ProfileMenuRow({
  icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-6 py-1 text-left text-[15px] font-medium transition-colors hover:bg-[#FAF8FF]",
        tone === "danger" ? "text-[#FF3B30]" : "text-[#434343]",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center",
          tone === "danger" ? "text-[#7D7D7D]" : "text-[#7D7D7D]",
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function DashboardProfileMenu({
  trigger,
  profileName,
  profileEmail,
  activeBusinessName,
  profilePhotoUrl,
}: {
  trigger: React.ReactNode;
  profileName: string;
  profileEmail: string;
  activeBusinessName: string;
  profilePhotoUrl?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingCropImageSrc, setPendingCropImageSrc] = useState<string | null>(
    null,
  );
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const authUser = useAuthStore((state) => state.user);
  const persistedProfile = useAuthStore((state) => state.profile);
  const authToken = useAuthStore((state) => state.token);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const greetingName =
    profileName.split(" ").filter(Boolean)[0]?.trim() || "there";
  const profileId =
    authUser?.profile?._id?.trim() ||
    persistedProfile?._id?.trim() ||
    authUser?.profileId?.trim() ||
    null;

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    setOpen(false);
    clearStoredAuthSession();
    window.location.assign("/");
  };

  const handleProfilePhotoSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        toast.error("Unable to prepare that image right now.");
        return;
      }

      setPendingCropImageSrc(reader.result);
      setIsCropModalOpen(true);
    };
    reader.onerror = () => {
      toast.error("Unable to read that image right now.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCloseCropModal = () => {
    setPendingCropImageSrc(null);
    setIsCropModalOpen(false);
  };

  const handleProfilePhotoCropped = async (croppedImageSrc: string) => {
    if (!profileId || !authToken) {
      toast.error("Unable to resolve your profile right now.");
      return;
    }

    try {
      setIsUpdatingPhoto(true);

      await updateExternalProfile(profileId, authToken, {
        profilePhotoUrl: croppedImageSrc,
      });

      updateUserProfile({
        profilePhotoUrl: croppedImageSrc,
      });

      setPendingCropImageSrc(null);
      setIsCropModalOpen(false);
      toast.success("Profile photo updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your profile photo right now.",
      );
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={12}
          className="w-[min(370px,calc(100vw-24px))] rounded-[26px] border border-[#E8E3F5] bg-white p-0 shadow-[0_28px_64px_rgba(33,18,94,0.14)]"
        >
          <div className="relative px-4 pb-6 pt-4 text-center sm:px-6 sm:pb-7">
            <p className="px-8 text-[13px] font-medium break-words text-[#616777] sm:px-10 sm:text-[14px]">
              {profileEmail}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close profile menu"
              className="absolute right-4 top-4 rounded-full p-1 text-[#7E8495] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343] sm:right-6"
            >
              <XIcon className="size-4" />
            </button>

            <div className="relative mx-auto mt-5 flex size-[92px] items-center justify-center">
              <HeaderAvatar
                name={profileName}
                photoUrl={profilePhotoUrl}
                sizeClassName="size-[92px]"
                textClassName="text-[38px]"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Update profile photo"
                disabled={isUpdatingPhoto}
                className="absolute bottom-0 right-0 z-10 flex size-8 items-center justify-center rounded-full border-[3px] border-white bg-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <CameraIcon className="size-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePhotoSelection}
            />

            <h3 className="mt-4 text-[18px] font-semibold text-[#1E1E1E]">
              Hi, {greetingName}!
            </h3>

            <p className="mt-2 flex items-center justify-center gap-2 text-[15px] text-[#6F7483]">
              <BriefcaseBusinessIcon className="size-4 shrink-0" />
              <span className="max-w-full truncate">{profileName}</span>
            </p>

            <a
              href={AUTH_APP_BASE_URL_MANAGE_ACCOUNT}
              className="mt-3 inline-flex h-[40px] w-full max-w-[280px] items-center justify-center rounded-full border border-[#D9DDEA] px-4 text-center text-[15px] font-medium text-[#434343] transition-colors hover:bg-[#FAF8FF] sm:px-6 sm:text-[16px]"
            >
              Manage your Viktri account
            </a>
          </div>

          <div className="border-t border-[#ECE8F7] py-2">
            <ProfileMenuRow
              icon={<LogOutIcon className="size-4.5" />}
              label="Log out"
              onClick={handleLogout}
              tone="danger"
            />
          </div>

          <div className="border-t border-[#ECE8F7] px-4 py-4 text-center text-[13px] text-[#8B90A0] sm:px-6 sm:text-[14px]">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[#3300C9]"
            >
              Privacy Policy
            </Link>
            <span className="px-2">·</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-[#3300C9]"
            >
              Terms of Service
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      <ProfilePhotoCropModal
        open={isCropModalOpen}
        imageSrc={pendingCropImageSrc}
        onClose={handleCloseCropModal}
        onConfirm={handleProfilePhotoCropped}
      />
    </>
  );
}

type DashboardHeaderProps = {
  onMobileMenuToggle?: () => void;
};

export default function DashboardHeader({
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const activeItem = getDashboardNavItemByPathname(pathname);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const activeBusinessName = "Yule";
  const activeBranchName = activeItem.label;
  const dashboardHeaderProfile = {
    name:
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      "Yule User",
    email: user?.email?.trim() || "No email",
    photoUrl: user?.profile?.profilePhotoUrl?.trim() || null,
  };

  return (
    <header className="overflow-hidden  border border-white/70 bg-white px-4 py-4  sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full text-[#434343] hover:bg-[#f6f2ff]"
          aria-label="Open sidebar"
          onClick={onMobileMenuToggle}
        >
          <MenuIcon size={24} />
        </Button>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="flex min-w-0 max-w-[46vw] items-center gap-1 text-xs text-[#434343]">
            <p className="flex items-center gap-1 truncate">
              <CompanyBranchIcon />
              <span className="truncate">{activeBusinessName}</span>
            </p>
            <CompanyBranchSeparatorIcon />
            <p className="flex items-center gap-1 truncate">
              <BranchBusinessNameIcon />
              <span className="truncate">{activeBranchName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="size-9" />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-9 rounded-full text-[#434343] hover:bg-[#f6f2ff]"
              onClick={() => setShowMobileSearch((prev) => !prev)}
              aria-label="Toggle search"
            >
              <SearchIcon className="size-4" />
            </Button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-9 items-center justify-center rounded-full text-[#434343] transition-colors hover:bg-[#f6f2ff]"
            >
              <BellIcon className="size-4" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#ff6600]" />
            </button>

            <DashboardProfileMenu
              profileName={dashboardHeaderProfile.name}
              profileEmail={dashboardHeaderProfile.email}
              activeBusinessName={activeBusinessName}
              profilePhotoUrl={dashboardHeaderProfile.photoUrl}
              trigger={
                <button
                  type="button"
                  aria-label="Profile"
                  className="flex size-9 items-center justify-center rounded-full"
                >
                  <HeaderAvatar
                    name={dashboardHeaderProfile.name}
                    photoUrl={dashboardHeaderProfile.photoUrl}
                    sizeClassName="size-9"
                    textClassName="text-xs"
                  />
                </button>
              }
            />
          </div>
        </div>
      </div>

      <div className="hidden justify-end lg:flex">
        <div className="flex min-w-0 items-center justify-end gap-4 xl:gap-6">
          <div className="relative w-[280px] shrink-0 xl:w-[340px]">
            <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7d7d7d]" />
            <Input
              placeholder="Search..."
              className="h-[42px] rounded-full border-[#ece8f7] bg-[#fcfbff] pl-11 text-[14px] text-[#434343] placeholder:text-[#9a97a5] focus-visible:border-[#d6ccf5] focus-visible:ring-[#d6ccf5]/40"
            />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1 text-xs text-[#434343]">
            <p className="flex items-center gap-1 truncate">
              <BranchBusinessNameIcon />
              <span className="truncate">{activeBranchName}</span>
            </p>
            <CompanyBranchSeparatorIcon />
            <p className="flex items-center gap-1 truncate">
              <CompanyBranchIcon />
              <span className="truncate">{activeBusinessName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="size-10" />
            <DashboardProfileMenu
              profileName={dashboardHeaderProfile.name}
              profileEmail={dashboardHeaderProfile.email}
              activeBusinessName={activeBusinessName}
              profilePhotoUrl={dashboardHeaderProfile.photoUrl}
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-left transition-colors hover:bg-[#faf8ff]"
                >
                  <HeaderAvatar
                    name={dashboardHeaderProfile.name}
                    photoUrl={dashboardHeaderProfile.photoUrl}
                    sizeClassName="size-10"
                    textClassName="text-sm"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#1e1e1e]">
                      {dashboardHeaderProfile.name}
                    </span>
                    <span className="block truncate text-xs text-[#7d7d7d]">
                      {dashboardHeaderProfile.email}
                    </span>
                  </span>
                </button>
              }
            />

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-full  bg-white text-[#434343] transition-colors hover:bg-[#f8f5ff]"
            >
              <BellIcon className="size-4" />
              <span className="absolute right-3 top-3 size-1.5 rounded-full bg-[#ff6600]" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 lg:hidden",
          showMobileSearch ? "max-h-24 pt-4" : "max-h-0",
        )}
      >
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7d7d7d]" />
          <Input
            placeholder="Search..."
            className="h-[42px] rounded-full border-[#ece8f7] bg-[#fcfbff] pl-11 text-[14px] text-[#434343] placeholder:text-[#9a97a5] focus-visible:border-[#d6ccf5] focus-visible:ring-[#d6ccf5]/40"
          />
        </div>
      </div>
    </header>
  );
}
