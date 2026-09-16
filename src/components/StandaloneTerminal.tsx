import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Cpu, HardDrive, RefreshCw, CornerDownLeft } from 'lucide-react';
import { TerminalOutputLine } from '../types';
import { executeCommand } from '../services/terminalRunner';

export const StandaloneTerminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalOutputLine[]>([
    {
      id: 'root-1',
      command: 'uname -a',
      output: 'Linux pocket-dev 6.1.0-arm64 #1 SMP aarch64 GNU/Linux (PRoot Sandbox Ubuntu 22.04 LTS)',
      exitCode: 0,
      timestamp: Date.now() - 120000,
    },
    {
      id: 'root-2',
      command: 'claude --version',
      output: 'Claude Code 0.2.29 (ARM64 Ubuntu 22.04 CLI)',
      exitCode: 0,
      timestamp: Date.now() - 90000,
    },
    {
      id: 'root-3',
      command: 'node -v && npm -v',
      output: 'v22.14.0\n10.9.2',
      exitCode: 0,
      timestamp: Date.now() - 60000,
    },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/workspace');
  const [history, setHistory] = useState<string[]>([
    'uname -a',
    'free -h',
    'top',
    'apt list --installed',
    'ls -la',
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleRun = (cmd: string) => {
    const raw = cmd.trim();
    if (!raw) return;

    const result = executeCommand(raw, cwd, [], 'root');

    if (result.cleared) {
      setLines([]);
    } else {
      const newLine: TerminalOutputLine = {
        id: `root-line-${Date.now()}`,
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

  const diagnosticChips = [
    'uname -a',
    'free -h',
    'top',
    'whoami',
    'node -v',
    'python3 --version',
    'help',
    'clear',
  ];

  return (
    <div className="space-y-4">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131821] p-4 rounded-2xl border border-[#2A3240]">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#F28C52]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Linux PRoot Terminal</h2>
            <span className="text-[10px] bg-[#69D69E]/15 text-[#69D69E] px-2 py-0.5 rounded-full font-mono">
              Online
            </span>
          </div>
          <p className="text-xs text-[#9AA0A6] mt-0.5">
            Direct access to the ARM64 userspace sandbox. Runs node, git, python, and development toolchains.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#9AA0A6]">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#8EA8FF]" />
            <span>aarch64 (ARM64)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-[#69D69E]" />
            <span>7.8 GB Free</span>
          </div>
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex flex-col h-[calc(100vh-250px)] max-h-[750px] bg-[#070A0F] rounded-2xl border border-[#2A3240] overflow-hidden font-mono shadow-2xl">
        {/* Title bar */}
        <div className="px-4 py-2.5 bg-[#131821] border-b border-[#2A3240] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-white">root@pocket-dev: {cwd}</span>
          </div>

          <button
            onClick={() => setLines([])}
            className="p-1 rounded-md text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] transition text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-[#E6EDF3] select-text">
          {lines.map((line) => (
            <div key={line.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[#69D69E] font-bold">root@pocket-dev</span>
                <span className="text-[#9AA0A6]">:</span>
                <span className="text-[#8EA8FF]">{line.cwd || cwd}</span>
                <span className="text-[#F28C52] font-bold">#</span>
                <span className="text-white font-semibold">{line.command}</span>
              </div>
              {line.output && (
                <pre className="text-[#9AA0A6] font-mono text-xs whitespace-pre-wrap pl-2 border-l border-[#2A3240] leading-relaxed">
                  {line.output}
                </pre>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Virtual Keys & Diagnostic Chips */}
        <div className="px-3 py-1.5 bg-[#131821] border-t border-[#2A3240] flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {['Esc', 'Tab', 'Ctrl', 'Alt', '↑', '↓', '←', '→'].map(k => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (k === '↑' && history.length > 0) setInput(history[0]);
                if (k === 'Tab') setInput(i => i + '  ');
              }}
              className="px-2 py-1 rounded bg-[#0B0E14] hover:bg-[#1B222D] border border-[#2A3240] text-[#9AA0A6] hover:text-white transition"
            >
              {k}
            </button>
          ))}

          <div className="h-4 w-px bg-[#2A3240] mx-1 shrink-0" />

          {diagnosticChips.map(chip => (
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

        {/* Prompt Input */}
        <div className="px-4 py-3 bg-[#0B0E14] border-t border-[#2A3240] flex items-center gap-2">
          <span className="text-[#69D69E] font-bold text-xs shrink-0">root@pocket-dev:#</span>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e) => {
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
            }}
            placeholder="Type bash command (e.g. uname -a, node -v, top)..."
            className="flex-1 bg-transparent text-white text-xs font-mono focus:outline-none placeholder:text-gray-600"
            autoFocus
          />
          <button
            onClick={() => handleRun(input)}
            disabled={!input.trim()}
            className="p-1.5 rounded-lg bg-[#F28C52] text-black font-bold hover:bg-[#ff9c68] transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
