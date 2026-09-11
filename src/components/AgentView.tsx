import { useState } from 'react';
import { type Agent } from '../data/agents';
import { useAuth } from '../contexts/AuthContext';
import { useTestHistory } from '../contexts/TestHistoryContext';

interface AgentViewProps {
  agent: Agent;
}

type Status = 'idle' | 'running' | 'done';

export function AgentView({ agent }: AgentViewProps) {
  const { user } = useAuth();
  const { addTestRun } = useTestHistory();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [output, setOutput] = useState('');
  const [showExample, setShowExample] = useState(false);

  const handleRun = () => {
    if (!input.trim()) return;
    setStatus('running');
    setOutput('');

    // Simulate agent processing
    setTimeout(() => {
      setOutput(agent.outputExample);
      setStatus('done');

      // Save to test history
      if (user) {
        addTestRun({
          agentId: agent.id,
          agentName: agent.name,
          input,
          output: agent.outputExample,
          userId: user.id,
          status: 'success',
        });
      }
    }, 1500);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setStatus('idle');
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {/* Agent Header */}
      <div className="flex items-start gap-4">
        <span className="text-4xl">{agent.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text">{agent.name}</h1>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${agent.color}20`,
                color: agent.color,
              }}
            >
              {agent.model}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">
              Tier {agent.tier}
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">{agent.description}</p>
          
          {/* Integrations */}
          {agent.integrations && agent.integrations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {agent.integrations.map((integration, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border">
                  <span className="text-[10px] text-text-muted">{integration.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Phases */}
          {agent.phases && agent.phases.length > 0 && (
            <div className="mt-3 space-y-1">
              {agent.phases.map((phase, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-text-muted font-mono">{idx + 1}.</span>
                  <div>
                    <span className="text-text font-medium">{phase.name}</span>
                    <span className="text-text-muted ml-2">— {phase.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-semibold text-text">{agent.input.label}</h2>
            <button
              onClick={() => setShowExample(!showExample)}
              className="text-[10px] text-text-muted hover:text-text transition-colors"
            >
              {showExample ? 'Hide example' : 'Show example'}
            </button>
          </div>

          {showExample && (
            <div className="px-4 py-2 bg-surface-2 border-b border-border">
              <p className="text-[10px] text-text-dim mb-1">Example input:</p>
              <pre className="text-[10px] text-text-muted code-font whitespace-pre-wrap">
                {agent.input.placeholder}
              </pre>
            </div>
          )}

          <div className="flex-1 p-4">
            {agent.input.type === 'textarea' ? (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={agent.input.placeholder}
                className="w-full h-64 bg-transparent text-sm text-text placeholder:text-text-dim resize-none focus:outline-none code-font"
                disabled={status === 'running'}
              />
            ) : (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={agent.input.placeholder}
                className="w-full bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
                disabled={status === 'running'}
              />
            )}
          </div>

          <div className="px-4 py-3 border-t border-border flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={!input.trim() || status === 'running'}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              {status === 'running' ? 'Processing...' : 'Run Agent'}
            </button>
            {(output || input) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text border border-border hover:border-border-hover transition-colors"
              >
                Reset
              </button>
            )}
            {status === 'running' && (
              <span className="text-[10px] text-text-muted ml-auto animate-pulse">
                Analyzing...
              </span>
            )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-semibold text-text">Output</h2>
            {output && (
              <button
                onClick={handleCopyOutput}
                className="text-[10px] text-text-muted hover:text-text transition-colors"
              >
                Copy
              </button>
            )}
          </div>

          <div className="flex-1 p-4 min-h-[300px]">
            {status === 'idle' && !output && (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-text-dim text-center">
                  Run the agent to see output here
                </p>
              </div>
            )}

            {status === 'running' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-text-muted">Processing with {agent.model}...</p>
                </div>
              </div>
            )}

            {status === 'done' && output && (
              <pre className="text-xs text-text code-font whitespace-pre-wrap leading-relaxed">
                {output}
              </pre>
            )}
          </div>

          {status === 'done' && output && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-[10px] text-text-muted">
                  Report generated • Ready to paste into GitHub/Jira
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integrations */}
      {agent.integrations && agent.integrations.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-text mb-3">🔗 Available Integrations</h3>
          <div className="space-y-2">
            {agent.integrations.map((integration, idx) => (
              <div key={idx} className="bg-surface-2 border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text">{integration.name}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(integration.command)}
                    className="text-[10px] text-text-muted hover:text-text transition-colors"
                  >
                    Copy command
                  </button>
                </div>
                <code className="text-[10px] text-text-muted code-font block mb-1">{integration.command}</code>
                <p className="text-[10px] text-text-dim">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-text mb-2">💡 Tips</h3>
        <ul className="space-y-1 text-[11px] text-text-muted">
          <li>• Paste acceptance criteria from Jira, Linear, or your ticket system</li>
          <li>• Include relevant code diffs for context</li>
          <li>• Output is Markdown — paste directly into PR comments or issues</li>
          <li>• Chain agents: use output from one as input to another</li>
          <li>• Use integrations to push results directly to external tools</li>
        </ul>
      </div>
    </div>
  );
}
