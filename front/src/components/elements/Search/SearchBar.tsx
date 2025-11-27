import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { KeyboardEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search blogs by title, content, or description...',
  isLoading = false,
}: SearchBarProps) {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange('');
    onClear();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
      }}
    >
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLoading ? (
                <CircularProgress size={20} />
              ) : value ? (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              ) : null}
              {value && !isLoading && (
                <IconButton color="primary" onClick={onSearch}>
                  <SearchIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
          sx: {
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          },
        }}
        sx={{
          '& .MuiInputBase-root': {
            fontSize: '1rem',
          },
        }}
      />
    </Paper>
  );
}
