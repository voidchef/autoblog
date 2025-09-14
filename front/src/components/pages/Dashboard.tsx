import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Fab, MenuItem, Select, Typography } from '@mui/material';
import BlogsTable from '../elements/Dashboard/BlogsTable';
import AddIcon from '@mui/icons-material/Add';
import { ROUTES } from '../../utils/routing/routes';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/reduxHooks';
import { clearBlog } from '../../reducers/blog';
import { useGetBlogViewsQuery } from '../../services/blogApi';
import ViewsGraph from '../elements/Dashboard/ViewsGraph';
import DraftsTable from '../elements/Dashboard/DraftsTable';

const months = Array.from({ length: 12 }, (_, index) => ({
  value: index,
  label: new Date(2000, index, 1).toLocaleString('default', { month: 'long' }),
}));

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const [monthDays, setMonthDays] = React.useState<Array<Date>>([]);
  const [selectedBlog, setSelectedBlog] = React.useState<string>('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Prepare parameters for RTK Query
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  let lastDay: number;
  switch (selectedMonth) {
    case 1:
      lastDay = currentYear % 4 === 0 ? 29 : 28;
      break;
    case 3:
    case 5:
    case 8:
    case 10:
      lastDay = 30;
      break;
    default:
      lastDay = 31;
  }
  
  const startDate = `${currentYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  
  // Use RTK Query for blog views
  const { data: blogViews = [], isLoading: viewsLoading } = useGetBlogViewsQuery(
    { startDate, endDate, slug: selectedBlog },
    { skip: !selectedBlog || selectedBlog === '' }
  );

  React.useEffect(() => {
    if (selectedBlog) {
      const days = Array.from({ length: lastDay }, (_, index) => new Date(currentYear, selectedMonth, index + 1));
      setMonthDays(days);
    }
  }, [selectedMonth, selectedBlog, lastDay, currentYear]);

  function handleSelectBlog(slug: string) {
    setSelectedBlog(slug);
  }

  function handleClick() {
    dispatch(clearBlog());
    navigate(ROUTES.CREATEPOST);
  }

  return (
    <Box>
      <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} sx={{ gap: { xs: 2, sm: 5 } }}>
        <NavBar />
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        <Box component={'div'} width={'100%'} height={{ sm: '35rem', xs: '15rem' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            sx={{ paddingRight: { sm: '3rem' } }}
          >
            <Typography component="h1" fontSize="1.3rem">
              Total Visits
            </Typography>
            <Select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{ minWidth: '10rem' }}
              size="small"
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          {blogViews.length === monthDays.length && <ViewsGraph blogViews={blogViews} monthDays={monthDays} />}
        </Box>
        <Box sx={{ my: { sm: 3, xs: 1 } }} />
        <BlogsTable handleSelectBlog={handleSelectBlog} />
        <Box sx={{ my: { sm: 3, xs: 1 } }} />
        <DraftsTable />
      </Box>
      <Box sx={{ my: 6 }} />
      <Box sx={{ '& > :not(style)': { m: 1 }, position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Fab color="primary" aria-label="add" onClick={handleClick}>
          <AddIcon />
        </Fab>
      </Box>
      <Footer />
    </Box>
  );
}
