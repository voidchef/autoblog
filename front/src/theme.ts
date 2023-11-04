import createTheme from "@mui/material/styles/createTheme";
import { red } from '@mui/material/colors';

// Light mode theme
const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#320D9A',
    },
    secondary: {
      main: '#555FAC',
    },
    error: {
      main: red.A400,
    },
    mode: 'light',
  },
});

// Dark mode theme
const darkTheme = createTheme({
  palette: {
    primary: {
      main: '#320D9A',
    },
    secondary: {
      main: '#555FAC',
    },
    error: {
      main: red.A400,
    },
    mode: 'dark',
  },
});

export { lightTheme, darkTheme };
