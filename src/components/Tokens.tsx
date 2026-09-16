import { useState } from 'react';
import { useTokens } from '../contexts/TokensContext';

export function Tokens() {
  const { tokens, updateTokens, isConfigured } = useTokens();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const toggleShowKey = (key: string) => {
    setShowKeys({ ...showKeys, [key]: !showKeys[key] });
  };

  const handleSave = async (service: string, field: string, value: string) => {
    setSaveStatus(prev => ({ ...prev, [`${service}-${field}`]: 'saving' }));
    
    try {
      // Simulate a brief delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateTokens({
        [service]: {
          ...tokens[service as keyof typeof tokens],
          [field]: value,
        },
      } as any);
      
      setSaveStatus(prev => ({ ...prev, [`${service}-${field}`]: 'success' }));
      setLastSaved(new Date());
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [`${service}-${field}`]: 'idle' }));
      }, 2000);
    } catch (error) {
      setSaveStatus(prev => ({ ...prev, [`${service}-${field}`]: 'error' }));
      console.error('Failed to save token:', error);
    }
  };

  const services = [
    {
      id: 'claude',
      name: 'Claude AI',
      icon: '🤖',
      color: '#8b5cf6',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'model', label: 'Model', type: 'text', required: false },
      ],
    },
    {
      id: 'github',
      name: 'GitHub CLI',
      icon: '🐙',
      color: '#24292e',
      fields: [
        { key: 'token', label: 'Personal Access Token', type: 'password', required: true },
        { key: 'apiUrl', label: 'API URL', type: 'text', required: false },
      ],
    },
    {
      id: 'azure',
      name: 'Azure DevOps',
      icon: '☁️',
      color: '#0078d4',
      fields: [
        { key: 'pat', label: 'Personal Access Token', type: 'password', required: true },
        { key: 'orgUrl', label: 'Organization URL', type: 'text', required: true },
        { key: 'project', label: 'Project Name', type: 'text', required: true },
      ],
    },
    {
      id: 'testrail',
      name: 'TestRail',
      icon: '📋',
      color: '#6366f1',
      fields: [
        { key: 'url', label: 'Instance URL', type: 'text', required: true },
        { key: 'username', label: 'Username/Email', type: 'text', required: true },
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'projectId', label: 'Project ID', type: 'text', required: false },
      ],
    },
    {
      id: 'jira',
      name: 'JIRA',
      icon: '🎫',
      color: '#0052cc',
      fields: [
        { key: 'baseUrl', label: 'Base URL', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true },
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
        { key: 'projectKey', label: 'Project Key', type: 'text', required: false },
      ],
    },
    {
      id: 'playwright',
      name: 'Playwright',
      icon: '🎭',
      color: '#2e7d32',
      fields: [
        { key: 'baseUrl', label: 'App Base URL', type: 'text', required: false },
        { key: 'browser', label: 'Browser', type: 'text', required: false },
        { key: 'headless', label: 'Headless Mode', type: 'checkbox', required: false },
        { key: 'timeout', label: 'Timeout (ms)', type: 'number', required: false },
        { key: 'screenshotDir', label: 'Screenshot Directory', type: 'text', required: false },
        { key: 'videoDir', label: 'Video Directory', type: 'text', required: false },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {/* Header with Save Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">API Tokens</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage all your API keys and credentials in one place
          </p>
        </div>
        {lastSaved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/30 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Status Overview */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-3">Configuration Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((service) => {
            const configured = isConfigured(service.id as any);
            return (
              <div
                key={service.id}
                className={`p-3 rounded-lg border ${
                  configured ? 'bg-success/10 border-success/30' : 'bg-surface-2 border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{service.icon}</span>
                  <span className="text-xs font-medium text-text">{service.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      configured ? 'bg-success' : 'bg-warning'
                    }`}
                  />
                  <span className="text-[10px] text-text-muted">
                    {configured ? 'Configured' : 'Not configured'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services */}
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{service.icon}</span>
              <div>
                <h2 className="text-sm font-semibold text-text">{service.name}</h2>
                <p className="text-xs text-text-muted">
                  {isConfigured(service.id as any) ? '✓ Configured' : 'Not configured'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {service.fields.map((field) => {
                const value = (tokens as any)[service.id]?.[field.key] || '';
                const fieldKey = `${service.id}-${field.key}`;
                const isVisible = showKeys[fieldKey];

                return (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-text mb-1">
                      {field.label}
                      {field.required && <span className="text-danger ml-1">*</span>}
                    </label>
                    <div className="relative">
                      {field.type === 'password' ? (
                        <>
                          <input
                            type={isVisible ? 'text' : 'password'}
                            value={value}
                            onChange={(e) => handleSave(service.id, field.key, e.target.value)}
                            onBlur={() => {
                              const status = saveStatus[`${service.id}-${field.key}`];
                              if (status === 'success') {
                                setTimeout(() => {
                                  setSaveStatus(prev => ({ ...prev, [`${service.id}-${field.key}`]: 'idle' }));
                                }, 1000);
                              }
                            }}
                            className={`w-full px-3 py-2 pr-10 bg-surface-2 border rounded-lg text-sm text-text focus:outline-none transition-colors ${
                              saveStatus[`${service.id}-${field.key}`] === 'saving' 
                                ? 'border-accent animate-pulse' 
                                : saveStatus[`${service.id}-${field.key}`] === 'success'
                                ? 'border-success bg-success/5'
                                : saveStatus[`${service.id}-${field.key}`] === 'error'
                                ? 'border-danger bg-danger/5'
                                : 'border-border focus:border-accent'
                            }`}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(fieldKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                          >
                            {isVisible ? '🙈' : '👁️'}
                          </button>
                          {/* Save Status Indicator */}
                          {saveStatus[`${service.id}-${field.key}`] === 'saving' && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          {saveStatus[`${service.id}-${field.key}`] === 'success' && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-success">
                              ✓
                            </div>
                          )}
                          {saveStatus[`${service.id}-${field.key}`] === 'error' && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-danger">
                              ✗
                            </div>
                          )}
                        </>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSave(service.id, field.key, e.target.checked.toString())}
                            className="w-4 h-4 rounded border-border bg-surface-2 text-accent focus:ring-accent"
                          />
                          <span className="text-xs text-text-muted">Enabled</span>
                        </label>
                      ) : (
                        <input
                          type={field.type}
                          value={value}
                          onChange={(e) => handleSave(service.id, field.key, e.target.value)}
                          className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CLI Access Info */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-2">🔗 CLI Access</h2>
        <p className="text-xs text-text-muted mb-3">
          After configuring your tokens, you can use CLI tools directly from your terminal.
          The tokens are saved locally and will be used automatically.
        </p>
        <div className="space-y-2">
          <div className="bg-bg p-3 rounded-lg border border-border">
            <p className="text-xs font-medium text-text mb-1">GitHub CLI</p>
            <code className="text-[10px] text-text-muted code-font">gh pr view 42 --json files</code>
          </div>
          <div className="bg-bg p-3 rounded-lg border border-border">
            <p className="text-xs font-medium text-text mb-1">JIRA CLI</p>
            <code className="text-[10px] text-text-muted code-font">jira create --project QA --type Bug</code>
          </div>
          <div className="bg-bg p-3 rounded-lg border border-border">
            <p className="text-xs font-medium text-text mb-1">TestRail CLI</p>
            <code className="text-[10px] text-text-muted code-font">testrail add-cases --suite "Auth"</code>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-warning mb-2">🔒 Security</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          All tokens are stored locally in your browser's localStorage. They are never sent to external servers
          except when making API calls to the respective services. Clear browser data to remove all tokens.
        </p>
      </div>
    </div>
  );
}
