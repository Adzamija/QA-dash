/**
 * QA-Dash Core Types & Interfaces
 * Defines strict types for Agents, State, and Integration payloads.
 */

// ------------------------------------------------------------------
// Agent Definitions & Tiering
// ------------------------------------------------------------------
export type AgentTier = 1 | 1.5 | 2 | 3;

export type AgentType = 
  | 'TEST_SCENARIO_DESIGNER'
  | 'MANUAL_VALIDATOR'
  | 'FUNCTIONAL_REVIEWER'
  | 'BROWSER_VALIDATOR'
  | 'AUTOMATION_WRITER'
  | 'BUG_REPORTER'
  | 'ORCHESTRATOR'
  | 'RELEASE_ANALYZER';

export interface AgentDefinition {
  id: AgentType;
  name: string;
  tier: AgentTier;
  description: string;
  requiredTools: ('JIRA' | 'GITHUB_CLI' | 'AZURE_CLI' | 'TESTRAIL' | 'PLAYWRIGHT')[];
}

export const AGENT_DEFINITIONS: Record<AgentType, AgentDefinition> = {
  TEST_SCENARIO_DESIGNER: {
    id: 'TEST_SCENARIO_DESIGNER',
    name: 'Test Scenario Designer',
    tier: 1,
    description: 'Generates ISTQB-compliant test scenarios from Jira tickets.',
    requiredTools: ['JIRA', 'TESTRAIL'],
  },
  MANUAL_VALIDATOR: {
    id: 'MANUAL_VALIDATOR',
    name: 'Manual Validator',
    tier: 1.5,
    description: 'Creates exploratory charters and manual checklists.',
    requiredTools: ['JIRA'],
  },
  FUNCTIONAL_REVIEWER: {
    id: 'FUNCTIONAL_REVIEWER',
    name: 'Functional Reviewer',
    tier: 2,
    description: 'Analyzes PR diffs against acceptance criteria (GitHub/Azure).',
    requiredTools: ['GITHUB_CLI', 'AZURE_CLI'],
  },
  BROWSER_VALIDATOR: {
    id: 'BROWSER_VALIDATOR',
    name: 'Browser Validator',
    tier: 3,
    description: 'Validates UI behavior using Playwright/DevTools.',
    requiredTools: ['PLAYWRIGHT'],
  },
  AUTOMATION_WRITER: {
    id: 'AUTOMATION_WRITER',
    name: 'Automation Writer',
    tier: 2, // Adjusted based on workflow
    description: 'Generates Playwright code from test scenarios.',
    requiredTools: ['PLAYWRIGHT'],
  },
  BUG_REPORTER: {
    id: 'BUG_REPORTER',
    name: 'Bug Reporter',
    tier: 2,
    description: 'Formats bug reports for Jira/TestRail.',
    requiredTools: ['JIRA', 'TESTRAIL'],
  },
  ORCHESTRATOR: {
    id: 'ORCHESTRATOR',
    name: 'Orchestrator',
    tier: 1,
    description: 'Coordinates multi-agent workflows.',
    requiredTools: ['JIRA', 'GITHUB_CLI', 'AZURE_CLI'],
  },
  RELEASE_ANALYZER: {
    id: 'RELEASE_ANALYZER',
    name: 'Release Analyzer',
    tier: 2,
    description: 'Analyzes release risks and coverage.',
    requiredTools: ['JIRA', 'GITHUB_CLI'],
  },
};

// ------------------------------------------------------------------
// Isolated Agent State (Task 1: State Decoupling)
// ------------------------------------------------------------------
export interface AgentState {
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  input: any;
  output: string | null;
  error: string | null;
  timestamp: number | null;
}

// Initial state factory to ensure clean slate per agent
export const createInitialAgentState = (): AgentState => ({
  status: 'IDLE',
  input: null,
  output: null,
  error: null,
  timestamp: null,
});

// ------------------------------------------------------------------
// Integration Payloads
// ------------------------------------------------------------------
export interface JiraTicketData {
  key: string;
  summary: string;
  description: string;
  acceptanceCriteria: string;
  status: string;
  assignee?: string;
}

export interface VcsDiffData {
  provider: 'GITHUB' | 'AZURE';
  prNumber: string;
  repoName: string;
  diffContent: string;
  baseBranch: string;
  targetBranch: string;
}

export interface AutomationReadinessScore {
  score: number; // 0-100
  verdict: 'READY' | 'NEEDS_MOCKING' | 'FLAKY_RISK' | 'MANUAL_ONLY';
  reasoning: string;
}

export interface TestCase {
  id: string;
  title: string;
  verificationGoal: string;
  preconditions: string[];
  steps: { step: string; expected: string }[];
  jiraReference: string;
  automationScore?: AutomationReadinessScore;
  type: 'HAPPY_PATH' | 'NEGATIVE' | 'BOUNDARY' | 'EDGE_CASE';
}
