import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BookIcon from '@mui/icons-material/Book';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedIcon from '@mui/icons-material/Verified';
import { clearBlog } from '../../../reducers/blog';
import { logoutUser } from '../../../reducers/auth';
import { useAppDispatch } from '../../../utils/reduxHooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { AWS_BASEURL } from '../../../utils/consts';
import { useAuth } from '../../../utils/hooks';
import { stringAvatar } from '../../../utils/utils';

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user, isLoading } = useAuth();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Don't render if user data is not loaded yet
  if (isLoading) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = (navigateTo?: string) => {
    if (navigateTo) {
      navigate(navigateTo);
    }
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    setAnchorEl(null);
    
    // Use the logoutUser thunk which handles everything
    await dispatch(logoutUser({ navigate }));
  };

  const handleCreatePost = () => {
    dispatch(clearBlog());
    navigate(ROUTES.CREATEPOST);
    setAnchorEl(null);
  };

  // Menu items configuration for easy reuse
  const menuItems = [
    {
      label: 'Profile',
      icon: <AccountCircleIcon fontSize="small" />,
      onClick: () => handleClose(ROUTES.PROFILE),
    },
    {
      label: 'New Post',
      icon: <BookIcon fontSize="small" />,
      onClick: handleCreatePost,
    },
    {
      label: 'Dashboard',
      icon: <Settings fontSize="small" />,
      onClick: () => handleClose(ROUTES.DASHBOARD),
    },
  ];

  // User info section component
  const UserInfoSection = () => (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Avatar
        {...stringAvatar(user.name!)}
        sx={{
          width: 64,
          height: 64,
          fontSize: '1.5rem',
          border: '3px solid',
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.overlay.black.light}`,
        }}
      />
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user.name}
          </Typography>
          {user.isEmailVerified && (
            <Tooltip title="Verified Account">
              <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', mt: 0.5 }}>
          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Desktop Menu Content
  const DesktopMenuContent = () => (
    <>
      {/* Compact Header with Gradient */}
      <Box
        sx={{
          background: (theme) => theme.palette.customColors.gradients.primary,
          borderRadius: '8px 8px 0 0',
          pt: 2.5,
          pb: 2,
          px: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            {...stringAvatar(user.name!)}
            sx={{
              width: 56,
              height: 56,
              fontSize: '1.25rem',
              border: '2px solid',
              borderColor: 'common.white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          />
          <Box sx={{ flex: 1, color: 'common.white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {user.name}
              </Typography>
              {user.isEmailVerified && (
                <Tooltip title="Verified Account">
                  <VerifiedIcon sx={{ fontSize: 16 }} />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <EmailIcon sx={{ fontSize: 12, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ py: 1 }}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={item.onClick}
            sx={{
              py: 1.5,
              px: 2.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ transition: 'color 0.2s ease' }}>
              {item.icon}
            </ListItemIcon>
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2.5,
            color: 'error.main',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'error.contrastText',
              transform: 'translateX(4px)',
              '& .MuiListItemIcon-root': {
                color: 'error.contrastText',
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', transition: 'color 0.2s ease' }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Box>
    </>
  );

  // Mobile Bottom Sheet Content
  const MobileBottomSheetContent = () => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '16px 16px 0 0',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drag Handle */}
      <Box
        sx={{
          pt: 1.5,
          pb: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: 'divider',
            borderRadius: 2,
          }}
        />
      </Box>

      {/* User Info Card */}
      <Box
        sx={{
          mx: 2,
          mb: 2,
          p: 2,
          borderRadius: 2,
          background: (theme) => theme.palette.customColors.gradients.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          {...stringAvatar(user.name!)}
          sx={{
            width: 56,
            height: 56,
            fontSize: '1.25rem',
            border: '2px solid',
            borderColor: 'common.white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        />
        <Box sx={{ flex: 1, color: 'common.white', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            {user.isEmailVerified && (
              <VerifiedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
            <EmailIcon sx={{ fontSize: 12, opacity: 0.9, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items Grid */}
      <Box sx={{ px: 2, pb: 2 }}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={item.onClick}
            sx={{
              py: 2,
              px: 2,
              mb: 1,
              borderRadius: 2,
              bgcolor: 'action.hover',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.selected',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                  transform: 'scale(1.1)',
                },
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <ListItemIcon sx={{ transition: 'all 0.2s ease', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <Typography variant="body1" fontWeight={500}>
              {item.label}
            </Typography>
          </MenuItem>
        ))}

        {/* Logout Button */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 2,
            px: 2,
            mt: 1,
            borderRadius: 2,
            bgcolor: 'action.hover',
            color: 'error.main',
            border: 1,
            borderColor: 'error.main',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'error.contrastText',
              '& .MuiListItemIcon-root': {
                color: 'error.contrastText',
                transform: 'scale(1.1)',
              },
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', transition: 'all 0.2s ease', minWidth: 40 }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1" fontWeight={600}>
            Logout
          </Typography>
        </MenuItem>
      </Box>

      {/* Safe area for bottom notch */}
      <Box sx={{ pb: 'env(safe-area-inset-bottom, 0)' }} />
    </Box>
  );

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              ml: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar
              {...stringAvatar(user.name!)}
              sx={{
                border: '2px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Desktop Menu */}
      {!isMobile && (
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={() => handleClose()}
          PaperProps={{
            elevation: 8,
            sx: {
              overflow: 'visible',
              filter: (theme) => `drop-shadow(0px 4px 16px ${theme.palette.customColors.overlay.black.medium})`,
              mt: 1.5,
              minWidth: 300,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 12,
                height: 12,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
              borderRadius: '8px',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <DesktopMenuContent />
        </Menu>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={open}
          onClose={() => handleClose()}
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
            },
          }}
          slotProps={{
            backdrop: {
              sx: {
                bgcolor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          }}
        >
          <MobileBottomSheetContent />
        </Drawer>
      )}
    </React.Fragment>
  );
}
