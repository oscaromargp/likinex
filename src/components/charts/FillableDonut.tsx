'use client';
import { pie, arc, PieArcDatum } from "d3";
import { useMemo } from "react";

export function FillableDonut({ value, max = 100, label, color = "#7e4cfe" }: {
  value: number;
  max?: number;
  label?: string;
  color?: string;
}) {
  const radius = 240;
  const lightStrokeEffect = 6;

  const prepared = useMemo(() => {
    const data = [
      { name: "Filled", value: Math.max(0, Math.min(value, max)) },
      { name: "Empty", value: Math.max(0, max - value) },
    ];

    const pieLayout = pie<{ name: string; value: number }>()
      .value((d) => d.value)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      .sort((a, b) => a.value - b.value)
      .padAngle(0);

    const innerRadius = radius / 1.625;
    const arcGenerator = arc<PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcClip = arc<PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(innerRadius + lightStrokeEffect / 2)
      .outerRadius(radius)
      .cornerRadius(lightStrokeEffect + 2) || undefined;

    const arcs = pieLayout(data);
    return { arcGenerator, arcClip, arcs, data };
  }, [value, max, radius]);

  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="relative inline-block">
      <svg viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[7rem] mx-auto overflow-visible">
        <defs>
          {prepared.arcs.map((_, i) => (
            <clipPath key={`fc-id-${i}`} id={`fc-clip-${i}`}>
              <path d={prepared.arcClip(prepared.arcs[i]) || undefined} />
            </clipPath>
          ))}
        </defs>
        {prepared.arcs.map((d, i) => (
          <g key={i} clipPath={`url(#fc-clip-${i})`}>
            <path fill={i === 0 ? color : "#e0e0e0"} className={i === 1 ? "dark:fill-zinc-700" : ""}
              strokeWidth={lightStrokeEffect} stroke="#ffffff22"
              d={prepared.arcGenerator(d) || undefined} />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {label && <span className="text-[10px] leading-3 text-zinc-500">{label}</span>}
        <div className="text-sm font-bold">{pct}%</div>
      </div>
    </div>
  );
}
