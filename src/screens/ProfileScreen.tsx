"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Globe2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from "lucide-react";
import Button from "@/components/Button";
import ProfilePhotoCropModal from "@/components/ProfilePhotoCropModal";
import { Input } from "@/components/ui/input";
import { useExternalProfileQuery } from "@/features/auth/hooks/useExternalProfileQuery";
import { updateExternalProfile } from "@/features/auth/service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExternalProfileRecord } from "@/features/auth/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type ProfileFormValues = {
  name: string;
  email: string;
  address: string;
  businessCity: string;
  state: string;
  country: string;
  phoneNumber: string;
};

type ProfileErrors = Partial<Record<keyof ProfileFormValues, string>>;
type ProfileTouched = Partial<Record<keyof ProfileFormValues, boolean>>;

const COUNTRY_OPTIONS = ["Nigeria", "Ghana", "Kenya", "South Africa"] as const;

const STATE_OPTIONS = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

const BUSINESS_CITY_OPTIONS = [
  "Ikeja",
  "Lekki",
  "Yaba",
  "Victoria Island",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
] as const;

function getFullName(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.trim() || ""} ${lastName?.trim() || ""}`.trim();
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function formatMemberSinceDate(value?: string | null) {
  if (!value) {
    return "Recently joined";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently joined";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildProfileValues(
  user: ReturnType<typeof useAuthStore.getState>["user"],
  externalProfile?: ExternalProfileRecord | null,
): ProfileFormValues {
  const accountProfile = externalProfile?.accountId ?? user?.profile?.accountId;
  const fullName =
    getFullName(accountProfile?.firstName, accountProfile?.lastName) ||
    getFullName(user?.firstName, user?.lastName) ||
    "";

  return {
    name: fullName,
    email: accountProfile?.email?.trim() || user?.email?.trim() || "",
    address:
      externalProfile?.address?.trim() || user?.profile?.address?.trim() || "",
    businessCity:
      externalProfile?.businessCity?.trim() ||
      user?.profile?.businessCity?.trim() ||
      "Ikeja",
    state:
      externalProfile?.state?.trim() ||
      user?.profile?.state?.trim() ||
      "Lagos",
    country:
      externalProfile?.country?.trim() ||
      externalProfile?.nationality?.trim() ||
      user?.profile?.country?.trim() ||
      "Nigeria",
    phoneNumber:
      accountProfile?.phoneNumber?.trim() ||
      user?.phoneNumber?.trim() ||
      "",
  };
}

function validateProfile(values: ProfileFormValues): ProfileErrors {
  const errors: ProfileErrors = {};
  const normalizedName = values.name.trim();
  const normalizedEmail = values.email.trim();
  const normalizedAddress = values.address.trim();
  const normalizedPhone = values.phoneNumber.trim();

  if (normalizedName.length < 2) {
    errors.name = "Enter your full name.";
  }

  if (!normalizedEmail) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (normalizedAddress.length < 4) {
    errors.address = "Enter your address.";
  }

  if (!values.businessCity) {
    errors.businessCity = "Select your business city.";
  }

  if (!values.state) {
    errors.state = "Select your state.";
  }

  if (!values.country) {
    errors.country = "Select your country.";
  }

  if (!normalizedPhone) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!/^\+?[0-9()\-\s]{7,20}$/.test(normalizedPhone)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  return errors;
}

function NigeriaFlag({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-4 w-5 overflow-hidden rounded-[3px] border border-[#E5E7EB]",
        className,
      )}
    >
      <span className="flex-1 bg-[#16833C]" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-[#16833C]" />
    </span>
  );
}

function ProfileAvatar({
  name,
  photoUrl,
  editable = false,
  onEditPhoto,
}: {
  name: string;
  photoUrl?: string | null;
  editable?: boolean;
  onEditPhoto?: () => void;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative">
      <div className="relative flex size-[100px] items-center justify-center overflow-hidden rounded-full bg-[#EDE4FF] text-[28px] font-semibold text-[#3300C9] shadow-[0_10px_30px_rgba(51,0,201,0.12)] sm:size-[150px]">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name || "Profile photo"}
            fill
            className="object-cover"
            sizes="150px"
          />
        ) : (
          initials || "YP"
        )}
      </div>

      {editable ? (
        <button
          type="button"
          onClick={onEditPhoto}
          className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#3300C9] text-white shadow-md transition-opacity hover:opacity-90"
          aria-label="Edit profile photo"
        >
          <Pencil className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
  countryFlag = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  countryFlag?: boolean;
}) {
  return (
    <div className="space-y-2 rounded-[18px] border border-[#F1EDF9] bg-[#FCFBFF] p-4">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8A8892]">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-[#F4F0FF] text-[#3300C9]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-[#1E1E1E]">
            {countryFlag ? <NigeriaFlag /> : null}
            <span className="truncate">{value || "Not provided"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[13px] font-medium text-[#5B5865]">{children}</label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-[#D14B4B]">{message}</p>;
}

function ProfileTextField({
  label,
  value,
  placeholder,
  error,
  touched,
  type = "text",
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  touched?: boolean;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const showError = touched && error;

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={Boolean(showError)}
        className={cn(
          "h-11 rounded-[12px] border-[#E6E1F3] bg-white px-4 text-sm shadow-none focus-visible:ring-[#3300C9]/20",
          showError && "border-[#D14B4B] focus-visible:ring-[#D14B4B]/20",
        )}
      />
      <FieldError message={showError ? error : undefined} />
    </div>
  );
}

function ProfileSelectField({
  label,
  value,
  placeholder,
  error,
  touched,
  options,
  onChange,
  showNigeriaFlag = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  touched?: boolean;
  options: readonly string[];
  onChange: (value: string) => void;
  showNigeriaFlag?: boolean;
}) {
  const showError = touched && error;

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-invalid={Boolean(showError)}
          className={cn(
            "h-11 w-full rounded-[12px] border-[#E6E1F3] bg-white px-4 text-sm shadow-none focus-visible:ring-[#3300C9]/20",
            showError && "border-[#D14B4B] focus-visible:ring-[#D14B4B]/20",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            {showNigeriaFlag && value === "Nigeria" ? <NigeriaFlag /> : null}
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="z-[140]">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError message={showError ? error : undefined} />
    </div>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const authUser = useAuthStore((state) => state.user);
  const persistedProfile = useAuthStore((state) => state.profile);
  const authToken = useAuthStore((state) => state.token);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const profileId =
    authUser?.profile?._id?.trim() ||
    persistedProfile?._id?.trim() ||
    authUser?.profileId?.trim() ||
    null;
  const {
    data: externalProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useExternalProfileQuery(profileId, authToken, {
    enabled: Boolean(profileId) && Boolean(authToken),
  });
  const resolvedProfile = externalProfile ?? authUser?.profile ?? null;
  const initialProfileValues = useMemo(
    () => buildProfileValues(authUser, resolvedProfile),
    [authUser, resolvedProfile],
  );
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] =
    useState<ProfileFormValues>(initialProfileValues);
  const [draftProfile, setDraftProfile] =
    useState<ProfileFormValues>(initialProfileValues);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [touched, setTouched] = useState<ProfileTouched>({});
  const [isSaving, setIsSaving] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [pendingCropImageSrc, setPendingCropImageSrc] = useState<string | null>(
    null,
  );
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    setSavedProfile(initialProfileValues);
    setDraftProfile(initialProfileValues);
    setErrors({});
    setTouched({});
  }, [initialProfileValues]);

  useEffect(() => {
    if (!externalProfile?.accountId) {
      return;
    }

    updateUserProfile({
      firstName: externalProfile.accountId.firstName,
      lastName: externalProfile.accountId.lastName,
      email: externalProfile.accountId.email,
      phoneNumber: externalProfile.accountId.phoneNumber,
      businessCity: externalProfile.businessCity?.trim() || "",
      state: externalProfile.state?.trim() || "",
      country:
        externalProfile.country?.trim() ||
        externalProfile.nationality?.trim() ||
        "",
      currency: externalProfile.currency?.trim() || "",
      profilePhotoUrl: externalProfile.profilePhotoUrl?.trim() || null,
      address: externalProfile.address?.trim() || "",
    });
  }, [externalProfile, updateUserProfile]);

  useEffect(() => {
    if (!localPhotoUrl && resolvedProfile?.profilePhotoUrl?.trim()) {
      setLocalPhotoUrl(resolvedProfile.profilePhotoUrl.trim());
    }
  }, [localPhotoUrl, resolvedProfile?.profilePhotoUrl]);

  const profileName = savedProfile.name || "Your Profile";
  const profileEmail = savedProfile.email || "No email address";
  const profilePhotoUrl =
    localPhotoUrl || resolvedProfile?.profilePhotoUrl?.trim() || null;
  const joinedDate = formatMemberSinceDate(
    resolvedProfile?.accountId?.createdAt || resolvedProfile?.createdAt,
  );
  const subtitle = isEditing
    ? "Update your profile details and save your changes."
    : "Edit Profile info. This info may be connected to business network or used for billing purposes.";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard");
  };

  const handleEditProfile = () => {
    setDraftProfile(savedProfile);
    setErrors({});
    setTouched({});
    setIsEditing(true);
  };

  const handleProfilePhotoEdit = () => {
    if (!isEditing) {
      return;
    }

    fileInputRef.current?.click();
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

  const handleProfilePhotoCropped = (croppedImageSrc: string) => {
    setLocalPhotoUrl(croppedImageSrc);
    setPendingCropImageSrc(null);
    setIsCropModalOpen(false);
    toast.success("Profile photo updated. Save your changes to keep it.");
  };

  const handleCloseCropModal = () => {
    setPendingCropImageSrc(null);
    setIsCropModalOpen(false);
  };

  const handleFieldChange = <K extends keyof ProfileFormValues>(
    field: K,
    value: ProfileFormValues[K],
  ) => {
    setDraftProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const markFieldTouched = (field: keyof ProfileFormValues) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  };

  const handleSaveProfile = async () => {
    const nextErrors = validateProfile(draftProfile);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTouched({
        name: true,
        email: true,
        address: true,
        businessCity: true,
        state: true,
        country: true,
        phoneNumber: true,
      });
      toast.error("Please fix the highlighted profile fields.");
      return;
    }

    if (!profileId || !authToken) {
      toast.error("Unable to resolve your profile right now.");
      return;
    }

    const splitName = splitFullName(draftProfile.name);
    const normalizedDraftProfile = {
      ...draftProfile,
      name: draftProfile.name.trim(),
      email: draftProfile.email.trim(),
      address: draftProfile.address.trim(),
      phoneNumber: draftProfile.phoneNumber.trim(),
    };
    const currency = resolvedProfile?.currency?.trim() || "NGN";
    const profilePhoto = localPhotoUrl?.trim() || resolvedProfile?.profilePhotoUrl?.trim() || "";

    try {
      setIsSaving(true);

      const response = await updateExternalProfile(profileId, authToken, {
        firstName: splitName.firstName,
        lastName: splitName.lastName,
        email: normalizedDraftProfile.email,
        businessCity: normalizedDraftProfile.businessCity,
        state: normalizedDraftProfile.state,
        country: normalizedDraftProfile.country,
        phoneNumber: normalizedDraftProfile.phoneNumber,
        currency,
        profilePhotoUrl: profilePhoto,
      });

      updateUserProfile({
        firstName: splitName.firstName,
        lastName: splitName.lastName,
        email: normalizedDraftProfile.email,
        phoneNumber: normalizedDraftProfile.phoneNumber,
        businessCity: normalizedDraftProfile.businessCity,
        state: normalizedDraftProfile.state,
        country: normalizedDraftProfile.country,
        currency,
        profilePhotoUrl: profilePhoto || null,
        address: normalizedDraftProfile.address,
      });

      setSavedProfile(normalizedDraftProfile);
      setErrors({});
      setTouched({});
      setIsEditing(false);
      void refetchProfile();
      toast.success(response.message || "Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your profile right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-[15px] font-medium text-[#3F3A48] transition-colors hover:text-[#3300C9]"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white/80 shadow-[0_10px_30px_rgba(51,0,201,0.08)]">
          <ArrowLeft className="size-4" />
        </span>
        <span>Back</span>
      </button> */}

      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#1E1E1E] sm:text-[34px]">
          {isEditing ? "Edit Profile" : "My Profile"}
        </h1>
        <p className="max-w-[760px] text-sm text-[#7D7D7D]">{subtitle}</p>
      </div>

      <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(51,0,201,0.06)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfileAvatar
              name={profileName}
              photoUrl={profilePhotoUrl}
              editable={isEditing}
              onEditPhoto={handleProfilePhotoEdit}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePhotoSelection}
            />

            <div className="space-y-3">
              <div>
                <p className="text-[22px] font-semibold text-[#1E1E1E]">
                  {profileName}
                </p>
                <p className="mt-1 text-sm text-[#6E6A78]">{profileEmail}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#7D7D7D]">
                <span className="inline-flex items-center gap-2">
                  <NigeriaFlag />
                  {savedProfile.country || "Nigeria"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#9A97A4]" />
                  {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {isEditing ? (
            <Button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="h-[44px] px-8 text-sm font-medium"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleEditProfile}
              className="h-[44px] px-8 text-sm font-medium"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </section>

      <ProfilePhotoCropModal
        open={isCropModalOpen}
        imageSrc={pendingCropImageSrc}
        onClose={handleCloseCropModal}
        onConfirm={handleProfilePhotoCropped}
      />

      <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(51,0,201,0.06)] backdrop-blur sm:p-8">
        {isProfileError ? (
          <div className="mb-6 rounded-[18px] border border-[#F6D2D2] bg-[#FFF7F7] px-4 py-3 text-sm text-[#A14646]">
            We could not refresh your latest profile details right now. Showing
            your saved profile information instead.
          </div>
        ) : null}
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-semibold text-[#1E1E1E]">
                Edit Profile
              </h2>
              <p className="mt-2 text-sm text-[#7D7D7D]">
                Keep your details current so your celebration experience stays
                accurate.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileTextField
                label="Name"
                value={draftProfile.name}
                placeholder="Enter your full name"
                error={errors.name}
                touched={touched.name}
                onChange={(value) => handleFieldChange("name", value)}
                onBlur={() => markFieldTouched("name")}
              />

              <ProfileTextField
                label="Email"
                type="email"
                value={draftProfile.email}
                placeholder="Enter your email address"
                error={errors.email}
                touched={touched.email}
                onChange={(value) => handleFieldChange("email", value)}
                onBlur={() => markFieldTouched("email")}
              />

              <ProfileTextField
                label="Address"
                value={draftProfile.address}
                placeholder="Enter your address"
                error={errors.address}
                touched={touched.address}
                onChange={(value) => handleFieldChange("address", value)}
                onBlur={() => markFieldTouched("address")}
              />

              <ProfileSelectField
                label="Business City"
                value={draftProfile.businessCity}
                placeholder="Select business city"
                error={errors.businessCity}
                touched={touched.businessCity}
                options={BUSINESS_CITY_OPTIONS}
                onChange={(value) => {
                  handleFieldChange("businessCity", value);
                  markFieldTouched("businessCity");
                }}
              />

              <ProfileSelectField
                label="State"
                value={draftProfile.state}
                placeholder="Select your state"
                error={errors.state}
                touched={touched.state}
                options={STATE_OPTIONS}
                onChange={(value) => {
                  handleFieldChange("state", value);
                  markFieldTouched("state");
                }}
              />

              <ProfileSelectField
                label="Country"
                value={draftProfile.country}
                placeholder="Select your country"
                error={errors.country}
                touched={touched.country}
                options={COUNTRY_OPTIONS}
                onChange={(value) => {
                  handleFieldChange("country", value);
                  markFieldTouched("country");
                }}
                showNigeriaFlag={true}
              />

              <ProfileTextField
                label="Phone Number"
                value={draftProfile.phoneNumber}
                placeholder="Enter your phone number"
                error={errors.phoneNumber}
                touched={touched.phoneNumber}
                onChange={(value) => handleFieldChange("phoneNumber", value)}
                onBlur={() => markFieldTouched("phoneNumber")}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-semibold text-[#1E1E1E]">
                Personal Information
              </h2>
              <p className="mt-2 text-sm text-[#7D7D7D]">
                Here&apos;s the information currently attached to your profile.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailItem
                label="Name"
                value={savedProfile.name}
                icon={<User className="size-4" />}
              />
              <DetailItem
                label="Email"
                value={savedProfile.email}
                icon={<Mail className="size-4" />}
              />
              <DetailItem
                label="Phone"
                value={savedProfile.phoneNumber}
                icon={<Phone className="size-4" />}
              />
              <DetailItem
                label="Address"
                value={savedProfile.address}
                icon={<MapPin className="size-4" />}
              />
              <DetailItem
                label="Business City"
                value={savedProfile.businessCity}
                icon={<Building2 className="size-4" />}
              />
              <DetailItem
                label="State"
                value={savedProfile.state}
                icon={<MapPin className="size-4" />}
              />
              <DetailItem
                label="Country"
                value={savedProfile.country}
                icon={<Globe2 className="size-4" />}
                countryFlag={savedProfile.country === "Nigeria"}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
