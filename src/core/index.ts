/**
 * Core Module Exports for @qa-dash/core
 * Principal QA Automation Architect Implementation
 */

// Types
export * from './types/test-scenario-designer';

// Services
export { TestRailService, createTestRailService } from './services/testrail-service';
export { 
  generateISTQBSystemPrompt, 
  generateUserPrompt, 
  parseTestCasesFromResponse,
  generateFullPrompt 
} from './services/test-case-generator';

// Store
export { 
  AutomationQueueStore, 
  getAutomationQueueStore, 
  resetAutomationQueueStore 
} from './store/automation-queue-store';
