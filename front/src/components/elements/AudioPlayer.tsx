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

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  loading?: boolean;
  onGenerateAudio?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title, loading, onGenerateAudio }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
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
            <IconButton onClick={onGenerateAudio} color="primary" size="small">
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
          <IconButton onClick={togglePlay} color="primary" size="large">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
            <IconButton onClick={toggleMute} size="small">
              {isMuted ? <VolumeMuteIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              max={1}
              step={0.01}
              onChange={handleVolumeChange}
              sx={{ mx: 1, width: 80 }}
              size="small"
            />
          </Box>

          <Tooltip title={`Speed: ${playbackRate}x`}>
            <IconButton onClick={cyclePlaybackRate} size="small">
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
