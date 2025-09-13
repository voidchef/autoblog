import { BaseOutputParser, StringOutputParser } from '@langchain/core/output_parsers';
import { TemplatePostPrompt } from './types';
import { isHTML, isMarkdown } from './template';

const HeadingSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The title of the heading',
    },
    keywords: {
      type: 'array',
      items: { type: 'string' },
      description: 'The keywords of the heading',
    },
    headings: {
      type: 'array',
      items: { $ref: '#/$defs/Heading' },
      description: 'The subheadings of the heading',
    },
  },
  required: ['title'],
  additionalProperties: false,
};

export const PostOutlineSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The title of the post',
    },
    headings: {
      type: 'array',
      items: HeadingSchema,
      description: 'The headings of the post',
    },
    slug: {
      type: 'string',
      description: 'The slug of the post',
    },
    seoTitle: {
      type: 'string',
      description: 'The SEO title of the post',
    },
    seoDescription: {
      type: 'string',
      description: 'The SEO description of the post',
    },
  },
  required: ['title', 'headings', 'slug', 'seoTitle', 'seoDescription'],
  additionalProperties: false,
  $defs: {
    Heading: HeadingSchema,
  },
};

export const AudienceIntentSchema = {
  type: 'object',
  properties: {
    audience: {
      type: 'string',
      description: 'The audience of the post',
    },
    intent: {
      type: 'string',
      description: 'The intent of the post',
    },
  },
  required: ['audience', 'intent'],
  additionalProperties: false,
};

export const SeoInfoSchema = {
  type: 'object',
  properties: {
    h1: {
      type: 'string',
      description: 'The H1 of the post',
    },
    seoTitle: {
      type: 'string',
      description: 'The SEO title of the post',
    },
    seoDescription: {
      type: 'string',
      description: 'The SEO description of the post',
    },
    slug: {
      type: 'string',
      description: 'The slug of the post',
    },
  },
  required: ['h1', 'seoTitle', 'seoDescription', 'slug'],
  additionalProperties: false,
};

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
