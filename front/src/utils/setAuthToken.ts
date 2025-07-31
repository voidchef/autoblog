import axios from 'axios';

const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['authorization'];
  }
};

export default setAuthToken;
