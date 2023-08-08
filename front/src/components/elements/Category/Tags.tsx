import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Button } from '@mui/material';

const tags = ['Business', 'Technology', 'Design', 'Culture', 'Science', 'Politics', 'Health', 'Style', 'Travel'];

const AllTags = () => {
  return (
    <Box sx={{ flexGrow: 1, marginX: { xs: '0rem', sm: '1rem' } }}>
      <Typography fontSize={'1.5rem'} sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        All Tags
      </Typography>
      <Grid container spacing={2}>
        {tags.map((tag) => (
          <Grid item xs="auto" key={tag}>
            <Button variant="outlined" sx={{ borderRadius: '1rem' }}>
              {tag}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AllTags;
