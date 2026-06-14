import type { CardSet } from "@/types";

export const cardSets: CardSet[] = [
  {
    id: "set-genesis",
    name: "Genesis",
    slug: "genesis",
    description: "The founding set of Ascendant Cards — core agents, weapons and maps.",
    season: "Act I",
    releaseDate: "2026-01-01",
    coverImage: "/images/cards/card-001.png",
    isActive: true,
    totalCards: 16,
    accentColor: "#ff4655",
    backgroundStyle: "radial",
  },
  {
    id: "set-vanguard",
    name: "Vanguard",
    slug: "vanguard",
    description: "Event and showcase collectibles, including limited Mythic crests.",
    season: "Act II",
    releaseDate: "2026-04-01",
    coverImage: "/images/cards/card-017.png",
    isActive: true,
    totalCards: 4,
    accentColor: "#1ce5d4",
    backgroundStyle: "grid",
  },
];

export const getCardSetById = (id: string, list: CardSet[] = cardSets) =>
  list.find((s) => s.id === id);
