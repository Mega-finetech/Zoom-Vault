"use client";

import { useState } from "react";
import { Archive, Check, Copy, ExternalLink, Eye, Smartphone, Trash2 } from "lucide-react";
import type { Recording, RecordingStatus } from "@/types/database";
import { copyPasscode, isMeetingLink, openInApp, openInBrowser } from "@/lib/zoomLauncher";
import { cn } from "@/lib/utils";

interface RecordingCardProps {
  recording: Recording;
  onStatusChange: (id: string, status: RecordingStatus) => void;
  onDelete: (id: string) => void;
}

const statusStyles: Record<RecordingStatus, string> = {
  pending: "bg-amber-400/10 text-amber-400",
  watched: "bg-[#3BCCA3]/10 text-[#3BCCA3]",
  archived: "bg-white/10 text-white/50",
};

export default function RecordingCard({ recording, onStatusChange, onDelete }: RecordingCardProps) {
  const [copied, setCopied] = useState(false);
  const canOpenInApp = isMeetingLink(recording.raw_link) && !!recording.meeting_id;

  async function handleCopy() {
    const ok = await copyPasscode(recording.passcode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-[#141C18] p-4",
        recording.status === "archived" && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold tracking-wide text-[#3BCCA3]">
            {recording.course_code}
          </span>
          <h3 className="truncate text-base font-medium text-white">{recording.title}</h3>
          <p className="text-xs text-white/40">{recording.lecture_date}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            statusStyles[recording.status]
          )}
        >
          {recording.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => openInBrowser(recording.raw_link, recording.passcode)}
          className="flex items-center gap-1.5 rounded-lg bg-[#3BCCA3] px-3 py-1.5 text-sm font-medium text-[#0A0F0D] hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" /> Play
        </button>

        {canOpenInApp && (
          <button
            onClick={() => openInApp(recording.raw_link, recording.meeting_id!, recording.passcode)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:text-white"
          >
            <Smartphone className="h-4 w-4" /> App
          </button>
        )}

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:text-white"
        >
          {copied ? <Check className="h-4 w-4 text-[#3BCCA3]" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Passcode"}
        </button>

        <div className="ml-auto flex gap-2">
          {recording.status !== "watched" && (
            <button
              onClick={() => onStatusChange(recording.id, "watched")}
              title="Mark watched"
              className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-[#3BCCA3]"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {recording.status !== "archived" && (
            <button
              onClick={() => onStatusChange(recording.id, "archived")}
              title="Archive"
              className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-white"
            >
              <Archive className="h-4 w-4" />
            </button>
          )}
          {recording.status !== "pending" && (
            <button
              onClick={() => onStatusChange(recording.id, "pending")}
              title="Mark unwatched"
              className="rounded-lg border border-white/10 px-2 text-xs text-white/60 hover:text-amber-400"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => onDelete(recording.id)}
            title="Delete"
            className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}