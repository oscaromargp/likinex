'use client';
import { scaleTime, scaleLinear, max, area as d3area, curveMonotoneX, line as d3line } from "d3";
import { CSSProperties, useMemo } from "react";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "./ClientTooltip";

export type AreaChartData = {
  date: Date;
  value: number;
};

export function CashFlowAreaChart({ data, color = "text-purple-400", fillColor = "text-purple-200" }: {
  data: AreaChartData[];
  color?: string;
  fillColor?: string;
}) {
  const props = useMemo(() => {
    if (data.length < 2) return null;
    const xScale = scaleTime()
      .domain([data[0].date, data[data.length - 1].date])
      .range([0, 100]);

    const yScale = scaleLinear()
      .domain([Math.min(0, ...data.map(d => d.value)), max(data.map(d => d.value)) ?? 0])
      .range([100, 0]);

    const line = d3line<(typeof data)[number]>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(curveMonotoneX);

    const area = d3area<(typeof data)[number]>()
      .x((d) => xScale(d.date))
      .y0(yScale(Math.min(0, ...data.map(d => d.value))))
      .y1((d) => yScale(d.value))
      .curve(curveMonotoneX);

    return { xScale, yScale, linePath: line(data), areaPath: area(data) };
  }, [data]);

  if (!props || data.length < 2) {
    return <div className="h-72 flex items-center justify-center text-slate-500 text-sm">Datos insuficientes</div>;
  }

  return (
    <div className="relative h-72 w-full" style={{ "--marginTop": "0px", "--marginRight": "10px", "--marginBottom": "15px", "--marginLeft": "0px" } as CSSProperties}>
      <div className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={props.areaPath ?? undefined} className={fillColor} fill="currentColor" opacity={0.3} />
          <path d={props.linePath ?? undefined} fill="none" className={color} stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          {data.map((d, index) => (
            <ClientTooltip key={index}>
              <TooltipTrigger>
                <g className="group/tooltip">
                  <line x1={props.xScale(d.date)} y1={0} x2={props.xScale(d.date)} y2={100}
                    stroke="currentColor" strokeWidth={1}
                    className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity"
                    vectorEffect="non-scaling-stroke" style={{ pointerEvents: "none" }} />
                  <rect x={(index > 0 ? (props.xScale(data[index - 1].date) + props.xScale(d.date)) / 2 : props.xScale(d.date))} y={0}
                    width={(index > 0 && index < data.length - 1 ? (props.xScale(data[index + 1].date) - props.xScale(data[index - 1].date)) / 2 : 0) || (100 / data.length)}
                    height={100} fill="transparent" className="cursor-pointer" />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <div>{d.date.toLocaleDateString("es-MX", { month: "short", day: "2-digit" })}</div>
                <div className="text-gray-500 text-sm">${d.value.toLocaleString("es-MX")}</div>
              </TooltipContent>
            </ClientTooltip>
          ))}
        </svg>
        <div className="translate-y-1">
          {data.filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)).map((day, i) => {
            const isFirst = i === 0 && day.date.getTime() === data[0].date.getTime();
            const isLast = day.date.getTime() === data[data.length - 1].date.getTime();
            return (
              <div key={i} className="overflow-visible text-zinc-500">
                <div style={{ left: `${props.xScale(day.date)}%`, top: "100%", transform: `translateX(${isFirst ? "0%" : isLast ? "-100%" : "-50%"})` }}
                  className="text-xs absolute whitespace-nowrap">
                  {day.date.toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute right-0 top-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] translate-y-[var(--marginTop)] w-[var(--marginRight)] overflow-visible">
        {props.yScale.ticks(5).map(props.yScale.tickFormat(5, "d")).map((value, i) => (
          <div key={i} style={{ top: `${props.yScale(+value)}%`, left: "0%" }}
            className="absolute text-xs -translate-y-1/2 text-gray-400 w-full text-right pl-1">
            ${(+value).toLocaleString("es-MX")}
          </div>
        ))}
      </div>
    </div>
  );
}
