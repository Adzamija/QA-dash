/**
 * Static Context Injection Service
 * 
 * Loads context/CONTEXT.md from disk and prepends it to agent prompts.
 * NO RAG, NO embeddings, NO dynamic retrieval - pure raw text injection.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ContextLoadOptions {
  /** Custom path to context file (defaults to context/CONTEXT.md) */
  contextPath?: string;
  /** Project root directory (defaults to process.cwd()) */
  projectRoot?: string;
}

export interface ContextLoadResult {
  /** Raw markdown content */
  content: string;
  /** Absolute path to the loaded file */
  filePath: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Load timestamp */
  loadedAt: Date;
}

/**
 * Load static context from CONTEXT.md file
 * 
 * @param options - Load options
 * @returns ContextLoadResult with raw markdown content
 * @throws Error if context file is missing or unreadable
 */
export async function loadStaticContext(
  options: ContextLoadOptions = {}
): Promise<ContextLoadResult> {
  const {
    contextPath = 'context/CONTEXT.md',
    projectRoot = process.cwd()
  } = options;

  // Resolve absolute path
  const resolvedPath = path.resolve(projectRoot, contextPath);

  try {
    // Check if file exists
    await fs.access(resolvedPath);

    // Read file content
    const content = await fs.readFile(resolvedPath, 'utf-8');
    
    // Get file stats
    const stats = await fs.stat(resolvedPath);

    console.log(`[ContextLoader] Successfully loaded context from: ${resolvedPath}`);
    console.log(`[ContextLoader] Context size: ${(stats.size / 1024).toFixed(2)} KB`);

    return {
      content,
      filePath: resolvedPath,
      sizeBytes: stats.size,
      loadedAt: new Date()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const detailedError = `[ContextLoader] Failed to load context from ${resolvedPath}: ${errorMessage}`;
    
    console.error(detailedError);
    
    throw new Error(
      `Static context file not found or unreadable at ${resolvedPath}. ` +
      `Ensure context/CONTEXT.md exists in your project root. ` +
      `Original error: ${errorMessage}`
    );
  }
}

/**
 * Build agent prompt by prepending static context to system prompt and user payload
 * 
 * Structure:
 * [STATIC CONTEXT from CONTEXT.md]
 * ---
 * [SYSTEM PROMPT]
 * ---
 * [USER PAYLOAD]
 * 
 * @param systemPrompt - Base system instructions for the agent
 * @param staticContext - Raw markdown content from CONTEXT.md
 * @param userPayload - Dynamic user input/ticket data
 * @returns Complete prompt with static context injected
 */
export function buildAgentPrompt(
  systemPrompt: string,
  staticContext: string,
  userPayload: string
): string {
  // Validate inputs
  if (!systemPrompt || systemPrompt.trim().length === 0) {
    throw new Error('System prompt cannot be empty');
  }

  if (!userPayload || userPayload.trim().length === 0) {
    throw new Error('User payload cannot be empty');
  }

  // Construct prompt with clear delimiters
  const prompt = `
${staticContext}

---
SYSTEM INSTRUCTIONS:
${systemPrompt}

---
USER INPUT:
${userPayload}
`.trim();

  console.log(`[PromptBuilder] Prompt constructed with ${prompt.length} characters`);
  
  return prompt;
}

/**
 * Check if context file exists without throwing
 * 
 * @param contextPath - Path to context file
 * @param projectRoot - Project root directory
 * @returns True if file exists, false otherwise
 */
export async function contextExists(
  contextPath: string = 'context/CONTEXT.md',
  projectRoot: string = process.cwd()
): Promise<boolean> {
  try {
    const resolvedPath = path.resolve(projectRoot, contextPath);
    await fs.access(resolvedPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get context file metadata without loading full content
 * 
 * @param contextPath - Path to context file
 * @param projectRoot - Project root directory
 * @returns File metadata or null if file doesn't exist
 */
export async function getContextMetadata(
  contextPath: string = 'context/CONTEXT.md',
  projectRoot: string = process.cwd()
): Promise<{ path: string; sizeBytes: number; lastModified: Date } | null> {
  try {
    const resolvedPath = path.resolve(projectRoot, contextPath);
    const stats = await fs.stat(resolvedPath);
    
    return {
      path: resolvedPath,
      sizeBytes: stats.size,
      lastModified: stats.mtime
    };
  } catch {
    return null;
  }
}
