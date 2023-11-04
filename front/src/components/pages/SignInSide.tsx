import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { register, RegisterData, login, LoginData } from '../../actions/auth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/routing/routes';
import { useAppDispatch } from '../../utils/reduxHooks';

export default function SignInSide() {
  let [signUp, setSignUp] = React.useState(true);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (signUp) {
      dispatch(
        register(
          {
            name: data.get('firstName') + ' ' + data.get('lastName'),
            email: data.get('email') as string,
            password: data.get('password') as string,
          } as RegisterData,
          () => navigate(ROUTES.ROOT),
        ),
      );
    } else {
      dispatch(
        login(
          {
            email: data.get('email') as string,
            password: data.get('password') as string,
          } as LoginData,
          () => navigate(ROUTES.ROOT),
        ),
      );
    }
  };

  const handleSignUp = () => {
    setSignUp(!signUp);
  };

  return (
      <Grid container component="main" sx={{ height: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/daily)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {signUp ? 'Sign up' : 'Sign in'}
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                {signUp ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        autoComplete="given-name"
                        name="firstName"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        autoFocus
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                      />
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                <Grid item xs={12}>
                  <TextField required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  {signUp ? (
                    ''
                  ) : (
                    <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
                  )}
                </Grid>
              </Grid>
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                {signUp ? 'Sign up' : 'Sign in'}
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    {signUp ? '' : 'Forgot password?'}
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2" onClick={handleSignUp}>
                    {signUp ? 'Already have an account? Sign in' : "Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
  );
}
