import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
  TrendingUp as TrendingUpIcon,
  Launch as LaunchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface BlogPerformanceData {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  audioPlays: number;
  engagementRate: number;
  thumbnail?: string;
  isFeatured?: boolean;
}

interface BlogPerformanceTableProps {
  data?: BlogPerformanceData[];
  isLoading?: boolean;
  error?: any;
  showPagination?: boolean;
  onToggleFeatured?: (blogId: string) => void;
}

const BlogPerformanceTable: React.FC<BlogPerformanceTableProps> = ({
  data = [],
  isLoading,
  error,
  showPagination = true,
  onToggleFeatured,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Debug: Log data when it changes
  React.useEffect(() => {
    console.log('BlogPerformanceTable data updated:', data.map(blog => ({ 
      id: blog.id, 
      title: blog.title, 
      isFeatured: blog.isFeatured 
    })));
  }, [data]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewBlog = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 10) return theme.palette.success.main;
    if (rate >= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getEngagementLabel = (rate: number) => {
    if (rate >= 10) return 'Excellent';
    if (rate >= 5) return 'Good';
    if (rate >= 2) return 'Average';
    return 'Low';
  };

  if (isLoading) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={40} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Alert severity="error">
            Failed to load blog performance data. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const displayedData = showPagination
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data;

  return (
    <Card
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.divider, 0.1)
          : theme.palette.divider,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
            Blog Performance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
            Detailed analytics for each blog post
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ 
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            borderRadius: 4,
          },
        }}>
          <Table sx={{ minWidth: { xs: 800, sm: 'auto' } }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Blog Post</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <VisibilityIcon fontSize="small" />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Views</Box>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <ThumbUpIcon fontSize="small" />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Likes</Box>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <ShareIcon fontSize="small" />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Shares</Box>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <CommentIcon fontSize="small" />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Comments</Box>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <TrendingUpIcon fontSize="small" />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Engagement</Box>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No blog performance data available yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedData.map((blog, index) => (
                  <TableRow
                    key={blog.id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {/* Blog Post Info */}
                    <TableCell sx={{ minWidth: { xs: 200, sm: 250 } }}>
                      <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
                        {blog.thumbnail && (
                          <Avatar
                            src={blog.thumbnail}
                            variant="rounded"
                            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
                          />
                        )}
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 0.5,
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            }}
                          >
                            {blog.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={blog.category}
                              size="small"
                              sx={{
                                height: { xs: 18, sm: 20 },
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                fontWeight: 600,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                              {new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Views */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                        {blog.views.toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* Likes */}
                    <TableCell align="center">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="body2" fontWeight={600} color="success.main" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {blog.likes}
                        </Typography>
                        {blog.dislikes > 0 && (
                          <Typography variant="caption" color="error.main" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            -{blog.dislikes}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Shares */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                        {blog.shares}
                      </Typography>
                    </TableCell>

                    {/* Comments */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                        {blog.comments}
                      </Typography>
                    </TableCell>

                    {/* Engagement Rate */}
                    <TableCell align="center" sx={{ minWidth: { xs: 80, sm: 100 } }}>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ 
                            color: getEngagementColor(blog.engagementRate), 
                            mb: 0.5,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                          }}
                        >
                          {blog.engagementRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(blog.engagementRate * 5, 100)}
                          sx={{
                            height: { xs: 3, sm: 4 },
                            borderRadius: 2,
                            bgcolor: alpha(getEngagementColor(blog.engagementRate), 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getEngagementColor(blog.engagementRate),
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: getEngagementColor(blog.engagementRate),
                            fontWeight: 600,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          }}
                        >
                          {getEngagementLabel(blog.engagementRate)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        {onToggleFeatured && (
                          <Tooltip title={blog.isFeatured ? "Unmark as Featured" : "Mark as Featured"}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                console.log(`Toggling featured for blog ${blog.id}, current: ${blog.isFeatured}`);
                                onToggleFeatured(blog.id);
                              }}
                              sx={{
                                color: blog.isFeatured ? theme.palette.customColors.featured.highlight : theme.palette.action.active,
                                '&:hover': {
                                  color: theme.palette.customColors.featured.highlight,
                                  bgcolor: theme.palette.customColors.featured.highlightBg,
                                },
                              }}
                            >
                              {blog.isFeatured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Blog">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBlog(blog.slug)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {showPagination && data.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid',
              borderColor: theme.palette.divider,
              '& .MuiTablePagination-toolbar': {
                px: { xs: 1, sm: 2 },
                minHeight: { xs: 52, sm: 64 },
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BlogPerformanceTable;
