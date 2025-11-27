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
        color: isDarkMode ? theme.palette.customColors.graph.primaryLine.dark : theme.palette.customColors.graph.primaryLine.light,
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
          stroke: isDarkMode ? theme.palette.customColors.overlay.white.veryLight : theme.palette.customColors.overlay.black.veryLight,
          strokeWidth: 1,
        },
        '& .MuiChartsAxis-tick': {
          stroke: isDarkMode ? theme.palette.customColors.overlay.white.veryLight : theme.palette.customColors.overlay.black.veryLight,
        },
        '& .MuiChartsAxis-tickLabel': {
          fill: isDarkMode ? theme.palette.customColors.overlay.white.medium : theme.palette.customColors.overlay.black.medium,
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          fontWeight: 500,
        },
        '& .MuiChartsAxis-label': {
          fill: isDarkMode ? theme.palette.customColors.overlay.white.strong : theme.palette.customColors.overlay.black.strong,
          fontSize: isMobile ? '0.75rem' : '0.8125rem',
          fontWeight: 600,
        },
        '& .MuiMarkElement-root': {
          fill: isDarkMode ? theme.palette.customColors.graph.primaryLine.dark : theme.palette.customColors.graph.primaryLine.light,
          stroke: isDarkMode ? theme.palette.customColors.graph.background.dark : theme.palette.customColors.graph.background.light,
          strokeWidth: 2,
          r: isMobile ? 3 : 4,
          transition: 'all 0.2s ease',
          '&:hover': {
            r: isMobile ? 5 : 6,
            stroke: isDarkMode ? theme.palette.customColors.graph.primaryLine.dark : theme.palette.customColors.graph.primaryLine.light,
            fill: theme.palette.customColors.graph.background.light,
          },
        },
        '& .MuiChartsGrid-line': {
          stroke: isDarkMode ? theme.palette.customColors.overlay.white.subtle : theme.palette.customColors.overlay.black.subtle,
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
          <stop offset="0%" stopColor={isDarkMode ? theme.palette.customColors.graph.primaryLine.dark : theme.palette.customColors.graph.primaryLine.light} stopOpacity="0.3" />
          <stop offset="50%" stopColor={isDarkMode ? theme.palette.customColors.graph.secondaryLine.dark : theme.palette.customColors.graph.secondaryLine.light} stopOpacity="0.15" />
          <stop offset="100%" stopColor={isDarkMode ? theme.palette.customColors.bgDark.tertiary : theme.palette.customColors.graph.background.light} stopOpacity="0" />
        </linearGradient>
      </defs>
    </LineChart>
  );
}
