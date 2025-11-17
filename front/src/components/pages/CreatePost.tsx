import * as React from 'react';
import Box from '@mui/material/Box';
import { ToggleButton, ToggleButtonGroup, Typography, Alert } from '@mui/material';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import GeneratingBanner from '../elements/Common/GeneratingBanner';
import { 
  Title, 
  BlogFormFields, 
  ActionButtons, 
  BlogContentFields, 
  ImagePicker,
  OpenAiKeyBanner,
  TemplateUpload,
  TemplateParametersForm,
} from '../elements/CreatePost';
import { useAppSelector } from '../../utils/reduxHooks';
import { 
  useGenerateBlogMutation, 
  useGetBlogQuery, 
  useUpdateBlogMutation, 
  useGenerateBlogFromTemplateMutation,
  IBlogData, 
  ITemplateBlogData,
  ITemplatePreview,
} from '../../services/blogApi';
import { setBlogData, clearBlog, IBlog, generateBlogWithProgress, setActiveGeneration, clearActiveGeneration } from '../../reducers/blog';
import { useAppDispatch } from '../../utils/reduxHooks';
import { useAuth } from '../../utils/hooks';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AWS_BASEURL } from '../../utils/consts';
import { ROUTES } from '../../utils/routing/routes';
import { useGetBlogGenerationStatusQuery } from '../../services/blogApi';

async function fetchImages(blogId: string) {
  const newImages: string[] = [];
  let index = 1;

  while (true) {
    const imageURL = `${AWS_BASEURL}/blogs/${blogId}/${index}.img`;

    try {
      const response = await axios.head(imageURL);
      const exists = response.status === 200;

      if (exists) {
        newImages.push(imageURL);
        index += 1;
      } else {
        break;
      }
    } catch (error) {
      throw error;
    }
  }

  return newImages;
}

