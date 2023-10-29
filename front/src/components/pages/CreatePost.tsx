import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Button, MenuItem } from '@mui/material';
import Title from '../elements/CreatePost/Title';
import { useAppDispatch, useAppSelector } from '../../utils/reduxHooks';
import { IBlogData, generateBlog, getBlogs } from '../../actions/blog';

const languages = [
  {
    value: 'english',
    label: 'english',
  },
];

const languageModels = [
  {
    value: 'gpt-3.5-turbo',
    label: 'gpt-3.5-turbo',
  },
];

const tones = [
  {
    value: 'informative',
    label: 'informative',
  },
  {
    value: 'captivating',
    label: 'captivating',
  },
];

const categories = [
  {
    value: 'business',
    label: 'business',
  },
  {
    value: 'technology',
    label: 'technology',
  },
];

export default function CreatePost() {
  const fetchedBlogData = useAppSelector((state) => state.blog.blogData);
  const [formData, setFormData] = React.useState({
    topic: '',
    country: '',
    intent: '',
    audience: '',
    language: 'english',
    languageModel: 'gpt-3.5-turbo',
    tone: 'informative',
    category: 'technology',
    tags: '',
  });
  const [blogTitle, setBlogTitle] = React.useState(fetchedBlogData ? fetchedBlogData.title : '');
  const [blogContent, setBlogContent] = React.useState(fetchedBlogData ? fetchedBlogData.content : '');

  const dispatch = useAppDispatch();

  const userId = localStorage.getItem('userId');

  React.useEffect(() => {
    dispatch(getBlogs({ isDraft: true, author: userId }));
  }, []);

  React.useEffect(() => {
    setBlogTitle(fetchedBlogData ? fetchedBlogData.title : '');
    setBlogContent(fetchedBlogData ? fetchedBlogData.content : '');
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

    dispatch(generateBlog(filteredData));
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
              id="country"
              label="Country"
              value={formData.country}
              helperText="Please enter blog audience country"
              onChange={handleFormDataChange('country')}
              sx={{ width: { sm: '16rem' } }}
            />
            <TextField
              id="intent"
              label="Intent"
              value={formData.intent}
              helperText="Please enter blog intent"
              onChange={handleFormDataChange('intent')}
              sx={{ width: { sm: '16rem' } }}
            />
            <TextField
              id="audience"
              label="Audience"
              value={formData.audience}
              helperText="Please enter intended audience"
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
              select
              id="outlined-select-language"
              label="language"
              value={formData.language}
              helperText="Please select blog language"
              onChange={handleFormDataChange('language')}
              sx={{ width: { sm: '16rem' } }}
            >
              {languages.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              select
              id="outlined-select-languageModel"
              label="languageModel"
              value={formData.languageModel}
              defaultValue="gpt-3.5-turbo"
              helperText="Please select generation languageModel"
              onChange={handleFormDataChange('languageModel')}
              sx={{ width: { sm: '16rem' } }}
            >
              {languageModels.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              id="outlined-select-tone"
              label="tone"
              value={formData.tone}
              defaultValue="informative"
              helperText="Please select tone of the blog"
              onChange={handleFormDataChange('tone')}
              sx={{ width: { sm: '16rem' } }}
            >
              {tones.map((option) => (
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
              id="outlined-select-category"
              label="category"
              value={formData.category}
              defaultValue="technology"
              helperText="Please select category of the blog"
              onChange={handleFormDataChange('category')}
              sx={{ width: { sm: '16rem' } }}
            >
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
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
          <Button type="submit" variant="contained" sx={{ width: '15rem' }}>
            Generate
          </Button>
          <Button variant="contained" sx={{ width: '15rem' }}>
            Reset
          </Button>
          <Button variant="contained" sx={{ width: '15rem' }}>
            Save Draft
          </Button>
          <Button variant="contained" sx={{ width: '15rem' }}>
            Preview
          </Button>
          <Button variant="contained" sx={{ width: '15rem' }}>
            Publish
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
          InputProps={{
            readOnly: true,
          }}
          onChange={handleBlogTitleChange}
        />
        <Box sx={{ my: 3 }} />
        <TextField
          id="outlined-multiline-static"
          label="Blog Content"
          value={blogContent}
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
