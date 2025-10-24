import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  ButtonGroup,
  useTheme,
  alpha,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import AnalyticsOverview from '../elements/Dashboard/AnalyticsOverview';
import BlogPerformanceTable, { BlogPerformanceData } from '../elements/Dashboard/BlogPerformanceTable';
import TrafficSources from '../elements/Dashboard/TrafficSources';
import ViewsGraph from '../elements/Dashboard/ViewsGraph';
import { useGetAnalyticsByTimeRangeQuery } from '../../services/blogApi';
import { useAuth } from '../../utils/hooks';
import { ROUTES } from '../../utils/routing/routes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function Analytics() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);
  const [timeRange, setTimeRange] = React.useState<TimeRange>('30d');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch comprehensive analytics from backend
  const { data: analyticsData, isLoading, error } = useGetAnalyticsByTimeRangeQuery(timeRange, {
    skip: !isAdmin, // Don't fetch if not admin
  });

  // Redirect non-admin users to dashboard
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAdmin, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  // Show unauthorized message if not admin
  if (!isAdmin) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <NavBar />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
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
            <LockIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Access Restricted
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This page is only accessible to administrators. Please contact your administrator if you need access.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(ROUTES.DASHBOARD)}
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      case '1y':
        return 'Last year';
      default:
        return 'Last 30 days';
    }
  };

  // Transform API data for components
  const analyticsOverviewData = analyticsData?.overview ? {
    pageViews: analyticsData.overview.pageViews,
    pageViewsChange: 0, // Would need previous period data
    blogViews: analyticsData.overview.pageViews, // Using same as pageViews for now
    blogViewsChange: 0,
    totalLikes: analyticsData.overview.totalLikes,
    likesChange: 0,
    totalShares: 0, // Not available yet from GA events
    sharesChange: 0,
    audioPlays: 0, // Not available yet from GA events
    audioPlaysChange: 0,
    avgEngagementRate: parseFloat(analyticsData.overview.avgEngagementPerBlog || '0'),
    engagementRateChange: 0,
  } : undefined;

  // Transform blogs performance data
  const blogPerformanceData: BlogPerformanceData[] = analyticsData?.blogsPerformance?.map(blog => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    publishedAt: new Date(blog.publishedAt).toISOString(),
    views: blog.views,
    likes: blog.likes,
    dislikes: blog.dislikes,
    comments: 0, // Not in current response
    shares: 0, // Not available yet
    audioPlays: 0, // Not available yet
    engagementRate: parseFloat(blog.engagementRate || '0'),
  })) || [];

  // Transform traffic sources data
  const trafficSourcesData = analyticsData?.trafficSources ? {
    sources: analyticsData.trafficSources.map((source, index) => {
      const total = analyticsData.trafficSources.reduce((sum, s) => sum + s.sessions, 0);
      return {
        name: source.channel || source.source,
        value: source.sessions,
        percentage: total > 0 ? (source.sessions / total * 100) : 0,
        color: ['#667eea', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'][index % 5],
      };
    }),
    sharePlatforms: [], // Not available yet
    topContent: analyticsData.topPerformers?.slice(0, 5).map(blog => ({
      title: blog.title,
      views: blog.views,
      category: blog.category,
    })) || [],
    totalSessions: analyticsData.overview?.sessions || 0,
    avgSessionDuration: analyticsData.overview?.avgSessionDuration || 0,
    bounceRate: analyticsData.overview?.bounceRate || 0,
  } : {
    sources: [],
    sharePlatforms: [],
    topContent: [],
    totalSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
  };

  // Transform daily trends for ViewsGraph
  const viewsGraphData = analyticsData?.dailyTrends ? {
    blogViews: analyticsData.dailyTrends.map(trend => trend.pageViews),
    monthDays: analyticsData.dailyTrends.map(trend => new Date(trend.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))),
  } : {
    blogViews: [],
    monthDays: [],
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0e1a 0%, #131827 50%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%)',
        }}
      >
        <NavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} />
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0e1a 0%, #131827 50%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%)',
        }}
      >
        <NavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mt: 4 }}>
            Failed to load analytics data. Please try again later.
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0a0e1a 0%, #131827 50%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%)',
      }}
    >
      <NavBar />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{
                  mb: 1,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive insights into your blog's performance
              </Typography>
            </Box>

            {/* Time Range Selector */}
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={timeRange === '7d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </Button>
              <Button
                variant={timeRange === '1y' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('1y')}
              >
                1 Year
              </Button>
            </ButtonGroup>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Navigation Tabs */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                },
              }}
            >
              <Tab
                icon={<DashboardIcon />}
                iconPosition="start"
                label="Overview"
              />
              <Tab
                icon={<TableChartIcon />}
                iconPosition="start"
                label="Blog Performance"
              />
              <Tab
                icon={<PieChartIcon />}
                iconPosition="start"
                label="Traffic & Engagement"
              />
              <Tab
                icon={<TimelineIcon />}
                iconPosition="start"
                label="Trends"
              />
            </Tabs>
          </Paper>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <AnalyticsOverview
            data={analyticsOverviewData}
            timeRange={getTimeRangeLabel(timeRange)}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <BlogPerformanceTable data={blogPerformanceData} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TrafficSources data={trafficSourcesData} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              View Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Daily views over the selected time period
            </Typography>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: theme.palette.divider,
              }}
            >
              <ViewsGraph 
                blogViews={viewsGraphData.blogViews} 
                monthDays={viewsGraphData.monthDays} 
              />
            </Paper>
          </Box>
        </TabPanel>
      </Container>

      <Footer />
    </Box>
  );
}
