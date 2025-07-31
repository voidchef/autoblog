import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  AlertTitle,
  Container,
  Paper,
  Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (process.env.NODE_ENV === 'production') {
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Stack spacing={3} alignItems="center">
              <BugReportIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'error.main',
                  mb: 2,
                }} 
              />
              
              <Typography variant="h4" component="h1" gutterBottom>
                Oops! Something went wrong
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ maxWidth: 600 }}
              >
                We're sorry for the inconvenience. An unexpected error has occurred. 
                Our team has been notified and is working to fix the issue.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  size="large"
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={this.handleReload}
                  size="large"
                >
                  Reload Page
                </Button>
              </Stack>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 4, 
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <AlertTitle>Error Details (Development Only)</AlertTitle>
                  <Box component="pre" sx={{ 
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    maxHeight: 300,
                    fontFamily: 'monospace',
                  }}>
                    <strong>Error:</strong> {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        <br /><br />
                        <strong>Stack trace:</strong>
                        <br />
                        {this.state.error.stack}
                      </>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <br /><br />
                        <strong>Component stack:</strong>
                        <br />
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </Box>
                </Alert>
              )}
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    console.error('Error handled by useErrorHandler:', error);
    
    throw error; // Re-throw to trigger error boundary
  };
};

export default ErrorBoundary;
