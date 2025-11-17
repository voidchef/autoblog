/**
 * Custom error types for post generation module
 */

export class PostGenerationError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'PostGenerationError';
    Object.setPrototypeOf(this, PostGenerationError.prototype);
  }
}

export class OutlineGenerationError extends PostGenerationError {
  constructor(message: string, cause?: unknown) {
    super(message, cause, true);
    this.name = 'OutlineGenerationError';
    Object.setPrototypeOf(this, OutlineGenerationError.prototype);
  }
}

export class ContentGenerationError extends PostGenerationError {
  constructor(message: string, cause?: unknown) {
    super(message, cause, true);
    this.name = 'ContentGenerationError';
    Object.setPrototypeOf(this, ContentGenerationError.prototype);
  }
}

export class MemoryManagementError extends PostGenerationError {
  constructor(message: string, cause?: unknown) {
    super(message, cause, false);
    this.name = 'MemoryManagementError';
    Object.setPrototypeOf(this, MemoryManagementError.prototype);
  }
}

export class ValidationError extends PostGenerationError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, undefined, false);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
