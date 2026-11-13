export type RecordingStatus = "pending" | "watched" | "archived";

export interface Recording {
  id: string;
  user_id: string;
  course_code: string;
  title: string;
  meeting_id: string | null;
  passcode: string;
  raw_link: string;
  status: RecordingStatus;
  lecture_date: string;
  created_at: string;
}

export type NewRecording = Pick<
  Recording,
  "course_code" | "title" | "meeting_id" | "passcode" | "raw_link"
>;