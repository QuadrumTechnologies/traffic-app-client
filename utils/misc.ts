import { DeviceStatus } from "@/app/dashboard/devices/page";

interface PhaseData {
  duration: number;
  blinkTimeRedToGreen: number;
  blinkTimeGreenToRed: number;
  amberDurationRedToGreen: number;
  amberDurationGreenToRed: number;
  signalString: string | undefined;
}
export function generatePhaseString(phaseData: PhaseData): string {
  const {
    duration,
    blinkTimeRedToGreen,
    blinkTimeGreenToRed,
    amberDurationRedToGreen,
    amberDurationGreenToRed,
    signalString,
  } = phaseData;

  const result = `*${duration}${signalString}${blinkTimeRedToGreen}${blinkTimeGreenToRed}${amberDurationRedToGreen}${amberDurationGreenToRed}*`;

  return result;
}

export const formatRtcDate = (rtc: string | undefined) => {
  if (!rtc || rtc === "Nill") return "Nill";

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [day, month, yearTime] = rtc.split("-");
  const [year, time] = yearTime.split(" ");

  if (!day || !month || !year || !time) return "Nill";

  const date = new Date(`${year}-${month}-${day}T${time}`);

  if (isNaN(date.getTime())) return "Nill";

  return date.toLocaleDateString("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
  });
};

export const formatRtcTime = (rtc: string | undefined): string => {
  if (!rtc || rtc === "Nill") return "Nill";

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [day, month, yearTime] = rtc.split("-");
  const [year, time] = yearTime.split(" ");

  // Handle invalid date components
  if (!day || !month || !year || !time) return "Nill";

  // Create date without 'Z' explicitly
  const date = new Date(`${year}-${month}-${day}T${time}`);

  if (isNaN(date.getTime())) return "Nill";

  return date.toLocaleTimeString("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const getDeviceStatus = (
  statuses: DeviceStatus[],
  deviceId: string
): DeviceStatus | null => {
  return statuses.find((s) => s.id === deviceId) || null;
};

export const formatUnixTimestamp = (
  unixTimestamp: number | undefined
): string => {
  if (!unixTimestamp || isNaN(unixTimestamp)) return "Nill";

  const date = new Date(unixTimestamp * 1000);

  // Adjust for time zone or offset if needed (e.g., -1 hour)
  date.setHours(date.getHours() - 1);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};
