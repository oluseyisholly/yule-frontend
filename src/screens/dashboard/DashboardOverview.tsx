import { ChevronDown } from "lucide-react";

type MonthDatum = {
  month: string;
  gifts: number;
  hangout: number;
};

const data: MonthDatum[] = [
  { month: "Jan", gifts: 38, hangout: 60 },
  { month: "Feb", gifts: 12, hangout: 14 },
  { month: "Mar", gifts: 58, hangout: 62 },
  { month: "Apr", gifts: 10, hangout: 10 },
  { month: "May", gifts: 30, hangout: 46 },
  { month: "Jun", gifts: 88, hangout: 66 },
  { month: "Jul", gifts: 18, hangout: 22 },
  { month: "Aug", gifts: 92, hangout: 40 },
  { month: "Sept", gifts: 46, hangout: 16 },
  { month: "Oct", gifts: 80, hangout: 88 },
  { month: "Nov", gifts: 80, hangout: 88 },
  { month: "Dec", gifts: 80, hangout: 88 },
];

const yTicks = [100, 80, 60, 40, 20, 0];

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 280;
const PADDING_LEFT = 48;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const GROUP_WIDTH = PLOT_WIDTH / data.length;
const BAR_WIDTH = 14;
const BAR_GAP = 4;

function barHeight(value: number) {
  return (value / 100) * PLOT_HEIGHT;
}

export default function DashboardOverview() {
  return (
    <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1e1e1e]">Overview</h2>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#3300C9]/40 bg-white px-3.5 py-1.5 text-xs font-medium text-[#3300C9] transition-colors hover:bg-[#F6F2FF]"
        >
          Date Range
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="mt-6">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-[260px] w-full sm:h-[300px]"
          role="img"
          aria-label="Gifts and Hangouts overview by month"
          preserveAspectRatio="none"
        >
          {yTicks.map((tick) => {
            const y = PADDING_TOP + PLOT_HEIGHT - (tick / 100) * PLOT_HEIGHT;
            return (
              <g key={tick}>
                <line
                  x1={PADDING_LEFT}
                  x2={CHART_WIDTH - PADDING_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="#EEEAF3"
                  strokeWidth={1}
                  strokeDasharray="2 4"
                />
                <text
                  x={PADDING_LEFT - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="#9A97A5"
                >
                  ${tick}k
                </text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const groupX = PADDING_LEFT + i * GROUP_WIDTH + GROUP_WIDTH / 2;
            const giftsX = groupX - BAR_WIDTH - BAR_GAP / 2;
            const hangoutX = groupX + BAR_GAP / 2;

            const giftsH = barHeight(d.gifts);
            const hangoutH = barHeight(d.hangout);

            const giftsY = PADDING_TOP + PLOT_HEIGHT - giftsH;
            const hangoutY = PADDING_TOP + PLOT_HEIGHT - hangoutH;

            return (
              <g key={d.month}>
                <rect
                  x={giftsX}
                  y={giftsY}
                  width={BAR_WIDTH}
                  height={giftsH}
                  rx={3}
                  fill="#7A9BFF"
                />
                <rect
                  x={hangoutX}
                  y={hangoutY}
                  width={BAR_WIDTH}
                  height={hangoutH}
                  rx={3}
                  fill="#4CD080"
                />
                <text
                  x={groupX}
                  y={CHART_HEIGHT - 10}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#7D7D7D"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-[#7d7d7d]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#7A9BFF]" />
            Gifts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#4CD080]" />
            Hangout
          </span>
        </div>
      </div>
    </section>
  );
}
