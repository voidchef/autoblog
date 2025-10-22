import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AllTags from './Tags';
import TablePagination from '@mui/material/TablePagination';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { useGetBlogsByCategoryQuery } from '../../../services/blogApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { stringAvatar } from '../../../utils/utils';
import { Avatar } from '@mui/material';

const AllPosts = ({ category }: { category: string }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const navigate = useNavigate();

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { data: blogsData, isLoading } = useGetBlogsByCategoryQuery({
    category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
    limit: rowsPerPage,
    page: page + 1, // RTK Query pages are 1-based
  });

  // Use the data from RTK Query
  const allBlogs = blogsData || { results: [], page: 1, totalPages: 1, totalResults: 0 };

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
          <Grid container size={{ xs: 12, sm: 8 }} spacing={2}>
            {allBlogs.results.length > 0 ? (
              allBlogs.results.map((post: any, index: number) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Box
                    sx={{ py: 1, cursor: 'pointer' }}
                    height={{ xs: '15rem', sm: '18rem' }}
                    maxWidth={'100%'}
                    marginBottom={4}
                    onClick={() => handleClick(post.slug)}
                  >
                    <img
                      src={post.selectedImage}
                      alt={post.topic}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                  </Box>
                  <Box display="flex" flexDirection="column" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        {...stringAvatar(post.author.name)}
                        sx={{
                          width: 36,
                          height: 36,
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (post.author?.id) navigate(`${ROUTES.AUTHOR}/${post.author.id}`);
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          fontSize="0.875rem"
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.author?.id) navigate(`${ROUTES.AUTHOR}/${post.author.id}`);
                          }}
                        >
                          {post.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      fontSize={{ sm: 22 }}
                      fontWeight={500}
                      component="div"
                      sx={{
                        flexGrow: 1,
                        marginBottom: 1,
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' },
                      }}
                      onClick={() => handleClick(post.slug)}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      fontSize={{ sm: 18 }}
                      component="div"
                      sx={{
                        flexGrow: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleClick(post.slug)}
                    >
                      {`${post.content.slice(0, 255)}...`}
                    </Typography>

                    {/* Engagement Stats */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        mt: 2,
                        alignItems: 'center',
                        color: '#6D6E76',
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
                    </Box>
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
          <Grid size={{ xs: 12, sm: 4 }} sx={{ marginBottom: '2rem' }}>
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
