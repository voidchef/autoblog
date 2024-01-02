import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Posts from '../elements/Category/Posts';
import Footer from '../elements/Common/Footer';
import Title from '../elements/Category/CategoryTitle';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../utils/reduxHooks';
import { ROUTES } from '../../utils/routing/routes';
import { ICategory } from '../../reducers/appSettings';

export default function Category() {
  const { categoryName } = useParams();

  const navigate = useNavigate();

  const categories = useAppSelector((state) => state.appSettings.categories);
  const category = categories.find(
    (cat: ICategory) => cat.categoryName.toLocaleLowerCase() === categoryName?.toLocaleLowerCase(),
  );

  React.useEffect(() => {
    if (!category) {
      navigate(ROUTES.ROOT);
    }
  }, []);

  return (
    <Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ gap: { xs: 2, sm: 5 } }}
        bgcolor={'#E9EAF4'}
      >
        <NavBar />
        {category && <Title title={category.categoryName} />}
      </Box>
      <Box sx={{ my: 4 }} />
      {category && <Posts category={category.categoryName} />}
      <Footer />
    </Box>
  );
}
