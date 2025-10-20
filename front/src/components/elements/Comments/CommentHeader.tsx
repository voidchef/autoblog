import React from 'react';
import { Box, Avatar, Typography, IconButton, Menu, MenuItem, Divider, Chip } from '@mui/material';
import { MoreVert, Edit, Delete } from '@mui/icons-material';
import { stringAvatar } from '../../../utils/utils';

interface CommentHeaderProps {
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;
  anchorEl: HTMLElement | null;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({
  authorName,
  createdAt,
  updatedAt,
  isOwner,
  anchorEl,
  onMenuOpen,
  onMenuClose,
  onEdit,
  onDelete,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Avatar {...stringAvatar(authorName)} />
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {authorName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(createdAt)}
        </Typography>
        {updatedAt !== createdAt && <Chip label="edited" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
      </Box>
      {isOwner && (
        <IconButton
          size="small"
          onClick={onMenuOpen}
          sx={{
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'white',
            },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={onEdit} sx={{ gap: 1.5, py: 1.5 }}>
          <Edit fontSize="small" /> Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={onDelete} sx={{ gap: 1.5, py: 1.5, color: 'error.main' }}>
          <Delete fontSize="small" /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CommentHeader;
