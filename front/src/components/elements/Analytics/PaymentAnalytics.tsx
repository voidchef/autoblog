import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useGetPaymentAnalyticsQuery } from '../../../services/paymentApi';

const PaymentAnalytics: React.FC = () => {
  const theme = useTheme();
  const COLORS = theme.palette.customColors.charts.primary;
  const { data, isLoading, error } = useGetPaymentAnalyticsQuery({});

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Failed to load payment analytics. Please try again later.
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const { overview, revenueByPlan, monthlyRevenue, dailyRevenue } = data;

  // Format daily revenue for chart (last 30 days)
  const dailyChartData = dailyRevenue.map((item) => item.revenue);
  const dailyChartLabels = dailyRevenue.map((item) =>
    new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  // Format monthly revenue for chart
  const monthlyChartData = monthlyRevenue
    .map((item) => ({
      month: `${item.year}-${String(item.month).padStart(2, '0')}`,
      revenue: item.revenue,
      transactions: item.transactions,
    }))
    .reverse();

  // Format revenue by plan for pie chart
  const planChartData = revenueByPlan.map((item, index) => ({
    id: index,
    value: item.revenue,
    label: item.plan.toUpperCase(),
  }));

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', boxShadow: theme.palette.customColors.componentShadows.cardHover }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600} sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}20`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ fontSize: 32, color }}>
              {icon}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={`₹${overview.totalRevenue.toFixed(2)}`}
            icon={<MoneyIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Transactions"
            value={overview.totalTransactions}
            icon={<ReceiptIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Subscriptions"
            value={overview.activeSubscriptions}
            icon={<PeopleIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Avg Transaction"
            value={`₹${overview.avgTransactionValue.toFixed(2)}`}
            icon={<TrendingUpIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Daily Revenue Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.palette.customColors.componentShadows.cardHover }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Daily Revenue (Last 30 Days)
            </Typography>
            <LineChart
              height={300}
              series={[
                {
                  data: dailyChartData,
                  label: 'Revenue (₹)',
                  color: theme.palette.primary.main,
                },
              ]}
              xAxis={[{ scaleType: 'point', data: dailyChartLabels }]}
              sx={{ width: '100%' }}
            />
          </Paper>
        </Grid>

        {/* Revenue by Plan */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.palette.customColors.componentShadows.cardHover }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Revenue by Plan
            </Typography>
            <PieChart
              series={[
                {
                  data: planChartData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                },
              ]}
              height={300}
              sx={{ width: '100%' }}
            />
          </Paper>
        </Grid>

        {/* Monthly Revenue Trend */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.palette.customColors.componentShadows.cardHover }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Monthly Revenue & Transactions
            </Typography>
            <BarChart
              height={300}
              series={[
                {
                  data: monthlyChartData.map((item) => item.revenue),
                  label: 'Revenue (₹)',
                  id: 'revenue',
                  color: theme.palette.primary.main,
                },
                {
                  data: monthlyChartData.map((item) => item.transactions),
                  label: 'Transactions',
                  id: 'transactions',
                  color: theme.palette.secondary.main,
                },
              ]}
              xAxis={[{ scaleType: 'band', data: monthlyChartData.map((item) => item.month) }]}
              sx={{ width: '100%' }}
            />
          </Paper>
        </Grid>

        {/* Plan Statistics */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.palette.customColors.componentShadows.cardHover }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Plan Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {revenueByPlan.map((plan, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.plan}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: (theme) => theme.palette.customColors.borders.primaryLight,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {plan.plan.toUpperCase()} Plan
                    </Typography>
                    <Typography variant="h5" fontWeight={600} sx={{ mt: 1, color: COLORS[index % COLORS.length] }}>
                      ₹{plan.revenue.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {plan.count} transactions
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentAnalytics;
