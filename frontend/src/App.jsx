import React, { useState, useEffect } from 'react';
import TerminalComponent from './TerminalComponent';
import { Plus, Settings, FolderGit2, X, TerminalSquare } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState('Global');
  const [showSettings, setShowSettings] = useState(false);
  const [cloneUrl, setCloneUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [settings, setSettings] = useState({});
  const [showAgy, setShowAgy] = useState(true);
  const [showTmux, setShowTmux] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    fetchSettings();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`${API_BASE}/workspaces`);
      const data = await res.json();
      if (data.workspaces) setWorkspaces(data.workspaces);
    } catch (e) {
      console.error("Failed to fetch workspaces", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      console.error("Failed to fetch settings", e);
    }
  };

  const handleClone = async (e) => {
    e.preventDefault();
    if (!cloneUrl) return;
    setIsCloning(true);
    try {
      const res = await fetch(`${API_BASE}/workspaces/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: cloneUrl })
      });
      const data = await res.json();
      if (data.success) {
        await fetchWorkspaces();
        setCloneUrl('');
        setActiveWorkspace(data.workspace.name);
      } else {
        alert(data.error || "Failed to clone");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
    setIsCloning(false);
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setShowSettings(false);
      }
    } catch (e) {
      alert("Failed to save settings");
    }
  };

  return (
    <div className="flex h-screen w-full bg-casa-darker font-sans text-casa-light overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-casa-dark flex flex-col border-r border-white/5">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-casa-accent to-purple-500 flex items-center justify-center shadow-lg shadow-casa-accent/20">
            <TerminalSquare size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">CasaOS AGY</h1>
            <p className="text-xs text-casa-light/60">AI Workspace Manager</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-casa-light/40 uppercase tracking-wider mb-3 px-2">Main Environment</h2>
            <button
              onClick={() => setActiveWorkspace('Global')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                activeWorkspace === 'Global' 
                  ? 'bg-casa-accent/10 text-casa-accent border border-casa-accent/20' 
                  : 'hover:bg-white/5 text-casa-light/80 border border-transparent'
              }`}
            >
              <TerminalSquare size={18} />
              <span className="font-medium">Global Agent</span>
            </button>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-casa-light/40 uppercase tracking-wider mb-3 px-2">Subrepos</h2>
            <div className="space-y-2">
              {workspaces.map(ws => (
                <button
                  key={ws.name}
                  onClick={() => setActiveWorkspace(ws.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    activeWorkspace === ws.name 
                      ? 'bg-casa-accent/10 text-casa-accent border border-casa-accent/20' 
                      : 'hover:bg-white/5 text-casa-light/80 border border-transparent'
                  }`}
                >
                  <FolderGit2 size={18} />
                  <span className="font-medium truncate">{ws.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 space-y-3">
          <form onSubmit={handleClone} className="relative">
            <input
              type="text"
              placeholder="GitHub URL..."
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-casa-accent/50 focus:ring-1 focus:ring-casa-accent/50 transition-all text-white placeholder-casa-light/30 pr-10"
            />
            <button 
              type="submit" 
              disabled={isCloning}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-casa-light/50 hover:text-casa-accent transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </form>
          
          <button
            onClick={() => setShowSettings(true)}
            className="w-full glass-button py-2.5 text-sm text-casa-light/80 hover:text-white"
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-casa-darker via-casa-darker to-black">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 glass-panel rounded-none border-t-0 border-l-0 border-r-0">
          <div className="flex items-center gap-3 text-white">
            {activeWorkspace === 'Global' ? <TerminalSquare className="text-casa-accent" /> : <FolderGit2 className="text-purple-400" />}
            <h2 className="font-semibold text-lg">{activeWorkspace}</h2>
            {activeWorkspace !== 'Global' && (
              <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-casa-light/70 border border-white/5">Isolated Context</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAgy(!showAgy)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${showAgy ? 'bg-casa-accent/20 border-casa-accent/50 text-casa-accent' : 'border-white/10 text-casa-light/50 hover:bg-white/5'}`}
            >
              AGY
            </button>
            <button
              onClick={() => setShowTmux(!showTmux)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${showTmux ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'border-white/10 text-casa-light/50 hover:bg-white/5'}`}
            >
              Tmux
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-6 relative flex flex-col lg:flex-row gap-4 overflow-hidden">
          <div className={`flex-1 min-h-0 min-w-0 flex-col ${showAgy ? 'flex' : 'hidden'}`}>
            <TerminalComponent key={`agy-${activeWorkspace}`} workspaceName={activeWorkspace} sessionType="agy" />
          </div>
          <div className={`flex-1 min-h-0 min-w-0 flex-col ${showTmux ? 'flex' : 'hidden'}`}>
            <TerminalComponent key={`tmux-${activeWorkspace}`} workspaceName={activeWorkspace} sessionType="tmux" />
          </div>
          {!showAgy && !showTmux && (
            <div className="flex-1 flex items-center justify-center text-casa-light/30">
              <p>No terminals active. Select a terminal to view.</p>
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings size={18} /> Global AGY Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-casa-light/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveSettings} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-casa-light/80 mb-1">Model Name</label>
                <input
                  type="text"
                  value={settings.model || ''}
                  onChange={(e) => setSettings({...settings, model: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-casa-accent/50 text-white"
                  placeholder="e.g. gemini-2.5-pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-casa-light/80 mb-1">API Key</label>
                <input
                  type="password"
                  value={settings.apiKey || ''}
                  onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-casa-accent/50 text-white"
                  placeholder="••••••••••••••••"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-casa-light hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-casa-accent text-casa-darker hover:bg-casa-accent/90 transition-colors shadow-lg shadow-casa-accent/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
