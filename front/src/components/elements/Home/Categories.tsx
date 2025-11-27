import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { IconButton, Typography, Chip } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Category as CategoryIcon } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Card from './Card';
import { useAppSelector } from '../../../utils/reduxHooks';
import { ICategory } from '../../../reducers/appSettings';

function Carousel() {
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left' | undefined>('left');
  const [cardsPerPage, setCardsPerPage] = useState(getInitialCardsPerPage());

  const categories = useAppSelector((state) => state.appSettings.categories);

  function getInitialCardsPerPage() {
    return window.innerWidth < 600 ? 1 : 5;
  }

  useEffect(() => {
    const handleResize = () => {
      setCardsPerPage(getInitialCardsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePageChange = (direction: string) => {
    const newDirection = direction === 'next' ? 'left' : 'right';
    setSlideDirection(newDirection);
    setCurrentPage((prevPage) => (direction === 'next' ? prevPage + 1 : prevPage - 1));
  };

  return (
    <Box
      sx={{
        py: { xs: 0, md: 6 },
        px: 2,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Chip
          icon={<CategoryIcon sx={{ color: 'white', fontSize: { xs: '1rem', md: '1.2rem' } }} />}
          label="Explore Topics"
          sx={{ 
            mb: 2, 
            fontWeight: 700, 
            px: { xs: 2, md: 2.5 },
            py: { xs: 2, md: 2.5 },
            fontSize: { xs: '0.85rem', md: '0.95rem' },
            background: (theme) => theme.palette.customColors.gradients.primary,
            color: 'white',
            border: 'none',
            boxShadow: (theme) => `0 4px 16px ${theme.palette.customColors.shadows.primary}`,
            '&:hover': {
              boxShadow: (theme) => `0 6px 24px ${theme.palette.customColors.shadows.primaryHeavy}`,
            },
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
            fontWeight: 900,
            mb: 2,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.customColors.gradients.textDarkAlt
                : theme.palette.customColors.gradients.textLightAlt,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Choose a Category
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', md: '1rem' }, px: { xs: 2, md: 0 } }}>
          Browse through our diverse collection of topics
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1, sm: 2 },
          position: 'relative',
          py: 4,
          overflow: 'visible',
        }}
      >
        <IconButton
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 0}
          sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? `${theme.palette.customColors.accent.blue.main}26` : 'background.paper',
            boxShadow: 2,
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : theme.palette.customColors.borders.primaryLightHover,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'scale(1.1)',
            },
            '&:disabled': {
              bgcolor: 'action.disabledBackground',
              opacity: 0.5,
            },
            transition: 'all 0.3s ease',
            // Mobile responsive sizing - perfectly circular
            width: { xs: '40px', sm: '48px' },
            height: { xs: '40px', sm: '48px' },
            minWidth: { xs: '40px', sm: '48px' },
            minHeight: { xs: '40px', sm: '48px' },
            padding: 0,
            borderRadius: '50%',
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <NavigateBeforeIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
        </IconButton>

        <Box sx={{ flexGrow: 1, maxWidth: { xs: 'calc(100vw - 120px)', sm: '1200px' }, overflow: 'visible' }}>
          {categories.map((category: ICategory, index: number) => (
            <Box
              key={`card-${index}`}
              sx={{
                width: '100%',
                display: currentPage === index ? 'block' : 'none',
                overflow: 'visible',
              }}
            >
              <Slide direction={slideDirection} in={currentPage === index}>
                <Stack
                  spacing={{ xs: 2, sm: 3 }}
                  direction="row"
                  alignContent="center"
                  justifyContent="center"
                  sx={{
                    width: '100%',
                    px: { xs: 0, sm: 2 },
                    overflow: 'visible',
                  }}
                >
                  {categories
                    .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
                    .map((category: ICategory, index: number) => (
                      <Card
                        key={`card-${index}`}
                        categoryId={category._id}
                        categoryName={category.categoryName}
                        categoryDescription={category.categoryDescription}
                      />
                    ))}
                </Stack>
              </Slide>
            </Box>
          ))}
        </Box>

        <IconButton
          onClick={() => handlePageChange('next')}
          disabled={currentPage >= Math.ceil((categories.length || 0) / cardsPerPage) - 1}
          sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? `${theme.palette.customColors.accent.blue.main}26` : 'background.paper',
            boxShadow: 2,
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : theme.palette.customColors.borders.primaryLightHover,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'scale(1.1)',
            },
            '&:disabled': {
              bgcolor: 'action.disabledBackground',
              opacity: 0.5,
            },
            transition: 'all 0.3s ease',
            // Mobile responsive sizing - perfectly circular
            width: { xs: '40px', sm: '48px' },
            height: { xs: '40px', sm: '48px' },
            minWidth: { xs: '40px', sm: '48px' },
            minHeight: { xs: '40px', sm: '48px' },
            padding: 0,
            borderRadius: '50%',
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <NavigateNextIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Carousel;
