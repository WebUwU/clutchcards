import {
  LayoutDashboard, Swords, Library, Store, ShoppingBag, User, Trophy,
  Package, Settings,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quests", label: "Quests", icon: Swords },
  { href: "/collection", label: "Collection", icon: Library },
  { href: "/packs", label: "Packs", icon: Package },
  { href: "/market", label: "Market", icon: Store },
  { href: "/battlepass", label: "Battlepass", icon: Trophy },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
