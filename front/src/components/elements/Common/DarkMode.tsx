import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAppDispatch, useAppSelector } from '../../../utils/reduxHooks';
import { setThemeMode } from '../../../reducers/appSettings';

const StyledToggleButton = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 60,
  height: 32,
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
    : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(29, 78, 216, 0.2)'}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
    : '0 2px 8px rgba(29, 78, 216, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
      : '0 4px 12px rgba(29, 78, 216, 0.25)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const StyledThumb = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 6px rgba(245, 158, 11, 0.4)'
    : '0 2px 6px rgba(29, 78, 216, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  left: theme.palette.mode === 'dark' ? 'calc(100% - 26px)' : '2px',
}));

export default function DarkMode() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.appSettings.themeMode);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        dispatch(setThemeMode(newMode));
        localStorage.setItem('themeMode', newMode);
      },
    }),
    [themeMode, dispatch],
  );

  return (
    <Tooltip 
      title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      arrow
      placement="bottom"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StyledToggleButton onClick={colorMode.toggleColorMode}>
          <StyledThumb>
            {themeMode === 'dark' ? (
              <LightModeIcon 
                sx={{ 
                  fontSize: 14, 
                  color: 'white',
                  animation: 'spin 20s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }} 
              />
            ) : (
              <DarkModeIcon 
                sx={{ 
                  fontSize: 14, 
                  color: 'white',
                }} 
              />
            )}
          </StyledThumb>
        </StyledToggleButton>
      </Box>
    </Tooltip>
  );
}
