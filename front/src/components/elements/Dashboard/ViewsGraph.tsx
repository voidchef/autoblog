import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

const yearFormatter = (date: Date) => date.getDate().toString();

export default function ViewsGraph({ blogViews, monthDays }: { blogViews: number[]; monthDays: Array<Date> }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const lineChartsParams = {
    series: [
      {
        id: 'visits',
        data: blogViews,
        showMark: ({ index }: { index: number }) => index === blogViews.length - 1,
        area: true,
        color: isDarkMode ? '#667eea' : '#1d4ed8',
        curve: 'natural' as const,
      },
    ],
  };

  return (
    <LineChart
      {...lineChartsParams}
      sx={{
        '& .MuiLineElement-root': {
          strokeWidth: 3,
          filter: 'drop-shadow(0 2px 8px rgba(102, 126, 234, 0.3))',
        },
        '& .MuiAreaElement-series-visits': {
          fill: "url('#visitsGradient')",
        },
        '& .MuiChartsAxis-line': {
          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          strokeWidth: 1,
        },
        '& .MuiChartsAxis-tick': {
          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        '& .MuiChartsAxis-tickLabel': {
          fill: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        '& .MuiChartsAxis-label': {
          fill: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          fontSize: '0.9375rem',
          fontWeight: 600,
          letterSpacing: '0.025em',
        },
        '& .MuiMarkElement-root': {
          fill: isDarkMode ? '#667eea' : '#1d4ed8',
          stroke: isDarkMode ? '#1e293b' : '#ffffff',
          strokeWidth: 3,
          r: 6,
          scale: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            r: 8,
            stroke: isDarkMode ? '#667eea' : '#1d4ed8',
            fill: '#ffffff',
          },
        },
        '& .MuiChartsGrid-line': {
          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          strokeDasharray: '4 4',
        },
      }}
      xAxis={[{ 
        data: monthDays, 
        scaleType: 'time', 
        valueFormatter: yearFormatter,
        label: 'Day of Month',
        tickLabelStyle: {
          fontSize: 12,
          fontWeight: 500,
        },
      }]}
      yAxis={[{
        label: 'Number of Views',
        tickLabelStyle: {
          fontSize: 12,
          fontWeight: 500,
        },
      }]}
      grid={{ vertical: true, horizontal: true }}
      series={lineChartsParams.series.map((s) => ({
        ...s,
      }))}
    >
      <defs>
        <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDarkMode ? '#667eea' : '#1d4ed8'} stopOpacity="0.4" />
          <stop offset="50%" stopColor={isDarkMode ? '#764ba2' : '#7c3aed'} stopOpacity="0.2" />
          <stop offset="100%" stopColor={isDarkMode ? '#1e293b' : '#ffffff'} stopOpacity="0" />
        </linearGradient>
      </defs>
    </LineChart>
  );
}
