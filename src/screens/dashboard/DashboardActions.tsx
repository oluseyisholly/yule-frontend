import Button from "@/components/Button";
import SettingsIcon from "@/assets/icons/settings.svg";
import DownloadIcon from "@/assets/icons/download.svg";
import Image from "next/image";
import AddBtn from "@/assets/icons/addBtn.svg";
import WhiteAddBtn from "@/assets/icons/whiteAddBtn.svg";

export default function DashboardActions() {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Button
        href="/start"
        variant="filled"
        className="h-[44px] pl-2 pr-5 text-sm font-medium"
      >
        <span className="inline-flex items-center gap-2.5">
          <Image src={WhiteAddBtn} alt="" aria-hidden className="w-6 h-6" />
          <span>Start Celebrating</span>
        </span>
      </Button>

      <Button
        href="/dashboard/schedule"
        variant="outlined"
        className="h-[44px] pl-2 pr-5 text-sm font-medium bg-white border-[#3300C9] text-[#3300C9] hover:bg-[#F6F2FF]"
      >
        <span className="inline-flex items-center gap-2.5">
          <Image src={AddBtn} alt="" aria-hidden className="w-6 h-6" />
          <span>Schedule Event</span>
        </span>
      </Button>

      <Image src={DownloadIcon} alt="DownloadIcon" className="w-8.5 h-8.5" />

      <Image src={SettingsIcon} alt="SettingsIcon" className="w-8.5 h-8.5" />
    </div>
  );
}
