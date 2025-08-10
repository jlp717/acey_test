/** @type {import('next').NextConfig} */
if (!process.env.HF_API_KEY) {
  console.warn('Advertencia: HF_API_KEY no está definida. El agente de voz no funcionará.')
}

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
