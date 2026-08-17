export type UPRgb = [number, number, number];

const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseRgb(value: string): UPRgb | undefined {
  const rgbMatch = value.match(rgbPattern);
  if (rgbMatch) {
    return [
      clampChannel(Number(rgbMatch[1])),
      clampChannel(Number(rgbMatch[2])),
      clampChannel(Number(rgbMatch[3])),
    ];
  }

  if (!hexPattern.test(value)) {
    return undefined;
  }

  const hex = value.slice(1);
  const normalized = hex.length === 3
    ? hex.split('').map((channel) => `${channel}${channel}`).join('')
    : hex;
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

export function hexToRgb(color: string): string;
export function hexToRgb(color: string, asString: false): UPRgb | string;
export function hexToRgb(color: string, asString = true): UPRgb | string {
  const channels = parseRgb(String(color));
  if (!channels) {
    return color;
  }
  return asString ? `rgb(${channels.join(',')})` : channels;
}

export function rgbToHex(color: string): string {
  const channels = parseRgb(String(color));
  if (!channels) {
    return color;
  }
  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function colorToRgba(color: string, alpha: number): string {
  const channels = parseRgb(String(color));
  return channels ? `rgba(${channels.join(',')},${alpha})` : color;
}

export function colorGradient(
  startColor = 'rgb(0,0,0)',
  endColor = 'rgb(255,255,255)',
  step = 10,
): string[] {
  const start = parseRgb(startColor);
  const end = parseRgb(endColor);
  const count = Math.max(1, Math.floor(step));

  if (!start || !end) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    if (index === 0) {
      return rgbToHex(startColor);
    }
    if (index === count - 1) {
      return rgbToHex(endColor);
    }
    const ratio = index / count;
    return rgbToHex(
      `rgb(${Math.round(start[0] + (end[0] - start[0]) * ratio)},${Math.round(
        start[1] + (end[1] - start[1]) * ratio,
      )},${Math.round(start[2] + (end[2] - start[2]) * ratio)})`,
    );
  });
}
