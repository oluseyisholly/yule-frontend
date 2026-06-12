import type { Metadata } from "next";
import InviteScreen from "@/screens/InviteScreen";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const metadata: Metadata = {
  title: "Accept Invitation",
  description: "Accept your draw name invitation",
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  return <InviteScreen token={token} />;
}
