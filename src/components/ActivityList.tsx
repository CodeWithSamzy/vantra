function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

type Entry = {
  id: string;
  action: string;
  createdAt: string;
  user: { name: string | null; email: string };
};

export default function ActivityList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="p-6 text-sm text-muted">No activity yet.</p>;
  }

  return (
    <ul>
      {entries.map((e) => (
        <li
          key={e.id}
          className="flex items-start justify-between gap-4 border-b border-line p-4 text-sm last:border-0"
        >
          <p className="text-ink">
            <span className="font-medium">{e.user.name ?? e.user.email}</span>{" "}
            <span className="text-muted">{e.action}</span>
          </p>
          <span className="shrink-0 text-xs text-muted">
            {timeAgo(new Date(e.createdAt))}
          </span>
        </li>
      ))}
    </ul>
  );
}