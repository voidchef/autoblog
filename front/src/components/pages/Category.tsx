import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Posts from '../elements/Category/Posts';
import Footer from '../elements/Common/Footer';
import Title from '../elements/Category/Title';
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
        sx={{
          gap: { xs: 2, sm: 5 },
        }}
      >
        <NavBar />
        {category && <Title category={category} />}
      </Box>
      {category && <Posts category={category.categoryName.toLocaleLowerCase()} />}
      <Footer />
    </Box>
  );
}
