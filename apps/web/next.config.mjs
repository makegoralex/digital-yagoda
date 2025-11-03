import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV !== 'production';

const withPWAFn = withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  sw: 'service-worker.js'
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@digital-yagoda/ui', '@digital-yagoda/sdk'],
  experimental: {
    optimizePackageImports: ['@digital-yagoda/ui']
  }
};

export default withPWAFn(nextConfig);
