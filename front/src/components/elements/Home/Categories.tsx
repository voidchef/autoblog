import { Box, Grid, IconButton, SvgIcon, Typography } from '@mui/material';
import * as React from 'react';
import SpaceShip from '../../assets/spaceShip.svg?react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAppSelector } from '../../../utils/reduxHooks';
import { ICategory } from '../../../reducers/appSettings';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const categories = useAppSelector((state) => state.appSettings.categories);
  const [visibleCardIndex, setVisibleCardIndex] = React.useState(0);
  const [cardsToDisplay, setCardsToDisplay] = React.useState(4);

  const navigate = useNavigate();

  const handleLeftArrowClick = () => {
    setVisibleCardIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleRightArrowClick = () => {
    setVisibleCardIndex((prevIndex) => Math.min(categories.length - 1, prevIndex + 1));
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setVisibleCardIndex(0);
        setCardsToDisplay(1);
      } else {
        setVisibleCardIndex(0);
        setCardsToDisplay(4);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (categoryName: string) => {
    navigate(`/category/${categoryName}`);
  };

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" width={'100%'}>
        <Typography
          fontSize={{ xs: '1.75rem', sm: '2.25rem' }}
          component="div"
          sx={{ flexGrow: 1, textAlign: 'center', marginBottom: '3rem' }}
          color={'black'}
        >
          Choose a Category
        </Typography>
        <Box style={{ overflowX: 'auto' }} width={'100%'}>
          <Grid container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} wrap="nowrap">
            <IconButton aria-label="Previous" onClick={handleLeftArrowClick} disabled={visibleCardIndex === 0}>
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            {categories.slice(visibleCardIndex, visibleCardIndex + cardsToDisplay).map((category: ICategory) => (
              <Grid
                key={category._id}
                item
                xs={8.4}
                sm={6}
                md={4}
                lg={3}
                sx={{ display: 'flex', justifyContent: 'center' }}
                onClick={() => handleClick(category.categoryName.toLocaleLowerCase())}
              >
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                  padding={'2rem'}
                  sx={{ gap: { xs: 0.2, sm: 1 }, border: '2px solid #555FAC' }}
                  width={'18.5rem'}
                  height={{ xs: '12rem' }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <SvgIcon
                      /* component={category.categoryPicUrl} */ component={SpaceShip}
                      inheritViewBox
                      fontSize="large"
                    />
                  </Box>
                  <Typography fontSize={{ xs: '1rem', sm: '1.5rem' }} fontWeight={450} color={'black'} textAlign={'center'}>
                    {category.categoryName}
                  </Typography>
                  <Typography textAlign={'center'}>{category.categoryDescription}</Typography>
                </Box>
              </Grid>
            ))}
            <IconButton
              aria-label="Next"
              onClick={handleRightArrowClick}
              disabled={visibleCardIndex + cardsToDisplay - 1 >= categories.length - 1}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default Categories;
