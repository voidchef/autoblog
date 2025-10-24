import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Fab, MenuItem, Select, Typography, Paper, Container, Card, alpha, Divider } from '@mui/material';
import BlogsTable from '../elements/Dashboard/BlogsTable';
import AddIcon from '@mui/icons-material/Add';
import { ROUTES } from '../../utils/routing/routes';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/reduxHooks';
import { clearBlog } from '../../reducers/blog';
import { useGetBlogViewsQuery, useGetAllBlogsEngagementStatsQuery, useGetBlogsQuery } from '../../services/blogApi';
import ViewsGraph from '../elements/Dashboard/ViewsGraph';
import DraftsTable from '../elements/Dashboard/DraftsTable';
import EngagementMetrics from '../elements/Dashboard/EngagementMetrics';
import QuickStats from '../elements/Dashboard/QuickStats';
import TopPerformingBlogs from '../elements/Dashboard/TopPerformingBlogs';
import CategoryPerformance from '../elements/Dashboard/CategoryPerformance';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useAuth } from '../../utils/hooks';

const months = Array.from({ length: 12 }, (_, index) => ({
  value: index,
  label: new Date(2000, index, 1).toLocaleString('default', { month: 'long' }),
}));

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const [monthDays, setMonthDays] = React.useState<Array<Date>>([]);
  const [selectedBlog, setSelectedBlog] = React.useState<string>('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userId } = useAuth();
  
  // Fetch engagement stats
  const { data: engagementStats, isLoading: statsLoading } = useGetAllBlogsEngagementStatsQuery();
  
  // Fetch user's published blogs for top performers
  const { data: blogsData, isLoading: blogsLoading } = useGetBlogsQuery({
    author: userId || '',
    isPublished: true,
    isDraft: false,
    limit: 100,
    page: 1,
  }, {
    skip: !userId,
  });
  
  // Prepare parameters for RTK Query
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  let lastDay: number;
  switch (selectedMonth) {
    case 1:
      lastDay = currentYear % 4 === 0 ? 29 : 28;
      break;
    case 3:
    case 5:
    case 8:
    case 10:
      lastDay = 30;
      break;
    default:
      lastDay = 31;
  }
  
  const startDate = `${currentYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  
  // Use RTK Query for blog views
  const { data: blogViews = [], isLoading: viewsLoading } = useGetBlogViewsQuery(
    { startDate, endDate, slug: selectedBlog },
    { skip: !selectedBlog || selectedBlog === '' }
  );

  React.useEffect(() => {
    if (selectedBlog) {
      const days = Array.from({ length: lastDay }, (_, index) => new Date(currentYear, selectedMonth, index + 1));
      setMonthDays(days);
    }
  }, [selectedMonth, selectedBlog, lastDay, currentYear]);
  
  // Prepare top performing blogs data
  const topBlogs = React.useMemo(() => {
    if (!blogsData?.results) return [];
    
    return blogsData.results
      .map((blog: any) => ({
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        category: blog.category,
        views: blog.views || 0,
        likes: blog.likes?.length || 0,
        comments: blog.comments?.length || 0,
        engagement: blog.likes?.length && blog.views 
          ? ((blog.likes.length / blog.views) * 100) 
          : 0,
      }))
      .sort((a: any, b: any) => b.engagement - a.engagement)
      .slice(0, 5);
  }, [blogsData]);
  
  // Prepare category performance data
  const categoryData = React.useMemo(() => {
    if (!blogsData?.results) return [];
    
    const categoriesMap = new Map<string, { count: number; views: number; engagement: number }>();
    
    blogsData.results.forEach((blog: any) => {
      const category = blog.category || 'Uncategorized';
      const existing = categoriesMap.get(category) || { count: 0, views: 0, engagement: 0 };
      
      categoriesMap.set(category, {
        count: existing.count + 1,
        views: existing.views + (blog.views || 0),
        engagement: existing.engagement + (blog.likes?.length || 0),
      });
    });
    
    return Array.from(categoriesMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    }));
  }, [blogsData]);

  function handleSelectBlog(slug: string) {
    setSelectedBlog(slug);
  }

  function handleClick() {
    dispatch(clearBlog());
    navigate(ROUTES.CREATEPOST);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0e1a 0%, #131827 50%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%)',
      }}
    >
      <NavBar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 5, mt: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{
              mb: 1,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Monitor your blog performance and engagement metrics
          </Typography>
        </Box>

        {/* Engagement Metrics Section */}
        <EngagementMetrics />

        {/* Quick Stats Section */}
        <Box sx={{ my: 5 }}>
          <QuickStats
            weeklyViews={1247}
            newFollowers={23}
            avgReadTime={4.5}
            engagementRate={engagementStats?.avgEngagementPerBlog ? parseFloat(engagementStats.avgEngagementPerBlog) : 0}
            totalReach={engagementStats?.totalBlogs ? engagementStats.totalBlogs * 150 : 0}
            isLoading={statsLoading}
          />
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Top Performing Blogs */}
        <Box sx={{ my: 5 }}>
          <TopPerformingBlogs blogs={topBlogs} isLoading={blogsLoading} />
        </Box>

        {/* Category Performance */}
        <Box sx={{ my: 5 }}>
          <CategoryPerformance categories={categoryData} isLoading={blogsLoading} />
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Blog Views Graph Section */}
        <Card
          sx={{
            my: 4,
            p: 3,
            borderRadius: 3,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <TimelineIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Total Visits
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Track your blog views over time
                </Typography>
              </Box>
            </Box>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{
                minWidth: '10rem',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.3)
                      : 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
              size="small"
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box width="100%" height={{ sm: '400px', xs: '280px' }}>
            {blogViews.length === monthDays.length && <ViewsGraph blogViews={blogViews} monthDays={monthDays} />}
          </Box>
        </Card>

        {/* Published Blogs Section */}
        <Box sx={{ my: 4 }}>
          <BlogsTable handleSelectBlog={handleSelectBlog} />
        </Box>

        {/* Drafts Section */}
        <Box sx={{ my: 4 }}>
          <DraftsTable />
        </Box>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 64,
          height: 64,
          boxShadow: (theme) =>
            `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1) rotate(90deg)',
            boxShadow: (theme) =>
              `0 12px 32px ${alpha(theme.palette.primary.main, 0.6)}`,
          },
        }}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </Fab>

      <Footer />
    </Box>
  );
}
