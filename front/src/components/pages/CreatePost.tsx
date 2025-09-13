import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { 
  Title, 
  BlogFormFields, 
  ActionButtons, 
  BlogContentFields, 
  ImagePicker,
  OpenAiKeyBanner
} from '../elements/CreatePost';
import { useAppSelector } from '../../utils/reduxHooks';
import { useGenerateBlogMutation, useGetBlogQuery, useUpdateBlogMutation, IBlogData } from '../../services/blogApi';
import { setBlogData, clearBlog, IBlog, generateBlogWithProgress } from '../../reducers/blog';
import { useAppDispatch } from '../../utils/reduxHooks';
import { useAuth } from '../../utils/hooks';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AWS_BASEURL } from '../../utils/consts';
import { ROUTES } from '../../utils/routing/routes';

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
  const { user } = useAuth();

  const blogId = state?.blogId;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: blog, isLoading } = useGetBlogQuery(blogId, { skip: !blogId });
  const [updateBlog] = useUpdateBlogMutation();

  // Check if user has OpenAI key
  const hasOpenAiKey = user?.hasOpenAiKey || false;
  const isFormDisabled = !hasOpenAiKey;

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

  const handleBlogContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlogContent(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    } else {
      const generateData: IBlogData = {
        topic: formData.topic,
        country: formData.country || undefined,
        intent: formData.intent || undefined,
        audience: formData.audience || undefined,
        language: formData.language,
        llmModel: formData.languageModel,
        category: formData.category,
        tags: formData.tags,
      };

      dispatch(generateBlogWithProgress(generateData))
        .unwrap()
        .then((newBlog) => {
          if (newBlog) {
            navigate(`${ROUTES.PREVIEW}/${newBlog.slug}?preview=${true}`);
          }
        })
        .catch((error) => {
          console.error('Failed to generate blog:', error);
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
    <Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ gap: { xs: 2, sm: 5 } }}
        bgcolor={'#E9EAF4'}
      >
        <NavBar />
        <Title />
      </Box>
      <Box sx={{ my: 4 }} />
      
      {/* OpenAI Key Banner */}
      <OpenAiKeyBanner hasOpenAiKey={hasOpenAiKey} />
      
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
        sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}
        display={'flex'}
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent={'space-between'}
        gap={{ xs: 3, sm: 5 }}
        onSubmit={handleSubmit}
      >
        <BlogFormFields
          formData={formData}
          appSettings={appSettings}
          isEditMode={!!blog?.id}
          disabled={isFormDisabled}
          onFormDataChange={handleFormDataChange}
        />
        <ActionButtons
          isEditMode={!!blog?.id}
          isPublished={isPublished}
          disabled={isFormDisabled}
          isLoading={generationProgress.isGenerating}
          onReset={handleReset}
          onUpdate={handleUpdate}
          onOpenImagePicker={handleOpen}
          onPublishStatusChange={handlePublishStatusChange}
        />
      </Box>
      <Box sx={{ my: 4 }} />
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
