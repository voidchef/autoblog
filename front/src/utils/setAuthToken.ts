import axios from 'axios';

const setAuthToken = (token: string) => {
	console.log('setAuthToken', token);
	if (token) {
		axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
	} else {
		delete axios.defaults.headers.common['authorization'];
	}
};

export default setAuthToken;
