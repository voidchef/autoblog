import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import setAuthToken from './utils/setAuthToken';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import { ROUTES } from './utils/routing/routes';
import PrivateRoute from './utils/routing/PrivateRoute';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Loading from './components/elements/Common/Loading';
import Alerts from './components/elements/Common/Alerts';
import { useAuth, useAppSettings, useTheme } from './utils/hooks';
import ReactGA from 'react-ga4';

// Lazy load page components
const Home = React.lazy(() => import('./components/pages/Home'));
const SignInSide = React.lazy(() => import('./components/pages/SignInSide'));
const ContactUs = React.lazy(() => import('./components/pages/ContactUs'));
const AboutUs = React.lazy(() => import('./components/pages/AboutUs'));
const Category = React.lazy(() => import('./components/pages/Category'));
const AllPosts = React.lazy(() => import('./components/pages/AllPosts'));
const CreatePost = React.lazy(() => import('./components/pages/CreatePost'));
const Blog = React.lazy(() => import('./components/pages/Blog'));
const Dashboard = React.lazy(() => import('./components/pages/Dashboard'));
const Profile = React.lazy(() => import('./components/pages/Profile'));
const Author = React.lazy(() => import('./components/pages/Author'));
const VerifyEmail = React.lazy(() => import('./components/pages/VerifyEmail'));

if (localStorage.tokens) {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '');
  setAuthToken(tokens.access.token);
}

ReactGA.initialize(import.meta.env.VITE_GA_ID);

export default function App() {
  const location = useLocation();

  const { isAuthenticated, user, isLoading: userLoading } = useAuth();
  const { data: appSettingsData, isLoading: appSettingsLoading } = useAppSettings();
  const { themeMode } = useTheme();

  // Track page views with Google Analytics
  React.useEffect(() => {
    if (location.pathname.startsWith('/blog/') && import.meta.env.VITE_GA_ID) {
      ReactGA.send({
        hitType: 'pageview',
        page: window.location.pathname + window.location.search,
      });
    }
  }, [location.pathname]);

  // Show loading screen while essential data is loading
  const isInitialLoading = appSettingsLoading;

  if (isInitialLoading) {
    return (
      <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
        <CssBaseline />
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
      </ThemeProvider>
    );
  }

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
            {appSettingsData && (
              <Routes>
                <Route path={ROUTES.LOGIN} element={<SignInSide />} />
                <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
                <Route path={ROUTES.ROOT} element={<Home />} />
                <Route path={ROUTES.CONTACTUS} element={<ContactUs />} />
                <Route path={ROUTES.ABOUTUS} element={<AboutUs />} />
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
                  path={ROUTES.PROFILE}
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
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
            )}
          </section>
        </React.Fragment>
      </React.Suspense>
    </ThemeProvider>
  );
}
