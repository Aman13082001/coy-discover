import { Heart, House, Layers } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/discover", label: "Discover", icon: Layers },
  { href: "/matches", label: "Matches", icon: Heart },
] as const;

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
