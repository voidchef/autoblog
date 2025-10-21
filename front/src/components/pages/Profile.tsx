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
  Paper,
  Stack,
  Tooltip,
  Badge,
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
  Edit as EditIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Link as LinkIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import PasswordStrength from '../elements/Common/PasswordStrength';
import ConfirmationDialog from '../elements/Common/ConfirmationDialog';
import { useAuth } from '../../utils/hooks';
import { useAppDispatch } from '../../utils/reduxHooks';
import { useUpdateUserMutation } from '../../services/userApi';
import { showSuccess, showError } from '../../reducers/alert';
import { stringAvatar as baseStringAvatar } from '../../utils/utils';
import { updateUserDataOptimistic } from '../../reducers/user';
import { encrypt } from '../../utils/crypto';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  password: string;
  confirmPassword: string;
  openAiKey: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    github: string;
    website: string;
  };
}

interface FormErrors {
  name?: string;
  email?: string;
  bio?: string;
  password?: string;
  confirmPassword?: string;
  openAiKey?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading: userLoading } = useAuth();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();

  const [formData, setFormData] = React.useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    password: '',
    confirmPassword: '',
    openAiKey: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: '',
      website: '',
    },
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
        bio: user.bio || '',
        password: '',
        confirmPassword: '',
        openAiKey: '', // Always show empty field for security
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          website: user.socialLinks?.website || '',
        },
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

    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    // URL validation helper
    const isValidUrl = (url: string) => {
      if (!url) return true; // Empty is valid
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Social links validation
    if (formData.socialLinks.twitter && !isValidUrl(formData.socialLinks.twitter)) {
      newErrors.twitter = 'Please enter a valid URL';
    }
    if (formData.socialLinks.linkedin && !isValidUrl(formData.socialLinks.linkedin)) {
      newErrors.linkedin = 'Please enter a valid URL';
    }
    if (formData.socialLinks.github && !isValidUrl(formData.socialLinks.github)) {
      newErrors.github = 'Please enter a valid URL';
    }
    if (formData.socialLinks.website && !isValidUrl(formData.socialLinks.website)) {
      newErrors.website = 'Please enter a valid URL';
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

  const handleInputChange = (field: keyof ProfileFormData | string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle nested socialLinks fields
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1] as keyof ProfileFormData['socialLinks'];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: event.target.value,
        },
      }));
      // Clear error when user starts typing
      if (errors[socialField as keyof FormErrors]) {
        setErrors((prev) => ({
          ...prev,
          [socialField]: undefined,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Clear error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
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

      if (formData.bio !== (user.bio || '')) {
        updateData.bio = formData.bio;
      }

      // Check if social links changed
      const socialLinksChanged =
        formData.socialLinks.twitter !== (user.socialLinks?.twitter || '') ||
        formData.socialLinks.linkedin !== (user.socialLinks?.linkedin || '') ||
        formData.socialLinks.github !== (user.socialLinks?.github || '') ||
        formData.socialLinks.website !== (user.socialLinks?.website || '');

      if (socialLinksChanged) {
        updateData.socialLinks = formData.socialLinks;
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
      bio: formData.bio,
      socialLinks: formData.socialLinks,
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
        bio: user.bio || '',
        password: '',
        confirmPassword: '',
        openAiKey: '', // Always reset to empty for security
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          website: user.socialLinks?.website || '',
        },
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  // Custom avatar with larger size for profile page
  const profileAvatar = (name: string) => {
    const baseAvatar = baseStringAvatar(name);
    return {
      ...baseAvatar,
      sx: {
        ...baseAvatar.sx,
        width: { xs: 80, sm: 100, md: 120 },
        height: { xs: 80, sm: 100, md: 120 },
        fontSize: { xs: '2rem', sm: '2.5rem', md: '2.5rem' },
      },
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
      <Box
        sx={{
          background: (theme) => theme.palette.customColors.gradients.badgeLight,
          minHeight: '100vh',
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 0 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header Section */}
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, textAlign: 'center', px: { xs: 1, sm: 0 } }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                background: (theme) => theme.palette.customColors.gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: { xs: 0.5, md: 1 },
              }}
            >
              Profile Settings
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
            >
              Manage your account information and preferences
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column - Profile Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  position: { xs: 'static', md: 'sticky' },
                  top: { xs: 'auto', md: 80 },
                  overflow: 'hidden',
                  boxShadow: { xs: '0 4px 16px rgba(0, 0, 0, 0.06)', md: '0 8px 32px rgba(0, 0, 0, 0.08)' },
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  mb: { xs: 2, md: 0 },
                  '&:hover': {
                    transform: { xs: 'none', md: 'translateY(-4px)' },
                    boxShadow: { xs: '0 4px 16px rgba(0, 0, 0, 0.06)', md: '0 12px 48px rgba(0, 0, 0, 0.12)' },
                  },
                }}
              >
                {/* Header with gradient background */}
                <Box
                  sx={{
                    background: (theme) => theme.palette.customColors.gradients.primary,
                    height: { xs: 100, sm: 120 },
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, 0%)',
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        user.isEmailVerified ? (
                          <CheckCircleIcon
                            sx={{
                              bgcolor: 'success.main',
                              borderRadius: '50%',
                              color: 'white',
                              p: 0.3,
                              fontSize: { xs: 22, sm: 28 },
                            }}
                          />
                        ) : null
                      }
                    >
                      <Avatar
                        {...profileAvatar(formData.name || 'User')}
                        sx={{
                          width: { xs: 80, sm: 100 },
                          height: { xs: 80, sm: 100 },
                          fontSize: { xs: '2rem', sm: '2.5rem' },
                          border: { xs: '3px solid white', sm: '4px solid white' },
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      />
                    </Badge>
                  </Box>
                </Box>

                <CardContent sx={{ pt: { xs: 6, sm: 7 }, pb: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                  >
                    {formData.name || 'User'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom 
                    sx={{ 
                      mb: 2,
                      fontSize: { xs: '0.813rem', sm: '0.875rem' },
                      wordBreak: 'break-word',
                    }}
                  >
                    {formData.email}
                  </Typography>

                  <Stack 
                    direction="row" 
                    spacing={1} 
                    justifyContent="center" 
                    sx={{ 
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={user.role === 'admin' ? 'Administrator' : 'User'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                    <Chip
                      icon={user.isEmailVerified ? <CheckCircleIcon /> : <WarningIcon />}
                      label={user.isEmailVerified ? 'Verified' : 'Not Verified'}
                      color={user.isEmailVerified ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                  </Stack>

                  {formData.bio && !isEditing && (
                    <>
                      <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          textAlign: 'left',
                          bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
                          borderRadius: 2,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <InfoIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                          <Typography 
                            variant="subtitle2" 
                            color="primary" 
                            fontWeight={600}
                            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                          >
                            Bio
                          </Typography>
                        </Stack>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: 1.6,
                            fontSize: { xs: '0.813rem', sm: '0.875rem' },
                          }}
                        >
                          {formData.bio}
                        </Typography>
                      </Paper>
                    </>
                  )}

                  {!isEditing &&
                    (formData.socialLinks.twitter ||
                      formData.socialLinks.linkedin ||
                      formData.socialLinks.github ||
                      formData.socialLinks.website) && (
                      <>
                        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            textAlign: 'left',
                            bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
                            borderRadius: 2,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <LinkIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                            <Typography 
                              variant="subtitle2" 
                              color="primary" 
                              fontWeight={600}
                              sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                            >
                              Social Links
                            </Typography>
                          </Stack>
                          <Stack spacing={1}>
                            {formData.socialLinks.twitter && (
                              <Tooltip title="Visit Twitter Profile" placement="right">
                                <Button
                                  startIcon={<TwitterIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                  href={formData.socialLinks.twitter}
                                  target="_blank"
                                  size="small"
                                  fullWidth
                                  variant="outlined"
                                  sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                    py: { xs: 0.75, sm: 1 },
                                    minHeight: { xs: '40px', sm: '44px' },
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  Twitter
                                </Button>
                              </Tooltip>
                            )}
                            {formData.socialLinks.linkedin && (
                              <Tooltip title="Visit LinkedIn Profile" placement="right">
                                <Button
                                  startIcon={<LinkedInIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                  href={formData.socialLinks.linkedin}
                                  target="_blank"
                                  size="small"
                                  fullWidth
                                  variant="outlined"
                                  sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                    py: { xs: 0.75, sm: 1 },
                                    minHeight: { xs: '40px', sm: '44px' },
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  LinkedIn
                                </Button>
                              </Tooltip>
                            )}
                            {formData.socialLinks.github && (
                              <Tooltip title="Visit GitHub Profile" placement="right">
                                <Button
                                  startIcon={<GitHubIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                  href={formData.socialLinks.github}
                                  target="_blank"
                                  size="small"
                                  fullWidth
                                  variant="outlined"
                                  sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                    py: { xs: 0.75, sm: 1 },
                                    minHeight: { xs: '40px', sm: '44px' },
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  GitHub
                                </Button>
                              </Tooltip>
                            )}
                            {formData.socialLinks.website && (
                              <Tooltip title="Visit Website" placement="right">
                                <Button
                                  startIcon={<LanguageIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                  href={formData.socialLinks.website}
                                  target="_blank"
                                  size="small"
                                  fullWidth
                                  variant="outlined"
                                  sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                    py: { xs: 0.75, sm: 1 },
                                    minHeight: { xs: '40px', sm: '44px' },
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  Website
                                </Button>
                              </Tooltip>
                            )}
                          </Stack>
                        </Paper>
                      </>
                    )}

                  {user.updatedAt && (
                    <>
                      <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        Last updated:{' '}
                        {new Date(user.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Edit Form */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  boxShadow: { xs: '0 4px 16px rgba(0, 0, 0, 0.06)', md: '0 8px 32px rgba(0, 0, 0, 0.08)' },
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Box 
                    display="flex" 
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    mb={{ xs: 2, md: 3 }}
                    gap={{ xs: 1.5, sm: 0 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <AccountCircleIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'primary.main' }} />
                      <Typography 
                        variant="h5" 
                        component="h3" 
                        fontWeight={600}
                        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                      >
                        Profile Information
                      </Typography>
                    </Stack>
                    {!isEditing && (
                      <Button
                        variant="contained"
                        onClick={() => setIsEditing(true)}
                        startIcon={<EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                        fullWidth={false}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          px: { xs: 2, sm: 3 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          minHeight: { xs: '40px', sm: '44px' },
                          background: (theme) => theme.palette.customColors.gradients.primary,
                          '&:hover': {
                            background: (theme) => theme.palette.customColors.gradients.primaryDark,
                          },
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      {/* Basic Information Section */}
                      <Grid size={12}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 2, sm: 2.5 },
                            bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: (theme) => theme.palette.customColors.borders.primaryLight,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                            <PersonIcon sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
                            <Typography 
                              variant="h6" 
                              fontWeight={600} 
                              color="primary"
                              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                              Basic Information
                            </Typography>
                          </Stack>
                          <Grid container spacing={2}>
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
                                      <PersonIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
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
                                      <EmailIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />
                            </Grid>

                            {/* Bio Field */}
                            <Grid size={12}>
                              <TextField
                                fullWidth
                                label="Bio"
                                multiline
                                rows={4}
                                value={formData.bio}
                                onChange={handleInputChange('bio')}
                                error={!!errors.bio}
                                helperText={errors.bio || `${formData.bio.length}/500 characters`}
                                disabled={!isEditing}
                                placeholder="Tell us about yourself..."
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                      <InfoIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Social Links Section */}
                      <Grid size={12}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 2, sm: 2.5 },
                            bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: (theme) => theme.palette.customColors.borders.primaryLight,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                            <LinkIcon sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
                            <Typography 
                              variant="h6" 
                              fontWeight={600} 
                              color="primary"
                              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                              Social Links
                            </Typography>
                          </Stack>
                          <Grid container spacing={2}>
                            {/* Twitter */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Twitter URL"
                                value={formData.socialLinks.twitter}
                                onChange={handleInputChange('socialLinks.twitter')}
                                error={!!errors.twitter}
                                helperText={errors.twitter}
                                disabled={!isEditing}
                                placeholder="https://twitter.com/username"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <TwitterIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />
                            </Grid>

                            {/* LinkedIn */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="LinkedIn URL"
                                value={formData.socialLinks.linkedin}
                                onChange={handleInputChange('socialLinks.linkedin')}
                                error={!!errors.linkedin}
                                helperText={errors.linkedin}
                                disabled={!isEditing}
                                placeholder="https://linkedin.com/in/username"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LinkedInIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />
                            </Grid>

                            {/* GitHub */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="GitHub URL"
                                value={formData.socialLinks.github}
                                onChange={handleInputChange('socialLinks.github')}
                                error={!!errors.github}
                                helperText={errors.github}
                                disabled={!isEditing}
                                placeholder="https://github.com/username"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <GitHubIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />
                            </Grid>

                            {/* Website */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Website URL"
                                value={formData.socialLinks.website}
                                onChange={handleInputChange('socialLinks.website')}
                                error={!!errors.website}
                                helperText={errors.website}
                                disabled={!isEditing}
                                placeholder="https://yourwebsite.com"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LanguageIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Security Section */}
                      <Grid size={12}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 2, sm: 2.5 },
                            bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: (theme) => theme.palette.customColors.borders.primaryLight,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                            <SecurityIcon sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
                            <Typography 
                              variant="h6" 
                              fontWeight={600} 
                              color="primary"
                              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                              Security & API Keys
                            </Typography>
                          </Stack>
                          <Grid container spacing={2}>
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
                                      <KeyIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        disabled={!isEditing}
                                        size="small"
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
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
                                      <KeyIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                        disabled={!isEditing || !formData.password}
                                        size="small"
                                      >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />
                            </Grid>

                            {/* OpenAI API Key Field */}
                            <Grid size={12}>
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
                                      : 'No API key set - required for blog generation')
                                }
                                disabled={!isEditing}
                                placeholder={isEditing ? 'Enter new API key...' : ''}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <KeyIcon color="action" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                                        edge="end"
                                        disabled={!isEditing}
                                        size="small"
                                      >
                                        {showOpenAiKey ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                  },
                                  '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  },
                                }}
                              />

                              {/* API Key Status Indicator */}
                              {!isEditing && (
                                <Box mt={1.5} display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    icon={user?.hasOpenAiKey ? <CheckCircleIcon /> : <WarningIcon />}
                                    label={user?.hasOpenAiKey ? 'API Key Configured' : 'API Key Required'}
                                    color={user?.hasOpenAiKey ? 'success' : 'warning'}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  />
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Action Buttons */}
                      {isEditing && (
                        <Grid size={12}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: { xs: 1.5, sm: 2 },
                              bgcolor: (theme) => theme.palette.customColors.gradients.badgeLight,
                              borderRadius: 2,
                            }}
                          >
                            <Stack 
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={2} 
                              justifyContent="flex-end"
                            >
                              <Button
                                variant="outlined"
                                onClick={handleCancel}
                                startIcon={<CancelIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                disabled={updateLoading}
                                fullWidth={true}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  px: { xs: 2, sm: 3 },
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  minHeight: { xs: '44px', sm: '48px' },
                                  order: { xs: 2, sm: 1 },
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                variant="contained"
                                startIcon={updateLoading ? <CircularProgress size={20} /> : <SaveIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                disabled={updateLoading}
                                fullWidth={true}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  px: { xs: 2, sm: 3 },
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  minHeight: { xs: '44px', sm: '48px' },
                                  order: { xs: 1, sm: 2 },
                                  background: (theme) => theme.palette.customColors.gradients.primary,
                                  '&:hover': {
                                    background: (theme) => theme.palette.customColors.gradients.primaryDark,
                                  },
                                }}
                              >
                                {updateLoading ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </Stack>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
      </Box>
      <Footer />
    </>
  );
};

export default Profile;
