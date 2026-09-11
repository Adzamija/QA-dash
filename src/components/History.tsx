import { useState } from 'react';
import { useTestHistory, type TestRun } from '../contexts/TestHistoryContext';
import { agents } from '../data/agents';

export function History() {
  const { testRuns, deleteTestRun, clearHistory } = useTestHistory();
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>('all');

  const filteredRuns = filterAgent === 'all' 
    ? testRuns 
    : testRuns.filter(run => run.agentId === filterAgent);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAgentIcon = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.icon || '🔍';
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Test History</h1>
          <p className="text-sm text-text-muted mt-1">
            View and manage your previous test runs
          </p>
        </div>
        {testRuns.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure? This will delete all test history.')) {
                clearHistory();
              }
            }}
            className="px-4 py-2 bg-danger/20 text-danger text-xs font-medium rounded-lg hover:bg-danger/30 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-text">Filter by agent:</label>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs text-text focus:outline-none focus:border-accent"
          >
            <option value="all">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.icon} {agent.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-text-muted ml-auto">
            {filteredRuns.length} test{filteredRuns.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Test Runs List */}
      {filteredRuns.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm text-text-muted">No test runs yet</p>
          <p className="text-xs text-text-dim mt-1">
            Run some tests and they will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRuns.map((run) => (
            <div
              key={run.id}
              className="bg-surface border border-border rounded-xl p-4 hover:border-border-hover transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{getAgentIcon(run.agentId)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-text">{run.agentName}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      run.status === 'success' 
                        ? 'bg-success/20 text-success border border-success/30' 
                        : 'bg-danger/20 text-danger border border-danger/30'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{formatDate(run.timestamp)}</p>
                  <p className="text-xs text-text-dim line-clamp-2">
                    {run.input.substring(0, 150)}...
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRun(run)}
                    className="px-3 py-1.5 bg-accent/20 text-accent text-xs font-medium rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this test run?')) {
                        deleteTestRun(run.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-surface-2 border border-border text-text-muted text-xs rounded-lg hover:bg-surface hover:text-text transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing test run */}
      {selectedRun && (
        <div className="fixed inset-0 bg-bg/80 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getAgentIcon(selectedRun.agentId)}</span>
                <div>
                  <h2 className="text-sm font-semibold text-text">{selectedRun.agentName}</h2>
                  <p className="text-xs text-text-muted">{formatDate(selectedRun.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="text-text-muted hover:text-text transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-text mb-2">Input</h3>
                <pre className="text-xs text-text-muted bg-surface-2 border border-border rounded-lg p-4 overflow-x-auto code-font whitespace-pre-wrap">
                  {selectedRun.input}
                </pre>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-text mb-2">Output</h3>
                <pre className="text-xs text-text bg-surface-2 border border-border rounded-lg p-4 overflow-x-auto code-font whitespace-pre-wrap">
                  {selectedRun.output}
                </pre>
              </div>

              {selectedRun.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-text mb-2">Notes</h3>
                  <p className="text-xs text-text-muted">{selectedRun.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedRun.output);
                  alert('Output copied to clipboard');
                }}
                className="px-4 py-2 bg-accent/20 text-accent text-xs font-medium rounded-lg hover:bg-accent/30 transition-colors"
              >
                Copy Output
              </button>
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 bg-surface-2 border border-border text-text text-xs font-medium rounded-lg hover:bg-surface transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
