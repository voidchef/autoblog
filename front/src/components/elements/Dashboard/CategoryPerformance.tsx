import * as React from 'react';
import { Box, Card, CardContent, Typography, alpha, Skeleton } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

interface CategoryData {
  category: string;
  count: number;
  views: number;
  engagement: number;
}

interface CategoryPerformanceProps {
  categories?: CategoryData[];
  isLoading?: boolean;
}

export default function CategoryPerformance({ categories = [], isLoading = false }: CategoryPerformanceProps) {
  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316'];

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Category Performance
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={200} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  if (categories.length === 0) {
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
          Category Performance
        </Typography>
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
          <Typography variant="h6" color="text.secondary">
            No category data available
          </Typography>
        </Card>
      </Box>
    );
  }

  // Prepare data for charts
  const pieData = categories.map((cat, index) => ({
    id: index,
    value: cat.count,
    label: cat.category,
    color: colors[index % colors.length],
  }));

  const barData = categories.map((cat) => ({
    category: cat.category,
    views: cat.views,
    engagement: cat.engagement,
  }));

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
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
          Category Performance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyze performance across different categories
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Pie Chart - Category Distribution */}
        <Card
          sx={{
            borderRadius: 3,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Content Distribution
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 300,
                width: '100%',
              }}
            >
              <PieChart
                series={[
                  {
                    data: pieData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    innerRadius: 0,
                    outerRadius: 90,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                sx={{
                  width: '100%',
                  maxWidth: 400,
                }}
                height={250}
              />
              {/* Manual Legend */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, justifyContent: 'center' }}>
                {pieData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        bgcolor: item.color,
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Bar Chart - Views by Category */}
        <Card
          sx={{
            borderRadius: 3,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Views & Engagement
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 300,
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <BarChart
                dataset={barData}
                xAxis={[{ 
                  scaleType: 'band', 
                  dataKey: 'category',
                  tickLabelStyle: {
                    angle: -45,
                    textAnchor: 'end',
                    fontSize: 12,
                  },
                }]}
                yAxis={[{ 
                  tickLabelStyle: {
                    fontSize: 12,
                  },
                }]}
                series={[
                  { dataKey: 'views', label: 'Views', color: '#3b82f6' },
                  { dataKey: 'engagement', label: 'Engagement', color: '#10b981' },
                ]}
                margin={{ top: 10, bottom: 70, left: 60, right: 20 }}
                sx={{
                  width: '100%',
                  maxWidth: 500,
                }}
                height={300}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
