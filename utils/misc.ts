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
  if (!rtc) return "Nill";

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [day, month, yearTime] = rtc.split("-");
  const [year, time] = yearTime.split(" ");

  const date = new Date(`${year}-${month}-${day}T${time}`);

  return date.toLocaleDateString("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
  });
};

export const formatRtcTime = (rtc: string | undefined) => {
  if (!rtc) return "Nill";

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [day, month, yearTime] = rtc.split("-");
  const [year, time] = yearTime.split(" ");

  // Remove 'Z' from the date string creation
  const date = new Date(`${year}-${month}-${day}T${time}`);

  return date.toLocaleTimeString("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const getDeviceStatus = (statuses: any, deviceId: string) => {
  const deviceStatus = statuses.find((status: any) => status.id === deviceId);
  return deviceStatus ? deviceStatus.status : false;
};

export const formatUnixTimestamp = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp * 1000);

  date.setHours(date.getHours() - 1);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};
