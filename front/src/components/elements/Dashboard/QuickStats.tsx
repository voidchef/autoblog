import { Box, Card, CardContent, Typography, alpha, Skeleton, useTheme } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  AutoGraph as AutoGraphIcon,
} from '@mui/icons-material';
import { ReactNode, FC } from 'react';

interface QuickStatProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  color: string;
  isLoading?: boolean;
}

const QuickStatCard: FC<QuickStatProps> = ({ title, value, change, icon, color, isLoading }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (isLoading) {
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={32} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? alpha(color, 0.2) : alpha(color, 0.1),
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.customColors.overlay.white.almostOpaque,
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 12px 24px ${alpha(color, 0.15)}`
              : `0 12px 24px ${alpha(color, 0.1)}`,
          borderColor: alpha(color, 0.3),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha(color, 0.1),
            mb: 2,
            color: color,
            fontSize: 28,
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          {title}
        </Typography>

        {/* Value and Change */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {value}
          </Typography>
          {change !== undefined && change !== 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: (theme) => isPositive ? theme.palette.customColors.status.positiveAlpha : theme.palette.customColors.status.negativeAlpha,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: (theme) => isPositive ? theme.palette.customColors.status.positive : theme.palette.customColors.status.negative,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

interface QuickStatsProps {
  weeklyViews?: number;
  weeklyViewsChange?: number;
  newFollowers?: number;
  newFollowersChange?: number;
  avgReadTime?: number;
  avgReadTimeChange?: number;
  engagementRate?: number;
  engagementRateChange?: number;
  totalReach?: number;
  totalReachChange?: number;
  isLoading?: boolean;
}

export default function QuickStats({
  weeklyViews = 0,
  weeklyViewsChange = 0,
  newFollowers = 0,
  newFollowersChange = 0,
  avgReadTime = 0,
  avgReadTimeChange = 0,
  engagementRate = 0,
  engagementRateChange = 0,
  totalReach = 0,
  totalReachChange = 0,
  isLoading = false,
}: QuickStatsProps) {
  const theme = useTheme();
  
  const stats = [
    {
      title: 'Views This Week',
      value: weeklyViews.toLocaleString(),
      change: Number(weeklyViewsChange.toFixed(1)),
      icon: <VisibilityIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat1,
    },
    {
      title: 'New Followers',
      value: newFollowers,
      change: Number(newFollowersChange.toFixed(1)),
      icon: <PeopleIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat2,
    },
    {
      title: 'Avg. Read Time',
      value: `${avgReadTime} min`,
      change: Number(avgReadTimeChange.toFixed(1)),
      icon: <AccessTimeIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat3,
    },
    {
      title: 'Engagement Rate',
      value: `${engagementRate.toFixed(1)}%`,
      change: Number(engagementRateChange.toFixed(1)),
      icon: <TrendingUpIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat4,
    },
    {
      title: 'Total Reach',
      value: totalReach.toLocaleString(),
      change: Number(totalReachChange.toFixed(1)),
      icon: <AutoGraphIcon />,
      color: (theme.palette as any).customColors.charts.metrics.stat5,
    },
  ];

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Quick Stats
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 3,
        }}
      >
        {stats.map((stat, index) => (
          <QuickStatCard key={index} {...stat} isLoading={isLoading} />
        ))}
      </Box>
    </Box>
  );
}
