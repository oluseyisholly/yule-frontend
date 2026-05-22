import PageHeader from "@/components/dashboard/PageHeader";
import DashboardActions from "@/screens/dashboard/DashboardActions";
import DashboardStats from "@/screens/dashboard/DashboardStats";
import DashboardOverview from "@/screens/dashboard/DashboardOverview";
import DashboardRecentActivity from "@/screens/dashboard/DashboardRecentActivity";
import DashboardUpcomingEvents from "@/screens/dashboard/DashboardUpcomingEvents";

export default function DashboardScreen() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="See your overview"
        actions={<DashboardActions />}
      />

      <DashboardStats />

      <DashboardOverview />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardRecentActivity />
        </div>
        <DashboardUpcomingEvents />
      </div>
    </div>
  );
}
