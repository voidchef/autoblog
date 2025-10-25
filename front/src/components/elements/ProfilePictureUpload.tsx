import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Typography,
  Paper,
  alpha,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useUploadProfilePictureMutation } from '../../services/userApi';
import { useAppDispatch } from '../../utils/reduxHooks';
import { showSuccess, showError } from '../../reducers/alert';

interface ProfilePictureUploadProps {
  userId: string;
  currentPicture?: string;
  userName: string;
  onUploadSuccess?: (url: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userId,
  currentPicture,
  userName,
  onUploadSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [uploadProfilePicture, { isLoading }] = useUploadProfilePictureMutation();
  const [preview, setPreview] = useState<string | null>(currentPicture || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      dispatch(showError('Please upload an image file (jpg, png, gif, or webp)'));
      return;
    }

    // Validate file size (max 1MB)
    if (file.size >= 1 * 1024 * 1024) {
      dispatch(showError('File size must be less than 1MB'));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    try {
      const result = await uploadProfilePicture({ userId, file }).unwrap();
      dispatch(showSuccess('Profile picture updated successfully!'));
      if (onUploadSuccess && result.profilePicture) {
        onUploadSuccess(result.profilePicture);
      }
    } catch (error: any) {
      dispatch(showError(error?.data?.message || 'Failed to upload profile picture'));
      // Revert preview on error
      setPreview(currentPicture || null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name: string): string => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Avatar with upload overlay */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 120, sm: 150 },
          height: { xs: 120, sm: 150 },
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Avatar
          src={preview || undefined}
          alt={userName}
          sx={{
            width: '100%',
            height: '100%',
            fontSize: { xs: '2.5rem', sm: '3rem' },
            bgcolor: 'primary.main',
            border: (theme) => `4px solid ${theme.palette.background.paper}`,
            boxShadow: 3,
          }}
        >
          {!preview && getInitials(userName)}
        </Avatar>

        {/* Upload overlay on hover */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.6),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s',
            cursor: 'pointer',
            '&:hover': {
              opacity: 1,
            },
            ...(dragActive && { opacity: 1, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.8) }),
          }}
          onClick={handleButtonClick}
        >
          {isLoading ? (
            <CircularProgress size={40} sx={{ color: 'white' }} />
          ) : (
            <CameraAltIcon sx={{ fontSize: 40, color: 'white' }} />
          )}
        </Box>
      </Box>

      {/* Upload area */}
      <Paper
        sx={{
          p: 2,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          border: (theme) => `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
          bgcolor: (theme) => (dragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent'),
          transition: 'all 0.3s',
          cursor: 'pointer',
        }}
        onClick={handleButtonClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Drag and drop or click to upload
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supported formats: JPG, PNG, GIF, WEBP (max 5MB)
        </Typography>
      </Paper>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={handleButtonClick}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Choose File'}
        </Button>
        {preview && (
          <IconButton
            color="error"
            onClick={handleRemove}
            disabled={isLoading}
            sx={{ 
              border: 1, 
              borderColor: 'error.main',
              width: 50,
              height: 50,
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePictureUpload;
