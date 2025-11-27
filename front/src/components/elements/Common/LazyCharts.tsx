import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { lazy, Suspense } from 'react';

// Lazy load chart components to reduce initial bundle size
const PieChartLazy = lazy(() => 
  import('@mui/x-charts/PieChart').then(module => ({ default: module.PieChart }))
);

const BarChartLazy = lazy(() => 
  import('@mui/x-charts/BarChart').then(module => ({ default: module.BarChart }))
);

const LineChartLazy = lazy(() => 
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
  <Suspense fallback={<ChartLoading />}>
    <PieChartLazy {...props} />
  </Suspense>
);

export const BarChart = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <BarChartLazy {...props} />
  </Suspense>
);

export const LineChart = (props: any) => (
  <Suspense fallback={<ChartLoading />}>
    <LineChartLazy {...props} />
  </Suspense>
);
