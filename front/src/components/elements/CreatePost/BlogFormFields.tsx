import * as React from 'react';
import { Box, TextField, MenuItem, Paper, Typography, InputAdornment, Chip } from '@mui/material';
import { 
  Topic as TopicIcon,
  Public as PublicIcon,
  Psychology as PsychologyIcon,
  Group as GroupIcon,
  Language as LanguageIcon,
  Memory as MemoryIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { IFieldData, ICategory } from '../../../reducers/appSettings';
import { alpha } from '@mui/material/styles';

interface BlogFormFieldsProps {
  formData: {
    topic: string;
    country: string;
    intent: string;
    audience: string;
    language: string;
    languageModel: string;
    category: string;
    tags: string;
  };
  appSettings: {
    languages: IFieldData[];
    languageModels: IFieldData[];
    categories: ICategory[];
  };
  isEditMode: boolean;
  disabled?: boolean;
  onFormDataChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BlogFormFields({ formData, appSettings, isEditMode, disabled = false, onFormDataChange }: BlogFormFieldsProps) {
  return (
    <Box width={{ sm: '60%' }} display={'flex'} flexDirection={'column'} sx={{ gap: { xs: 2, sm: 3 } }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <TopicIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Blog Configuration
          </Typography>
        </Box>
        
        <Box display={'flex'} flexDirection={'column'} sx={{ gap: 2.5 }}>
          <TextField
            required
            fullWidth
            disabled={isEditMode || disabled}
            id="post-topic-required"
            label="Post Topic"
            value={formData.topic}
            helperText="What's your blog about? Be specific!"
            onChange={onFormDataChange('topic')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TopicIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Box
            display={'flex'}
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent={'space-between'}
            textAlign={'start'}
            gap={2}
          >
            <TextField
              disabled={isEditMode || disabled}
              id="country"
              label="Target Country"
              value={formData.country}
              helperText="Geographic focus (optional)"
              onChange={onFormDataChange('country')}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PublicIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              disabled={isEditMode || disabled}
              select
              id="outlined-select-language"
              label="Language"
              value={formData.language}
              helperText="Content language"
              onChange={onFormDataChange('language')}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon color="action" />
                  </InputAdornment>
                ),
              }}
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
            gap={2}
          >
            <TextField
              required
              disabled={isEditMode || disabled}
              select
              id="outlined-select-languageModel"
              label="AI Model"
              value={formData.languageModel}
              helperText="Choose your AI engine"
              onChange={onFormDataChange('languageModel')}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MemoryIcon color="action" />
                  </InputAdornment>
                ),
              }}
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
              disabled={disabled}
              id="outlined-select-category"
              label="Category"
              value={formData.category}
              helperText="Blog category"
              onChange={onFormDataChange('category')}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {appSettings.categories.map((option: ICategory) => (
                <MenuItem key={option._id} value={option.categoryName}>
                  {option.categoryName}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          
          <TextField
            disabled={isEditMode || disabled}
            id="audience"
            label="Target Audience"
            value={formData.audience}
            helperText="Who will read this? (optional)"
            onChange={onFormDataChange('audience')}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GroupIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            disabled={isEditMode || disabled}
            id="intent"
            label="Content Intent"
            value={formData.intent}
            helperText="Purpose of your blog (optional)"
            onChange={onFormDataChange('intent')}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PsychologyIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            disabled={disabled}
            id="tags"
            label="Tags"
            value={formData.tags}
            helperText="Comma-separated tags for better discoverability"
            onChange={onFormDataChange('tags')}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
