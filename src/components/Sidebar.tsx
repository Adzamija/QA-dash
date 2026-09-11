import { type Agent, type AgentId } from '../data/agents';

interface SidebarProps {
  agents: Agent[];
  activeAgent: AgentId | 'overview' | 'tokens' | 'settings' | 'history';
  onSelect: (id: AgentId | 'overview' | 'tokens' | 'settings' | 'history') => void;
}

export function Sidebar({ agents, activeAgent, onSelect }: SidebarProps) {
  const tier1 = agents.filter(a => a.tier === 1);
  const tier2 = agents.filter(a => a.tier === 2);
  const tier3 = agents.filter(a => a.tier === 3);

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-screen flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => onSelect('overview')}
          className="flex items-center gap-2 w-full text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            QA
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text">QA Lite</h1>
            <p className="text-[10px] text-text-muted">Simple QA Agents</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        <div>
          <p className="px-2 py-1 text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            Daily Drivers
          </p>
          {tier1.map(agent => (
            <AgentButton
              key={agent.id}
              agent={agent}
              active={activeAgent === agent.id}
              onClick={() => onSelect(agent.id)}
            />
          ))}
        </div>

        <div>
          <p className="px-2 py-1 text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            Live Validation
          </p>
          {tier2.map(agent => (
            <AgentButton
              key={agent.id}
              agent={agent}
              active={activeAgent === agent.id}
              onClick={() => onSelect(agent.id)}
            />
          ))}
        </div>

        <div>
          <p className="px-2 py-1 text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            Advanced
          </p>
          {tier3.map(agent => (
            <AgentButton
              key={agent.id}
              agent={agent}
              active={activeAgent === agent.id}
              onClick={() => onSelect(agent.id)}
            />
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-border space-y-1">
        <button
          onClick={() => onSelect('history')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
            activeAgent === 'history'
              ? 'bg-surface-2 border border-border-hover'
              : 'hover:bg-surface-2/50 border border-transparent'
          }`}
        >
          <span className="text-base flex-shrink-0">📜</span>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-medium truncate ${activeAgent === 'history' ? 'text-text' : 'text-text-muted'}`}>
              History
            </p>
            <p className="text-[10px] text-text-dim truncate">Previous test runs</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('tokens')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
            activeAgent === 'tokens'
              ? 'bg-surface-2 border border-border-hover'
              : 'hover:bg-surface-2/50 border border-transparent'
          }`}
        >
          <span className="text-base flex-shrink-0">🔑</span>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-medium truncate ${activeAgent === 'tokens' ? 'text-text' : 'text-text-muted'}`}>
              API Tokens
            </p>
            <p className="text-[10px] text-text-dim truncate">Manage credentials</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('settings')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
            activeAgent === 'settings'
              ? 'bg-surface-2 border border-border-hover'
              : 'hover:bg-surface-2/50 border border-transparent'
          }`}
        >
          <span className="text-base flex-shrink-0">⚙️</span>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-medium truncate ${activeAgent === 'settings' ? 'text-text' : 'text-text-muted'}`}>
              Settings
            </p>
            <p className="text-[10px] text-text-dim truncate">Users & preferences</p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-text-dim text-center mb-2">
          QA Lite • Local Instance
        </p>
        <a
          href="/download.html"
          target="_blank"
          className="block w-full text-center px-3 py-2 bg-accent/20 text-accent text-xs font-medium rounded-lg hover:bg-accent/30 transition-colors"
        >
          📦 Download ZIP
        </a>
      </div>
    </aside>
  );
}

function AgentButton({ agent, active, onClick }: { agent: Agent; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
        active
          ? 'bg-surface-2 border border-border-hover'
          : 'hover:bg-surface-2/50 border border-transparent'
      }`}
    >
      <span className="text-base flex-shrink-0">{agent.icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-medium truncate ${active ? 'text-text' : 'text-text-muted'}`}>
          {agent.name}
        </p>
        <p className="text-[10px] text-text-dim truncate">{agent.shortDesc}</p>
      </div>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: agent.color }}
      />
    </button>
  );
}
