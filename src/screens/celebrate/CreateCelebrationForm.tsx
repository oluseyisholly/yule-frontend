"use client";

import Link from "next/link";
import { Form, Formik, useField } from "formik";
import * as Yup from "yup";
import { ChevronDown } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { cn } from "@/lib/utils";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9\s]{6,}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the Terms and Condition"
  ),
  marketing: Yup.boolean(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeTerms: true,
  marketing: true,
};

export default function CreateCelebrationForm() {
  return (
    <div className="w-full max-w-[500px] mx-auto flex flex-col">
      {/* Title */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="font-muted font-semibold text-[36px] text-dark leading-tight">
          Create your first celebration
        </h1>
        <p className="text-muted text-[12px] mt-1.5">
          Join the Celebration 🎉
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log("create celebration", values);
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col gap-5">
            <Input
              label="First Name"
              name="firstName"
              placeholder="Enter first name"
            />

            <Input
              label="Last Name"
              name="lastName"
              placeholder="Enter last name"
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="Enter email"
            />

            <PhoneField />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="****************"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="****************"
            />

            <div className="flex flex-col gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-2 text-[13px] text-dark cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(values.agreeTerms)}
                    onChange={(e) =>
                      setFieldValue("agreeTerms", e.target.checked)
                    }
                    className="mt-0.5 w-4 h-4 rounded-[4px] accent-primary cursor-pointer shrink-0"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-primary font-semibold hover:underline"
                    >
                      Terms and Condition
                    </Link>
                  </span>
                </label>
                <TermsError />
              </div>

              <label className="flex items-start gap-2 text-[13px] text-dark cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(values.marketing)}
                  onChange={(e) => setFieldValue("marketing", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-[4px] accent-primary cursor-pointer shrink-0 text-[#434343]"
                />
                <span>I agree to receive marketing messages from Tenda</span>
              </label>
            </div>

            <Button
              type="submit"
              label="Create Account"
              variant="filled"
              className="w-full h-12 rounded-lg text-[15px] mt-1"
            />

            <p className="text-center text-[#000000] text-[14px] text-muted">
              Already have an account?{" "}
              <Link
                href="/start"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}

function TermsError() {
  const [, meta] = useField("agreeTerms");
  if (!meta.touched || !meta.error) return null;
  return <span className="text-xs text-red-500">{meta.error}</span>;
}

function PhoneField() {
  const [field, meta] = useField("phone");
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor="phone" className="text-[14px] font-medium text-dark">
        Phone number
      </label>

      <div
        className={cn(
          "flex items-center h-12 rounded-lg border bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          hasError ? "border-red-500" : "border-gray-300"
        )}
      >
        <button
          type="button"
          aria-label="Select country code"
          className="flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <NigeriaFlag />
          <ChevronDown className="w-4 h-4 text-muted" />
        </button>

        <span className="mx-3 h-5 w-px bg-gray-200" />

        <span className="text-[14px] text-dark shrink-0">(+234)</span>

        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder="123 456 789"
          aria-invalid={hasError || undefined}
          {...field}
          className="flex-1 ml-2 min-w-0 bg-transparent outline-none text-[14px] text-dark placeholder:text-gray-400"
        />
      </div>

      {hasError && <span className="text-xs text-red-500">{meta.error}</span>}
    </div>
  );
}

function NigeriaFlag() {
  return (
    <svg
      width="22"
      height="16"
      viewBox="0 0 22 16"
      className="rounded-[2px] shrink-0"
      aria-hidden
    >
      <rect width="22" height="16" rx="2" fill="#fff" />
      <rect width="7.33" height="16" fill="#008751" />
      <rect x="14.67" width="7.33" height="16" fill="#008751" />
    </svg>
  );
}
