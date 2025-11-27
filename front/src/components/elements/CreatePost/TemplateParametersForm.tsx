import { TextField, Typography, Paper, Stack } from '@mui/material';
import { FC, ChangeEvent } from 'react';

interface TemplateParametersFormProps {
  variables: string[];
  values: Record<string, string | number | boolean>;
  onChange: (name: string, value: string | number | boolean) => void;
}

export const TemplateParametersForm: FC<TemplateParametersFormProps> = ({ variables, values, onChange }) => {
  if (variables.length === 0) {
    return null;
  }

  const handleChange = (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange(name, event.target.value);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Template Variables
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fill in the values for the template variables
      </Typography>
      <Stack spacing={2}>
        {variables.map((variable) => (
          <TextField
            key={variable}
            fullWidth
            label={variable.charAt(0).toUpperCase() + variable.slice(1).replace(/_/g, ' ')}
            name={variable}
            value={values[variable] || ''}
            onChange={handleChange(variable)}
            variant="outlined"
            placeholder={`Enter ${variable}`}
            helperText={`This value will replace {${variable}} in the template`}
          />
        ))}
      </Stack>
    </Paper>
  );
};
