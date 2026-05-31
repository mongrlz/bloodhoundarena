import { 
  Gamepad2, 
  BarChart3, 
  Brain, 
  Wallet, 
  CircleDollarSign, 
  HelpCircle, 
  History 
} from "lucide-react";
import { TabType } from "../types";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  operatorRank: string;
  onOpenDeposit: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, operatorRank, onOpenDeposit }: SidebarProps) {
  const menuItems = [
    { id: "arena" as const, label: "Arena", icon: Gamepad2 },
    { id: "leaderboard" as const, label: "Leaderboard", icon: BarChart3 },
    { id: "intelligence" as const, label: "Intelligence", icon: Brain },
    { id: "vault" as const, label: "Vault", icon: Wallet },
  ] as const;

  return (
    <aside id="sidebar-container" className="hidden md:flex flex-col h-full py-6 bg-surface-container-low w-64 border-r border-on-surface/20 shadow-[2px_0px_0px_0px_rgba(26,26,26,0.04)] z-40 transition-all">
      {/* Operator Identity Block */}
      <div className="px-6 mb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-surface-container-high rounded-full neo-border neo-shadow mb-4 overflow-hidden relative group">
          <img 
            alt="Arena Identity Avatar" 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-200"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgmAFVWTCZBzUwDwomL2agOOGLI-x_vZEWdLeIgEao1YAB8nKd1wdLF4wIj5oibLJvJmQX5qRD83RdGFb05nSLTfDxdwtZOUQhzp3Ucxv2uROjdAs8cx4twrc0kVDcZzF14Jtx5qD210ehX6U97ev-T7vpKm8KmlqMCvQXIVMug4lqbX_RcWflJ2z36l3So6Hjt7dNl9yo5g6yJjnkxdHlLXjCugepw29EHPZ0Vd06JI1FDlYhaG7NJm8UlIlQd9JnA3kXnBq3jag"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="font-display text-xl font-medium italic text-on-surface text-center tracking-tight uppercase">OPERATOR</h2>
        <span className="font-mono text-xs text-on-surface-variant font-bold bg-surface-container-lowest px-2 py-1 mt-1 neo-border-sm">
          Rank: {operatorRank}
        </span>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-[calc(100%-16px)] m-2 p-3 flex items-center gap-4 font-mono font-bold text-xs tracking-wide uppercase transition-all rounded-sm rounded-r-none ${
                isActive
                  ? "bg-surface-container-high text-primary border border-on-surface neo-shadow translate-x-1"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface text-left"
              }`}
            >
              <Icon size={16} className={isActive ? "stroke-2 fill-primary/10" : "stroke-2"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Action Block & Meta Info */}
      <div className="px-4 mt-auto">
        <button
          id="sidebar-deposit-btn"
          onClick={onOpenDeposit}
          className="w-full py-3 bg-secondary text-on-secondary neo-border neo-shadow neo-hover neo-active font-mono font-bold text-xs uppercase mb-6 flex justify-center items-center gap-2 cursor-pointer transition-transform"
        >
          <CircleDollarSign size={16} />
          DEPOSIT
        </button>

        <div className="flex flex-col gap-2 px-2">
          <button
            id="sidebar-support-link"
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-3 text-xs uppercase font-mono font-bold hover:text-primary transition-colors text-left cursor-pointer ${
              activeTab === "support" ? "text-primary font-black" : "text-on-surface-variant"
            }`}
          >
            <HelpCircle size={14} />
            Support
          </button>
          <button
            id="sidebar-history-link"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-3 text-xs uppercase font-mono font-bold hover:text-primary transition-colors text-left cursor-pointer ${
              activeTab === "history" ? "text-primary font-black" : "text-on-surface-variant"
            }`}
          >
            <History size={14} />
            History
          </button>
        </div>
      </div>
    </aside>
  );
}
