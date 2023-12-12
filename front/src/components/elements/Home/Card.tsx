import * as React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import SpaceShip from '../../assets/spaceShip.svg?react';
import SvgIcon from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CardActionArea from '@mui/material/CardActionArea';
import { useNavigate } from 'react-router-dom';

interface Props {
  categoryId: string;
  categoryIcon: any;
  categoryName: string;
  categoryDescription: string;
}

export default function CategoryCard({ categoryId, categoryIcon, categoryName, categoryDescription }: Props) {
  const navigate = useNavigate();
  const handleClick = (categoryName: string) => {
    navigate(`/category/${categoryName}`);
  };
  return (
    <Card variant="outlined" sx={{ width: '200px', border: '2px solid #555FAC', borderRadius: 2 }}>
      <CardActionArea>
        <Grid
          key={categoryId}
          item
          sx={{ display: 'flex', justifyContent: 'center' }}
          onClick={() => handleClick(categoryName.toLocaleLowerCase())}
        >
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            paddingX={1}
            paddingY={4}
            sx={{ gap: { xs: 1, sm: 1.5 } }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <SvgIcon /* component={category.categoryPicUrl} */ component={SpaceShip} inheritViewBox fontSize="large" />
            </Box>
            <Typography fontSize={{ xs: '1rem', sm: '1.5rem' }} fontWeight={450} color={'black'} textAlign={'center'}>
              {categoryName}
            </Typography>
            <Typography textAlign={'center'}>{categoryDescription}</Typography>
          </Box>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
