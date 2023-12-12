import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AllTags from './Tags';
import TablePagination from '@mui/material/TablePagination';
import { useAppDispatch, useAppSelector } from '../../../utils/reduxHooks';
import { getBlogs } from '../../../actions/blog';
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
    dispatch(getBlogs({ limit: rowsPerPage, page, populate: 'author', category, isPublished: true }));
  }, [rowsPerPage, page]);

  const handleClick = (slug: string) => {
    navigate(`${ROUTES.BLOG}/${slug}`);
  };

  return (
    <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
      {allBlogs.results.length === 0 ? (
        <Box display={'flex'} justifyContent={'center'} margin={3}>
          <Typography fontSize={{ sm: 22 }} fontWeight={500} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
            No blogs found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid container item xs={12} sm={8} spacing={2}>
            {allBlogs.results.length > 0 ? (
              allBlogs.results.map((post: any, index: number) => (
                <Grid item xs={12} sm={6} key={index} onClick={() => handleClick(post.slug)}>
                  <Box sx={{ py: 1 }} height={{ xs: '15rem', sm: '18rem' }} maxWidth={'100%'} marginBottom={4}>
                    <img
                      src={`${AWS_BASEURL}/blogs/${post.id}/1.img`}
                      alt={post.topic}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
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
      )}
      {allBlogs.results.length >= 0 && (
        <Box display={'flex'} justifyContent={'center'} margin={3}>
          <TablePagination
            component="div"
            count={allBlogs.totalResults}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </Box>
  );
};

export default AllPosts;
