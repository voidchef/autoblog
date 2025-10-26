import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Lazy load chart components to reduce initial bundle size
const PieChartLazy = React.lazy(() => 
  import('@mui/x-charts/PieChart').then(module => ({ default: module.PieChart }))
);

const BarChartLazy = React.lazy(() => 
  import('@mui/x-charts/BarChart').then(module => ({ default: module.BarChart }))
);

const LineChartLazy = React.lazy(() => 
  import('@mui/x-charts/LineChart').then(module => ({ default: module.LineChart }))
);

// Loading fallback for charts
const ChartLoading = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight={300}
  >
    <CircularProgress />
  </Box>
);

// Wrapped components with suspense
export const PieChart = (props: any) => (
  <React.Suspense fallback={<ChartLoading />}>
    <PieChartLazy {...props} />
  </React.Suspense>
);

export const BarChart = (props: any) => (
  <React.Suspense fallback={<ChartLoading />}>
    <BarChartLazy {...props} />
  </React.Suspense>
);

export const LineChart = (props: any) => (
  <React.Suspense fallback={<ChartLoading />}>
    <LineChartLazy {...props} />
  </React.Suspense>
);
