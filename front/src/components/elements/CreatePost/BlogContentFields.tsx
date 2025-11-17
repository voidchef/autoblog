import * as React from 'react';
import { Box, TextField, Paper, Typography, InputAdornment, Chip } from '@mui/material';
import { 
  Title as TitleIcon,
  Article as ArticleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  thematicBreakPlugin,
  markdownShortcutPlugin,
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

interface BlogContentFieldsProps {
  blogTitle: string;
  blogContent: string;
  isEditMode: boolean;
  disabled?: boolean;
  onBlogTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlogContentChange: (content: string) => void;
}

export default function BlogContentFields({
  blogTitle,
  blogContent,
  isEditMode,
  disabled = false,
  onBlogTitleChange,
  onBlogContentChange,
}: BlogContentFieldsProps) {
  const mdxEditorRef = React.useRef<MDXEditorMethods>(null);
  const [editorKey, setEditorKey] = React.useState(0);
  const wordCount = blogContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = blogContent.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed
  console.log('BlogContentFields rendered', blogContent);

  // Update editor when blogContent changes externally (e.g., from AI generation or loading a blog)
  React.useEffect(() => {
    if (mdxEditorRef.current && blogContent !== mdxEditorRef.current.getMarkdown()) {
      setEditorKey(prev => prev + 1);
    }
  }, [blogContent]);

  return (
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
            sx={{
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.23)}`,
              borderRadius: 2,
              overflow: 'hidden',
              '& .mdxeditor': {
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
              },
              '& .mdxeditor-toolbar': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.background.default, 0.6)
                  : alpha(theme.palette.grey[50], 0.8),
                borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                padding: '8px 12px',
                gap: '4px',
              },
              '& .mdxeditor-root-contenteditable': {
                minHeight: '500px',
                padding: '20px',
                fontSize: '1rem',
                lineHeight: 1.8,
                color: (theme) => theme.palette.text.primary,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.4)
                  : theme.palette.background.paper,
                '& *': {
                  backgroundColor: 'transparent !important',
                  boxShadow: 'none !important',
                },
                '& input, & textarea': {
                  backgroundColor: 'transparent !important',
                  boxShadow: 'none !important',
                },
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px transparent inset !important',
                  WebkitTextFillColor: 'inherit !important',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
              },
              '& .mdxeditor-toolbar button': {
                color: (theme) => theme.palette.text.primary,
                borderRadius: '6px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
                '&[data-active="true"]': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  color: (theme) => theme.palette.primary.main,
                },
              },
              '& .mdxeditor-toolbar select': {
                color: (theme) => theme.palette.text.primary,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.default, 0.6)
                  : theme.palette.background.paper,
                borderRadius: '6px',
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                padding: '4px 8px',
              },
              '& .mdxeditor h1': {
                fontSize: '2.5rem',
                fontWeight: 700,
                marginTop: '1.5rem',
                marginBottom: '1rem',
                color: (theme) => theme.palette.text.primary,
              },
              '& .mdxeditor h2': {
                fontSize: '2rem',
                fontWeight: 600,
                marginTop: '1.5rem',
                marginBottom: '0.875rem',
                color: (theme) => theme.palette.text.primary,
              },
              '& .mdxeditor h3': {
                fontSize: '1.5rem',
                fontWeight: 600,
                marginTop: '1.25rem',
                marginBottom: '0.75rem',
                color: (theme) => theme.palette.text.primary,
              },
              '& .mdxeditor p': {
                marginBottom: '1rem',
                color: (theme) => theme.palette.text.primary,
              },
              '& .mdxeditor code': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.9em',
                fontFamily: 'monospace',
              },
              '& .mdxeditor pre': {
                backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                marginBottom: '1rem',
              },
              '& .mdxeditor blockquote': {
                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                paddingLeft: '16px',
                marginLeft: '0',
                marginBottom: '1rem',
                fontStyle: 'italic',
                color: (theme) => theme.palette.text.secondary,
              },
              '& .mdxeditor ul, & .mdxeditor ol': {
                paddingLeft: '24px',
                marginBottom: '1rem',
              },
              '& .mdxeditor li': {
                marginBottom: '0.5rem',
              },
              '& .mdxeditor table': {
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1rem',
              },
              '& .mdxeditor th, & .mdxeditor td': {
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                padding: '12px',
                textAlign: 'left',
              },
              '& .mdxeditor th': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                fontWeight: 600,
              },
              '& .mdxeditor a': {
                color: (theme) => theme.palette.primary.main,
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none',
                },
              },
              '& .mdxeditor img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                marginBottom: '1rem',
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
                markdownShortcutPlugin(),
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
    </Box>
  );
}
