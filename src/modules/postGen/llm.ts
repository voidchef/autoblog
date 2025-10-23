import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOpenAI } from '@langchain/openai';
import { BasePostPrompt } from './types';

export function buildLLM(postPrompt: BasePostPrompt, forJson: boolean = false): BaseChatModel {
  switch (postPrompt.model) {
    case 'gpt-4o':
    case 'gpt-4o-mini':
    case 'o1-preview':
    case 'o1-mini':
      return buildOpenAI(postPrompt, forJson);
    case 'mistral-small-latest':
    case 'mistral-medium-latest':
    case 'mistral-large-latest':
      return buildMistral(postPrompt, forJson);
    case 'gemini-2.5-flash':
    case 'gemini-2.5-pro':
    case 'gemini-2.0-flash':
      return buildGoogleGenAI(postPrompt, forJson);

    default:
      return buildOpenAI(postPrompt, forJson);
  }
}

function buildOpenAI(postPrompt: BasePostPrompt, forJson: boolean = false) {
  if (!postPrompt.apiKey) {
    throw new Error(
      'OpenAI API key is required. Please ensure your user profile has a valid OpenAI API key configured.'
    );
  }

  const llmParams = {
    modelName: postPrompt.model.toString(),
    temperature: postPrompt.temperature ?? 0.8,
    frequencyPenalty: forJson ? 0 : (postPrompt.frequencyPenalty ?? 1),
    presencePenalty: forJson ? 0 : (postPrompt.presencePenalty ?? 1),
    verbose: postPrompt.debugapi ?? false,
    apiKey: postPrompt.apiKey,
  };
  return new ChatOpenAI(llmParams);
}

function buildMistral(postPrompt: BasePostPrompt, forJson: boolean = false) {
  if (!postPrompt.apiKey) {
    throw new Error(
      'Mistral API key is required. Please ensure your user profile has a valid Mistral API key configured.'
    );
  }

  const llmParams = {
    modelName: postPrompt.model.toString(),
    temperature: postPrompt.temperature ?? 0.8,
    frequencyPenalty: forJson ? 0 : (postPrompt.frequencyPenalty ?? 1),
    presencePenalty: forJson ? 0 : (postPrompt.presencePenalty ?? 1),
    verbose: postPrompt.debugapi ?? false,
    apiKey: postPrompt.apiKey,
  };
  return new ChatMistralAI(llmParams);
}

function buildGoogleGenAI(postPrompt: BasePostPrompt, _forJson: boolean = false) {
  if (!postPrompt.apiKey) {
    throw new Error(
      'Google API key is required. Please ensure your user profile has a valid Google API key configured.'
    );
  }

  const llmParams = {
    model: postPrompt.model.toString(),
    temperature: postPrompt.temperature ?? 0.8,
    verbose: postPrompt.debugapi ?? false,
    apiKey: postPrompt.apiKey,
  };
  return new ChatGoogleGenerativeAI(llmParams);
}
