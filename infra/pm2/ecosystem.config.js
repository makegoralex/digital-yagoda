module.exports = {
  apps: [
    {
      name: 'pos-api',
      script: 'apps/api/dist/server.js',
      cwd: '/home/project',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'pos-web',
      script: 'pnpm',
      cwd: '/home/project',
      args: '--dir apps/web start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
