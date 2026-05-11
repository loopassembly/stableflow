"use client";

import { demoStablecoin, settlementSeries } from "@/lib/demo-data";

function pointsFor(key: "dodo" | "solana") {
  const values = settlementSeries.map((item) => item[key]);
  const max = Math.max(...settlementSeries.flatMap((item) => [item.dodo, item.solana]));
  const width = 760;
  const height = 220;
  const step = width / (values.length - 1);

  return values.map((value, index) => {
    const x = index * step;
    const y = height - (value / max) * (height - 22);
    return { x, y, label: settlementSeries[index].day, value };
  });
}

function pathFrom(points: ReturnType<typeof pointsFor>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function areaFrom(points: ReturnType<typeof pointsFor>) {
  const line = pathFrom(points);
  const last = points[points.length - 1];
  const first = points[0];

  return `${line} L ${last.x} 220 L ${first.x} 220 Z`;
}

export function SettlementChart() {
  const dodoPoints = pointsFor("dodo");
  const solanaPoints = pointsFor("solana");

  return (
    <div className="h-full min-h-0 min-w-0">
      <svg
        aria-label="Dodo revenue and Solana settlement chart"
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        viewBox="0 0 760 250"
      >
        {[0, 55, 110, 165, 220].map((y) => (
          <line
            key={y}
            stroke="rgba(148,163,184,0.18)"
            strokeDasharray="6 6"
            strokeWidth="1"
            x1="0"
            x2="760"
            y1={y}
            y2={y}
          />
        ))}
        <path d={areaFrom(dodoPoints)} fill="#4cf5c4" opacity="0.15" />
        <path d={areaFrom(solanaPoints)} fill="#6a7cff" opacity="0.14" />
        <path d={pathFrom(dodoPoints)} fill="none" stroke="#4cf5c4" strokeWidth="4" />
        <path
          d={pathFrom(solanaPoints)}
          fill="none"
          stroke="#6a7cff"
          strokeWidth="4"
        />
        {dodoPoints.map((point) => (
          <circle cx={point.x} cy={point.y} fill="#4cf5c4" key={point.label} r="5" />
        ))}
        {solanaPoints.map((point) => (
          <circle
            cx={point.x}
            cy={point.y}
            fill="#6a7cff"
            key={`solana-${point.label}`}
            r="5"
          />
        ))}
        {dodoPoints.map((point) => (
          <text
            fill="rgba(176,189,211,0.76)"
            fontSize="14"
            key={`label-${point.label}`}
            textAnchor="middle"
            x={point.x}
            y="246"
          >
            {point.label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4cf5c4]" />
          Dodo revenue
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#6a7cff]" />
          Solana {demoStablecoin.symbol}
        </span>
      </div>
    </div>
  );
}
