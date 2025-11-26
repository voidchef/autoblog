module.exports = {
  apps: [
    {
      name: 'app',
      script: 'dist/index.js',
      node_args: '--no-warnings --import=extensionless/register',
      instances: 1,
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
