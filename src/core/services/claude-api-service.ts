/**
 * Claude AI API Service
 * Clean and robust Anthropic Claude API client with proper auth
 * Principal QA Automation Architect Implementation
 */

import { TokenConfig } from '../../contexts/TokensContext';

export interface ClaudeMessageRequest {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ClaudeMessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeApiService {
  private config: TokenConfig['claude'];

  constructor(config: TokenConfig['claude']) {
    this.config = config;
  }

  /**
   * Get Authorization header
   */
  private getAuthHeader(): HeadersInit {
    if (!this.config.apiKey) {
      throw new Error('Claude API Key is not configured');
    }
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    };
  }

  /**
   * Health check / ping endpoint
   * Validates connection and API key without sending a full request
   */
  async healthCheck(): Promise<{ valid: boolean; error?: string }> {
    try {
      if (!this.config.apiKey) {
        return { valid: false, error: 'API Key is not configured' };
      }

      // Send minimal request to validate API key
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          model: this.config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: 1,
          temperature: 0,
          system: 'Health check',
          messages: [{ role: 'user', content: '.' }],
        }),
      });

      if (response.status === 401) {
        return { valid: false, error: 'Invalid API Key - authentication failed' };
      }

      if (response.status === 403) {
        return { valid: false, error: 'API Key is valid but lacks permissions' };
      }

      if (!response.ok && response.status !== 400) {
        return { 
          valid: false, 
          error: `API returned status ${response.status}: ${response.statusText}` 
        };
      }

      // Status 200 or 400 (bad request but auth worked) means key is valid
      return { valid: true };
    } catch (error) {
      if (error instanceof Error) {
        return { valid: false, error: `Connection failed: ${error.message}` };
      }
      return { valid: false, error: 'Unknown connection error' };
    }
  }

  /**
   * Send message to Claude API
   */
  async sendMessage(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Claude API Key is not configured. Please add it in Settings → Tokens.');
    }

    try {
      const requestBody: ClaudeMessageRequest = {
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for more deterministic QA responses
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      };

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        throw new Error('Claude API authentication failed. Please check your API key in Settings → Tokens.');
      }

      if (response.status === 403) {
        throw new Error('Claude API key lacks permissions. Ensure your key has access to the specified model.');
      }

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API Error (${response.status}): ${errorText}`);
      }

      const data: ClaudeMessageResponse = await response.json();
      
      if (!data.content || data.content.length === 0) {
        throw new Error('Empty response from Claude API');
      }

      return data.content[0].text;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during Claude API call');
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.apiKey) {
      errors.push('Claude API Key is required');
    } else if (this.config.apiKey.length < 10) {
      errors.push('API Key appears to be invalid (too short)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Factory function to create ClaudeApiService instance
 */
export function createClaudeApiService(config: TokenConfig['claude']): ClaudeApiService {
  return new ClaudeApiService(config);
}
