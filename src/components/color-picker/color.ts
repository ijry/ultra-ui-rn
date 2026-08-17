export type HSVColor = {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
};

function parseHex(hex: string): { r: number; g: number; b: number; a: number } {
  let text = String(hex || '').trim().replace(/^#/, '');
  if (text.length === 3 || text.length === 4) {
    text = text
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(text.slice(0, 2) || 'ff', 16);
  const g = parseInt(text.slice(2, 4) || 'ff', 16);
  const b = parseInt(text.slice(4, 6) || 'ff', 16);
  const a = text.length >= 8 ? parseInt(text.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

export function hexToHsv(hex: string): HSVColor {
  const { r, g, b, a } = parseHex(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === r / 255) hue = ((g / 255 - b / 255) / delta) % 6;
    else if (max === g / 255) hue = (b / 255 - r / 255) / delta + 2;
    else hue = (r / 255 - g / 255) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const lightness = ((max + min) / 2) * 100;
  const saturation = delta === 0 ? 0 : (delta / (1 - Math.abs(2 * lightness / 100 - 1))) * 100;
  return { hue: Math.round(hue), saturation: Math.round(saturation), lightness: Math.round(lightness), alpha: a };
}

export function hsvToHex({ hue, saturation, lightness, alpha }: HSVColor): string {
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 1 / 6) [r, g, b] = [c, x, 0];
  else if (h < 2 / 6) [r, g, b] = [x, c, 0];
  else if (h < 3 / 6) [r, g, b] = [0, c, x];
  else if (h < 4 / 6) [r, g, b] = [0, x, c];
  else if (h < 5 / 6) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (alpha < 1) {
    hex += Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0');
  }
  return hex;
}

/** Two-stop linear gradient interpolation between two hex colors. */
export function gradientHex(from: string, to: string, ratio: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * ratio);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(mix(a.r, b.r))}${toHex(mix(a.g, b.g))}${toHex(mix(a.b, b.b))}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
