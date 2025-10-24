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
        showMark: ({ index }: { index: number }) => index % 3 === 0 || index === blogViews.length - 1,
        area: true,
        color: isDarkMode ? '#667eea' : '#1d4ed8',
        curve: 'catmullRom' as const,
      },
    ],
  };

  return (
    <LineChart
      {...lineChartsParams}
      sx={{
        '& .MuiLineElement-root': {
          strokeWidth: 2.5,
          filter: 'drop-shadow(0 2px 6px rgba(102, 126, 234, 0.25))',
        },
        '& .MuiAreaElement-series-visits': {
          fill: "url('#visitsGradient')",
        },
        '& .MuiChartsAxis-line': {
          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          strokeWidth: 1,
        },
        '& .MuiChartsAxis-tick': {
          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        '& .MuiChartsAxis-tickLabel': {
          fill: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          fontSize: '0.75rem',
          fontWeight: 500,
        },
        '& .MuiChartsAxis-label': {
          fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          fontSize: '0.8125rem',
          fontWeight: 600,
        },
        '& .MuiMarkElement-root': {
          fill: isDarkMode ? '#667eea' : '#1d4ed8',
          stroke: isDarkMode ? '#0f172a' : '#ffffff',
          strokeWidth: 2,
          r: 4,
          transition: 'all 0.2s ease',
          '&:hover': {
            r: 6,
            stroke: isDarkMode ? '#667eea' : '#1d4ed8',
            fill: '#ffffff',
          },
        },
        '& .MuiChartsGrid-line': {
          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
          strokeDasharray: '3 3',
        },
      }}
      xAxis={[{ 
        data: monthDays, 
        scaleType: 'time', 
        valueFormatter: yearFormatter,
        tickLabelStyle: {
          fontSize: 11,
          fontWeight: 500,
        },
      }]}
      yAxis={[{
        tickLabelStyle: {
          fontSize: 11,
          fontWeight: 500,
        },
      }]}
      margin={{ top: 10, right: 20, bottom: 30, left: 50 }}
      grid={{ vertical: false, horizontal: true }}
      series={lineChartsParams.series.map((s) => ({
        ...s,
      }))}
    >
      <defs>
        <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDarkMode ? '#667eea' : '#1d4ed8'} stopOpacity="0.3" />
          <stop offset="50%" stopColor={isDarkMode ? '#764ba2' : '#7c3aed'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={isDarkMode ? '#1e293b' : '#ffffff'} stopOpacity="0" />
        </linearGradient>
      </defs>
    </LineChart>
  );
}
