/* eslint-disable max-classes-per-file */
import { oraPromise } from 'ora';
import { ChatGptHelper, GeneratorHelperInterface } from './post-helpers';

import { PostPrompt, Post } from './types';
import { replaceAllPrompts } from './template';

/**
 * Class for generating a post. It need a helper class to generate the post
 * Each helper class must implement the GeneratorHelperInterface
 */
export class PostGenerator {
  private helper: GeneratorHelperInterface;

  public constructor(helper: GeneratorHelperInterface) {
    this.helper = helper;
  }

  public async generate() {
    return this.helper.isCustom() ? this.customGenerate() : this.autoGenerate();
  }

  /**
   * Generate a post using the custom prompt based on a template
   */
  private async customGenerate(): Promise<Post> {
    const promptContents: any = [];

    await oraPromise(this.helper.init(), {
      text: ' Init the completion parameters ...',
    });

    // We remove the first prompt because it is the system prompt
    const prompts = this.helper.getPrompt().prompts!.slice(1);

    // for each prompt, we generate the content
    const templatePrompts = prompts.entries();
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, prompt] of templatePrompts) {
      // eslint-disable-next-line no-await-in-loop
      const content = await oraPromise(this.helper.generateCustomPrompt(prompt), {
        text: `Generating the prompt num. ${index + 1} ...`,
      });
      promptContents.push(content);
    }

    // We replace the prompts by the AI answer in the template content
    const content = replaceAllPrompts(this.helper.getPrompt().templateContent!, promptContents);

    const seoInfo = await oraPromise(this.helper.generateSeoInfo(), {
      text: 'Generating SEO info ...',
    });

    return {
      title: seoInfo.h1,
      slug: seoInfo.slug,
      seoTitle: seoInfo.seoTitle,
      seoDescription: seoInfo.seoDescription,
      content,
      totalTokens: this.helper.getTotalTokens(),
    };
  }

  /**
   * Generate a post using the auto mode
   */
  private async autoGenerate(): Promise<Post> {
    await oraPromise(this.helper.init(), {
      text: ' Init the completion parameters ...',
    });

    await oraPromise(this.helper.setSystemMessage(), {
      text: ' Setting the system message ...',
    });

    await oraPromise(this.helper.setCompletionParams(), {
      text: ' Setting the completion parameters ...',
    });

    const tableOfContent = await oraPromise(this.helper.generateContentOutline(), {
      text: 'Generating post outline ...',
    });

    let content = await oraPromise(this.helper.generateIntroduction(), {
      text: 'Generating introduction...',
    });

    content += await oraPromise(this.helper.generateHeadingContents(tableOfContent), {
      text: 'Generating content ...',
    });

    if (this.helper.getPrompt().withConclusion) {
      content += await oraPromise(this.helper.generateConclusion(), {
        text: 'Generating conclusion...',
      });
    }

    return {
      title: tableOfContent.title,
      slug: tableOfContent.slug,
      seoTitle: tableOfContent.seoTitle,
      seoDescription: tableOfContent.seoDescription,
      content,
      totalTokens: this.helper.getTotalTokens(),
    };
  }
}

/**
 * Class for generating a post using the OpenAI API
 */
export class OpenAIPostGenerator extends PostGenerator {
  public constructor(postPrompt: PostPrompt) {
    super(new ChatGptHelper(postPrompt));
  }
}
