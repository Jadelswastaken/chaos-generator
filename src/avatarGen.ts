import type { Theme } from "./themes";

export type Symmetry = "radial" | "mirror";

export type AvatarSpec = {
  theme: Theme;
  symmetry: Symmetry;
  chars: string;
  image: string | null;
  badge: boolean;
  size: number;
  grid: string[][];
  textColor: string;
  badgeColor: string;
};

export const GRID_SIZES = [4, 6, 8] as const;

export const CENTERPIECES = [
  { value: "", label: "none" },
  { value: "chaos-icon.svg", label: "chaos" },
  { value: "demeter.svg", label: "demeter" },
  { value: "my-take-away.svg", label: "my-take-away" },
  { value: "jadels.png", label: "jadels" },
] as const;

const rng = () => Math.random();

const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

const canonicalRadial = (
  r: number,
  c: number,
  size: number,
): [number, number] => {
  // 4-fold rotation around center: (r,c) -> (c, size-1-r)
  const orbit: [number, number][] = [
    [r, c],
    [c, size - 1 - r],
    [size - 1 - r, size - 1 - c],
    [size - 1 - c, r],
  ];
  orbit.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return orbit[0];
};

const canonicalMirror = (
  r: number,
  c: number,
  size: number,
): [number, number] => {
  return [r, Math.min(c, size - 1 - c)];
};

const buildGrid = (
  palette: string[],
  symmetry: Symmetry,
  size: number,
): string[][] => {
  const canon =
    symmetry === "radial" ? canonicalRadial : canonicalMirror;
  const reps = new Map<string, string>();
  const grid: string[][] = Array.from({ length: size }, () =>
    Array(size).fill(""),
  );
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const [cr, cc] = canon(r, c, size);
      const key = `${cr},${cc}`;
      let color = reps.get(key);
      if (!color) {
        color = pick(palette);
        reps.set(key, color);
      }
      grid[r][c] = color;
    }
  }
  return grid;
};

// Relative luminance (sRGB) for picking readable text color
const luminance = (hex: string): number => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const c = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};

const avgLuminance = (palette: string[]): number =>
  palette.reduce((s, c) => s + luminance(c), 0) / palette.length;

const pickBadge = (palette: string[]): string => {
  // Pick the lightest or darkest swatch to maximise contrast with the grid average
  const avg = avgLuminance(palette);
  const sorted = [...palette].sort((a, b) => luminance(a) - luminance(b));
  return avg > 0.5 ? sorted[0] : sorted[sorted.length - 1];
};

export const generate = (
  theme: Theme,
  chars: string,
  symmetryMode: Symmetry | "random",
  image: string | null = null,
  badge: boolean = true,
  size: number = 6,
): AvatarSpec => {
  const symmetry: Symmetry =
    symmetryMode === "random"
      ? rng() < 0.5
        ? "radial"
        : "mirror"
      : symmetryMode;
  const grid = buildGrid(theme.colors, symmetry, size);
  const badgeColor = pickBadge(theme.colors);
  const textColor = luminance(badgeColor) > 0.5 ? "#111" : "#fff";
  return {
    theme,
    symmetry,
    chars: chars.slice(0, 3),
    image,
    badge,
    size,
    grid,
    textColor,
    badgeColor,
  };
};
