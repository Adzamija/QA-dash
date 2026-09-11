import { useState, useEffect } from 'react';
import { 
  TestCase, 
  JiraInput, 
  TestRailConfig,
  TestStep,
  BatchExportResult 
} from '../../core/types/test-scenario-designer';
import { 
  TestRailService, 
  createTestRailService,
  generateFullPrompt,
  parseTestCasesFromResponse 
} from '../../core';
import { useTokens } from '../../contexts/TokensContext';

interface TestScenarioDesignerProps {
  onTestsGenerated?: (testCases: TestCase[]) => void;
  onExportComplete?: (result: BatchExportResult) => void;
}

export function TestScenarioDesigner({ onTestsGenerated, onExportComplete }: TestScenarioDesignerProps) {
  const { tokens } = useTokens();
  
  // Input state
  const [jiraKey, setJiraKey] = useState('');
  const [jiraSummary, setJiraSummary] = useState('');
  const [jiraUrl, setJiraUrl] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  
  // TestRail config state
  const [projectId, setProjectId] = useState('');
  const [sectionId, setSectionId] = useState('');
  
  // Generated tests state
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<BatchExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Parse acceptance criteria into array
   */
  const parseAcceptanceCriteria = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//'))
      .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, ''));
  };

  /**
   * Generate test cases using AI (simulated for now)
   */
  const handleGenerateTests = async () => {
    if (!jiraKey.trim() || !jiraSummary.trim() || !acceptanceCriteria.trim()) {
      setError('JIRA Key, Summary i Acceptance Criteria su obavezni');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Prepare JIRA input
      const jiraInput: JiraInput = {
        key: jiraKey.trim(),
        summary: jiraSummary.trim(),
        acceptanceCriteria: parseAcceptanceCriteria(acceptanceCriteria),
        url: jiraUrl.trim() || undefined,
      };

      // Generate prompts for AI
      const { systemPrompt, userPrompt } = generateFullPrompt(jiraInput);

      // TODO: Call Claude API with prompts
      // For now, simulate with example test cases
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated response - in production, this comes from AI
      const simulatedTestCases: TestCase[] = [
        {
          id: 'TC-001',
          title: `Verify ${jiraSummary.toLowerCase()} sa validnim podacima`,
          verificationGoal: 'Potvrđuje da glavni flow radi ispravno',
          preconditions: ['Korisnik je na odgovarajućoj stranici', 'Svi potrebni podaci su dostupni'],
          steps: [
            { stepNumber: 1, action: 'Otvori aplikaciju', expectedResult: 'Aplikacija se uspješno učitava' },
            { stepNumber: 2, action: 'Unesi validne podatke', expectedResult: 'Podaci su prihvaćeni', testData: 'test@example.com' },
            { stepNumber: 3, action: 'Klikni Submit', expectedResult: 'Operacija uspješna, prikazuje se potvrda' },
          ],
          priority: 'P0',
          testType: 'Functional',
          automationReady: true,
          jiraReference: jiraInput.key,
          selected: true,
          automationStatus: 'NOT_AUTOMATED',
          createdAt: new Date(),
        },
        {
          id: 'TC-002',
          title: `Verify ${jiraSummary.toLowerCase()} sa nevalidnim podacima`,
          verificationGoal: 'Potvrđuje da sistem ispravno handlira greške',
          preconditions: ['Korisnik je na odgovarajućoj stranici'],
          steps: [
            { stepNumber: 1, action: 'Otvori aplikaciju', expectedResult: 'Aplikacija se uspješno učitava' },
            { stepNumber: 2, action: 'Unesi nevalidan email', expectedResult: 'Email format je odbačen', testData: 'invalid-email' },
            { stepNumber: 3, action: 'Klikni Submit', expectedResult: 'Prikazuje se error poruka' },
          ],
          priority: 'P1',
          testType: 'Negative',
          automationReady: true,
          jiraReference: jiraInput.key,
          selected: true,
          automationStatus: 'NOT_AUTOMATED',
          createdAt: new Date(),
        },
        {
          id: 'TC-003',
          title: `Verify granične vrijednosti za ${jiraSummary.toLowerCase()}`,
          verificationGoal: 'Testira minimalne i maksimalne vrijednosti',
          preconditions: ['Korisnik je na odgovarajućoj stranici'],
          steps: [
            { stepNumber: 1, action: 'Unesi minimalnu vrijednost', expectedResult: 'Vrijednost je prihvaćena', testData: 'min' },
            { stepNumber: 2, action: 'Unesi maksimalnu vrijednost', expectedResult: 'Vrijednost je prihvaćena', testData: 'max' },
            { stepNumber: 3, action: 'Unesi vrijednost izvan opsega', expectedResult: 'Vrijednost je odbačena sa errorom' },
          ],
          priority: 'P2',
          testType: 'Boundary',
          automationReady: true,
          jiraReference: jiraInput.key,
          selected: true,
          automationStatus: 'NOT_AUTOMATED',
          createdAt: new Date(),
        },
      ];

      setTestCases(simulatedTestCases);
      
      if (onTestsGenerated) {
        onTestsGenerated(simulatedTestCases);
      }

      setSuccessMessage(`Generisano ${simulatedTestCases.length} test case-ova po ISTQB standardima`);
    } catch (err) {
      setError('Greška prilikom generisanja testova: ' + (err instanceof Error ? err.message : 'Nepoznata greška'));
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle inline title edit
   */
  const handleTitleEdit = (testCaseId: string, newTitle: string) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === testCaseId ? { ...tc, title: newTitle } : tc
    ));
  };

  /**
   * Toggle test case selection
   */
  const toggleSelection = (testCaseId: string) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === testCaseId ? { ...tc, selected: !tc.selected } : tc
    ));
  };

  /**
   * Select/deselect all
   */
  const toggleSelectAll = () => {
    const allSelected = testCases.every(tc => tc.selected);
    setTestCases(prev => prev.map(tc => ({ ...tc, selected: !allSelected })));
  };

  /**
   * Export selected tests to TestRail
   */
  const handleExportToTestRail = async () => {
    const selectedTests = testCases.filter(tc => tc.selected);
    
    if (selectedTests.length === 0) {
      setError('Odaberite barem jedan test za export');
      return;
    }

    // Get TestRail config from tokens
    const testRailConfig: TestRailConfig = {
      baseUrl: tokens.testrail.url,
      username: tokens.testrail.username,
      apiKey: tokens.testrail.apiKey,
      projectId: projectId || tokens.testrail.projectId,
      sectionId: sectionId,
    };

    // Validate config
    if (!testRailConfig.baseUrl || !testRailConfig.username || !testRailConfig.apiKey) {
      setError('TestRail konfiguracija nije kompletna. Dodajte credentials u Settings → Tokens.');
      return;
    }

    if (!projectId || !sectionId) {
      setError('Project ID i Section ID su obavezni za export');
      return;
    }

    setIsExporting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const service = createTestRailService(testRailConfig);
      
      // Validate before export
      const validation = service.validateConfig();
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Batch export
      const result = await service.createTestCasesBatch(selectedTests);
      
      setExportResult(result);
      
      if (onExportComplete) {
        onExportComplete(result);
      }

      // Update test cases with TestRail IDs
      setTestCases(prev => prev.map(tc => {
        const exportResultItem = result.results.find(r => r.testCaseId === tc.id);
        if (exportResultItem && exportResultItem.success && exportResultItem.testRailCaseId) {
          return {
            ...tc,
            testRailCaseId: exportResultItem.testRailCaseId,
            automationStatus: 'PENDING_AUTOMATION' as const,
          };
        }
        return tc;
      }));

      setSuccessMessage(`Uspješno eksportovano ${result.successful} od ${result.total} testova u TestRail`);
      
      // Auto-add to automation queue
      const { getAutomationQueueStore } = await import('../../core');
      const queueStore = getAutomationQueueStore();
      queueStore.addTestCases(selectedTests.filter(tc => tc.testRailCaseId !== undefined));
      
    } catch (err) {
      setError('Export failed: ' + (err instanceof Error ? err.message : 'Nepoznata greška'));
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Get priority badge color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return '#ef4444';
      case 'P1': return '#f97316';
      case 'P2': return '#eab308';
      case 'P3': return '#22c55e';
      default: return '#6b7280';
    }
  };

  /**
   * Get test type badge color
   */
  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'Functional': return '#3b82f6';
      case 'Negative': return '#ef4444';
      case 'Boundary': return '#f59e0b';
      case 'Edge': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text">📋 JIRA Ticket Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text mb-1">
              JIRA Key *
            </label>
            <input
              type="text"
              value={jiraKey}
              onChange={(e) => setJiraKey(e.target.value)}
              placeholder="PROJ-123"
              className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
              disabled={isGenerating || isExporting}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text mb-1">
              JIRA URL (optional)
            </label>
            <input
              type="text"
              value={jiraUrl}
              onChange={(e) => setJiraUrl(e.target.value)}
              placeholder="https://yourcompany.atlassian.net/browse/PROJ-123"
              className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
              disabled={isGenerating || isExporting}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Summary *
          </label>
          <input
            type="text"
            value={jiraSummary}
            onChange={(e) => setJiraSummary(e.target.value)}
            placeholder="Kratki opis funkcionalnosti"
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
            disabled={isGenerating || isExporting}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Acceptance Criteria *
          </label>
          <textarea
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            placeholder={`- AC1: Korisnik može unijeti email\n- AC2: Sistem validira email format\n- AC3: Nakon submita, šalje se confirmation email\n- AC4: Link u emailu važi 24 sata`}
            className="w-full h-40 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-accent transition-colors code-font"
            disabled={isGenerating || isExporting}
          />
          <p className="text-[10px] text-text-dim mt-1">
            Svaki AC u novi red. Može koristiti bullet points (-, •, *) ili brojeve.
          </p>
        </div>

        <button
          onClick={handleGenerateTests}
          disabled={isGenerating || isExporting || !jiraKey.trim() || !jiraSummary.trim() || !acceptanceCriteria.trim()}
          className="w-full px-4 py-2 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {isGenerating ? '🔄 Generisanje testova...' : '✨ Generate Test Cases (ISTQB)'}
        </button>
      </div>

      {/* TestRail Config */}
      {testCases.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text">🚀 TestRail Configuration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Project ID *
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                disabled={isExporting}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Section/Folder ID *
              </label>
              <input
                type="text"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                placeholder="12"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                disabled={isExporting}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-text-muted">
              {testCases.filter(tc => tc.selected).length} od {testCases.length} testova odabrano
            </div>
            <button
              onClick={handleExportToTestRail}
              disabled={isExporting || !projectId || !sectionId}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              {isExporting ? '🔄 Exporting to TestRail...' : `📤 Export ${testCases.filter(tc => tc.selected).length} Tests to TestRail`}
            </button>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
          <p className="text-xs text-green-500">{successMessage}</p>
        </div>
      )}

      {exportResult && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-text">✅ Export Results</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-surface-2 rounded-lg">
              <div className="text-2xl font-bold text-text">{exportResult.total}</div>
              <div className="text-[10px] text-text-muted">Total</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500">
              <div className="text-2xl font-bold text-green-500">{exportResult.successful}</div>
              <div className="text-[10px] text-green-500">Successful</div>
            </div>
            {exportResult.failed > 0 && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500">
                <div className="text-2xl font-bold text-red-500">{exportResult.failed}</div>
                <div className="text-[10px] text-red-500">Failed</div>
              </div>
            )}
          </div>
          
          {exportResult.caseUrls.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-text mb-2">Created TestRail Cases:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {exportResult.caseUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[10px] text-accent hover:underline truncate"
                  >
                    🔗 {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Test Cases */}
      {testCases.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">📝 Generated Test Cases ({testCases.length})</h3>
            <button
              onClick={toggleSelectAll}
              className="text-[10px] text-text-muted hover:text-text transition-colors"
            >
              {testCases.every(tc => tc.selected) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {testCases.map((testCase, index) => (
              <div key={testCase.id} className="p-4 hover:bg-surface-2 transition-colors">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={testCase.selected}
                    onChange={() => toggleSelection(testCase.id)}
                    className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    disabled={isExporting}
                  />
                  
                  <div className="flex-1">
                    {/* Inline editable title */}
                    <input
                      type="text"
                      value={testCase.title}
                      onChange={(e) => handleTitleEdit(testCase.id, e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-text border border-transparent hover:border-border focus:border-accent rounded px-2 py-1 focus:outline-none transition-colors"
                      disabled={isExporting}
                    />
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                        style={{ backgroundColor: getPriorityColor(testCase.priority) }}
                      >
                        {testCase.priority}
                      </span>
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                        style={{ backgroundColor: getTestTypeColor(testCase.testType) }}
                      >
                        {testCase.testType}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        🔗 {testCase.jiraReference}
                      </span>
                      {testCase.testRailCaseId && (
                        <span className="text-[10px] text-green-500">
                          ✅ TR-{testCase.testRailCaseId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Goal */}
                <div className="mb-3 ml-7">
                  <p className="text-[10px] text-text-muted">
                    <span className="font-medium">Goal:</span> {testCase.verificationGoal}
                  </p>
                </div>

                {/* Preconditions */}
                {testCase.preconditions.length > 0 && (
                  <div className="mb-3 ml-7">
                    <p className="text-[10px] font-medium text-text mb-1">Preconditions:</p>
                    <ul className="text-[10px] text-text-muted list-disc list-inside space-y-0.5">
                      {testCase.preconditions.map((precond, idx) => (
                        <li key={idx}>{precond}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Test Steps */}
                <div className="ml-7">
                  <p className="text-[10px] font-medium text-text mb-2">Test Steps:</p>
                  <div className="space-y-2">
                    {testCase.steps.map((step) => (
                      <div key={step.stepNumber} className="text-[10px] bg-surface-2 rounded p-2">
                        <div className="flex items-start gap-2">
                          <span className="text-text-muted font-mono min-w-[20px]">
                            Step {step.stepNumber}:
                          </span>
                          <div className="flex-1">
                            <div className="text-text mb-1">
                              <span className="font-medium">Action:</span> {step.action}
                              {step.testData && (
                                <span className="text-text-dim ml-2">[Data: {step.testData}]</span>
                              )}
                            </div>
                            <div className="text-text-muted">
                              <span className="font-medium">Expected:</span> {step.expectedResult}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
