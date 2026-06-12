"use client";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";

export type AddColleagueFormValues = {
  gender: "male" | "female" | "";
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
};

type AddColleagueFormProps = {
  values: AddColleagueFormValues;
  onChange: <K extends keyof AddColleagueFormValues>(
    field: K,
    value: AddColleagueFormValues[K],
  ) => void;
  onBack: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  isSaving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[14px] font-medium text-[#434343]">{children}</label>
  );
}

export default function AddColleagueForm({
  values,
  onChange,
  onBack,
  onSave,
  saveDisabled = false,
  isSaving = false,
  saveLabel = "Save",
  savingLabel = "Saving",
}: AddColleagueFormProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <FieldLabel>Gender</FieldLabel>
        <RadioGroup
          value={values.gender}
          onValueChange={(value) =>
            onChange("gender", value as AddColleagueFormValues["gender"])
          }
          className="flex items-center gap-8"
        >
          <label className="inline-flex items-center gap-2 text-[14px] text-[#6A6A6A]">
            <RadioGroupItem
              value="male"
              className="size-[14px] border-[#597B2F] text-[#597B2F] shadow-none focus-visible:ring-0"
              iconClassName="size-[6px] fill-[#597B2F]"
            />
            Male
          </label>
          <label className="inline-flex items-center gap-2 text-[14px] text-[#6A6A6A]">
            <RadioGroupItem
              value="female"
              className="size-[14px] border-[#597B2F] text-[#597B2F] shadow-none focus-visible:ring-0"
              iconClassName="size-[6px] fill-[#597B2F]"
            />
            Female
          </label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <FieldLabel>First Name</FieldLabel>
        <Input
          value={values.firstName}
          onChange={(event) => onChange("firstName", event.target.value)}
          placeholder="Enter first name"
          className="h-[38px] rounded-[8px] border-[#D9D5E5] px-3 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel>Last Name</FieldLabel>
        <Input
          value={values.lastName}
          onChange={(event) => onChange("lastName", event.target.value)}
          placeholder="Enter Last Name"
          className="h-[38px] rounded-[8px] border-[#D9D5E5] px-3 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel>Phone number</FieldLabel>
        <Input
          value={values.phoneNumber}
          onChange={(event) => onChange("phoneNumber", event.target.value)}
          placeholder="Enter Phone number"
          className="h-[38px] rounded-[8px] border-[#D9D5E5] px-3 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          placeholder="Enter email address"
          className="h-[38px] rounded-[8px] border-[#D9D5E5] px-3 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[40px] min-w-[100px] items-center justify-center rounded-full border border-[#597B2F] bg-white px-6 text-[14px] font-medium text-[#597B2F] transition-colors hover:bg-[#F6FAF1]"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled || isSaving}
          className="flex h-[40px] min-w-[100px] items-center justify-center rounded-full bg-[#3300C9] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#2D00B4] disabled:cursor-not-allowed disabled:bg-[#BEB3EE]"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="size-4" />
              {savingLabel}
            </span>
          ) : (
            saveLabel
          )}
        </button>
      </div>
    </div>
  );
}
