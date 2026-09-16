# Mobile Harness (Web Edition)

An autonomous AI development workspace bridging Claude Code & AI coding agents, Linux terminal execution, project management, and live web previews — ported to modern React and TypeScript.

## Overview

**Mobile Harness** was originally engineered as an Android-native workspace utilizing userspace Linux (PRoot) to run autonomous coding agents like Claude Code directly on mobile devices.

This edition ports the complete Mobile Harness interface and workflows to the **Web (React + Vite + Tailwind CSS)**:
- **Project Management**: Multi-project workspace with quick ad-hoc project generators (`bright-faraday`, `swift-curie`), language badges, and project metadata.
- **Agent Workspace**:
  - **Chat Tab**: Full agentic chat interface supporting streaming tokens, thought summaries, tool calls (`Bash`, `FileEdit`, `GlobTool`), human-in-the-loop approval actions, and session histories.
  - **Files Tab**: Virtual filesystem explorer with tree view, breadcrumbs, multi-language code viewer with line numbers, and file download.
  - **Terminal Tab**: Linux terminal simulator with support for standard command sets (`ls`, `cat`, `node`, `npm`, `git`, `python`, `status`, etc.).
  - **Changes Tab**: Git-style unified diff inspector showing added/removed lines across project modifications.
  - **Preview Tab**: Live responsive iframe preview with device presets (Mobile, Tablet, Desktop), URL bar, refresh, and popout capabilities.
- **Standalone Terminal**: Dedicated shell screen with quick command chips (`node -v`, `git status`, `ls -la`, `claude doctor`).
- **Settings & Security**:
  - Provider management supporting Claude Code, Anthropic API, Moonshot Kimi, DeepSeek, OpenRouter, and custom endpoints.
  - Key vault with local persistence and masked token display.
  - Development stacks setup manager (Web, Python, Android, PHP).
  - Data management (export JSON backup, reset workspace).

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom dark palette (`#0B0E14`, `#151B23`, `#F28C52` accent)
- **Icons**: Lucide React
- **Animations**: Motion (`motion/react`)
- **Persistence**: Virtualized filesystem and state engine in browser storage (`localStorage`)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application runs on `http://localhost:3000`.
