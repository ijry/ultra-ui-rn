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

/**
 * Generate a light background color from a text color.
 * Mirrors `uni.$u.genLightColor`.
 */
export function genLightColor(textColor: string, lightness = 95): string {
  const rgb = parseColor(textColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(hsl.h, hsl.s, Math.min(lightness, 95));
}

function parseColor(colorStr: string): { r: number; g: number; b: number } {
  const str = colorStr.toLowerCase().trim();
  if (str.startsWith('#')) {
    const hex = str.replace('#', '');
    const fullHex = hex.length === 3
      ? hex.split('').map((c) => c + c).join('')
      : hex;
    return {
      r: parseInt(fullHex.substring(0, 2), 16),
      g: parseInt(fullHex.substring(2, 4), 16),
      b: parseInt(fullHex.substring(4, 6), 16),
    };
  }
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
  }
  throw new Error('Invalid color format');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h: number;
  let s: number;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case red:
        h = (green - blue) / d + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / d + 2;
        break;
      default:
        h = (red - green) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const light = l / 100;
  const a = (s * Math.min(light, 1 - light)) / 100;
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
