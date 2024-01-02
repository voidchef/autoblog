import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Button, IconButton, InputAdornment, MenuItem, formControlLabelClasses } from '@mui/material';
import Title from '../elements/Common/Title';
import { useAppDispatch, useAppSelector } from '../../utils/reduxHooks';
import { IBlogData, clearBlog, generateBlog, getBlog, updateBlog } from '../../actions/blog';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import ImagePicker from '../elements/CreatePost/ImagePicker';
import { useLocation, useNavigate } from 'react-router-dom';
import { AWS_BASEURL } from '../../utils/consts';
import { ROUTES } from '../../utils/routing/routes';
import { ICategory, IFieldData } from '../../reducers/appSettings';

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
  const fetchedBlogData = useAppSelector((state) => state.blog.blogData);
  const appSettings = useAppSelector((state) => state.appSettings);

  React.useEffect(() => {
    if (state && state.blogId) {
      dispatch(getBlog(state.blogId));
    } else {
      dispatch(clearBlog());
    }
  }, []);

  const [formData, setFormData] = React.useState({
    topic: '',
    country: '',
    intent: '',
    audience: '',
    language: '',
    languageModel: '',
    tone: '',
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

  const [showHidden, setShowHidden] = React.useState(false);

  const handleClickShowHidden = () => setShowHidden((show) => !show);

  const handleMouseDownHidden = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const initialFormData = () => {
    setBlogTitle(fetchedBlogData ? fetchedBlogData.title : '');
    setBlogContent(fetchedBlogData ? fetchedBlogData.content : '');
    setBlogImage(fetchedBlogData ? fetchedBlogData.selectedImage : '');
    setIsPublished(fetchedBlogData ? fetchedBlogData.isPublished : false);
    if (fetchedBlogData) {
      setFormData({
        ...formData,
        topic: fetchedBlogData ? fetchedBlogData.topic : '',
        country: fetchedBlogData ? fetchedBlogData.country : '',
        intent: fetchedBlogData ? fetchedBlogData.intent : '',
        audience: fetchedBlogData ? fetchedBlogData.audience : '',
        language: fetchedBlogData ? fetchedBlogData.language : '',
        languageModel: fetchedBlogData ? fetchedBlogData.languageModel : '',
        tone: fetchedBlogData ? fetchedBlogData.tone : '',
        category: fetchedBlogData ? fetchedBlogData.category : '',
        tags: fetchedBlogData ? fetchedBlogData.tags : '',
      });
    }
  };

  React.useEffect(() => {
    const fetchAndSetImages = async () => {
      const images = await fetchImages(fetchedBlogData.id);
      setImages(images);
    };

    if (fetchedBlogData && fetchedBlogData.id) fetchAndSetImages();
    initialFormData();
  }, [fetchedBlogData]);

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

    // Remove empty fields from the formData object
    const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== '') {
        acc[key as keyof IBlogData] = value;
      }
      return acc;
    }, {} as IBlogData);

    if (fetchedBlogData && fetchedBlogData.id) {
      handleUpdate(true);
    } else {
      dispatch(generateBlog(filteredData));
    }
  };

  const handleReset = () => {
    initialFormData();
  };

  const handleUpdate = (preview: boolean) => {
    let updatedFields: { [key: string]: string | boolean } = {};

    if (blogTitle !== fetchedBlogData.title) {
      updatedFields.title = blogTitle;
    }
    if (blogContent !== fetchedBlogData.content) {
      updatedFields.content = blogContent;
    }
    if (blogImage !== fetchedBlogData.selectedImage) {
      updatedFields.selectedImage = blogImage;
    }
    if (isPublished !== fetchedBlogData.isPublished) {
      updatedFields.isPublished = isPublished;
    }
    if (fetchedBlogData.isDraft && isPublished) {
      updatedFields.isDraft = isPublished;
    }
    if (formData.category !== fetchedBlogData.category) {
      updatedFields.category = formData.category;
    }
    if (formData.tags !== fetchedBlogData.tags) {
      updatedFields.tags = formData.tags;
    }

    if (preview) {
      dispatch(
        updateBlog(updatedFields, true, fetchedBlogData.id, () => navigate(`${ROUTES.PREVIEW}/${fetchedBlogData.slug}`)),
      );
    } else {
      dispatch(updateBlog(updatedFields, false, fetchedBlogData.id));
    }
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
        <Title title={'Create Post'}/>
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
            //required
            fullWidth
            disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
            id="outlined-adornment-openai-apiKey"
            label="OpenAI Api Key"
            type={showHidden ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle api key visibility"
                    onClick={handleClickShowHidden}
                    onMouseDown={handleMouseDownHidden}
                    edge="end"
                  >
                    {showHidden ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Please enter your openai api key"
          />
          <TextField
            //required
            fullWidth
            disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
            id="outlined-adornment-bing-apiKey"
            label="Bing Api Key"
            type={showHidden ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle api key visibility"
                    onClick={handleClickShowHidden}
                    onMouseDown={handleMouseDownHidden}
                    edge="end"
                  >
                    {showHidden ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Please enter your bing api key"
          />
          <TextField
            required
            fullWidth
            disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
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
              disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
              id="country"
              label="Country"
              value={formData.country}
              helperText="Enter blog audience country"
              onChange={handleFormDataChange('country')}
              sx={{ width: { sm: '16rem' } }}
            />
            <TextField
              disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
              id="intent"
              label="Intent"
              value={formData.intent}
              helperText="Enter blog intent"
              onChange={handleFormDataChange('intent')}
              sx={{ width: { sm: '16rem' } }}
            />
            <TextField
              disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
              id="audience"
              label="Audience"
              value={formData.audience}
              helperText="Enter intended audience"
              onChange={handleFormDataChange('audience')}
              sx={{ width: { sm: '16rem' } }}
            />
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
              disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
              select
              id="outlined-select-language"
              label="language"
              value={formData.language}
              helperText="Please select blog language"
              onChange={handleFormDataChange('language')}
              sx={{ width: { sm: '16rem' } }}
            >
              {appSettings.languages.map((option: IFieldData) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
              select
              id="outlined-select-languageModel"
              label="language model"
              value={formData.languageModel}
              helperText="Please select language model"
              onChange={handleFormDataChange('languageModel')}
              sx={{ width: { sm: '16rem' } }}
            >
              {appSettings.languageModels.map((option: IFieldData) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              disabled={fetchedBlogData && fetchedBlogData.id ? true : false}
              required
              id="outlined-select-tone"
              label="tone"
              value={formData.tone}
              helperText="Please select tone of the blog"
              onChange={handleFormDataChange('tone')}
              sx={{ width: { sm: '16rem' } }}
            >
              {appSettings.tones.map((option: IFieldData) => (
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
              select
              required
              id="outlined-select-category"
              label="category"
              value={formData.category}
              helperText="Please select category of the blog"
              onChange={handleFormDataChange('category')}
              sx={{ width: { sm: '16rem' } }}
            >
              {appSettings.categories.map((option: ICategory) => (
                <MenuItem key={option.categoryName} value={option.categoryName}>
                  {option.categoryName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="tags"
              label="Tags"
              value={formData.tags}
              helperText="Enter comma separated list of tags"
              onChange={handleFormDataChange('tags')}
              sx={{ width: { sm: '16rem' } }}
            />
          </Box>
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
            {fetchedBlogData && fetchedBlogData.id ? 'Preview' : 'Generate'}
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!fetchedBlogData}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!fetchedBlogData}
            onClick={() => handleUpdate(false)}
          >
            Save
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!fetchedBlogData}
            onClick={handleOpen}
          >
            Select Image
          </Button>
          <Button
            variant="contained"
            sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
            disabled={!fetchedBlogData}
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
          required={fetchedBlogData && fetchedBlogData.id ? true : false}
          onChange={handleBlogTitleChange}
        />
        <Box sx={{ my: 3 }} />
        <TextField
          id="outlined-multiline-static"
          label="Blog Content"
          value={blogContent}
          disabled={blogTitle !== '' ? false : true}
          required={fetchedBlogData && fetchedBlogData.id ? true : false}
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
