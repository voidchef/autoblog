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
}

interface BlogPerformanceTableProps {
  data?: BlogPerformanceData[];
  isLoading?: boolean;
  error?: any;
  showPagination?: boolean;
}

const BlogPerformanceTable: React.FC<BlogPerformanceTableProps> = ({
  data = [],
  isLoading,
  error,
  showPagination = true,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.divider, 0.1)
          : theme.palette.divider,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
            Blog Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed analytics for each blog post
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Blog Post</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <VisibilityIcon fontSize="small" />
                    Views
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <ThumbUpIcon fontSize="small" />
                    Likes
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <ShareIcon fontSize="small" />
                    Shares
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <CommentIcon fontSize="small" />
                    Comments
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <TrendingUpIcon fontSize="small" />
                    Engagement
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
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
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        {blog.thumbnail && (
                          <Avatar
                            src={blog.thumbnail}
                            variant="rounded"
                            sx={{ width: 48, height: 48 }}
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
                            }}
                          >
                            {blog.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={blog.category}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(blog.publishedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Views */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {blog.views.toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* Likes */}
                    <TableCell align="center">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {blog.likes}
                        </Typography>
                        {blog.dislikes > 0 && (
                          <Typography variant="caption" color="error.main">
                            -{blog.dislikes}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Shares */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {blog.shares}
                      </Typography>
                    </TableCell>

                    {/* Comments */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {blog.comments}
                      </Typography>
                    </TableCell>

                    {/* Engagement Rate */}
                    <TableCell align="center">
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: getEngagementColor(blog.engagementRate), mb: 0.5 }}
                        >
                          {blog.engagementRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(blog.engagementRate * 5, 100)}
                          sx={{
                            height: 4,
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
                          }}
                        >
                          {getEngagementLabel(blog.engagementRate)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
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
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BlogPerformanceTable;
