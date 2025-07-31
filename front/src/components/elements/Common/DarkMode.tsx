import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAppDispatch, useAppSelector } from '../../../utils/reduxHooks';
import { setThemeMode } from '../../../reducers/appSettings';

export default function DarkMode() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.appSettings.themeMode);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        dispatch(setThemeMode(themeMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [themeMode],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        color: 'text.primary',
        borderRadius: 1,
      }}
    >
      {themeMode} mode
      <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
        {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Box>
  );
}
