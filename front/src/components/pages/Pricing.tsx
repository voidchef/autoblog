import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SpeedIcon from '@mui/icons-material/Speed';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/hooks';
import { ROUTES } from '../../utils/routing/routes';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '../../services/paymentApi';

interface PricingFeature {
  text: string;
  included: boolean;
  icon?: React.ReactNode;
  highlight?: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular?: boolean;
  gradient: string;
}

export default function Pricing() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);

  const handleGetStarted = (tier: string) => {
    if (tier === 'free') {
      navigate(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN);
    } else {
      // For paid tier, initiate payment
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
        return;
      }
      handlePayment();
    }
  };

  const handlePayment = async () => {
    setPaymentError(null);
    setPaymentSuccess(false);

    try {
      // Create order on backend
      const order = await createOrder({
        amount: 29,
        currency: 'INR',
        plan: 'pro',
      }).unwrap();

      // Initialize Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'AutoBlog',
        description: 'Pro Plan Subscription',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();

            if (verificationResult.success) {
              setPaymentSuccess(true);
              setTimeout(() => {
                navigate(ROUTES.DASHBOARD);
              }, 2000);
            } else {
              setPaymentError('Payment verification failed. Please contact support.');
            }
          } catch (error: any) {
            setPaymentError(error?.data?.message || 'Payment verification failed. Please try again.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        notes: {
          userId: user?.id || '',
          plan: 'pro',
        },
        theme: {
          color: (theme.palette as any).customColors.payment.brandColor,
        },
        modal: {
          ondismiss: () => {
            setPaymentError(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setPaymentError(error?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      price: '0',
      period: 'Forever free',
      description: 'Perfect for getting started with AI-powered content creation',
      gradient: theme.palette.customColors.analytics.headerTextGradientDark,
      features: [
        { text: 'AI-powered blog generation', included: true },
        { text: 'SEO optimization', included: true },
        { text: 'Multi-language support', included: true },
        { text: 'Custom blog templates', included: true },
        { text: 'AI image generation', included: true },
        { text: 'Text-to-speech narration', included: true },
        { text: 'Reader comments & engagement', included: true },
        { text: 'Social media sharing', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Community support', included: true },
      ],
      buttonText: 'Start Free',
    },
    {
      name: 'Pro',
      price: '5',
      period: 'per month',
      description: 'Unlock the full power of AI content creation and analytics',
      popular: true,
      gradient: theme.palette.customColors.gradients.queryTypes,
      features: [
        { text: 'Everything in Free, plus:', included: true, highlight: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'Export to Medium', included: true },
        { text: 'Export to WordPress', included: true },
        { text: 'Regenerate text blocks with AI', included: true },
        { text: 'Priority support (24/7)', included: true },
        { text: 'Reader engagement metrics', included: true },
        { text: 'API access', included: true },
        { text: 'Early feature access', included: true },
      ],
      buttonText: 'Upgrade to Pro',
    },
  ];

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Helmet>
        <title>Pricing - AutoBlog</title>
        <meta
          name="description"
          content="Choose the perfect plan for your content creation needs. Start free or upgrade to Pro for advanced analytics and multi-platform publishing."
        />
        <meta name="keywords" content="pricing, plans, autoblog pricing, content creation pricing" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Animated Background Gradients */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: { xs: 300, md: 600 },
          height: { xs: 300, md: 600 },
          borderRadius: '50%',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: { xs: 250, md: 500 },
          height: { xs: 250, md: 500 },
          borderRadius: '50%',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          animation: 'float 25s ease-in-out infinite',
          animationDelay: '5s',
        }}
      />

      <NavBar />

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 1 }}>
        {/* Payment Status Alerts */}
        {paymentSuccess && (
          <Alert severity="success" sx={{ mb: 4 }}>
            Payment successful! Redirecting to dashboard...
          </Alert>
        )}
        {paymentError && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setPaymentError(null)}>
            {paymentError}
          </Alert>
        )}

        {/* Header */}
        <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 900,
              background: theme.palette.customColors.analytics.headerTextGradientDark,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Simple Pricing,
            <br />
            Powerful Results
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '650px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Start creating amazing content for free. Upgrade to Pro when you're ready for advanced analytics and multi-platform publishing.
          </Typography>
        </Stack>

        {/* Pricing Cards */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 10 }}>
          {pricingTiers.map((tier, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index} my={{ xs: 1, md: 0 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: (theme) =>
                    tier.popular
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(
                          theme.palette.secondary.main,
                          0.03
                        )} 100%)`
                      : theme.palette.background.paper,
                  overflow: 'hidden',
                  boxShadow: tier.popular
                    ? (theme) => `0 20px 60px ${alpha(theme.palette.primary.main, 0.2)}`
                    : (theme) => `0 10px 40px ${alpha('#000', 0.08)}`,
                  '&:hover': {
                    transform: tier.popular ? 'scale(1.08)' : 'scale(1.05)',
                    boxShadow: (theme) =>
                      tier.popular
                        ? `0 30px 80px ${alpha(theme.palette.primary.main, 0.3)}`
                        : `0 20px 60px ${alpha('#000', 0.15)}`,
                  },
                }}
              >
                {tier.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Chip
                      icon={<StarIcon sx={{ fill: 'white !important' }} />}
                      label="MOST POPULAR"
                      sx={{
                        background: tier.gradient,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        px: 3,
                        height: 36,
                        boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                        '& .MuiChip-icon': {
                          color: 'white',
                        },
                      }}
                    />
                  </Box>
                )}

                <CardContent sx={{ p: { xs: 5, md: 5 }, pt: tier.popular ? 9 : 5 }}>
                  {/* Tier Header */}
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      component="h2"
                      sx={{
                        fontWeight: 800,
                        mb: 1.5,
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        background: tier.gradient,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {tier.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3, 
                        minHeight: 50,
                        px: 2,
                        lineHeight: 1.6,
                      }}
                    >
                      {tier.description}
                    </Typography>

                    <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={0.5} sx={{ mb: 0.5 }}>
                      <Typography
                        variant="h6"
                        component="span"
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                        }}
                      >
                        $
                      </Typography>
                      <Typography
                        variant="h2"
                        component="span"
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: '3.5rem', md: '4.5rem' },
                          background: tier.gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          lineHeight: 1,
                        }}
                      >
                        {tier.price}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {tier.period}
                    </Typography>
                  </Box>

                  {/* CTA Button */}
                  <Button
                    fullWidth
                    variant={tier.popular ? 'contained' : 'outlined'}
                    size="large"
                    onClick={() => handleGetStarted(tier.name.toLowerCase())}
                    disabled={tier.popular && (isCreatingOrder || isVerifyingPayment)}
                    sx={{
                      mb: 4,
                      py: 2,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      textTransform: 'none',
                      letterSpacing: '0.5px',
                      boxShadow: tier.popular ? `0 6px 20px ${alpha('#000', 0.25)}` : 'none',
                      background: tier.popular ? tier.gradient : 'transparent',
                      border: tier.popular ? 'none' : 2,
                      borderColor: 'primary.main',
                      color: tier.popular ? 'white' : 'primary.main',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: tier.popular
                          ? `0 8px 30px ${alpha('#000', 0.35)}`
                          : `0 6px 20px ${alpha('#000', 0.2)}`,
                        background: tier.popular ? tier.gradient : (theme) => alpha(theme.palette.primary.main, 0.08),
                        borderWidth: tier.popular ? 0 : 2,
                      },
                      '&.Mui-disabled': {
                        opacity: 0.7,
                      },
                    }}
                  >
                    {tier.popular && (isCreatingOrder || isVerifyingPayment) ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                        <span>{isCreatingOrder ? 'Processing...' : 'Verifying...'}</span>
                      </Stack>
                    ) : (
                      tier.buttonText
                    )}
                  </Button>

                  <Divider sx={{ mb: 4 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {tier.name === 'Free' ? '12 Features Included' : '14+ Premium Features'}
                    </Typography>
                  </Divider>

                  {/* Features List */}
                  <Stack spacing={2.5}>
                    {tier.features.map((feature, featureIndex) => (
                      <Box
                        key={featureIndex}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          opacity: feature.included ? 1 : 0.35,
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: feature.included ? 1 : 0.5,
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 28, mt: 0.25 }}>
                          {feature.icon || (
                            <CheckCircleIcon
                              sx={{
                                fontSize: '1.4rem',
                                color: feature.included 
                                  ? tier.popular 
                                    ? 'primary.main' 
                                    : 'success.main' 
                                  : 'text.disabled',
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: feature.included ? 'text.primary' : 'text.disabled',
                            fontWeight: feature.highlight ? 700 : 500,
                            fontSize: '1rem',
                            lineHeight: 1.5,
                            textDecoration: !feature.included ? 'line-through' : 'none',
                          }}
                        >
                          {feature.text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ/Contact Section */}
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 4, md: 7 },
            borderRadius: 5,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
                theme.palette.secondary.main,
                0.08
              )} 100%)`,
            border: 2,
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: (theme) => 
                `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <Stack spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: (theme) => 
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              Have Questions?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 500,
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.7,
              }}
            >
              Our team is here to help you find the perfect plan and answer any questions about features, pricing, or implementation.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(ROUTES.CONTACTUS)}
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.75,
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  background: (theme) => 
                    `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: (theme) => `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                  },
                }}
              >
                Contact Support
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
