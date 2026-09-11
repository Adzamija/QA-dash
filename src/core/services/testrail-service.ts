/**
 * TestRail API Service
 * Clean and robust TestRail API client with secure Basic Auth
 * Principal QA Automation Architect Implementation
 */

import { 
  TestRailConfig, 
  TestCase, 
  TestRailApiResponse, 
  BatchExportResult,
  TestStep 
} from '../types/test-scenario-designer';

export class TestRailService {
  private config: TestRailConfig;

  constructor(config: TestRailConfig) {
    this.config = config;
  }

  /**
   * Create Basic Auth header for TestRail API
   * TestRail uses email + API key as username:password
   */
  private getAuthHeader(): HeadersInit {
    const credentials = btoa(`${this.config.username}:${this.config.apiKey}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Build full API URL
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    return `${baseUrl}/index.php?/api/v2/${endpoint}`;
  }

  /**
   * Generic API request handler with error handling
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    data?: Record<string, any>
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.getAuthHeader(),
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TestRail API Error (${response.status}): ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during TestRail API call');
    }
  }

  /**
   * Get project information
   */
  async getProject(projectId: string): Promise<any> {
    return this.request<any>(`get_project/${projectId}`, 'GET');
  }

  /**
   * Get section information
   */
  async getSection(sectionId: string): Promise<any> {
    return this.request<any>(`get_section/${sectionId}`, 'GET');
  }

  /**
   * Convert TestCase steps to TestRail format
   * TestRail expects steps in a specific JSON format
   */
  private formatStepsForTestRail(steps: TestStep[]): string {
    const testRailSteps = steps.map((step, index) => ({
      step_id: index + 1,
      content: step.action,
      expected: step.expectedResult,
    }));

    return JSON.stringify(testRailSteps);
  }

  /**
   * Create a single test case in TestRail
   * Endpoint: add_case/:section_id
   */
  async createTestCase(testCase: TestCase): Promise<TestRailApiResponse> {
    try {
      const testData = {
        title: testCase.title,
        section_id: parseInt(this.config.sectionId),
        type_id: 3, // 3 = Test Case (standard test)
        priority_id: this.getPriorityId(testCase.priority),
        estimate: '5m', // Default estimate
        refs: testCase.jiraReference, // JIRA reference
        custom_steps_separated: this.formatStepsForTestRail(testCase.steps),
        custom_preconditions: testCase.preconditions.join('\n'),
        custom_automation_status: testCase.automationStatus,
        custom_verification_goal: testCase.verificationGoal,
      };

      const result = await this.request<any>('add_case', 'POST', testData);

      return {
        success: true,
        caseId: result.id,
        caseUrl: `${this.config.baseUrl}/index.php?/cases/view/${result.id}`,
        metadata: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create test case',
      };
    }
  }

  /**
   * Batch create multiple test cases
   * Handles errors gracefully and continues with remaining tests
   */
  async createTestCasesBatch(testCases: TestCase[]): Promise<BatchExportResult> {
    const results: BatchExportResult = {
      total: testCases.length,
      successful: 0,
      failed: 0,
      results: [],
      caseUrls: [],
    };

    for (const testCase of testCases) {
      if (!testCase.selected) {
        continue; // Skip unselected tests
      }

      try {
        const response = await this.createTestCase(testCase);
        
        if (response.success && response.caseId !== undefined) {
          results.successful++;
          results.results.push({
            testCaseId: testCase.id,
            success: true,
            testRailCaseId: response.caseId,
          });
          if (response.caseUrl) {
            results.caseUrls.push(response.caseUrl);
          }
        } else {
          results.failed++;
          results.results.push({
            testCaseId: testCase.id,
            success: false,
            error: response.error,
          });
        }
      } catch (error) {
        results.failed++;
        results.results.push({
          testCaseId: testCase.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Update existing test case in TestRail
   * Endpoint: update_case/:case_id
   */
  async updateTestCase(caseId: number, updates: Partial<TestCase>): Promise<TestRailApiResponse> {
    try {
      const testData: Record<string, any> = {};

      if (updates.title) testData.title = updates.title;
      if (updates.priority) testData.priority_id = this.getPriorityId(updates.priority);
      if (updates.automationStatus) {
        testData.custom_automation_status = updates.automationStatus;
      }
      if (updates.steps && updates.steps.length > 0) {
        testData.custom_steps_separated = this.formatStepsForTestRail(updates.steps);
      }

      const result = await this.request<any>(`update_case/${caseId}`, 'POST', testData);

      return {
        success: true,
        caseId: result.id,
        caseUrl: `${this.config.baseUrl}/index.php?/cases/view/${result.id}`,
        metadata: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update test case',
      };
    }
  }

  /**
   * Mark test case as automated in TestRail
   * Updates custom fields for automation status and reference
   */
  async markAsAutomated(
    caseId: number, 
    specFilePath: string,
    pageObjectPath?: string
  ): Promise<TestRailApiResponse> {
    return this.updateTestCase(caseId, {
      automationStatus: 'AUTOMATED',
    });
  }

  /**
   * Convert priority string to TestRail priority ID
   * P0 = 1 (Highest), P1 = 2, P2 = 3, P3 = 4 (Lowest)
   */
  private getPriorityId(priority: string): number {
    const priorityMap: Record<string, number> = {
      'P0': 1,
      'P1': 2,
      'P2': 3,
      'P3': 4,
    };
    return priorityMap[priority] || 3; // Default to P2
  }

  /**
   * Validate configuration before making API calls
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.baseUrl) {
      errors.push('TestRail Base URL is required');
    } else if (!this.config.baseUrl.startsWith('http')) {
      errors.push('Base URL must start with http:// or https://');
    }

    if (!this.config.username) {
      errors.push('TestRail username (email) is required');
    } else if (!this.config.username.includes('@')) {
      errors.push('Username must be a valid email address');
    }

    if (!this.config.apiKey) {
      errors.push('TestRail API Key is required');
    }

    if (!this.config.projectId) {
      errors.push('Project ID is required');
    }

    if (!this.config.sectionId) {
      errors.push('Section ID is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Factory function to create TestRailService instance
 */
export function createTestRailService(config: TestRailConfig): TestRailService {
  return new TestRailService(config);
}
