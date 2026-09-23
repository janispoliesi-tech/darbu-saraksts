export type ColorKey =
  | 'teal' | 'cyan' | 'blue' | 'indigo' | 'violet' | 'purple' | 'pink' | 'red'
  | 'orange' | 'amber' | 'olive' | 'green' | 'emerald' | 'brown' | 'slate' | 'ink';

export const COLORS: { key: ColorKey; label: string }[] = [
  { key: 'teal', label: 'Tirkīza' },
  { key: 'cyan', label: 'Ciāna' },
  { key: 'blue', label: 'Zila' },
  { key: 'indigo', label: 'Indigo' },
  { key: 'violet', label: 'Violeta' },
  { key: 'purple', label: 'Purpura' },
  { key: 'pink', label: 'Rozā' },
  { key: 'red', label: 'Sarkana' },
  { key: 'orange', label: 'Oranža' },
  { key: 'amber', label: 'Dzintara' },
  { key: 'olive', label: 'Olīvu' },
  { key: 'green', label: 'Zaļa' },
  { key: 'emerald', label: 'Smaragda' },
  { key: 'brown', label: 'Brūna' },
  { key: 'slate', label: 'Pelēka' },
  { key: 'ink', label: 'Melnbalta' },
];

export const COLOR_KEYS = COLORS.map((c) => c.key);

export function isHexColor(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
}

function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = ch.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readableOn(hex: string): string {
  const l = luminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  const onBlack = (l + 0.05) / 0.05;
  return onWhite >= onBlack ? '#ffffff' : '#0b1116';
}
