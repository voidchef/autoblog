import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoFixHigh as AutoFixHighIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useRegenerateTextMutation } from '../../../services/blogApi';

interface TextRegenerationDialogProps {
  open: boolean;
  onClose: () => void;
  blogId: string;
  selectedText: string;
  contextBefore?: string;
  contextAfter?: string;
  onApplyRegeneration: (newText: string) => void;
}

export default function TextRegenerationDialog({
  open,
  onClose,
  blogId,
  selectedText,
  contextBefore,
  contextAfter,
  onApplyRegeneration,
}: TextRegenerationDialogProps) {
  const [userPrompt, setUserPrompt] = React.useState('');
  const [llmModel, setLlmModel] = React.useState('gpt-4o-mini');
  const [llmProvider, setLlmProvider] = React.useState<'openai' | 'google' | 'mistral'>('openai');
  const [regeneratedText, setRegeneratedText] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const [regenerateText, { isLoading, error }] = useRegenerateTextMutation();

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setUserPrompt('');
      setRegeneratedText('');
      setCopied(false);
    }
  }, [open]);

  const handleRegenerate = async () => {
    if (!userPrompt.trim()) {
      return;
    }

    try {
      const result = await regenerateText({
        blogId,
        selectedText,
        userPrompt,
        llmModel,
        llmProvider,
        contextBefore,
        contextAfter,
      }).unwrap();

      setRegeneratedText(result.regeneratedText);
    } catch (err) {
      console.error('Failed to regenerate text:', err);
    }
  };

  const handleCopy = async () => {
    if (regeneratedText) {
      await navigator.clipboard.writeText(regeneratedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (regeneratedText) {
      onApplyRegeneration(regeneratedText);
      onClose();
    }
  };

  const handleModelChange = (model: string) => {
    setLlmModel(model);
    // Auto-detect provider based on model
    if (model.startsWith('gemini')) {
      setLlmProvider('google');
    } else if (model.startsWith('mistral')) {
      setLlmProvider('mistral');
    } else {
      setLlmProvider('openai');
    }
  };

  const wordCount = selectedText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoFixHighIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            AI Text Regeneration
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Selected Text Preview */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Selected Text
              </Typography>
              <Chip label={`${wordCount} words`} size="small" color="primary" variant="outlined" />
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                maxHeight: '150px',
                overflow: 'auto',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {selectedText}
              </Typography>
            </Box>
          </Box>

          {/* Model Selection */}
          <FormControl fullWidth size="small">
            <InputLabel>AI Model</InputLabel>
            <Select
              value={llmModel}
              onChange={(e) => handleModelChange(e.target.value)}
              label="AI Model"
            >
              <MenuItem value="gpt-4o">GPT-4o (Best quality)</MenuItem>
              <MenuItem value="gpt-4o-mini">GPT-4o Mini (Fast & cost-effective)</MenuItem>
              <MenuItem value="o1-preview">O1 Preview</MenuItem>
              <MenuItem value="o1-mini">O1 Mini</MenuItem>
              <MenuItem value="gemini-2.0-flash">Gemini 2.0 Flash</MenuItem>
              <MenuItem value="gemini-2.5-flash">Gemini 2.5 Flash</MenuItem>
              <MenuItem value="gemini-2.5-pro">Gemini 2.5 Pro</MenuItem>
              <MenuItem value="mistral-small-latest">Mistral Small</MenuItem>
              <MenuItem value="mistral-medium-latest">Mistral Medium</MenuItem>
              <MenuItem value="mistral-large-latest">Mistral Large</MenuItem>
            </Select>
          </FormControl>

          {/* User Prompt */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Instructions for AI"
            placeholder="e.g., Make it more concise, Improve clarity, Add more examples, Change tone to professional, etc."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={isLoading}
            helperText="Describe how you want the selected text to be regenerated"
          />

          {/* Error Display */}
          {error && (
            <Alert severity="error">
              {(error as any)?.data?.message || 'Failed to regenerate text. Please try again.'}
            </Alert>
          )}

          {/* Regenerated Text */}
          {regeneratedText && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Regenerated Text
                </Typography>
                <IconButton onClick={handleCopy} size="small" color={copied ? 'success' : 'default'}>
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {regeneratedText}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          pt: 2,
          borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        {regeneratedText ? (
          <Button variant="contained" onClick={handleApply} startIcon={<CheckIcon />}>
            Apply Changes
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleRegenerate}
            disabled={isLoading || !userPrompt.trim()}
            startIcon={isLoading ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
          >
            {isLoading ? 'Regenerating...' : 'Regenerate'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
