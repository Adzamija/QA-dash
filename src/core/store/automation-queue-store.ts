/**
 * Automation Queue Store
 * Reactive state management for synchronization between TestRail and Automation Writer
 * Principal QA Automation Architect Implementation
 */

import { AutomationQueueItem, AutomationStatus, TestCase } from '../types/test-scenario-designer';

/**
 * localStorage key for persistence
 */
const QUEUE_STORAGE_KEY = 'qa-dash-automation-queue';

/**
 * Automation Queue Store Class
 * Manages the queue of test cases waiting for automation
 */
export class AutomationQueueStore {
  private items: AutomationQueueItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        this.items = parsed.map((item: any) => ({
          ...item,
          queuedAt: new Date(item.queuedAt),
          automationStartedAt: item.automationStartedAt ? new Date(item.automationStartedAt) : undefined,
          automationCompletedAt: item.automationCompletedAt ? new Date(item.automationCompletedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load automation queue from storage:', error);
      this.items = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Failed to save automation queue to storage:', error);
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Add test cases to automation queue
   * Called after successful TestRail export
   */
  addTestCases(testCases: TestCase[]): AutomationQueueItem[] {
    const newItems: AutomationQueueItem[] = testCases
      .filter(tc => tc.selected && tc.testRailCaseId !== undefined)
      .map(tc => ({
        queueId: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        testRailCaseId: tc.testRailCaseId!,
        title: tc.title,
        steps: tc.steps,
        jiraKey: tc.jiraReference,
        status: 'PENDING_AUTOMATION' as const,
        queuedAt: new Date(),
      }));

    this.items = [...this.items, ...newItems];
    this.saveToStorage();
    this.notifyListeners();

    return newItems;
  }

  /**
   * Get all queue items
   */
  getAllItems(): AutomationQueueItem[] {
    return [...this.items];
  }

  /**
   * Get queue items filtered by status
   */
  getItemsByStatus(status: AutomationStatus): AutomationQueueItem[] {
    return this.items.filter(item => item.status === status);
  }

  /**
   * Get pending items for Automation Writer
   */
  getPendingItems(): AutomationQueueItem[] {
    return this.getItemsByStatus('PENDING_AUTOMATION');
  }

  /**
   * Get item by TestRail Case ID
   */
  getItemByTestRailId(caseId: number): AutomationQueueItem | undefined {
    return this.items.find(item => item.testRailCaseId === caseId);
  }

  /**
   * Get item by queue ID
   */
  getItemById(queueId: string): AutomationQueueItem | undefined {
    return this.items.find(item => item.queueId === queueId);
  }

  /**
   * Update item status to AUTOMATION_STARTED
   */
  startAutomation(queueId: string): boolean {
    const index = this.items.findIndex(item => item.queueId === queueId);
    if (index === -1 || this.items[index].status !== 'PENDING_AUTOMATION') {
      return false;
    }

    this.items[index] = {
      ...this.items[index],
      status: 'PENDING_AUTOMATION', // Could add 'IN_PROGRESS' status if needed
      automationStartedAt: new Date(),
    };

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Mark item as successfully automated
   */
  markAsAutomated(
    queueId: string, 
    specFilePath: string, 
    pageObjectPath?: string
  ): boolean {
    const index = this.items.findIndex(item => item.queueId === queueId);
    if (index === -1) {
      return false;
    }

    this.items[index] = {
      ...this.items[index],
      status: 'AUTOMATED',
      specFilePath,
      pageObjectPath,
      automationCompletedAt: new Date(),
    };

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Mark item as failed automation
   */
  markAsFailed(queueId: string, errorMessage: string): boolean {
    const index = this.items.findIndex(item => item.queueId === queueId);
    if (index === -1) {
      return false;
    }

    this.items[index] = {
      ...this.items[index],
      status: 'FAILED_AUTOMATION',
      errorMessage,
      automationCompletedAt: new Date(),
    };

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Remove item from queue (e.g., after successful automation)
   */
  removeItem(queueId: string): boolean {
    const index = this.items.findIndex(item => item.queueId === queueId);
    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Clear completed items (automated or failed)
   */
  clearCompleted(): number {
    const initialLength = this.items.length;
    this.items = this.items.filter(
      item => item.status === 'PENDING_AUTOMATION' || item.status === 'NOT_AUTOMATED'
    );
    const removedCount = initialLength - this.items.length;
    
    if (removedCount > 0) {
      this.saveToStorage();
      this.notifyListeners();
    }
    
    return removedCount;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    pending: number;
    automated: number;
    failed: number;
  } {
    return {
      total: this.items.length,
      pending: this.getItemsByStatus('PENDING_AUTOMATION').length,
      automated: this.getItemsByStatus('AUTOMATED').length,
      failed: this.getItemsByStatus('FAILED_AUTOMATION').length,
    };
  }

  /**
   * Clear entire queue
   */
  clearAll(): void {
    this.items = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}

/**
 * Singleton instance for global queue management
 */
let globalQueueStore: AutomationQueueStore | null = null;

export function getAutomationQueueStore(): AutomationQueueStore {
  if (!globalQueueStore) {
    globalQueueStore = new AutomationQueueStore();
  }
  return globalQueueStore;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetAutomationQueueStore(): void {
  globalQueueStore = null;
}
