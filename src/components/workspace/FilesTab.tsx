import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Plus,
  Trash2,
  Save,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { WorkspaceEntry } from '../../types';

interface FilesTabProps {
  files: WorkspaceEntry[];
  onSaveFile: (path: string, content: string) => void;
  onCreateFile: (path: string, isDirectory: boolean) => void;
  onDeleteFile: (path: string) => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  files,
  onSaveFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(
    files.find(f => !f.isDirectory)?.path || files[0]?.path || ''
  );
  const [editorContent, setEditorContent] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [newFileInput, setNewFileInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Sync selected file content into editor
  const currentFile = files.find(f => f.path === selectedPath);

  React.useEffect(() => {
    if (currentFile && !currentFile.isDirectory) {
      setEditorContent(currentFile.content || '');
      setIsDirty(false);
    }
  }, [selectedPath, currentFile]);

  const handleSave = () => {
    if (!currentFile || currentFile.isDirectory) return;
    onSaveFile(currentFile.path, editorContent);
    setIsDirty(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileInput.trim()) return;
    onCreateFile(newFileInput.trim(), newFileInput.endsWith('/'));
    setNewFileInput('');
    setIsCreating(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-210px)] max-h-[820px]">
      {/* File Tree Column */}
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl p-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A3240] mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#9AA0A6]">
            <Folder className="w-4 h-4 text-[#F28C52]" /> Project Files
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1.5 rounded-lg bg-[#1B222D] hover:bg-[#2A3240] text-[#8EA8FF] transition border border-[#2A3240]"
            title="Create new file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline file creation */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="mb-3 space-y-2">
            <input
              type="text"
              placeholder="e.g. src/utils.ts"
              value={newFileInput}
              onChange={e => setNewFileInput(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#F28C52] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-[11px] text-[#9AA0A6] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[11px] font-bold bg-[#F28C52] text-black rounded-md"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {/* Tree items */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {files.map(file => {
            const isSelected = file.path === selectedPath;
            return (
              <div
                key={file.path}
                onClick={() => !file.isDirectory && setSelectedPath(file.path)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                  isSelected
                    ? 'bg-[#1B222D] text-[#F28C52] font-semibold border border-[#2A3240]'
                    : 'text-[#9AA0A6] hover:text-white hover:bg-[#1B222D]/50'
                }`}
                style={{ paddingLeft: `${Math.max(10, (file.depth || 0) * 16 + 10)}px` }}
              >
                <div className="flex items-center gap-2 truncate">
                  {file.isDirectory ? (
                    <FolderOpen className="w-3.5 h-3.5 text-[#8EA8FF] shrink-0" />
                  ) : file.name.endsWith('.tsx') || file.name.endsWith('.ts') ? (
                    <FileCode className="w-3.5 h-3.5 text-[#69D69E] shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
                  )}
                  <span className="truncate">{file.name}</span>
                </div>

                {!file.isDirectory && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteFile(file.path);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"
                    title="Delete file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Editor Column */}
      <div className="md:col-span-2 bg-[#131821] border border-[#2A3240] rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Editor Top Bar */}
        <div className="px-4 py-3 border-b border-[#2A3240] flex items-center justify-between bg-[#1B222D]/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-white font-medium">
              {currentFile?.path || 'No file selected'}
            </span>
            {isDirty && (
              <span className="text-[10px] bg-[#F28C52]/20 text-[#F28C52] px-2 py-0.5 rounded-full font-bold">
                Unsaved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showSavedToast && (
              <span className="text-xs text-[#69D69E] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#F28C52]/10"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>

        {/* Textarea Code Body */}
        <div className="flex-1 p-4 bg-[#0B0E14] overflow-hidden flex">
          <textarea
            value={editorContent}
            onChange={e => {
              setEditorContent(e.target.value);
              setIsDirty(true);
            }}
            placeholder="File content..."
            className="w-full h-full bg-transparent text-[#E6EDF3] font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-[#F28C52]/20"
            spellCheck={false}
          />
        </div>

        {/* Editor Footer */}
        <div className="px-4 py-2 border-t border-[#2A3240] bg-[#131821] flex justify-between text-[11px] text-[#9AA0A6] font-mono">
          <span>Lines: {editorContent.split('\n').length}</span>
          <span>Characters: {editorContent.length}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
