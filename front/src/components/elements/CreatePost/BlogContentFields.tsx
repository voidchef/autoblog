import * as React from 'react';
import { Box, TextField, Paper, Typography, InputAdornment, Chip, Menu, MenuItem, ListItemIcon, ListItemText, GlobalStyles, useTheme } from '@mui/material';
import { 
  Title as TitleIcon,
  Article as ArticleIcon,
  Info as InfoIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  BlockTypeSelect,
  type MDXEditorMethods
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './mdxeditor-custom.css';
import TextRegenerationDialog from './TextRegenerationDialog';

interface BlogContentFieldsProps {
  blogTitle: string;
  blogContent: string;
  isEditMode: boolean;
  disabled?: boolean;
  blogId?: string;
  onBlogTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlogContentChange: (content: string) => void;
}

export default function BlogContentFields({
  blogTitle,
  blogContent,
  isEditMode,
  disabled = false,
  blogId,
  onBlogTitleChange,
  onBlogContentChange,
}: BlogContentFieldsProps) {
  const mdxEditorRef = React.useRef<MDXEditorMethods>(null);
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const [editorKey, setEditorKey] = React.useState(0);
  const [contextMenu, setContextMenu] = React.useState<{ mouseX: number; mouseY: number } | null>(null);
  const [selectedText, setSelectedText] = React.useState('');
  const [regenerationDialogOpen, setRegenerationDialogOpen] = React.useState(false);
  const [contextBefore, setContextBefore] = React.useState('');
  const [contextAfter, setContextAfter] = React.useState('');
  
  const theme = useTheme();
  const wordCount = blogContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = blogContent.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Update editor when blogContent changes externally (e.g., from AI generation or loading a blog)
  React.useEffect(() => {
    if (mdxEditorRef.current && blogContent !== mdxEditorRef.current.getMarkdown()) {
      setEditorKey(prev => prev + 1);
    }
  }, [blogContent]);

  // Handle context menu (right-click) on editor
  const handleContextMenu = (event: React.MouseEvent) => {
    // Only show context menu if we're in edit mode and have a blog ID
    if (!isEditMode || !blogId || disabled || blogTitle === '') {
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      event.preventDefault();
      setSelectedText(text);
      
      // Get surrounding context
      const fullText = blogContent;
      const selectionStart = fullText.indexOf(text);
      if (selectionStart !== -1) {
        // Get 500 characters before and after for context
        const before = fullText.substring(Math.max(0, selectionStart - 500), selectionStart);
        const after = fullText.substring(selectionStart + text.length, Math.min(fullText.length, selectionStart + text.length + 500));
        setContextBefore(before);
        setContextAfter(after);
      }
      
      setContextMenu({
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6,
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRegenerateClick = () => {
    setRegenerationDialogOpen(true);
    handleCloseContextMenu();
  };

  const handleApplyRegeneration = (newText: string) => {
    if (mdxEditorRef.current && selectedText) {
      const currentContent = mdxEditorRef.current.getMarkdown();
      const updatedContent = currentContent.replace(selectedText, newText);
      onBlogContentChange(updatedContent);
      setEditorKey(prev => prev + 1);
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          // Target all possible active button states
          '.mdxeditor-toolbar button[data-active="true"]': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(29, 78, 216, 0.4) !important'
              : 'rgba(29, 78, 216, 0.25) !important',
            color: theme.palette.mode === 'dark'
              ? '#60a5fa !important'
              : '#1d4ed8 !important',
            border: theme.palette.mode === 'dark'
              ? '2px solid #60a5fa !important'
              : '2px solid #1d4ed8 !important',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 10px rgba(96, 165, 250, 0.5) !important'
              : '0 0 10px rgba(29, 78, 216, 0.4) !important',
          },
          '.mdxeditor-toolbar button[aria-pressed="true"]': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(29, 78, 216, 0.4) !important'
              : 'rgba(29, 78, 216, 0.25) !important',
            color: theme.palette.mode === 'dark'
              ? '#60a5fa !important'
              : '#1d4ed8 !important',
            border: theme.palette.mode === 'dark'
              ? '2px solid #60a5fa !important'
              : '2px solid #1d4ed8 !important',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 10px rgba(96, 165, 250, 0.5) !important'
              : '0 0 10px rgba(29, 78, 216, 0.4) !important',
          },
          '.mdxeditor-toolbar button[data-state="on"]': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(29, 78, 216, 0.4) !important'
              : 'rgba(29, 78, 216, 0.25) !important',
            color: theme.palette.mode === 'dark'
              ? '#60a5fa !important'
              : '#1d4ed8 !important',
            border: theme.palette.mode === 'dark'
              ? '2px solid #60a5fa !important'
              : '2px solid #1d4ed8 !important',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 10px rgba(96, 165, 250, 0.5) !important'
              : '0 0 10px rgba(29, 78, 216, 0.4) !important',
          },
          '.mdxeditor-toolbar button.active': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(29, 78, 216, 0.4) !important'
              : 'rgba(29, 78, 216, 0.25) !important',
            color: theme.palette.mode === 'dark'
              ? '#60a5fa !important'
              : '#1d4ed8 !important',
            border: theme.palette.mode === 'dark'
              ? '2px solid #60a5fa !important'
              : '2px solid #1d4ed8 !important',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 10px rgba(96, 165, 250, 0.5) !important'
              : '0 0 10px rgba(29, 78, 216, 0.4) !important',
          },
          '.mdxeditor-toolbar button[data-active="true"] svg, .mdxeditor-toolbar button[aria-pressed="true"] svg, .mdxeditor-toolbar button[data-state="on"] svg, .mdxeditor-toolbar button.active svg': {
            color: theme.palette.mode === 'dark'
              ? '#60a5fa !important'
              : '#1d4ed8 !important',
          },
        }}
      />
      <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArticleIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Content Editor
            </Typography>
          </Box>
          
          {blogContent && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${wordCount} words`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={`${readingTime} min read`} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            </Box>
          )}
        </Box>

        <Box display={'flex'} flexDirection={'column'} sx={{ gap: 3 }}>
          <TextField
            fullWidth
            id="post-title-required"
            label="Post Title"
            value={blogTitle}
            disabled={blogTitle !== '' ? false : true || disabled}
            required={isEditMode}
            onChange={onBlogTitleChange}
            placeholder="Enter a captivating title..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 500,
              },
            }}
          />
          
          {!blogContent && !disabled && (
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <InfoIcon fontSize="small" color="info" sx={{ flexShrink: 0, mt: { xs: 0.25, sm: 0 } }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {isEditMode 
                  ? "Edit your blog content below. Changes will be saved to draft."
                  : "Fill in the configuration and click 'Generate with AI' to create content automatically!"
                }
              </Typography>
            </Box>
          )}
          
          <Box
            ref={editorContainerRef}
            onContextMenu={handleContextMenu}
            sx={{
              border: (theme) => theme.palette.mode === 'dark'
                ? `1px solid ${theme.palette.customColors.borders.primaryDark}`
                : `1px solid ${theme.palette.customColors.borders.primaryLight}`,
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? theme.palette.customColors.bgDark.paper
                : theme.palette.customColors.bgLight.paper,
              '& .mdxeditor': {
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
              },
              '& .mdxeditor-toolbar': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? theme.palette.customColors.bgDark.secondary
                  : theme.palette.customColors.bgLight.secondary,
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? `1px solid ${theme.palette.customColors.borders.primaryDark}`
                  : `1px solid ${theme.palette.customColors.borders.primaryLight}`,
                padding: '8px 12px',
                gap: '4px',
              },
              '& .mdxeditor-root-contenteditable': {
                minHeight: '500px',
                padding: '20px',
                fontSize: '1rem',
                lineHeight: 1.8,
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.bgDark.paper
                  : theme.palette.customColors.bgLight.paper,
                '& *': {
                  backgroundColor: 'transparent !important',
                  boxShadow: 'none !important',
                },
                '& input, & textarea': {
                  backgroundColor: 'transparent !important',
                  boxShadow: 'none !important',
                  color: (theme) => theme.palette.mode === 'dark'
                    ? `${theme.palette.customColors.textDark.primary} !important`
                    : `${theme.palette.customColors.textLight.primary} !important`,
                },
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px transparent inset !important',
                  WebkitTextFillColor: 'inherit !important',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
              },
              '& .mdxeditor-toolbar button': {
                color: (theme) => theme.palette.mode === 'dark' 
                  ? `${theme.palette.customColors.textDark.primary} !important`
                  : `${theme.palette.customColors.textLight.primary} !important`,
                backgroundColor: 'transparent !important',
                borderRadius: '6px',
                transition: 'all 0.2s',
                border: '2px solid transparent !important',
                padding: '6px 8px !important',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1) !important'
                    : 'rgba(0, 0, 0, 0.05) !important',
                },
                '&[data-active="true"]': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(29, 78, 216, 0.35) !important'  // #1d4ed8 with 35% opacity
                    : 'rgba(29, 78, 216, 0.2) !important',
                  color: (theme) => theme.palette.mode === 'dark'
                    ? '#60a5fa !important'  // Bright blue for dark mode
                    : '#1d4ed8 !important', // Deep blue for light mode
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid #3b82f6 !important'  // Solid blue border
                    : '2px solid #1d4ed8 !important',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 0 8px rgba(59, 130, 246, 0.4) !important'
                    : '0 0 8px rgba(29, 78, 216, 0.3) !important',
                },
                '&[aria-pressed="true"]': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(29, 78, 216, 0.35) !important'
                    : 'rgba(29, 78, 216, 0.2) !important',
                  color: (theme) => theme.palette.mode === 'dark'
                    ? '#60a5fa !important'
                    : '#1d4ed8 !important',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid #3b82f6 !important'
                    : '2px solid #1d4ed8 !important',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 0 8px rgba(59, 130, 246, 0.4) !important'
                    : '0 0 8px rgba(29, 78, 216, 0.3) !important',
                },
                '& svg': {
                  color: (theme) => theme.palette.mode === 'dark' 
                    ? `${theme.palette.customColors.textDark.primary} !important`
                    : `${theme.palette.customColors.textLight.primary} !important`,
                },
              },
              '& .mdxeditor-toolbar button[data-active="true"] svg, & .mdxeditor-toolbar button[aria-pressed="true"] svg': {
                color: (theme) => theme.palette.mode === 'dark'
                  ? '#60a5fa !important'  // Bright blue
                  : '#1d4ed8 !important', // Deep blue
                filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))',
              },
              '& .mdxeditor-toolbar select': {
                color: (theme) => theme.palette.mode === 'dark'
                  ? `${theme.palette.customColors.textDark.primary} !important`
                  : `${theme.palette.customColors.textLight.primary} !important`,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? `${theme.palette.customColors.bgDark.tertiary} !important`
                  : `${theme.palette.customColors.bgLight.paper} !important`,
                borderRadius: '6px',
                border: (theme) => theme.palette.mode === 'dark'
                  ? `1px solid ${theme.palette.customColors.borders.primaryDark}`
                  : `1px solid ${theme.palette.customColors.borders.primaryLight}`,
                padding: '4px 8px',
                '& option': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? `${theme.palette.customColors.bgDark.tertiary} !important`
                    : `${theme.palette.customColors.bgLight.paper} !important`,
                  color: (theme) => theme.palette.mode === 'dark'
                    ? `${theme.palette.customColors.textDark.primary} !important`
                    : `${theme.palette.customColors.textLight.primary} !important`,
                },
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? `${theme.palette.customColors.bgDark.quaternary} !important`
                    : `${theme.palette.customColors.bgLight.paperAlt} !important`,
                },
                '&:focus': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? `${theme.palette.customColors.bgDark.tertiary} !important`
                    : `${theme.palette.customColors.bgLight.paper} !important`,
                  outline: (theme) => theme.palette.mode === 'dark'
                    ? `2px solid ${theme.palette.customColors.accent.blue.dark}`
                    : `2px solid ${theme.palette.customColors.accent.blue.main}`,
                  outlineOffset: '2px',
                },
              },
              // Additional styling for dropdown elements
              '& .mdxeditor-toolbar [role="combobox"]': {
                color: (theme) => theme.palette.mode === 'dark'
                  ? `${theme.palette.customColors.textDark.primary} !important`
                  : `${theme.palette.customColors.textLight.primary} !important`,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? `${theme.palette.customColors.bgDark.tertiary} !important`
                  : `${theme.palette.customColors.bgLight.paper} !important`,
              },
              '& .mdxeditor-toolbar [role="option"]': {
                color: (theme) => theme.palette.mode === 'dark'
                  ? `${theme.palette.customColors.textDark.primary} !important`
                  : `${theme.palette.customColors.textLight.primary} !important`,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? `${theme.palette.customColors.bgDark.tertiary} !important`
                  : `${theme.palette.customColors.bgLight.paper} !important`,
                '&[data-selected="true"], &:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? `${theme.palette.customColors.componentOverlays.accentBlueDark} !important`
                    : `${theme.palette.customColors.componentOverlays.accentBlueLight} !important`,
                  color: (theme) => `${theme.palette.customColors.accent.blue.main} !important`,
                },
              },
              '& .mdxeditor-toolbar [data-radix-select-viewport]': {
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? `${theme.palette.customColors.bgDark.tertiary} !important`
                  : `${theme.palette.customColors.bgLight.paper} !important`,
              },
              '& .mdxeditor-toolbar [data-radix-popper-content-wrapper]': {
                zIndex: 9999,
              },
              '& .mdxeditor h1': {
                fontSize: '2.5rem',
                fontWeight: 700,
                marginTop: '1.5rem',
                marginBottom: '1rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor h2': {
                fontSize: '2rem',
                fontWeight: 600,
                marginTop: '1.5rem',
                marginBottom: '0.875rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor h3': {
                fontSize: '1.5rem',
                fontWeight: 600,
                marginTop: '1.25rem',
                marginBottom: '0.75rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor h4': {
                fontSize: '1.25rem',
                fontWeight: 600,
                marginTop: '1rem',
                marginBottom: '0.5rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor h5': {
                fontSize: '1.125rem',
                fontWeight: 600,
                marginTop: '1rem',
                marginBottom: '0.5rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor h6': {
                fontSize: '1rem',
                fontWeight: 600,
                marginTop: '1rem',
                marginBottom: '0.5rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor p': {
                marginBottom: '1rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor code': {
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.componentOverlays.accentBlueDark
                  : theme.palette.customColors.componentOverlays.accentBlueLight,
                color: (theme) => theme.palette.customColors.accent.blue.main,
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.9em',
                fontFamily: 'monospace',
              },
              '& .mdxeditor pre': {
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.bgDark.tertiary
                  : theme.palette.customColors.bgLight.tertiary,
                border: (theme) => theme.palette.mode === 'dark'
                  ? `1px solid ${theme.palette.customColors.borders.primaryDark}`
                  : `1px solid ${theme.palette.customColors.borders.primaryLight}`,
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                marginBottom: '1rem',
                '& code': {
                  backgroundColor: 'transparent !important',
                  color: (theme) => theme.palette.mode === 'dark'
                    ? theme.palette.customColors.textDark.primary
                    : theme.palette.customColors.textLight.primary,
                },
              },
              '& .mdxeditor blockquote': {
                borderLeft: (theme) => `4px solid ${theme.palette.customColors.accent.blue.main}`,
                paddingLeft: '16px',
                marginLeft: '0',
                marginBottom: '1rem',
                fontStyle: 'italic',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.secondary
                  : theme.palette.customColors.textLight.secondary,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.componentOverlays.accentBlueDark
                  : theme.palette.customColors.componentOverlays.accentBlueLight,
                padding: '12px 16px',
                borderRadius: '4px',
              },
              '& .mdxeditor ul, & .mdxeditor ol': {
                paddingLeft: '24px',
                marginBottom: '1rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor li': {
                marginBottom: '0.5rem',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor table': {
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1rem',
                border: (theme) => theme.palette.mode === 'dark'
                  ? `1px solid ${theme.palette.customColors.borders.primaryDark}`
                  : `1px solid ${theme.palette.customColors.borders.primaryLight}`,
                borderRadius: '8px',
                overflow: 'hidden',
              },
              '& .mdxeditor th, & .mdxeditor td': {
                border: (theme) => theme.palette.mode === 'dark'
                  ? `1px solid ${theme.palette.customColors.borders.primaryDark}`
                  : `1px solid ${theme.palette.customColors.borders.primaryLight}`,
                padding: '12px',
                textAlign: 'left',
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor th': {
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.bgDark.secondary
                  : theme.palette.customColors.bgLight.secondary,
                fontWeight: 600,
                color: (theme) => theme.palette.customColors.accent.blue.main,
              },
              '& .mdxeditor a': {
                color: (theme) => theme.palette.customColors.accent.blue.main,
                textDecoration: 'underline',
                transition: 'color 0.2s',
                '&:hover': {
                  color: (theme) => theme.palette.customColors.accent.blue.light,
                  textDecoration: 'none',
                },
              },
              '& .mdxeditor img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: (theme) => theme.palette.mode === 'dark'
                  ? `1px solid ${theme.palette.customColors.borders.primaryDark}`
                  : `1px solid ${theme.palette.customColors.borders.primaryLight}`,
              },
              '& .mdxeditor hr': {
                border: 'none',
                borderTop: (theme) => theme.palette.mode === 'dark'
                  ? `2px solid ${theme.palette.customColors.borders.primaryDark}`
                  : `2px solid ${theme.palette.customColors.borders.primaryLight}`,
                margin: '2rem 0',
              },
              '& .mdxeditor strong': {
                fontWeight: 700,
                color: (theme) => theme.palette.mode === 'dark'
                  ? theme.palette.customColors.textDark.primary
                  : theme.palette.customColors.textLight.primary,
              },
              '& .mdxeditor em': {
                fontStyle: 'italic',
              },
              opacity: disabled || blogTitle === '' ? 0.5 : 1,
              pointerEvents: disabled || blogTitle === '' ? 'none' : 'auto',
            }}
          >
            <MDXEditor
              key={editorKey}
              ref={mdxEditorRef}
              markdown={blogContent}
              onChange={(content) => onBlogContentChange(content)}
              placeholder="Your AI-generated content will appear here, or start writing manually..."
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin({
                  imageUploadHandler: async (file) => {
                    // You can implement your own image upload handler here
                    return URL.createObjectURL(file);
                  },
                }),
                tablePlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
                codeMirrorPlugin({
                  codeBlockLanguages: {
                    js: 'JavaScript',
                    javascript: 'JavaScript',
                    ts: 'TypeScript',
                    typescript: 'TypeScript',
                    css: 'CSS',
                    html: 'HTML',
                    python: 'Python',
                    java: 'Java',
                    json: 'JSON',
                    markdown: 'Markdown',
                    bash: 'Bash',
                  },
                }),
                diffSourcePlugin({ viewMode: 'rich-text' }),
                frontmatterPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BlockTypeSelect />
                      <BoldItalicUnderlineToggles />
                      <CodeToggle />
                      <CreateLink />
                      <InsertImage />
                      <InsertTable />
                      <InsertThematicBreak />
                      <ListsToggle />
                    </>
                  ),
                }),
              ]}
            />
          </Box>
          
          {blogContent && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 0 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  wordBreak: 'break-word',
                }}
              >
                {charCount} characters • {wordCount} words • ~{readingTime} min read
              </Typography>
              <Typography 
                variant="caption" 
                color="success.main" 
                fontWeight={600}
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.75rem' },
                }}
              >
                Looking good! 🎉
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Context Menu for Text Regeneration */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleRegenerateClick}>
          <ListItemIcon>
            <AutoFixHighIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Regenerate with AI</ListItemText>
        </MenuItem>
      </Menu>

      {/* Text Regeneration Dialog */}
      {blogId && (
        <TextRegenerationDialog
          open={regenerationDialogOpen}
          onClose={() => setRegenerationDialogOpen(false)}
          blogId={blogId}
          selectedText={selectedText}
          contextBefore={contextBefore}
          contextAfter={contextAfter}
          onApplyRegeneration={handleApplyRegeneration}
        />
      )}
      </Box>
    </>
  );
}
