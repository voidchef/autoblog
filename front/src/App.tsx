import * as React from 'react';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import { Provider } from 'react-redux';
import { Routes } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';
import { Box } from '@mui/material';
import Loading from './components/elements/Loading/Loading';
import Alerts from './components/elements/Common/Alerts';

if (localStorage.tokens) {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '');
  setAuthToken(tokens.access.token);
}

export default function App() {
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
                {/* To Add */}
              </Routes>
            </section>
          </React.Fragment>
        </React.Suspense>
      </Provider>
    </ThemeProvider>
  );
}
