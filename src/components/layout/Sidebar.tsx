import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  HelpCircle,
  FileUp,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  BarChart3,
  StickyNote,
  Repeat,
  X,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  unreadNotifs: number;
  darkMode?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "courses", label: "Mes Cours", icon: BookOpen },
  { id: "document-ai", label: "Document IA", icon: FileUp },
  { id: "library", label: "Bibliotheque", icon: Library },
  { id: "quizzes", label: "Quiz & Examens", icon: HelpCircle },
  { id: "revision", label: "Revision", icon: Repeat },
  { id: "notes", label: "Mes Notes", icon: StickyNote },
  { id: "analytics", label: "Statistiques", icon: BarChart3 },
];

const bottomItems = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Parametres", icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, unreadNotifs, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`
        flex flex-col h-full
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-700
        transition-all duration-300
        ${collapsed ? "w-[68px]" : "w-[260px]"}
      `}
    >
      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-3 px-3 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        {!collapsed ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              U
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Utilisateur</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">bienvenue</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex justify-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
              U
            </div>
          </div>
        )}

        {/* Desktop collapse toggle — always visible */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            flex items-center justify-center w-7 h-7 rounded-lg
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
            flex-shrink-0
            ${collapsed ? "mx-auto" : ""}
          `}
          title={collapsed ? "Agrandir" : "Reduire"}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>

        {/* Mobile close button */}
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 overflow-y-auto py-3" style={{ scrollbarWidth: "none" }}>
        {!collapsed && (
          <p className="px-4 text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-semibold mb-1.5">
            Menu
          </p>
        )}
        <div className={`space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center rounded-none transition-all text-sm
                  ${collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}
                  ${isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── BOTTOM ITEMS ── */}
      <div className={`border-t border-slate-100 dark:border-slate-800 py-3 space-y-0.5 flex-shrink-0 ${collapsed ? "px-2" : "px-3"}`}>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center rounded-none transition-all text-sm relative
                ${collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}
                ${isActive
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
              {item.id === "notifications" && unreadNotifs > 0 && (
                <span
                  className={`flex items-center justify-center font-bold text-white rounded-full text-[9px]`}
                  style={{
                    position: "absolute",
                    width: 16, height: 16,
                    background: "#ef4444",
                    top: collapsed ? 6 : 8,
                    left: collapsed ? 24 : 32,
                  }}
                >
                  {unreadNotifs}
                </span>
              )}
            </button>
          );
        })}

        {/* AI Button */}
        <button
          onClick={() => onNavigate("ai-chat")}
          title={collapsed ? "Assistant IA" : undefined}
          className={`
            w-full mt-2 flex items-center rounded-none text-white text-sm font-semibold
            transition-all hover:opacity-90 active:scale-95
            ${collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}
          `}
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
        >
          <Brain className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Assistant IA</span>}
        </button>
      </div>
    </div>
  );
}
