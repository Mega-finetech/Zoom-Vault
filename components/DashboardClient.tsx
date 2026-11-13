"use client";

import { useMemo, useState } from "react";
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

export default function DashboardClient({ initial }: { initial: Recording[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [recordings, setRecordings] = useState<Recording[]>(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <Navbar search={search} onSearchChange={setSearch} onAddClick={() => setModalOpen(true)} />

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <StatsBar recordings={recordings} />

        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm",
                filter === f.key
                  ? "border-[#3BCCA3] bg-[#3BCCA3]/10 text-[#3BCCA3]"
                  : "border-white/10 text-white/60 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {visible.length === 0 ? (
          <p className="py-16 text-center text-white/40">
            {recordings.length === 0
              ? 'No classes yet. Click "Add Class" and paste an announcement.'
              : "Nothing matches your search or filter."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((r) => (
              <RecordingCard
                key={r.id}
                recording={r}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <ImporterModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />
    </>
  );
}