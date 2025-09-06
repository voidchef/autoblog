import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import PasswordStrength from '../elements/Common/PasswordStrength';
import ConfirmationDialog from '../elements/Common/ConfirmationDialog';
import { useAuth } from '../../utils/hooks';
import { useAppDispatch } from '../../utils/reduxHooks';
import { useUpdateUserMutation } from '../../services/userApi';
import { showSuccess, showError } from '../../reducers/alert';
import { updateUserDataOptimistic } from '../../reducers/user';
import { encrypt } from '../../utils/crypto';

interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  openAiKey: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  openAiKey?: string;
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading: userLoading } = useAuth();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();

  const [formData, setFormData] = React.useState<ProfileFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    openAiKey: '',
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingChanges, setPendingChanges] = React.useState<any>(null);

  // Initialize form data when user data is loaded
  React.useEffect(() => {
    if (user && user.id) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        openAiKey: '', // Always show empty field for security
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation (only if password is being changed)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one letter and one number';
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      dispatch(showError('User ID not found'));
      return;
    }

    try {
      // Prepare update data - only include fields that have changed
      const updateData: any = {
        id: user.id,
      };

      if (formData.name !== user.name) {
        updateData.name = formData.name;
      }

      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }

      if (formData.password) {
        updateData.password = formData.password;
      }

      if (formData.openAiKey) {
        // Encrypt the OpenAI key before sending to backend
        updateData.openAiKey = await encrypt(formData.openAiKey, user.id);
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 1) {
        dispatch(showError('No changes to save'));
        return;
      }

      // Check if email is being changed - require confirmation
      if (updateData.email && updateData.email !== user.email) {
        setPendingChanges(updateData);
        setShowConfirmDialog(true);
        return;
      }

      await performUpdate(updateData);
    } catch (error: any) {
      console.error('Profile update error:', error);
      dispatch(showError(error?.data?.message || 'Failed to update profile'));
    }
  };

  const performUpdate = async (updateData: any) => {
    // Optimistically update the user data
    const optimisticUpdate: any = {
      name: formData.name,
      email: formData.email,
    };

    // If OpenAI key was updated, set hasOpenAiKey flag
    if (formData.openAiKey) {
      optimisticUpdate.hasOpenAiKey = true;
    }

    dispatch(updateUserDataOptimistic(optimisticUpdate));

    const result = await updateUser(updateData).unwrap();

    dispatch(showSuccess('Profile updated successfully'));
    setIsEditing(false);

    // Clear password and API key fields
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
      openAiKey: '',
    }));
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmDialog(false);
    if (pendingChanges) {
      await performUpdate(pendingChanges);
      setPendingChanges(null);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
    setPendingChanges(null);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        openAiKey: '', // Always reset to empty for security
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const stringToColor = (string: string): string => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  };

  const stringAvatar = (name: string) => {
    const nameParts = name.split(' ');
    const initials = nameParts.length >= 2 ? `${nameParts[0][0]}${nameParts[1][0]}` : name.substring(0, 2);

    return {
      sx: {
        bgcolor: stringToColor(name),
        width: 80,
        height: 80,
        fontSize: '2rem',
      },
      children: initials.toUpperCase(),
    };
  };

  if (userLoading) {
    return (
      <>
        <NavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  if (!user?.id) {
    return (
      <>
        <NavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">User information not found. Please try logging in again.</Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Profile Settings
        </Typography>

        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Profile Header */}
            <Box display="flex" alignItems="center" mb={4}>
              <Avatar {...stringAvatar(formData.name || 'User')} />
              <Box ml={3}>
                <Typography variant="h5" component="h2">
                  {formData.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                </Typography>
                {user.updatedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(user.updatedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Profile Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Name Field */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Email Field */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Password Field */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={!!errors.password}
                    helperText={errors.password || 'Leave blank to keep current password'}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={!isEditing}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {isEditing && formData.password && <PasswordStrength password={formData.password} />}
                </Grid>

                {/* Confirm Password Field */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    disabled={!isEditing || !formData.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            disabled={!isEditing || !formData.password}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* OpenAI API Key Field */}
                <Grid size={12}>
                  <Box>
                    <TextField
                      fullWidth
                      label="OpenAI API Key"
                      type={showOpenAiKey ? 'text' : 'password'}
                      value={formData.openAiKey}
                      onChange={handleInputChange('openAiKey')}
                      error={!!errors.openAiKey}
                      helperText={
                        errors.openAiKey || 
                        (isEditing 
                          ? 'Enter a new OpenAI API key to update it' 
                          : user?.hasOpenAiKey 
                            ? 'API key is set (hidden for security)' 
                            : 'No API key set - required for blog generation'
                        )
                      }
                      disabled={!isEditing}
                      placeholder={isEditing ? 'Enter new API key...' : ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowOpenAiKey(!showOpenAiKey)} edge="end" disabled={!isEditing}>
                              {showOpenAiKey ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    {/* API Key Status Indicator */}
                    {!isEditing && (
                      <Box mt={1} display="flex" alignItems="center" gap={1}>
                        <Chip
                          icon={user?.hasOpenAiKey ? <CheckCircleIcon /> : <WarningIcon />}
                          label={user?.hasOpenAiKey ? 'API Key Configured' : 'API Key Required'}
                          color={user?.hasOpenAiKey ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Action Buttons */}
                <Grid size={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    {!isEditing ? (
                      <Button variant="contained" onClick={() => setIsEditing(true)} startIcon={<PersonIcon />}>
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          startIcon={<CancelIcon />}
                          disabled={updateLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={updateLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={updateLoading}
                        >
                          {updateLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={showConfirmDialog}
          title="Confirm Email Change"
          message={`Are you sure you want to change your email to "${formData.email}"? You may need to verify your new email address.`}
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
          confirmText="Change Email"
          confirmColor="warning"
        />
      </Container>
      <Footer />
    </>
  );
};

export default Profile;
