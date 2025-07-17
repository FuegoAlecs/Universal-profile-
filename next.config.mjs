/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Polyfill 'fs' module for client-side if needed by formidable
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                path: false, // formidable uses path
                stream: false, // formidable uses stream
                constants: false, // formidable uses constants
            };
        }
        return config;
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
