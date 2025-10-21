import React from 'react';
import { Box, TextField, Button, Fade } from '@mui/material';

interface CommentReplyFormProps {
  content: string;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const CommentReplyForm: React.FC<CommentReplyFormProps> = ({ content, onContentChange, onSubmit, onCancel }) => {
  return (
    <Fade in timeout={300}>
      <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Write a thoughtful reply..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={onSubmit}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Submit Reply
          </Button>
          <Button size="small" onClick={onCancel} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};

export default CommentReplyForm;
