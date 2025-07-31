import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Account from './Account';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { useAuth } from '../../../utils/hooks';
import DarkMode from './DarkMode';
import useScrollTrigger from '@mui/material/useScrollTrigger';

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  children?: any;
  window?: () => Window;
}

const drawerWidth = 240;
const navItems = ['Home', 'Blog', 'About Us', 'Contact Us'];

export default function DrawerAppBar(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleNavigation = (destination: string) => {
    switch (destination) {
      case 'Home':
        navigate(ROUTES.ROOT);
        break;
      case 'Blog':
        navigate(ROUTES.ALLPOSTS);
        break;
      case 'About Us':
        navigate(ROUTES.ABOUTUS);
        break;
      case 'Contact Us':
        navigate(ROUTES.CONTACTUS);
        break;
      case 'Log In':
        navigate(ROUTES.LOGIN);
        break;
      default:
        break;
    }
  };

  function ElevationScroll(props: Props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
      disableHysteresis: true,
      threshold: 0,
      target: window ? window() : undefined,
    });

    return React.cloneElement(children, {
      elevation: trigger ? 2 : 0,
      sx: {
        backgroundColor: trigger ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: trigger ? 'blur(5px)' : 'blur(0px)',
        transition: '0.3s',
      },
    });
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }} onClick={() => navigate(ROUTES.ROOT)}>
        AUTOBLOG
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => handleNavigation(item)}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
        <DarkMode />
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex', my: 2 }}>
      <ElevationScroll {...props}>
        <AppBar component="nav" color="transparent" elevation={0}>
          <Toolbar>
            <Box width={'100%'} display={{ sm: 'none', xs: 'flex' }} justifyContent={'space-between'}>
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              {isAuthenticated ? (
                <Account />
              ) : (
                <Button
                  variant={'contained'}
                  sx={{ backgroundColor: '#320D9A', color: 'white' }}
                  onClick={() => handleNavigation('Log In')}
                >
                  Log In
                </Button>
              )}
            </Box>
            <Typography
              variant="h6"
              component="div"
              color={'primary'}
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
              onClick={() => navigate(ROUTES.ROOT)}
            >
              AUTOBLOG
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
              <DarkMode />
              {navItems.map((item) => (
                <Button key={item} variant={'text'} sx={{ color: '#320D9A' }} onClick={() => handleNavigation(item)}>
                  {item}
                </Button>
              ))}
              {isAuthenticated ? (
                <Account />
              ) : (
                <Button
                  variant={'contained'}
                  sx={{ backgroundColor: '#320D9A', color: 'white' }}
                  onClick={() => handleNavigation('Log In')}
                >
                  Log In
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
