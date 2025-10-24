import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const yearFormatter = (date: Date) => date.getDate().toString();

export default function ViewsGraph({ blogViews, monthDays }: { blogViews: number[]; monthDays: Array<Date> }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const lineChartsParams = {
    series: [
      {
        id: 'visits',
        data: blogViews,
        showMark: ({ index }: { index: number }) => {
          if (isMobile) {
            return index % 5 === 0 || index === blogViews.length - 1;
          }
          return index % 3 === 0 || index === blogViews.length - 1;
        },
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
          strokeWidth: isMobile ? 2 : 2.5,
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
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          fontWeight: 500,
        },
        '& .MuiChartsAxis-label': {
          fill: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          fontSize: isMobile ? '0.75rem' : '0.8125rem',
          fontWeight: 600,
        },
        '& .MuiMarkElement-root': {
          fill: isDarkMode ? '#667eea' : '#1d4ed8',
          stroke: isDarkMode ? '#0f172a' : '#ffffff',
          strokeWidth: 2,
          r: isMobile ? 3 : 4,
          transition: 'all 0.2s ease',
          '&:hover': {
            r: isMobile ? 5 : 6,
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
          fontSize: isMobile ? 9 : 11,
          fontWeight: 500,
        },
      }]}
      yAxis={[{
        tickLabelStyle: {
          fontSize: isMobile ? 9 : 11,
          fontWeight: 500,
        },
      }]}
      margin={{ 
        top: 10, 
        right: isMobile ? 10 : 20, 
        bottom: isMobile ? 25 : 30, 
        left: isMobile ? 35 : 50 
      }}
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
