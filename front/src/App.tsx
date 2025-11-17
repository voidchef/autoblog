import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import setAuthToken from './utils/setAuthToken';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import { ROUTES } from './utils/routing/routes';
import PrivateRoute from './utils/routing/PrivateRoute';
import AdminRoute from './utils/routing/AdminRoute';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Loading from './components/elements/Common/Loading';
import Alerts from './components/elements/Common/Alerts';
import { useAuth, useAppSettings, useTheme } from './utils/hooks';
import * as analytics from './utils/analytics';
import { useAppDispatch } from './utils/reduxHooks';
import { loadActiveGeneration } from './reducers/blog';

// Lazy load page components with preload capability
const Home = React.lazy(() => import('./components/pages/Home'));
const SignInSide = React.lazy(() => import('./components/pages/SignInSide'));
const ContactUs = React.lazy(() => import('./components/pages/ContactUs'));
const AboutUs = React.lazy(() => import('./components/pages/AboutUs'));
const Pricing = React.lazy(() => import('./components/pages/Pricing'));
const Category = React.lazy(() => import('./components/pages/Category'));
const AllPosts = React.lazy(() => import('./components/pages/AllPosts'));
const CreatePost = React.lazy(() => import('./components/pages/CreatePost'));
const Blog = React.lazy(() => import('./components/pages/Blog'));
const Dashboard = React.lazy(() => import('./components/pages/Dashboard'));
const Analytics = React.lazy(() => import('./components/pages/Analytics'));
const Profile = React.lazy(() => import('./components/pages/Profile'));
const Author = React.lazy(() => import('./components/pages/Author'));
const VerifyEmail = React.lazy(() => import('./components/pages/VerifyEmail'));
const OAuthCallback = React.lazy(() => import('./components/pages/OAuthCallback'));
const AppSettings = React.lazy(() => import('./components/pages/AppSettings'));

if (localStorage.tokens) {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '');
  setAuthToken(tokens.access.token);
}

export default function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user, isLoading: userLoading } = useAuth();
  const { data: appSettingsData, isLoading: appSettingsLoading } = useAppSettings();
  const { themeMode } = useTheme();

  // Load active generation from localStorage on mount
  React.useEffect(() => {
    dispatch(loadActiveGeneration());
  }, [dispatch]);

  // Initialize Google Analytics once on app mount
  React.useEffect(() => {
    analytics.initializeGA(import.meta.env.VITE_GA_ID, {
      debug: import.meta.env.DEV,
    });
  }, []);

  // Set user ID when user authentication state changes
  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      analytics.setUserID(user.id);
    } else {
      analytics.clearUserData();
    }
  }, [isAuthenticated, user?.id]);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Track page views with Google Analytics - ALL pages
  React.useEffect(() => {
    if (!analytics.isGAInitialized()) return;

    const path = location.pathname + location.search;
    const title = document.title;

    // Determine content category for better analytics grouping
    let contentCategory: string | undefined;
    if (location.pathname.startsWith('/blog/')) {
      contentCategory = analytics.ContentCategory.BLOG;
    } else if (location.pathname.startsWith('/dashboard')) {
      contentCategory = analytics.ContentCategory.DASHBOARD;
    } else if (location.pathname.startsWith('/category/')) {
      contentCategory = analytics.ContentCategory.CATEGORY;
    } else if (location.pathname.startsWith('/author/')) {
      contentCategory = analytics.ContentCategory.AUTHOR;
    } else if (location.pathname.startsWith('/profile')) {
      contentCategory = analytics.ContentCategory.PROFILE;
    } else if (location.pathname === '/login' || location.pathname === '/register') {
      contentCategory = analytics.ContentCategory.AUTH;
    } else if (location.pathname === '/contact') {
      contentCategory = analytics.ContentCategory.CONTACT;
    } else if (location.pathname === '/about') {
      contentCategory = analytics.ContentCategory.ABOUT;
    } else if (location.pathname === '/') {
      contentCategory = analytics.ContentCategory.HOME;
    }

    analytics.trackPageView(path, title, {
      content_group: contentCategory,
      user_authenticated: isAuthenticated,
    });
  }, [location.pathname, location.search, isAuthenticated]);

  // Render UI optimistically - don't block on app settings loading
  // The settings will be available shortly and components can handle loading states individually
  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <React.Suspense
        fallback={
          <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
            <Box
              width={{
                xl: '55%',
                md: '50%',
                sm: '40%',
                xs: '60%',
              }}
            >
              <Loading />
            </Box>
          </Box>
        }
      >
        <React.Fragment>
          <Alerts />
          <section>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<SignInSide />} />
              <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
              <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
              <Route path={ROUTES.ROOT} element={<Home />} />
              <Route path={ROUTES.CONTACTUS} element={<ContactUs />} />
              <Route path={ROUTES.ABOUTUS} element={<AboutUs />} />
              <Route path={ROUTES.PRICING} element={<Pricing />} />
              <Route path={`${ROUTES.CATEGORY}/:categoryName`} element={<Category />} />
              <Route path={ROUTES.ALLPOSTS} element={<AllPosts />} />
              <Route path={`${ROUTES.BLOG}/:slug`} element={<Blog />} />
              <Route path={`${ROUTES.AUTHOR}/:authorId`} element={<Author />} />
              <Route
                path={`${ROUTES.PREVIEW}/:slug`}
                element={
                  <PrivateRoute>
                    <Blog />
                  </PrivateRoute>
                }
              />
              <Route
                path={ROUTES.CREATEPOST}
                element={
                  <PrivateRoute>
                    <CreatePost />
                  </PrivateRoute>
                }
              />
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path={ROUTES.ANALYTICS}
                element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                }
              />
              <Route
                path={ROUTES.PROFILE}
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path={ROUTES.SETTINGS}
                element={
                  <AdminRoute>
                    <AppSettings />
                  </AdminRoute>
                }
              />
              {/* Catch-all route for 404 pages */}
              <Route
                path="*"
                element={
                  <Box display="flex" justifyContent="center" alignItems="center" height="100vh" flexDirection="column">
                    <Typography variant="h4" component="h1" gutterBottom>
                      404 - Page Not Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      The page you're looking for doesn't exist.
                    </Typography>
                  </Box>
                }
              />
            </Routes>
          </section>
        </React.Fragment>
      </React.Suspense>
    </ThemeProvider>
  );
}
