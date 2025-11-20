import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useGetPaymentHistoryQuery } from '../../services/paymentApi';

const OrderHistory: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { data, isLoading, error } = useGetPaymentHistoryQuery({
    page: page + 1,
    limit: rowsPerPage,
    sortBy: 'createdAt:desc',
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircleIcon fontSize="small" />;
      case 'failed':
        return <ErrorIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Failed to load order history. Please try again later.
      </Alert>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
          borderRadius: 2,
        }}
      >
        <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Order History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You haven't made any purchases yet.
        </Typography>
      </Paper>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        <Stack spacing={2}>
          {data.results.map((order) => (
            <Card
              key={order.id}
              sx={{
                boxShadow: theme.palette.customColors.componentShadows.card,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Order ID
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                      {order.razorpayOrderId.substring(0, 20)}...
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      {formatAmount(order.amount, order.currency)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Plan
                    </Typography>
                    <Chip label={order.plan.toUpperCase()} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(order.status)}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body2" fontSize="0.813rem">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
        <TablePagination
          component="div"
          count={data.totalResults}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: (theme) => theme.palette.customColors.borders.primaryLight,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
              }}
            >
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Order ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Date
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Plan
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Amount
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Status
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.results.map((order) => (
              <TableRow
                key={order.id}
                sx={{
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.action.hover,
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    sx={{
                      fontSize: '0.813rem',
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {order.razorpayOrderId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" fontFamily="monospace">
                    {order.razorpayPaymentId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={order.plan.toUpperCase()} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {formatAmount(order.amount, order.currency)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(order.status)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.totalResults}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ mt: 1 }}
      />
    </Box>
  );
};

export default OrderHistory;
