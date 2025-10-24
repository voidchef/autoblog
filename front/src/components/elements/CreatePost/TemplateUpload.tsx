import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CodeIcon from '@mui/icons-material/Code';
import { useGetTemplatePreviewMutation, ITemplatePreview } from '../../../services/blogApi';

interface TemplateUploadProps {
  onTemplateSelect: (file: File, preview: ITemplatePreview) => void;
  selectedTemplate: File | null;
}

export const TemplateUpload: React.FC<TemplateUploadProps> = ({ onTemplateSelect, selectedTemplate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [getPreview, { isLoading, error }] = useGetTemplatePreviewMutation();
  const [preview, setPreview] = useState<ITemplatePreview | null>(null);

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
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      alert('Please upload a markdown file (.md or .markdown)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const previewResult = await getPreview(file).unwrap();
      setPreview(previewResult);
      onTemplateSelect(file, previewResult);
    } catch (err) {
      console.error('Failed to preview template:', err);
    }
  };

  const handleDownloadExample = () => {
    const link = document.createElement('a');
    link.href = '/example-blog-template.md';
    link.download = 'example-blog-template.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Helper Section */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlinedIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              How to Create a Blog Template
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                📋 Template Structure
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Templates use special tags to define different sections:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<code>{'{{s: ... }}'}</code>}
                    secondary="System prompt - Sets the overall context and instructions for the AI"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<code>{'{{c: ... }}'}</code>}
                    secondary="Content section - Each tag generates one section of content"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<code>{'{{i: ... }}'}</code>}
                    secondary="Image section - Generates an image based on the prompt"
                  />
                </ListItem>
              </List>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                🔤 Using Variables
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add dynamic content using <code>{'{variableName}'}</code> format:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? theme.palette.customColors.bgDark.paperAlt 
                    : theme.palette.customColors.bgLight.paperAlt,
                  overflow: 'auto',
                  maxWidth: '100%',
                }}
              >
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    margin: 0,
                    whiteSpace: 'pre',
                    overflowX: 'auto',
                    wordBreak: 'normal',
                    wordWrap: 'normal',
                    color: (theme) => theme.palette.mode === 'dark' 
                      ? theme.palette.customColors.textDark.primary 
                      : theme.palette.customColors.textLight.primary,
                  }}
                >
                  {`{{s: You are writing about {topic} for {audience} }}
{{c: Write an introduction about {topic} }}
{{c: Explain key benefits of {topic} }}
{{i: Create an infographic about {topic} }}`}
                </Typography>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Variables: <strong>topic</strong>, <strong>audience</strong> (you'll fill these in later)
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                ✅ Best Practices
              </Typography>
              <List dense>
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    • Start with a system prompt to set the tone and context
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    • Use clear, specific prompts for each content section
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    • Place image prompts after related content sections
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    • Keep variable names simple and descriptive (e.g., {'{topic}'}, {'{brand_name}'})
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    • Test your template with different variable values
                  </Typography>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                📥 Example Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Download ready-to-use templates to get started quickly:
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadExample}
                  size="small"
                  fullWidth
                >
                  General Blog Template (3 variables)
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/dog-breed-template.md';
                    link.download = 'dog-breed-template.md';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  size="small"
                  fullWidth
                >
                  Dog Breed Guide Template (1 variable)
                </Button>
              </Stack>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Upload Section */}
      <Paper
        elevation={0}
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="template-file-upload"
          accept=".md,.markdown"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="template-file-upload" style={{ cursor: 'pointer', display: 'block' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Processing template...
              </Typography>
            </Box>
          ) : selectedTemplate && preview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
              <Typography variant="h6" color="text.primary">
                {selectedTemplate.name}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                <Chip label={`${preview.contentPromptCount} content sections`} size="small" color="primary" />
                {preview.imagePromptCount > 0 && (
                  <Chip label={`${preview.imagePromptCount} image sections`} size="small" color="secondary" />
                )}
                <Chip label={`${preview.variables.length} variables`} size="small" />
              </Stack>
              <Button variant="outlined" size="small">
                Change Template
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.primary">
                Drop your template file here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: .md, .markdown (max 5MB)
              </Typography>
            </Box>
          )}
        </label>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {typeof error === 'string' ? error : 'Failed to process template. Please check the file format.'}
        </Alert>
      )}

      {preview && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Template Variables ({preview.variables.length}):
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
            {preview.variables.map((variable) => (
              <Chip key={variable} icon={<DescriptionIcon />} label={variable} size="small" variant="outlined" />
            ))}
          </Stack>
          {preview.variables.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No variables detected in this template
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
