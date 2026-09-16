import React, { useState } from 'react';
import { FolderPlus, X, Code2, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Omit<Project, 'id' | 'updatedAtMillis'>) => void;
}

const LANGUAGES = [
  { label: 'TypeScript / React', value: 'TypeScript' },
  { label: 'JavaScript / Node.js', value: 'JavaScript' },
  { label: 'Python (FastAPI / Scripts)', value: 'Python' },
  { label: 'Kotlin / Android Compose', value: 'Kotlin' },
  { label: 'C / C++', value: 'C++' },
  { label: 'PHP / Laravel', value: 'PHP' },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('TypeScript');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'project';

    onCreate({
      name: name.trim(),
      description: description.trim() || 'Custom development project created in Mobile Harness.',
      language,
      slug,
      rootPath: '',
      kind: 'PROJECT',
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-[#2A3240] flex items-center justify-between bg-[#1B222D]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F28C52]/20 flex items-center justify-center text-[#F28C52]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9AA0A6] hover:text-white p-1 rounded-lg hover:bg-[#2A3240] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
              Project Name <span className="text-[#F28C52]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apollo Dashboard"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#F28C52] placeholder:text-gray-600"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What are you building?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#F28C52] placeholder:text-gray-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9AA0A6] mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#8EA8FF]" /> Language & Stack
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setLanguage(lang.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                    language === lang.value
                      ? 'bg-[#1B222D] border-[#F28C52] text-white font-semibold'
                      : 'bg-[#0B0E14] border-[#2A3240] text-[#9AA0A6] hover:border-[#3A4557]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9AA0A6] hover:text-white border border-[#2A3240] hover:bg-[#2A3240] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
