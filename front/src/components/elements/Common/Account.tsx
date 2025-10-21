import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BookIcon from '@mui/icons-material/Book';
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
  const handleClose = (navigateTo: string) => {
    navigate(navigateTo);
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
  }

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar {...stringAvatar(user.name!)} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: (theme) => `drop-shadow(0px 2px 8px ${theme.palette.customColors.overlay.black.light})`,
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
            borderRadius: '0.5rem',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box bgcolor={(theme) => theme.palette.customColors.pageBackground.grayLight} width={'17rem'} height={'11rem'} marginTop={'-8px'}>
          <img
            src={`${AWS_BASEURL}/background.png`}
            alt="profile background"
            style={{ width: '100%', height: '100%', borderRadius: '0.5rem 0.5rem 0 0' }}
          />
        </Box>
        <MenuItem onClick={() => handleClose(ROUTES.PROFILE)}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleCreatePost}>
          <ListItemIcon>
            <BookIcon fontSize="small" />
          </ListItemIcon>
          New Post
        </MenuItem>
        <MenuItem onClick={() => handleClose(ROUTES.DASHBOARD)}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
