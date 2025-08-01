import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { BufferMemory } from 'langchain/memory';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from '@langchain/core/prompts';

import { RunnableSequence } from '@langchain/core/runnables';

import { Heading, Post, PostOutline, AutoPostPrompt, TemplatePostPrompt, TemplatePost } from './types';

import logger from '../logger/logger';

import { AudienceIntentSchema, getMarkdownParser, getParser, PostOutlineSchema, SeoInfoSchema } from './parser';

import {
  getConclusionPrompt,
  getHeadingPrompt,
  getOutlinePrompt,
  getIntroductionPrompt,
  getSystemPrompt,
  getAudienceIntentPrompt,
  getSeoInfoPrompt,
} from './prompt';

import { Template } from './template';
import { buildLLM } from './llm';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PostImageService } from '../imageGen/index';

dotenv.config();
const PARSER_INSTRUCTIONS_TAG = '\n{formatInstructions}\n';

// -----------------------------------------------------------------------------------------
// The following class can be used to generate the post in the auto mode.
// The content is structured as follows :
// - Introduction
// - Headings with their content
// - Conclusion (optional)
// -----------------------------------------------------------------------------------------
export class PostGenerator {
  private llm_json: BaseChatModel;
  private llm_content: BaseChatModel;
  private memory: BufferMemory;

  public constructor(private postPrompt: AutoPostPrompt) {
    this.llm_content = buildLLM(postPrompt) as BaseChatModel;
    // For the outline, we use a different setting without frequencyPenalty and presencePenalty
    // in order to avoid some json format issue
    this.llm_json = buildLLM(postPrompt, true);

    this.memory = new BufferMemory({
      returnMessages: true,
    });
  }

  public async generate(): Promise<Post> {
    logger.debug('\nPrompt :' + JSON.stringify(this.postPrompt, null, 2));

    // Add the system prompt to the memory
    const systemPrompt = await getSystemPrompt();
    this.memory.saveContext({ input: 'main recommendations for writing the post content' }, { output: systemPrompt });

    if (this.postPrompt.generate) {
      logger.info('Generating the audience and the intent');
      const { audience, intent } = await this.generateAudienceAndIntent();
      this.postPrompt.audience = audience;
      this.postPrompt.intent = intent;
    }

    logger.info('Generating the outline for the topic : ' + this.postPrompt.topic);
    const tableOfContent = await this.generateOutline();

    logger.info('Generating the introduction');
    const introduction = await this.generateIntroduction();

    logger.info('Generating the headings : ');
    const headingContents = await this.generateHeadingContents(tableOfContent);

    logger.info('Generating the conclusion');
    const conclusion = await this.generateConclusion();

    // Generate images if requested
    let generatedImages: string[] = [];
    if (this.postPrompt.generateImages) {
      logger.info('Generating images for the post');
      generatedImages = await this.generatePostImages(tableOfContent);
    }

    logger.debug(await this.memory.loadMemoryVariables({}));

    const content = `${introduction}\n${headingContents}\n\n${conclusion}`;
    return {
      title: tableOfContent.title,
      content,
      seoTitle: tableOfContent.seoTitle,
      seoDescription: tableOfContent.seoDescription,
      slug: tableOfContent.slug,
      generatedImages,
    };
  }

  /**
   * Generate the audience and intent.
   */
  async generateAudienceAndIntent(): Promise<{ audience: string; intent: string }> {
    const humanTemplate = await getAudienceIntentPrompt();
    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);

    const llmWithStructuredOutput = this.llm_json.withStructuredOutput(AudienceIntentSchema);

    const chain = RunnableSequence.from([
      {
        language: (initialInput) => initialInput.language,
        topic: (initialInput) => initialInput.topic,
        memory: () => this.memory.loadMemoryVariables({}),
      },
      {
        language: (initialInput) => initialInput.language,
        topic: (initialInput) => initialInput.topic,
        history: (previousOutput) => previousOutput.memory.history,
      },
      chatPrompt,
      llmWithStructuredOutput,
    ]);

