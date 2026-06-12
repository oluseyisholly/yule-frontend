"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useSignInMutation } from "@/features/auth/hooks/useSignInMutation";
import { useMyContactIdMutation } from "@/features/contacts/hooks/useMyContactIdMutation";
import { ApiRequestError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  remember: Yup.boolean(),
});

type FormValues = Yup.InferType<typeof validationSchema>;

export default function StartCelebratingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const setCurrentContactId = useAuthStore((state) => state.setCurrentContactId);
  const signInMutation = useSignInMutation();
  const myContactIdMutation = useMyContactIdMutation();
  const redirectPath = searchParams.get("redirect")?.trim() || "/dashboard";
  const prefilledEmail = searchParams.get("email")?.trim() || "";
  const initialValues = useMemo<FormValues>(
    () => ({
      email: prefilledEmail,
      password: "",
      remember: true,
    }),
    [prefilledEmail],
  );

  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col">
      {/* Title */}
      <div className="text-center mb-7 md:mb-9">
        <h1 className="font-muted text-[#17191C] font-semibold text-[36px] text-dark leading-tight">
          Start Celebrating
        </h1>
        <p className="text-muted text-[12px]  ">
          Be Part of the Moment
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const response = await signInMutation.mutateAsync({
              email: values.email,
              password: values.password,
            });

            setAuthSession(response.data);
            try {
              const currentContactIdResponse =
                await myContactIdMutation.mutateAsync();
              setCurrentContactId(
                currentContactIdResponse.data?.contactId ?? null,
              );
            } catch {
              setCurrentContactId(null);
            }
            toast.success(response.message || "Login successful");
            router.replace(redirectPath);
          } catch (error) {
            if (error instanceof ApiRequestError && error.isNetworkError) {
              return;
            }

            const message =
              error instanceof ApiRequestError || error instanceof Error
                ? error.message
                : "Unable to login right now. Please try again.";

            toast.error(message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="flex flex-col gap-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter Email"
            />

            <div className="flex flex-col gap-2">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="****************"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[13px] text-dark cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(values.remember)}
                    onChange={(e) =>
                      setFieldValue("remember", e.target.checked)
                    }
                    className="w-4 h-4 rounded-[4px] accent-primary cursor-pointer"
                  />
                  Remember Me
                </label>

                <Link
                  href="/forgot-password"
                  className="text-[13px] font-semibold text-[#FF3B3B] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              label={
                signInMutation.isPending || isSubmitting
                  ? "Logging in..."
                  : "Login"
              }
              variant="filled"
              className="w-full h-12 rounded-lg text-[15px] mt-1"
              disabled={signInMutation.isPending || isSubmitting}
            />

            <button
              type="button"
              className="w-full h-12 rounded-lg border border-gray-200 bg-white text-dark text-[14px] font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <GoogleIcon />
              Log with Google
            </button>

            <p className="text-center text-[14px] text-muted mt-1">
              Not Registered Yet?{" "}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}
