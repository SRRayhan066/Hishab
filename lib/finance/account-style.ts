export const accountColors = {
  sage: { from: "#f1f6ee", to: "#dde9d6", border: "#d3e0cb", ink: "#3d5f39" },
  sand: { from: "#faf4e8", to: "#efe2c8", border: "#e8dcc3", ink: "#7a5a28" },
  clay: { from: "#fbf0ea", to: "#f1d9cc", border: "#ecd6ca", ink: "#8f4a33" },
  sky: { from: "#eff5f8", to: "#d7e5ee", border: "#d1e0e9", ink: "#33576d" },
  lavender: { from: "#f4f2f9", to: "#e0dcef", border: "#dbd6ea", ink: "#554a7c" },
  butter: { from: "#fbf7e3", to: "#f0e4b8", border: "#e9ddb3", ink: "#6f5a12" },
  mint: { from: "#edf7f3", to: "#d3e9e0", border: "#cde3da", ink: "#2e6252" },
  rose: { from: "#fbf0f2", to: "#f0d9df", border: "#ebd4da", ink: "#83404f" },
} as const;

export const accountIcons = [
  "landmark",
  "wallet",
  "smartphone",
  "piggy",
  "coins",
  "banknote",
  "vault",
  "gem",
] as const;

export type AccountColor = keyof typeof accountColors;
export type AccountIcon = (typeof accountIcons)[number];

export const accountColorKeys = Object.keys(accountColors) as [
  AccountColor,
  ...AccountColor[],
];

export function colorOf(key: string | undefined) {
  return accountColors[key as AccountColor] ?? accountColors.sage;
}

function pickFrom<T extends string>(all: readonly T[], used: (string | undefined)[]): T {
  const free = all.filter((key) => !used.includes(key));
  const pool = free.length > 0 ? free : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickAccountStyle(used: { color?: string; icon?: string }[]) {
  return {
    color: pickFrom(accountColorKeys, used.map((style) => style.color)),
    icon: pickFrom(accountIcons, used.map((style) => style.icon)),
  };
}
