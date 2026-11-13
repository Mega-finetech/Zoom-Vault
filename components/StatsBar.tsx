import type { Recording } from "@/types/database";

export default function StatsBar({ recordings }: { recordings: Recording[] }) {
  const total = recordings.length;
  const unwatched = recordings.filter((r) => r.status === "pending").length;
  const watched = recordings.filter((r) => r.status === "watched").length;

  const stats = [
    { label: "Total Classes", value: total, color: "text-white" },
    { label: "Unwatched", value: unwatched, color: "text-amber-400" },
    { label: "Watched", value: watched, color: "text-[#3BCCA3]" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-white/5 bg-[#141C18] px-4 py-3"
        >
          <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-white/50">{s.label}</p>
        </div>
      ))}
    </div>
  );
}