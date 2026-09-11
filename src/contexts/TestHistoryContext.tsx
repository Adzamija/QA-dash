import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AgentId } from '../data/agents';

export interface TestRun {
  id: string;
  agentId: AgentId;
  agentName: string;
  input: string;
  output: string;
  timestamp: string;
  userId: string;
  status: 'success' | 'failed';
  duration?: number;
  notes?: string;
}

interface TestHistoryContextType {
  testRuns: TestRun[];
  addTestRun: (run: Omit<TestRun, 'id' | 'timestamp'>) => void;
  deleteTestRun: (id: string) => void;
  clearHistory: () => void;
  getTestRunsByAgent: (agentId: AgentId) => TestRun[];
  getTestRunsByUser: (userId: string) => TestRun[];
}

const TestHistoryContext = createContext<TestHistoryContextType | undefined>(undefined);

export function TestHistoryProvider({ children }: { children: ReactNode }) {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  // Load test runs from localStorage on mount
  useEffect(() => {
    const storedRuns = localStorage.getItem('qa-lite-test-history');
    if (storedRuns) {
      setTestRuns(JSON.parse(storedRuns));
    }
  }, []);

  const addTestRun = (run: Omit<TestRun, 'id' | 'timestamp'>) => {
    const newRun: TestRun = {
      ...run,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updatedRuns = [newRun, ...testRuns];
    setTestRuns(updatedRuns);
    localStorage.setItem('qa-lite-test-history', JSON.stringify(updatedRuns));
  };

  const deleteTestRun = (id: string) => {
    const updatedRuns = testRuns.filter((run) => run.id !== id);
    setTestRuns(updatedRuns);
    localStorage.setItem('qa-lite-test-history', JSON.stringify(updatedRuns));
  };

  const clearHistory = () => {
    setTestRuns([]);
    localStorage.setItem('qa-lite-test-history', JSON.stringify([]));
  };

  const getTestRunsByAgent = (agentId: AgentId): TestRun[] => {
    return testRuns.filter((run) => run.agentId === agentId);
  };

  const getTestRunsByUser = (userId: string): TestRun[] => {
    return testRuns.filter((run) => run.userId === userId);
  };

  return (
    <TestHistoryContext.Provider
      value={{
        testRuns,
        addTestRun,
        deleteTestRun,
        clearHistory,
        getTestRunsByAgent,
        getTestRunsByUser,
      }}
    >
      {children}
    </TestHistoryContext.Provider>
  );
}

export function useTestHistory() {
  const context = useContext(TestHistoryContext);
  if (context === undefined) {
    throw new Error('useTestHistory must be used within a TestHistoryProvider');
  }
  return context;
}
