type Point = { label: string; value: number };

export default function BarChart({
  data,
  height = 160,
  labelEvery = 5,
  color = "#d98e30",
  ariaLabel = "Activity over time",
}: {
  data: Point[];
  height?: number;
  labelEvery?: number;
  color?: string;
  ariaLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      role="img"
      aria-label={`${ariaLabel}: ${total} events across ${data.length} days.`}
    >
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d) => (
          <div
            key={d.label}
            title={`${d.label}: ${d.value}`}
            className="flex-1 rounded-t-[3px]"
            style={{
              height: `${(d.value / max) * 100}%`,
              minHeight: 3,
              backgroundColor: d.value === 0 ? "#e4e2dc" : color,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        {data
          .filter((_, i) => i % labelEvery === 0)
          .map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
      </div>
    </div>
  );
}
