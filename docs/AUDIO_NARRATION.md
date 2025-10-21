# AI Voice Narration Feature

This document describes the AI voice narration feature that has been added to the autoblog platform.

## Overview

The AI voice narration feature allows blog posts to be converted to audio using Google Cloud Text-to-Speech (TTS). Users can listen to blog articles instead of reading them, providing better accessibility and convenience.

## Features

- **Text-to-Speech Conversion**: Converts blog content to natural-sounding audio using Google Cloud TTS with WaveNet voices
- **Audio Player**: Full-featured audio player with play/pause, volume control, playback speed adjustment, and progress tracking
- **On-Demand Generation**: Audio is generated on-demand when requested by users
- **Storage**: Generated audio files are stored in AWS S3 for persistence and CDN delivery
- **Status Tracking**: Tracks audio generation status (pending, processing, completed, failed)
- **Comprehensive Testing**: Full test coverage for TTS service, blog service, and API endpoints

## Architecture

### Backend Components

1. **TTS Service** (`src/modules/tts/tts.service.ts`)
   - Integrates with Google Cloud Text-to-Speech API
   - Cleans blog content (removes HTML/Markdown) for better narration
   - Uploads generated audio to S3
   - Supports multiple languages and voices

2. **Blog Model Updates** (`src/modules/blog/blog.model.ts`, `blog.interfaces.ts`)
   - Added `audioNarrationUrl`: Stores the S3 URL of the generated audio
   - Added `audioGenerationStatus`: Tracks generation status

3. **Blog Service** (`src/modules/blog/blog.service.ts`)
   - `generateAudioNarration()`: Generates audio narration for a blog post
   - `getAudioNarrationStatus()`: Retrieves audio status and URL

4. **Blog Controller** (`src/modules/blog/blog.controller.ts`)
   - `POST /blogs/:blogId/audio`: Endpoint to generate audio
   - `GET /blogs/:blogId/audio`: Endpoint to get audio status

### Frontend Components

1. **AudioPlayer Component** (`front/src/components/elements/AudioPlayer.tsx`)
   - Full-featured HTML5 audio player
   - Play/pause controls
   - Volume control with mute
   - Playback speed adjustment (0.5x - 2x)
   - Progress bar with seek functionality
   - Time display (current/duration)

2. **Blog Page Integration** (`front/src/components/pages/Blog.tsx`)
   - Displays audio player when narration is available
   - "Generate Audio" button for authenticated users with permissions
   - Loading state during audio generation

3. **API Integration** (`front/src/services/blogApi.ts`)
   - `useGenerateAudioNarrationMutation`: Hook to generate audio
   - `useGetAudioNarrationStatusQuery`: Hook to get audio status

## Setup and Configuration

### Prerequisites

1. **Google Cloud Project**: You need a Google Cloud project with Text-to-Speech API enabled
2. **Service Account**: Create a service account with Text-to-Speech permissions
3. **AWS S3**: Audio files are stored in S3 (existing S3 setup is used)

### Environment Variables

Add the following to your `.env` file:

```bash
# Google Cloud Text-to-Speech
# Path to service account JSON file for Google Cloud TTS authentication
GOOGLE_APPLICATION_CREDENTIALS='./service-account.json'
```

### Service Account Setup

1. Go to Google Cloud Console
2. Create a new service account or use existing one
3. Grant "Cloud Text-to-Speech User" role
4. Download the JSON key file
5. Place it in your project root as `service-account.json`

Alternatively, set the path in the environment variable.

## API Endpoints

### Generate Audio Narration

```http
POST /v1/blogs/:blogId/audio
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Audio narration generated successfully",
  "audioNarrationUrl": "https://s3.amazonaws.com/bucket/path/to/audio.mp3",
  "audioGenerationStatus": "completed"
}
```

### Get Audio Status

```http
GET /v1/blogs/:blogId/audio
```

**Response:**
```json
{
  "audioNarrationUrl": "https://s3.amazonaws.com/bucket/path/to/audio.mp3",
  "audioGenerationStatus": "completed"
}
```

## Usage

### For End Users

