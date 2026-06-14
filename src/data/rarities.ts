import type { RarityConfig } from "@/types";

// Admin-editable rarity definitions. dropWeight drives pack rolls
// (higher = more common). These are the seed defaults.
export const rarities: RarityConfig[] = [
  { id: "common",    name: "Common",    sortOrder: 0, color: "#9aa4b2", glowClass: "shadow-none",          dropWeight: 1000, minFusionRequired: 0, borderStyle: "solid" },
  { id: "uncommon",  name: "Uncommon",  sortOrder: 1, color: "#46d17a", glowClass: "shadow-none",          dropWeight: 520,  minFusionRequired: 3, borderStyle: "solid" },
  { id: "rare",      name: "Rare",      sortOrder: 2, color: "#3ea6ff", glowClass: "shadow-[0_0_18px]",    dropWeight: 230,  minFusionRequired: 3, borderStyle: "solid" },
  { id: "epic",      name: "Epic",      sortOrder: 3, color: "#b15cff", glowClass: "shadow-[0_0_22px]",    dropWeight: 90,   minFusionRequired: 3, borderStyle: "solid" },
  { id: "legendary", name: "Legendary", sortOrder: 4, color: "#ffb017", glowClass: "shadow-[0_0_30px]",    dropWeight: 24,   minFusionRequired: 4, borderStyle: "double" },
  { id: "mythic",    name: "Mythic",    sortOrder: 5, color: "#ff4655", glowClass: "shadow-[0_0_40px]",    dropWeight: 6,    minFusionRequired: 4, borderStyle: "double" },
];

export const getRarityById = (id: string, list: RarityConfig[] = rarities) =>
  list.find((r) => r.id === id) ?? rarities[0];
