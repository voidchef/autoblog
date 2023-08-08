import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Button, MenuItem, Typography } from '@mui/material';

export default function ContactUs() {
	return (
		<Box>
			<Box
				display={'flex'}
				flexDirection={'column'}
				justifyContent={'space-between'}
				sx={{ gap: { xs: 2, sm: 5 } }}
			>
				<NavBar />
			</Box>
			<Box sx={{ my: 4 }} />
			<Box
				display={'flex'}
				flexDirection={'column'}
				justifyContent={'space-between'}
				sx={{ marginX: { xs: '1rem', sm: '30rem' } }}
			>
				<Box
					textAlign={'center'}
					display={'flex'}
					flexDirection={'column'}
					justifyContent={'space-between'}
					sx={{ gap: { xs: 1, sm: 2 } }}
				>
					<Typography component={'div'} fontSize={'3rem'}>
						About Us
					</Typography>
					<Typography
						component={'div'}
						fontSize={{ sx: '1rem', sm: '1.3rem' }}
						textAlign={'left'}
					>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam malesuada
						volutpat nisl, et porta risus dictum eget. Ut scelerisque varius maximus.
						Suspendisse sit amet auctor ante, eu dapibus arcu. Nunc sit amet odio sed
						dui bibendum aliquam. In vitae bibendum velit, vitae hendrerit turpis. Donec
						scelerisque vehicula orci, vitae auctor elit interdum quis. Donec a tortor
						maximus, pellentesque felis in, tristique felis. Nunc at hendrerit turpis.
					</Typography>
					<Typography
						component={'div'}
						fontSize={{ sx: '1rem', sm: '1.3rem' }}
						textAlign={'left'}
					>
						Nunc euismod magna id nibh viverra tristique. Proin finibus euismod
						porttitor. In consectetur nisi dui, at fermentum justo vehicula ut. Praesent
						malesuada, massa vel mattis pellentesque, libero mauris commodo dolor, sed
						accumsan orci justo vitae tellus. Phasellus ullamcorper, erat sit amet
						malesuada consequat, orci dui efficitur leo, quis semper lorem velit ut
						elit.
					</Typography>
				</Box>
				<Box sx={{ my: 2 }} />
			</Box>
			<Box sx={{ my: 6 }} />
			<Footer />
		</Box>
	);
}
