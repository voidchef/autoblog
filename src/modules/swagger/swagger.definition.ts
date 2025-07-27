import config from '../../config/config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Autoblog',
    version: '1.0.0',
    description: 'AI generated blogs',
    license: {
      name: 'MIT',
      url: 'https://github.com/voidchef/autoblog.git',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development Server',
    },
  ],
};

export default swaggerDefinition;
