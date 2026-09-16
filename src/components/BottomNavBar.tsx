import React from 'react';
import { FolderGit2, Terminal, Settings } from 'lucide-react';
import { TopLevelScreen } from '../types';

interface BottomNavBarProps {
  currentScreen: TopLevelScreen;
  onSelectScreen: (screen: TopLevelScreen) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onSelectScreen }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0E14]/95 backdrop-blur-lg border-t border-[#2A3240] px-4 py-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onSelectScreen('PROJECTS')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentScreen === 'PROJECTS'
              ? 'text-[#F28C52] font-bold'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <FolderGit2 className="w-5 h-5" />
          <span className="text-[10px]">Projects</span>
        </button>

        <button
          onClick={() => onSelectScreen('TERMINAL')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentScreen === 'TERMINAL'
              ? 'text-[#F28C52] font-bold'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span className="text-[10px]">Terminal</span>
        </button>

        <button
          onClick={() => onSelectScreen('SETTINGS')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            currentScreen === 'SETTINGS'
              ? 'text-[#F28C52] font-bold'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>
    </div>
  );
};
