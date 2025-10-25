import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeMuteIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import * as analytics from '../../utils/analytics';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  blogId?: string;
  loading?: boolean;
  onGenerateAudio?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title, blogId, loading, onGenerateAudio }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);
  const [hasTrackedComplete, setHasTrackedComplete] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      
      // Track audio completion
      if (blogId && title && !hasTrackedComplete) {
        analytics.trackAudioComplete(blogId, title, duration);
        setHasTrackedComplete(true);
      }
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio loading error:', e);
      setAudioError(true);
      setIsPlaying(false);
    };
    
    const handleCanPlay = () => {
      setAudioError(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as any);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as any);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, blogId, title, duration, hasTrackedComplete]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        // Wait for the audio to start playing
        await audio.play();
        setIsPlaying(true);
        
        // Track audio play event (only once per session)
        if (blogId && title && !hasTrackedPlay) {
          analytics.trackAudioPlay(blogId, title);
          setHasTrackedPlay(true);
        }
      } catch (error) {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
        setAudioError(true);
      }
    }
  };

  const handleGenerateAudio = () => {
    if (onGenerateAudio) {
      onGenerateAudio();
      
      // Track audio generation request
      if (blogId && title) {
        analytics.trackAudioGenerate(blogId, title);
      }
    }
  };

  const handleSeek = (_event: Event, value: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTime = Array.isArray(value) ? value[0] : value;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (_event: Event, value: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const volumeValue = Array.isArray(value) ? value[0] : value;
    audio.volume = volumeValue;
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = nextRate;
    }
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Generating audio narration...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!audioUrl) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Audio narration not available
          </Typography>
          {onGenerateAudio && (
            <IconButton onClick={handleGenerateAudio} color="primary" size="small">
              <VolumeUpIcon />
            </IconButton>
          )}
        </Stack>
      </Paper>
    );
  }

  if (audioError) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'error.lighter' }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="error">
            Failed to load audio. The file may be unavailable or in an unsupported format.
          </Typography>
          {onGenerateAudio && (
            <IconButton onClick={handleGenerateAudio} color="primary" size="small">
              <VolumeUpIcon />
            </IconButton>
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <Stack spacing={2}>
        {title && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeUpIcon fontSize="small" />
            Listen to this article
          </Typography>
        )}

        <Box>
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            sx={{ mb: 1 }}
            size="small"
            disabled={audioError}
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={togglePlay} color="primary" size="large" disabled={audioError}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
            <IconButton onClick={toggleMute} size="small" disabled={audioError}>
              {isMuted ? <VolumeMuteIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              max={1}
              step={0.01}
              onChange={handleVolumeChange}
              sx={{ mx: 1, width: 80 }}
              size="small"
              disabled={audioError}
            />
          </Box>

          <Tooltip title={`Speed: ${playbackRate}x`}>
            <IconButton onClick={cyclePlaybackRate} size="small" disabled={audioError}>
              <SpeedIcon />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {playbackRate}x
              </Typography>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AudioPlayer;
