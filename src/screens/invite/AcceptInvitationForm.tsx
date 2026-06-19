"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { InvitationFormSkeleton } from "@/components/ui/context-skeletons";
import { useInvitationAccountExistsQuery } from "@/features/invitations/hooks/useInvitationAccountExistsQuery";
import { useClaimInvitationMutation } from "@/features/invitations/hooks/useClaimInvitationMutation";
import { useInvitationQuery } from "@/features/invitations/hooks/useInvitationQuery";
import { ApiRequestError } from "@/lib/api";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

type AcceptInvitationFormProps = {
  token: string;
};

export default function AcceptInvitationForm({
  token,
}: AcceptInvitationFormProps) {
  const router = useRouter();
  const invitationQuery = useInvitationQuery(token);
  const claimInvitationMutation = useClaimInvitationMutation(token);

  const invitation = invitationQuery.data?.data ?? null;
  const eventContact = invitation?.eventContact ?? null;
  const accountExistsQuery = useInvitationAccountExistsQuery(
    eventContact?.email,
    {
      enabled: Boolean(eventContact?.email),
    },
  );
  const invitedUserAlreadyHasAccount =
    accountExistsQuery.data?.data.exists === true;

  const initialValues = useMemo(
    () => ({
      firstName: eventContact?.firstName ?? "",
      lastName: eventContact?.lastName ?? "",
      email: eventContact?.email ?? "",
      password: "",
      confirmPassword: "",
    }),
    [eventContact],
  );

  const loginHref = useMemo(() => {
    const email = encodeURIComponent(eventContact?.email ?? "");
    const redirect = encodeURIComponent(
      invitation?.redirectPathAfterAccept ?? "/dashboard",
    );

    return `/start?email=${email}&redirect=${redirect}`;
  }, [eventContact?.email, invitation?.redirectPathAfterAccept]);

  if (invitationQuery.isLoading || invitationQuery.isFetching) {
    return <InvitationFormSkeleton />;
  }

  if (
    invitation &&
    eventContact &&
    accountExistsQuery.isLoading
  ) {
    return <InvitationFormSkeleton />;
  }

  if (invitationQuery.isError || !invitation || !eventContact) {
    return (
      <div className="w-full max-w-[500px] mx-auto flex flex-col">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-muted font-semibold text-[36px] text-dark leading-tight">
            Invitation not available
          </h1>
          <p className="text-muted text-[12px] mt-1.5">
            We couldn&apos;t load this invitation right now.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            label="Retry"
            variant="filled"
            className="w-full h-12 rounded-lg text-[15px]"
            onClick={() => invitationQuery.refetch()}
          />

          <Link
            href="/start"
            className="text-center text-[14px] text-primary font-semibold hover:underline"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.status.toLowerCase() === "accepted") {
    return (
      <div className="w-full max-w-[500px] mx-auto flex flex-col">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-muted font-semibold text-[36px] text-dark leading-tight">
            Invitation already accepted
          </h1>
          <p className="text-muted text-[12px] mt-1.5">
            You can log in to continue to {invitation.eventTitle}.
          </p>
        </div>

        <div className="rounded-[20px] border border-[#EEEAF7] bg-white px-5 py-6 text-center">
          <p className="text-[14px] font-medium text-dark">
            {eventContact.firstName} {eventContact.lastName}
          </p>
          <p className="mt-1 text-[12px] text-muted">{eventContact.email}</p>
        </div>

        <Button
          href={loginHref}
          label="Go to login"
          variant="filled"
          className="w-full h-12 rounded-lg text-[15px] mt-5"
        />
      </div>
    );
  }

  if (invitedUserAlreadyHasAccount) {
    return (
      <div className="w-full max-w-[500px] mx-auto flex flex-col">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-muted font-semibold text-[36px] text-dark leading-tight">
            Account already exists
          </h1>
          <p className="text-muted text-[12px] mt-1.5">
            This invited user already has an account. Log in to continue to{" "}
            {invitation.eventTitle}.
          </p>
        </div>

        <div className="rounded-[20px] border border-[#EEEAF7] bg-white px-5 py-6 text-center">
          <p className="text-[14px] font-medium text-dark">
            {eventContact.firstName} {eventContact.lastName}
          </p>
          <p className="mt-1 text-[12px] text-muted">{eventContact.email}</p>
        </div>

        <Button
          href={loginHref}
          label="Go to login"
          variant="filled"
          className="w-full h-12 rounded-lg text-[15px] mt-5"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[500px] mx-auto flex flex-col">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="font-muted font-semibold text-[36px] text-dark leading-tight">
          Accept your invitation
        </h1>
        <p className="text-muted text-[12px] mt-1.5">
          You&apos;ve been invited to join {invitation.eventTitle}
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const response = await claimInvitationMutation.mutateAsync({
              firstName: values.firstName,
              lastName: values.lastName,
              password: values.password,
              confirmPassword: values.confirmPassword,
            });

            const redirectPath =
              response.data.redirectPath ||
              invitation.redirectPathAfterAccept ||
              "/dashboard";
            const nextLoginHref = `/start?email=${encodeURIComponent(
              values.email,
            )}&redirect=${encodeURIComponent(redirectPath)}`;

            toast.success(
              response.message ||
                "Invitation accepted successfully. Please log in to continue.",
            );
            router.replace(nextLoginHref);
          } catch (error) {
            if (error instanceof ApiRequestError && error.isNetworkError) {
              return;
            }

            const message =
              error instanceof ApiRequestError || error instanceof Error
                ? error.message
                : "Unable to accept this invitation right now.";

            toast.error(message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
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
              readOnly
              inputClassName="bg-[#F7F6FA] text-[#7D7D7D]"
            />

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

            <Button
              type="submit"
              label={
                claimInvitationMutation.isPending || isSubmitting
                  ? "Accepting..."
                  : "Accept Invitation"
              }
              variant="filled"
              className="w-full h-12 rounded-lg text-[15px] mt-1"
              disabled={claimInvitationMutation.isPending || isSubmitting}
            />

            <p className="text-center text-[#000000] text-[14px] text-muted">
              Already accepted?{" "}
              <Link
                href={loginHref}
                className="text-primary font-semibold hover:underline"
              >
                Log in
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
