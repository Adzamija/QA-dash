/**
 * VCS (Version Control System) Router
 * Detects provider (GitHub vs Azure DevOps) and routes to appropriate CLI/MCP
 * Task 3: Intelligent VCS Routing
 */

export type VcsProvider = 'GITHUB' | 'AZURE_DEVOPS' | 'UNKNOWN';

export interface ParsedPrUrl {
  provider: VcsProvider;
  prNumber: string;
  ownerOrOrg: string;
  repoName: string;
  baseUrl: string;
}

/**
 * Detects VCS provider from URL pattern
 */
export function detectVcsProvider(url: string): VcsProvider {
  const normalizedUrl = url.toLowerCase().trim();
  
  if (normalizedUrl.includes('github.com')) {
    return 'GITHUB';
  }
  
  if (normalizedUrl.includes('dev.azure.com') || normalizedUrl.includes('visualstudio.com')) {
    return 'AZURE_DEVOPS';
  }
  
  return 'UNKNOWN';
}

/**
 * Parses PR URL into structured data
 */
export function parsePrUrl(url: string): ParsedPrUrl | null {
  const provider = detectVcsProvider(url);
  
  try {
    const urlObj = new URL(url.trim());
    
    if (provider === 'GITHUB') {
      // Format: https://github.com/{owner}/{repo}/pull/{number}
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const pullIndex = pathParts.findIndex(p => p === 'pull');
      
      if (pullIndex === -1 || pullIndex + 1 >= pathParts.length) {
        return null;
      }
      
      return {
        provider: 'GITHUB',
        ownerOrOrg: pathParts[0],
        repoName: pathParts[1],
        prNumber: pathParts[pullIndex + 1],
        baseUrl: 'https://github.com',
      };
    }
    
    if (provider === 'AZURE_DEVOPS') {
      // Format: https://dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{id}
      // Or: https://{org}.visualstudio.com/{project}/_git/{repo}/pullrequest/{id}
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const prIndex = pathParts.findIndex(p => p === 'pullrequest');
      
      if (prIndex === -1 || prIndex + 1 >= pathParts.length) {
        return null;
      }
      
      const org = pathParts[0];
      const project = pathParts[1];
      const repoIndex = pathParts.findIndex(p => p === '_git');
      const repoName = repoIndex !== -1 && repoIndex + 1 < pathParts.length ? pathParts[repoIndex + 1] : project;
      
      return {
        provider: 'AZURE_DEVOPS',
        ownerOrOrg: org,
        repoName: repoName,
        prNumber: pathParts[prIndex + 1],
        baseUrl: urlObj.origin,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Generates appropriate CLI command based on provider
 */
export function generateDiffCommand(provider: VcsProvider, parsedUrl: ParsedPrUrl): string {
  if (provider === 'GITHUB') {
    // gh pr diff {pr_number} --repo {owner}/{repo}
    return `gh pr diff ${parsedUrl.prNumber} --repo ${parsedUrl.ownerOrOrg}/${parsedUrl.repoName}`;
  }
  
  if (provider === 'AZURE_DEVOPS') {
    // az repos pr show --id {pr_id} --org {org_url}
    return `az repos pr show --id ${parsedUrl.prNumber} --org ${parsedUrl.baseUrl}`;
  }
  
  throw new Error(`Unknown VCS provider: ${provider}`);
}

/**
 * Generates appropriate MCP tool name
 */
export function getMcpToolName(provider: VcsProvider): string {
  if (provider === 'GITHUB') {
    return 'github_pr_diff';
  }
  
  if (provider === 'AZURE_DEVOPS') {
    return 'azure_devops_pr_diff';
  }
  
  throw new Error(`Unknown VCS provider: ${provider}`);
}

/**
 * Validates if URL is a valid PR link for the detected provider
 */
export function isValidPrUrl(url: string): boolean {
  const parsed = parsePrUrl(url);
  return parsed !== null && parsed.provider !== 'UNKNOWN';
}

/**
 * Gets error message for invalid URL
 */
export function getInvalidUrlErrorMessage(url: string): string {
  const provider = detectVcsProvider(url);
  
  if (provider === 'UNKNOWN') {
    return `Invalid URL format. Please provide a valid GitHub or Azure DevOps PR URL.`;
  }
  
  if (provider === 'GITHUB') {
    return `Invalid GitHub PR URL. Expected format: https://github.com/{owner}/{repo}/pull/{number}`;
  }
  
  if (provider === 'AZURE_DEVOPS') {
    return `Invalid Azure DevOps PR URL. Expected format: https://dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{id}`;
  }
  
  return `Invalid URL format.`;
}
