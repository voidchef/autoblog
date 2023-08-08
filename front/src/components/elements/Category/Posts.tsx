import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AllTags from './Tags';
import TablePagination from '@mui/material/TablePagination';

const posts = [
  {
    category: 'Technology',
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non blandit massa enim nec.',
    date: 'May 23, 2022',
  },
  {
    category: 'Technology',
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non blandit massa enim nec.',
    date: 'May 23, 2022',
  },
  {
    category: 'Technology',
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non blandit massa enim nec.',
    date: 'May 23, 2022',
  },
  {
    category: 'Technology',
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non blandit massa enim nec.',
    date: 'May 23, 2022',
  },
];

const AllPosts = () => {
  const [page, setPage] = React.useState(2);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <>
      <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
        <Grid container spacing={2}>
          <Grid container item xs={12} sm={8} spacing={2}>
            {posts.map((post, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ p: 1, background: '#E9EAF4' }} height={{ xs: '15rem', sm: '18rem' }} marginBottom={4} />
                <Box display="flex" flexDirection="column" justifyContent="space-between">
                  <Typography fontSize={{ sm: 15 }} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                    By <span style={{ color: '#555FAC' }}>{post.author}</span> | {post.date}
                  </Typography>
                  <Typography fontSize={{ sm: 22 }} fontWeight={500} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                    {post.title}
                  </Typography>
                  <Typography fontSize={{ sm: 18 }} component="div" sx={{ flexGrow: 1 }}>
                    {post.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} sm={4} sx={{ marginBottom: '2rem' }}>
            <AllTags />
          </Grid>
        </Grid>
      </Box>
      <Box display={'flex'} justifyContent={'center'} margin={3}>
        <TablePagination
          component="div"
          count={100}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </>
  );
};

export default AllPosts;
