import * as React from 'react';
import Home from './components/pages/Home';
import SignInSide from './components/pages/SignInSide';
import setAuthToken from './utils/setAuthToken';
import store from './store';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';
import { ROUTES } from './utils/routing/routes';
import PrivateRoute from './utils/routing/PrivateRoute';
import { Box } from '@mui/material';
import Loading from './components/elements/Loading/Loading';
import ContactUs from './components/pages/ContactUs';
import AboutUs from './components/pages/AboutUs';
import Category from './components/pages/Category';
import AllPosts from './components/pages/AllPosts';
import CreatePost from './components/pages/CreatePost';
import Blog from './components/pages/Blog';
import Alerts from './components/elements/Common/Alerts';
import { loadUser } from './actions/user';
import { loadAppSettings } from './actions/appSettings';

if (localStorage.tokens) {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '');
  setAuthToken(tokens.access.token);
}

export default function App() {
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
    const userId = store.getState().auth.userId;
    store.dispatch(loadUser(userId));
    store.dispatch(loadAppSettings());
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
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
                <Route path={ROUTES.ROOT} element={<Home />} />
                <Route path={ROUTES.CONTACTUS} element={<ContactUs />} />
                <Route path={ROUTES.ABOUTUS} element={<AboutUs />} />
                <Route path={`${ROUTES.CATEGORY}/:categoryName`} element={<Category />} />
                <Route path={ROUTES.ALLPOSTS} element={<AllPosts />} />
                <Route path={`${ROUTES.BLOG}/:slug`} element={<Blog />} />
                <Route
                  path={ROUTES.CREATEPOST}
                  element={
                    <PrivateRoute>
                      <CreatePost />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </section>
          </React.Fragment>
        </React.Suspense>
      </Provider>
    </ThemeProvider>
  );
}
