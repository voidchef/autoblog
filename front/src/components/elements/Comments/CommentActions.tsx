import React from 'react';
import { Box, IconButton, Typography, Button } from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Reply,
  ThumbUpOutlined,
  ThumbDownOutlined,
  ChatBubbleOutline,
} from '@mui/icons-material';

interface CommentActionsProps {
  hasLiked: boolean;
  hasDisliked: boolean;
  likesCount: number;
  dislikesCount: number;
  repliesCount?: number;
  showReplies?: boolean;
  isReply?: boolean;
  userId: string | null;
  onLike: () => void;
  onDislike: () => void;
  onReply?: () => void;
  onToggleReplies?: () => void;
}

const CommentActions: React.FC<CommentActionsProps> = ({
  hasLiked,
  hasDisliked,
  likesCount,
  dislikesCount,
  repliesCount = 0,
  showReplies = false,
  isReply = false,
  userId,
  onLike,
  onDislike,
  onReply,
  onToggleReplies,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
      {/* Like Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={onLike}
          disabled={!userId}
          sx={{
            color: hasLiked ? 'primary.main' : 'text.secondary',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'primary.main',
              transform: 'scale(1.1)',
            },
          }}
        >
          {hasLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
        </IconButton>
        <Typography
          variant="body2"
          fontWeight={hasLiked ? 600 : 400}
          color={hasLiked ? 'primary.main' : 'text.secondary'}
        >
          {likesCount}
        </Typography>
      </Box>

      {/* Dislike Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={onDislike}
          disabled={!userId}
          sx={{
            color: hasDisliked ? 'error.main' : 'text.secondary',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'error.main',
              transform: 'scale(1.1)',
            },
          }}
        >
          {hasDisliked ? <ThumbDown fontSize="small" /> : <ThumbDownOutlined fontSize="small" />}
        </IconButton>
        <Typography
          variant="body2"
          fontWeight={hasDisliked ? 600 : 400}
          color={hasDisliked ? 'error.main' : 'text.secondary'}
        >
          {dislikesCount}
        </Typography>
      </Box>

      {/* Reply Button */}
      {!isReply && userId && onReply && (
        <Button
          size="small"
          startIcon={<Reply />}
          onClick={onReply}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          Reply
        </Button>
      )}

      {/* Toggle Replies Button */}
      {!isReply && repliesCount > 0 && onToggleReplies && (
        <Button
          size="small"
          onClick={onToggleReplies}
          startIcon={<ChatBubbleOutline />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {showReplies ? 'Hide' : 'Show'} {repliesCount} {repliesCount === 1 ? 'Reply' : 'Replies'}
        </Button>
      )}
    </Box>
  );
};

export default CommentActions;
