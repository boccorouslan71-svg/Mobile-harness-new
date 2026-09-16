import React from 'react';
import { Code, Check, RotateCcw, FileText, CheckCheck } from 'lucide-react';
import { ChangeItem } from '../../types';

interface ChangesTabProps {
  changes: ChangeItem[];
  onAcceptAll: () => void;
  onRevertAll: () => void;
  onAcceptChange: (path: string) => void;
  onRejectChange: (path: string) => void;
}

export const ChangesTab: React.FC<ChangesTabProps> = ({
  changes,
  onAcceptAll,
  onRevertAll,
  onAcceptChange,
  onRejectChange,
}) => {
  if (changes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-210px)] max-h-[820px] bg-[#131821] border border-[#2A3240] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#1B222D] flex items-center justify-center text-[#9AA0A6] mb-3 border border-[#2A3240]">
          <Code className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Working Tree Clean</h3>
        <p className="text-xs text-[#9AA0A6] max-w-sm">
          No modified files detected. When the autonomous AI agent or you make code edits, unified diffs will appear here.
        </p>
      </div>
    );
  }

  const totalAdditions = changes.reduce((acc, c) => acc + c.additions, 0);
  const totalDeletions = changes.reduce((acc, c) => acc + c.deletions, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] max-h-[820px] bg-[#131821] border border-[#2A3240] rounded-2xl overflow-hidden shadow-2xl">
      {/* Changes Header */}
      <div className="px-5 py-3.5 border-b border-[#2A3240] flex items-center justify-between bg-[#1B222D]/70">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">Modified Files ({changes.length})</span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#69D69E] bg-[#69D69E]/10 px-2 py-0.5 rounded-md font-bold">
              +{totalAdditions}
            </span>
            <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md font-bold">
              -{totalDeletions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRevertAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#9AA0A6] hover:text-white hover:bg-[#2A3240] transition border border-[#2A3240]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Revert All
          </button>
          <button
            onClick={onAcceptAll}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#69D69E] text-black hover:bg-[#7be6af] transition shadow-md shadow-[#69D69E]/15"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Accept All
          </button>
        </div>
      </div>

      {/* Diff List Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {changes.map((item) => (
          <div
            key={item.path}
            className="border border-[#2A3240] rounded-xl overflow-hidden bg-[#0B0E14]"
          >
            {/* File Diff Header */}
            <div className="px-4 py-2.5 bg-[#1B222D] border-b border-[#2A3240] flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-white">
                <FileText className="w-4 h-4 text-[#F28C52]" />
                <span className="font-semibold">{item.path}</span>
                <span className="text-[#9AA0A6] text-[11px]">
                  (+{item.additions}, -{item.deletions})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRejectChange(item.path)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-400 hover:bg-red-500/10 transition border border-red-500/30"
                >
                  Discard
                </button>
                <button
                  onClick={() => onAcceptChange(item.path)}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#69D69E] text-black hover:bg-[#7ce4ad] transition"
                >
                  Keep
                </button>
              </div>
            </div>

            {/* Line-by-line Diff */}
            <div className="p-3 font-mono text-xs overflow-x-auto space-y-0.5">
              {item.diffLines.map((line, idx) => {
                const isAdd = line.type === 'ADDITION';
                const isDel = line.type === 'DELETION';

                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded flex items-start gap-3 ${
                      isAdd
                        ? 'bg-[#69D69E]/15 text-[#69D69E]'
                        : isDel
                        ? 'bg-red-500/15 text-red-400'
                        : 'text-[#9AA0A6]'
                    }`}
                  >
                    <span className="w-6 text-right select-none opacity-40 shrink-0 text-[10px]">
                      {line.newLine || line.oldLine || ' '}
                    </span>
                    <span className="select-none font-bold shrink-0">
                      {isAdd ? '+' : isDel ? '-' : ' '}
                    </span>
                    <span className="whitespace-pre-wrap break-all">{line.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
