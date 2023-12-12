import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

const yearFormatter = (date: Date) => date.getDate().toString();

export default function ViewsGraph({ blogViews, monthDays }: { blogViews: number[]; monthDays: Array<Date> }) {
  const lineChartsParams = {
    series: [
      {
        id: 'visits',
        data: blogViews,
        showMark: false,
        area: true,
        color: 'rgba(66, 47, 138, 0.87)',
      },
    ],
  };

  return (
    <LineChart
      {...lineChartsParams}
      sx={{
        '& .MuiLineElement-root': {
          strokeWidth: 3,
        },
        '& .MuiAreaElement-series-visits': {
          fill: "url('#myGradient')",
        },
        '& .MuiChartsAxis-line': {
          display: 'none',
        },
        '& .MuiChartsAxis-ticks': {
          display: 'none',
        },
      }}
      xAxis={[{ data: monthDays, scaleType: 'time', valueFormatter: yearFormatter }]}
      series={lineChartsParams.series.map((s) => ({
        ...s,
      }))}
    >
      <defs>
        <linearGradient id="myGradient" x1="601.133" y1="0.86377" x2="601.133" y2="765.878" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7459D9" stopOpacity="0.2" />
          <stop offset="0.998978" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </LineChart>
  );
}
