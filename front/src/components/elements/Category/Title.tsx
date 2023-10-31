import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ICategory } from '../../../reducers/appSettings';

interface TitleProps {
  category: ICategory;
}

const Headline = ({ category }: TitleProps) => {
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      textAlign={'center'}
    >
      <Typography
        variant="h2"
        component="div"
        fontSize={{ xs: '2rem', sm: '3rem' }}
        fontWeight={500}
        sx={{ marginBottom: '1rem' }}
        color={'primary'}
      >
        {category.categoryName}
      </Typography>
      <Typography component="div" sx={{ marginBottom: '1rem' }}>
        {category.categoryDescription}
      </Typography>
      <Typography fontSize={{ xs: '1rem', sm: '1.5rem' }} component="div" color={'#6D6E76'} sx={{ marginBottom: '1rem' }}>
        Blog {'>'} {category.categoryName}
      </Typography>
    </Box>
  );
};

export default Headline;
