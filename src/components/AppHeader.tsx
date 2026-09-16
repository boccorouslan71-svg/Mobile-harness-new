import React from 'react';
import { Sparkles, Terminal, Shield, Moon, Sun, Settings, FolderGit2 } from 'lucide-react';
import { AppThemeMode, TopLevelScreen } from '../types';

interface AppHeaderProps {
  currentScreen: TopLevelScreen;
  themeMode: AppThemeMode;
  onSelectScreen: (screen: TopLevelScreen) => void;
  onToggleTheme: () => void;
  onOpenWizard: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentScreen,
  themeMode,
  onSelectScreen,
  onToggleTheme,
  onOpenWizard,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#2A3240] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          onClick={() => onSelectScreen('PROJECTS')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {/* Logo Mark */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F28C52] to-[#d85a20] flex items-center justify-center text-black font-black shadow-lg shadow-[#F28C52]/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white group-hover:text-[#F28C52] transition">
                Mobile Harness
              </h1>
              <span className="text-[10px] bg-[#F28C52]/20 text-[#F28C52] px-1.5 py-0.5 rounded font-mono font-bold">
                PRoot v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#9AA0A6]">
              Autonomous AI Development Workspace
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131821] p-1 rounded-xl border border-[#2A3240]">
          <button
            onClick={() => onSelectScreen('PROJECTS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              currentScreen === 'PROJECTS'
                ? 'bg-[#1B222D] text-white border border-[#2A3240]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" /> Projects
          </button>
          <button
            onClick={() => onSelectScreen('TERMINAL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              currentScreen === 'TERMINAL'
                ? 'bg-[#1B222D] text-white border border-[#2A3240]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Terminal
          </button>
          <button
            onClick={() => onSelectScreen('SETTINGS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              currentScreen === 'SETTINGS'
                ? 'bg-[#1B222D] text-white border border-[#2A3240]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#69D69E] bg-[#69D69E]/10 border border-[#69D69E]/20 px-2.5 py-1 rounded-xl font-mono">
            <span className="w-2 h-2 rounded-full bg-[#69D69E] animate-pulse" />
            <span>PRoot ARM64: Ready</span>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[#131821] border border-[#2A3240] text-[#9AA0A6] hover:text-white transition"
            title="Toggle theme"
          >
            {themeMode === 'DARK' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
