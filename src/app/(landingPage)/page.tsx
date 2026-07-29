import { Suspense } from "react";
import HomeScreen from "@/screens/HomeScreen";
import LandingPageEntry from "@/screens/LandingPageEntry";
import { Spinner } from "@/components/ui/spinner";

function LandingSsoFallback() {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-[360px] flex-col items-center gap-4 rounded-[28px] bg-white px-8 py-8 text-center">
        <Spinner className="size-10 text-[#3300C9]" />
        <div className="space-y-1">
          <p className="text-[18px] font-semibold text-[#1E1E1E]">
            Signing you in
          </p>
          <p className="text-sm text-[#6E6A78]">
            Please wait while we finish setting up your session.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const codeParam = resolvedSearchParams?.code;
  const hasPendingSsoCode = Array.isArray(codeParam)
    ? codeParam.some((value) => value?.trim())
    : Boolean(codeParam?.trim());

  return (
    <Suspense fallback={hasPendingSsoCode ? <LandingSsoFallback /> : <HomeScreen />}>
      <LandingPageEntry initialHasPendingSsoCode={hasPendingSsoCode} />
    </Suspense>
  );
}
