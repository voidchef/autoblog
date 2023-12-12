import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/pages/Home';
import SignInSide from './components/pages/SignInSide';
import setAuthToken from './utils/setAuthToken';
import store from './store';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import { ROUTES } from './utils/routing/routes';
import PrivateRoute from './utils/routing/PrivateRoute';
import Box from '@mui/material/Box';
import Loading from './components/elements/Common/Loading';
import ContactUs from './components/pages/ContactUs';
import AboutUs from './components/pages/AboutUs';
import Category from './components/pages/Category';
import AllPosts from './components/pages/AllPosts';
import CreatePost from './components/pages/CreatePost';
import Blog from './components/pages/Blog';
import Dashboard from './components/pages/Dashboard';
import Alerts from './components/elements/Common/Alerts';
import { loadUser } from './actions/user';
import { loadAppSettings } from './actions/appSettings';
import { useAppSelector } from './utils/reduxHooks';
import ReactGA from 'react-ga4';

if (localStorage.tokens) {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '');
  setAuthToken(tokens.access.token);
}

ReactGA.initialize(import.meta.env.VITE_GA_ID);

export default function App() {
  const location = useLocation();

  const userId = useAppSelector((state) => state.auth.userId);
  const themeMode = useAppSelector((state) => state.appSettings.themeMode);
  const appSettings = useAppSelector((state) => state.appSettings);

  /* const isAuthenticated = store.getState().user.isAuthenticated;
  React.useEffect(() => {
    const handleTokenChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && e.oldValue && !e.newValue) {
        store.dispatch(logout());
      }
    };
    window.addEventListener('storage', handleTokenChange);
    return function cleanup() {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []); */

  React.useEffect(() => {
    if (location.pathname.startsWith('/blog/')) {
      ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });
    }
  }, [location.pathname]);

  React.useEffect(() => {
    if (userId) {
      store.dispatch(loadUser(userId));
      store.dispatch(loadAppSettings());
    }
  }, [userId]);

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
            {appSettings && (
              <Routes>
                <Route path={ROUTES.LOGIN} element={<SignInSide />} />
                <Route path={ROUTES.ROOT} element={<Home />} />
                <Route path={ROUTES.CONTACTUS} element={<ContactUs />} />
                <Route path={ROUTES.ABOUTUS} element={<AboutUs />} />
                <Route path={`${ROUTES.CATEGORY}/:categoryName`} element={<Category />} />
                <Route path={ROUTES.ALLPOSTS} element={<AllPosts />} />
                <Route path={`${ROUTES.BLOG}/:slug`} element={<Blog />} />
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
              </Routes>
            )}
          </section>
        </React.Fragment>
      </React.Suspense>
    </ThemeProvider>
  );
}
