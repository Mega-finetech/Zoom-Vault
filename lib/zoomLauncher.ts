export function isMeetingLink(link: string) {
  return /\/j\/\d+/.test(link);
}

export async function copyPasscode(passcode: string) {
  try {
    await navigator.clipboard.writeText(passcode);
    return true;
  } catch {
    return false;
  }
}

/** Copies the passcode, then opens the original link in a new tab. */
export async function openInBrowser(link: string, passcode: string) {
  await copyPasscode(passcode);
  window.open(link, "_blank", "noopener,noreferrer");
}

/** Meeting links only: hands off to the Zoom desktop/mobile app. */
export async function openInApp(link: string, meetingId: string, passcode: string) {
  if (!isMeetingLink(link) || !meetingId) return false;
  await copyPasscode(passcode);
  const url = new URL(link);
  const pwd = url.searchParams.get("pwd");
  const host = url.hostname;
  window.location.href = `zoomus://${host}/join?confno=${meetingId}${pwd ? `&pwd=${pwd}` : ""}`;
  return true;
}