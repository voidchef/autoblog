import {
  systemPrompt,
  outlinePrompt,
  audienceIntentPrompt,
  introductionPrompt,
  conclusionPrompt,
  headingPrompt,
  seoPrompt,
} from './prompts/index';

// ---------------------------------------------------------------------------
// Auto mode
// ---------------------------------------------------------------------------
export async function getSystemPrompt(): Promise<string> {
  return systemPrompt;
}

export async function getOutlinePrompt(): Promise<string> {
  return outlinePrompt;
}

export async function getAudienceIntentPrompt(): Promise<string> {
  return audienceIntentPrompt;
}

export async function getIntroductionPrompt(): Promise<string> {
  return introductionPrompt;
}

export async function getConclusionPrompt(): Promise<string> {
  return conclusionPrompt;
}

export async function getHeadingPrompt(): Promise<string> {
  return headingPrompt;
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------
export async function getSeoInfoPrompt(): Promise<string> {
  return seoPrompt;
}
