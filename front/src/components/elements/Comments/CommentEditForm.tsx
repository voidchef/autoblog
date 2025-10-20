import React from 'react';
import { Box, TextField, Button, Fade } from '@mui/material';

interface CommentEditFormProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CommentEditForm: React.FC<CommentEditFormProps> = ({ content, onContentChange, onSave, onCancel }) => {
  return (
    <Fade in timeout={300}>
      <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          sx={{
            mb: 1.5,
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={onSave}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Save
          </Button>
          <Button size="small" onClick={onCancel} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};

export default CommentEditForm;
