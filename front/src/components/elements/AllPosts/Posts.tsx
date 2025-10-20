import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TablePagination from '@mui/material/TablePagination';
import { ThumbUp, ThumbDown, ChatBubbleOutline } from '@mui/icons-material';
import { useGetBlogsQuery } from '../../../services/blogApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';

const AllPosts = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  const { data: allBlogs, isLoading } = useGetBlogsQuery({ 
    limit: rowsPerPage, 
    page: page + 1, // API expects 1-based page
    isPublished: true 
  });

  const navigate = useNavigate();

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = (slug: string) => {
    navigate(`${ROUTES.BLOG}/${slug}`);
  };

  return (
    <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
      {isLoading ? (
        <Box display={'flex'} justifyContent={'center'} margin={3}>
          <Typography fontSize={{ sm: 22 }} fontWeight={500} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
            Loading blogs...
          </Typography>
        </Box>
      ) : !allBlogs || allBlogs.results.length === 0 ? (
        <Box display={'flex'} justifyContent={'center'} margin={3}>
          <Typography fontSize={{ sm: 22 }} fontWeight={500} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
            No blogs found
          </Typography>
        </Box>
      ) : (
        <React.Fragment>
          <Grid container spacing={3}>
            {allBlogs.results.map((post: any, index: number) => (
              <Grid size={{ xs: 12, sm: 4 }} key={index} onClick={() => handleClick(post.slug)}>
                <Box sx={{ py: 1 }} height={{ xs: '15rem', sm: '18rem' }} maxWidth={'100%'}>
                  <img
                    src={post.selectedImage}
                    alt={post.topic}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                  />
                </Box>
                <Box display="flex" flexDirection="column" justifyContent="space-between">
                  <Typography fontSize={{ sm: 15 }} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                    By <span style={{ color: '#555FAC' }}>{post.author?.name || 'Unknown'}</span> |{' '}
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
                  
                  {/* Engagement Stats */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mt: 2, 
                      alignItems: 'center',
                      color: '#6D6E76'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUp fontSize="small" sx={{ fontSize: '1rem' }} />
                      <Typography variant="body2">{post.likes?.length || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbDown fontSize="small" sx={{ fontSize: '1rem' }} />
                      <Typography variant="body2">{post.dislikes?.length || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ChatBubbleOutline fontSize="small" sx={{ fontSize: '1rem' }} />
                      <Typography variant="body2">Comments</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
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
        </React.Fragment>
      )}
    </Box>
  );
};

export default AllPosts;
