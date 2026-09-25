type Segment = { label: string; value: number; color: string };

const RADIUS = 54;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({
  segments,
  caption,
  ariaLabel = "Breakdown",
}: {
  segments: Segment[];
  caption: string;
  ariaLabel?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        role="img"
        aria-label={`${ariaLabel}: ${total} total.`}
        className="shrink-0"
      >
        <g transform="rotate(-90 70 70)">
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="#e4e2dc"
            strokeWidth={STROKE}
          />
          {total > 0 &&
            segments.map((s) => {
              const length = (s.value / total) * CIRCUMFERENCE;
              const arc = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return arc;
            })}
        </g>
        <text
          x="70"
          y="66"
          textAnchor="middle"
          style={{ fontFamily: "Fraunces, serif", fontSize: 26, fill: "#12151c" }}
        >
          {total}
        </text>
        <text
          x="70"
          y="84"
          textAnchor="middle"
          style={{ fontSize: 10, fill: "#6b6a64" }}
        >
          {caption}
        </text>
      </svg>

      <ul className="w-full space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
            <span className="tabular-nums text-ink">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
