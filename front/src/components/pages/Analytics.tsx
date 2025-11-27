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
  AttachMoney as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import AnalyticsOverview from '../elements/Dashboard/AnalyticsOverview';
import BlogPerformanceTable, { BlogPerformanceData } from '../elements/Dashboard/BlogPerformanceTable';
import TrafficSources from '../elements/Dashboard/TrafficSources';
import ViewsGraph from '../elements/Dashboard/ViewsGraph';
import PaymentAnalytics from '../elements/Analytics/PaymentAnalytics';
import { useGetAnalyticsByTimeRangeQuery, useToggleFeaturedMutation } from '../../services/blogApi';
import { useAuth } from '../../utils/hooks';
import { ROUTES } from '../../utils/routing/routes';
import { useAppDispatch } from '../../utils/reduxHooks';
import { showError, showSuccess } from '../../reducers/alert';
import { ReactNode, SyntheticEvent, useEffect, useState } from 'react';

interface TabPanelProps {
  children?: ReactNode;
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
      {value === index && <Box sx={{ py: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function Analytics() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [blogPerformanceData, setBlogPerformanceData] = useState<BlogPerformanceData[]>([]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch comprehensive analytics from backend
  const { data: analyticsData, isLoading, error } = useGetAnalyticsByTimeRangeQuery(timeRange, {
    skip: !isAdmin, // Don't fetch if not admin
  });

  // Toggle featured mutation
  const [toggleFeatured] = useToggleFeaturedMutation();

  // Redirect non-admin users to dashboard
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAdmin, authLoading, navigate]);

  // Handler for toggling featured status
  const handleToggleFeatured = async (blogId: string) => {
    try {
      const result = await toggleFeatured(blogId).unwrap();
      dispatch(showSuccess(`Blog ${result.isFeatured ? 'marked as featured' : 'unmarked as featured'}!`));
      
      // Update local state immediately for better UX
      setBlogPerformanceData(prevData => 
        prevData.map(blog => 
          blog.id === blogId 
            ? { ...blog, isFeatured: result.isFeatured }
            : blog
        )
      );
    } catch (error: any) {
      dispatch(showError(error?.data?.message || 'Failed to toggle featured status'));
    }
  };

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
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.6)
                  : theme.palette.customColors.overlay.white.opaque,
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

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
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
    blogViews: analyticsData.overview.blogViews || 0, // Use the blog-specific views from backend
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

  // Update blog performance data when analytics data changes
  useEffect(() => {
    if (analyticsData?.blogsPerformance) {
      const transformedData: BlogPerformanceData[] = analyticsData.blogsPerformance.map(blog => ({
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
        isFeatured: Boolean(blog.isFeatured), // Ensure it's a boolean
      }));
      console.log('Analytics - Transformed blog performance data:', transformedData.map(b => ({ id: b.id, title: b.title, isFeatured: b.isFeatured })));
      setBlogPerformanceData(transformedData);
    } else {
      setBlogPerformanceData([]);
    }
  }, [analyticsData?.blogsPerformance]);

  // Transform traffic sources data
  const trafficSourcesData = analyticsData?.trafficSources ? {
    sources: analyticsData.trafficSources.map((source, index) => {
      const total = analyticsData.trafficSources.reduce((sum, s) => sum + s.sessions, 0);
      return {
        name: source.channel || source.source,
        value: source.sessions,
        percentage: total > 0 ? (source.sessions / total * 100) : 0,
        color: theme.palette.customColors.analytics.trafficSources[index % 5],
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
            ? theme.palette.customColors.analytics.heroGradientDark
            : theme.palette.customColors.analytics.heroGradientLight,
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
            ? theme.palette.customColors.analytics.heroGradientDark
            : theme.palette.customColors.analytics.heroGradientLight,
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
          ? theme.palette.customColors.analytics.heroGradientDark
          : theme.palette.customColors.analytics.heroGradientLight,
      }}
    >
      <NavBar />

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Page Header */}
        <Box sx={{ mb: { xs: 3, sm: 4 }, mt: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' }, 
            justifyContent: 'space-between', 
            mb: 2,
            gap: { xs: 2, md: 0 }
          }}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  background: theme.palette.mode === 'dark'
                    ? theme.palette.customColors.analytics.headerTextGradientDark
                    : theme.palette.customColors.analytics.headerTextGradientLight,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Comprehensive insights into your blog's performance
              </Typography>
            </Box>

            {/* Time Range Selector */}
            <ButtonGroup 
              variant="outlined" 
              size="small"
              sx={{
                width: { xs: '100%', md: 'auto' },
                '& .MuiButton-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  flex: { xs: 1, md: 'initial' }
                }
              }}
            >
              <Button
                variant={timeRange === '7d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </Button>
              <Button
                variant={timeRange === '30d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </Button>
              <Button
                variant={timeRange === '90d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('90d')}
              >
                90D
              </Button>
              <Button
                variant={timeRange === '1y' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('1y')}
              >
                1Y
              </Button>
            </ButtonGroup>
          </Box>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          {/* Navigation Tabs */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              bgcolor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: 56, sm: 64 },
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  minWidth: { xs: 'auto', sm: 120 },
                },
                '& .MuiTabs-scrollButtons': {
                  '&.Mui-disabled': { opacity: 0.3 },
                },
              }}
            >
              <Tab
                icon={<DashboardIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                iconPosition="start"
                label="Overview"
              />
              <Tab
                icon={<TableChartIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                iconPosition="start"
                label="Performance"
              />
              <Tab
                icon={<PieChartIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                iconPosition="start"
                label="Traffic"
              />
              <Tab
                icon={<TimelineIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                iconPosition="start"
                label="Trends"
              />
              <Tab
                icon={<PaymentIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                iconPosition="start"
                label="Payments"
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
          <BlogPerformanceTable data={blogPerformanceData} onToggleFeatured={handleToggleFeatured} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TrafficSources data={trafficSourcesData} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              View Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Daily views over the selected time period
            </Typography>
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
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

        <TabPanel value={tabValue} index={4}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Payment Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Revenue, subscriptions, and payment trends
            </Typography>
            <PaymentAnalytics />
          </Box>
        </TabPanel>
      </Container>

      <Footer />
    </Box>
  );
}
