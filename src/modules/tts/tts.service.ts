import { writeFile } from 'fs/promises';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import * as tmp from 'tmp';
import S3Utils from '../aws/S3Utils';
import logger from '../logger/logger';

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

      // Check byte length and split if necessary
      const textChunks = this.splitTextByByteLimit(cleanText, 4500); // Use 4500 bytes to be safe

      if (textChunks.length === 1) {
        // Single chunk - process normally
        return await this.processTextChunk(
          textChunks[0]!,
          blogId,
          languageCode,
          voiceName,
          audioEncoding,
          speakingRate,
          pitch
        );
      } else {
        // Multiple chunks - process and concatenate
        logger.info(`Text exceeds byte limit, splitting into ${textChunks.length} chunks for blog ${blogId}`);
        return await this.processMultipleChunks(
          textChunks,
          blogId,
          languageCode,
          voiceName,
          audioEncoding,
          speakingRate,
          pitch
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating audio narration: ${errorMessage}`);
      throw new Error(`Failed to generate audio narration: ${errorMessage}`);
    }
  }

  /**
   * Process a single text chunk to audio
   */
  private async processTextChunk(
    text: string,
    blogId: string,
    languageCode: string,
    voiceName: string,
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS',
    speakingRate: number,
    pitch: number
  ): Promise<TTSResult> {
    // Construct the request
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding[audioEncoding] as number,
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
  }

  /**
   * Process multiple text chunks and concatenate audio files
   */
  private async processMultipleChunks(
    textChunks: string[],
    blogId: string,
    languageCode: string,
    voiceName: string,
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS',
    speakingRate: number,
    pitch: number
  ): Promise<TTSResult> {
    try {
      const audioBuffers: Buffer[] = [];

      // Generate audio for each chunk
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i]!;
        const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
          input: { text: chunk },
          voice: {
            languageCode,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding[audioEncoding] as number,
            speakingRate,
            pitch,
          },
        };

        logger.info(`Generating audio chunk ${i + 1}/${textChunks.length} for blog ${blogId}`);

        const [response] = await this.client.synthesizeSpeech(request);

        if (!response.audioContent) {
          throw new Error(`No audio content received for chunk ${i + 1}`);
        }

        // Store the audio buffer
        audioBuffers.push(Buffer.from(response.audioContent));
      }

      // Concatenate audio buffers
      const concatenatedBuffer = this.concatenateAudioBuffers(audioBuffers, audioEncoding);

      // Create temporary file for the concatenated audio
      const tempFile = await this.createTempFile('.mp3');

      try {
        // Write concatenated audio to temp file
        await writeFile(tempFile.path, concatenatedBuffer);

        // Upload concatenated audio to S3
        const uploadResult = await this.s3Utils.uploadFromUrlsOrFiles({
          sources: [tempFile.path],
          blogId,
          uploadPath: `blogs/${blogId}/audio`,
        });

        if (uploadResult.uploadedUrls.length === 0) {
          throw new Error('Failed to upload concatenated audio to S3');
        }

        logger.info(`Concatenated audio narration uploaded successfully for blog ${blogId}`);

        return {
          audioUrl: uploadResult.uploadedUrls[0]!,
        };
      } finally {
        tempFile.cleanup();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error processing multiple chunks: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Split text into chunks based on byte limit
   * @param text - Text to split
   * @param maxBytes - Maximum bytes per chunk (default 4500 to be safe under 5000 limit)
   * @returns Array of text chunks
   */
  private splitTextByByteLimit(text: string, maxBytes: number = 4500): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    // Split by sentences to avoid cutting mid-sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (const sentence of sentences) {
      const sentenceBytes = Buffer.byteLength(sentence, 'utf8');

      // If a single sentence exceeds the limit, split it by words
      if (sentenceBytes > maxBytes) {
        const words = sentence.split(/\s+/);
        for (const word of words) {
          const testChunk = currentChunk + (currentChunk ? ' ' : '') + word;
          if (Buffer.byteLength(testChunk, 'utf8') > maxBytes) {
            if (currentChunk) {
              chunks.push(currentChunk);
              currentChunk = word;
            } else {
              // Even a single word exceeds limit, truncate it
              chunks.push(`${word.substring(0, maxBytes - 3)}...`);
              currentChunk = '';
            }
          } else {
            currentChunk = testChunk;
          }
        }
      } else {
        const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
        if (Buffer.byteLength(testChunk, 'utf8') > maxBytes) {
          if (currentChunk) {
            chunks.push(currentChunk);
          }
          currentChunk = sentence;
        } else {
          currentChunk = testChunk;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Concatenate multiple audio buffers without external dependencies
   * @param buffers - Array of audio buffers to concatenate
   * @param audioEncoding - Audio encoding format
   * @returns Concatenated buffer
   */
  private concatenateAudioBuffers(buffers: Buffer[], audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS'): Buffer {
    if (buffers.length === 0) {
      throw new Error('No audio buffers to concatenate');
    }

    if (buffers.length === 1) {
      return buffers[0]!;
    }

    // For MP3, we can concatenate the raw buffers
    // MP3 is a frame-based format that can be concatenated by simply joining the data
    if (audioEncoding === 'MP3') {
      logger.info(`Concatenating ${buffers.length} MP3 audio buffers`);
      return Buffer.concat(buffers);
    }

    // For LINEAR16 (raw PCM), concatenation is straightforward
    if (audioEncoding === 'LINEAR16') {
      logger.info(`Concatenating ${buffers.length} LINEAR16 audio buffers`);
      return Buffer.concat(buffers);
    }

    // For OGG_OPUS, simple concatenation works for most cases
    // Note: For production use with OGG, consider using a proper muxer
    if (audioEncoding === 'OGG_OPUS') {
      logger.info(`Concatenating ${buffers.length} OGG_OPUS audio buffers`);
      logger.warn(
        'OGG_OPUS concatenation via buffer joining may not be ideal. Consider using MP3 format for long texts.'
      );
      return Buffer.concat(buffers);
    }

    // Fallback - just concatenate
    return Buffer.concat(buffers);
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
