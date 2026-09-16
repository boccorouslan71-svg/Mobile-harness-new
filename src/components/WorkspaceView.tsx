import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Folder,
  Terminal,
  Code,
  Globe,
  Play,
  Plus,
  ChevronDown,
  Check,
  RotateCw,
  FolderGit2,
} from 'lucide-react';
import {
  Project,
  WorkspaceTab,
  ProjectChat,
  ChatMessage,
  WorkspaceEntry,
  ChangeItem,
  ToolRequest,
  ProviderProfile,
} from '../types';
import { ChatTab } from './workspace/ChatTab';
import { FilesTab } from './workspace/FilesTab';
import { TerminalTab } from './workspace/TerminalTab';
import { ChangesTab } from './workspace/ChangesTab';
import { PreviewTab } from './workspace/PreviewTab';
import { runAgentTask } from '../services/agentRunner';

interface WorkspaceViewProps {
  project: Project;
  chats: ProjectChat[];
  activeChatId: string;
  files: WorkspaceEntry[];
  messages: ChatMessage[];
  provider: ProviderProfile;
  onBack: () => void;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onUpdateFiles: (files: WorkspaceEntry[]) => void;
  onUpdateMessages: (chatId: string, messages: ChatMessage[]) => void;
  onRunBuild: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  project,
  chats,
  activeChatId,
  files,
  messages,
  provider,
  onBack,
  onSelectChat,
  onCreateChat,
  onUpdateFiles,
  onUpdateMessages,
  onRunBuild,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('CHAT');
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [pendingApproval, setPendingApproval] = useState<ToolRequest | null>(null);
  const [approvalResolver, setApprovalResolver] = useState<((approved: boolean) => void) | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSendMessage = async (text: string) => {
    if (isRunning) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      fromUser: true,
      text,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    onUpdateMessages(activeChatId, newMessages);

    setIsRunning(true);

    try {
      const result = await runAgentTask(
        text,
        project,
        files,
        provider,
        {
          onToolApproval: async (req: ToolRequest) => {
            setPendingApproval(req);
            return new Promise<boolean>((resolve) => {
              setApprovalResolver(() => resolve);
            });
          },
          onFilesChanged: (newChanges) => {
            setChanges(prev => [...newChanges, ...prev]);
          },
          onPreviewReady: () => {
            // Can notify or flash preview tab
          },
        }
      );

      const assistantMessage: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        fromUser: false,
        text: result.reply,
        createdAt: new Date().toISOString(),
        workItems: [
          { title: 'Workspace Scan', detail: 'Analyzed directory tree', isComplete: true, isCommand: false },
          { title: 'Code Synthesis', detail: `Model: ${provider.kind}`, isComplete: true, isCommand: false },
        ],
      };

      onUpdateMessages(activeChatId, [...newMessages, assistantMessage]);
      onUpdateFiles(result.updatedFiles);
    } catch (err: unknown) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        fromUser: false,
        text: `Error during execution: ${(err as Error).message}`,
        createdAt: new Date().toISOString(),
      };
      onUpdateMessages(activeChatId, [...newMessages, errorMessage]);
    } finally {
      setIsRunning(false);
      setPendingApproval(null);
      setApprovalResolver(null);
    }
  };

  const handleApproveTool = () => {
    if (approvalResolver) {
      approvalResolver(true);
      setPendingApproval(null);
      setApprovalResolver(null);
    }
  };

  const handleRejectTool = () => {
    if (approvalResolver) {
      approvalResolver(false);
      setPendingApproval(null);
      setApprovalResolver(null);
    }
  };

  const handleSaveFile = (path: string, content: string) => {
    const updated = files.map(f => (f.path === path ? { ...f, content, sizeBytes: content.length } : f));
    onUpdateFiles(updated);
  };

  const handleCreateFile = (path: string, isDirectory: boolean) => {
    const name = path.split('/').filter(Boolean).pop() || path;
    const depth = path.split('/').filter(Boolean).length - 1;
    const newEntry: WorkspaceEntry = {
      path,
      name,
      isDirectory,
      depth: Math.max(0, depth),
      sizeBytes: isDirectory ? 0 : 24,
      content: isDirectory ? undefined : `// ${name}\n`,
    };
    onUpdateFiles([...files, newEntry]);
  };

  const handleDeleteFile = (path: string) => {
    onUpdateFiles(files.filter(f => f.path !== path));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131821] p-3 sm:px-4 sm:py-3 rounded-2xl border border-[#2A3240] shadow-sm">
        {/* Left: Back & Project Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#0B0E14] border border-[#2A3240] text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] transition active:scale-95"
            title="Back to all projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{project.name}</h2>
              <span className="text-[10px] bg-[#8EA8FF]/15 text-[#8EA8FF] px-2 py-0.5 rounded-full font-mono">
                {project.language}
              </span>
            </div>
            <span className="font-mono text-xs text-[#9AA0A6]">
              ~/workspace/{project.slug}
            </span>
          </div>
        </div>

        {/* Right: Chat switcher & Build/Run button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Chat Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowChatMenu(!showChatMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0E14] border border-[#2A3240] text-xs font-semibold text-[#9AA0A6] hover:text-white transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F28C52]" />
              <span className="max-w-[120px] truncate">{activeChat?.title || 'Chat'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showChatMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#1B222D] border border-[#2A3240] rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6] border-b border-[#2A3240]">
                  Session Threads
                </div>
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      setShowChatMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#2A3240] flex items-center justify-between transition"
                  >
                    <span className="truncate">{chat.title}</span>
                    {chat.id === activeChatId && <Check className="w-3.5 h-3.5 text-[#F28C52]" />}
                  </button>
                ))}
                <div className="border-t border-[#2A3240] mt-1 pt-1">
                  <button
                    onClick={() => {
                      onCreateChat();
                      setShowChatMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#F28C52] hover:bg-[#2A3240] flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Chat Thread
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Build & Run Action */}
          <button
            onClick={onRunBuild}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition active:scale-95 shadow-md shadow-[#F28C52]/15"
            title="Execute build or start dev server"
          >
            <Play className="w-3.5 h-3.5 fill-black" /> Run / Build
          </button>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex items-center gap-1 bg-[#131821] p-1.5 rounded-2xl border border-[#2A3240] overflow-x-auto">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'CHAT'
              ? 'bg-[#1B222D] text-[#F28C52] border border-[#2A3240] shadow-sm'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Chat
        </button>

        <button
          onClick={() => setActiveTab('FILES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'FILES'
              ? 'bg-[#1B222D] text-[#8EA8FF] border border-[#2A3240] shadow-sm'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Folder className="w-4 h-4" /> Files ({files.length})
        </button>

        <button
          onClick={() => setActiveTab('TERMINAL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'TERMINAL'
              ? 'bg-[#1B222D] text-[#69D69E] border border-[#2A3240] shadow-sm'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" /> Terminal
        </button>

        <button
          onClick={() => setActiveTab('CHANGES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'CHANGES'
              ? 'bg-[#1B222D] text-yellow-400 border border-[#2A3240] shadow-sm'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" /> Changes
          {changes.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'PREVIEW'
              ? 'bg-[#1B222D] text-[#8EA8FF] border border-[#2A3240] shadow-sm'
              : 'text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" /> Preview
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'CHAT' && (
        <ChatTab
          project={project}
          messages={messages}
          pendingApproval={pendingApproval}
          isRunning={isRunning}
          onSendMessage={handleSendMessage}
          onApproveTool={handleApproveTool}
          onRejectTool={handleRejectTool}
          onStopAgent={() => setIsRunning(false)}
        />
      )}

      {activeTab === 'FILES' && (
        <FilesTab
          files={files}
          onSaveFile={handleSaveFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
        />
      )}

      {activeTab === 'TERMINAL' && (
        <TerminalTab
          projectSlug={project.slug}
          files={files}
        />
      )}

      {activeTab === 'CHANGES' && (
        <ChangesTab
          changes={changes}
          onAcceptAll={() => setChanges([])}
          onRevertAll={() => setChanges([])}
          onAcceptChange={(path) => setChanges(changes.filter(c => c.path !== path))}
          onRejectChange={(path) => setChanges(changes.filter(c => c.path !== path))}
        />
      )}

      {activeTab === 'PREVIEW' && (
        <PreviewTab
          project={project}
          files={files}
        />
      )}
    </div>
  );
};
