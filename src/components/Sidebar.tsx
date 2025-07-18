import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  Building,
  FileText,
  Receipt,
  Users,
  BookOpen,
  ShoppingCart,
  CreditCard,
  Settings,
  Heart,
  HelpCircle,
  ChevronDown,
  Building2,
  Library,
  Hammer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Tableau de bord",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    name: "Chantiers",
    href: "/chantiers",
    icon: Building,
  },
];

const sales = [
  {
    name: "Devis",
    href: "/devis",
    icon: FileText,
  },
  {
    name: "Factures",
    href: "/factures",
    icon: Receipt,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Bibliothèque d'ouvrages",
    href: "/bibliotheque",
    icon: Hammer,
  },
];

const contacts = [
  {
    name: "Tiers",
    href: "/tiers",
    icon: Building2,
  },
];

const purchases = [
  {
    name: "Bons de commande",
    href: "/bons-commande",
    icon: ShoppingCart,
  },
  {
    name: "Factures d'achats",
    href: "/factures-achats",
    icon: Receipt,
  },
  {
    name: "Fournisseurs",
    href: "/fournisseurs",
    icon: Users,
  },
];

const accounting = [
  {
    name: "Transactions",
    href: "/transactions",
    icon: CreditCard,
  },
];

const settings = [
  {
    name: "Réglages",
    href: "/reglages",
    icon: Settings,
  },
  {
    name: "Parrainage",
    href: "/parrainage",
    icon: Heart,
  },
  {
    name: "Besoin d'aide ?",
    href: "/aide",
    icon: HelpCircle,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav
      className={cn(
        "flex flex-col h-full bg-white dark:bg-neo-gray-900 border-r border-neo-gray-200 dark:border-neo-gray-800",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neo-gray-200 dark:border-neo-gray-800">
        <div className="w-8 h-8 text-benaya-600 dark:text-benaya-400">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <g fill="currentColor" opacity="0.9">
              <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
              <path d="M8.66 9L16 4.5V13.5L8.66 18L1.34 13.5V4.5L8.66 9Z" />
              <path d="M31.34 9L38.66 4.5V13.5L31.34 18L24 13.5V4.5L31.34 9Z" />
              <path d="M8.66 31L16 26.5V35.5L8.66 40L1.34 35.5V26.5L8.66 31Z" />
              <path d="M31.34 31L38.66 26.5V35.5L31.34 40L24 35.5V26.5L31.34 31Z" />
              <path d="M20 38L27.32 33.5V24.5L20 20L12.68 24.5V33.5L20 38Z" />
            </g>
            <path
              d="M15 20L18.5 23.5L25 17"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="17" y1="29" x2="23" y2="29" />
              <line x1="16" y1="31" x2="24" y2="31" />
              <line x1="15" y1="33" x2="25" y2="33" />
              <line x1="16" y1="35" x2="24" y2="35" />
              <line x1="18" y1="37" x2="22" y2="37" />
            </g>
          </svg>
        </div>
        <span className="text-xl font-bold text-neo-gray-900 dark:text-white">
          benaya
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "sidebar-item",
                  isActive(item.href) &&
                    "active bg-benaya-50 dark:bg-benaya-950 text-benaya-700 dark:text-benaya-300",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Sales Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3">
            <h3 className="text-xs font-semibold text-neo-gray-500 dark:text-neo-gray-400 uppercase tracking-wider">
              VENTES
            </h3>
          </div>
          <div className="space-y-1">
            {sales.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "sidebar-item",
                    isActive(item.href) &&
                      "active bg-benaya-50 dark:bg-benaya-950 text-benaya-700 dark:text-benaya-300",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Contacts & CRM Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3">
            <h3 className="text-xs font-semibold text-neo-gray-500 dark:text-neo-gray-400 uppercase tracking-wider">
              CONTACTS & CRM
            </h3>
          </div>
          <div className="space-y-1">
            {contacts.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "sidebar-item",
                    isActive(item.href) &&
                      "active bg-benaya-50 dark:bg-benaya-950 text-benaya-700 dark:text-benaya-300",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Purchases Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3">
            <h3 className="text-xs font-semibold text-neo-gray-500 dark:text-neo-gray-400 uppercase tracking-wider">
              ACHATS
            </h3>
          </div>
          <div className="space-y-1">
            {purchases.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "sidebar-item",
                    isActive(item.href) &&
                      "active bg-benaya-50 dark:bg-benaya-950 text-benaya-700 dark:text-benaya-300",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Accounting Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3">
            <h3 className="text-xs font-semibold text-neo-gray-500 dark:text-neo-gray-400 uppercase tracking-wider">
              COMPTABILITÉ
            </h3>
          </div>
          <div className="space-y-1">
            {accounting.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "sidebar-item",
                    isActive(item.href) &&
                      "active bg-benaya-50 dark:bg-benaya-950 text-benaya-700 dark:text-benaya-300",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="px-4 py-4 border-t border-neo-gray-200 dark:border-neo-gray-800">
        <div className="space-y-1">
          {settings.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "sidebar-item",
                  isActive(item.href) &&
                    "active bg-benaya-50 dark:bg-benaya-950 text-benaya-700 dark:text-benaya-300",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* "Plus de fonctionnalités" */}
        <div className="mt-4 pt-4 border-t border-neo-gray-200 dark:border-neo-gray-800">
          <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
            <span>Plus de fonctionnalités ?</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
