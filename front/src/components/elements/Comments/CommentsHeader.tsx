import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';

interface CommentsHeaderProps {
  count: number;
}

const CommentsHeader: React.FC<CommentsHeaderProps> = ({ count }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 4,
        pb: 2,
        borderBottom: '2px solid',
        borderColor: 'primary.main',
      }}
    >
      <ChatBubbleOutline sx={{ fontSize: 32, color: 'primary.main' }} />
      <Typography variant="h4" fontWeight={700}>
        Comments
      </Typography>
      <Chip label={count} color="primary" sx={{ fontWeight: 600 }} />
    </Box>
  );
};

export default CommentsHeader;
