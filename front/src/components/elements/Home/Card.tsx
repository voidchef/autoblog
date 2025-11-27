import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import SpaceShip from '../../assets/spaceShip.svg?react';
import SvgIcon from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import { useNavigate } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';

interface Props {
  categoryId?: string;
  categoryName: string;
  categoryDescription: string;
}

export default function CategoryCard({ categoryId, categoryName, categoryDescription }: Props) {
  const navigate = useNavigate();
  
  const handleClick = (categoryName: string) => {
    navigate(`/category/${categoryName}`);
  };

  return (
    <Card
      className="animate-fade-in-up"
      sx={{
        width: { xs: '280px', sm: '200px' },
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.customColors.gradients.cardDark
            : theme.palette.customColors.gradients.cardLight,
        border: '2px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.customColors.borders.primaryDark : theme.palette.customColors.borders.primaryLight),
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => theme.palette.customColors.gradients.iconLight,
          opacity: 0,
          transition: 'opacity 0.4s ease',
          borderRadius: 'inherit',
        },
        '&:hover::before': {
          opacity: 1,
        },
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: (theme) => `0 20px 60px ${theme.palette.customColors.shadows.primary}`,
          '& .category-icon': {
            transform: 'scale(1.15) rotate(10deg)',
            background: (theme) => theme.palette.customColors.gradients.iconDark,
          },
          '& .arrow-icon': {
            opacity: 1,
            transform: 'translateX(0) rotate(-45deg)',
          },
        },
      }}
    >
      <CardActionArea onClick={() => handleClick(categoryName.toLocaleLowerCase())} sx={{ height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            gap: 2,
            minHeight: '220px',
            position: 'relative',
          }}
        >
          <Box
            className="category-icon"
            sx={{
              width: 90,
              height: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: (theme) => theme.palette.customColors.gradients.iconLight,
              border: '3px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.customColors.borders.primaryDarkHover : theme.palette.customColors.borders.primaryLightHover),
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              boxShadow: (theme) => `0 8px 24px ${theme.palette.customColors.shadows.primaryLight}`,
              overflow: 'hidden',
            }}
          >
            <SvgIcon
              component={SpaceShip}
              inheritViewBox
              sx={{
                fontSize: '3rem',
                color: 'primary.main',
                filter: (theme) => `drop-shadow(0 2px 8px ${theme.palette.customColors.shadows.primary})`,
                transition: 'all 0.3s ease',
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1rem' },
                mb: 1,
                color: 'text.primary',
              }}
            >
              {categoryName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {categoryDescription}
            </Typography>
          </Box>

          <ArrowForward
            className="arrow-icon"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              fontSize: '1.2rem',
              color: 'primary.main',
              opacity: 0,
              transform: 'translateX(-10px)',
              transition: 'all 0.3s ease',
            }}
          />
        </Box>
      </CardActionArea>
    </Card>
  );
}
