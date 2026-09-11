import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TokensProvider } from './contexts/TokensContext';
import { TestHistoryProvider } from './contexts/TestHistoryContext';
import { Sidebar } from './components/Sidebar';
import { AgentView } from './components/AgentView';
import { Overview } from './components/Overview';
import { Tokens } from './components/Tokens';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { Login } from './components/Login';
import { agents, type AgentId } from './data/agents';

type ViewType = AgentId | 'overview' | 'tokens' | 'settings' | 'history';

function AppContent() {
  const { user } = useAuth();
  const [activeAgent, setActiveAgent] = useState<ViewType>('overview');

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        agents={agents}
        activeAgent={activeAgent}
        onSelect={setActiveAgent}
      />
      <main className="flex-1 overflow-y-auto">
        {activeAgent === 'overview' ? (
          <Overview agents={agents} onSelect={setActiveAgent} />
        ) : activeAgent === 'tokens' ? (
          <Tokens />
        ) : activeAgent === 'settings' ? (
          <Settings />
        ) : activeAgent === 'history' ? (
          <History />
        ) : (
          <AgentView agent={agents.find(a => a.id === activeAgent)!} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TokensProvider>
        <TestHistoryProvider>
          <AppContent />
        </TestHistoryProvider>
      </TokensProvider>
    </AuthProvider>
  );
}
