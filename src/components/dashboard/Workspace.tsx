import PageHeader from "@/components/dashboard/PageHeader";
import {
  type DashboardTab,
} from "@/components/dashboard/navigation";

const pageHeaderDetails: Record<
  DashboardTab,
  {
    title: string;
    description: string;
    actionLabel?: string;
  }
> = {
  dashboard: {
    title: "Dashboard",
    description: "See the latest activity across your celebrations and plans.",
  },
  "draw-names": {
    title: "Draw Names",
    description: "Organize secret gift exchanges",
    actionLabel: "Draw Name",
  },
  "wish-list": {
    title: "Create Wish List",
    description: "Collect ideas for the gifts you want and share them easily.",
  },
  gifts: {
    title: "Gifts",
    description: "Track gift ideas, saved picks, and thoughtful surprises.",
  },
  hangouts: {
    title: "Hangouts",
    description: "Plan moments worth sharing with your people.",
  },
  schedule: {
    title: "Schedule Event & Message",
    description: "Set up reminders, messages, and celebration timelines.",
  },
  history: {
    title: "My History",
    description: "Look back on draws, gifts, and past celebration activity.",
  },
  profile: {
    title: "My Profile",
    description: "Manage your personal details and celebration preferences.",
  },
};

const tabDescriptions: Record<DashboardTab, string> = {
  dashboard:
    "Your main overview lives here. The sidebar is now wired into the dashboard shell, so we can keep layering in cards, charts, and activity panels without reworking navigation.",
  "draw-names":
    "This section is ready for your draw flow. Once you send the final icon set or screen content, we can turn this into the participant and matching experience.",
  "wish-list":
    "This panel can grow into the wish list builder, saved items, and wish sharing states. The navigation is already set up so we can add the form and cards next.",
  gifts:
    "Use this area for gift recommendations, saved gift ideas, or purchase tracking. The sidebar item is already linked and styled to support the full page later.",
  hangouts:
    "This screen is reserved for group plans, venue ideas, or meetup coordination. When you are ready, we can shape the content around your hangout flow.",
  schedule:
    "This is the slot for event scheduling and message automation. It is a good place for calendar actions, reminders, and message templates.",
  history:
    "Past events, sent wishes, and previous draws can live here. The structure is ready for filters, logs, and recap cards.",
  profile:
    "Profile settings, preferences, and celebration details can sit here. Once you share the fields you want, we can build out the account screen.",
};

type DashboardWorkspaceProps = {
  tab: DashboardTab;
};

export default function DashboardWorkspace({
  tab,
}: DashboardWorkspaceProps) {
  const headerDetails = pageHeaderDetails[tab];

  return (
    <div className="space-y-6">
      <PageHeader
        title={headerDetails.title}
        description={headerDetails.description}
        actionLabel={headerDetails.actionLabel}
      />

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(51,0,201,0.06)] backdrop-blur sm:p-8 lg:p-10">
        <div className="rounded-3xl bg-[#f6f2ff] p-5">
          <p className="text-sm font-semibold text-primary">
            {headerDetails.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#615f76]">
            {tabDescriptions[tab]}
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-[#faf8ff] p-5">
            <p className="text-sm font-semibold text-primary">Sidebar ready</p>
            <p className="mt-2 text-sm leading-6 text-[#615f76]">
              The navigation is reusable, route-aware, and ready for your final
              icon set.
            </p>
          </div>

          <div className="rounded-3xl bg-[#f8f6ff] p-5">
            <p className="text-sm font-semibold text-primary">General header</p>
            <p className="mt-2 text-sm leading-6 text-[#615f76]">
              This new page-level header is reusable and can drive any dashboard
              screen with its own title, subtitle, and action button.
            </p>
          </div>

          <div className="rounded-3xl bg-[#fff8f2] p-5">
            <p className="text-sm font-semibold text-[#ff8a3d]">
              Content placeholder
            </p>
            <p className="mt-2 text-sm leading-6 text-[#615f76]">
              This main panel stays flexible while we shape each dashboard page
              around your next screens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
