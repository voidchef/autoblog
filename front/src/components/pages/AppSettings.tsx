import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Stack,
  Fade,
  Zoom,
  alpha,
  useTheme,
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
import { useAppDispatch } from '../../utils/reduxHooks';
import { showSuccess, showError } from '../../reducers/alert';
import { useState, useEffect } from 'react';

interface Category {
  _id?: string;
  categoryName: string;
  categoryDescription: string;
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
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { data: appSettingsData, isLoading } = useAppSettings();
  const [updateAllAppSettings, { isLoading: isUpdating }] = useUpdateAllAppSettingsMutation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<FieldData[]>([]);
  const [languageModels, setLanguageModels] = useState<LanguageModel[]>([]);
  const [queryTypes, setQueryTypes] = useState<FieldData[]>([]);

  // Initialize state from appSettings data
  useEffect(() => {
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

      dispatch(showSuccess('Settings saved successfully!'));
    } catch (error) {
      dispatch(showError('Failed to save settings. Please try again.'));
    }
  };

  // Category handlers
  const addCategory = () => {
    setCategories([...categories, { categoryName: '', categoryDescription: '' }]);
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
              background: theme.palette.customColors.analytics.headerTextGradientDark,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `0 20px 60px ${theme.palette.customColors.shadows.primary}`
                  : `0 20px 60px ${theme.palette.customColors.shadows.primaryLight}`,
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
                  background: theme.palette.customColors.overlay.white.medium,
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 8px 32px ${theme.palette.customColors.overlay.black.light}`,
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
                    color: theme.palette.customColors.overlay.white.almostOpaque,
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
                theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `0 10px 40px ${theme.palette.customColors.overlay.black.almostOpaque}`
                  : `0 10px 40px ${theme.palette.customColors.overlay.black.light}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? `0 15px 50px ${theme.palette.customColors.overlay.black.almostOpaque}`
                    : `0 15px 50px ${theme.palette.customColors.overlay.black.medium}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: theme.palette.customColors.gradients.category,
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
                  background: theme.palette.customColors.overlay.white.light,
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
                      background: theme.palette.customColors.overlay.white.strong,
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
                        color: theme.palette.customColors.overlay.white.almostOpaque,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      Manage blog categories with name and description
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
                    background: theme.palette.customColors.overlay.white.almostOpaque,
                    color: theme.palette.customColors.accent.pink.main,
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: `0 4px 14px ${theme.palette.customColors.overlay.black.strong}`,
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${theme.palette.customColors.overlay.black.stronger}`,
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
                            theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: theme.palette.customColors.accent.pink.main,
                            boxShadow: (theme) =>
                              theme.palette.mode === 'dark'
                                ? `0 8px 24px ${theme.palette.customColors.accent.pink.light}`
                                : `0 8px 24px ${theme.palette.customColors.accent.pink.lighter}`,
                          },
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 4 }}>
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
                          <Grid size={{ xs: 12, sm: 7 }}>
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
                          <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => deleteCategory(index)}
                              startIcon={<DeleteIcon />}
                              fullWidth
                              sx={{
                                display: { xs: 'flex', sm: 'none' },
                                mt: 1,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              Delete
                            </Button>
                            <IconButton
                              color="error"
                              onClick={() => deleteCategory(index)}
                              sx={{
                                display: { xs: 'none', sm: 'flex' },
                                background: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? theme.palette.customColors.accent.error.light
                                    : theme.palette.customColors.accent.error.lighter,
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
                theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `0 10px 40px ${theme.palette.customColors.overlay.black.almostOpaque}`
                  : `0 10px 40px ${theme.palette.customColors.overlay.black.light}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? `0 15px 50px ${theme.palette.customColors.overlay.black.almostOpaque}`
                    : `0 15px 50px ${theme.palette.customColors.overlay.black.medium}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: theme.palette.customColors.gradients.language,
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
                  background: theme.palette.customColors.overlay.white.light,
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
                      background: theme.palette.customColors.overlay.white.strong,
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
                        color: theme.palette.customColors.overlay.white.almostOpaque,
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
                    background: theme.palette.customColors.overlay.white.almostOpaque,
                    color: theme.palette.customColors.accent.cyan.main,
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: `0 4px 14px ${theme.palette.customColors.overlay.black.strong}`,
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${theme.palette.customColors.overlay.black.stronger}`,
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
                            theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: theme.palette.customColors.accent.cyan.main,
                            boxShadow: `0 8px 24px ${theme.palette.customColors.accent.cyan.light}`,
                          },
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
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
                                    ? theme.palette.customColors.accent.error.light
                                    : theme.palette.customColors.accent.error.lighter,
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
                          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
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
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => deleteLanguage(index)}
                              startIcon={<DeleteIcon />}
                              fullWidth
                              sx={{
                                mt: 1,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
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
                theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `0 10px 40px ${theme.palette.customColors.overlay.black.almostOpaque}`
                  : `0 10px 40px ${theme.palette.customColors.overlay.black.light}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? `0 15px 50px ${theme.palette.customColors.overlay.black.almostOpaque}`
                    : `0 15px 50px ${theme.palette.customColors.overlay.black.medium}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: theme.palette.customColors.analytics.headerTextGradientDark,
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
                  background: theme.palette.customColors.overlay.white.light,
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
                      background: theme.palette.customColors.overlay.white.strong,
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
                        color: theme.palette.customColors.overlay.white.almostOpaque,
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
                    background: theme.palette.customColors.overlay.white.almostOpaque,
                    color: theme.palette.customColors.accent.blue.main,
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: `0 4px 14px ${theme.palette.customColors.overlay.black.strong}`,
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${theme.palette.customColors.overlay.black.stronger}`,
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
                            theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: theme.palette.customColors.accent.blue.main,
                            boxShadow: `0 8px 24px ${theme.palette.customColors.shadows.primaryLight}`,
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
                          <Grid size={{ xs: 12, sm: 3 }}>
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
                          <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => deleteLanguageModel(index)}
                              startIcon={<DeleteIcon />}
                              fullWidth
                              sx={{
                                display: { xs: 'flex', sm: 'none' },
                                mt: 1,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              Delete
                            </Button>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => deleteLanguageModel(index)}
                              sx={{
                                display: { xs: 'none', sm: 'flex' },
                                background: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? theme.palette.customColors.accent.error.light
                                    : theme.palette.customColors.accent.error.lighter,
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
                theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `0 10px 40px ${theme.palette.customColors.overlay.black.almostOpaque}`
                  : `0 10px 40px ${theme.palette.customColors.overlay.black.light}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? `0 15px 50px ${theme.palette.customColors.overlay.black.almostOpaque}`
                    : `0 15px 50px ${theme.palette.customColors.overlay.black.medium}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                background: theme.palette.customColors.gradients.queryTypes,
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
                  background: theme.palette.customColors.overlay.white.light,
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
                      background: theme.palette.customColors.overlay.white.strong,
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
                        color: theme.palette.customColors.overlay.white.almostOpaque,
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
                    background: theme.palette.customColors.overlay.white.almostOpaque,
                    color: theme.palette.customColors.accent.red.main,
                    fontWeight: 'bold',
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: `0 4px 14px ${theme.palette.customColors.overlay.black.strong}`,
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${theme.palette.customColors.overlay.black.stronger}`,
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
                            theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : theme.palette.customColors.overlay.black.light,
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.6)
                              : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: theme.palette.customColors.accent.red.main,
                            boxShadow: `0 8px 24px ${theme.palette.customColors.accent.red.light}`,
                          },
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
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
                                    ? theme.palette.customColors.accent.error.light
                                    : theme.palette.customColors.accent.error.lighter,
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
                          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
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
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => deleteQueryType(index)}
                              startIcon={<DeleteIcon />}
                              fullWidth
                              sx={{
                                mt: 1,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
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
                background: theme.palette.customColors.analytics.headerTextGradientDark,
                boxShadow: `0 8px 32px ${theme.palette.customColors.shadows.primary}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  boxShadow: `0 12px 48px ${theme.palette.customColors.shadows.primaryHeavy}`,
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
    </Box>
  );
}
