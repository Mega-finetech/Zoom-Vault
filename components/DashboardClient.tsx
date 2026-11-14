"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { NewRecording, Recording, RecordingStatus } from "@/types/database";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import RecordingCard from "@/components/RecordingCard";
import ImporterModal from "@/components/ImporterModal";
import { cn } from "@/lib/utils";

type Filter = "all" | RecordingStatus;

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "watched", label: "Watched" },
  { key: "archived", label: "Archived" },
];

export default function DashboardClient({
  initial,
  name,
}: {
  initial: Recording[];
  name: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [recordings, setRecordings] = useState<Recording[]>(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [grouped, setGrouped] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  async function handleAdd(rec: NewRecording) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You are signed out. Please log in again.");

    const { data, error } = await supabase
      .from("recordings")
      .insert({ ...rec, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    setRecordings((prev) => [data as Recording, ...prev]);
  }

  async function handleStatusChange(id: string, status: RecordingStatus) {
    setError(null);
    const { error } = await supabase.from("recordings").update({ status }).eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this class permanently?")) return;
    setError(null);
    const { error } = await supabase.from("recordings").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  }

  const visible = recordings.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return r.course_code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
  });

  const groups = useMemo(() => {
    const map = new Map<string, Recording[]>();
    visible.forEach((r) => {
      const key = r.course_code || "Other";
      map.set(key, [...(map.get(key) ?? []), r]);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

  const pending = recordings.filter((r) => r.status === "pending").length;

  const renderCard = (r: Recording) => (
    <RecordingCard
      key={r.id}
      recording={r}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <Navbar search={search} onSearchChange={setSearch} onAddClick={() => setModalOpen(true)} />

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <div className="animate-fade-up">
          <h2 className="text-2xl font-semibold text-white">
            {greeting}, <span className="text-[#3BCCA3]">{name}</span>
          </h2>
          <p className="text-sm text-white/50">
            {pending > 0
              ? `You have ${pending} recording${pending === 1 ? "" : "s"} left to watch.`
              : "You're all caught up."}
          </p>
        </div>

        <StatsBar recordings={recordings} />

        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-2 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition",
                  filter === f.key
                    ? "border-[#3BCCA3] bg-[#3BCCA3]/10 text-[#3BCCA3]"
                    : "border-white/10 text-white/60 hover:text-white"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setGrouped((g) => !g)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
              grouped
                ? "border-[#3BCCA3] bg-[#3BCCA3]/10 text-[#3BCCA3]"
                : "border-white/10 text-white/60 hover:text-white"
            )}
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Group by course</span>
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {visible.length === 0 ? (
          <div className="animate-fade-up rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <p className="text-white/60">
              {recordings.length === 0 ? "Your vault is empty." : "Nothing matches your search or filter."}
            </p>
            {recordings.length === 0 && (
              <p className="mt-1 text-sm text-white/40">
                Click &quot;Add Class&quot; and paste an announcement to get started.
              </p>
            )}
          </div>
        ) : grouped ? (
          <div className="space-y-6">
            {groups.map(([course, items]) => (
              <section key={course} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-wide text-[#3BCCA3]">{course}</h3>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">
                    {items.length}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">{items.map(renderCard)}</div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">{visible.map(renderCard)}</div>
        )}
      </main>

      <ImporterModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />
    </>
  );
}