/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // Fix for onnxruntime-node being bundled in client
        config.resolve.alias = {
            ...config.resolve.alias,
            "onnxruntime-node$": false,
        };
        return config;
    },
};

export default nextConfig;
