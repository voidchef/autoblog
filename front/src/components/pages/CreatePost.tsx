import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Button, MenuItem } from '@mui/material';
import Title from '../elements/CreatePost/Title';
import { useAppSelector } from '../../utils/reduxHooks';
import { useGenerateBlogMutation, useGetBlogQuery, useUpdateBlogMutation, IBlogData } from '../../services/blogApi';
import { setBlogData, clearBlog, IBlog } from '../../reducers/blog';
import { useAppDispatch } from '../../utils/reduxHooks';
import axios from 'axios';
import ImagePicker from '../elements/CreatePost/ImagePicker';
import { useLocation, useNavigate } from 'react-router-dom';
import { AWS_BASEURL } from '../../utils/consts';
import { ROUTES } from '../../utils/routing/routes';
import { IFieldData, ICategory } from '../../reducers/appSettings';

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

  const blogId = state?.blogId;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: blog, isLoading } = useGetBlogQuery(blogId, { skip: !blogId });
  const [updateBlog] = useUpdateBlogMutation();
  const [generateBlog] = useGenerateBlogMutation();

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
        languageModel: blog.languageModel || '',
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
        title: formData.topic,
        country: formData.country || undefined,
        intent: formData.intent || undefined,
        audience: formData.audience || undefined,
        language: formData.language,
        model: formData.languageModel,
        category: formData.category,
        tags: formData.tags,
      };

      generateBlog(generateData)
        .unwrap()
        .then((newBlog) => {
          navigate(`${ROUTES.PREVIEW}/${newBlog.slug}?preview=${true}`);
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
        <Box width={{ sm: '60%' }} display={'flex'} flexDirection={'column'} sx={{ gap: { xs: 2, sm: 3 } }}>
          <TextField
            required
            fullWidth
            disabled={blog?.id ? true : false}
            id="post-topic-required"
            label="Post Topic"
            value={formData.topic}
            helperText="Please enter blog topic"
            onChange={handleFormDataChange('topic')}
          />
          <Box
            display={'flex'}
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent={'space-between'}
            textAlign={'start'}
            gap={{ xs: 3, sm: 5 }}
          >
            <TextField
              disabled={blog?.id ? true : false}
              id="country"
              label="Country"
              value={formData.country}
              helperText="Enter blog audience country"
              onChange={handleFormDataChange('country')}
              sx={{ flex: 1 }}
            />
            <TextField
              required
              disabled={blog?.id ? true : false}
              select
              id="outlined-select-language"
              label="language"
              value={formData.language}
              helperText="Please select blog language"
              onChange={handleFormDataChange('language')}
              sx={{ flex: 1 }}
            >
              {appSettings.languages.map((option: IFieldData) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box
            display={'flex'}
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent={'space-between'}
            textAlign={'start'}
            gap={{ xs: 3, sm: 5 }}
          >
            <TextField
              required
              disabled={blog?.id ? true : false}
              select
              id="outlined-select-languageModel"
              label="language model"
              value={formData.languageModel}
              helperText="Please select language model"
              onChange={handleFormDataChange('languageModel')}
              sx={{ flex: 1 }}
            >
              {appSettings.languageModels.map((option: IFieldData) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              required
              id="outlined-select-category"
              label="category"
              value={formData.category}
              helperText="Please select category of the blog"
              onChange={handleFormDataChange('category')}
              sx={{ flex: 1 }}
            >
              {appSettings.categories.map((option: ICategory) => (
                <MenuItem key={option._id} value={option.categoryName}>
                  {option.categoryName}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            disabled={blog?.id ? true : false}
            id="audience"
            label="Audience"
            value={formData.audience}
            helperText="Enter intended audience"
            onChange={handleFormDataChange('audience')}
            fullWidth
          />

          <TextField
            disabled={blog?.id ? true : false}
            id="intent"
            label="Intent"
            value={formData.intent}
            helperText="Enter blog intent"
            onChange={handleFormDataChange('intent')}
            fullWidth
          />

          <TextField
            id="tags"
            label="Tags"
            value={formData.tags}
            helperText="Enter comma separated list of tags"
            onChange={handleFormDataChange('tags')}
            fullWidth
          />
        </Box>
        <Box
          width={{ sm: '40%' }}
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'space-between'}
          alignItems={'center'}
          sx={{ gap: { xs: 2, sm: 3 } }}
        >
          <Button type="submit" variant="contained" sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}>
            {blog?.id ? 'Preview' : 'Generate'}
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!blog}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!blog}
            onClick={handleUpdate}
          >
            Save
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!blog}
            onClick={handleOpen}
          >
            Select Image
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!blog}
            onClick={handlePublishStatusChange}
          >
            {isPublished ? 'UnPublish' : 'Publish'}
          </Button>
        </Box>
      </Box>
      <Box sx={{ my: 4 }} />
      <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
        <TextField
          fullWidth
          id="post-title-required"
          label="Post Title"
          value={blogTitle}
          disabled={blogTitle !== '' ? false : true}
          required={blog?.id ? true : false}
          onChange={handleBlogTitleChange}
        />
        <Box sx={{ my: 3 }} />
        <TextField
          id="outlined-multiline-static"
          label="Blog Content"
          value={blogContent}
          disabled={blogTitle !== '' ? false : true}
          required={blog?.id ? true : false}
          multiline
          rows={30}
          placeholder="Start writing your blog here..."
          fullWidth
          onChange={handleBlogContentChange}
        />
      </Box>
      <Box sx={{ my: 6 }} />
      <Footer />
    </Box>
  );
}
