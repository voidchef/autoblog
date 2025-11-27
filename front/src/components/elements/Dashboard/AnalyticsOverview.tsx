import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  PlayArrow as PlayArrowIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { ReactNode, FC } from 'react';

interface AnalyticsMetric {
  label: string;
  value: number;
  change?: number; // percentage change from previous period
  icon: ReactNode;
  color: string;
  gradient: string;
  description?: string;
}

interface AnalyticsOverviewProps {
  data?: {
    pageViews: number;
    pageViewsChange?: number;
    blogViews: number;
    blogViewsChange?: number;
    totalLikes: number;
    likesChange?: number;
    totalShares: number;
    sharesChange?: number;
    audioPlays: number;
    audioPlaysChange?: number;
    avgEngagementRate: number;
    engagementRateChange?: number;
  };
  isLoading?: boolean;
  error?: any;
  timeRange?: string;
}

const AnalyticsOverview: FC<AnalyticsOverviewProps> = ({
  data,
  isLoading,
  error,
  timeRange = 'Last 30 days',
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Failed to load analytics overview. Please try again later.
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const metrics: AnalyticsMetric[] = [
    {
      label: 'Total Page Views',
      value: data.pageViews,
      change: data.pageViewsChange,
      icon: <VisibilityIcon />,
      color: theme.palette.primary.main,
      gradient: theme.palette.customColors.gradients.analyticsMetric1,
      description: 'All page views across the site',
    },
    {
      label: 'Blog Post Views',
      value: data.blogViews,
      change: data.blogViewsChange,
      icon: <VisibilityIcon />,
      color: theme.palette.customColors.charts.analytics.metric1,
      gradient: theme.palette.customColors.gradients.analyticsMetric2,
      description: 'Views on blog posts',
    },
    {
      label: 'Total Likes',
      value: data.totalLikes,
      change: data.likesChange,
      icon: <ThumbUpIcon />,
      color: theme.palette.customColors.charts.analytics.metric2,
      gradient: theme.palette.customColors.gradients.analyticsMetric3,
      description: 'Likes across all posts',
    },
    {
      label: 'Total Shares',
      value: data.totalShares,
      change: data.sharesChange,
      icon: <ShareIcon />,
      color: theme.palette.customColors.charts.analytics.metric3,
      gradient: theme.palette.customColors.gradients.analyticsMetric4,
      description: 'Social shares and link copies',
    },
    {
      label: 'Audio Plays',
      value: data.audioPlays,
      change: data.audioPlaysChange,
      icon: <PlayArrowIcon />,
      color: theme.palette.customColors.charts.analytics.metric4,
      gradient: theme.palette.customColors.gradients.analyticsMetric5,
      description: 'Audio narration plays',
    },
    {
      label: 'Engagement Rate',
      value: data.avgEngagementRate,
      change: data.engagementRateChange,
      icon: <TrendingUpIcon />,
      color: theme.palette.customColors.charts.analytics.metric5,
      gradient: theme.palette.customColors.gradients.analyticsMetric6,
      description: 'Average engagement percentage',
    },
  ];

  const getTrendIcon = (change?: number) => {
    if (!change || change === 0) return <RemoveIcon fontSize="small" />;
    if (change > 0) return <TrendingUpIcon fontSize="small" />;
    return <TrendingDownIcon fontSize="small" />;
  };

  const getTrendColor = (change?: number) => {
    if (!change || change === 0) return 'text.secondary';
    if (change > 0) return 'success.main';
    return 'error.main';
  };

  const formatValue = (value: number, label: string) => {
    if (label === 'Engagement Rate') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: { xs: 3, sm: 4 }, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 0 }
      }}>
        <Box>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Analytics Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
            {timeRange}
          </Typography>
        </Box>
        <Chip 
          label="Real-time Data" 
          color="primary" 
          size="small"
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            height: { xs: 24, sm: 28 }
          }}
        />
      </Box>

      {/* Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: { xs: 2, sm: 3 },
        }}
      >
        {metrics.map((metric, index) => (
          <Card
            key={index}
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: { xs: 2, sm: 3 },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' 
                  ? alpha(metric.color, 0.1)
                  : alpha(metric.color, 0.08),
                background: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.6)
                  : theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? `0 12px 40px ${alpha(metric.color, 0.15)}`
                    : `0 12px 40px ${alpha(metric.color, 0.1)}`,
                  borderColor: alpha(metric.color, 0.3),
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: { xs: '3px', sm: '4px' },
                  background: metric.gradient,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Icon and Trend */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 } }}>
                  <Box
                    sx={{
                      width: { xs: 48, sm: 56 },
                      height: { xs: 48, sm: 56 },
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: metric.gradient,
                      color: 'white',
                      boxShadow: `0 8px 16px ${alpha(metric.color, 0.25)}`,
                      '& .MuiSvgIcon-root': {
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }
                    }}
                  >
                    {metric.icon}
                  </Box>
                  {metric.change !== undefined && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.25, sm: 0.5 },
                        borderRadius: 1.5,
                        bgcolor: alpha(
                          metric.change > 0 ? theme.palette.success.main : 
                          metric.change < 0 ? theme.palette.error.main : 
                          theme.palette.grey[500],
                          0.1
                        ),
                        color: getTrendColor(metric.change),
                      }}
                    >
                      {getTrendIcon(metric.change)}
                      <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {Math.abs(metric.change).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Value */}
                <Typography
                  variant="h4"
                  component="div"
                  fontWeight="bold"
                  sx={{
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    background: metric.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatValue(metric.value, metric.label)}
                </Typography>

                {/* Label */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  fontWeight={500} 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                >
                  {metric.label}
                </Typography>

                {/* Description */}
                {metric.description && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      mt: 1,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    {metric.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AnalyticsOverview;
