export type UPTimeData = { days: number; hours: number; minutes: number; seconds: number; milliseconds: number; };

function pad(value: number, length = 2): string {
  return String(Math.max(0, Math.floor(value))).padStart(length, '0');
}

export function parseTimeData(time: number): UPTimeData {
  const value = Math.max(0, time);
  const days = Math.floor(value / 86_400_000);
  const hours = Math.floor((value % 86_400_000) / 3_600_000);
  const minutes = Math.floor((value % 3_600_000) / 60_000);
  const seconds = Math.floor((value % 60_000) / 1_000);
  return { days, hours, minutes, seconds, milliseconds: Math.floor(value % 1_000) };
}

export function formatTime(format: string, source: UPTimeData): string {
  let { days, hours, minutes, seconds, milliseconds } = source;
  let result = format;
  if (result.includes('DD')) result = result.replace('DD', pad(days)); else hours += days * 24;
  if (result.includes('HH')) result = result.replace('HH', pad(hours)); else minutes += hours * 60;
  if (result.includes('mm')) result = result.replace('mm', pad(minutes)); else seconds += minutes * 60;
  if (result.includes('ss')) result = result.replace('ss', pad(seconds)); else milliseconds += seconds * 1_000;
  return result.replace('SSS', pad(milliseconds, 3));
}
