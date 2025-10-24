import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

interface TrafficSource {
  name: string;
  value: number;
  percentage: number;
  icon?: React.ReactNode;
  color: string;
}

interface SharePlatform {
  platform: string;
  shares: number;
  percentage: number;
}

interface PopularContent {
  title: string;
  views: number;
  category: string;
}

interface TrafficSourcesProps {
  data?: {
    sources: TrafficSource[];
    sharePlatforms: SharePlatform[];
    topContent: PopularContent[];
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  isLoading?: boolean;
  error?: any;
}

const TrafficSources: React.FC<TrafficSourcesProps> = ({ data, isLoading, error }) => {
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
        Failed to load traffic data. Please try again later.
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const getSourceIcon = (sourceName: string) => {
    const lowerName = sourceName.toLowerCase();
    if (lowerName.includes('twitter')) return <TwitterIcon />;
    if (lowerName.includes('facebook')) return <FacebookIcon />;
    if (lowerName.includes('linkedin')) return <LinkedInIcon />;
    if (lowerName.includes('search') || lowerName.includes('google')) return <SearchIcon />;
    if (lowerName.includes('direct')) return <LinkIcon />;
    return <LanguageIcon />;
  };

  const COLORS = [
    theme.palette.primary.main,
    '#2196f3',
    '#4caf50',
    '#ff9800',
    '#9c27b0',
    '#00bcd4',
    '#f44336',
    '#3f51b5',
  ];

  // Prepare data for PieChart
  const pieChartData = data.sources.map((source, index) => ({
    id: index,
    value: source.value,
    label: source.name,
  }));

  // Prepare data for BarChart
  const barChartData = data.sharePlatforms.map(p => p.shares);
  const barChartLabels = data.sharePlatforms.map(p => p.platform);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        },
        gap: 3,
      }}
    >
      {/* Traffic Sources Pie Chart */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.divider, 0.1)
            : theme.palette.divider,
        }}
      >
        <CardContent>
          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
            Traffic Sources
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Where your visitors come from
          </Typography>

          <Box sx={{ height: 300, mb: 2 }}>
            <PieChart
              series={[{
                data: pieChartData,
                highlightScope: { fade: 'global', highlight: 'item' },
              }]}
              colors={COLORS}
              height={300}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            {data.sources.map((source, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: index < data.sources.length - 1 ? '1px solid' : 'none',
                  borderColor: theme.palette.divider,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: COLORS[index % COLORS.length],
                    }}
                  />
                  <Box display="flex" alignItems="center" gap={1}>
                    {getSourceIcon(source.name)}
                    <Typography variant="body2" fontWeight={500}>
                      {source.name}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    {source.value.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${source.percentage}%`}
                    size="small"
                    sx={{
                      height: 24,
                      fontWeight: 600,
                      bgcolor: alpha(COLORS[index % COLORS.length], 0.1),
                      color: COLORS[index % COLORS.length],
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Share Platforms */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.divider, 0.1)
            : theme.palette.divider,
        }}
      >
        <CardContent>
          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
            Share Platforms
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            How users share your content
          </Typography>

          <Box sx={{ height: 300, mb: 2 }}>
            <BarChart
              xAxis={[{ scaleType: 'band', data: barChartLabels }]}
              series={[{ data: barChartData, color: theme.palette.primary.main }]}
              height={300}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            {data.sharePlatforms.map((platform, index) => (
              <Box
                key={index}
                sx={{
                  py: 1.5,
                  borderBottom: index < data.sharePlatforms.length - 1 ? '1px solid' : 'none',
                  borderColor: theme.palette.divider,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {platform.platform}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {platform.shares} shares ({platform.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={platform.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* User Behavior Metrics */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.divider, 0.1)
            : theme.palette.divider,
        }}
      >
        <CardContent>
          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
            User Behavior
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Key engagement metrics
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {data.totalSessions.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Total Sessions
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {Math.floor(data.avgSessionDuration / 60)}:{(data.avgSessionDuration % 60).toString().padStart(2, '0')}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Avg. Duration
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  color: data.bounceRate < 50 ? theme.palette.success.main : 
                         data.bounceRate < 70 ? theme.palette.warning.main : 
                         theme.palette.error.main,
                }}
              >
                {data.bounceRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Bounce Rate
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.divider, 0.1)
            : theme.palette.divider,
        }}
      >
        <CardContent>
          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
            Top Performing Content
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Most viewed blog posts
          </Typography>

          <Box>
            {data.topContent.map((content, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  borderBottom: index < data.topContent.length - 1 ? '1px solid' : 'none',
                  borderColor: theme.palette.divider,
                }}
              >
                <Box
                  sx={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: index === 0 ? alpha(theme.palette.warning.main, 0.2) :
                             index === 1 ? alpha(theme.palette.grey[400], 0.2) :
                             index === 2 ? alpha(theme.palette.warning.dark, 0.2) :
                             alpha(theme.palette.primary.main, 0.1),
                    color: index === 0 ? theme.palette.warning.main :
                           index === 1 ? theme.palette.grey[600] :
                           index === 2 ? theme.palette.warning.dark :
                           theme.palette.primary.main,
                    fontWeight: 'bold',
                  }}
                >
                  {index + 1}
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      mb: 0.5,
                    }}
                  >
                    {content.title}
                  </Typography>
                  <Chip
                    label={content.category}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUpIcon fontSize="small" color="success" />
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {content.views.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TrafficSources;
