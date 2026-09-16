import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Trash2, StopCircle, CornerDownLeft } from 'lucide-react';
import { TerminalOutputLine, WorkspaceEntry } from '../../types';
import { executeCommand } from '../../services/terminalRunner';

interface TerminalTabProps {
  projectSlug: string;
  files: WorkspaceEntry[];
  initialLines?: TerminalOutputLine[];
  onCommandRun?: (cmd: string) => void;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({
  projectSlug,
  files,
  initialLines,
  onCommandRun,
}) => {
  const [lines, setLines] = useState<TerminalOutputLine[]>(
    initialLines && initialLines.length > 0
      ? initialLines
      : [
          {
            id: 'init-1',
            command: 'uname -a',
            output: 'Linux pocket-dev 6.1.0-arm64 #1 SMP aarch64 GNU/Linux (PRoot Sandbox Ubuntu 22.04 LTS)',
            exitCode: 0,
            timestamp: Date.now() - 60000,
          },
          {
            id: 'init-2',
            command: 'pwd',
            output: `/workspace/${projectSlug}`,
            exitCode: 0,
            timestamp: Date.now() - 30000,
          },
        ]
  );
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(`/workspace/${projectSlug}`);
  const [history, setHistory] = useState<string[]>(['npm run dev', 'git status', 'ls -la']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleRun = (cmdToRun: string) => {
    const raw = cmdToRun.trim();
    if (!raw) return;

    onCommandRun?.(raw);

    const result = executeCommand(raw, cwd, files, projectSlug);

    if (result.cleared) {
      setLines([]);
    } else {
      const newLine: TerminalOutputLine = {
        id: `line-${Date.now()}`,
        command: raw,
        output: result.output,
        exitCode: result.exitCode,
        cwd,
        timestamp: Date.now(),
      };
      setLines(prev => [...prev, newLine]);
      if (result.newCwd) {
        setCwd(result.newCwd);
      }
    }

    setHistory(prev => [raw, ...prev.filter(h => h !== raw)].slice(0, 30));
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRun(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const quickChips = [
    'npm run dev',
    'npm run build',
    'git status',
    'ls -la',
    'node -v',
    'free -h',
    'clear',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] max-h-[820px] bg-[#070A0F] rounded-2xl border border-[#2A3240] overflow-hidden font-mono shadow-2xl">
      {/* Terminal Titlebar */}
      <div className="px-4 py-2.5 bg-[#131821] border-b border-[#2A3240] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-[#F28C52]" />
          <span className="text-xs text-white font-medium">Ubuntu 22.04 LTS · PRoot ARM64</span>
          <span className="text-[10px] bg-[#69D69E]/15 text-[#69D69E] px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>

        <button
          onClick={() => setLines([])}
          className="p-1 rounded-md text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] transition text-xs flex items-center gap-1"
          title="Clear screen"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Terminal Output Log Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-[#E6EDF3] select-text">
        <div className="text-[#9AA0A6] text-[11px] pb-2 border-b border-[#2A3240]/40">
          Mobile Harness Linux Sandbox &mdash; Type <code className="text-[#F28C52]">help</code> for commands.
        </div>

        {lines.map((line) => (
          <div key={line.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#69D69E] font-bold">pocket-dev</span>
              <span className="text-[#9AA0A6]">:</span>
              <span className="text-[#8EA8FF]">{line.cwd || cwd}</span>
              <span className="text-[#F28C52] font-bold">$</span>
              <span className="text-white font-semibold">{line.command}</span>
            </div>
            {line.output && (
              <pre className="text-[#9AA0A6] font-mono text-xs whitespace-pre-wrap pl-2 border-l border-[#2A3240] leading-relaxed">
                {line.output}
              </pre>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Virtual Key Bar (for mobile & fast access) */}
      <div className="px-3 py-1.5 bg-[#131821] border-t border-[#2A3240] flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {['Esc', 'Tab', 'Ctrl', 'Alt', '↑', '↓', '←', '→'].map(k => (
          <button
            key={k}
            type="button"
            onClick={() => {
              if (k === '↑') {
                if (history.length > 0) setInput(history[0]);
              } else if (k === 'Tab') {
                setInput(i => i + '  ');
              }
            }}
            className="px-2.5 py-1 rounded bg-[#0B0E14] hover:bg-[#1B222D] border border-[#2A3240] text-[#9AA0A6] hover:text-white transition"
          >
            {k}
          </button>
        ))}

        <div className="h-4 w-px bg-[#2A3240] mx-1 shrink-0" />

        {quickChips.map(chip => (
          <button
            key={chip}
            type="button"
            onClick={() => handleRun(chip)}
            className="px-2 py-0.5 rounded bg-[#1B222D] hover:bg-[#252E3E] text-[#8EA8FF] hover:text-white text-[11px] whitespace-nowrap transition"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Prompt Row */}
      <div className="px-4 py-3 bg-[#0B0E14] border-t border-[#2A3240] flex items-center gap-2">
        <span className="text-[#69D69E] font-bold text-xs shrink-0">pocket-dev:~$</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter shell command..."
          className="flex-1 bg-transparent text-white text-xs font-mono focus:outline-none placeholder:text-gray-600"
          autoFocus
        />
        <button
          onClick={() => handleRun(input)}
          disabled={!input.trim()}
          className="p-1.5 rounded-lg bg-[#F28C52] text-black font-bold hover:bg-[#ff9c68] transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Run command"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
