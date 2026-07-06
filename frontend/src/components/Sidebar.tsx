import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GitFork, 
  CheckSquare, 
  Database, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  AlertTriangle,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isKeyWarning: boolean;
  runningTaskId?: string | null;
}

export default function Sidebar({ currentPage, onNavigate, theme, onToggleTheme, isKeyWarning, runningTaskId }: SidebarProps) {
  
  const navItems = [
    { id: 'dashboard',     label: 'Overview',       icon: LayoutDashboard },
    { id: 'employees',     label: 'AI Employees',   icon: Users },
    { id: 'workflows',     label: 'Workflows',      icon: GitFork },
    { id: 'tasks',         label: 'Tasks',          icon: CheckSquare, badge: runningTaskId ? 'running' : null },
    { id: 'conversations', label: 'Conversations',  icon: MessageSquare },
    { id: 'knowledge',     label: 'Knowledge Base', icon: Database },
    { id: 'analytics',     label: 'Analytics',      icon: BarChart3 },
    { id: 'settings',      label: 'Settings',       icon: Settings, badge: isKeyWarning ? 'warn' : null },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] flex flex-col h-full select-none shrink-0 z-20">
      
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-4 w-4">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-zinc-950 dark:text-white">AgentHub AI</span>
            <span className="block text-[10px] text-zinc-500 font-medium">OS v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-200'
              }`}
            >
              {/* Active left-side accent bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
              )}

              <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
              }`} />
              
              <span className="flex-1 text-left">{item.label}</span>

              {/* Running task badge on Tasks nav item */}
              {item.badge === 'running' && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                  LIVE
                </span>
              )}

              {/* Settings warning badge */}
              {item.badge === 'warn' && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-[#09090b]/50 space-y-4">
        
        {/* API Key warning */}
        {isKeyWarning && (
          <div
            onClick={() => onNavigate('settings')}
            className="p-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-lg flex gap-2.5 cursor-pointer transition-colors"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400">Keys Unconfigured</span>
              <span className="block text-[9px] text-zinc-500 leading-tight">Add a Gemini key in Settings to run tasks.</span>
            </div>
          </div>
        )}

        {/* Running task status in footer */}
        {runningTaskId && (
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse shrink-0" />
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Agent workflow running...</span>
          </div>
        )}

        {/* Bottom row: system status + theme toggle */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-medium">System Online</span>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-zinc-600" />}
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 pt-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
            M
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">MADHAV</span>
            <span className="block text-[9px] text-zinc-500 truncate">madhav@agenthub.ai</span>
          </div>
        </div>

      </div>
    </aside>
  );
}
