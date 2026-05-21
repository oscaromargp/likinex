'use client';
import { pie, arc, PieArcDatum } from "d3";
import { useMemo } from "react";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "./ClientTooltip";

type Item = { name: string; value: number; color: string };

export function DonutChart({ data, centerLabel, centerValue, size = "sm" }: {
  data: Item[];
  centerLabel?: string;
  centerValue?: string;
  size?: "sm" | "md";
}) {
  const radius = size === "sm" ? 280 : 420;
  const gap = 0.01;
  const lightStrokeEffect = 8;

  const prepared = useMemo(() => {
    const pieLayout = pie<Item>()
      .value((d) => d.value)
      .padAngle(gap);

    const innerRadius = radius / 1.625;
    const arcGenerator = arc<PieArcDatum<Item>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(lightStrokeEffect + 2);

    const arcClip = arc<PieArcDatum<Item>>()
      .innerRadius(innerRadius + lightStrokeEffect / 2)
      .outerRadius(radius)
      .cornerRadius(lightStrokeEffect + 2) || undefined;

    const arcs = pieLayout(data);
    return { arcGenerator, arcClip, arcs };
  }, [data, radius]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Sin datos</div>;
  }

  return (
    <div className="relative">
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {centerLabel && <p className="text-xs text-zinc-500">{centerLabel}</p>}
            {centerValue && <p className="text-lg font-bold transition-colors">{centerValue}</p>}
          </div>
        </div>
      )}
      <svg viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className={`${size === "sm" ? "max-w-[10rem]" : "max-w-[16rem]"} mx-auto overflow-visible`}>
        <defs>
          {prepared.arcs.map((_, i) => (
            <clipPath key={`clip-${i}`} id={`donut-clip-${i}`}>
              <path d={prepared.arcClip(prepared.arcs[i]) || undefined} />
            </clipPath>
          ))}
        </defs>
        {prepared.arcs.map((d, i) => (
          <ClientTooltip key={i}>
            <TooltipTrigger>
              <g clipPath={`url(#donut-clip-${i})`}>
                <path fill={d.data.color} stroke="#ffffff33" strokeWidth={lightStrokeEffect}
                  d={prepared.arcGenerator(d) || undefined} />
              </g>
            </TooltipTrigger>
            <TooltipContent>
              <div>{d.data.name}</div>
              <div className="text-gray-500 text-sm">{d.data.value.toLocaleString("es-MX")}</div>
            </TooltipContent>
          </ClientTooltip>
        ))}
      </svg>
    </div>
  );
}
