import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Stack,
  Chip,
  Fade,
  Zoom,
  Collapse,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import LanguageIcon from '@mui/icons-material/Language';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { useAppSettings } from '../../utils/hooks';
import { useUpdateAllAppSettingsMutation } from '../../services/appSettingsApi';
import Loading from '../elements/Common/Loading';

interface Category {
  _id?: string;
  categoryName: string;
  categoryDescription: string;
  categoryPicUrl: string;
}

interface FieldData {
  value: string;
  label: string;
}

interface LanguageModel {
  value: string;
  label: string;
  provider: 'openai' | 'google' | 'mistral';
}

export default function AppSettings() {
  const { data: appSettingsData, isLoading } = useAppSettings();
  const [updateAllAppSettings, { isLoading: isUpdating }] = useUpdateAllAppSettingsMutation();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [languages, setLanguages] = React.useState<FieldData[]>([]);
  const [languageModels, setLanguageModels] = React.useState<LanguageModel[]>([]);
  const [queryTypes, setQueryTypes] = React.useState<FieldData[]>([]);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Initialize state from appSettings data
  React.useEffect(() => {
    if (appSettingsData) {
      setCategories(appSettingsData.categories || []);
      setLanguages(appSettingsData.languages || []);
      setLanguageModels(appSettingsData.languageModels || []);
      setQueryTypes(appSettingsData.queryType || []);
    }
  }, [appSettingsData]);

  const handleSave = async () => {
    try {
      await updateAllAppSettings({
        categories,
        languages,
        languageModels,
        queryType: queryTypes,
      }).unwrap();

      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings. Please try again.',
        severity: 'error',
      });
    }
  };

  // Category handlers
  const addCategory = () => {
    setCategories([...categories, { categoryName: '', categoryDescription: '', categoryPicUrl: '' }]);
  };

  const updateCategory = (index: number, field: keyof Category, value: string) => {
    const newCategories = [...categories];
    newCategories[index][field] = value;
    setCategories(newCategories);
  };

  const deleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  // Language handlers
  const addLanguage = () => {
    setLanguages([...languages, { value: '', label: '' }]);
  };

  const updateLanguage = (index: number, field: keyof FieldData, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
  };

  const deleteLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  // Language Model handlers
  const addLanguageModel = () => {
    setLanguageModels([...languageModels, { value: '', label: '', provider: 'openai' }]);
  };

  const updateLanguageModel = (index: number, field: keyof LanguageModel, value: string) => {
    const newModels = [...languageModels];
    newModels[index][field] = value as any;
    setLanguageModels(newModels);
  };

  const deleteLanguageModel = (index: number) => {
    setLanguageModels(languageModels.filter((_, i) => i !== index));
  };

  // Query Type handlers
  const addQueryType = () => {
    setQueryTypes([...queryTypes, { value: '', label: '' }]);
  };

  const updateQueryType = (index: number, field: keyof FieldData, value: string) => {
    const newQueryTypes = [...queryTypes];
    newQueryTypes[index][field] = value;
    setQueryTypes(newQueryTypes);
  };

  const deleteQueryType = (index: number) => {
    setQueryTypes(queryTypes.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <Box width={{ xs: '60%', sm: '40%', md: '30%' }}>
          <Loading />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Hero Header */}
        <Zoom in timeout={500}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3, md: 5 },
              borderRadius: { xs: 2, md: 3 },
              position: 'relative',
              overflow: 'hidden',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 20px 60px rgba(102, 126, 234, 0.3)'
                  : '0 20px 60px rgba(102, 126, 234, 0.2)',
              mb: { xs: 3, md: 4 },
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background:
                  'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
              }}
            />
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              spacing={2} 
              sx={{ position: 'relative', zIndex: 1 }}
            >
              <Box
                sx={{
                  width: { xs: 60, sm: 70 },
                  height: { xs: 60, sm: 70 },
                  borderRadius: { xs: '16px', sm: '20px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <SettingsIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight="800" 
                  color="white" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
                >
                  Application Settings
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  Centralized configuration management for your autoblog platform
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Zoom>

        {/* Categories Section */}
        <Fade in timeout={700}>
          <Card
            sx={{
              mt: 3,
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                  : '0 10px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 15px 50px rgba(0, 0, 0, 0.4)'
                    : '0 15px 50px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                    : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                p: { xs: 2, sm: 2.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background decoration */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: { xs: 100, sm: 150 },
                  height: { xs: 100, sm: 150 },
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                spacing={{ xs: 2, sm: 0 }}
                sx={{ position: 'relative' }}
              >
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 40, sm: 50 },
                      height: { xs: 40, sm: 50 },
                      borderRadius: { xs: '12px', sm: '14px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CategoryIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color="white" 
                      gutterBottom
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
                    >
                      Categories
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      Manage blog categories with name, description, and image
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addCategory}
                  size="medium"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#fa709a',
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Add Category
                </Button>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {categories.map((category, index) => (
                  <Grid size={{ xs: 12 }} key={index}>
                    <Fade in timeout={300 * (index + 1)}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#fa709a',
                            boxShadow: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '0 8px 24px rgba(250, 112, 154, 0.2)'
                                : '0 8px 24px rgba(250, 112, 154, 0.15)',
                          },
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              fullWidth
                              label="Category Name"
                              value={category.categoryName}
                              onChange={(e) => updateCategory(index, 'categoryName', e.target.value)}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={category.categoryDescription}
                              onChange={(e) => updateCategory(index, 'categoryDescription', e.target.value)}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              label="Image URL"
                              value={category.categoryPicUrl}
                              onChange={(e) => updateCategory(index, 'categoryPicUrl', e.target.value)}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
                            <IconButton
                              color="error"
                              onClick={() => deleteCategory(index)}
                              sx={{
                                background: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(244, 67, 54, 0.1)'
                                    : 'rgba(244, 67, 54, 0.05)',
                                '&:hover': {
                                  background: 'error.main',
                                  color: 'white',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Languages Section */}
        <Fade in timeout={900}>
          <Card
            sx={{
              mt: 3,
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                  : '0 10px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 15px 50px rgba(0, 0, 0, 0.4)'
                    : '0 15px 50px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)'
                    : 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
                p: { xs: 2, sm: 2.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: { xs: 100, sm: 150 },
                  height: { xs: 100, sm: 150 },
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                spacing={{ xs: 2, sm: 0 }}
                sx={{ position: 'relative' }}
              >
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 40, sm: 50 },
                      height: { xs: 40, sm: 50 },
                      borderRadius: { xs: '12px', sm: '14px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <LanguageIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color="white" 
                      gutterBottom
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
                    >
                      Languages
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      Configure available languages for content generation
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addLanguage}
                  size="medium"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#0093E9',
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Add Language
                </Button>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={2}>
                {languages.map((language, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Fade in timeout={200 * (index + 1)}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#0093E9',
                            boxShadow: '0 8px 24px rgba(0, 147, 233, 0.15)',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box flex={1}>
                            <TextField
                              fullWidth
                              label="Value"
                              value={language.value}
                              onChange={(e) => updateLanguage(index, 'value', e.target.value)}
                              size="small"
                              sx={{ 
                                mb: 1,
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Label"
                              value={language.label}
                              onChange={(e) => updateLanguage(index, 'label', e.target.value)}
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Box>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => deleteLanguage(index)}
                            sx={{
                              background: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(244, 67, 54, 0.1)'
                                  : 'rgba(244, 67, 54, 0.05)',
                              '&:hover': {
                                background: 'error.main',
                                color: 'white',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Language Models Section */}
        <Fade in timeout={1100}>
          <Card
            sx={{
              mt: 3,
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                  : '0 10px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 15px 50px rgba(0, 0, 0, 0.4)'
                    : '0 15px 50px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: { xs: 2, sm: 2.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: { xs: 100, sm: 150 },
                  height: { xs: 100, sm: 150 },
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                spacing={{ xs: 2, sm: 0 }}
                sx={{ position: 'relative' }}
              >
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 40, sm: 50 },
                      height: { xs: 40, sm: 50 },
                      borderRadius: { xs: '12px', sm: '14px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color="white" 
                      gutterBottom
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
                    >
                      AI Language Models
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      Configure AI models with their providers
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addLanguageModel}
                  size="medium"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: (theme) => (theme.palette.mode === 'dark' ? '#a8edea' : '#667eea'),
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Add Model
                </Button>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={2}>
                {languageModels.map((model, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Fade in timeout={200 * (index + 1)}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#667eea',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                          },
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              label="Value"
                              value={model.value}
                              onChange={(e) => updateLanguageModel(index, 'value', e.target.value)}
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              label="Label"
                              value={model.label}
                              onChange={(e) => updateLanguageModel(index, 'label', e.target.value)}
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 10, sm: 3 }}>
                            <TextField
                              fullWidth
                              select
                              label="Provider"
                              value={model.provider}
                              onChange={(e) => updateLanguageModel(index, 'provider', e.target.value)}
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            >
                              <MenuItem value="openai">OpenAI</MenuItem>
                              <MenuItem value="google">Google</MenuItem>
                              <MenuItem value="mistral">Mistral</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => deleteLanguageModel(index)}
                              sx={{
                                background: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(244, 67, 54, 0.1)'
                                    : 'rgba(244, 67, 54, 0.05)',
                                '&:hover': {
                                  background: 'error.main',
                                  color: 'white',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Query Types Section */}
        <Fade in timeout={1300}>
          <Card
            sx={{
              mt: 3,
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                  : '0 10px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 15px 50px rgba(0, 0, 0, 0.4)'
                    : '0 15px 50px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                p: { xs: 2, sm: 2.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: { xs: 100, sm: 150 },
                  height: { xs: 100, sm: 150 },
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                spacing={{ xs: 2, sm: 0 }}
                sx={{ position: 'relative' }}
              >
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 40, sm: 50 },
                      height: { xs: 40, sm: 50 },
                      borderRadius: { xs: '12px', sm: '14px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <SearchIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color="white" 
                      gutterBottom
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
                    >
                      Query Types
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      Define available query types for content generation
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addQueryType}
                  size="medium"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#f5576c',
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Add Query Type
                </Button>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={2}>
                {queryTypes.map((queryType, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Fade in timeout={200 * (index + 1)}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#f5576c',
                            boxShadow: '0 8px 24px rgba(245, 87, 108, 0.15)',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box flex={1}>
                            <TextField
                              fullWidth
                              label="Value"
                              value={queryType.value}
                              onChange={(e) => updateQueryType(index, 'value', e.target.value)}
                              size="small"
                              sx={{ 
                                mb: 1,
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Label"
                              value={queryType.label}
                              onChange={(e) => updateQueryType(index, 'label', e.target.value)}
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Box>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => deleteQueryType(index)}
                            sx={{
                              background: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(244, 67, 54, 0.1)'
                                  : 'rgba(244, 67, 54, 0.05)',
                              '&:hover': {
                                background: 'error.main',
                                color: 'white',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Save Button */}
        <Zoom in timeout={1500}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: { xs: 4, md: 5 },
              mb: 4,
              px: { xs: 2, sm: 0 },
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isUpdating}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                px: { xs: 4, sm: 6, md: 8 },
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                fontWeight: 'bold',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  boxShadow: '0 12px 48px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-4px)',
                },
                '&:active': {
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: 'grey.400',
                  color: 'grey.200',
                },
              }}
            >
              {isUpdating ? 'Saving Changes...' : 'Save All Settings'}
            </Button>
          </Box>
        </Zoom>
      </Container>

      <Footer />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '1rem',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
