import { readFile } from 'fs/promises';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { Template } from '../postGen/template';

/**
 * Extract template variables from a template file
 * Looks for placeholders like {variableName} in the template content
 * @param templatePath Path to the template file
 * @returns Array of unique variable names found in the template
 */
export async function extractTemplateVariables(templatePath: string): Promise<string[]> {
  const templateContent = await readFile(templatePath, 'utf-8');

  // Extract variables from template prompts
  // Variables are in the format {variableName} within {{s:}} or {{c:}} blocks
  const variableRegex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const variables = new Set<string>();

  let match;
  while ((match = variableRegex.exec(templateContent)) !== null) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
}

/**
 * Validate template file format
 * Ensures the template has the required structure with {{s:}} or {{c:}} tags
 * @param templatePath Path to the template file
 * @returns True if valid, throws error otherwise
 */
export async function validateTemplateFile(templatePath: string): Promise<boolean> {
  try {
    const templateContent = await readFile(templatePath, 'utf-8');

    // Check if template has at least one system or content prompt
    const hasSystemPrompt = /\{\{s:[\s\S]*?\}\}/g.test(templateContent);
    const hasContentPrompt = /\{\{c:[\s\S]*?\}\}/g.test(templateContent);

    if (!hasSystemPrompt && !hasContentPrompt) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Template must contain at least one system prompt {{s:...}} or content prompt {{c:...}}'
      );
    }

    // Try to parse with Template class to ensure it's valid
    const template = new Template(templateContent);
    const prompts = template.getPrompts();

    if (prompts.length === 0 && !hasSystemPrompt) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Template has no valid prompts');
    }

    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid template file: ${error.message}`);
    }
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid template file');
  }
}

/**
 * Get template preview information
 * Returns a summary of what's in the template
 * @param templatePath Path to the template file
 * @returns Object containing template info
 */
export async function getTemplatePreview(templatePath: string): Promise<{
  systemPrompt: string;
  contentPromptCount: number;
  imagePromptCount: number;
  variables: string[];
}> {
  const templateContent = await readFile(templatePath, 'utf-8');
  const template = new Template(templateContent);

  const prompts = template.getPrompts();
  const contentPromptCount = prompts.filter((p) => p.type === 'c').length;
  const imagePromptCount = prompts.filter((p) => p.type === 'i').length;

  const variables = await extractTemplateVariables(templatePath);

  return {
    systemPrompt: template.getSystemPrompt(),
    contentPromptCount,
    imagePromptCount,
    variables,
  };
}
