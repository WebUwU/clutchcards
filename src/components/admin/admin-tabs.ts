import {
  LayoutGrid, Layers, Boxes, Package, Gem, Shapes, Swords,
  ShoppingBag, Store, Coins, Users, Database, Settings,
} from "lucide-react";

export const ADMIN_TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "cards", label: "Cards", icon: Layers },
  { key: "sets", label: "Card Sets", icon: Boxes },
  { key: "packs", label: "Packs", icon: Package },
  { key: "rarities", label: "Rarities", icon: Gem },
  { key: "types", label: "Card Types", icon: Shapes },
  { key: "quests", label: "Quests", icon: Swords },
  { key: "shop", label: "Shop Items", icon: ShoppingBag },
  { key: "market", label: "Market", icon: Store },
  { key: "economy", label: "Economy Rules", icon: Coins },
  { key: "users", label: "Users", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

export type AdminTabKey = (typeof ADMIN_TABS)[number]["key"];
