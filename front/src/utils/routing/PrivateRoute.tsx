import * as React from 'react';
import { Box, Container } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import Loading from '../../components/elements/Loading/Loading';
import { useAppSelector } from '../reduxHooks';

type PrivateRouteProps = {
  children: React.ReactNode;
};

/**
 * A component that renders its children only if the user is authenticated,
 * otherwise it redirects to the login page.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const loading = useAppSelector((state) => state.root.loading);

  if (isAuthenticated === false) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return loading ? (
    <Container sx={{ height: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box width={{ xs: '60%', sm: '40%', md: '30%' }}>
        <Loading />
      </Box>
    </Container>
  ) : (
    <>{children}</>
  );
};

export default PrivateRoute;
