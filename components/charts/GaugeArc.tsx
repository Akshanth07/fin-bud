function pointOnArc(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = pointOnArc(cx, cy, r, startDeg);
  const end = pointOnArc(cx, cy, r, endDeg);
  const largeArc = startDeg - endDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function GaugeArc({
  percent, centerLabel, minLabel = "$0", maxLabel,
}: { percent: number; centerLabel: string; minLabel?: string; maxLabel: string }) {
  const cx = 100;
  const cy = 95;
  const r = 78;
  const clamped = Math.min(100, Math.max(0, percent));
  const endAngle = 180 - (clamped / 100) * 180;

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
        <path d={arcPath(cx, cy, r, 180, 0)} fill="none" stroke="#E7E9EC" strokeWidth={14} strokeLinecap="round" />
        <path d={arcPath(cx, cy, r, 180, endAngle)} fill="none" stroke="#14A38B" strokeWidth={14} strokeLinecap="round" />
      </svg>
      <div className="absolute top-[52px] flex flex-col items-center">
        <span className="text-xl font-bold text-[#14181C]">{centerLabel}</span>
      </div>
      <div className="mt-1 flex w-full max-w-[220px] justify-between text-xs text-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
