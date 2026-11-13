/** @type {import('next').NextConfig} */
// The dashboard is exported as static files and served by Cloudflare Pages.
// Redirects and the rewrites for pages with an id in the address live in
// public/_redirects; sign-in checks run in the browser (components/Guards).
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
