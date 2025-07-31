import * as React from 'react';
import { Box, TextField } from '@mui/material';

interface BlogContentFieldsProps {
  blogTitle: string;
  blogContent: string;
  isEditMode: boolean;
  disabled?: boolean;
  onBlogTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlogContentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BlogContentFields({
  blogTitle,
  blogContent,
  isEditMode,
  disabled = false,
  onBlogTitleChange,
  onBlogContentChange,
}: BlogContentFieldsProps) {
  return (
    <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
      <TextField
        fullWidth
        id="post-title-required"
        label="Post Title"
        value={blogTitle}
        disabled={blogTitle !== '' ? false : true || disabled}
        required={isEditMode}
        onChange={onBlogTitleChange}
      />
      <Box sx={{ my: 3 }} />
      <TextField
        id="outlined-multiline-static"
        label="Blog Content"
        value={blogContent}
        disabled={blogTitle !== '' ? false : true || disabled}
        required={isEditMode}
        multiline
        rows={30}
        placeholder="Start writing your blog here..."
        fullWidth
        onChange={onBlogContentChange}
      />
    </Box>
  );
}
