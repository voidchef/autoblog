import * as React from 'react';
import { Box, TextField, MenuItem } from '@mui/material';
import { IFieldData, ICategory } from '../../../reducers/appSettings';

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
      <TextField
        required
        fullWidth
        disabled={isEditMode || disabled}
        id="post-topic-required"
        label="Post Topic"
        value={formData.topic}
        helperText="Please enter blog topic"
        onChange={onFormDataChange('topic')}
      />
      <Box
        display={'flex'}
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent={'space-between'}
        textAlign={'start'}
        gap={{ xs: 3, sm: 5 }}
      >
        <TextField
          disabled={isEditMode || disabled}
          id="country"
          label="Country"
          value={formData.country}
          helperText="Enter blog audience country"
          onChange={onFormDataChange('country')}
          sx={{ flex: 1 }}
        />
        <TextField
          required
          disabled={isEditMode || disabled}
          select
          id="outlined-select-language"
          label="language"
          value={formData.language}
          helperText="Please select blog language"
          onChange={onFormDataChange('language')}
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
          disabled={isEditMode || disabled}
          select
          id="outlined-select-languageModel"
          label="language model"
          value={formData.languageModel}
          helperText="Please select language model"
          onChange={onFormDataChange('languageModel')}
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
          disabled={disabled}
          id="outlined-select-category"
          label="category"
          value={formData.category}
          helperText="Please select category of the blog"
          onChange={onFormDataChange('category')}
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
        disabled={isEditMode || disabled}
        id="audience"
        label="Audience"
        value={formData.audience}
        helperText="Enter intended audience"
        onChange={onFormDataChange('audience')}
        fullWidth
      />
      <TextField
        disabled={isEditMode || disabled}
        id="intent"
        label="Intent"
        value={formData.intent}
        helperText="Enter blog intent"
        onChange={onFormDataChange('intent')}
        fullWidth
      />
      <TextField
        disabled={disabled}
        id="tags"
        label="Tags"
        value={formData.tags}
        helperText="Enter comma separated list of tags"
        onChange={onFormDataChange('tags')}
        fullWidth
      />
    </Box>
  );
}
