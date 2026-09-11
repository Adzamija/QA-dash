import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface TokenConfig {
  claude: {
    apiKey: string;
    model: string;
  };
  github: {
    token: string;
    apiUrl: string;
  };
  azure: {
    pat: string;
    orgUrl: string;
    project: string;
  };
  testrail: {
    url: string;
    username: string;
    apiKey: string;
    projectId: string;
  };
  jira: {
    baseUrl: string;
    email: string;
    apiToken: string;
    projectKey: string;
  };
  playwright: {
    baseUrl: string;
    browser: string;
    headless: boolean;
    timeout: number;
    screenshotDir: string;
    videoDir: string;
  };
}

interface TokensContextType {
  tokens: TokenConfig;
  updateTokens: (updates: Partial<TokenConfig>) => void;
  resetTokens: () => void;
  isConfigured: (service: keyof TokenConfig) => boolean;
}

const defaultTokens: TokenConfig = {
  claude: {
    apiKey: '',
    model: 'claude-3-5-sonnet-20241022',
  },
  github: {
    token: '',
    apiUrl: 'https://api.github.com',
  },
  azure: {
    pat: '',
    orgUrl: '',
    project: '',
  },
  testrail: {
    url: '',
    username: '',
    apiKey: '',
    projectId: '1',
  },
  jira: {
    baseUrl: '',
    email: '',
    apiToken: '',
    projectKey: 'QA',
  },
  playwright: {
    baseUrl: 'http://localhost:3000',
    browser: 'chromium',
    headless: false,
    timeout: 30000,
    screenshotDir: './evidence/screenshots',
    videoDir: './evidence/videos',
  },
};

const TokensContext = createContext<TokensContextType | undefined>(undefined);

export function TokensProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<TokenConfig>(defaultTokens);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('qa-lite-tokens');
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
    }
  }, []);

  const updateTokens = (updates: Partial<TokenConfig>) => {
    const updatedTokens = { ...tokens, ...updates };
    setTokens(updatedTokens);
    localStorage.setItem('qa-lite-tokens', JSON.stringify(updatedTokens));
  };

  const resetTokens = () => {
    setTokens(defaultTokens);
    localStorage.setItem('qa-lite-tokens', JSON.stringify(defaultTokens));
  };

  const isConfigured = (service: keyof TokenConfig): boolean => {
    const serviceConfig = tokens[service];
    if (!serviceConfig) return false;

    // Check if at least one required field is filled
    const values = Object.values(serviceConfig);
    return values.some((val) => val !== '' && val !== null && val !== undefined);
  };

  return (
    <TokensContext.Provider value={{ tokens, updateTokens, resetTokens, isConfigured }}>
      {children}
    </TokensContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokensContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokensProvider');
  }
  return context;
}
