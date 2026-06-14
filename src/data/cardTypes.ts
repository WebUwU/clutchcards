import type { CardTypeConfig } from "@/types";

export const cardTypes: CardTypeConfig[] = [
  { id: "agent",   name: "Agent",   description: "Playable operatives with signature abilities.", icon: "UserRound",  color: "#ff4655" },
  { id: "weapon",  name: "Weapon",  description: "Iconic armaments from the arsenal.",            icon: "Crosshair",  color: "#3ea6ff" },
  { id: "ability", name: "Ability", description: "Signature and ultimate ability cards.",          icon: "Sparkles",   color: "#b15cff" },
  { id: "map",     name: "Map",     description: "Battlegrounds and locations.",                   icon: "Map",        color: "#46d17a" },
  { id: "event",   name: "Event",   description: "Limited commemorative collectibles.",            icon: "Trophy",     color: "#ffb017" },
];

export const getCardTypeById = (id: string, list: CardTypeConfig[] = cardTypes) =>
  list.find((t) => t.id === id) ?? cardTypes[0];
