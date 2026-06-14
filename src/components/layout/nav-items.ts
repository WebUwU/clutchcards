import {
  LayoutDashboard, Swords, Library, Store, ShoppingBag, User, Trophy,
  Package, Settings,
} from "lucide-react";

// `auth: true` items only show when the user is signed in.
export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, auth: true },
  { href: "/quests", label: "Quests", icon: Swords, auth: true },
  { href: "/collection", label: "Collection", icon: Library, auth: true },
  { href: "/packs", label: "Packs", icon: Package, auth: true },
  { href: "/market", label: "Market", icon: Store, auth: true },
  { href: "/battlepass", label: "Battlepass", icon: Trophy, auth: true },
  { href: "/shop", label: "Shop", icon: ShoppingBag, auth: false },
  { href: "/profile", label: "Profile", icon: User, auth: true },
  { href: "/settings", label: "Settings", icon: Settings, auth: true },
] as const;
