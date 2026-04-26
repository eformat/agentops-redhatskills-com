import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  pageExtensions: ['tsx', 'mdx'],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