    const inputVariables = {
      topic: this.postPrompt.topic,
      language: this.postPrompt.language,
    };

    const content = await chain.invoke(inputVariables);
    if (typeof content['audience'] === 'string' && typeof content['intent'] === 'string') {
      return content as { audience: string; intent: string };
    } else {
      throw new Error('Audience/Intent response is missing required fields.');
    }
  }

  /**
   * Generate a post outline.
   */
  private async generateOutline(): Promise<PostOutline> {
    const outlineTemplate = await getOutlinePrompt();
    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(outlineTemplate),
    ]);

    const llmWithStructuredOutput = this.llm_json.withStructuredOutput(PostOutlineSchema);
    const chain = RunnableSequence.from([
      {
        language: (initialInput) => initialInput.language,
        topic: (initialInput) => initialInput.topic,
        country: (initialInput) => initialInput.country,
        audience: (initialInput) => initialInput.audience,
        intent: (initialInput) => initialInput.intent,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        memory: () => this.memory.loadMemoryVariables({}),
      },
      {
        language: (initialInput) => initialInput.language,
        topic: (initialInput) => initialInput.topic,
        country: (initialInput) => initialInput.country,
        audience: (initialInput) => initialInput.audience,
        intent: (initialInput) => initialInput.intent,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        history: (previousOutput) => previousOutput.memory.history,
      },
      chatPrompt,
      llmWithStructuredOutput,
    ]);

    const inputVariables = {
      topic: this.postPrompt.topic,
      language: this.postPrompt.language,
      country: this.postPrompt.country,
      audience: this.postPrompt.audience ? this.postPrompt.audience : 'everyone',
      intent: this.postPrompt.intent ? this.postPrompt.intent : 'informative',
    };

    const outline = await chain.invoke(inputVariables);
    if (
      typeof outline['title'] === 'string' &&
      Array.isArray(outline['headings']) &&
      typeof outline['slug'] === 'string' &&
      typeof outline['seoTitle'] === 'string' &&
      typeof outline['seoDescription'] === 'string'
    ) {
      const prompt = PromptTemplate.fromTemplate(outlineTemplate);
      const outlineMessage = await prompt.format(inputVariables);
      this.memory.saveContext({ input: outlineMessage }, { output: this.postOutlineToMarkdown(outline as PostOutline) });
      logger.debug(' ----------------------OUTLINE ----------------------');
      logger.debug(JSON.stringify(outline, null, 2));
      return outline as PostOutline;
    } else {
      throw new Error('Outline response is missing required fields.');
    }
  }

  /*
   * Generate the introduction of the blog post
   */
  private async generateIntroduction(): Promise<string> {
    const template = await getIntroductionPrompt();
    const content = await this.generateContent(template, 'Write the introduction of the blog post');
    return content;
  }

  /*
   * Generate the conclusion of the blog post
   */
  private async generateConclusion(): Promise<string> {
    const template = await getConclusionPrompt();
    const content = await this.generateContent(template, 'Write the conclusion of the blog post');
    return content;
  }

  /*
   * Generate the content for the headings of the blog post
   */
  private async generateHeadingContents(postOutline: PostOutline) {
    const headingLevel = 2;

    return await this.buildContent(postOutline.headings, headingLevel);
  }

  /*
   * Build the content for the headings of the blog post
   */
  private async buildContent(headings: Heading[], headingLevel: number, previousContent: string = ''): Promise<string> {
    if (headings.length === 0) {
      return previousContent;
    }
    const [currentHeading, ...remainingHeadings] = headings;
    if (!currentHeading) {
      return previousContent;
    }
    const mdHeading = Array(headingLevel).fill('#').join('');
    let content = previousContent + '\n' + mdHeading + ' ' + currentHeading.title;

    if (currentHeading.headings && currentHeading.headings.length > 0) {
      content = await this.buildContent(currentHeading.headings, headingLevel + 1, content);
    } else {
      content += '\n' + (await this.generateHeadingContent(currentHeading));
    }

    return this.buildContent(remainingHeadings, headingLevel, content);
  }

  /*
   * Generate the content for a heading
   */
  private async generateHeadingContent(heading: Heading): Promise<string> {
    logger.info(` - Generating content for heading : ${heading.title}`);
    const template = await getHeadingPrompt();
    const parser = getMarkdownParser();

    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(template),
    ]);

    const chain = RunnableSequence.from([
      {
        language: (initialInput) => initialInput.language,
        headingTitle: (initialInput) => initialInput.headingTitle,
        keywords: (initialInput) => initialInput.keywords,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        memory: () => this.memory.loadMemoryVariables({}),
      },
      {
        language: (initialInput) => initialInput.language,
        headingTitle: (initialInput) => initialInput.headingTitle,
        keywords: (initialInput) => initialInput.keywords,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        history: (previousOutput) => previousOutput.memory.history,
      },
      chatPrompt,
      this.llm_content,
      parser,
    ]);

    const inputVariables = {
      formatInstructions: parser.getFormatInstructions(),
      headingTitle: heading.title,
      language: this.postPrompt.language,
      keywords: heading.keywords?.join(', '),
    };

    let content = await chain.invoke(inputVariables);

    if (content === '' || content === null) {
      logger.warn(`😿 No content generated for heading : ${heading.title} with the model :  ${this.postPrompt.model}`);
      content = `😿 No content generated with the model:  ${this.postPrompt.model}`;
    }

    logger.debug(' ---------------------- HEADING : ' + heading.title + '----------------------');
    logger.debug(content);
    logger.debug(' ---------------------- HEADING END ----------------------');

    this.memory.saveContext({ input: `Write a content for the heading : ${heading.title}` }, { output: content });

    return content;
  }

  /**
   *
   * Generate a content in markdown format based on a langchain template
   * Mainly used for the introduction and conclusion
   *
   */
  private async generateContent(template: string, memoryInput: string): Promise<string> {
    const parser = getMarkdownParser();

    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(template),
    ]);

    const chain = RunnableSequence.from([
      {
        language: (initialInput) => initialInput.language,
        topic: (initialInput) => initialInput.topic,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        memory: () => this.memory.loadMemoryVariables({}),
      },
      {
        language: (initialInput) => initialInput.language,
        topic: (initialInput) => initialInput.topic,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        history: (previousOutput) => previousOutput.memory.history,
      },
      chatPrompt,
      this.llm_content,
      parser,
    ]);

    const inputVariables = {
      formatInstructions: parser.getFormatInstructions(),
      topic: this.postPrompt.topic,
      language: this.postPrompt.language,
    };

    let content = await chain.invoke(inputVariables);

    if (content === '' || content === null) {
      logger.warn(`😿 No content generated with the model :  ${this.postPrompt.model}`);
      content = `😿 No content generated with the model:  ${this.postPrompt.model}`;
    }

    logger.debug(' ---------------------- CONTENT ----------------------');
    logger.debug(content);
    logger.debug(' ---------------------- CONTENT END ----------------------');

    this.memory.saveContext({ input: memoryInput }, { output: content });

    return content;
  }

  /**
   * Generate images for the entire post
   */
  private async generatePostImages(postOutline: PostOutline): Promise<string[]> {
    const imageService = new PostImageService(this.postPrompt);
    const generatedImages = await imageService.generatePostImages(postOutline);

    // Return image prompts for backward compatibility
    return PostImageService.imagesToStrings(generatedImages);
  }

  /**
   * Generate images for headings
   */
  private async generateHeadingImages(headings: Heading[]): Promise<string[]> {
    const imageService = new PostImageService(this.postPrompt);
    const generatedImages = await imageService.generateHeadingImages(headings);

    // Return image prompts for backward compatibility
    return PostImageService.imagesToStrings(generatedImages);
  }

  // ---------------------------------------------------------------------------
  // Other methods
  // ---------------------------------------------------------------------------

  /**
   * Convert a post prompt to a string for adding to the memory.
   */
  private promptToString(prompt: AutoPostPrompt): string {
    return `
      Blog post request : 
      - Topic: ${prompt.topic}
      - ${prompt.language ? `Language: ${prompt.language}` : ''}
      - ${prompt.country ? `Country: ${prompt.country}` : ''}
      - ${prompt.intent ? `Intent: ${prompt.intent}` : ''}
      - ${prompt.audience ? `Audience: ${prompt.audience}` : ''}
    `;
  }

  /**
   * Convert a post outline to a markdown string for adding to the memory.
   */
  private postOutlineToMarkdown(postOutline: PostOutline): string {
    function headingsToMarkdown(headings: Heading[], level: number): string {
      return headings
        .map((heading) => {
          const title = `${'#'.repeat(level)} ${heading.title}\n`;
          const keywords = heading.keywords ? `Keywords: ${heading.keywords.join(', ')}\n` : '';
          const subheadings = heading.headings ? headingsToMarkdown(heading.headings, level + 1) : '';
          return `${title}${keywords}${subheadings}`;
        })
        .join('\n');
    }

    const title = `# ${postOutline.title}\n`;
    const headings = headingsToMarkdown(postOutline.headings, 2);
    const slug = `Slug: ${postOutline.slug}\n`;
    const seoTitle = `SEO Title: ${postOutline.seoTitle}\n`;
    const seoDescription = `SEO Description: ${postOutline.seoDescription}\n`;

    return `
      Blog post outline :
      ${title}${headings}${slug}${seoTitle}${seoDescription}
    `;
  }

  /*
   * Debug the memory
   */
  private async debugMemory(step: string) {
    logger.debug(step + '\n' + JSON.stringify(await this.memory.loadMemoryVariables({}), null, 2));
  }
}

