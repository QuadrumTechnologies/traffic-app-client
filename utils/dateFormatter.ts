export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Get day of the week
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[date.getUTCDay()]; // Use getUTCDay for UTC day

  // Get day, month, and year
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();

  // Get hours and minutes (in UTC)
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const sec = String(date.getUTCSeconds()).padStart(2, "0");

  return `${dayOfWeek} - ${month}/${day}/${year} - ${hours}:${minutes}:${sec}`;
}
