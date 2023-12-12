import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { IconButton, Typography } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
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
    <Box display="flex" flexDirection="column" alignItems="center" width={'100%'}>
      <Typography
        fontSize={{ xs: '1.75rem', sm: '2.25rem' }}
        component="div"
        sx={{ flexGrow: 1, textAlign: 'center', marginBottom: { xs: '1rem', sm: '2rem' } }}
        color={'black'}
      >
        Choose a Category
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
        width={'100%'}
      >
        <IconButton onClick={() => handlePageChange('prev')} sx={{ margin: 1 }} disabled={currentPage === 0}>
          <NavigateBeforeIcon />
        </IconButton>
        <Box>
          {categories.map((category: ICategory, index: number) => (
            <Box
              key={`card-${index}`}
              sx={{
                width: '100%',
                height: '100%',
                display: currentPage === index ? 'block' : 'none',
              }}
            >
              <Slide direction={slideDirection} in={currentPage === index}>
                <Stack
                  spacing={5}
                  direction="row"
                  alignContent="center"
                  justifyContent="center"
                  sx={{ width: '100%', height: '100%' }}
                >
                  {categories
                    .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
                    .map((category: ICategory, index: number) => (
                      <Card
                        key={`card-${index}`}
                        categoryId={category._id}
                        categoryIcon={category.categoryPicUrl}
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
          sx={{
            margin: 1,
          }}
          disabled={currentPage >= Math.ceil((categories.length || 0) / cardsPerPage) - 1}
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Carousel;
