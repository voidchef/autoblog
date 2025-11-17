import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BufferMemory } from 'langchain/memory';
import logger from '../logger/logger';
import { MemoryManagementError } from './errors';
import { buildLLM } from './llm';
import { BasePostPrompt } from './types';
import { MemoryManager } from './utils';

/**
 * Abstract base class for post generators with common functionality
 */
export abstract class BasePostGenerator<TPrompt extends BasePostPrompt, TResult> {
  protected llmContent: BaseChatModel;
  protected llmJson: BaseChatModel;
  protected memory: BufferMemory;
  protected config: TPrompt;

  constructor(prompt: TPrompt) {
    this.config = prompt;

    // Initialize LLMs
    this.llmContent = buildLLM(prompt, false);
    this.llmJson = buildLLM(prompt, true);

    // Initialize memory
    this.memory = new BufferMemory({
      returnMessages: true,
    });

    logger.debug('PostGenerator initialized with config:', {
      model: prompt.model,
      temperature: prompt.temperature,
      debug: prompt.debug,
    });
  }

  /**
   * Main generation method - to be implemented by subclasses
   */
  abstract generate(): Promise<TResult>;

  /**
   * Initialize system context in memory
   */
  protected async initializeSystemContext(systemPrompt: string): Promise<void> {
    try {
      await MemoryManager.saveContext(
        this.memory,
        'Write the blog post based on the following guidelines',
        systemPrompt
      );
      logger.debug('System context initialized');
    } catch (error) {
      throw new MemoryManagementError('Failed to initialize system context', error);
    }
  }

  /**
   * Save generation step to memory
   */
  protected async saveToMemory(input: string, output: string): Promise<void> {
    try {
      await MemoryManager.saveContext(this.memory, input, output);
    } catch (error) {
      logger.warn('Failed to save to memory:', error);
      // Don't throw - memory failures shouldn't stop generation
    }
  }

  /**
   * Get current memory state (for debugging)
   */
  protected async getMemoryState(): Promise<any> {
    return await MemoryManager.loadMemory(this.memory);
  }

  /**
   * Clear memory
   */
  protected async clearMemory(): Promise<void> {
    await MemoryManager.clearMemory(this.memory);
  }

  /**
   * Log debug information if debug mode is enabled
   */
  protected debugLog(message: string, data?: any): void {
    if (this.config.debug) {
      logger.debug(message, data);
    }
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<TPrompt> {
    return { ...this.config };
  }
}
