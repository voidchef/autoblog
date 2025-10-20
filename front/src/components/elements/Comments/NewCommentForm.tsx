import React from 'react';
import { Paper, Typography, TextField, Button, CircularProgress, Zoom } from '@mui/material';

interface NewCommentFormProps {
  comment: string;
  isCreating: boolean;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
}

const NewCommentForm: React.FC<NewCommentFormProps> = ({ comment, isCreating, onCommentChange, onSubmit }) => {
  return (
    <Zoom in timeout={400}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: '2px solid',
          borderColor: 'primary.light',
          borderRadius: 3,
          bgcolor: 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 4,
            borderColor: 'primary.main',
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Share your thoughts
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.default',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!comment.trim() || isCreating}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          {isCreating ? <CircularProgress size={24} /> : 'Post Comment'}
        </Button>
      </Paper>
    </Zoom>
  );
};

export default NewCommentForm;
