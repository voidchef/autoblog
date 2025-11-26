import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import logger from '../logger/logger';

/**
 * Types for chain building
 */
type InputMapping = Record<string, (input: Record<string, unknown>) => unknown>;
type MemoryObject = { history: unknown[] };

/**
 * Builder for LangChain runnable chains
 */
export class ChainBuilder {
  /**
   * Build a chain for structured output with memory
   */
  static buildStructuredChain(template: string, llm: BaseChatModel, schema: unknown, inputKeys: string[]) {
    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(template),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const llmWithStructuredOutput = llm.withStructuredOutput(schema as any);

    const inputMapping = this.buildInputMapping(inputKeys);

    const chain = RunnableSequence.from([
      {
        ...inputMapping,
        memory: () => (initialInput: Record<string, unknown>) => initialInput['memory'],
      },
      {
        ...inputMapping,
        history: (previousOutput: { memory: MemoryObject }) => {
          // Safely extract history, default to empty array if not present
          return previousOutput?.memory?.history || [];
        },
      },
      chatPrompt,
      llmWithStructuredOutput,
    ]);

    return chain;
  }

  /**
   * Build a chain for content generation with memory and parser
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static buildContentChain(template: string, llm: BaseChatModel, parser: any, inputKeys: string[]) {
    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(template),
    ]);

    const inputMapping = this.buildInputMapping(inputKeys);

    const chain = RunnableSequence.from([
      {
        ...inputMapping,
        memory: () => (initialInput: Record<string, unknown>) => initialInput['memory'],
      },
      {
        ...inputMapping,
        history: (previousOutput: { memory: MemoryObject }) => {
          // Safely extract history, default to empty array if not present
          return previousOutput?.memory?.history || [];
        },
      },
      chatPrompt,
      llm,
      parser,
    ] as any);

    return chain;
  }

  /**
   * Build input mapping for chain
   */
  private static buildInputMapping(keys: string[]): InputMapping {
    const mapping: InputMapping = {};
    for (const key of keys) {
      mapping[key] = (initialInput: Record<string, unknown>) => initialInput[key];
    }
    return mapping;
  }
}

/**
 * Utility for managing conversation memory
 */
export class MemoryManager {
  /**
   * Save context to memory with validation
   */
  static async saveContext(
    memory: unknown,
    input: string | Record<string, unknown>,
    output: string | Record<string, unknown>
  ): Promise<void> {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (memory as any).saveContext({ input: inputStr }, { output: outputStr });
  }

  /**
   * Load memory variables safely
   */
  static async loadMemory(memory: unknown): Promise<MemoryObject> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (memory as any).loadMemoryVariables({});
    } catch (error) {
      logger.error('Failed to load memory:', error);
      return { history: [] };
    }
  }

  /**
   * Clear memory
   */
  static async clearMemory(memory: unknown): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((memory as any).clear) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (memory as any).clear();
    }
  }
}

/**
 * Utility for formatting content
 */
export class ContentFormatter {
  /**
   * Convert outline to markdown string
   */
  static outlineToMarkdown(outline: Record<string, unknown>): string {
    const { title, headings, slug, seoTitle, seoDescription } = outline;
    const headingsMarkdown = this.headingsToMarkdown(headings as Record<string, unknown>[], 2);

    return `
Blog post outline:
# ${title}

${headingsMarkdown}

Slug: ${slug}
SEO Title: ${seoTitle}
SEO Description: ${seoDescription}
    `.trim();
  }

  /**
   * Convert headings to markdown recursively
   */
  static headingsToMarkdown(headings: Record<string, unknown>[], level: number): string {
    return headings
      .map((heading) => {
        const title = `${'#'.repeat(level)} ${heading['title']}\n`;
        const keywords = heading['keywords'] ? `Keywords: ${(heading['keywords'] as string[]).join(', ')}\n` : '';
        const subheadings = heading['headings']
          ? this.headingsToMarkdown(heading['headings'] as Record<string, unknown>[], level + 1)
          : '';
        return `${title}${keywords}${subheadings}`;
      })
      .join('\n');
  }

  /**
   * Build markdown content from headings
   */
  static async buildMarkdownContent(
    headings: Record<string, unknown>[],
    headingLevel: number,
    contentGenerator: (heading: Record<string, unknown>) => Promise<string>,
    previousContent: string = ''
  ): Promise<string> {
    if (headings.length === 0) {
      return previousContent;
    }

    const [currentHeading, ...remainingHeadings] = headings;
    if (!currentHeading) {
      return previousContent;
    }

    const mdHeading = '#'.repeat(headingLevel);
    let content = `${previousContent}\n${mdHeading} ${currentHeading['title']}`;

    if (currentHeading['headings'] && (currentHeading['headings'] as unknown[]).length > 0) {
      content = await this.buildMarkdownContent(
        currentHeading['headings'] as Record<string, unknown>[],
        headingLevel + 1,
        contentGenerator,
        content
      );
    } else {
      const generatedContent = await contentGenerator(currentHeading);
      content += `\n${generatedContent}`;
    }

    return this.buildMarkdownContent(remainingHeadings, headingLevel, contentGenerator, content);
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate outline structure
   */
  static validateOutline(outline: Record<string, unknown>): boolean {
    return (
      typeof outline['title'] === 'string' &&
      Array.isArray(outline['headings']) &&
      typeof outline['slug'] === 'string' &&
      typeof outline['seoTitle'] === 'string' &&
      typeof outline['seoDescription'] === 'string'
    );
  }

  /**
   * Validate heading structure
   */
  static validateHeading(heading: Record<string, unknown>): boolean {
    return (
      typeof heading['title'] === 'string' &&
      (!heading['keywords'] || Array.isArray(heading['keywords'])) &&
      (!heading['headings'] || Array.isArray(heading['headings']))
    );
  }

  /**
   * Validate SEO info
   */
  static validateSeoInfo(seoInfo: Record<string, unknown>): boolean {
    return (
      typeof seoInfo['h1'] === 'string' &&
      typeof seoInfo['seoTitle'] === 'string' &&
      typeof seoInfo['seoDescription'] === 'string' &&
      typeof seoInfo['slug'] === 'string'
    );
  }

  /**
   * Validate audience intent
   */
  static isValidAudienceIntent(data: Record<string, unknown>): boolean {
    return typeof data['audience'] === 'string' && typeof data['intent'] === 'string';
  }
}
