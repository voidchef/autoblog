import * as React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
} from '@mui/material';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    let feedback: string[] = [];

    if (password.length === 0) {
      return { score: 0, strength: '', color: 'transparent', feedback: [] };
    }

    // Length check
    if (password.length >= 8) {
      score += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    // Lowercase letter
    if (/[a-z]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One lowercase letter');
    }

    // Uppercase letter
    if (/[A-Z]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One uppercase letter');
    }

    // Number
    if (/\d/.test(password)) {
      score += 25;
    } else {
      feedback.push('One number');
    }

    // Special character (bonus)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 10;
    }

    let strength = '';
    let color = '';

    if (score < 25) {
      strength = 'Very Weak';
      color = 'error.dark';
    } else if (score < 50) {
      strength = 'Weak';
      color = 'error.main';
    } else if (score < 75) {
      strength = 'Fair';
      color = 'warning.main';
    } else if (score < 100) {
      strength = 'Good';
      color = 'info.main';
    } else {
      strength = 'Strong';
      color = 'success.main';
    }

    return { score: Math.min(score, 100), strength, color, feedback };
  };

  const { score, strength, color, feedback } = getPasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box display="flex" alignItems="center" gap={1}>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            flexGrow: 1,
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
              borderRadius: 4,
            },
          }}
        />
        <Typography variant="caption" sx={{ color, fontWeight: 'medium', minWidth: 60 }}>
          {strength}
        </Typography>
      </Box>
      {feedback.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Missing: {feedback.join(', ')}
        </Typography>
      )}
    </Box>
  );
};

export default PasswordStrength;
