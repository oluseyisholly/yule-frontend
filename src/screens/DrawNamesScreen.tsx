import PageHeader from "@/components/dashboard/PageHeader";
import DrawNamesStats from "@/screens/draw-names/DrawNamesStats";
import DrawNamesActivity from "@/screens/draw-names/DrawNamesActivity";

export default function DrawNamesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Draw Names"
        description="Organize secret gift exchanges"
        actionLabel="Draw Name"
        actionHref="/dashboard/draw-names/new"
      />

      <DrawNamesStats />

      <DrawNamesActivity />
    </div>
  );
}
