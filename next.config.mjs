/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Add a rule to handle .json files for ABIs
        config.module.rules.push({
            test: /\.json$/,
            use: [
                {
                    loader: 'json-loader',
                    options: {
                        // You might need to adjust this based on how your ABIs are structured
                        // For example, if they are in a specific directory
                        // For now, assuming they are directly importable
                    },
                },
            ],
            type: 'javascript/auto', // This is important for Webpack 5 to handle JSON files correctly
        });

        // Polyfill 'fs' module for client-side if necessary by formidable
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false, // formidable uses path
                stream: false, // formidable uses stream
                constants: false, // formidable uses constants
            };
        }

        // Add externals for utf-8-validate and bufferutil
        config.externals.push({
            "utf-8-validate": "commonjs utf-8-validate",
            bufferutil: "commonjs bufferutil",
        });

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
