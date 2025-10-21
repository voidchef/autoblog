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
import { useAuth, useTheme } from '../../../utils/hooks';
import DarkMode from './DarkMode';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { AutoAwesome } from '@mui/icons-material';
import { Theme } from '@mui/material/styles';

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
  const { themeMode } = useTheme();

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

    const bgColor = themeMode === 'dark' 
      ? trigger ? (theme: Theme) => theme.palette.customColors.bgDark.tertiary + 'cc' : 'rgba(15, 23, 42, 0)'
      : trigger ? (theme: Theme) => theme.palette.customColors.overlay.white.almostOpaque : 'rgba(255, 255, 255, 0)';

    return React.cloneElement(children, {
      elevation: trigger ? 2 : 0,
      sx: {
        backgroundColor: bgColor,
        backdropFilter: trigger ? 'blur(12px)' : 'blur(0px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: trigger ? '1px solid' : 'none',
        borderColor: themeMode === 'dark' 
          ? (theme: Theme) => theme.palette.customColors.borders.primaryDark 
          : (theme: Theme) => theme.palette.customColors.borders.primaryLight,
      },
    });
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', height: '100%' }}>
      <Box 
        sx={{ 
          my: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1.5,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          }
        }} 
        onClick={() => navigate(ROUTES.ROOT)}
      >
        <Box
          sx={{
            background: (theme) => theme.palette.customColors.gradients.primary,
            borderRadius: '12px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.shadows.primary}`,
          }}
        >
          <AutoAwesome sx={{ color: 'white', fontSize: '1.5rem' }} />
        </Box>
        <Typography 
          variant="h6" 
          className="gradient-text"
          sx={{ 
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}
        >
          AUTOBLOG
        </Typography>
      </Box>
      <Divider sx={{ mx: 2, opacity: 0.3 }} />
      <List sx={{ px: 1 }}>
        {navItems.map((item, index) => (
          <ListItem key={item} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              sx={{ 
                textAlign: 'center',
                py: 1.5,
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(29, 78, 216, 0.15)' 
                    : 'rgba(29, 78, 216, 0.1)',
                  '& .MuiListItemText-primary': {
                    color: (theme) => theme.palette.mode === 'dark' 
                      ? theme.palette.primary.light 
                      : theme.palette.primary.dark,
                  }
                }
              }} 
              onClick={() => handleNavigation(item)}
            >
              <ListItemText 
                primary={item} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem sx={{ justifyContent: 'center', mt: 2 }}>
          <DarkMode />
        </ListItem>
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex'}}>
      <ElevationScroll {...props}>
        <AppBar component="nav" color="transparent" elevation={0}>
          <Toolbar sx={{ py: 1 }}>
            <Box width={'100%'} display={{ sm: 'none', xs: 'flex' }} justifyContent={'space-between'} alignItems={'center'}>
              <IconButton 
                color="primary" 
                aria-label="open drawer" 
                edge="start" 
                onClick={handleDrawerToggle} 
                sx={{ 
                  mr: 2,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              {isAuthenticated ? (
                <Account />
              ) : (
                <Button
                  variant={'contained'}
                  onClick={() => handleNavigation('Log In')}
                >
                  Log In
                </Button>
              )}
            </Box>
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', sm: 'flex' }, 
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
              onClick={() => navigate(ROUTES.ROOT)}
            >
              <Box
                sx={{
                  background: (theme) => theme.palette.customColors.gradients.primary,
                  borderRadius: '14px',
                  p: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => `0 4px 16px ${theme.palette.customColors.shadows.primary}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: (theme) => `0 6px 24px ${theme.palette.customColors.shadows.primaryHeavy}`,
                  }
                }}
              >
                <AutoAwesome sx={{ color: 'white', fontSize: '1.75rem' }} />
              </Box>
              <Typography
                variant="h5"
                component="div"
                className="gradient-text"
                sx={{ 
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                AUTOBLOG
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              <DarkMode />
              {navItems.map((item) => (
                <Button 
                  key={item} 
                  variant={'text'} 
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(29, 78, 216, 0.1)' 
                        : 'rgba(29, 78, 216, 0.08)',
                      color: (theme) => theme.palette.mode === 'dark' 
                        ? 'primary.light' 
                        : 'primary.dark',
                      transform: 'translateY(-2px)',
                    },
                  }} 
                  onClick={() => handleNavigation(item)}
                >
                  {item}
                </Button>
              ))}
              {isAuthenticated ? (
                <Box sx={{ ml: 1 }}>
                  <Account />
                </Box>
              ) : (
                <Button
                  variant={'contained'}
                  onClick={() => handleNavigation('Log In')}
                  sx={{ 
                    ml: 1,
                    px: 3,
                    py: 1.2,
                    background: (theme) => theme.palette.customColors.gradients.primary,
                    boxShadow: (theme) => `0 4px 16px ${theme.palette.customColors.shadows.primary}`,
                    '&:hover': {
                      background: (theme) => theme.palette.customColors.gradients.primaryDark,
                      boxShadow: (theme) => `0 6px 24px ${theme.palette.customColors.shadows.primaryHeavy}`,
                      transform: 'translateY(-2px)',
                    }
                  }}
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
