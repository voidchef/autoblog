import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AllTags from './Tags';
import TablePagination from '@mui/material/TablePagination';
import { useAppDispatch, useAppSelector } from '../../../utils/reduxHooks';
import { getBlog, getBlogs } from '../../../actions/blog';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { AWS_BASEURL } from '../../../utils/consts';

const AllPosts = ({ category }: { category: String }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const allBlogs = useAppSelector((state) => state.blog.allBlogs);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  React.useEffect(() => {
    dispatch(getBlogs({ limit: rowsPerPage, page, populate: 'author', category }));
  }, []);

  const handleClick = (id: string, slug: string) => {
    dispatch(getBlog(id, () => navigate(`${ROUTES.BLOG}/${slug}`)));
  };

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
        <Grid container spacing={2}>
          <Grid container item xs={12} sm={8} spacing={2}>
            {allBlogs.length > 0 ? (
              allBlogs.map((post: any, index: number) => (
                <Grid item xs={12} sm={6} key={index} onClick={() => handleClick(post.id, post.slug)}>
                  <Box sx={{ py: 1 }} height={{ xs: '15rem', sm: '18rem' }} maxWidth={'100%'} marginBottom={4}>
                    <img
                      src={`${AWS_BASEURL}/blogs/${post.id}/1.img`}
                      alt={post.topic}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box display="flex" flexDirection="column" justifyContent="space-between">
                    <Typography fontSize={{ sm: 15 }} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                      By <span style={{ color: '#555FAC' }}>{post.author.name}</span> |{' '}
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                    <Typography fontSize={{ sm: 22 }} fontWeight={500} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                      {post.title}
                    </Typography>
                    <Typography fontSize={{ sm: 18 }} component="div" sx={{ flexGrow: 1 }}>
                      {`${post.content.slice(0, 255)}...`}
                    </Typography>
                  </Box>
                </Grid>
              ))
            ) : (
              <Typography
                variant="h5"
                component="div"
                sx={{
                  flexGrow: 1,
                  marginBottom: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                No posts found
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4} sx={{ marginBottom: '2rem' }}>
            <AllTags />
          </Grid>
        </Grid>
      </Box>
      <Box display={'flex'} justifyContent={'center'} alignItems={'center'} margin={3}>
        <TablePagination
          component="div"
          count={100}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </React.Fragment>
  );
};

export default AllPosts;