1. Navigate to any blog post
2. If audio narration is available, the audio player will be displayed below the header image
3. Click play to listen to the article
4. Use controls to adjust volume and playback speed

### For Content Creators

1. After creating/publishing a blog post
2. Click the "Generate Audio" button (requires `manageBlogs` permission)
3. Wait for generation to complete (typically 5-30 seconds depending on content length)
4. Audio player will appear automatically once generation is complete

## Technical Details

### Voice Configuration

Default configuration:
- **Language**: Follows blog post language (defaults to en-US)
- **Voice**: Wavenet-D (high-quality, natural-sounding voice)
- **Audio Format**: MP3
- **Speaking Rate**: 1.0x (normal speed)
- **Pitch**: 0 (neutral)

Available WaveNet voices provide superior audio quality compared to standard voices, with more natural intonation and expressiveness.

### Content Processing

The TTS service automatically:
- Removes HTML tags
- Removes Markdown formatting
- Removes code blocks
- Cleans up whitespace
- Truncates to 5000 characters if needed (Google TTS limit)

### Caching

- Audio files are generated once and stored in S3
- Subsequent requests serve the cached audio
- No regeneration unless explicitly requested

## Limitations

- **Text Length**: Google TTS has a 5000 character limit per request. Long articles are truncated.
- **Language Support**: Limited to languages supported by Google Cloud TTS
- **Permissions**: Only users with `manageBlogs` permission can generate audio

## Future Enhancements

Potential improvements for future versions:

1. **Long Content Support**: Split long articles into multiple audio segments
2. **Voice Selection**: Allow users to choose from different voices
3. **Automatic Generation**: Generate audio automatically when blog is published
4. **Multiple Languages**: Support for multiple language tracks per blog
5. **Cost Optimization**: Cache frequently accessed audio, lazy-load less popular content
6. **Analytics**: Track audio play counts and engagement metrics

## Dependencies

### Backend
- `@google-cloud/text-to-speech`: ^6.3.1

### Frontend
- Material-UI components (already installed)
- HTML5 Audio API (browser native)

## Cost Considerations

Google Cloud Text-to-Speech pricing:
- WaveNet voices: ~$16 per 1 million characters
- Typical blog post (2000 words ≈ 12,000 characters): ~$0.19
- First 1 million characters per month are free

WaveNet voices provide higher quality audio compared to standard voices, though at a slightly higher cost. The superior naturalness makes them ideal for content narration.

Recommendation: Enable audio generation on-demand rather than automatically to control costs.

## Testing

The feature includes comprehensive test coverage:

### TTS Service Tests (`src/modules/tts/tts.test.ts`)
- Audio generation from text
- WaveNet voice configuration
- Custom voice settings
- Text cleaning (HTML/Markdown removal)
- Error handling and logging
- Voice listing functionality

### Blog Service Tests (`src/modules/blog/blog.test.ts`)
- Audio narration generation
- Status tracking and updates
- Error handling and recovery
- Concurrent generation prevention

### API Endpoint Tests
- Authentication and authorization
- Audio generation endpoint
- Audio status retrieval
- Error responses

Run tests with:
```bash
# Run all tests
pnpm test

# Run TTS tests only
pnpm test src/modules/tts/tts.test.ts

# Run blog tests (includes audio tests)
pnpm test src/modules/blog/blog.test.ts
```

## Troubleshooting

### Audio Generation Fails

1. Check `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
2. Verify service account has TTS permissions
3. Check Google Cloud Console for API quota limits
4. Review server logs for detailed error messages

### Audio Player Not Showing

1. Verify audio URL is accessible (check CORS settings on S3)
2. Check browser console for errors
3. Verify blog data includes `audioNarrationUrl` field

### Poor Audio Quality

1. Consider using different Google TTS voices
2. Adjust speaking rate and pitch parameters
3. Clean blog content before generation (remove unnecessary symbols)

## Support

For issues or questions:
1. Check server logs: `pnpm run server`
2. Check browser console for frontend errors
3. Review Google Cloud TTS documentation
4. Contact development team

---

**Author**: AutoBlog Development Team  
**Last Updated**: October 21, 2025
