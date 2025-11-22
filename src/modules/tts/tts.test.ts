import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { describe, expect, jest, beforeEach, afterEach, it } from '@jest/globals';
import S3Utils from '../aws/S3Utils';
import logger from '../logger/logger';
import { TTSService } from './tts.service';

// Mock dependencies
jest.mock('@google-cloud/text-to-speech');
jest.mock('../aws/S3Utils');
jest.mock('../logger/logger');

describe('TTS Service', () => {
  let ttsService: TTSService;
  let mockSynthesizeSpeech: jest.Mock;
  let mockListVoices: jest.Mock;
  let mockUploadFromUrlsOrFiles: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock functions
    mockSynthesizeSpeech = jest.fn();
    mockListVoices = jest.fn();
    mockUploadFromUrlsOrFiles = jest.fn();

    // Mock TextToSpeechClient
    (TextToSpeechClient as unknown as jest.Mock).mockImplementation(() => ({
      synthesizeSpeech: mockSynthesizeSpeech,
      listVoices: mockListVoices,
    }));

    // Mock S3Utils
    (S3Utils.uploadFromUrlsOrFiles as any) = mockUploadFromUrlsOrFiles;

    // Create new instance
    ttsService = new TTSService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('textToSpeech', () => {
    const mockBlogId = 'blog-123';
    const mockText = 'This is a test blog post content.';
    const mockAudioContent = Buffer.from('mock audio data');
    const mockS3Url = 'https://s3.amazonaws.com/bucket/blogs/blog-123/audio/file.mp3';

    beforeEach(() => {
      (mockSynthesizeSpeech as any).mockResolvedValue([
        {
          audioContent: mockAudioContent,
        },
      ]);

      (mockUploadFromUrlsOrFiles as any).mockResolvedValue({
        uploadedUrls: [mockS3Url],
        errors: [],
      });
    });

    it('should successfully generate audio from text', async () => {
      const result = await ttsService.textToSpeech(mockText, mockBlogId);

      expect(result).toEqual({
        audioUrl: mockS3Url,
      });
      expect(mockSynthesizeSpeech).toHaveBeenCalledTimes(1);
      expect(mockUploadFromUrlsOrFiles).toHaveBeenCalledTimes(1);
    });

    it('should use default WaveNet voice configuration', async () => {
      await ttsService.textToSpeech(mockText, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.voice?.name).toBe('en-US-Wavenet-D');
      expect(callArgs?.voice?.languageCode).toBe('en-US');
    });

    it('should use custom voice configuration when provided', async () => {
      const config = {
        languageCode: 'es-ES',
        voiceName: 'es-ES-Wavenet-B',
        speakingRate: 1.2,
        pitch: 2,
      };

      await ttsService.textToSpeech(mockText, mockBlogId, config);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.voice?.name).toBe('es-ES-Wavenet-B');
      expect(callArgs?.voice?.languageCode).toBe('es-ES');
      expect(callArgs?.audioConfig?.speakingRate).toBe(1.2);
      expect(callArgs?.audioConfig?.pitch).toBe(2);
    });

    it('should clean HTML tags from text', async () => {
      const htmlText = '<p>This is <strong>bold</strong> text</p>';
      await ttsService.textToSpeech(htmlText, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.input?.text).not.toContain('<p>');
      expect(callArgs?.input?.text).not.toContain('<strong>');
    });

    it('should clean Markdown from text', async () => {
      const markdownText = '# Heading\n\nThis is **bold** and *italic* text\n\n[Link](http://example.com)';
      await ttsService.textToSpeech(markdownText, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.input?.text).not.toContain('#');
      expect(callArgs?.input?.text).not.toContain('**');
      expect(callArgs?.input?.text).not.toContain('[Link]');
    });

    it('should remove code blocks from text', async () => {
      const codeText = 'Some text\n```javascript\nconst x = 1;\n```\nMore text';
      await ttsService.textToSpeech(codeText, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.input?.text).not.toContain('```');
      expect(callArgs?.input?.text).not.toContain('const x = 1');
    });

    it('should handle text within byte limit with single request', async () => {
      const normalText = 'a'.repeat(3000);
      await ttsService.textToSpeech(normalText, mockBlogId);

      // Should only call synthesizeSpeech once for text under limit
      expect(mockSynthesizeSpeech).toHaveBeenCalledTimes(1);
      expect(mockUploadFromUrlsOrFiles).toHaveBeenCalledTimes(1);
    });

    it('should split text exceeding byte limit into chunks and concatenate', async () => {
      // Create text with sentences that will exceed 4500 bytes
      const longSentence = 'This is a very long sentence. '.repeat(200); // ~6000 bytes

      // Mock multiple audio responses for chunks
      const audioChunk1 = Buffer.from('audio chunk 1');
      const audioChunk2 = Buffer.from('audio chunk 2');
      (mockSynthesizeSpeech as any)
        .mockResolvedValueOnce([{ audioContent: audioChunk1 }])
        .mockResolvedValueOnce([{ audioContent: audioChunk2 }]);

      // Mock successful upload
      (mockUploadFromUrlsOrFiles as any).mockResolvedValue({
        uploadedUrls: [mockS3Url],
        errors: [],
      });

      const result = await ttsService.textToSpeech(longSentence, mockBlogId);

      // Should call synthesizeSpeech multiple times for chunks
      expect(mockSynthesizeSpeech.mock.calls.length).toBeGreaterThan(1);
      // Should still successfully upload concatenated audio
      expect(result.audioUrl).toBe(mockS3Url);
      expect(mockUploadFromUrlsOrFiles).toHaveBeenCalledTimes(1);
    });

    it('should upload audio to correct S3 path', async () => {
      await ttsService.textToSpeech(mockText, mockBlogId);

      expect(mockUploadFromUrlsOrFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          blogId: mockBlogId,
          uploadPath: `blogs/${mockBlogId}/audio`,
        })
      );
    });

    it('should throw error if no audio content is received', async () => {
      (mockSynthesizeSpeech as any).mockResolvedValue([{}]);

      await expect(ttsService.textToSpeech(mockText, mockBlogId)).rejects.toThrow(
        'No audio content received from Google TTS'
      );
    });

    it('should throw error if S3 upload fails', async () => {
      (mockUploadFromUrlsOrFiles as any).mockResolvedValue({
        uploadedUrls: [],
        errors: ['Upload failed'],
      });

      await expect(ttsService.textToSpeech(mockText, mockBlogId)).rejects.toThrow('Failed to upload audio to S3');
    });

    it('should throw error if TTS API call fails', async () => {
      (mockSynthesizeSpeech as any).mockRejectedValue(new Error('TTS API error'));

      await expect(ttsService.textToSpeech(mockText, mockBlogId)).rejects.toThrow(
        'Failed to generate audio narration: TTS API error'
      );
    });

    it('should log success message on completion', async () => {
      await ttsService.textToSpeech(mockText, mockBlogId);

      expect(logger.info).toHaveBeenCalledWith(`Generating audio narration for blog ${mockBlogId}`);
      expect(logger.info).toHaveBeenCalledWith(`Audio narration uploaded successfully for blog ${mockBlogId}`);
    });

    it('should log error on failure', async () => {
      const error = new Error('Test error');
      (mockSynthesizeSpeech as any).mockRejectedValue(error);

      await expect(ttsService.textToSpeech(mockText, mockBlogId)).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith('Error generating audio narration: Test error');
    });
  });

  describe('listVoices', () => {
    const mockVoices = [
      { name: 'en-US-Wavenet-A', languageCodes: ['en-US'] },
      { name: 'en-US-Wavenet-B', languageCodes: ['en-US'] },
      { name: 'es-ES-Wavenet-A', languageCodes: ['es-ES'] },
    ];

    beforeEach(() => {
      (mockListVoices as any).mockResolvedValue([{ voices: mockVoices }]);
    });

    it('should list all voices when no language code is provided', async () => {
      const voices = await ttsService.listVoices();

      expect(voices).toEqual(mockVoices);
      expect(mockListVoices).toHaveBeenCalledWith({});
    });

    it('should list voices for specific language code', async () => {
      await ttsService.listVoices('en-US');

      expect(mockListVoices).toHaveBeenCalledWith({ languageCode: 'en-US' });
    });

    it('should return empty array if no voices are returned', async () => {
      (mockListVoices as any).mockResolvedValue([{}]);

      const voices = await ttsService.listVoices();

      expect(voices).toEqual([]);
    });

    it('should throw error if API call fails', async () => {
      (mockListVoices as any).mockRejectedValue(new Error('API error'));

      await expect(ttsService.listVoices()).rejects.toThrow('Failed to list voices: API error');
    });

    it('should log error on failure', async () => {
      (mockListVoices as any).mockRejectedValue(new Error('Test error'));

      await expect(ttsService.listVoices()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith('Error listing voices: Test error');
    });
  });

  describe('cleanTextForSpeech', () => {
    const mockBlogId = 'blog-123';
    const mockAudioContent = Buffer.from('mock audio data');
    const mockS3Url = 'https://s3.amazonaws.com/bucket/blogs/blog-123/audio/file.mp3';

    beforeEach(() => {
      (mockSynthesizeSpeech as any).mockResolvedValue([
        {
          audioContent: mockAudioContent,
        },
      ]);

      (mockUploadFromUrlsOrFiles as any).mockResolvedValue({
        uploadedUrls: [mockS3Url],
        errors: [],
      });
    });

    it('should handle empty text', async () => {
      const result = await ttsService.textToSpeech('', mockBlogId);
      expect(mockSynthesizeSpeech).toHaveBeenCalled();
      expect(result.audioUrl).toBe(mockS3Url);
    });

    it('should preserve paragraph breaks', async () => {
      const text = 'First paragraph.\n\nSecond paragraph.';
      await ttsService.textToSpeech(text, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.input?.text).toContain('First paragraph');
      expect(callArgs?.input?.text).toContain('Second paragraph');
    });

    it('should handle mixed HTML and Markdown', async () => {
      const mixedText = '<p># Heading</p>\n**Bold** and <strong>Strong</strong>';
      await ttsService.textToSpeech(mixedText, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.input?.text).not.toContain('<p>');
      expect(callArgs?.input?.text).not.toContain('#');
      expect(callArgs?.input?.text).not.toContain('**');
      expect(callArgs?.input?.text).not.toContain('<strong>');
    });

    it('should handle inline code', async () => {
      const text = 'Use the `console.log()` function';
      await ttsService.textToSpeech(text, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.input?.text).toContain('console.log()');
      expect(callArgs?.input?.text).not.toContain('`');
    });

    it('should remove markdown images', async () => {
      const text = 'Some text ![alt text](image.jpg) more text';
      await ttsService.textToSpeech(text, mockBlogId);

      const callArgs = mockSynthesizeSpeech.mock.calls[0]?.[0] as any;
      expect(callArgs?.input?.text).not.toContain('![');
      expect(callArgs?.input?.text).not.toContain('image.jpg');
    });
  });
});
