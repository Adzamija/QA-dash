/**
 * Core Types for QA-dash Test Scenario Designer & TestRail Bridge
 * Principal QA Automation Architect Implementation
 */

// ============================================================================
// JIRA INPUT TYPES
// ============================================================================

export interface JiraInput {
  /** JIRA ticket key/ID (e.g., "PROJ-1234") */
  key: string;
  /** JIRA ticket summary/title */
  summary: string;
  /** Acceptance Criteria from the ticket */
  acceptanceCriteria: string[];
  /** Full JIRA ticket URL */
  url?: string;
  /** Additional context or description */
  description?: string;
}

// ============================================================================
// TEST CASE TYPES (ISTQB Standard)
// ============================================================================

export type TestPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type TestType = 'Functional' | 'Negative' | 'Boundary' | 'Edge' | 'Performance' | 'Security';
export type AutomationStatus = 'NOT_AUTOMATED' | 'PENDING_AUTOMATION' | 'AUTOMATED' | 'FAILED_AUTOMATION';

export interface TestStep {
  /** Step number (1, 2, 3, ...) */
  stepNumber: number;
  /** Action to perform */
  action: string;
  /** Expected result after action */
  expectedResult: string;
  /** Optional test data for this step */
  testData?: string;
}

export interface TestCase {
  /** Unique test case ID (e.g., "TC-001") */
  id: string;
  /** Clear, concise title (inline editable in UI) */
  title: string;
  /** What exactly is being verified */
  verificationGoal: string;
  /** Initial state requirements */
  preconditions: string[];
  /** Step-by-step test instructions */
  steps: TestStep[];
  /** Priority level */
  priority: TestPriority;
  /** Type of test */
  testType: TestType;
  /** Whether this test should be automated */
  automationReady: boolean;
  /** Reference to source JIRA ticket */
  jiraReference: string;
  /** User selection for export */
  selected: boolean;
  /** TestRail Case ID (after export) */
  testRailCaseId?: number;
  /** Automation status */
  automationStatus: AutomationStatus;
  /** Timestamp of creation */
  createdAt: Date;
  /** Last modified timestamp */
  updatedAt?: Date;
}

// ============================================================================
// TESTRAIL CONFIGURATION TYPES
// ============================================================================

export interface TestRailConfig {
  /** TestRail instance URL (e.g., "https://yourcompany.testrail.io") */
  baseUrl: string;
  /** TestRail user email */
  username: string;
  /** TestRail API Key */
  apiKey: string;
  /** Target Project ID */
  projectId: string;
  /** Target Section/Folder ID within the project */
  sectionId: string;
  /** Optional: Suite ID (defaults to 1) */
  suiteId?: string;
}

// ============================================================================
// AUTOMATION QUEUE TYPES
// ============================================================================

export interface AutomationQueueItem {
  /** Unique queue item ID */
  queueId: string;
  /** Reference to TestRail Case ID */
  testRailCaseId: number;
  /** Test case title */
  title: string;
  /** Test steps for code generation */
  steps: TestStep[];
  /** Source JIRA key */
  jiraKey: string;
  /** Current status */
  status: AutomationStatus;
  /** Playwright spec file path (after automation) */
  specFilePath?: string;
  /** Page object file path (after automation) */
  pageObjectPath?: string;
  /** Timestamp added to queue */
  queuedAt: Date;
  /** Timestamp when automation started */
  automationStartedAt?: Date;
  /** Timestamp when automation completed */
  automationCompletedAt?: Date;
  /** Error message if automation failed */
  errorMessage?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface TestRailApiResponse {
  /** Success flag */
  success: boolean;
  /** Created/updated test case ID */
  caseId?: number;
  /** Direct link to TestRail test case */
  caseUrl?: string;
  /** Error message if failed */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface BatchExportResult {
  /** Total number of test cases processed */
  total: number;
  /** Number of successful exports */
  successful: number;
  /** Number of failed exports */
  failed: number;
  /** Detailed results per test case */
  results: Array<{
    testCaseId: string;
    success: boolean;
    testRailCaseId?: number;
    error?: string;
  }>;
  /** Direct links to created TestRail cases */
  caseUrls: string[];
}

// ============================================================================
// GENERATOR PROMPT TYPES
// ============================================================================

export interface TestGenerationPrompt {
  /** System prompt for AI generator */
  systemPrompt: string;
  /** User input with JIRA details */
  userInput: string;
  /** Expected output format */
  expectedFormat: 'json' | 'markdown';
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface TestScenarioDesignerState {
  /** Current JIRA input */
  jiraInput: JiraInput | null;
  /** Generated test cases */
  testCases: TestCase[];
  /** TestRail configuration */
  testRailConfig: TestRailConfig | null;
  /** Export status */
  exportStatus: 'idle' | 'exporting' | 'success' | 'error';
  /** Last export result */
  lastExportResult?: BatchExportResult;
  /** Error message if any */
  error?: string;
}

export interface AutomationQueueState {
  /** Queue items */
  items: AutomationQueueItem[];
  /** Filter for UI display */
  filterStatus?: AutomationStatus;
}
