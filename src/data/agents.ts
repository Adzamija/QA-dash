export type AgentId =
  | 'test-scenario-designer'
  | 'manual-validator'
  | 'functional-reviewer'
  | 'bug-reporter'
  | 'automation-writer'
  | 'browser-validator'
  | 'orchestrator'
  | 'release-analyzer';

export type AgentTier = 1 | 2 | 3;

export interface Integration {
  name: string;
  command: string;
  description: string;
}

export interface Agent {
  id: AgentId;
  name: string;
  tier: AgentTier;
  model: 'Opus' | 'Sonnet' | 'Haiku';
  shortDesc: string;
  description: string;
  input: {
    label: string;
    placeholder: string;
    type: 'textarea' | 'text';
  };
  outputExample: string;
  color: string;
  icon: string;
  integrations?: Integration[];
  phases?: { name: string; description: string }[];
}

export const agents: Agent[] = [
  {
    id: 'test-scenario-designer',
    name: 'Test Scenario Designer',
    tier: 1,
    model: 'Sonnet',
    shortDesc: 'ISTQB test cases from JIRA → TestRail format',
    description: 'Fetches JIRA ticket details automatically and generates ISTQB-compliant test cases in TestRail Steps format. Focuses on high-priority paths: happy path, negative flows, boundary values. Outputs structured test cases with automation readiness scores.',
    input: {
      label: 'JIRA Ticket Key',
      placeholder: 'PROJ-1234',
      type: 'text',
    },
    outputExample: `## Test Cases — ISTQB / TestRail Format

### TC-001: Complete password reset flow with valid data
**Priority:** P0 | **Type:** Functional | **Automation:** Ready (Score: 95/100)
**Preconditions:** Registered user with valid email

| Step | Action | Expected Result | Test Data |
|------|--------|-----------------|-----------|
| 1 | Navigate to /forgot-password | Page loads successfully | — |
| 2 | Enter valid email | Email accepted | user@test.com |
| 3 | Click "Send reset link" | Shows "Check your email" message | — |
| 4 | Open email and click reset link | Opens reset form | — |
| 5 | Enter new password (min 8 chars, 1 number) | Password accepted | NewPass123! |
| 6 | Confirm new password | Passwords match | NewPass123! |
| 7 | Click "Reset password" | Success message, redirect to login | — |
| 8 | Try login with old password | Login fails | OldPass123! |
| 9 | Try login with new password | Login succeeds | NewPass123! |

---

### TC-002: Password reset with expired link
**Priority:** P1 | **Type:** Negative | **Automation:** Ready (Score: 90/100)
**Preconditions:** Registered user, reset link older than 24h

| Step | Action | Expected Result | Test Data |
|------|--------|-----------------|-----------|
| 1 | Generate reset link | Link created | user@test.com |
| 2 | Wait 25 hours (simulate expiry) | — | — |
| 3 | Click expired link | Shows "Link expired" error | — |
| 4 | Request new reset | New form displays | — |

---

### 📊 Automation Readiness Matrix
| Test Case | Score | Complexity | Flaky Risk | Recommendation |
|-----------|-------|------------|------------|----------------|
| TC-001 | 95/100 | Low | Low | Automate immediately |
| TC-002 | 90/100 | Medium | Medium | Automate with time mock |

### 📤 TestRail Push
\`\`\`bash
testrail add-cases --suite "Password Reset" --file ./test-cases.json
\`\`\``,
    color: '#8b5cf6',
    icon: '📋',
    integrations: [
      { name: 'TestRail CLI', command: 'testrail add-cases --suite <name> --file <path>', description: 'Push test cases directly to TestRail' },
      { name: 'JIRA API', command: 'GET /rest/api/3/issue/{key}', description: 'Fetch ticket details automatically' },
    ],
  },
  {
    id: 'manual-validator',
    name: 'Manual Validator',
    tier: 1,
    model: 'Sonnet',
    shortDesc: 'Exploratory charters & manual checklists',
    description: 'Generates targeted manual execution checklists, UI verification steps, and exploratory testing charters (SBTM). Positioned as Tier 1.5 sub-agent below Test Scenario Designer for ambiguous AC validation.',
    input: {
      label: 'JIRA Ticket Key or Test Scenarios',
      placeholder: 'PROJ-1234 or paste test scenarios here...',
      type: 'textarea',
    },
    outputExample: `## Manual Validation Checklist

### Exploratory Testing Charters (SBTM)
**Charter 1:** Validate password reset edge cases
- **Mission:** Explore boundary conditions and error handling
- **Timebox:** 45 minutes
- **Areas:** Email validation, link expiry, password requirements

**Charter 2:** Cross-browser compatibility check
- **Mission:** Verify UI consistency across browsers
- **Timebox:** 30 minutes
- **Areas:** Chrome, Firefox, Safari, Edge

### Test Data & State Precondition Matrix
| Requirement | Data Needed | Environment Toggle | User Role |
|-------------|-------------|-------------------|-----------|
| Valid reset flow | Active user account | Email service enabled | Standard user |
| Expired link test | User + 24h-old token | Time mocking enabled | Standard user |
| Invalid email test | Non-existent email | None | Anonymous |

### UI Verification Steps
1. ✅ Email input field has proper validation states
2. ✅ Error messages are visible and descriptive
3. ✅ Success toast appears after submission
4. ✅ Loading state shown during API call
5. ✅ Redirect works after successful reset

### Risk Assessment
- **High Risk:** Email delivery delays
- **Medium Risk:** Token expiry edge cases
- **Low Risk:** UI alignment issues`,
    color: '#f59e0b',
    icon: '🧪',
    integrations: [],
  },
  {
    id: 'functional-reviewer',
    name: 'Functional Reviewer',
    tier: 2,
    model: 'Opus',
    shortDesc: 'Compare PR vs requirements — intelligent VCS routing',
    description: 'Compares PR diffs against acceptance criteria. Automatically detects Azure DevOps vs GitHub URLs and routes to appropriate CLI (az repos vs gh). Identifies gaps, risks, and regression issues across multiple repositories.',
    input: {
      label: 'PR Links (one per line) + Acceptance Criteria',
      placeholder: 'https://github.com/org/repo/pull/42\nhttps://dev.azure.com/org/project/_git/repo/pullrequest/123\n\nAcceptance Criteria:\n- AC-1: User can add items to cart\n- AC-2: Cart count updates immediately\n\nOptional: Additional context or cross-repo dependencies',
      type: 'textarea',
    },
    outputExample: `## Functional Review Report

### Detected VCS Provider
- GitHub: https://github.com/org/repo/pull/42
- Azure DevOps: https://dev.azure.com/org/project/_git/repo/pullrequest/123

### Repos Analyzed
- frontend (main): PR #42 — 12 files changed
- backend: no changes in scope
- shared-lib: no changes in scope

### AC Coverage
| AC | Status | Evidence | Confidence |
|----|--------|----------|------------|
| AC-1: Add to cart | ✅ COVERED | src/components/cart-button.tsx:43 | 95% |
| AC-2: Cart count update | ⚠️ AT RISK | Missing router.refresh() after mutation | 70% |

### Gaps Found
1. **AC-2** — Server action does not call revalidatePath()
   - File: src/app/actions/cart.ts:28
   - Impact: UI shows stale data after addition
   
2. **Cross-repo** — Backend API /api/cart does not return updated count
   - File: backend/src/routes/cart.ts:15
   - Impact: Frontend lacks fresh data

### Regression Risks
- Modified useCart hook — may break checkout flow
- No error handling for network failures in new code

### Action Items (prioritized)
1. 🔴 Add revalidatePath('/cart') after mutation — cart.ts:28
2. 🟡 Add error boundary for cart operations
3. 🟢 Consider optimistic update pattern for UX

### Verdict: REQUEST CHANGES
AC-2 is not fully implemented. Fix before merge.`,
    color: '#6366f1',
    icon: '🔍',
    integrations: [
      { name: 'GitHub CLI', command: 'gh pr view <number> --json files,additions,deletions', description: 'Fetch PR diff and metadata' },
      { name: 'Azure CLI', command: 'az repos pr show --id <id> --org <org>', description: 'Fetch Azure DevOps PR' },
    ],
  },
];