export default function CreatePost() {
  const { state } = useLocation();
  const appSettings = useAppSelector((state) => state.appSettings);
  const generationProgress = useAppSelector((state) => state.blog.generationProgress);
  const activeGeneration = useAppSelector((state) => state.blog.activeGeneration);
  const { user } = useAuth();

  const blogId = state?.blogId;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: blog, isLoading } = useGetBlogQuery(blogId, { skip: !blogId });
  const [updateBlog] = useUpdateBlogMutation();

  React.useEffect(() => {
    if (!blogId) {
      dispatch(clearBlog());
    }
  }, [blogId, dispatch]);

  const [formData, setFormData] = React.useState({
    topic: '',
    country: '',
    intent: '',
    audience: '',
    language: '',
    languageModel: '',
    category: '',
    tags: '',
  });
  const [blogTitle, setBlogTitle] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [blogContent, setBlogContent] = React.useState('');
  const [images, setImages] = React.useState<string[]>([]);
  const [blogImage, setBlogImage] = React.useState<string>('');
  const [isPublished, setIsPublished] = React.useState(false);

  // Template mode state
  const [generationMode, setGenerationMode] = React.useState<'regular' | 'template'>('regular');
  const [templateFile, setTemplateFile] = React.useState<File | null>(null);
  const [templatePreview, setTemplatePreview] = React.useState<ITemplatePreview | null>(null);
  const [templateVariables, setTemplateVariables] = React.useState<Record<string, string | number | boolean>>({});
  const [generatingBlogId, setGeneratingBlogId] = React.useState<string | null>(null);

  const [generateBlogFromTemplate] = useGenerateBlogFromTemplateMutation();
  const [generateBlog] = useGenerateBlogMutation();

  // Poll for generation status
  const { data: generationStatus } = useGetBlogGenerationStatusQuery(generatingBlogId || '', {
    skip: !generatingBlogId,
    pollingInterval: 2000, // Poll every 2 seconds
  });

  // Handle generation completion
  React.useEffect(() => {
    if (generationStatus && generatingBlogId) {
      if (generationStatus.generationStatus === 'completed') {
        // Wait a bit to show the success message, then navigate
        setTimeout(() => {
          navigate(`${ROUTES.PREVIEW}/${generationStatus.slug}?preview=${true}`);
          setGeneratingBlogId(null);
          dispatch(clearActiveGeneration());
        }, 2000);
      } else if (generationStatus.generationStatus === 'failed') {
        // Wait a bit to show the error message
        setTimeout(() => {
          console.error('Blog generation failed:', generationStatus.generationError);
          setGeneratingBlogId(null);
          dispatch(clearActiveGeneration());
        }, 5000);
      }
    }
  }, [generationStatus, generatingBlogId, navigate, dispatch]);

  // Check for ongoing generation on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('activeGeneration');
    if (saved) {
      try {
        const { blogId, status } = JSON.parse(saved);
        if (status === 'processing' && blogId) {
          setGeneratingBlogId(blogId);
        }
      } catch (error) {
        console.error('Failed to parse saved generation:', error);
      }
    }
  }, []);

  // Check if generation is in progress (either from this session or loaded from localStorage)
  const isGenerationInProgress = !!(generatingBlogId || (activeGeneration.blogId && activeGeneration.status === 'processing'));

  // Check if user has API keys
  const hasOpenAiKey = user?.hasOpenAiKey || false;
  const hasGoogleApiKey = user?.hasGoogleApiKey || false;
  
  // Get the provider for the selected model
  const selectedModelData = appSettings.languageModels.find(
    (model) => model.value === formData.languageModel
  );
  const modelProvider = selectedModelData?.provider;
  
  // Determine if form should be disabled based on selected model provider
  const isFormDisabled = 
    modelProvider === 'google' ? !hasGoogleApiKey :
    modelProvider === 'mistral' ? !hasOpenAiKey :
    !hasOpenAiKey; // Default to OpenAI

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function handleSelectImage(image: string) {
    setBlogImage(image);
    handleClose();
  }

  const handlePublishStatusChange = () => {
    setIsPublished(!isPublished);
  };

  const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'regular' | 'template' | null) => {
    if (newMode !== null) {
      setGenerationMode(newMode);
      // Reset template-related state when switching modes
      if (newMode === 'regular') {
        setTemplateFile(null);
        setTemplatePreview(null);
        setTemplateVariables({});
      }
    }
  };

  const handleTemplateSelect = (file: File, preview: ITemplatePreview) => {
    setTemplateFile(file);
    setTemplatePreview(preview);
    // Initialize template variables with empty values
    const initialVariables: Record<string, string> = {};
    preview.variables.forEach((variable) => {
      initialVariables[variable] = '';
    });
    setTemplateVariables(initialVariables);
  };

  const handleTemplateVariableChange = (name: string, value: string | number | boolean) => {
    setTemplateVariables((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const initialFormData = () => {
    setBlogTitle(blog ? blog.title : '');
    setBlogContent(blog ? blog.content : '');
    setBlogImage('');
    setIsPublished(blog ? blog.isPublished : false);
    if (blog) {
      setFormData({
        ...formData,
        topic: blog.topic || '',
        country: blog.country || '',
        intent: blog.intent || '',
        audience: blog.audience || '',
        language: blog.language || '',
        languageModel: blog.llmModel || '',
        category: blog.category || '',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      });
    }
  };

  React.useEffect(() => {
    const fetchAndSetImages = async () => {
      if (blog?.id) {
        const images = await fetchImages(blog.id);
        setImages(images);
      }
    };

    if (blog?.id) {
      fetchAndSetImages();
    }
    initialFormData();
  }, [blog]);

  const handleFormDataChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleBlogTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlogTitle(event.target.value);
  };

  const handleBlogContentChange = (content: string) => {
    setBlogContent(content);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent new generation if one is already in progress
    if (isGenerationInProgress && !blog?.id) {
      alert('A blog is currently being generated. Please wait for it to complete before starting a new generation.');
      return;
    }

    if (blog && blog.id) {
      const updateData = Object.entries({
        title: blogTitle,
        content: blogContent,
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        isPublished: isPublished,
      }).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined) {
          acc[key as keyof Partial<IBlog>] = value as any;
        }
        return acc;
      }, {} as Partial<IBlog>);

      updateBlog({ id: blog.id, data: updateData, preview: true })
        .unwrap()
        .then(() => {
          navigate(`${ROUTES.PREVIEW}/${blog.slug}?preview=${true}`);
        })
        .catch((error) => {
          console.error('Failed to update blog:', error);
        });
      return;
    }

    // Generation mode
    if (generationMode === 'template') {
      // Template-based generation
      if (!templateFile) {
        alert('Please upload a template file');
        return;
      }

      // Validate all variables are filled
      const missingVariables = templatePreview?.variables.filter((v) => !templateVariables[v]);
      if (missingVariables && missingVariables.length > 0) {
        alert(`Please fill in all template variables: ${missingVariables.join(', ')}`);
        return;
      }

      const templateData: ITemplateBlogData = {
        template: templateFile,
        input: templateVariables,
        llmModel: formData.languageModel,
        llmProvider: modelProvider,
        category: formData.category,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
        generateImages: true,
        generateHeadingImages: false,
        imagesPerSection: 2,
      };

      generateBlogFromTemplate(templateData)
        .unwrap()
        .then((newBlog) => {
          if (newBlog && newBlog.id) {
            // Start polling for this blog
            setGeneratingBlogId(newBlog.id);
            dispatch(setActiveGeneration({ blogId: newBlog.id, status: 'processing' }));
          }
        })
        .catch((error) => {
          console.error('Failed to generate blog from template:', error);
          alert(`Failed to generate blog: ${error}`);
        });
    } else {
      // Regular generation
      const generateData: IBlogData = {
        topic: formData.topic,
        country: formData.country || undefined,
        intent: formData.intent || undefined,
        audience: formData.audience || undefined,
        language: formData.language,
        llmModel: formData.languageModel,
        llmProvider: modelProvider,
        category: formData.category,
        tags: formData.tags,
      };

      generateBlog(generateData)
        .unwrap()
        .then((newBlog) => {
          if (newBlog && newBlog.id) {
            // Start polling for this blog
            setGeneratingBlogId(newBlog.id);
            dispatch(setActiveGeneration({ blogId: newBlog.id, status: 'processing' }));
          }
        })
        .catch((error) => {
          console.error('Failed to generate blog:', error);
          alert(`Failed to generate blog: ${error}`);
        });
    }
  };

  const handleReset = () => {
    initialFormData();
  };

  const handleUpdate = () => {
    if (!blog?.id) return;

    let updatedFields: Partial<IBlog> = {};

    if (blogTitle !== blog.title) {
      updatedFields.title = blogTitle;
    }
    if (blogContent !== blog.content) {
      updatedFields.content = blogContent;
    }

    if (isPublished !== blog.isPublished) {
      updatedFields.isPublished = isPublished;
    }
    if (blog.isDraft && isPublished) {
      updatedFields.isDraft = !isPublished;
    }
    if (formData.category !== blog.category) {
      updatedFields.category = formData.category;
    }

    const currentTags = Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '';
    if (formData.tags !== currentTags) {
      updatedFields.tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    }

    updateBlog({ id: blog.id, data: updatedFields })
      .unwrap()
      .catch((error) => {
        console.error('Failed to update blog:', error);
      });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => theme.palette.mode === 'dark' 
          ? theme.palette.background.default
          : theme.palette.customColors.pageBackground.light,
        paddingTop: generatingBlogId && generationStatus ? '80px' : 0,
        transition: 'padding-top 0.3s ease',
      }}
    >
      {/* Show generating banner if blog is being generated */}
      {generatingBlogId && generationStatus && (
        <GeneratingBanner
          blogId={generatingBlogId}
          blogTitle={generationStatus.title}
          status={generationStatus.generationStatus as 'processing' | 'completed' | 'failed'}
          error={generationStatus.generationError}
        />
      )}
      
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ 
          gap: { xs: 2, sm: 5 },
          pb: { xs: 3, sm: 5 },
          background: (theme) => theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
            : `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.customColors.pageBackground.light} 100%)`,
        }}
      >
        <NavBar />
        <Title />
      </Box>
      
      {/* OpenAI Key Banner */}
      <OpenAiKeyBanner 
        hasOpenAiKey={hasOpenAiKey} 
        hasGoogleApiKey={hasGoogleApiKey}
        modelProvider={modelProvider}
      />

      {/* Generation Mode Toggle - Only show when creating new blog */}
      {!blog?.id && (
        <Box sx={{ marginX: { xs: '1rem', sm: '7rem' }, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">Generation Mode</Typography>
            <ToggleButtonGroup
              value={generationMode}
              exclusive
              onChange={handleModeChange}
              aria-label="generation mode"
              size="small"
              disabled={isGenerationInProgress}
            >
              <ToggleButton value="regular" aria-label="regular generation">
                Regular
              </ToggleButton>
              <ToggleButton value="template" aria-label="template generation">
                Template
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Show message when generation is in progress */}
          {isGenerationInProgress && (
            <Alert severity="info" sx={{ mb: 2 }}>
              A blog is currently being generated. Please wait for it to complete before starting a new generation.
            </Alert>
          )}

          {generationMode === 'template' && (
            <Box sx={{ mb: 3 }}>
              <TemplateUpload
                onTemplateSelect={handleTemplateSelect}
                selectedTemplate={templateFile}
              />
              {templatePreview && (
                <Box sx={{ mt: 3 }}>
                  <TemplateParametersForm
                    variables={templatePreview.variables}
                    values={templateVariables}
                    onChange={handleTemplateVariableChange}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
      
      {images.length > 0 && (
        <ImagePicker
          open={open}
          handleClose={handleClose}
          images={images}
          blogImage={blogImage}
          handleSelectImage={handleSelectImage}
        />
      )}
      
      <Box
        component="form"
        sx={{ 
          flexGrow: 1, 
          marginX: { xs: '1rem', sm: '7rem' },
          mb: 4,
        }}
        display={'flex'}
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent={'space-between'}
        gap={{ xs: 3, sm: 3 }}
        onSubmit={handleSubmit}
      >
        {/* Only show regular form fields in regular mode or when editing */}
        {(generationMode === 'regular' || blog?.id) && (
          <BlogFormFields
            formData={formData}
            appSettings={appSettings}
            isEditMode={!!blog?.id}
            disabled={isFormDisabled || isGenerationInProgress}
            onFormDataChange={handleFormDataChange}
          />
        )}
        {/* In template mode, show minimal fields (category, tags, model) */}
        {generationMode === 'template' && !blog?.id && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <BlogFormFields
              formData={formData}
              appSettings={appSettings}
              isEditMode={false}
              disabled={isFormDisabled || isGenerationInProgress}
              onFormDataChange={handleFormDataChange}
            />
          </Box>
        )}
        <ActionButtons
          isEditMode={!!blog?.id}
          isPublished={isPublished}
          disabled={isFormDisabled || isGenerationInProgress}
          isLoading={generationProgress.isGenerating || isGenerationInProgress}
          onReset={handleReset}
          onUpdate={handleUpdate}
          onOpenImagePicker={handleOpen}
          onPublishStatusChange={handlePublishStatusChange}
        />
      </Box>
      
      <BlogContentFields
        blogTitle={blogTitle}
        blogContent={blogContent}
        isEditMode={!!blog?.id}
        disabled={isFormDisabled}
        onBlogTitleChange={handleBlogTitleChange}
        onBlogContentChange={handleBlogContentChange}
      />
      
      <Box sx={{ my: 6 }} />
      <Footer />
    </Box>
  );
}
