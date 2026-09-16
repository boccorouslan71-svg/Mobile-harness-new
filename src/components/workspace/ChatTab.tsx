import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Terminal,
  FileCode,
  ShieldAlert,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Check,
  BrainCircuit,
  Eye,
} from 'lucide-react';
import { ChatMessage, ToolRequest, Project, ActivityItem } from '../../types';

interface ChatTabProps {
  project: Project;
  messages: ChatMessage[];
  pendingApproval: ToolRequest | null;
  isRunning: boolean;
  onSendMessage: (text: string, attachments?: File[]) => void;
  onApproveTool: (approvalId: string) => void;
  onRejectTool: (approvalId: string) => void;
  onStopAgent: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  project,
  messages,
  pendingApproval,
  isRunning,
  onSendMessage,
  onApproveTool,
  onRejectTool,
  onStopAgent,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingApproval, isRunning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    `Run build & check for errors`,
    `Inspect package.json and dependencies`,
    `Optimize performance and layout`,
    `Scaffold test suite`,
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] max-h-[820px] bg-[#0B0E14] rounded-2xl border border-[#2A3240] overflow-hidden">
      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.fromUser;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border text-xs font-bold ${
                  isUser
                    ? 'bg-[#8EA8FF]/20 text-[#8EA8FF] border-[#8EA8FF]/30'
                    : 'bg-[#F28C52]/20 text-[#F28C52] border-[#F28C52]/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-3 ${
                  isUser
                    ? 'bg-[#1B222D] text-white border border-[#2A3240]'
                    : 'bg-[#131821] text-[#E6EDF3] border border-[#2A3240]'
                }`}
              >
                {/* Thinking section if present */}
                {msg.thinkingSummary && (
                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#2A3240] text-xs font-mono text-[#8EA8FF] flex items-start gap-2">
                    <BrainCircuit className="w-4 h-4 shrink-0 text-[#8EA8FF] mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Reasoning Process:</span>
                      <p className="text-[11px] text-[#9AA0A6] mt-0.5">{msg.thinkingSummary}</p>
                    </div>
                  </div>
                )}

                {/* Main text */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
                  {msg.text}
                </div>

                {/* Work items / tool logs */}
                {msg.workItems && msg.workItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#2A3240]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6]">
                      Actions Taken
                    </span>
                    {msg.workItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[#0B0E14] border border-[#2A3240]/70 text-xs"
                      >
                        {item.isCommand ? (
                          <Terminal className="w-3.5 h-3.5 text-[#F28C52]" />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-[#69D69E]" />
                        )}
                        <span className="font-medium text-white">{item.title}:</span>
                        <span className="font-mono text-[#9AA0A6] text-[11px] truncate">{item.detail}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#69D69E] ml-auto shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[10px] text-[#9AA0A6] pt-1">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => copyText(msg.id, msg.text)}
                    className="flex items-center gap-1 hover:text-white transition"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-[#69D69E]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Running Indicator */}
        {isRunning && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F28C52]/20 text-[#F28C52] border border-[#F28C52]/30 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#131821] border border-[#F28C52]/40 rounded-2xl p-4 text-xs space-y-2 max-w-[85%]">
              <div className="flex items-center gap-2 text-[#F28C52]">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="font-bold">Autonomous Agent working...</span>
              </div>
              <p className="text-[#9AA0A6] font-mono text-[11px]">
                Reasoning through workspace files & executing requested PRoot tools
              </p>
              <button
                onClick={onStopAgent}
                className="mt-2 text-[11px] font-semibold px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition"
              >
                Stop Execution
              </button>
            </div>
          </div>
        )}

        {/* Pending Tool Approval Card */}
        {pendingApproval && (
          <div className="p-4 rounded-2xl bg-[#1B222D] border-2 border-[#F28C52] shadow-xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F28C52]" />
                <span className="font-bold text-sm text-white">Permission Required</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pendingApproval.risk === 'HIGH'
                    ? 'bg-red-500/20 text-red-400'
                    : pendingApproval.risk === 'REVIEW'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {pendingApproval.risk} RISK
              </span>
            </div>

            <p className="text-xs text-[#9AA0A6]">{pendingApproval.explanation}</p>

            {pendingApproval.commandPreview && (
              <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#2A3240] font-mono text-xs text-[#69D69E] flex items-center justify-between">
                <code>$ {pendingApproval.commandPreview}</code>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                onClick={() => onRejectTool(pendingApproval.approvalId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/30 transition"
              >
                Reject Tool
              </button>
              <button
                onClick={() => onApproveTool(pendingApproval.approvalId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition"
              >
                Approve & Execute
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-[#131821] border-t border-[#2A3240] flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase text-[#9AA0A6] shrink-0">Suggestions:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(p)}
            disabled={isRunning}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#0B0E14] hover:bg-[#1B222D] border border-[#2A3240] text-[#9AA0A6] hover:text-white transition disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-[#131821] border-t border-[#2A3240] flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              onSendMessage(`Attached file: ${file.name}`, [file]);
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#2A3240] text-[#9AA0A6] hover:text-white transition"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={`Instruct AI agent in ${project.name}...`}
          className="flex-1 bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F28C52] resize-none max-h-24 placeholder:text-gray-600"
        />

        <button
          type="submit"
          disabled={!input.trim() || isRunning}
          className="p-2.5 rounded-xl bg-[#F28C52] text-black font-bold hover:bg-[#ff9c68] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F28C52]/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
