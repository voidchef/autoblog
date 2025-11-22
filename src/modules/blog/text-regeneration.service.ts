import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';
import { buildLLM } from '../postGen/llm';
import { BasePostPrompt, llm } from '../postGen/types';
import { getUserByIdFresh } from '../user/user.service';
import Blog from './blog.model';

interface IRegenerateTextRequest {
  blogId: string;
  selectedText: string;
  userPrompt: string;
  llmModel?: string;
  llmProvider?: string;
  contextBefore?: string;
  contextAfter?: string;
}

/**
 * Regenerate a specific block of text using AI
 * @param {IRegenerateTextRequest} data - The regeneration request data
 * @param {mongoose.Types.ObjectId} userId - The user making the request
 * @returns {Promise<string>} The regenerated text
 */
export const regenerateText = async (
  data: IRegenerateTextRequest,
  userId: mongoose.Types.ObjectId
): Promise<string> => {
  const { blogId, selectedText, userPrompt, llmModel, llmProvider, contextBefore, contextAfter } = data;

  // Get the user to retrieve the decrypted API key (use fresh data, not cached)
  const user = await getUserByIdFresh(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get the blog to access full content for better context
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Check if user owns the blog
  if (blog.author.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to edit this blog');
  }

  // Determine which API key to use based on the provider field
  let decryptedApiKey: string;
  const provider = llmProvider || 'openai';

  if (provider === 'google') {
    if (!user.hasGoogleApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Google API key is required for Gemini models');
    }
    decryptedApiKey = user.getDecryptedGoogleApiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt Google API key');
    }
  } else if (provider === 'mistral') {
    if (!user.hasOpenAiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Mistral API key is required for Mistral models');
    }
    decryptedApiKey = user.getDecryptedOpenAiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt Mistral API key');
    }
  } else {
    // OpenAI models (default)
    if (!user.hasOpenAiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OpenAI API key is required for text regeneration');
    }
    decryptedApiKey = user.getDecryptedOpenAiKey();
    if (!decryptedApiKey) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to decrypt OpenAI API key');
    }
  }

  // Build the LLM
  const model = llmModel || 'gpt-4o-mini';
  const postPrompt: BasePostPrompt = {
    model: model as llm,
    temperature: 0.7,
    apiKey: decryptedApiKey,
  };

  const llmInstance = buildLLM(postPrompt, false);

  // Build a comprehensive prompt with context
  const systemPrompt = `You are an expert content editor helping to improve blog content. Your task is to regenerate a specific section of text based on the user's instructions while maintaining coherence with the surrounding content.

Guidelines:
1. Follow the user's instructions precisely
2. Maintain consistency with the blog's overall tone and style
3. Ensure the regenerated text flows naturally with the surrounding context
4. Keep the same markdown formatting style as the original
5. Preserve any important facts or information unless specifically asked to change them
6. Return ONLY the regenerated text without any explanations or additional commentary`;

  let userMessage = `Blog Title: ${blog.title}\n\n`;

  // Add context before if available
  if (contextBefore !== undefined && contextBefore.trim()) {
    userMessage += `Context before (for reference only, do not modify):\n${contextBefore}\n\n`;
  }

  userMessage += `Text to regenerate:\n${selectedText}\n\n`;

  // Add context after if available
  if (contextAfter !== undefined && contextAfter.trim()) {
    userMessage += `Context after (for reference only, do not modify):\n${contextAfter}\n\n`;
  }

  userMessage += `User instructions: ${userPrompt}\n\n`;
  userMessage += `Please regenerate the selected text following the user's instructions while maintaining coherence with the surrounding content.`;

  try {
    logger.info(`Regenerating text for blog ${blogId} with model ${model}`);

    const response = await llmInstance.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const regeneratedText = response.content.toString().trim();

    logger.info(`Successfully regenerated text for blog ${blogId}`);
    return regeneratedText;
  } catch (error) {
    logger.error(`Error regenerating text for blog ${blogId}:`, error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to regenerate text. Please try again.');
  }
};
