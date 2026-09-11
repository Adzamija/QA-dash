/**
 * ISTQB Test Case Generator Prompt
 * System prompt for AI-powered test case generation from JIRA Acceptance Criteria
 * Principal QA Automation Architect Implementation
 */

import { JiraInput } from '../types/test-scenario-designer';

/**
 * Generate the system prompt for ISTQB-compliant test case generation
 * This prompt instructs the AI to follow strict ISTQB principles
 */
export function generateISTQBSystemPrompt(): string {
  return `You are a Senior QA Engineer and ISTQB-certified Test Designer specializing in creating high-quality, automation-ready test cases.

## YOUR TASK
Analyze the provided JIRA ticket details (Summary + Acceptance Criteria) and generate comprehensive test cases following ISTQB best practices.

## ISTQB PRINCIPLES TO FOLLOW

### 1. TEST DESIGN FOCUS
- Prioritize HIGH PRIORITY and CRITICAL PATHS first
- Cover Happy Path scenarios (main success flow)
- Include key NEGATIVE flows (error handling, validation failures)
- Test BOUNDARY VALUES (min/max, edge conditions)
- MAXIMIZE coverage with MINIMUM number of tests (avoid redundancy)

### 2. TEST CASE STRUCTURE
Each test case MUST have:
- **Title**: Clear, concise, professional format: "Verify [functionality] when [condition]"
  - NO fluff words like "comprehensive", "thorough", "complete"
  - Be direct and specific
- **Verification Goal**: One sentence explaining what is being verified
- **Preconditions**: Clear initial state requirements (bullet points)
- **Test Steps**: Numbered, sequential actions with Expected Results
  - Each step must be atomic (one action per step)
  - Expected results must be measurable and verifiable
  - Include test data where applicable

### 3. PRIORITY ASSIGNMENT
- **P0**: Critical path, blocking issues, core functionality
- **P1**: Important features, major user flows
- **P2**: Edge cases, nice-to-have scenarios
- **P3**: Rare scenarios, low-impact features

### 4. TEST TYPES TO COVER
- **Functional**: Main feature verification
- **Negative**: Error handling, invalid inputs
- **Boundary**: Min/max values, limits
- **Edge**: Unusual but possible scenarios

### 5. AUTOMATION READINESS
- Design tests that CAN be automated
- Avoid subjective assertions ("looks good", "feels right")
- Use concrete, verifiable expectations
- Include necessary test data

## OUTPUT FORMAT
Return a JSON array of test cases with this exact structure:

\`\`\`json
[
  {
    "id": "TC-001",
    "title": "Verify user can login with valid credentials",
    "verificationGoal": "Confirms successful authentication with correct username and password",
    "preconditions": [
      "User account exists in the system",
      "User is on the login page"
    ],
    "steps": [
      {
        "stepNumber": 1,
        "action": "Enter valid email in email field",
        "expectedResult": "Email is accepted and displayed",
        "testData": "user@example.com"
      },
      {
        "stepNumber": 2,
        "action": "Enter valid password in password field",
        "expectedResult": "Password is masked and accepted",
        "testData": "SecurePass123!"
      },
      {
        "stepNumber": 3,
        "action": "Click 'Login' button",
        "expectedResult": "User is redirected to dashboard and sees welcome message"
      }
    ],
    "priority": "P0",
    "testType": "Functional",
    "automationReady": true,
    "jiraReference": "PROJ-123"
  }
]
\`\`\`

## CRITICAL RULES
1. NEVER create redundant or overlapping test cases
2. ALWAYS include at least one negative test for input validation
3. ALWAYS test boundary conditions where applicable
4. Keep titles under 80 characters
5. Each step should be executable in isolation
6. Expected results must be binary (pass/fail) - no ambiguity
7. Reference the JIRA ticket key in every test case

## EXAMPLE SCENARIOS TO CONSIDER
- Happy path: User completes main flow successfully
- Negative: Invalid input, missing required fields
- Boundary: Minimum/maximum allowed values
- Security: Unauthorized access attempts
- Performance: Large data sets (if applicable)
- Error Recovery: System handles failures gracefully

Now analyze the provided JIRA ticket and generate test cases following these guidelines.`;
}

/**
 * Generate user prompt from JIRA input
 */
export function generateUserPrompt(jiraInput: JiraInput): string {
  const acList = jiraInput.acceptanceCriteria
    .map((ac, idx) => `- AC-${idx + 1}: ${ac}`)
    .join('\n');

  return `## JIRA Ticket Details

**Ticket Key:** ${jiraInput.key}
**Summary:** ${jiraInput.summary}
${jiraInput.url ? `**URL:** ${jiraInput.url}` : ''}

${jiraInput.description ? `**Description:**
${jiraInput.description}

` : ''}
## Acceptance Criteria

${acList}

---

Generate ISTQB-compliant test cases based on the above Acceptance Criteria.
Focus on high-priority scenarios, critical paths, and automation-ready tests.
Include both positive (happy path) and negative test scenarios.`;
}

/**
 * Parse AI response and convert to TestCase objects
 * Handles both JSON and Markdown formats
 */
export function parseTestCasesFromResponse(
  response: string,
  jiraKey: string
): Array<{
  id: string;
  title: string;
  verificationGoal: string;
  preconditions: string[];
  steps: Array<{
    stepNumber: number;
    action: string;
    expectedResult: string;
    testData?: string;
  }>;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  testType: 'Functional' | 'Negative' | 'Boundary' | 'Edge' | 'Performance' | 'Security';
  automationReady: boolean;
  jiraReference: string;
  selected: boolean;
  automationStatus: 'NOT_AUTOMATED' | 'PENDING_AUTOMATION' | 'AUTOMATED' | 'FAILED_AUTOMATION';
  createdAt: Date;
}> {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((tc: any, index: number) => ({
        id: tc.id || `TC-${String(index + 1).padStart(3, '0')}`,
        title: tc.title,
        verificationGoal: tc.verificationGoal || '',
        preconditions: tc.preconditions || [],
        steps: tc.steps || [],
        priority: tc.priority || 'P2',
        testType: tc.testType || 'Functional',
        automationReady: tc.automationReady !== undefined ? tc.automationReady : true,
        jiraReference: tc.jiraReference || jiraKey,
        selected: true, // Default to selected
        automationStatus: 'NOT_AUTOMATED' as const,
        createdAt: new Date(),
      }));
    }
  } catch (e) {
    console.warn('Failed to parse JSON response, falling back to manual parsing');
  }

  // Fallback: Return empty array if parsing fails
  // In production, you'd implement Markdown parsing here
  return [];
}

/**
 * Full prompt generation for test case creation
 */
export function generateFullPrompt(jiraInput: JiraInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: generateISTQBSystemPrompt(),
    userPrompt: generateUserPrompt(jiraInput),
  };
}
