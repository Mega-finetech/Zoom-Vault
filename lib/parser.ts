export interface ParsedClass {
  courseCode: string;
  title: string;
  rawLink: string;
  meetingId: string;
  passcode: string;
}

const LINK_RE = /https?:\/\/[\w.-]*zoom\.(?:us|com)\/[^\s<>"')]+/i;
const PASSCODE_RE = /(?:pass\s*code|password|pwd)\s*[:=\-]\s*(\S+)/i;
const MEETING_ID_RE = /meeting\s*id\s*[:=\-]\s*([\d ]{9,15})/i;
const COURSE_RE = /\b([A-Za-z]{2,4})[\s-]?(\d{3})\b/;
const TITLE_RE = /(?:topic|title|subject|lecture)\s*[:=\-]\s*(.+)/i;

export function parseMessage(raw: string): ParsedClass {
  const text = raw.replace(/\r/g, "");

  const rawLink = (text.match(LINK_RE)?.[0] ?? "").replace(/[.,;]+$/, "");

  let passcode = text.match(PASSCODE_RE)?.[1] ?? "";
  if (!passcode && rawLink) {
    try {
      passcode = new URL(rawLink).searchParams.get("pwd") ?? "";
    } catch {}
  }

  let meetingId = (text.match(MEETING_ID_RE)?.[1] ?? "").replace(/\s/g, "");
  if (!meetingId) meetingId = rawLink.match(/\/j\/(\d{9,12})/)?.[1] ?? "";

  const course = text.match(COURSE_RE);
  const courseCode = course ? `${course[1].toUpperCase()} ${course[2]}` : "";

  let title = text.match(TITLE_RE)?.[1]?.trim() ?? "";
  if (!title) {
    title =
      text
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l && !LINK_RE.test(l) && !PASSCODE_RE.test(l) && !MEETING_ID_RE.test(l)) ?? "";
  }
  if (courseCode) {
    title = title.replace(COURSE_RE, "").replace(/^[\s:\-–]+/, "").trim() || title;
  }

  return { courseCode, title, rawLink, meetingId, passcode };
}