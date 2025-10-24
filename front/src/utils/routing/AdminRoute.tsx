import * as React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import Loading from '../../components/elements/Common/Loading';
import { useAuth } from '../hooks';

type AdminRouteProps = {
  children: React.ReactNode;
};

/**
 * A component that renders its children only if the user is authenticated and is an admin,
 * otherwise it redirects to the dashboard or shows an access denied message.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  if (isLoading) {
    return (
      <Container sx={{ height: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box width={{ xs: '60%', sm: '40%', md: '30%' }}>
          <Loading />
        </Box>
      </Container>
    );
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return (
      <Container sx={{ height: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page. Admin access required.
        </Typography>
      </Container>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