// -----------------------------------------------------------------------------------------
// The following class can be  used to generate the post based on a template.
// A template is a file containing prompts that will be replaced by the content
// -----------------------------------------------------------------------------------------
export class PostTemplateGenerator {
  private llm_content: BaseChatModel;
  private llm_json: BaseChatModel;
  private memory: BufferMemory;

  public constructor(private postPrompt: TemplatePostPrompt) {
    this.llm_content = buildLLM(postPrompt);
    // For the outline, we use a different setting without frequencyPenalty and presencePenalty
    // in order to avoid some json format issue
    this.llm_json = buildLLM(postPrompt, true);

    this.memory = new BufferMemory({
      returnMessages: true,
    });
  }

  public async generate(): Promise<TemplatePost> {
    logger.info(`Generate the post based on the template : ${this.postPrompt.templateFile}`);
    logger.debug('\nPrompt :' + JSON.stringify(this.postPrompt, null, 2));

    const templateContent = await this.readTemplate();

    const template = new Template(templateContent);

    // Add the system prompt to the memory
    const systemPrompt = PromptTemplate.fromTemplate(template.getSystemPrompt());

    this.memory.saveContext(
      { input: 'Write the content for the blog post based on the following recommendations' },
      { output: await systemPrompt.format(this.postPrompt.input) },
    );

    const contents: string[] = [];
    for (const [index, prompt] of template.getPrompts().entries()) {
      if (prompt.type === 'i') {
        // Handle image generation for template
        if (this.postPrompt.generateImages) {
          try {
            logger.info(`Generating image for template section ${index + 1}`);
            const imageService = new PostImageService(this.postPrompt);
            const imagePrompt = await imageService.generateTemplateImagePrompt(prompt.prompt);
            // Note: In a real implementation, you would get the actual image URL
            contents.push(`![Generated Image](${imagePrompt})`);
          } catch (error) {
            logger.warn(`Failed to generate image for template section ${index + 1}:`, error);
            contents.push(''); // Add empty content if image generation fails
          }
        } else {
          // Skip image sections if image generation is disabled
          contents.push('');
        }
        continue;
      }
      logger.info(`Generating content for prompt ${index + 1} ...`);
      const content = await this.generateTemplateContent(prompt.prompt);
      contents.push(content);
    }

    const content = template.buildContent(contents);
    const { h1, seoTitle, seoDescription, slug } = await this.generateSeoInfo(content);

    // Generate additional images if requested
    let generatedImages: string[] = [];
    if (this.postPrompt.generateImages) {
      logger.info('Generating additional images for template post');
      generatedImages = await this.generateTemplateImages(h1, content);
    }

    logger.debug(await this.memory.loadMemoryVariables({}));

    return {
      title: h1,
      content,
      seoTitle,
      seoDescription,
      slug,
      generatedImages,
    };
  }

