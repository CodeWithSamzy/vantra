import Link from "next/link";

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  compact = false,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "px-2 py-6 text-center" : "px-6 py-12 text-center"}>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
