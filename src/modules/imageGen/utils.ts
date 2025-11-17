import logger from '../logger/logger';
import { ImageGenerationError } from './errors';

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Execute a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: string
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;
  let delay = retryConfig.initialDelay;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's not a retryable error
      if (error instanceof ImageGenerationError && !error.retryable) {
        throw error;
      }

      if (attempt < retryConfig.maxRetries) {
        const contextStr = context ? ` (${context})` : '';
        logger.warn(
          `Attempt ${attempt + 1}/${retryConfig.maxRetries + 1} failed${contextStr}, retrying in ${delay}ms...`,
          error
        );

        await sleep(delay);
        delay = Math.min(delay * retryConfig.backoffMultiplier, retryConfig.maxDelay);
      }
    }
  }

  throw new ImageGenerationError(
    `Operation failed after ${retryConfig.maxRetries + 1} attempts: ${lastError?.message}`,
    lastError,
    false
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch process items with concurrency control
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    stopOnError?: boolean;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<Array<{ success: boolean; result?: R; error?: Error; item: T }>> {
  const { concurrency = 3, stopOnError = false, onProgress } = options;
  const results: Array<{ success: boolean; result?: R; error?: Error; item: T }> = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;

    const promise = (async () => {
      try {
        const result = await processor(item, i);
        results.push({ success: true, result, item });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results.push({ success: false, error: err, item });

        if (stopOnError) {
          throw err;
        }
      } finally {
        if (onProgress) {
          onProgress(results.length, items.length);
        }
      }
    })();

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      const index = executing.findIndex((p) => p === promise);
      if (index !== -1) {
        void executing.splice(index, 1);
      }
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
