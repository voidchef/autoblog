import React from 'react';
import { Toolbar, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface EnhancedTableToolbarProps {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

export function EnhancedTableToolbar({ searchQuery, setSearchQuery }: EnhancedTableToolbarProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />
      <InputBase placeholder="Search..." value={searchQuery} onChange={handleSearchChange} />
    </Toolbar>
  );
}
