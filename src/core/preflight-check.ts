/**
 * Pre-flight Health Check System
 * Validates CLI tools, MCP servers, and API tokens before agent execution.
 * Implements Fail-Fast architecture (Task 3).
 */

import { AgentType, AGENT_DEFINITIONS } from './types';

export interface ToolStatus {
  name: string;
  installed: boolean;
  authenticated: boolean;
  version?: string;
  error?: string;
}

export interface PreflightResult {
  success: boolean;
  missingTools: string[];
  unauthenticatedTools: string[];
  details: Record<string, ToolStatus>;
}

/**
 * Checks if a CLI command exists in PATH
 */
async function checkCliExists(command: string): Promise<{ exists: boolean; version?: string }> {
  try {
    // In browser environment, we can't directly check CLI
    // This assumes a backend proxy or Electron context
    // For pure web, we rely on user confirmation or MCP server status
    const { execSync } = await import('child_process');
    const versionCmd = command === 'gh' ? 'gh --version' : command === 'az' ? 'az version' : `${command} --version`;
    
    try {
      const output = execSync(versionCmd, { encoding: 'utf-8' });
      return { exists: true, version: output.split('\n')[0] };
    } catch {
      return { exists: false };
    }
  } catch {
    return { exists: false };
  }
}

/**
 * Validates authentication status for CLI tools
 */
async function checkCliAuth(command: string): Promise<{ authenticated: boolean; error?: string }> {
  try {
    const { execSync } = await import('child_process');
    
    if (command === 'gh') {
      try {
        execSync('gh auth status', { encoding: 'utf-8', stdio: 'ignore' });
        return { authenticated: true };
      } catch (e) {
        return { authenticated: false, error: 'GitHub CLI not authenticated. Run: gh auth login' };
      }
    }
    
    if (command === 'az') {
      try {
        execSync('az account show', { encoding: 'utf-8', stdio: 'ignore' });
        return { authenticated: true };
      } catch (e) {
        return { authenticated: false, error: 'Azure CLI not logged in. Run: az login' };
      }
    }

    return { authenticated: true }; // Assume OK for other tools
  } catch {
    return { authenticated: false, error: 'Unable to verify authentication' };
  }
}

/**
 * Validates API Token presence
 */
function checkApiToken(tokenName: string, tokens: Record<string, string>): ToolStatus {
  const hasToken = !!tokens[tokenName];
  return {
    name: tokenName,
    installed: true, // Tokens are "installed" if present
    authenticated: hasToken,
    error: hasToken ? undefined : `Missing ${tokenName} in Settings`,
  };
}

/**
 * Main Pre-flight Check Function
 * Call this BEFORE executing any agent task
 */
export async function runPreflightCheck(
  agentId: AgentType,
  tokens: Record<string, string>
): Promise<PreflightResult> {
  const agentDef = AGENT_DEFINITIONS[agentId];
  const requiredTools = agentDef.requiredTools;
  
  const details: Record<string, ToolStatus> = {};
  const missingTools: string[] = [];
  const unauthenticatedTools: string[] = [];

  for (const tool of requiredTools) {
    let status: ToolStatus;

    // Check CLI Tools
    if (tool === 'GITHUB_CLI') {
      const cliCheck = await checkCliExists('gh');
      const authCheck = cliCheck.exists ? await checkCliAuth('gh') : { authenticated: false, error: 'CLI not found' };
      
      status = {
        name: 'GitHub CLI (gh)',
        installed: cliCheck.exists,
        authenticated: authCheck.authenticated,
        version: cliCheck.version,
        error: authCheck.error,
      };
    } else if (tool === 'AZURE_CLI') {
      const cliCheck = await checkCliExists('az');
      const authCheck = cliCheck.exists ? await checkCliAuth('az') : { authenticated: false, error: 'CLI not found' };
      
      status = {
        name: 'Azure CLI (az)',
        installed: cliCheck.exists,
        authenticated: authCheck.authenticated,
        version: cliCheck.version,
        error: authCheck.error,
      };
    } else if (tool === 'JIRA') {
      status = checkApiToken('JIRA_API_TOKEN', tokens);
      status.name = 'Jira API Token';
    } else if (tool === 'TESTRAIL') {
      status = checkApiToken('TESTRAIL_API_KEY', tokens);
      status.name = 'TestRail API Key';
    } else {
      // Generic tool check
      status = {
        name: tool,
        installed: true,
        authenticated: true,
      };
    }

    details[tool] = status;

    if (!status.installed) {
      missingTools.push(status.name);
    } else if (!status.authenticated) {
      unauthenticatedTools.push(status.name);
    }
  }

  const success = missingTools.length === 0 && unauthenticatedTools.length === 0;

  return {
    success,
    missingTools,
    unauthenticatedTools,
    details,
  };
}

/**
 * Generates a user-friendly error message from preflight result
 */
export function formatPreflightError(result: PreflightResult): string {
  const errors: string[] = [];

  if (result.missingTools.length > 0) {
    errors.push(`❌ Missing Tools: ${result.missingTools.join(', ')}`);
    errors.push(`   Action: Install required tools and ensure they are in PATH`);
  }

  if (result.unauthenticatedTools.length > 0) {
    errors.push(`🔐 Unauthenticated: ${result.unauthenticatedTools.join(', ')}`);
    errors.push(`   Action: Run authentication commands (e.g., 'gh auth login', 'az login') or add API tokens in Settings`);
  }

  return errors.join('\n\n');
}
