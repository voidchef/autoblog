/**
 * Custom error types for image generation module
 */

export class ImageGenerationError extends Error {
  public override readonly cause?: unknown;
  public readonly retryable: boolean;

  constructor(message: string, cause?: unknown, retryable: boolean = false) {
    super(message);
    this.name = 'ImageGenerationError';
    this.cause = cause;
    this.retryable = retryable;
    Object.setPrototypeOf(this, ImageGenerationError.prototype);
  }
}

export class PromptOptimizationError extends ImageGenerationError {
  constructor(message: string, cause?: unknown) {
    super(message, cause, true);
    this.name = 'PromptOptimizationError';
    Object.setPrototypeOf(this, PromptOptimizationError.prototype);
  }
}

export class ImageProviderError extends ImageGenerationError {
  constructor(message: string, cause?: unknown, retryable: boolean = true) {
    super(message, cause, retryable);
    this.name = 'ImageProviderError';
    Object.setPrototypeOf(this, ImageProviderError.prototype);
  }
}

export class InvalidConfigurationError extends ImageGenerationError {
  constructor(message: string) {
    super(message, undefined, false);
    this.name = 'InvalidConfigurationError';
    Object.setPrototypeOf(this, InvalidConfigurationError.prototype);
  }
}
