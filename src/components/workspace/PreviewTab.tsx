import React, { useState } from 'react';
import {
  Globe,
  RotateCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Terminal,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { Project, WorkspaceEntry } from '../../types';

interface PreviewTabProps {
  project: Project;
  files: WorkspaceEntry[];
  previewUrl?: string;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
  project,
  files,
  previewUrl = 'http://localhost:3000',
}) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [key, setKey] = useState(0);
  const [showConsole, setShowConsole] = useState(false);

  const consoleLogs = [
    { type: 'info', text: '[vite] connecting...' },
    { type: 'info', text: '[vite] connected.' },
    { type: 'log', text: `[preview] mounted root component for ${project.name}` },
    { type: 'log', text: '[preview] React 18 tree rendered in 14ms' },
  ];

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] max-h-[820px] bg-[#131821] border border-[#2A3240] rounded-2xl overflow-hidden shadow-2xl">
      {/* Browser Chrome Header */}
      <div className="px-4 py-2.5 bg-[#1B222D] border-b border-[#2A3240] flex flex-wrap items-center justify-between gap-3">
        {/* URL Bar */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xl bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3 py-1.5 text-xs text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-[#69D69E] shrink-0" />
          <span className="font-mono text-[11px] truncate flex-1 text-gray-300">
            {previewUrl}
          </span>
          <span className="text-[10px] font-bold bg-[#69D69E]/15 text-[#69D69E] px-1.5 py-0.5 rounded">
            200 OK
          </span>
        </div>

        {/* Viewport and Refresh controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B0E14] border border-[#2A3240] rounded-xl p-0.5">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition ${
                device === 'mobile' ? 'bg-[#1B222D] text-[#F28C52]' : 'text-[#9AA0A6] hover:text-white'
              }`}
              title="Mobile Viewport (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition ${
                device === 'tablet' ? 'bg-[#1B222D] text-[#F28C52]' : 'text-[#9AA0A6] hover:text-white'
              }`}
              title="Tablet Viewport (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition ${
                device === 'desktop' ? 'bg-[#1B222D] text-[#F28C52]' : 'text-[#9AA0A6] hover:text-white'
              }`}
              title="Desktop Viewport (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setKey(k => k + 1)}
            className="p-2 rounded-xl bg-[#0B0E14] border border-[#2A3240] text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] transition"
            title="Reload preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
              showConsole
                ? 'bg-[#F28C52]/20 border-[#F28C52] text-[#F28C52]'
                : 'bg-[#0B0E14] border-[#2A3240] text-[#9AA0A6] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Console
          </button>
        </div>
      </div>

      {/* Embedded Live Preview Stage */}
      <div className="flex-1 bg-[#07090E] p-4 flex items-center justify-center overflow-auto">
        <div
          key={key}
          className={`${getContainerWidth()} h-full min-h-[420px] bg-[#0B0E14] border border-[#2A3240] rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300`}
        >
          {/* Simulated App Header */}
          <div className="px-5 py-4 border-b border-[#2A3240] bg-[#131821] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F28C52]" />
              <span className="font-bold text-sm text-white">{project.name}</span>
            </div>
            <span className="text-xs bg-[#69D69E]/20 text-[#69D69E] px-2.5 py-0.5 rounded-full font-medium">
              Vite Dev Server
            </span>
          </div>

          {/* Simulated App Content based on project files */}
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F28C52]/15 border border-[#F28C52]/30 flex items-center justify-center text-[#F28C52] shadow-lg shadow-[#F28C52]/10">
              <Globe className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">
              {project.name}
            </h3>

            <p className="text-xs text-[#9AA0A6] max-w-md leading-relaxed">
              {project.description ||
                'Autonomous AI development workspace running inside ARM64 Linux PRoot sandbox.'}
            </p>

            <div className="p-4 rounded-xl bg-[#131821] border border-[#2A3240] w-full max-w-md text-left font-mono text-xs space-y-1.5 text-gray-300">
              <div className="text-[11px] text-[#8EA8FF] font-bold uppercase tracking-wider mb-1">
                Workspace Runtime Telemetry
              </div>
              <div>Framework: <span className="text-white">{project.language}</span></div>
              <div>Dev Server: <span className="text-[#69D69E]">Running (0.0.0.0:3000)</span></div>
              <div>Rootfs: <span className="text-white">Ubuntu 22.04 LTS (PRoot Sandbox)</span></div>
              <div>Sandbox Files: <span className="text-white">{files.length} active items</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Console Drawer */}
      {showConsole && (
        <div className="h-36 bg-[#070A0F] border-t border-[#2A3240] p-3 font-mono text-xs overflow-y-auto space-y-1">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#2A3240]/40 text-[#9AA0A6] text-[11px]">
            <span className="font-bold">Developer Console Output</span>
            <span>4 events</span>
          </div>
          {consoleLogs.map((log, i) => (
            <div key={i} className="text-[#9AA0A6] flex items-center gap-2">
              <span className="text-[#8EA8FF]">&gt;</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
