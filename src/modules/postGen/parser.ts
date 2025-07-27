import Joi from 'joi';
import { BaseOutputParser, StringOutputParser } from '@langchain/core/output_parsers';
import { TemplatePostPrompt } from './types';
import { isHTML, isMarkdown } from './template';

const HeadingSchema = Joi.object({
  title: Joi.string().description('The title of the heading').required(),
  keywords: Joi.array().items(Joi.string()).optional().description('The keywords of the heading'),
  headings: Joi.array().items(Joi.link('#headings')).optional().description('The subheadings of the heading'),
}).id('headings');

export const PostOutlineSchema = Joi.object({
  title: Joi.string().description('The title of the post').required(),
  headings: Joi.array().items(HeadingSchema).description('The headings of the post').required(),
  slug: Joi.string().description('The slug of the post').required(),
  seoTitle: Joi.string().description('The SEO title of the post').required(),
  seoDescription: Joi.string().description('The SEO description of the post').required(),
});

export const AudienceIntentSchema = Joi.object({
  audience: Joi.string().description('The audience of the post').required(),
  intent: Joi.string().description('The intent of the post').required(),
});

export const SeoInfoSchema = Joi.object({
  h1: Joi.string().description('The H1 of the post').required(),
  seoTitle: Joi.string().description('The SEO title of the post').required(),
  seoDescription: Joi.string().description('The SEO description of the post').required(),
  slug: Joi.string().description('The slug of the post').required(),
});

export class MarkdownOutputParser extends BaseOutputParser<string> {
  lc_namespace = ['julius', 'markdown'];

  getFormatInstructions(): string {
    return `
    Your answer has to be only a markdown block. 
    The block has to delimited by \`\`\`markdown (beginning of the block) and \`\`\` (end of the block)
    `;
  }

  async parse(text: string): Promise<string> {
    return Promise.resolve(this.extract_markdown_content(text));
  }

  extract_markdown_content(text: string): string {
    const pattern = /```markdown(.*?)```/s;
    const match = text.match(pattern);
    if (match && typeof match[1] === 'string') {
      return match[1].trim();
    } else {
      return '';
    }
  }
}
export class HTMLOutputParser extends BaseOutputParser<string> {
  lc_namespace = ['julius', 'html'];

  getFormatInstructions(): string {
    return `
    Your answer has to be only a HTML block. 
    The block has to delimited by \`\`\`html (beginning of the block) and \`\`\` (end of the block)
    `;
  }

  async parse(text: string): Promise<string> {
    return Promise.resolve(this.extract_html_content(text));
  }

  extract_html_content(text: string): string {
    const pattern = /```html(.*?)```/s;
    const match = text.match(pattern);
    if (match && typeof match[1] === 'string') {
      return match[1].trim();
    } else {
      return '';
    }
  }
}

export function getMarkdownParser(): MarkdownOutputParser {
  return new MarkdownOutputParser();
}
export function getHTMLParser(): HTMLOutputParser {
  return new HTMLOutputParser();
}

export function getStringParser(): StringOutputParser {
  return new StringOutputParser();
}

export function getParser(prompt: TemplatePostPrompt): BaseOutputParser<string> {
  if (isMarkdown(prompt)) {
    return getMarkdownParser();
  }

  if (isHTML(prompt)) {
    return getHTMLParser();
  }

  return getStringParser();
}
