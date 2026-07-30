import {
  LayoutGrid, UserCircle, Sparkles, Landmark, Target, Shield,
  Newspaper, Settings, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Financial Profile", href: "/financial-profile", icon: UserCircle },
  { label: "Life Event Simulator", href: "/life-events", icon: Sparkles },
  { label: "Government Schemes", href: "/government-schemes", icon: Landmark },
  { label: "Goal Planner", href: "/goal-planner", icon: Target },
  { label: "Insurance Analyzer", href: "/insurance", icon: Shield },
  { label: "Market News", href: "/market-news", icon: Newspaper },
  { label: "Settings", href: "/settings", icon: Settings },
];
