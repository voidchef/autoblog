import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Avatar,
  alpha,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';

interface Blog {
  id: string;
  slug: string;
  title: string;
  category?: string;
  views: number;
  likes: number;
  comments: number;
  engagement: number;
}

interface TopPerformingBlogsProps {
  blogs?: Blog[];
  isLoading?: boolean;
}

const BlogCard: React.FC<{ blog: Blog; rank: number }> = ({ blog, rank }) => {
  const navigate = useNavigate();

  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#667eea', '#764ba2'];
  const rankColor = rankColors[rank - 1] || '#667eea';

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 8px 16px ${alpha(rankColor, 0.15)}`
              : `0 8px 16px ${alpha(rankColor, 0.1)}`,
          borderColor: alpha(rankColor, 0.3),
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Rank Badge */}
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(rankColor, 0.15),
              color: rankColor,
              fontWeight: 700,
              fontSize: '1.25rem',
              border: `2px solid ${alpha(rankColor, 0.3)}`,
            }}
          >
            #{rank}
          </Avatar>

          {/* Blog Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {blog.title}
            </Typography>

            {/* Stats Row */}
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {blog.category && (
                <Chip
                  label={blog.category}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'white',
                  }}
                />
              )}

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Tooltip title="Views">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {blog.views.toLocaleString()}
                    </Typography>
                  </Stack>
                </Tooltip>

                <Tooltip title="Likes">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <ThumbUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {blog.likes}
                    </Typography>
                  </Stack>
                </Tooltip>

                <Tooltip title="Comments">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {blog.comments}
                    </Typography>
                  </Stack>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>

          {/* Engagement Rate */}
          <Box sx={{ textAlign: 'right' }}>
            <Stack spacing={0.5} alignItems="flex-end">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TrendingUpIcon sx={{ fontSize: 18, color: rankColor }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: rankColor }}>
                  {blog.engagement.toFixed(1)}%
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Engagement
              </Typography>
            </Stack>
          </Box>

          {/* View Button */}
          <Tooltip title="View Blog">
            <IconButton
              size="small"
              onClick={() => navigate(`${ROUTES.BLOG}/${blog.slug}`)}
              sx={{
                bgcolor: alpha(rankColor, 0.1),
                color: rankColor,
                '&:hover': {
                  bgcolor: alpha(rankColor, 0.2),
                },
              }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
};

const SkeletonCard: React.FC = () => (
  <Card sx={{ mb: 2, borderRadius: 2 }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
        <Skeleton variant="rectangular" width={60} height={40} />
      </Stack>
    </CardContent>
  </Card>
);

export default function TopPerformingBlogs({ blogs = [], isLoading = false }: TopPerformingBlogsProps) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Top Performing Blogs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your best content ranked by engagement
          </Typography>
        </Box>
        {blogs.length > 0 && (
          <Chip
            label={`Top ${blogs.length}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {/* Blog List */}
      <Box>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        ) : blogs.length === 0 ? (
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.6)
                  : 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Performance Data Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start publishing blogs to see your top performers here!
            </Typography>
          </Card>
        ) : (
          <>
            {blogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} rank={index + 1} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}
