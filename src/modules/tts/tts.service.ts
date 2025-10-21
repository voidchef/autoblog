import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import * as tmp from 'tmp';
import S3Utils from '../aws/s3utils';
import logger from '../logger/logger';
import { v4 as generateUUID } from 'uuid';

export interface TTSConfig {
  languageCode?: string;
  voiceName?: string;
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
  speakingRate?: number;
  pitch?: number;
}

export interface TTSResult {
  audioUrl: string;
  duration?: number;
}

export class TTSService {
  private client: TextToSpeechClient;
  private s3Utils: typeof S3Utils;

  constructor() {
    // Initialize Google Cloud Text-to-Speech client
    // Uses GOOGLE_APPLICATION_CREDENTIALS environment variable or service-account.json
    this.client = new TextToSpeechClient();
    this.s3Utils = S3Utils;
  }

  /**
   * Convert text to speech and upload to S3
   * @param text - The text content to convert to speech
   * @param blogId - The blog ID for organizing files
   * @param config - Optional TTS configuration
   * @returns Promise with the audio URL
   */
  async textToSpeech(text: string, blogId: string, config?: TTSConfig): Promise<TTSResult> {
    try {
      // Clean text from HTML/Markdown for better narration
      const cleanText = this.cleanTextForSpeech(text);

      // Set default configuration
      const languageCode = config?.languageCode || 'en-US';
      const voiceName = config?.voiceName || 'en-US-Wavenet-D'; // WaveNet voices for high-quality audio
      const audioEncoding = config?.audioEncoding || 'MP3';
      const speakingRate = config?.speakingRate || 1.0;
      const pitch = config?.pitch || 0;

      // Construct the request
      const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
        input: { text: cleanText },
        voice: {
          languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding[audioEncoding],
          speakingRate,
          pitch,
        },
      };

      logger.info(`Generating audio narration for blog ${blogId}`);

      // Perform the text-to-speech request
      const [response] = await this.client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }

      // Create a temporary file to store the audio
      const tempFile = await this.createTempFile('.mp3');
      
      try {
        // Write the binary audio content to a temporary file
        await writeFile(tempFile.path, response.audioContent);

        // Upload to S3
        const uploadResult = await this.s3Utils.uploadFromUrlsOrFiles({
          sources: [tempFile.path],
          blogId,
          uploadPath: `blogs/${blogId}/audio`,
        });

        if (uploadResult.uploadedUrls.length === 0) {
          throw new Error('Failed to upload audio to S3');
        }

        logger.info(`Audio narration uploaded successfully for blog ${blogId}`);

        return {
          audioUrl: uploadResult.uploadedUrls[0]!,
        };
      } finally {
        // Clean up temporary file
        tempFile.cleanup();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating audio narration: ${errorMessage}`);
      throw new Error(`Failed to generate audio narration: ${errorMessage}`);
    }
  }

  /**
   * Clean text for speech synthesis by removing markdown/HTML and formatting
   * @param text - Raw text content
   * @returns Cleaned text suitable for speech
   */
  private cleanTextForSpeech(text: string): string {
    let cleanText = text;

    // Remove HTML tags
    cleanText = cleanText.replace(/<[^>]*>/g, ' ');

    // Remove markdown headers
    cleanText = cleanText.replace(/#{1,6}\s?/g, '');

    // Remove markdown bold/italic
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1');
    cleanText = cleanText.replace(/\*(.*?)\*/g, '$1');

    // Remove markdown links but keep the text
    cleanText = cleanText.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

    // Remove markdown images
    cleanText = cleanText.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

    // Remove code blocks
    cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
    cleanText = cleanText.replace(/`([^`]*)`/g, '$1');

    // Remove excessive whitespace and newlines
    cleanText = cleanText.replace(/\n\s*\n\s*\n/g, '\n\n');
    cleanText = cleanText.replace(/[ \t]+/g, ' ');

    // Trim
    cleanText = cleanText.trim();

    // Google TTS has a 5000 character limit per request
    // If text is longer, truncate it (in a production app, you'd want to split and combine)
    if (cleanText.length > 5000) {
      logger.warn(`Text too long for single TTS request (${cleanText.length} chars), truncating to 5000 chars`);
      cleanText = cleanText.substring(0, 4997) + '...';
    }

    return cleanText;
  }

  /**
   * Create a temporary file
   * @param extension - File extension (e.g., '.mp3')
   * @returns Promise with temp file path and cleanup function
   */
  private createTempFile(extension: string = ''): Promise<{ path: string; cleanup: () => void }> {
    return new Promise((resolve, reject) => {
      tmp.file({ postfix: extension, keep: false }, (err, filePath, _fd, cleanupCallback) => {
        if (err) {
          reject(new Error(`Failed to create temporary file: ${err.message}`));
        } else {
          resolve({
            path: filePath,
            cleanup: cleanupCallback,
          });
        }
      });
    });
  }

  /**
   * Get available voices for a language
   * @param languageCode - Language code (e.g., 'en-US')
   * @returns List of available voices
   */
  async listVoices(languageCode?: string): Promise<protos.google.cloud.texttospeech.v1.IVoice[]> {
    try {
      const request: protos.google.cloud.texttospeech.v1.IListVoicesRequest = {};
      if (languageCode) {
        request.languageCode = languageCode;
      }
      const [response] = await this.client.listVoices(request);
      return response.voices || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error listing voices: ${errorMessage}`);
      throw new Error(`Failed to list voices: ${errorMessage}`);
    }
  }
}

export default new TTSService();
