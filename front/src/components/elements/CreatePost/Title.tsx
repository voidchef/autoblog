import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Headline = () => {
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
        Create Post
      </Typography>
    </Box>
  );
};

export default Headline;
