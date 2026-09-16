/**
 * Jira API Integration Service
 * 
 * Provides robust integration with Jira REST API v3 for fetching ticket details.
 * Supports both Jira Cloud and Server/Data Center instances.
 * 
 * @module services/jira-service
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Normalized Jira Ticket Data Structure
 * Extracted and standardized from various Jira response formats
 */
export interface JiraTicketData {
  key: string;
  id: string;
  summary: string;
  description: string; // Plain text normalized from ADF or HTML
  acceptanceCriteria: string; // Extracted from custom fields or description
  issueType: string;
  status: string;
  priority: string;
  labels: string[];
  components: string[];
  fixVersions: string[];
  reporter: {
    displayName: string;
    emailAddress?: string;
  };
  assignee: {
    displayName: string;
    emailAddress?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  rawResponse: any; // Keep raw response for debugging if needed
}

/**
 * Configuration for Jira client
 */
interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
  isCloud: boolean;
}

/**
 * Jira Service Class
 * Handles all communication with Jira REST API
 */
class JiraService {
  private client: AxiosInstance;
  private config: JiraConfig | null = null;

  constructor() {
    this.initializeConfig();
  }

  /**
   * Initialize Jira configuration from environment variables
   * Throws error if required configuration is missing
   */
  private initializeConfig(): void {
    const host = process.env.JIRA_HOST;
    const email = process.env.JIRA_EMAIL;
    const apiToken = process.env.JIRA_API_TOKEN;

    if (!host || !email || !apiToken) {
      const missingVars = [];
      if (!host) missingVars.push('JIRA_HOST');
      if (!email) missingVars.push('JIRA_EMAIL');
      if (!apiToken) missingVars.push('JIRA_API_TOKEN');
      
      throw new Error(
        `[Jira Configuration Error] Missing required environment variables: ${missingVars.join(', ')}. ` +
        `Please check your .env.local file.`
      );
    }

    // Determine if this is a Jira Cloud instance
    const isCloud = host.includes('atlassian.net') || host.includes('jira.com');

    this.config = {
      host: host.replace(/\/$/, ''), // Remove trailing slash if present
      email,
      apiToken,
      isCloud
    };

    // Initialize Axios client with base configuration
    this.client = axios.create({
      baseURL: `${this.config.host}/rest/api/3`,
      auth: {
        username: this.config.email,
        password: this.config.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    });
  }

  /**
   * Parse Atlassian Document Format (ADF) to plain text
   * Used for Jira Cloud instances where description is in ADF
   */
  private parseADFToText(adfContent: any): string {
    if (!adfContent || !adfContent.content) {
      return '';
    }

    let text = '';
    
    const traverseNodes = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.type === 'text') {
          text += node.text || '';
        } else if (node.type === 'paragraph') {
          if (node.content) {
            traverseNodes(node.content);
          }
          text += '\n';
        } else if (node.type === 'heading') {
          if (node.content) {
            traverseNodes(node.content);
          }
          text += '\n\n';
        } else if (node.type === 'bulletList' || node.type === 'orderedList') {
          if (node.content) {
            traverseNodes(node.content);
          }
        } else if (node.type === 'listItem') {
          text += '• ';
          if (node.content) {
            traverseNodes(node.content);
          }
          text += '\n';
        } else if (node.content) {
          traverseNodes(node.content);
        }
      });
    };

    traverseNodes(adfContent.content);
    return text.trim();
  }

  /**
   * Extract acceptance criteria from ticket
   * Looks for common patterns in description or custom fields
   */
  private extractAcceptanceCriteria(description: string, rawFields: any): string {
    // Try to extract from common AC patterns in description
    const acPatterns = [
      /acceptance\s*criteria?\s*:?\s*([\s\S]*?)(?=notes:|$)/i,
      /given\s+when\s+then([\s\S]*?)(?=given|$)/i,
      /scenario\s*:?\s*([\s\S]*?)(?=scenario|$)/i,
      /test\s*cases?\s*:?\s*([\s\S]*?)(?=notes:|$)/i
    ];

    for (const pattern of acPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Try custom fields (common AC field IDs)
    const acFieldIds = ['customfield_10007', 'customfield_10016', 'customfield_12345'];
    for (const fieldId of acFieldIds) {
      if (rawFields[fieldId]) {
        if (typeof rawFields[fieldId] === 'string') {
          return rawFields[fieldId];
        }
        // Handle ADF in custom fields
        if (rawFields[fieldId].content) {
          return this.parseADFToText(rawFields[fieldId]);
        }
      }
    }

    // If no explicit AC found, return empty - user will need to infer from description
    return '';
  }

  /**
   * Fetch a Jira ticket by key
   * 
   * @param ticketKey - The Jira ticket key (e.g., 'PROJ-1234')
   * @returns Promise<JiraTicketData> - Normalized ticket data
   * @throws Error if ticket not found, unauthorized, or network error
   */
  async fetchJiraTicket(ticketKey: string): Promise<JiraTicketData> {
    if (!this.config) {
      throw new Error('[Jira Error] Configuration not initialized. Check environment variables.');
    }

    try {
      // Fetch ticket with expanded fields to get all necessary data
      const expandParams = 'renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations';
      const response = await this.client.get(`/issue/${ticketKey}`, {
        params: { expand: expandParams }
      });

      const issue = response.data;
      const fields = issue.fields;

      // Parse description (handle both ADF for Cloud and plain text for Server)
      let description = '';
      if (fields.description) {
        if (typeof fields.description === 'string') {
          description = fields.description;
        } else if (fields.description.content) {
          // ADF format (Jira Cloud)
          description = this.parseADFToText(fields.description);
        } else if (fields.description.html) {
          // HTML format (some Server instances)
          description = fields.description.html.replace(/<[^>]*>/g, '');
        }
      }

      // Extract acceptance criteria
      const acceptanceCriteria = this.extractAcceptanceCriteria(description, fields);

      // Normalize component names
      const components = Array.isArray(fields.components) 
        ? fields.components.map((c: any) => c.name || '').filter(Boolean)
        : [];

      // Normalize fix versions
      const fixVersions = Array.isArray(fields.fixVersions)
        ? fields.fixVersions.map((v: any) => v.name || '').filter(Boolean)
        : [];

      // Normalize labels
      const labels = Array.isArray(fields.labels) ? fields.labels : [];

      // Build normalized ticket data
      const ticketData: JiraTicketData = {
        key: issue.key,
        id: issue.id,
        summary: fields.summary || '',
        description: description,
        acceptanceCriteria: acceptanceCriteria,
        issueType: fields.issuetype?.name || 'Unknown',
        status: fields.status?.name || 'Unknown',
        priority: fields.priority?.name || 'Unknown',
        labels: labels,
        components: components,
        fixVersions: fixVersions,
        reporter: {
          displayName: fields.reporter?.displayName || 'Unknown',
          emailAddress: fields.reporter?.emailAddress
        },
        assignee: fields.assignee ? {
          displayName: fields.assignee.displayName || 'Unassigned',
          emailAddress: fields.assignee.emailAddress
        } : null,
        createdAt: fields.created,
        updatedAt: fields.updated,
        rawResponse: issue
      };

      return ticketData;

    } catch (error) {
      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          
          if (status === 404) {
            throw new Error(
              `[Jira Error: Failed to fetch issue ${ticketKey} - Status: ${status}] ` +
              `Ticket not found. Please verify the ticket key exists and you have permission to view it.`
            );
          }
          
          if (status === 401 || status === 403) {
            throw new Error(
              `[Jira Error: Failed to fetch issue ${ticketKey} - Status: ${status}] ` +
              `Authentication failed. Please verify your JIRA_EMAIL and JIRA_API_TOKEN are correct.`
            );
          }
          
          throw new Error(
            `[Jira Error: Failed to fetch issue ${ticketKey} - Status: ${status}] ` +
            `${axiosError.response.statusText || 'Unknown error'}`
          );
        }
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error(
            `[Jira Error: Failed to fetch issue ${ticketKey}] Request timeout. ` +
            `Please check your network connection and Jira server availability.`
          );
        }
        
        throw new Error(
          `[Jira Error: Failed to fetch issue ${ticketKey}] Network error: ${axiosError.message}`
        );
      }
      
      // Handle non-Axios errors
      throw new Error(
        `[Jira Error: Failed to fetch issue ${ticketKey}] Unexpected error: ${(error as Error).message}`
      );
    }
  }

  /**
   * Health check - verify Jira connection is working
   * 
   * @returns Promise<boolean> - True if connection successful
   * @throws Error with details if connection fails
   */
  async healthCheck(): Promise<boolean> {
    if (!this.config) {
      throw new Error('[Jira Health Check] Configuration not initialized.');
    }

    try {
      // Try to access current user endpoint (lightweight check)
      await this.client.get('/myself');
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw new Error(
            '[Jira Health Check Failed] Authentication error. ' +
            'Please verify JIRA_EMAIL and JIRA_API_TOKEN.'
          );
        }
        if (status === 404) {
          throw new Error(
            '[Jira Health Check Failed] Jira instance not found. ' +
            'Please verify JIRA_HOST URL.'
          );
        }
      }
      throw new Error(
        `[Jira Health Check Failed] ${(error as Error).message}`
      );
    }
  }

  /**
   * Get current configuration status
   */
  getConfigStatus(): { configured: boolean; host?: string; isCloud?: boolean } {
    if (!this.config) {
      return { configured: false };
    }
    return {
      configured: true,
      host: this.config.host,
      isCloud: this.config.isCloud
    };
  }
}

// Export singleton instance
export const jiraService = new JiraService();

// Export class for testing purposes
export { JiraService };
