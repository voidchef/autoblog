import Lottie from 'lottie-react';
import loadingAnimation from './loadingAnimation.json';
import React from 'react';

const Loading = () => <Lottie animationData={loadingAnimation} loop={true} />;

export default Loading;
