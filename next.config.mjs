/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Add real hosts here if you switch the data layer to Jikan (cdn.myanimelist.net)
    remotePatterns: [{ protocol: "https", hostname: "cdn.myanimelist.net" }],
  },
};
export default nextConfig;