import React, { useState } from 'react';
import {
  Folder,
  Zap,
  Plus,
  Search,
  Clock,
  Trash2,
  ExternalLink,
  Code2,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsScreenProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onNewProject: () => void;
  onQuickProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

function formatRelativeTime(millis: number): string {
  const diff = Date.now() - millis;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff < 0 || seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(millis).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onQuickProject,
  onDeleteProject,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PROJECT' | 'QUICK_PROJECT'>('ALL');

  const filtered = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.language.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'ALL' || p.kind === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-[#F28C52]" /> Workspace Projects
          </h2>
          <p className="text-xs text-[#9AA0A6] mt-0.5">
            Isolated sessions managed in ARM64 PRoot Ubuntu sandbox with Claude Code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onQuickProject}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1B222D] hover:bg-[#252E3E] text-[#8EA8FF] border border-[#2A3240] transition active:scale-95"
            title="Instantly generate an ad-hoc session with a scientist/pioneer codename"
          >
            <Zap className="w-3.5 h-3.5 text-[#8EA8FF]" /> Quick Chat
          </button>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition shadow-lg shadow-[#F28C52]/10 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#131821] p-2.5 rounded-2xl border border-[#2A3240]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0A6]" />
          <input
            type="text"
            placeholder="Search projects, files, or languages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F28C52]"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filter === 'ALL'
                ? 'bg-[#1B222D] text-white border border-[#2A3240]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilter('PROJECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filter === 'PROJECT'
                ? 'bg-[#1B222D] text-white border border-[#2A3240]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setFilter('QUICK_PROJECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filter === 'QUICK_PROJECT'
                ? 'bg-[#1B222D] text-white border border-[#2A3240]'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            Quick Chats
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-[#2A3240] rounded-2xl bg-[#131821]/40">
          <div className="w-12 h-12 rounded-2xl bg-[#1B222D] flex items-center justify-center mx-auto text-[#9AA0A6] mb-3 border border-[#2A3240]">
            <Folder className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No projects found</h3>
          <p className="text-xs text-[#9AA0A6] max-w-sm mx-auto mb-5">
            {search
              ? 'No projects matched your search query. Try searching with different keywords.'
              : 'Create your first autonomous project or launch an instant quick chat session.'}
          </p>
          <button
            onClick={onQuickProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition"
          >
            <Sparkles className="w-4 h-4" /> Start Quick Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => {
            const isQuick = project.kind === 'QUICK_PROJECT';

            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project)}
                className="group relative bg-[#131821] hover:bg-[#161C26] border border-[#2A3240] hover:border-[#384355] rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isQuick
                            ? 'bg-[#8EA8FF]/15 text-[#8EA8FF] border-[#8EA8FF]/30'
                            : 'bg-[#F28C52]/15 text-[#F28C52] border-[#F28C52]/30'
                        }`}
                      >
                        {isQuick ? <Zap className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-[#F28C52] transition truncate max-w-[170px]">
                          {project.name}
                        </h4>
                        <span className="font-mono text-[11px] text-[#9AA0A6]">
                          /{project.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isQuick
                            ? 'bg-[#8EA8FF]/15 text-[#8EA8FF]'
                            : 'bg-[#69D69E]/15 text-[#69D69E]'
                        }`}
                      >
                        {isQuick ? 'Quick Chat' : project.language || 'Code'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#9AA0A6] line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#2A3240]/60 flex items-center justify-between text-[11px] text-[#9AA0A6]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatRelativeTime(project.updatedAtMillis)}</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 rounded-lg text-[#9AA0A6] hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenProject(project)}
                      className="p-1.5 rounded-lg text-[#9AA0A6] hover:text-[#F28C52] hover:bg-[#F28C52]/10 transition"
                      title="Open workspace"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