  private async generateTemplateContent(prompt: string): Promise<string> {
    const parser = getParser(this.postPrompt);

    const promptWithInstructions = prompt + PARSER_INSTRUCTIONS_TAG;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(promptWithInstructions),
    ]);
    const inputVariables: { [key: string]: (initialInput: string) => string } = {};

    for (const attribute in this.postPrompt.input) {
      if (typeof this.postPrompt.input[attribute] === 'string') {
        inputVariables[attribute] = (initialInput: any) => initialInput[attribute as keyof string];
      }
    }
    const chain = RunnableSequence.from([
      {
        ...inputVariables,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        memory: () => this.memory.loadMemoryVariables({}),
      },
      {
        ...inputVariables,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        history: (previousOutput) => previousOutput.memory.history,
      },
      chatPrompt,
      this.llm_content,
      parser,
    ]);

    const inputs = {
      formatInstructions: parser.getFormatInstructions(),
      ...this.postPrompt.input,
    };

    const content = await chain.invoke(inputs);
    this.memory.saveContext({ input: prompt }, { output: content });

    return content;
  }

  /**
   * Generate images for template-based posts
   */
  private async generateTemplateImages(title: string, content: string): Promise<string[]> {
    const imageService = new PostImageService(this.postPrompt);
    const generatedImages = await imageService.generateTemplateImages(title, content);

    // Return image prompts for backward compatibility
    return PostImageService.imagesToStrings(generatedImages);
  }

  private async generateSeoInfo(
    content: string,
  ): Promise<{ h1: string; seoTitle: string; seoDescription: string; slug: string }> {
    const humanTemplate = await getSeoInfoPrompt();
    const chatPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);

    const llmWithStructuredOutput = this.llm_json.withStructuredOutput(SeoInfoSchema);

    const chain = RunnableSequence.from([
      {
        content: (initialInput) => initialInput.content,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        memory: () => this.memory.loadMemoryVariables({}),
      },
      {
        content: (initialInput) => initialInput.content,
        formatInstructions: (initialInput) => initialInput.formatInstructions,
        history: (previousOutput) => previousOutput.memory.history,
      },
      chatPrompt,
      llmWithStructuredOutput,
    ]);

    const inputVariables = {
      content,
    };

    const seoInfo = await chain.invoke(inputVariables);
    this.memory.saveContext(
      { input: 'Generate the seo information : H1, title, description and slug' },
      { output: JSON.stringify(content, null, 2) },
    );

    if (
      typeof seoInfo['h1'] === 'string' &&
      typeof seoInfo['seoTitle'] === 'string' &&
      typeof seoInfo['seoDescription'] === 'string' &&
      typeof seoInfo['slug'] === 'string'
    ) {
      return seoInfo as { h1: string; seoTitle: string; seoDescription: string; slug: string };
    } else {
      throw new Error('SEO info response is missing required fields.');
    }
  }

  /*
   * Read the template file
   */
  private async readTemplate(): Promise<string> {
    if (!this.postPrompt?.templateFile) {
      throw new Error('Template file is undefined.');
    }

    return await readFile(this.postPrompt.templateFile, 'utf-8');
  }
}
