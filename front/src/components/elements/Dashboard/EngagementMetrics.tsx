import * as React from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Chip, useTheme } from '@mui/material';
import {
  Article as ArticleIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useGetAllBlogsEngagementStatsQuery } from '../../../services/blogApi';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, gradient }) => {
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' 
          ? theme.palette.customColors.borders.primaryDark 
          : 'divider',
        background: (theme) => theme.palette.mode === 'dark'
          ? theme.palette.customColors.gradients.cardDark
          : theme.palette.customColors.gradients.cardLight,
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 12px 24px -10px ${color}40, 0 0 20px -5px ${color}20`,
          borderColor: color,
          '& .metric-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
          '& .metric-value': {
            transform: 'scale(1.05)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradient,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2.5}>
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ 
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              {title}
            </Typography>
            
            <Typography 
              className="metric-value"
              variant="h3" 
              component="div" 
              fontWeight="bold"
              sx={{
                background: gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'transform 0.3s ease',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            className="metric-icon"
            sx={{
              background: gradient,
              borderRadius: '16px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 32,
              boxShadow: `0 4px 12px ${color}30`,
              transition: 'transform 0.3s ease',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function EngagementMetrics() {
  const theme = useTheme();
  const { data: stats, isLoading, error } = useGetAllBlogsEngagementStatsQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Failed to load engagement metrics. Please try again later.
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const metrics = [
    {
      title: 'Total Posts',
      value: stats.totalBlogs,
      icon: <ArticleIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat6,
      gradient: (theme.palette as any).customColors.gradients.metricStat1,
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: <ThumbUpIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat7,
      gradient: (theme.palette as any).customColors.gradients.metricStat2,
    },
    {
      title: 'Total Dislikes',
      value: stats.totalDislikes,
      icon: <ThumbDownIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat8,
      gradient: (theme.palette as any).customColors.gradients.metricStat3,
    },
    {
      title: 'Total Comments',
      value: stats.totalComments,
      icon: <CommentIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat9,
      gradient: (theme.palette as any).customColors.gradients.metricStat4,
    },
    {
      title: 'Total Engagement',
      value: stats.totalEngagement,
      icon: <TrendingUpIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat10,
      gradient: (theme.palette as any).customColors.gradients.metricStat5,
    },
    {
      title: 'Avg Per Post',
      value: stats.avgEngagementPerBlog,
      icon: <TimelineIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat11,
      gradient: (theme.palette as any).customColors.gradients.metricStat6,
    },
  ];

  return (
    <Box sx={{ my: 4 }}>
      <Box 
        sx={{ 
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
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
            Engagement Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your blog's performance at a glance
          </Typography>
        </Box>
        {stats.totalBlogs > 0 && (
          <Chip 
            label={`${stats.totalBlogs} Published ${stats.totalBlogs === 1 ? 'Post' : 'Posts'}`}
            color="primary"
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 1,
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            gradient={metric.gradient}
          />
        ))}
      </Box>
    </Box>
  );
}
