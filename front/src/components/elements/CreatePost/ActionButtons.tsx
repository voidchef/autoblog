import { Box, Button, CircularProgress, Paper, Typography, Divider, Tooltip } from '@mui/material';
import { 
  AutoAwesome as AutoAwesomeIcon,
  Preview as PreviewIcon,
  RestartAlt as RestartAltIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  Publish as PublishIcon,
  UnpublishedOutlined as UnpublishIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface ActionButtonsProps {
  isEditMode: boolean;
  isPublished: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onReset: () => void;
  onUpdate: () => void;
  onOpenImagePicker: () => void;
  onPublishStatusChange: () => void;
}

export default function ActionButtons({
  isEditMode,
  isPublished,
  disabled = false,
  isLoading = false,
  onReset,
  onUpdate,
  onOpenImagePicker,
  onPublishStatusChange,
}: ActionButtonsProps) {
  return (
    <Box
      sx={{ 
        width: { xs: '100%', sm: '35%' },
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Actions
        </Typography>
        
        <Box display={'flex'} flexDirection={'column'} sx={{ gap: 1.5 }}>
          <Tooltip title={isEditMode ? "Preview your changes" : "Generate blog content using AI"} arrow>
            <span>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                fullWidth
                disabled={disabled || isLoading}
                startIcon={isLoading 
                  ? <CircularProgress size={20} color="inherit" /> 
                  : isEditMode 
                    ? <PreviewIcon /> 
                    : <AutoAwesomeIcon />
                }
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: (theme) => `0 6px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {isLoading 
                  ? 'Generating Magic...' 
                  : (isEditMode ? 'Preview Changes' : 'Generate with AI')
                }
              </Button>
            </span>
          </Tooltip>
          
          <Divider sx={{ my: 1 }} />
          
          <Tooltip title="Restore original values" arrow>
            <span>
              <Button 
                variant="outlined" 
                size="medium"
                fullWidth
                disabled={!isEditMode || disabled}
                startIcon={<RestartAltIcon />}
                onClick={onReset}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Reset
              </Button>
            </span>
          </Tooltip>
          
          <Tooltip title="Save changes to draft" arrow>
            <span>
              <Button
                variant="outlined"
                size="medium"
                fullWidth
                disabled={!isEditMode || disabled}
                startIcon={<SaveIcon />}
                onClick={onUpdate}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Save Draft
              </Button>
            </span>
          </Tooltip>
          
          <Tooltip title="Choose a featured image" arrow>
            <span>
              <Button
                variant="outlined"
                size="medium"
                fullWidth
                disabled={!isEditMode || disabled}
                startIcon={<ImageIcon />}
                onClick={onOpenImagePicker}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Featured Image
              </Button>
            </span>
          </Tooltip>
          
          <Divider sx={{ my: 1 }} />
          
          <Tooltip title={isPublished ? "Make blog private" : "Make blog public"} arrow>
            <span>
              <Button
                variant={isPublished ? "contained" : "outlined"}
                size="medium"
                fullWidth
                color={isPublished ? "success" : "primary"}
                disabled={!isEditMode || disabled}
                startIcon={isPublished ? <UnpublishIcon /> : <PublishIcon />}
                onClick={onPublishStatusChange}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  ...(isPublished && {
                    boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.success.main, 0.3)}`,
                  }),
                }}
              >
                {isPublished ? 'Unpublish' : 'Publish Now'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
}
