import { FC } from 'react';
import { Paper, Typography } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';

const EmptyComments: FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 6,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'action.hover',
      }}
    >
      <ChatBubbleOutline sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" fontWeight={500}>
        No comments yet
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
        Be the first to share your thoughts!
      </Typography>
    </Paper>
  );
};

export default EmptyComments;
