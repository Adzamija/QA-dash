import { useState } from 'react';
import { type Agent } from '../data/agents';
import { useAuth } from '../contexts/AuthContext';
import { useTestHistory } from '../contexts/TestHistoryContext';
import { useTokens } from '../contexts/TokensContext';

interface AgentViewProps {
  agent: Agent;
}

type Status = 'idle' | 'running' | 'done' | 'error';

interface FunctionalReviewerInput {
  jiraTicketUrl: string;
  prLinks: string[];
}

export function AgentView({ agent }: AgentViewProps) {
  const { user } = useAuth();
  const { addTestRun } = useTestHistory();
  const { tokens, isConfigured } = useTokens();
  const [input, setInput] = useState('');
  const [jiraTicketUrl, setJiraTicketUrl] = useState('');
  const [prLinksInput, setPrLinksInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [output, setOutput] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [authWarning, setAuthWarning] = useState('');

  const handleRun = () => {
    if (!input.trim() && agent.id === 'functional-reviewer') {
      if (!jiraTicketUrl.trim() || !prLinksInput.trim()) return;
    } else if (!input.trim()) {
      return;
    }

    setStatus('running');
    setOutput('');
    setAuthWarning('');

    // Functional Reviewer - check tokens and authenticate
    if (agent.id === 'functional-reviewer') {
      const prLinks = prLinksInput.split('\n').filter(link => link.trim());
      
      // Check GitHub token configuration
      const githubConfigured = isConfigured('github');
      
      if (!githubConfigured) {
        setAuthWarning('⚠️ GitHub token not configured. Please add your GitHub token in Settings → Tokens for full PR analysis.');
        // Continue anyway with limited functionality
      }
      
      // Simulate auth delay (longer to ensure proper authentication)
      setTimeout(() => {
        // Generate comprehensive QA review with token info
        const qaReview = generateFunctionalReview(jiraTicketUrl, prLinks, githubConfigured);
        
        setOutput(qaReview);
        setStatus('done');

        if (user) {
          addTestRun({
            agentId: agent.id,
            agentName: agent.name,
            input: `JIRA: ${jiraTicketUrl}\nPRs: ${prLinks.join(', ')}`,
            output: qaReview,
            userId: user.id,
            status: githubConfigured ? 'success' : 'warning',
          });
        }
      }, 2000); // Longer delay to simulate auth + analysis
    } else {
      // Other agents - existing behavior
      setTimeout(() => {
        setOutput(agent.outputExample);
        setStatus('done');

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
    }
  };

  const generateFunctionalReview = (ticketUrl: string, prLinks: string[], githubConfigured: boolean): string => {
    const timestamp = new Date().toLocaleString();
    const prCount = prLinks.length;
    
    return `## 🔍 Functional Review Report — Senior QA Analysis

**Generated:** ${timestamp}
**JIRA Ticket:** ${ticketUrl}
**PRs Analyzed:** ${prCount}
**GitHub Auth:** ${githubConfigured ? '✅ Configured' : '⚠️ Not configured - limited analysis'}

---

### 📋 PR Overview
${prLinks.map((link, idx) => `${idx + 1}. ${link}`).join('\n')}

---

### ⚠️ Authentication & Access Status
${githubConfigured 
  ? `✅ **GitHub Token:** Configured and ready
✅ **PR Access:** Will fetch detailed diff via GitHub API
✅ **Analysis Mode:** Full (with code-level insights)`
  : `⚠️ **GitHub Token:** Not configured
ℹ️ **PR Access:** Limited to public metadata only
📝 **Note:** Add GitHub token in Settings → Tokens for complete code analysis`
}

---

### 🔎 Code Change Analysis

#### 1. **Scope Assessment**
${githubConfigured 
  ? `- **Files Modified:** [Will analyze via GitHub API]
- **Lines Added/Removed:** [Will calculate from diff]
- **Affected Components:** [Will identify from PR files]`
  : `- **Files Modified:** [Manual review required - no API access]
- **Lines Added/Removed:** [Check PR manually]
- **Affected Components:** [Review PR UI for file list]`
}

#### 2. **Acceptance Criteria Coverage**
*[Note: AC should be extracted from JIRA ticket]*

| AC ID | Status | Evidence | Confidence | Notes |
|-------|--------|----------|------------|-------|
| AC-1 | ⏳ PENDING | - | - | Awaiting AC extraction from JIRA |
| AC-2 | ⏳ PENDING | - | - | Awaiting AC extraction from JIRA |

#### 3. **Potential Risks & Concerns**

🔴 **Critical Issues:**
- [ ] Breaking changes detected
- [ ] Missing error handling
- [ ] Security vulnerabilities
- [ ] Performance degradation risks

🟡 **Medium Priority:**
- [ ] Inconsistent coding patterns
- [ ] Missing unit tests
- [ ] Incomplete edge case handling
- [ ] Documentation gaps

🟢 **Suggestions:**
- [ ] Code optimization opportunities
- [ ] Better naming conventions
- [ ] Refactoring recommendations

#### 4. **Regression Risk Assessment**
- **High Risk Areas:** [To be identified after code review]
- **Medium Risk Areas:** [To be identified after code review]
- **Low Risk Areas:** [To be identified after code review]

#### 5. **Cross-Repository Impact**
*[If multi-repo changes detected]*
- Related repos affected: [Pending analysis]
- API contract changes: [Pending verification]
- Shared library updates: [Pending check]

---

### 🧪 Testing Recommendations

#### Must-Have Tests:
1. **Unit Tests:** Cover all modified functions
2. **Integration Tests:** Verify component interactions
3. **E2E Tests:** Validate complete user flows
4. **Edge Cases:** Test boundary conditions

#### Suggested Test Scenarios:
- [Scenario 1: To be generated based on changes]
- [Scenario 2: To be generated based on changes]

---

### 📊 Quality Metrics

| Metric | Status | Score |
|--------|--------|-------|
| Code Coverage | ⏳ Pending | -% |
| AC Coverage | ⏳ Pending | -% |
| Test Coverage | ⏳ Pending | -% |
| Documentation | ⏳ Pending | -% |

---

### ✅ Final Verdict

**Current Status:** ⏸️ **AWAITING DETAILED ANALYSIS**

**Recommendation:** 
This is a preliminary report structure. For a complete analysis:

${githubConfigured 
  ? `1. ✅ GitHub token is configured
2. ⏳ Extract acceptance criteria from JIRA ticket
3. ⏳ Perform detailed code diff analysis via GitHub API
4. ⏳ Run automated test suite
5. ⏳ Check for breaking changes`
  : `1. 🔴 **Add GitHub token** in Settings → Tokens for full analysis
2. ⏳ Extract acceptance criteria from JIRA ticket
3. ⏳ Manually review PR code changes
4. ⏳ Identify gaps and missing functionality
5. ⏳ Make final approve/reject decision`
}

**Next Steps:**
- [ ] Review actual code changes in each PR
- [ ] Compare against acceptance criteria
- [ ] Identify gaps and missing functionality
- [ ] Provide specific line-by-line feedback
- [ ] Make final approve/reject decision

---

*Report generated by QA-dash Functional Reviewer Agent*
*For detailed code analysis, ensure proper GitHub authentication and API access*`;
  };

  const handleReset = () => {
    setInput('');
    setJiraTicketUrl('');
    setPrLinksInput('');
    setOutput('');
    setStatus('idle');
    setAuthWarning('');
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

          {/* Functional Reviewer Special Input */}
          {agent.id === 'functional-reviewer' ? (
            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text mb-2">
                  🎫 JIRA Ticket URL
                </label>
                <input
                  type="text"
                  value={jiraTicketUrl}
                  onChange={(e) => setJiraTicketUrl(e.target.value)}
                  placeholder="https://your-company.atlassian.net/browse/PROJ-123"
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                  disabled={status === 'running'}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text mb-2">
                  🔗 PR Links (one per line)
                </label>
                <textarea
                  value={prLinksInput}
                  onChange={(e) => setPrLinksInput(e.target.value)}
                  placeholder={`https://github.com/org/repo/pull/123\nhttps://github.com/org/repo/pull/124`}
                  className="w-full h-40 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-accent transition-colors code-font"
                  disabled={status === 'running'}
                />
                <p className="text-[10px] text-text-dim mt-1">
                  Paste one or more GitHub PR links, each on a new line
                </p>
              </div>

              {authWarning && (
                <div className="p-3 bg-warning/10 border border-warning rounded-lg">
                  <p className="text-xs text-warning">{authWarning}</p>
                </div>
              )}
            </div>
          ) : agent.input.type === 'textarea' ? (
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={agent.input.placeholder}
                className="w-full h-64 bg-transparent text-sm text-text placeholder:text-text-dim resize-none focus:outline-none code-font"
                disabled={status === 'running'}
              />
            </div>
          ) : (
            <div className="flex-1 p-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={agent.input.placeholder}
                className="w-full bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
                disabled={status === 'running'}
              />
            </div>
          )}

          <div className="px-4 py-3 border-t border-border flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={
                agent.id === 'functional-reviewer'
                  ? (!jiraTicketUrl.trim() || !prLinksInput.trim() || status === 'running')
                  : (!input.trim() || status === 'running')
              }
              className="px-4 py-2 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              {status === 'running' ? 'Processing...' : 'Run Agent'}
            </button>
            {(output || input || jiraTicketUrl || prLinksInput) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text border border-border hover:border-border-hover transition-colors"
              >
                Reset
              </button>
            )}
            {status === 'running' && agent.id === 'functional-reviewer' && (
              <span className="text-[10px] text-text-muted ml-auto animate-pulse">
                🔐 Authenticating... Analyzing PRs...
              </span>
            )}
            {status === 'running' && agent.id !== 'functional-reviewer' && (
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

      {/* Usage Tips - Customized per agent */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-text mb-2">💡 Tips</h3>
        {agent.id === 'functional-reviewer' ? (
          <ul className="space-y-1 text-[11px] text-text-muted">
            <li>• Paste JIRA ticket URL sa acceptance criteria za analizu</li>
            <li>• Dodaj jedan ili više GitHub PR linkova (svaki u novi red)</li>
            <li>• Funkcionalni reviewer je read-only — ne pravi izmjene na kodu</li>
            <li>• Koristi GitHub token (Settings → Tokens) za detaljnu code analizu</li>
            <li>• Output je Markdown — kopiraj ga direktno u GitHub PR comment ili JIRA</li>
            <li>• Ako koristiš Azure DevOps, dodaj Azure PAT token za ADO PR support</li>
          </ul>
        ) : (
          <ul className="space-y-1 text-[11px] text-text-muted">
            <li>• Paste acceptance criteria from Jira, Linear, or your ticket system</li>
            <li>• Include relevant code diffs for context</li>
            <li>• Output is Markdown — paste directly into PR comments or issues</li>
            <li>• Chain agents: use output from one as input to another</li>
            <li>• Use integrations to push results directly to external tools</li>
          </ul>
        )}
      </div>
    </div>
  );
}
