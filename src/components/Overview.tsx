import { type Agent, type AgentId } from '../data/agents';

interface OverviewProps {
  agents: Agent[];
  onSelect: (id: AgentId) => void;
}

export function Overview({ agents, onSelect }: OverviewProps) {
  const tier1 = agents.filter(a => a.tier === 1);
  const tier2 = agents.filter(a => a.tier === 2);
  const tier3 = agents.filter(a => a.tier === 3);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">QA Agents Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          8 QA agents for code review, test design, automation, and validation. Pick one and go.
        </p>
      </div>

      {/* Quick Start */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-3">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickCard
            icon="🔍"
            title="Review a PR"
            desc="Compare diff against acceptance criteria"
            onClick={() => onSelect('functional-reviewer')}
          />
          <QuickCard
            icon="📋"
            title="Generate Test Scenarios"
            desc="From user stories or AC"
            onClick={() => onSelect('test-scenario-designer')}
          />
          <QuickCard
            icon="⚡"
            title="Generate Test Code"
            desc="5-phase automation writer"
            onClick={() => onSelect('automation-writer')}
          />
          <QuickCard
            icon="🐛"
            title="Create Bug Reports"
            desc="From QA findings"
            onClick={() => onSelect('bug-reporter')}
          />
        </div>
      </div>

      {/* Tier 1 */}
      <AgentSection
        title="Tier 1 — Core QA Agents"
        subtitle="Functional review, test design, bug reporting"
        agents={tier1}
        onSelect={onSelect}
      />

      {/* Tier 2 */}
      <AgentSection
        title="Tier 2 — Automation & Validation"
        subtitle="Browser testing and code generation"
        agents={tier2}
        onSelect={onSelect}
      />

      {/* Tier 3 */}
      <AgentSection
        title="Tier 3 — Advanced Workflows"
        subtitle="Full pipeline, release analysis, manual testing"
        agents={tier3}
        onSelect={onSelect}
      />

      {/* How It Works */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-3">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-text-muted">
          <div className="space-y-1">
            <p className="font-medium text-text">1. Pick an agent</p>
            <p>Each agent answers one specific QA question. Start with Tier 1.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-text">2. Provide input</p>
            <p>Paste your AC, diff, PR info, or JIRA ticket details.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-text">3. Get structured output</p>
            <p>Markdown report ready for GitHub, JIRA, or TestRail.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-text">4. Use integrations</p>
            <p>Push directly to GitHub, Azure CLI, TestRail, or JIRA via CLI.</p>
          </div>
        </div>
      </div>

      {/* Integrations Overview */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-3">🔗 Available Integrations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <IntegrationCard name="GitHub CLI" command="gh pr view" desc="PR diffs & metadata" />
          <IntegrationCard name="Azure CLI" command="az repos pr" desc="Azure DevOps PRs" />
          <IntegrationCard name="TestRail CLI" command="testrail add-cases" desc="Push test cases" />
          <IntegrationCard name="JIRA CLI" command="jira create" desc="Create bugs & tickets" />
        </div>
      </div>
    </div>
  );
}

function QuickCard({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border hover:border-border-hover transition-colors text-left"
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs font-medium text-text">{title}</p>
        <p className="text-[10px] text-text-muted">{desc}</p>
      </div>
    </button>
  );
}

function AgentSection({ title, subtitle, agents, onSelect }: { title: string; subtitle: string; agents: Agent[]; onSelect: (id: AgentId) => void }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className="p-4 rounded-xl bg-surface border border-border hover:border-border-hover transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{agent.icon}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${agent.color}20`,
                  color: agent.color,
                }}
              >
                {agent.model}
              </span>
            </div>
            <h3 className="text-sm font-medium text-text mb-1 group-hover:text-accent-hover transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">{agent.shortDesc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({ name, command, desc }: { name: string; command: string; desc: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 border border-border">
      <p className="text-xs font-medium text-text mb-1">{name}</p>
      <code className="text-[10px] text-text-muted code-font block mb-1">{command}</code>
      <p className="text-[10px] text-text-dim">{desc}</p>
    </div>
  );
}
