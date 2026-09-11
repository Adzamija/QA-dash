export type AgentId =
  | 'functional-reviewer'
  | 'test-scenario-designer'
  | 'bug-reporter'
  | 'automation-writer'
  | 'browser-validator'
  | 'orchestrator'
  | 'release-analyzer'
  | 'manual-validator';

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
    id: 'functional-reviewer',
    name: 'Functional Reviewer',
    tier: 1,
    model: 'Opus',
    shortDesc: 'Uporedi PR sa zahtjevima — multi-repo',
    description: 'Poredi PR sa prethodnom verzijom koda. Podržava više repozitorijuma. Identifikuje gap-ove, rizike i regresione probleme. Integracija sa GitHub i Azure CLI.',
    input: {
      label: 'PR / Repo info + Acceptance Criteria',
      placeholder: 'PR #42 u repo: frontend\nAC:\n- AC-1: Korisnik može dodati artikle u korpu\n- AC-2: Broj artikala u korpi se odmah ažurira\n\nOpcionalno: dodatni repo-ovi za cross-check (backend, shared-lib)',
      type: 'textarea',
    },
    outputExample: `## Functional Review Report

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
1. **AC-2** — Server action ne poziva revalidatePath()
   - File: src/app/actions/cart.ts:28
   - Impact: UI prikazuje stare podatke nakon dodavanja
   
2. **Cross-repo** — Backend API /api/cart ne vraća updated count
   - File: backend/src/routes/cart.ts:15
   - Impact: Frontend nema svježe podatke

### Regression Risks
- Modified useCart hook — may break checkout flow
- No error handling for network failures in new code

### Action Items (prioritized)
1. 🔴 Add revalidatePath('/cart') after mutation — cart.ts:28
2. 🟡 Add error boundary for cart operations
3. 🟢 Consider optimistic update pattern for UX

### Verdict: REQUEST CHANGES
AC-2 nije kompletno implementiran. Popraviti prije merge-a.`,
    color: '#6366f1',
    icon: '🔍',
    integrations: [
      { name: 'GitHub CLI', command: 'gh pr view <number> --json files,additions,deletions', description: 'Dohvati PR diff i metadata' },
      { name: 'Azure CLI', command: 'az repos pr show --id <id> --org <org>', description: 'Dohvati Azure DevOps PR' },
    ],
  },
  {
    id: 'test-scenario-designer',
    name: 'Test Scenario Designer',
    tier: 1,
    model: 'Sonnet',
    shortDesc: 'ISTQB test caseovi → TestRail format',
    description: 'Kreira test case-ove po ISTQB standardima u TestRail Steps formatu. Veći, logični testovi kompatibilni za automatizaciju. Jednostavan, informativan naslov. Direktno slanje u TestRail via CLI.',
    input: {
      label: 'User Story / Acceptance Criteria',
      placeholder: 'User Story: Kao korisnik, želim resetovati lozinku putem email linka.\n\nAC:\n- Korisnik unosi email i prima reset link\n- Link važi 24h\n- Nakon klika, korisnik postavlja novu lozinku\n- Stara lozinka više ne radi',
      type: 'textarea',
    },
    outputExample: `## Test Cases — ISTQB / TestRail Format

### TC-001: Kompletna password reset flow sa validnim podacima
**Prioritet:** P0 | **Tip:** Functional | **Automation:** Da
**Preconditions:** Registrovan korisnik sa validnim emailom

| Step | Action | Expected Result | Test Data |
|------|--------|-----------------|-----------|
| 1 | Otvori /forgot-password stranicu | Stranica se uspješno učitava | — |
| 2 | Unesi validan email u polje | Email je prihvaćen | user@test.com |
| 3 | Klikni "Pošalji reset link" | Prikaže se poruka "Provjerite email" | — |
| 4 | Otvori email i klikni reset link | Link se otvara, forma za novu lozinku | — |
| 5 | Unesi novu lozinku (min 8 znakova, 1 broj) | Lozinka prihvaćena | NewPass123! |
| 6 | Potvrdi novu lozinku | Lozinke se poklapaju | NewPass123! |
| 7 | Klikni "Resetuj lozinku" | Uspješna poruka, preusmjeravanje na login | — |
| 8 | Pokušaj login sa starom lozinkom | Login neuspješan | OldPass123! |
| 9 | Pokušaj login sa novom lozinkom | Login uspješan | NewPass123! |

---

### TC-002: Password reset sa isteklim linkom
**Prioritet:** P1 | **Tip:** Negative | **Automation:** Da
**Preconditions:** Registrovan korisnik, reset link stariji od 24h

| Step | Action | Expected Result | Test Data |
|------|--------|-----------------|-----------|
| 1 | Generiši reset link za korisnika | Link kreiran | user@test.com |
| 2 | Sačekaj 25 sati (simuliraj istek) | — | — |
| 3 | Klikni na istekli link | Prikaže se greška "Link je istekao" | — |
| 4 | Pokušaj ponovo zatražiti reset | Nova forma se prikazuje | — |

---

### TC-003: Password reset sa nevalidnim emailom
**Prioritet:** P2 | **Tip:** Negative | **Automation:** Da

| Step | Action | Expected Result | Test Data |
|------|--------|-----------------|-----------|
| 1 | Otvori /forgot-password | Stranica se učitava | — |
| 2 | Unesi nepostojeći email | Prikaže se "Provjerite email" (security) | fake@test.com |
| 3 | Verifikuj da email NIJE poslan | Nema emaila u inboxu | — |

---

### TC-004: Višestruki zahtjevi za reset u kratkom vremenu
**Prioritet:** P1 | **Tip:** Edge/Boundary | **Automation:** Da

| Step | Action | Expected Result | Test Data |
|------|--------|-----------------|-----------|
| 1 | Zatraži reset 3 puta u 2 minute | Rate limiting se aktivira | user@test.com |
| 2 | Treći zahtjev | Poruka "Previše zahtjeva, pokušajte za 5 min" | — |
| 3 | Sačekaj 5 minuta | — | — |
| 4 | Ponovi zahtjev | Uspješno poslan | — |

---

### 📤 TestRail Push
\`\`\`bash
testrail add-cases --suite "Password Reset" --file ./test-cases.json
\`\`\``,
    color: '#8b5cf6',
    icon: '📋',
    integrations: [
      { name: 'TestRail CLI', command: 'testrail add-cases --suite <name> --file <path>', description: 'Push test case-ove direktno u TestRail' },
    ],
  },
  {
    id: 'bug-reporter',
    name: 'Bug Reporter',
    tier: 1,
    model: 'Sonnet',
    shortDesc: 'QA nalazi → JIRA ticketi',
    description: 'Pretvara QA pronalaske u developer-ready bug reportove. Direktno kreiranje JIRA tiketa via CLI sa svim relevantnim podacima.',
    input: {
      label: 'QA Findings / Opis problema',
      placeholder: 'Bug: Nakon dodavanja artikla u korpu, broj u navigaciji se ne ažurira.\n\nKoraci:\n1. Otvori product listing\n2. Klikni "Add to Cart"\n3. Broj u headeru ostaje 0\n\nOčekivano: Broj se povećava na 1\nStvarno: Broj ostaje 0\n\nScreenshot: evidence/cart-bug.png',
      type: 'textarea',
    },
    outputExample: `## Bug Report

**Title:** Cart count ne ažurira nakon dodavanja artikla
**Severity:** High
**Priority:** P1
**Component:** Cart / Navigation Header
**Environment:** Chrome 120, macOS 14.2, staging

### Steps to Reproduce
1. Navigiraj na /products
2. Klikni "Add to Cart" na bilo koji proizvod
3. Posmatraj cart count u navigaciji

### Expected Result
Cart count se odmah povećava (npr. 0 → 1)

### Actual Result
Cart count ostaje na prethodnoj vrijednosti. Ažurira se tek nakon refresh-a stranice.

### Evidence
- Screenshot: evidence/cart-bug.png
- Network: POST /api/cart → 200 OK
- Console: No errors

### Root Cause Hypothesis
Nedostaje router.refresh() nakon server action mutacije u src/components/quick-add-button.tsx:43

### Suggested Fix
Dodati revalidatePath('/cart') ili revalidateTag('cart-count') nakon addToCart server action.

### Additional Info
- Regression: Da (radilo u v1.2)
- Affected users: Svi koji koriste cart
- Workaround: Refresh stranice

---

### 📤 JIRA Push
\`\`\`bash
jira create --project QA --type Bug \\
  --summary "Cart count ne ažurira nakon dodavanja artikla" \\
  --priority High --component "Cart" \\
  --description "$(cat bug-report.md)" \\
  --attachment evidence/cart-bug.png
\`\`\``,
    color: '#ef4444',
    icon: '🐛',
    integrations: [
      { name: 'JIRA CLI', command: 'jira create --project <KEY> --type Bug --summary "..." --description "..."', description: 'Kreiraj JIRA ticket direktno' },
    ],
  },
  {
    id: 'automation-writer',
    name: 'Automation Writer',
    tier: 2,
    model: 'Opus',
    shortDesc: '5-fazni generator: Novi test / Update',
    description: 'Dva moda: Novi test (TestRail ID + feature) ili Update-Existing (popravi slomljeni test). 5 faza: Analiza → Odluka → Generisanje → Validacija → Self-verification. Nikad ne vraća neverifikovan kod.',
    input: {
      label: 'TestRail ID + Mode + Context',
      placeholder: 'Mode: NEW\nTestRail ID: TC-042\nFeature: Password Reset\nRecording: (optional — paste Playwright trace or describe steps)\n\n--- ILI ---\n\nMode: UPDATE-EXISTING\nTestRail ID: TC-015\nProblem: UI promjena — locator za email input više ne radi\nStari locator: input[name="email"]\nNovi UI: input[data-testid="reset-email"]',
      type: 'textarea',
    },
    outputExample: `## Automation Writer — 5-Phase Execution

### Faza 1: Analiza Recordinga
✅ Izvučeni locatori (prioritet: role → testid → label → text):
- Email input: [data-testid="reset-email"] (testid)
- Submit button: role=button[name="Pošalji link"] (role)
- Success message: text="Provjerite email" (text)

✅ Akcije: goto → fill → click → waitForURL
✅ Asertacije: toBeVisible, toContainText, toHaveURL

✅ Default Conventions primijenjene:
- Toast poruke: waitFor + assertion pattern
- Dropdown: role=listbox + role=option
- Calendar: fill umjesto click-through

---

### Faza 2: Odluka o Modu
✅ Pročitani utils fajlovi:
- e2e/utils/constants.ts → BASE_URL, TIMEOUTS
- e2e/utils/urls.ts → ROUTES.forgotPassword
- e2e/utils/date-utils.ts → generateExpiredToken

✅ Mandatory Constants Cross-Reference:
| Literal | Constant | Source |
|---------|----------|--------|
| "http://localhost:3000" | BASE_URL | constants.ts |
| "/forgot-password" | ROUTES.forgotPassword | urls.ts |
| 30000 | TIMEOUTS.default | constants.ts |

✅ Mode Decision: **CREATE** (nova stranica, 0% reuse)
→ Blast radius: N/A (novi test)

---

### Faza 3: Generisanje Koda

**Page Object:** e2e/pages/password-reset.page.ts
\`\`\`typescript
/**
 * Password Reset Page Object
 * @example
 * const page = new PasswordResetPage(browserPage);
 * await page.goto();
 * await page.fillEmail('user@test.com');
 */
export class PasswordResetPage {
  constructor(private page: Page) {}

  // Locators
  private emailInput = () => this.page.getByTestId('reset-email');
  private submitButton = () => this.page.getByRole('button', { name: 'Pošalji link' });
  private successMessage = () => this.page.getByText('Provjerite email');

  // Actions
  async goto() {
    await this.page.goto(\`\${BASE_URL}\${ROUTES.forgotPassword}\`);
  }

  async fillEmail(email: string) {
    await this.emailInput().fill(email);
  }

  async submit() {
    await this.submitButton().click();
  }

  // Assertions
  async expectSuccessMessage() {
    await expect(this.successMessage()).toBeVisible({ timeout: TIMEOUTS.default });
  }
}
\`\`\`

**Spec File:** e2e/tests/password-reset.spec.ts
\`\`\`typescript
// Section 1: Imports
import { test, expect } from '@playwright/test';
import { PasswordResetPage } from '../pages/password-reset.page';
import { BASE_URL, TIMEOUTS, ROUTES } from '../utils/constants';
import { generateExpiredToken } from '../utils/date-utils';

// Section 2: Test Data
const TEST_EMAIL = 'reset-test@example.com';
const TEST_PASSWORD = 'NewPass123!';

// Section 3: Constants
const MSG = {
  SUCCESS: 'Email poruka poslana',
  EXPIRED: 'Link je istekao',
} as const;

// Section 4-5: Helpers & Function Constants (none needed)

// Section 6: Complex Functions (none needed)

// Section 7: Describe Blocks
/**
 * @testrail TC-042
 * @jira PROJ-123
 */
test.describe('Password Reset', () => {
  let resetPage: PasswordResetPage;

  test.beforeEach(async ({ page }) => {
    resetPage = new PasswordResetPage(page);
  });

  test('TC-042: Kompletna reset flow sa validnim podacima', async ({ page }) => {
    await resetPage.goto();
    await resetPage.fillEmail(TEST_EMAIL);
    await resetPage.submit();
    await resetPage.expectSuccessMessage();
  });
});
\`\`\`

---

### Faza 4: Quality Validacija
✅ Bez inline komentara u kodu
✅ Svi locatori u page objectu (ne u specu)
✅ MSG_* konstante za asertacije
✅ Bez waitForTimeout
✅ Test independence: svaki test kreira svoje podatke
✅ Grupisane asertacije

---

### Faza 5: Self-Verification
✅ Pokrenut spec: npx playwright test password-reset.spec.ts
✅ Rezultat: 1 passed, 0 failed
✅ JUnit: e2e/results/junit-results.xml — PASS
✅ Status: VERIFIED — kod je spreman

---

### 📤 TestRail Update
\`\`\`bash
testrail update-case TC-042 --automation-status automated --automation-ref "e2e/tests/password-reset.spec.ts"
\`\`\``,
    color: '#10b981',
    icon: '⚡',
    phases: [
      { name: 'Faza 1: Analiza', description: 'Izvlačenje locatora, akcija, asertacija iz recording-a' },
      { name: 'Faza 2: Odluka', description: 'Čitanje utils, reuse/create/update decision, blast-radius' },
      { name: 'Faza 3: Generisanje', description: 'Page object + spec sa striktnom 7-sekcijskom strukturom' },
      { name: 'Faza 4: Validacija', description: 'Quality checks: bez inline komentara, MSG_* konstante, test independence' },
      { name: 'Faza 5: Self-verification', description: 'Pokreni test, heal ako pada, STANI ako ne prolazi — pitaj korisnika' },
    ],
    integrations: [
      { name: 'TestRail CLI', command: 'testrail update-case <id> --automation-status automated', description: 'Označi test kao automatizovan u TestRail' },
    ],
  },
  {
    id: 'browser-validator',
    name: 'Browser Validator',
    tier: 2,
    model: 'Sonnet',
    shortDesc: 'Validiraj u browseru (Chrome/Playwright)',
    description: 'Izvršava test scenarije u stvarnom browseru. Koristi Playwright za pouzdanost. Hvata screenshot-ove i video zapise kao dokaz. Radi headless ili headed mode.',
    input: {
      label: 'Test Scenarios + App URL',
      placeholder: 'App URL: http://localhost:3000\nMode: headed (prikaži browser)\n\nScenarije za validaciju:\n- TS-01: Korisnik može dodati artikal u korpu\n- TS-02: Broj u korpi se odmah ažurira\n\nOpcionalno: Auth token ili login kredencijali',
      type: 'textarea',
    },
    outputExample: `## Browser Validation Report

### Environment
- URL: http://localhost:3000
- Browser: Chromium 120 (Playwright)
- Mode: headed (vidljiv)
- Timestamp: 2024-01-15 14:32:00
- Viewport: 1280x720

### Execution Results
| Scenario | Status | Duration | Evidence |
|----------|--------|----------|----------|
| TS-01: Add to cart | ✅ PASS | 2.3s | screenshot: ts01-pass.png |
| TS-02: Cart count update | ❌ FAIL | 3.1s | screenshot: ts02-fail.png, video: ts02.webm |

### Failure Details
**TS-02: Cart count ne ažurira**
- Step 3: Nakon klika "Add to Cart", count ostaje 0
- Expected: count = 1
- Actual: count = 0
- Network: POST /api/cart → 200 OK (uspješan API poziv)
- Console: Nema grešaka
- Root cause: UI ne re-renderuje nakon server action

### Screenshots & Videos
- evidence/ts01-pass.png ✅
- evidence/ts02-fail-before.png ✅
- evidence/ts02-fail-after.png ✅
- evidence/ts02.webm (video recording) ✅

### Performance Metrics
- Page load: 1.2s
- First action: 0.8s
- Total execution: 5.4s

### Verdict: 1 PASS / 1 FAIL
Preporuka: Popraviti revalidaciju u cart komponenti.

---

### 🔧 Troubleshooting (ako Chrome ne radi)
Ako browser ne otvara:
1. Instaliraj Playwright browsere: npx playwright install
2. Provjeri da app radi: curl http://localhost:3000
3. Probaj headless mode: dodaj "mode: headless" u input
4. Provjeri port: lsof -i :3000`,
    color: '#f59e0b',
    icon: '🌐',
  },
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    tier: 3,
    model: 'Sonnet',
    shortDesc: 'Full pipeline: PR → testovi → JIRA',
    description: 'Vodi kroz kompletan QA pipeline prilagođen tvojim zahtjevima: Functional Review → Test Design (ISTQB/TestRail) → Automation (5 faza) → Browser Validation → Bug Report (JIRA). Human-gated na kritičnim koracima.',
    input: {
      label: 'PR / Ticket / Feature opis',
      placeholder: 'PR #42: Password reset feature\nRepo: frontend\nAC:\n- Korisnik unosi email i prima reset link\n- Link važi 24h\n- Nova lozinka se postavlja\n\nTestRail Suite: "Authentication"\nJIRA Project: AUTH',
      type: 'textarea',
    },
    outputExample: `## Orchestration Pipeline

### Input
PR #42 — Password Reset Feature
Repo: frontend
TestRail Suite: Authentication
JIRA Project: AUTH

### Pipeline Steps

**Step 1: Functional Review** ✅
- Agent: functional-reviewer
- Input: PR #42 + AC
- Output: 2 gaps found, verdict REQUEST CHANGES
- Duration: 45s
- Artifacts: qa-output/functional-review.md

**Step 2: Test Scenario Design** ✅
- Agent: test-scenario-designer
- Input: AC from PR
- Output: 4 test cases (ISTQB format)
- TestRail Push: ✅ 4 cases added to "Authentication" suite
- Duration: 30s
- Artifacts: qa-output/test-scenarios.md, testrail-ids.json

**Step 3: Automation** ✅
- Agent: automation-writer
- Mode: CREATE (4 new tests)
- Faza 1-5: ✅ All passed
- Output: password-reset.page.ts + password-reset.spec.ts
- Self-verification: 4/4 tests passing
- TestRail Update: ✅ Marked as automated
- Duration: 3m 20s
- Artifacts: e2e/pages/password-reset.page.ts, e2e/tests/password-reset.spec.ts

**Step 4: Browser Validation** ✅
- Agent: browser-validator
- Input: 4 scenarios + localhost:3000
- Output: 3 PASS, 1 FAIL (TS-004: rate limiting)
- Duration: 2m 10s
- Artifacts: qa-output/browser-validation.md, evidence/*.png

**Step 5: Bug Report** ✅
- Agent: bug-reporter
- Input: TS-004 failure
- Output: Bug report created
- JIRA Push: ✅ AUTH-456 created
- Duration: 15s
- Artifacts: qa-output/bug-reports.md

### Pipeline Summary
- Total Duration: 6m 40s
- Tests Created: 4
- Tests Automated: 4
- Tests Passed: 3/4
- Bugs Found: 1 (AUTH-456)
- Human Interventions: 0

### Status: ✅ COMPLETE
Pipeline finished successfully. 1 bug reported to JIRA.

### Next Steps
1. Developer popravlja AUTH-456
2. Re-run pipeline nakon fix-a
3. Merge PR nakon sve prolazi`,
    color: '#a855f7',
    icon: '🎼',
  },
  {
    id: 'release-analyzer',
    name: 'Release Analyzer',
    tier: 3,
    model: 'Opus',
    shortDesc: 'Cross-repo release analiza',
    description: 'Analizira diff-ove kroz više repozitorijuma za release. Identifikuje cross-repo impact, AC compliance gap-ove i deployment rizike. Prijedlog: Koristi git log + diff range za svaki repo, agregira promjene, mapira na shared dependencies.',
    input: {
      label: 'Release info + Repos',
      placeholder: 'Release: v1.0 → v2.0\nRepos:\n- frontend (tag: v1.0..v2.0)\n- backend (tag: v1.0..v2.0)\n- shared-lib (tag: v1.0..v2.0)\n\nOpcionalno: Fokus na određeni modul (npr. "auth")',
      type: 'textarea',
    },
    outputExample: `## Release Analysis: v1.0 → v2.0

### Scope
- frontend: 47 commits, 23 files changed
- backend: 31 commits, 18 files changed
- shared-lib: 8 commits, 5 files changed

### Cross-Repo Impact Analysis
| Change | From | To | Risk | Mitigation |
|--------|------|-----|------|------------|
| Auth token format | backend | frontend | 🔴 HIGH | Deploy backend first, feature flag |
| New API /v2/orders | backend | frontend | 🟡 MEDIUM | Backward compatible, no immediate action |
| Validation rules | shared-lib | both | 🟢 LOW | Non-breaking, safe to deploy |

### Dependency Graph
shared-lib → backend → frontend
(shared-lib se mora deployati prvi)

### AC Compliance (across all repos)
- 12/14 ACs fully covered
- 2 ACs have gaps:
  - AC-07: Cross-repo error handling (frontend + backend)
  - AC-11: Shared validation messages (shared-lib)

### Deployment Risks
1. 🔴 **Breaking change**: Auth token format
   - Backend deploy MUST precede frontend
   - Feature flag required for gradual rollout
   
2. 🟡 **Database migration**: users table schema change
   - Run migration BEFORE backend deploy
   - Rollback plan: restore from backup
   
3. 🟢 **No breaking changes** to public API

### Deployment Order (recommended)
1. shared-lib (npm publish)
2. Database migration
3. backend (deploy + verify health)
4. frontend (deploy + smoke test)

### Regression Test Scope
- Full suite: 234 tests
- Focused (auth module): 47 tests
- Recommended: Run focused + 20% random sample

### Implementation Suggestion
Za buduću implementaciju ovog agenta:
\`\`\`bash
# 1. Dohvati diff-ove za svaki repo
for repo in frontend backend shared-lib; do
  git -C $repo log v1.0..v2.0 --oneline > /tmp/$repo-changes.txt
  git -C $repo diff v1.0..v2.0 --stat > /tmp/$repo-diff.txt
done

# 2. Analiziraj shared dependencies
grep -r "from '@company/shared-lib'" frontend/src backend/src

# 3. Mapiraj na AC-ove
# (Ovo radi LLM na osnovu diff-ova i AC liste)
\`\`\``,
    color: '#ec4899',
    icon: '📦',
  },
  {
    id: 'manual-validator',
    name: 'Manual Validator',
    tier: 3,
    model: 'Sonnet',
    shortDesc: 'Manual testiranje sa JIRA kontekstom',
    description: 'Vodi kroz manualno testiranje korak-po-korak sa kontekstom iz JIRA tiketa. Racionalan pristup — fokus na kritične path-ove, ne na sve moguće scenarije. Automatski povezuje nalaze sa JIRA ticketima.',
    input: {
      label: 'JIRA Ticket / Test Scope',
      placeholder: 'JIRA: AUTH-123\nSummary: Password reset feature\nAC:\n- Email input i submit\n- Link validnost 24h\n- New password postavljanje\n\nScope: Samo happy path + 2 edge case-a\nPriority: P0 features first',
      type: 'textarea',
    },
    outputExample: `## Manual Validation Guide — AUTH-123

### Context from JIRA
- **Ticket:** AUTH-123 — Password Reset Feature
- **Reporter:** John Doe
- **Assignee:** Jane Smith
- **Priority:** High
- **Sprint:** Sprint 23
- **Related:** AUTH-100 (Email service), AUTH-110 (Token validation)

### Rationalized Test Scope
Umjesto 15 testova, fokusiramo se na **5 kritičnih**:

| # | Scenario | Why | Time |
|---|----------|-----|------|
| 1 | Happy path: Full reset flow | Core functionality | 2 min |
| 2 | Expired link (>24h) | Security requirement | 1 min |
| 3 | Invalid email format | Basic validation | 30s |
| 4 | Password complexity | AC requirement | 1 min |
| 5 | Old password still works | Security check | 30s |

**Total estimated time:** 5 minutes (vs 20+ min za sve)

---

### Execution Guide

#### Test 1: Happy Path (2 min)
**Steps:**
1. Go to /forgot-password
2. Enter: valid-email@test.com
3. Click "Send reset link"
4. ✅ Verify: Success message appears
5. Open email, click link
6. Enter new password: Test123!
7. Confirm password: Test123!
8. Click "Reset"
9. ✅ Verify: Redirected to login
10. Login with NEW password → ✅ Success
11. Login with OLD password → ✅ Fails

**Result:** ☐ PASS ☐ FAIL ☐ BLOCKED
**Notes:** _______________________________

---

#### Test 2: Expired Link (1 min)
**Setup:** Use pre-generated expired token (ask dev or use test env)
**Steps:**
1. Navigate to /reset-password?token=expired-token-123
2. ✅ Verify: Error message "Link expired"
3. ✅ Verify: Link to request new reset

**Result:** ☐ PASS ☐ FAIL ☐ BLOCKED

---

#### Test 3: Invalid Email (30s)
**Steps:**
1. Enter: "not-an-email"
2. Click submit
3. ✅ Verify: Validation error shown

**Result:** ☐ PASS ☐ FAIL ☐ BLOCKED

---

#### Test 4: Password Complexity (1 min)
**Steps:**
1. Enter new password: "weak" (too short, no number)
2. ✅ Verify: Error "Min 8 chars, 1 number"
3. Enter: "StrongPass1!"
4. ✅ Verify: Accepted

**Result:** ☐ PASS ☐ FAIL ☐ BLOCKED

---

#### Test 5: Old Password Check (30s)
**Steps:**
1. After successful reset, try login with old password
2. ✅ Verify: Login fails

**Result:** ☐ PASS ☐ FAIL ☐ BLOCKED

---

### Summary Template
\`\`\`
Total: 5 tests
Passed: __ / 5
Failed: __ / 5
Blocked: __ / 5
Pass Rate: __%

Issues Found:
- [List any failures with steps to reproduce]

Blockers:
- [Any environment/setup issues]

Recommendation: ☐ Ready for release ☐ Needs fixes ☐ Blocked
\`\`\`

### 📤 JIRA Update
\`\`\`bash
jira comment AUTH-123 --body "Manual validation: 5/5 PASS. Ready for release."
jira transition AUTH-123 --to "QA Done"
\`\`\``,
    color: '#14b8a6',
    icon: '📝',
    integrations: [
      { name: 'JIRA CLI', command: 'jira comment <ticket> --body "..."', description: 'Dodaj komentar na JIRA ticket sa rezultatima' },
      { name: 'JIRA CLI', command: 'jira transition <ticket> --to "QA Done"', description: 'Promijeni status tiketa' },
    ],
  },
];
