"use client";

import { useState } from "react";
import { Wand2, X } from "lucide-react";
import { parseMessage } from "@/lib/parser";
import type { NewRecording } from "@/types/database";

interface ImporterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (rec: NewRecording) => Promise<void>;
}

const empty = { course_code: "", title: "", meeting_id: "", passcode: "", raw_link: "" };

export default function ImporterModal({ open, onClose, onSave }: ImporterModalProps) {
  const [raw, setRaw] = useState("");
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleParse() {
    const p = parseMessage(raw);
    setForm({
      course_code: p.courseCode,
      title: p.title,
      meeting_id: p.meetingId,
      passcode: p.passcode,
      raw_link: p.rawLink,
    });
  }

  function update(key: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setRaw("");
    setForm(empty);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!form.course_code.trim() || !form.title.trim() || !form.raw_link.trim() || !form.passcode.trim()) {
      setError("Course code, title, link and passcode are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        course_code: form.course_code.trim(),
        title: form.title.trim(),
        meeting_id: form.meeting_id.trim() || null,
        passcode: form.passcode.trim(),
        raw_link: form.raw_link.trim(),
      });
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-[#0A0F0D] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#3BCCA3]";

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-white/5 bg-[#141C18] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Add Class</h2>
          <button onClick={handleClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={5}
          placeholder="Paste the full class announcement here..."
          className={inputCls}
        />
        <button
          onClick={handleParse}
          disabled={!raw.trim()}
          className="flex items-center gap-1.5 rounded-lg border border-[#3BCCA3]/40 px-3 py-1.5 text-sm text-[#3BCCA3] disabled:opacity-40"
        >
          <Wand2 className="h-4 w-4" /> Auto-fill
        </button>

        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Course code" value={form.course_code} onChange={(e) => update("course_code", e.target.value)} />
          <input className={inputCls} placeholder="Passcode" value={form.passcode} onChange={(e) => update("passcode", e.target.value)} />
        </div>
        <input className={inputCls} placeholder="Lecture title" value={form.title} onChange={(e) => update("title", e.target.value)} />
        <input className={inputCls} placeholder="Zoom link" value={form.raw_link} onChange={(e) => update("raw_link", e.target.value)} />
        <input className={inputCls} placeholder="Meeting ID (optional)" value={form.meeting_id} onChange={(e) => update("meeting_id", e.target.value)} />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={handleClose} className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#3BCCA3] px-4 py-2 text-sm font-medium text-[#0A0F0D] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}