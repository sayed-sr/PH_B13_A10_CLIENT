/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Allows Google profile pictures to render safely
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Allows your default card placeholders to load
      },
    ],
  },
};

export default nextConfig;